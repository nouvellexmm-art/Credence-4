# Credence (Vercel + static UI + AI API routes)

## Files

- `index.html`: Entry point (redirects to `credence-v6 (1).html`)
- `credence-v6 (1).html`: Main app (calls `/api/*` for real AI when configured)
- `api/*.js`: Vercel serverless functions (OpenAI on the server only)
- `api/lib/openai.js`: Shared OpenAI REST helpers
- `package.json`: `"type": "module"` for ESM in API routes
- `my_photo.jpg`: Place in repo root for the logo (see below)

## Real AI (OpenAI) on Vercel

1. In the Vercel project: **Settings → Environment Variables**
2. Add **`OPENAI_API_KEY`** with your [OpenAI API key](https://platform.openai.com/api-keys) (keep it secret; never commit it to Git).
3. Optional: **`OPENAI_MODEL`** (defaults to `gpt-4o-mini`).
4. Redeploy after saving variables.

The browser only calls **your** deployment’s `/api/...` routes; the key stays on Vercel.

If `OPENAI_API_KEY` is missing or a request fails, the app **falls back** to offline heuristics (still works, but not “live” AI).

### API routes

| Route | Purpose |
|--------|--------|
| `POST /api/suggest-goal` | Weekly goal suggestion from student progress context |
| `POST /api/analyze-evidence` | Vision + notes → estimated completion & confidence |
| `POST /api/accessibility-help` | Simpler step-by-step text from goal description |

## Logo

Use:

`<img src="my_photo.jpg" alt="Credence logo">`

Add **`my_photo.jpg`** in the project root.

## Deploy (GitHub → Vercel)

1. Push this repo to GitHub.
2. Vercel: **New Project** → import the repo.
3. Framework: **Other** (no build step required).
4. Deploy, then set **`OPENAI_API_KEY`** and redeploy.

## Local preview of API routes

Install [Vercel CLI](https://vercel.com/docs/cli) and run `vercel dev` from this folder (loads `/api` and env vars from Vercel or `.env.local`).
