# Shows (PC News and spinoffs)

Static pages generated from JSON. No server code, no secrets.

## Add a PC News episode
1. Open `shows/data/pc-news.episodes.json` and add an object to the array:
   ```json
   {
     "slug": "ep-001-short-name",
     "title": "Episode title",
     "date": "2026-11-01",
     "description": "One or two sentences.",
     "video": "https://x.com/HANDLE/status/123 | https://youtu.be/ID | /media/pc-news/ep-001.mp4",
     "thumbnail": "/media/pc-news/ep-001.jpg"
   }
   ```
   `thumbnail` is optional (YouTube thumbnails are automatic). Add `"draft": true` to hide an entry.
2. Build: `BASE_PATH=/shows node scripts/build-shows.mjs` (preview: `BASE_PATH=/_preview/shows NOINDEX=1`).
3. Upload the `shows/` folder (minus `data/`) to the site root on the VPS.

The newest date becomes the big player on /shows/pc-news/. Older ones fill the grid. The RSS feed is /shows/pc-news/feed.xml.

## Config
`shows/data/config.json`: set `xHandle` (no @) to Erik's personal X handle to turn on the follow link, timeline and `twitter:creator`. Add a spinoff by appending to `shows` with its own episodes file.

## Card unfurls on X
- YouTube: `twitter:player` card (plays inline on X).
- mp4: `summary_large_image` plus `og:video`; set a `thumbnail` so the card has an image.
- X post URL: page embeds the post; set a `thumbnail` for the card image.
