# Constraints AI Worker — deploy scaffold

This folder is a Cloudflare Workers project ready to ship `_worker.js` as a live
endpoint for the Constraints AI hero demo.

## One-time setup (Boubacar runs this once)

```bash
cd output/websites/catalystworks-site/worker-deploy
npx wrangler login
```

That opens a browser tab for Cloudflare OAuth.

## Deploy

```bash
cd output/websites/catalystworks-site/worker-deploy
bash deploy.sh
```

The script:

1. Reads `OPENROUTER_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` from the
   repo `.env` and `wrangler secret put`s each.
2. Generates a random `HASH_SALT` if one isn't set in `.env` (this is fine —
   the salt only needs to be stable within a single Worker instance).
3. Runs `npx wrangler deploy`.
4. Prints the deployed worker URL.

## Wire the URL

Open `../index.html`, find `const WORKER_URL = '';`, paste the URL between
the quotes, commit, push.

## Source

`src/index.js` is a verbatim copy of `../_worker.js`. If you need to update the
worker, edit `../_worker.js` (canonical source) and re-run:

```bash
cp ../_worker.js src/index.js
bash deploy.sh
```
