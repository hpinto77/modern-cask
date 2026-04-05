# The Modern Cask

Single malt whisky discovery and collection tracking app.

## Deploy to Netlify via GitHub

1. Push this folder to a GitHub repo
2. In Netlify: Add new site → Import from Git → select your repo
3. Build settings are auto-detected from `netlify.toml`
4. Add environment variables in Netlify dashboard:
   - `GEMINI_API_KEY` → your Google AI Studio key (aistudio.google.com)

## Local Development

Open `public/index.html` directly in a browser.
The app will use the WHISKY:EDITION API directly (CORS allowed).
For photo search, enter your Gemini key in the Photo tab.

## Structure

```
modern-cask-netlify/
├── netlify.toml                    ← build config
├── netlify/functions/
│   └── whisky.js                   ← API proxy + Gemini proxy
└── public/
    └── index.html                  ← full app (HTML/CSS/JS)
```

## Environment Variables (Netlify)

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini Flash 1.5 key for photo label search |

## Data Sources

- **WHISKY:EDITION API** — whisky catalogue, tasting notes, ratings
- **Supabase** — user auth, check-ins, tasting notes (already wired in)
- **Gemini Flash 1.5** — label photo recognition
