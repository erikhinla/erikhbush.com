import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { Marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://erikhbush.com';
const BLOG = '/promptingcircumstance';
const POSTS_DIR = join(ROOT, 'promptingcircumstance', 'posts');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const ALLOWED_KEYS = new Set(['title', 'date', 'description', 'tags', 'cover', 'draft']);
const SKIP_ROOT = new Set([
  'node_modules',
  'dist',
  'scripts',
  'promptingcircumstance',
  'package.json',
  'package-lock.json',
  'vercel.json'
]);

const errors = [];

function error(message) {
  errors.push(message);
}

function fail(message) {
  console.error(`Build failed.\n${message}`);
  process.exit(1);
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

function jsonScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function cdata(value) {
  return `<![CDATA[${String(value).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function draftsVisible() {
  if (process.env.INCLUDE_DRAFTS === '1') return true;
  return process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development';
}

function isoDate(value, file) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    const check = new Date(Date.UTC(y, m - 1, d));
    if (check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d) return value;
  }
  error(`${file}: date must be YYYY-MM-DD`);
  return null;
}

function asTags(value, file) {
  if (value == null) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.map((tag, index) => {
    if (typeof tag !== 'string' || !tag.trim()) {
      error(`${file}: tags[${index}] must be a non-empty string`);
      return '';
    }
    return tag.trim();
  }).filter(Boolean);
}

function asDraft(value, file) {
  if (value == null) return false;
  if (value === true || value === false) return value;
  if (value === 'true' || value === 'false') return value === 'true';
  error(`${file}: draft must be true or false`);
  return false;
}

function plain(value, file, key) {
  if (typeof value !== 'string' || !value.trim()) {
    error(`${file}: ${key} is required and must be plain text`);
    return '';
  }
  return value.trim().replace(/\s+/g, ' ');
}

function imageSize(filePath) {
  let buf;
  try {
    buf = readFileSync(filePath);
  } catch {
    return null;
  }
  if (buf.length > 24 && buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), type: 'image/png' };
  }
  if (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a') {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8), type: 'image/gif' };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i += 1; continue; }
      while (buf[i] === 0xff) i += 1;
      const marker = buf[i];
      i += 1;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (marker >= 0xd0 && marker <= 0xd7) continue;
      if (i + 1 >= buf.length) break;
      const length = buf.readUInt16BE(i);
      if (marker >= 0xc0 && marker <= 0xc2 && i + 7 < buf.length) {
        return { height: buf.readUInt16BE(i + 3), width: buf.readUInt16BE(i + 5), type: 'image/jpeg' };
      }
      i += length;
    }
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8X' && buf.length >= 30) {
      return {
        width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
        height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
        type: 'image/webp'
      };
    }
    if (chunk === 'VP8L' && buf.length >= 25) {
      const b0 = buf[21];
      const b1 = buf[22];
      const b2 = buf[23];
      const b3 = buf[24];
      return {
        width: 1 + (((b1 & 0x3f) << 8) | b0),
        height: 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
        type: 'image/webp'
      };
    }
  }
  return null;
}

function localImage(publicPath) {
  const path = decodeURIComponent(publicPath);
  if (path.startsWith('/assets/')) return join(ROOT, path.slice(1));
  const prefix = `${BLOG}/images/`;
  if (path.startsWith(prefix)) return join(ROOT, 'promptingcircumstance', path.slice(BLOG.length + 1));
  return null;
}

function normalizeImage(href, file) {
  const value = String(href || '').trim();
  if (!value) {
    error(`${file}: an image is missing its path`);
    return '';
  }
  if (value.includes('..')) {
    error(`${file}: image path must not contain "..": ${value}`);
    return '';
  }
  const lower = value.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    error(`${file}: image URL scheme is not allowed (${value})`);
    return '';
  }
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/assets/')) {
    const local = join(ROOT, decodeURIComponent(value.slice(1)));
    if (!existsSync(local) || !statSync(local).isFile()) error(`${file}: missing ${value}`);
    return value;
  }
  let rel = '';
  if (value.startsWith(`${BLOG}/images/`)) rel = value.slice(BLOG.length + 1);
  else if (value.startsWith('images/')) rel = value;
  else {
    error(`${file}: image "${value}" must be images/<file>, ${BLOG}/images/<file>, /assets/<file>, or an https URL`);
    return '';
  }
  const local = join(ROOT, 'promptingcircumstance', rel);
  if (!existsSync(local) || !statSync(local).isFile()) error(`${file}: missing promptingcircumstance/${rel}`);
  const url = `${BLOG}/${rel.split('/').map((part) => encodeURIComponent(part)).join('/')}`;
  return url;
}

function shareImage(publicPath, alt) {
  if (!publicPath) {
    return { url: `${SITE}/assets/og.jpg`, width: 1200, height: 630, type: 'image/jpeg', alt };
  }
  const url = /^https?:\/\//i.test(publicPath) ? publicPath : `${SITE}${publicPath}`;
  const local = /^https?:\/\//i.test(publicPath) ? null : localImage(publicPath);
  const size = local ? imageSize(local) : null;
  return {
    url,
    width: size?.width || 0,
    height: size?.height || 0,
    type: size?.type || '',
    alt
  };
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function loadPosts() {
  if (!existsSync(POSTS_DIR)) fail('Missing promptingcircumstance/posts. Add Markdown files there.');
  const posts = [];
  for (const name of readdirSync(POSTS_DIR)) {
    if (name.startsWith('.')) continue;
    const rel = `promptingcircumstance/posts/${name}`;
    if (!name.endsWith('.md')) {
      error(`${rel}: only Markdown posts belong in this folder`);
      continue;
    }
    const slug = name.slice(0, -3);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      error(`${rel}: filename must be a lowercase slug such as how-to-ask.md`);
      continue;
    }
    let raw = readFileSync(join(POSTS_DIR, name), 'utf8').replace(/^\uFEFF/, '');
    if (!raw.startsWith('---')) {
      error(`${rel}: file must start with --- front matter`);
      continue;
    }
    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      error(`${rel}: front matter could not be parsed (${err.message}). Quote title and description if they contain a colon.`);
      continue;
    }
    for (const key of Object.keys(parsed.data)) {
      if (!ALLOWED_KEYS.has(key)) error(`${rel}: unknown front matter key "${key}". Allowed: title, date, description, tags, cover, draft.`);
    }
    const title = plain(parsed.data.title, rel, 'title');
    const description = plain(parsed.data.description, rel, 'description');
    const date = isoDate(parsed.data.date, rel);
    const tags = asTags(parsed.data.tags, rel);
    const draft = asDraft(parsed.data.draft, rel);
    const body = parsed.content.trim();
    if (!body) error(`${rel}: the post body is empty`);
    let cover = '';
    if (parsed.data.cover != null && String(parsed.data.cover).trim()) {
      cover = normalizeImage(String(parsed.data.cover).trim(), rel);
    }
    posts.push({ slug, rel, title, description, date, tags, draft, body, cover });
  }
  return posts
    .filter((post) => post.date)
    .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : (a.date < b.date ? 1 : -1)));
}

function renderMarkdown(post) {
  const ids = new Map();
  const marked = new Marked();
  marked.use({
    renderer: {
      html() {
        return '';
      },
      heading(token) {
        const inner = this.parser.parseInline(token.tokens);
        const base = token.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
        const seen = ids.get(base) || 0;
        ids.set(base, seen + 1);
        const id = seen === 0 ? base : `${base}-${seen + 1}`;
        return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
      },
      link(token) {
        const inner = this.parser.parseInline(token.tokens);
        const href = normalizeLink(token.href, post.rel);
        const title = token.title ? ` title="${esc(token.title)}"` : '';
        return `<a href="${esc(href)}"${title}${externalAttrs(href)}>${inner}</a>`;
      },
      image(token) {
        const href = normalizeImage(token.href, post.rel);
        const title = token.title ? ` title="${esc(token.title)}"` : '';
        return `<img src="${esc(href)}" alt="${esc(token.text || '')}"${title} loading="lazy">`;
      }
    }
  });
  const html = marked.parse(post.body);
  if (typeof html !== 'string') {
    error(`${post.rel}: the Markdown parser returned a promise. Keep the build synchronous.`);
    return '';
  }
  return html.trim();
}

function normalizeLink(href, file) {
  const value = String(href || '').trim();
  if (!value) {
    error(`${file}: a link is missing its destination`);
    return '#';
  }
  const lower = value.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    error(`${file}: link scheme is not allowed (${value})`);
    return '#';
  }
  if (value.startsWith('#') || value.startsWith('/') || value.startsWith('mailto:') || /^https?:\/\//i.test(value)) return value;
  error(`${file}: relative link "${value}" is not allowed. Use a root path such as /story or a full https URL.`);
  return '#';
}

function externalAttrs(href) {
  if (!/^https?:\/\//i.test(href)) return '';
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    if (host === 'erikhbush.com') return '';
  } catch {
    return '';
  }
  return ' target="_blank" rel="noopener noreferrer"';
}

function tagList(tags) {
  if (!tags.length) return '';
  return `<ul class="tags">${tags.map((tag) => `<li>${esc(tag)}</li>`).join('')}</ul>`;
}

function coverFigure(post) {
  if (!post.cover) return '';
  const local = post.cover.startsWith('/') ? localImage(post.cover) : '';
  const size = local ? imageSize(local) : null;
  const dims = size ? ` width="${size.width}" height="${size.height}"` : '';
  return `<figure class="cover"><img src="${esc(post.cover)}" alt="${esc(post.title)}"${dims}></figure>`;
}

function layout({ title, description, canonicalPath, image, kind, published, tags, robots, main, jsonLd }) {
  const url = `${SITE}${canonicalPath}`;
  const article = kind === 'article' ? `
<meta property="article:published_time" content="${esc(published)}">
<meta property="article:author" content="Erik Bush">
${tags.map((tag) => `<meta property="article:tag" content="${esc(tag)}">`).join('\n')}` : '';
  const imageMeta = `
<meta property="og:image" content="${esc(image.url)}">
${image.width ? `<meta property="og:image:width" content="${image.width}">` : ''}
${image.height ? `<meta property="og:image:height" content="${image.height}">` : ''}
${image.type ? `<meta property="og:image:type" content="${esc(image.type)}">` : ''}
<meta property="og:image:alt" content="${esc(image.alt)}">
<meta name="twitter:image" content="${esc(image.url)}">
<meta name="twitter:image:alt" content="${esc(image.alt)}">`;
  const structured = jsonLd ? `\n<script type="application/ld+json">${jsonScript(jsonLd)}</script>` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0c0d0b">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="Erik Bush">
${robots ? `<meta name="robots" content="${esc(robots)}">` : ''}
<link rel="canonical" href="${esc(url)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&amp;family=Instrument+Sans:wght@500;600;700&amp;display=swap">
<link rel="stylesheet" href="${BLOG}/blog.css">
<link rel="alternate" type="application/rss+xml" title="Prompting Circumstance" href="${SITE}${BLOG}/rss.xml">
<meta property="og:site_name" content="Erik Bush">
<meta property="og:type" content="${kind === 'article' ? 'article' : 'website'}">
<meta property="og:title" content="${esc(kind === 'article' ? title.replace(/ · Prompting Circumstance$/, '') : 'Prompting Circumstance')}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:locale" content="en_US">
${imageMeta}
${article}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(kind === 'article' ? title.replace(/ · Prompting Circumstance$/, '') : 'Prompting Circumstance')}">
<meta name="twitter:description" content="${esc(description)}">${structured}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav">
<a href="/">‹ Fog Scan</a>
<nav aria-label="Blog">
<a href="/story">The story</a>
<a href="${BLOG}/rss.xml">RSS</a>
</nav>
</header>
${main}
<footer>
<span>Erik Bush</span>
<a href="/story">The story</a>
<a href="https://www.linkedin.com/in/erik-h-bush/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</footer>
</body>
</html>
`;
}

function renderIndex(visible, published, showDrafts) {
  const description = 'A blog on erikhbush.com. Newest posts first.';
  const items = visible.map((post) => `<li>
<article>
${post.draft ? '<p class="draft-pill">Draft</p>' : ''}
<time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time>
<h2><a href="${BLOG}/${esc(post.slug)}">${esc(post.title)}</a></h2>
<p>${esc(post.description)}</p>
${tagList(post.tags)}
</article>
</li>`).join('\n');
  const note = showDrafts && visible.some((post) => post.draft)
    ? '<p class="preview-note">Drafts show on this preview. They are left off the production site, the RSS feed, and the sitemap.</p>'
    : '';
  const list = visible.length
    ? `<ol class="post-list">${items}</ol>`
    : '<p class="empty">No posts yet.</p>';
  const main = `<main id="main">
<p class="kicker">Erik Bush</p>
<h1>Prompting Circumstance</h1>
<p class="lede">${esc(description)}</p>
${note}
${list}
</main>`;
  return layout({
    title: 'Prompting Circumstance · Erik Bush',
    description,
    canonicalPath: BLOG,
    image: shareImage('', 'Erik Bush'),
    kind: 'website',
    tags: [],
    main,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Prompting Circumstance',
      description,
      url: `${SITE}${BLOG}`,
      author: { '@type': 'Person', name: 'Erik Bush', url: `${SITE}/` },
      blogPost: published.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        datePublished: post.date,
        url: `${SITE}${BLOG}/${post.slug}`
      }))
    }
  });
}

function renderPost(post) {
  const html = post.html;
  const image = shareImage(post.cover, post.title);
  const main = `<main id="main">
<article>
<p class="kicker"><a href="${BLOG}">Prompting Circumstance</a></p>
<p class="meta"><time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time></p>
${post.draft ? '<p class="draft-pill">Draft</p>' : ''}
<h1>${esc(post.title)}</h1>
<p class="dek">${esc(post.description)}</p>
${tagList(post.tags)}
${coverFigure(post)}
<div class="prose">
${html}
</div>
<p class="end"><a href="${BLOG}">‹ All posts</a></p>
</article>
</main>`;
  return layout({
    title: `${post.title} · Prompting Circumstance`,
    description: post.description,
    canonicalPath: `${BLOG}/${post.slug}`,
    image,
    kind: 'article',
    published: `${post.date}T00:00:00Z`,
    tags: post.tags,
    robots: post.draft ? 'noindex' : '',
    main,
    jsonLd: post.draft ? null : {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: { '@type': 'Person', name: 'Erik Bush', url: `${SITE}/` },
      mainEntityOfPage: `${SITE}${BLOG}/${post.slug}`,
      image: image.url,
      keywords: post.tags.join(', ')
    }
  });
}

function renderRss(published) {
  const items = published.map((post) => {
    const link = `${SITE}${BLOG}/${post.slug}`;
    const when = new Date(`${post.date}T12:00:00Z`).toUTCString();
    return `<item>
<title>${esc(post.title)}</title>
<link>${esc(link)}</link>
<guid isPermaLink="true">${esc(link)}</guid>
<pubDate>${esc(when)}</pubDate>
<description>${esc(post.description)}</description>
<content:encoded>${cdata(post.html)}</content:encoded>
${post.tags.map((tag) => `<category>${esc(tag)}</category>`).join('\n')}
</item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>Prompting Circumstance</title>
<link>${SITE}${BLOG}</link>
<description>A blog on erikhbush.com. Newest posts first.</description>
<language>en</language>
<lastBuildDate>${esc(new Date().toUTCString())}</lastBuildDate>
<atom:link href="${SITE}${BLOG}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`;
}

function renderSitemap(published) {
  const staticUrls = [`${SITE}/`, `${SITE}/story`, `${SITE}${BLOG}`];
  const body = [
    ...staticUrls.map((loc) => `<url><loc>${esc(loc)}</loc></url>`),
    ...published.map((post) => `<url><loc>${esc(`${SITE}${BLOG}/${post.slug}`)}</loc><lastmod>${post.date}</lastmod></url>`)
  ].join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function mirrorSite() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  for (const name of readdirSync(ROOT)) {
    if (name.startsWith('.') || SKIP_ROOT.has(name)) continue;
    const src = join(ROOT, name);
    const dest = join(DIST, name);
    try {
      execFileSync('cp', ['-a', src, dest], { stdio: 'pipe' });
    } catch {
      cpSync(src, dest, { recursive: true });
    }
  }
  const blogDist = join(DIST, 'promptingcircumstance');
  mkdirSync(blogDist, { recursive: true });
  cpSync(join(ROOT, 'promptingcircumstance', 'blog.css'), join(blogDist, 'blog.css'));
  const images = join(ROOT, 'promptingcircumstance', 'images');
  if (existsSync(images)) cpSync(images, join(blogDist, 'images'), { recursive: true });
}

function write(file, contents) {
  const dest = join(DIST, file);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, contents);
}

const showDrafts = draftsVisible();
const posts = loadPosts();
for (const post of posts) post.html = renderMarkdown(post);
if (errors.length) fail(errors.join('\n'));

const published = posts.filter((post) => !post.draft);
const visible = showDrafts ? posts : published;

mirrorSite();
write('promptingcircumstance/index.html', renderIndex(visible, published, showDrafts));
for (const post of visible) {
  write(`promptingcircumstance/${post.slug}/index.html`, renderPost(post));
}
write('promptingcircumstance/rss.xml', renderRss(published));
write('sitemap.xml', renderSitemap(published));
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

const hidden = posts.length - published.length;
console.log(`Prompting Circumstance: ${published.length} published, ${hidden} draft${hidden === 1 ? '' : 's'} ${showDrafts ? 'visible on this preview' : 'hidden'}.`);
console.log(`Wrote ${DIST}`);
