# Prompting Circumstance

Blog for erikhbush.com. One post is one Markdown file. Do not edit the build, the templates, the navigation, or `vercel.json` to publish a post.

This repo deploys erikhbush.com. Do not connect it to the TBTX Vercel project.

## Add a post

1. Start from an up-to-date `main`. Create a branch named `post/<slug>`. Never commit or push to `main`.
2. Add one file: `promptingcircumstance/posts/<slug>.md`.
3. If the post has images, add those files under `promptingcircumstance/images/` and reference them from the post. No other files need to change.
4. Open a pull request into `main`. Vercel builds a preview. Erik reviews that preview and merges. Merging publishes the post. Do not merge the pull request yourself.

`<slug>` is the filename without `.md`, and it is the URL: `promptingcircumstance/posts/how-to-ask.md` is served at `https://erikhbush.com/promptingcircumstance/how-to-ask`.

Filename rules:

- Lowercase letters, numbers, and single hyphens only: `how-to-ask.md`
- Do not put the date in the filename. The date lives in front matter.
- Do not use spaces, underscores, or uppercase letters.

`welcome.md` is a labeled placeholder so the layout can be reviewed. Leave it alone unless Erik asks you to replace or remove it.

## Front matter

The file must start with YAML front matter:

```yaml
---
title: "Post title"
date: 2026-09-27
description: "One or two plain-text sentences. Used on the index, in RSS, and in link previews."
tags:
  - prompting
cover: images/how-to-ask.jpg
draft: false
---
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Plain text. Quote it if it contains a colon. |
| `date` | yes | `YYYY-MM-DD`. This is the sort order and the published date. Newest first. |
| `description` | yes | Plain text, not Markdown. One or two sentences. |
| `tags` | no | A YAML list of strings. A single string is also accepted. |
| `cover` | no | Path or URL of the share image. See images below. |
| `draft` | no | `true` or `false`. Omitted means published. |

Any other key fails the build. Quote `title` and `description` when they contain `:` so YAML does not break.

The body is Markdown (headings, lists, links, images, emphasis, quotes, code, tables). Raw HTML is removed. The body cannot be empty.

Links inside the body must be root paths (`/story`, `/promptingcircumstance/other-post`), in-page hashes (`#a-heading`), `mailto:` links, or full `http://` / `https://` URLs. A relative link fails the build, because post pages live in their own folder and a relative link would point at the wrong place.

## Drafts

`draft: true` hides the post from the production site, including the index, the post URL, the RSS feed, and the sitemap.

On a Vercel preview deployment the draft is still built, labeled Draft, and marked `noindex`, so Erik can read it before it is public. It is still left out of RSS and the sitemap. Locally, drafts stay hidden unless you run `INCLUDE_DRAFTS=1 npm run build`.

To publish, remove `draft` or set `draft: false`, then open the pull request (or update the open one). Merging to `main` is what makes it production.

## Images

Put image files in `promptingcircumstance/images/`. Reference them from the post like this:

```markdown
![A short description of the picture](images/how-to-ask.jpg)
```

The cover uses the same kind of path:

```yaml
cover: images/how-to-ask.jpg
```

Also allowed for `cover` and for images in the body:

- A site file that already exists, such as `/assets/og.jpg`
- A full `https://` URL

For LinkedIn, Reddit, and X, prefer a JPG or PNG cover at 1200×630. If `cover` is omitted, share cards use `https://erikhbush.com/assets/og.jpg`.

The build fails if a local image path does not exist, or if a path contains `..`.

## What the build writes

You do not commit the generated pages. Vercel runs `npm run build` and publishes `dist/`.

- `/promptingcircumstance` is the index, newest post first
- `/promptingcircumstance/<slug>` is the post
- `/promptingcircumstance/rss.xml` is the feed
- `/sitemap.xml` lists the existing public pages plus published posts
- `/robots.txt` points at the sitemap

To check locally: `npm ci && npm run build`, then open `dist/promptingcircumstance/index.html`.
