# Verse News — Production Shell

Scripture presented as a professional news publication.

## What’s new in this shell

| Before (single HTML) | After (Vite shell) |
|---|---|
| Babel compiled JSX in the browser (~2.8 MB) | Pre-built React app via Vite |
| No shareable URLs | Hash routes (`#/story/…`, `#/bible/…`, …) |
| Supabase `select=*` limit 500 (~2 MB+) | Lean list fields, limit 1000; full article on open |
| CDN React + Babel required | Bundled assets, works offline after load |

## Routes

| Hash | View |
|------|------|
| `#/` | Homepage |
| `#/story/:id` | Article |
| `#/bible` · `#/bible/:book/:chapter` | Bible reader |
| `#/maps` · `#/places` · `#/weather` · `#/games` · `#/tools` | Destinations |
| `#/division/:name` | Division filter (e.g. `torah`, `gospels`) |

## Develop

```bash
cd /Users/live/verse-news
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Output: `dist/` (static files — deploy to any host).

## Project layout

```
src/
  main.jsx          # entry
  App.jsx           # UI + routing + data loading
  index.css         # global styles
  data/stories.js   # offline story fallback library
docs/
  EDITORIAL.md      # desk standards (Bible / Creation / Life)
```

Editorial spine and cold-visitor rules: see `docs/EDITORIAL.md`.

## Data

- **Primary:** Supabase `articles` (anon key, RLS read; writes blocked).
- **Fallback:** embedded `STORIES` if the API fails.
- List query uses a field subset (no full body/scripture/commentary).
- Opening a story hydrates full row via `id=eq.{id}` when body is empty.
