// Builds /shows from shows/data/*.json. Run: BASE_PATH=/shows node scripts/build-shows.mjs
import fs from "node:fs"; import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const data = path.join(root, "shows/data");
const cfg = JSON.parse(fs.readFileSync(path.join(data, "config.json"), "utf8"));
const BASE = (process.env.BASE_PATH || "/shows").replace(/\/$/, "");
const OUT = path.join(root, "shows");
const SITE = cfg.siteUrl.replace(/\/$/, "");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const abs = u => !u ? "" : /^https?:/.test(u) ? u : SITE + (u.startsWith("/") ? u : BASE + "/" + u);
const handleSet = cfg.xHandle && !cfg.xHandle.startsWith("CONFIG_");
const fmtDate = d => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {year:"numeric", month:"long", day:"numeric", timeZone:"UTC"});

function video(ep) {
  const v = ep.video || "";
  let m;
  if ((m = v.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/)))
    return {kind:"youtube", embed:`https://www.youtube-nocookie.com/embed/${m[1]}`, html:`<div class="frame"><iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" title="${esc(ep.title)}" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`, thumb:`https://i.ytimg.com/vi/${m[1]}/maxresdefault.jpg`};
  if (/(?:x|twitter)\.com\/[^/]+\/status\/\d+/.test(v))
    return {kind:"x", html:`<div class="xpost"><blockquote class="twitter-tweet" data-media-max-width="1200" data-theme="dark"><a href="${esc(v.replace("x.com","twitter.com"))}">${esc(ep.title)} on X</a></blockquote></div>`};
  if (/\.(mp4|webm|mov)$/i.test(v))
    return {kind:"mp4", src:abs(v), html:`<div class="frame"><video controls playsinline preload="metadata" ${ep.thumbnail?`poster="${esc(ep.thumbnail)}"`:""} src="${esc(v)}"></video></div>`};
  return {kind:"none", html:`<div class="frame placeholder"><span class="label">Video slot</span></div>`};
}

const head = ({title, desc, url, image, player, type="website"}) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
${process.env.NOINDEX ? '<meta name="robots" content="noindex,nofollow">' : ""}
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="${type}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}"><meta property="og:site_name" content="Erik H Bush">
${image?`<meta property="og:image" content="${esc(image)}">`:""}
${player?.src?`<meta property="og:video" content="${esc(player.src)}"><meta property="og:video:type" content="video/mp4">`:""}
<meta name="twitter:card" content="${player?.embed ? "player" : "summary_large_image"}"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
${image?`<meta name="twitter:image" content="${esc(image)}">`:""}
${player?.embed?`<meta name="twitter:player" content="${esc(player.embed)}"><meta name="twitter:player:width" content="1280"><meta name="twitter:player:height" content="720">`:""}
${handleSet?`<meta name="twitter:creator" content="@${esc(cfg.xHandle)}">`:""}
<link rel="alternate" type="application/rss+xml" title="PC News episodes" href="${BASE}/pc-news/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=MuseoModerno:wght@700;800;900&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap">
<link rel="stylesheet" href="${BASE}/shows.css"></head><body>
<header class="bar"><a href="/" class="logo"><img src="${BASE}/assets/ehb-logo-dark.png" alt="Erik H Bush home"></a><nav><a href="${BASE}/">Shows</a><a href="${BASE}/pc-news/">PC News</a><a href="${BASE}/pc-news/feed.xml">RSS</a></nav></header><main>`;
const foot = `</main><footer class="bar"><span class="label">erikhbush.com / shows</span>${handleSet?`<a class="label" href="https://x.com/${esc(cfg.xHandle)}">Follow @${esc(cfg.xHandle)} on X</a>`:`<span class="label">X handle: set xHandle in shows/data/config.json</span>`}</footer>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></body></html>`;
const write = (rel, html) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), {recursive:true}); fs.writeFileSync(f, html); };

const share = (url, title) => { const u = encodeURIComponent(url), t = encodeURIComponent(title);
  return `<div class="share"><span class="label">Share</span><a href="https://x.com/intent/post?text=${t}&url=${u}${handleSet?`&via=${cfg.xHandle}`:""}">Post on X</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=${u}">LinkedIn</a><a href="https://www.facebook.com/sharer/sharer.php?u=${u}">Facebook</a><button onclick="navigator.clipboard.writeText('${esc(url)}');this.textContent='Copied'">Copy link</button></div>`; };

const followBlock = () => `<section class="cell follow"><div class="hbar"><span class="label">On X</span></div>${handleSet
  ? `<a class="twitter-timeline" data-theme="dark" data-height="560" href="https://twitter.com/${esc(cfg.xHandle)}">Posts by @${esc(cfg.xHandle)}</a><p><a class="btn" href="https://x.com/${esc(cfg.xHandle)}">Follow @${esc(cfg.xHandle)}</a></p>`
  : `<p class="label">Config needed: set "xHandle" in shows/data/config.json to show the X follow link and timeline.</p>`}</section>`;

const index = [];
for (const show of cfg.shows) {
  const eps = JSON.parse(fs.readFileSync(path.join(data, show.episodesFile), "utf8"))
    .filter(e => !e.draft).sort((a, b) => b.date.localeCompare(a.date));
  const showUrl = `${SITE}${BASE}/${show.slug}/`;
  index.push({show, eps});
  const card = e => `<a class="card" href="${BASE}/${show.slug}/${e.slug}/"><div class="thumb">${e.thumbnail||video(e).thumb?`<img src="${esc(e.thumbnail||video(e).thumb)}" alt="">`:`<span class="label">${esc(show.title)}</span>`}</div><div class="hbar"><span class="label">${fmtDate(e.date)}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p></a>`;
  const [latest, ...past] = eps;
  let body = `<section class="hero"><div class="hbar"><span class="label">Show 01</span><span class="label">News desk</span></div><h1>${esc(show.title)}</h1><p class="lede"><strong>${esc(show.fullTitle)}</strong>. ${esc(show.tagline)}</p></section>`;
  if (latest) body += `<section class="cell latest"><div class="hbar"><span class="label">Latest episode</span><span class="label">${fmtDate(latest.date)}</span></div>${video(latest).html}<h2><a href="${BASE}/${show.slug}/${latest.slug}/">${esc(latest.title)}</a></h2><p>${esc(latest.description)}</p></section>`;
  else body += `<section class="cell latest"><div class="hbar"><span class="label">Latest episode</span></div><div class="frame placeholder"><span class="big">Episode 1 coming soon</span></div></section>`;
  body += `<section class="grid-wrap"><div class="hbar"><span class="label">Past episodes</span></div><div class="grid">${past.length ? past.map(card).join("") : `<div class="card empty"><span class="label">Past episodes land here after Episode 1 airs.</span></div>`}</div></section>${followBlock()}`;
  write(`${show.slug}/index.html`, head({title:`${show.fullTitle} | Erik H Bush`, desc:show.description, url:showUrl, image:latest?(latest.thumbnail?abs(latest.thumbnail):video(latest).thumb):""}) + body + foot);
  for (const e of eps) {
    const v = video(e), url = `${SITE}${BASE}/${show.slug}/${e.slug}/`;
    const img = e.thumbnail ? abs(e.thumbnail) : v.thumb || "";
    write(`${show.slug}/${e.slug}/index.html`, head({title:`${e.title} | ${show.title}`, desc:e.description, url, image:img, player:v, type:"video.episode"}) +
      `<section class="cell latest"><div class="hbar"><a class="label" href="${BASE}/${show.slug}/">${esc(show.fullTitle)}</a><span class="label">${fmtDate(e.date)}</span></div>${v.html}<h1 class="ep">${esc(e.title)}</h1><p>${esc(e.description)}</p>${share(url, `${e.title} | ${show.title}`)}</section>` + foot);
  }
  const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(show.fullTitle)}</title><link>${showUrl}</link><atom:link href="${showUrl}feed.xml" rel="self" type="application/rss+xml"/><description>${esc(show.description)}</description><language>en-us</language>
${eps.map(e => { const u = `${showUrl}${e.slug}/`; const v = video(e); return `<item><title>${esc(e.title)}</title><link>${u}</link><guid>${u}</guid><pubDate>${new Date(e.date+"T12:00:00Z").toUTCString()}</pubDate><description>${esc(e.description)}</description>${v.kind==="mp4"?`<enclosure url="${esc(v.src)}" type="video/mp4" length="0"/>`:""}</item>`; }).join("\n")}
</channel></rss>`;
  write(`${show.slug}/feed.xml`, rss);
}
let tiles = index.map(({show, eps}, i) => `<a class="card show" href="${BASE}/${show.slug}/"><div class="hbar"><span class="label">Show ${String(i+1).padStart(2,"0")}</span><span class="label">${eps.length ? eps.length + " episode" + (eps.length>1?"s":"") : "Episode 1 coming soon"}</span></div><h2>${esc(show.title)}</h2><p><strong>${esc(show.fullTitle)}</strong>. ${esc(show.tagline)}</p></a>`).join("");
for (let i = 0; i < cfg.spinoffSlots; i++) tiles += `<div class="card show empty"><div class="hbar"><span class="label">Show ${String(index.length+i+1).padStart(2,"0")}</span><span class="label">Slot open</span></div><h2>Spinoff</h2><p>Reserved for a PC News spinoff.</p></div>`;
write("index.html", head({title:"Shows | Erik H Bush", desc:"Shows by Erik H Bush, starting with PC News (Prompting Circumstance).", url:`${SITE}${BASE}/`}) +
  `<section class="hero"><div class="hbar"><span class="label">Index</span><span class="label">${index.length} show</span></div><h1>Shows</h1><p class="lede">The network starts with PC News (Prompting Circumstance). Spinoffs come later.</p></section><section class="grid-wrap"><div class="grid shows">${tiles}</div></section>` + foot);
console.log("built shows at", BASE);
