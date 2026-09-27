import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const POSTS = join(ROOT, 'promptingcircumstance', 'posts');
const IMAGES = join(ROOT, 'promptingcircumstance', 'images');
const failures = [];

function check(cond, message) {
  if (!cond) failures.push(message);
}

function build(env) {
  return spawnSync('node', ['scripts/build-blog.mjs'], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8'
  });
}

function read(rel) {
  const file = join(DIST, rel);
  return existsSync(file) ? readFileSync(file, 'utf8') : '';
}

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

const tempPosts = [
  'newer-note.md',
  'older-note.md',
  'hidden-draft.md',
  'bad-link.md',
  'bad-image.md',
  'bad-key.md'
];

function cleanup() {
  for (const name of tempPosts) rmSync(join(POSTS, name), { force: true });
  rmSync(join(IMAGES, 'sample-cover.png'), { force: true });
}

function writePost(name, body) {
  writeFileSync(join(POSTS, name), body);
}

try {
  let result = build({ VERCEL_ENV: 'production', INCLUDE_DRAFTS: '' });
  check(result.status === 0, `production build failed\n${result.stderr}`);
  check(read('promptingcircumstance/index.html').includes('Placeholder: the first post goes here'), 'welcome post missing from index');
  check(read('promptingcircumstance/welcome/index.html').includes('id="a-heading"'), 'welcome prose missing');
  check(read('promptingcircumstance/welcome/index.html').includes('property="og:title" content="Placeholder: the first post goes here"'), 'og title missing');
  check(read('promptingcircumstance/welcome/index.html').includes('name="twitter:card" content="summary_large_image"'), 'twitter card missing');
  check(!existsSync(join(DIST, 'promptingcircumstance/README.md')), 'agent instructions were published');
  check(!existsSync(join(DIST, 'promptingcircumstance/posts')), 'markdown source was published');
  for (const file of ['index.html', 'story.html', 'hang.html', 'experience.js', 'scrollcraft.css', 'benefit-track.json']) {
    check(readFileSync(join(ROOT, file)).equals(readFileSync(join(DIST, file))), `${file} changed while copying to dist`);
  }
  check(read('index.html').includes('href="/promptingcircumstance"'), 'homepage is missing the blog link');
  check(read('story.html').includes('href="/promptingcircumstance"'), 'story page is missing the blog link');
  check(read('experience.js').includes('>The blog</a>'), 'INFRA menu is missing the blog link');
  check(read('story.html').includes('Field notes') && read('hang.html').includes('The hang lives in the story'), 'existing copy changed');

  mkdirSync(IMAGES, { recursive: true });
  writeFileSync(join(IMAGES, 'sample-cover.png'), PNG);
  writePost('older-note.md', `---
title: "Older note"
date: 2020-01-15
description: "An older published note."
tags: archive
---

Older body.
`);
  writePost('newer-note.md', `---
title: "Newer note"
date: 2026-10-01
description: "A newer published note."
cover: images/sample-cover.png
tags:
  - sample
---

![A one pixel sample](images/sample-cover.png)

See [the story](/story).
`);
  writePost('hidden-draft.md', `---
title: "Hidden draft"
date: 2026-12-01
description: "This draft must not ship."
draft: true
---

Secret draft body.
`);

  result = build({ VERCEL_ENV: 'production', INCLUDE_DRAFTS: '' });
  check(result.status === 0, `production build with fixtures failed\n${result.stderr}`);
  const prodList = read('promptingcircumstance/index.html').split('class="post-list"')[1] || '';
  const newerAt = prodList.indexOf('Newer note');
  const welcomeAt = prodList.indexOf('Placeholder: the first post goes here');
  const olderAt = prodList.indexOf('Older note');
  check(newerAt !== -1 && welcomeAt !== -1 && olderAt !== -1 && newerAt < welcomeAt && welcomeAt < olderAt, 'posts are not newest first');
  check(!read('promptingcircumstance/index.html').includes('Hidden draft'), 'draft appeared on the production index');
  check(!existsSync(join(DIST, 'promptingcircumstance/hidden-draft/index.html')), 'draft page was built for production');
  check(!read('promptingcircumstance/rss.xml').includes('Hidden draft'), 'draft appeared in RSS');
  check(!read('sitemap.xml').includes('hidden-draft'), 'draft appeared in the sitemap');
  const newer = read('promptingcircumstance/newer-note/index.html');
  check(newer.includes('src="/promptingcircumstance/images/sample-cover.png"'), 'inline image path was not rewritten');
  check(newer.includes('property="og:image" content="https://erikhbush.com/promptingcircumstance/images/sample-cover.png"'), 'cover was not used as the share image');
  check(newer.includes('property="og:image:width" content="1"'), 'cover dimensions were not read');
  check(read('sitemap.xml').includes('https://erikhbush.com/promptingcircumstance/newer-note'), 'published post missing from sitemap');
  check(read('promptingcircumstance/rss.xml').includes('https://erikhbush.com/promptingcircumstance/newer-note'), 'published post missing from RSS');

  result = build({ VERCEL_ENV: 'preview', INCLUDE_DRAFTS: '' });
  check(result.status === 0, `preview build failed\n${result.stderr}`);
  const previewIndex = read('promptingcircumstance/index.html');
  const previewList = previewIndex.split('class="post-list"')[1] || '';
  check(previewList.includes('Hidden draft'), 'draft missing from the preview index');
  check(previewList.indexOf('Hidden draft') < previewList.indexOf('Newer note'), 'draft was not sorted newest first on preview');
  const draftPage = read('promptingcircumstance/hidden-draft/index.html');
  check(draftPage.includes('name="robots" content="noindex"'), 'draft page is missing noindex');
  check(draftPage.includes('class="draft-pill"'), 'draft page is missing the draft label');
  check(!read('promptingcircumstance/rss.xml').includes('Hidden draft'), 'draft leaked into preview RSS');
  check(!read('sitemap.xml').includes('hidden-draft'), 'draft leaked into preview sitemap');

  writePost('bad-link.md', `---
title: "Bad link"
date: 2026-01-01
description: "Should fail."
---

See [this](somewhere).
`);
  result = build({ VERCEL_ENV: 'production', INCLUDE_DRAFTS: '' });
  check(result.status !== 0 && result.stderr.includes('relative link'), `relative link should fail the build\n${result.stderr}`);
  rmSync(join(POSTS, 'bad-link.md'), { force: true });

  writePost('bad-image.md', `---
title: "Bad image"
date: 2026-01-01
description: "Should fail."
cover: images/missing.jpg
---

Body.
`);
  result = build({ VERCEL_ENV: 'production', INCLUDE_DRAFTS: '' });
  check(result.status !== 0 && result.stderr.includes('missing promptingcircumstance/images/missing.jpg'), `missing image should fail the build\n${result.stderr}`);
  rmSync(join(POSTS, 'bad-image.md'), { force: true });

  writePost('bad-key.md', `---
title: "Bad key"
date: 2026-01-01
description: "Should fail."
author: Erik
---

Body.
`);
  result = build({ VERCEL_ENV: 'production', INCLUDE_DRAFTS: '' });
  check(result.status !== 0 && result.stderr.includes('unknown front matter key'), `unknown key should fail the build\n${result.stderr}`);
  rmSync(join(POSTS, 'bad-key.md'), { force: true });
} finally {
  cleanup();
}

const finalBuild = build({ VERCEL_ENV: 'production', INCLUDE_DRAFTS: '' });
check(finalBuild.status === 0, `final production build failed\n${finalBuild.stderr}`);
check(!read('promptingcircumstance/index.html').includes('Hidden draft'), 'draft survived cleanup');
check(!read('promptingcircumstance/index.html').includes('Newer note'), 'fixture post survived cleanup');
check(read('promptingcircumstance/index.html').includes('Placeholder: the first post goes here'), 'welcome post missing after cleanup');

const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
check(vercel.cleanUrls === true, 'cleanUrls was turned off');
check(vercel.buildCommand === 'npm run build', 'build command missing');
check(vercel.outputDirectory === 'dist', 'output directory missing');
check(JSON.stringify(vercel.rewrites) === JSON.stringify([
  { source: '/story', destination: '/story.html' },
  { source: '/hang', destination: '/hang.html' },
  { source: '/hang/:slug', destination: '/hang.html' },
  { source: '/hang/:slug/', destination: '/hang.html' },
  { source: '/scan', destination: '/index.html' },
  { source: '/daily', destination: '/index.html' },
  { source: '/life', destination: '/index.html' }
]), 'rewrites changed');

function resolveFile(urlPath) {
  const path = decodeURIComponent(urlPath.split('?')[0]).replace(/\/+$/, '') || '/';
  let dest = path;
  if (path === '/story') dest = '/story.html';
  else if (path === '/hang' || path.startsWith('/hang/')) dest = '/hang.html';
  else if (path === '/scan' || path === '/daily' || path === '/life') dest = '/index.html';
  const rel = dest.replace(/^\//, '');
  const candidates = [join(DIST, rel)];
  if (!extname(dest)) {
    candidates.push(join(DIST, `${rel}.html`));
    candidates.push(join(DIST, rel, 'index.html'));
  }
  for (const file of candidates) {
    const full = normalize(file);
    if (!full.startsWith(`${DIST}/`)) continue;
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8'
};

await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const file = resolveFile(req.url || '/');
    if (!file) {
      res.writeHead(404);
      res.end('missing');
      return;
    }
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    const paths = [
      ['/', 'Digital Fog Scan'],
      ['/story', 'Field notes'],
      ['/story', 'Prompting Circumstance'],
      ['/hang/fog', 'The hang lives in the story'],
      ['/scan', 'Digital Fog Scan'],
      ['/daily', 'Digital De-Fog Daily'],
      ['/life', 'AI'],
      ['/promptingcircumstance', 'Prompting Circumstance'],
      ['/promptingcircumstance/welcome', 'A heading'],
      ['/promptingcircumstance/rss.xml', '<rss version="2.0"'],
      ['/sitemap.xml', 'https://erikhbush.com/promptingcircumstance/welcome'],
      ['/robots.txt', 'Sitemap: https://erikhbush.com/sitemap.xml'],
      ['/scrollcraft.css', ''],
      ['/assets/og.jpg', '']
    ];
    Promise.all(paths.map(async ([path, needle]) => {
      const response = await fetch(`http://127.0.0.1:${port}${path}`);
      const body = Buffer.from(await response.arrayBuffer());
      check(response.status === 200, `${path} returned ${response.status}`);
      if (needle) check(body.includes(Buffer.from(needle)), `${path} did not contain ${needle}`);
    })).then(() => {
      const xml = spawnSync('python3', ['-c', `
import xml.etree.ElementTree as ET
ET.parse(${JSON.stringify(join(DIST, 'sitemap.xml'))})
ET.parse(${JSON.stringify(join(DIST, 'promptingcircumstance/rss.xml'))})
print('xml-ok')
`], { encoding: 'utf8' });
      check(xml.status === 0 && xml.stdout.includes('xml-ok'), `XML parse failed\n${xml.stderr}`);
      server.close();
      if (failures.length) {
        console.error(failures.map((item) => `- ${item}`).join('\n'));
        process.exit(1);
      }
      console.log('Verified production build, draft hiding, preview drafts, feed, sitemap, and existing routes.');
      resolve();
    }).catch((err) => {
      server.close();
      reject(err);
    });
  });
});
