#!/usr/bin/env bash
# Catalyst Works - Constraints AI Worker deploy script
#
# Prereqs:
#   - wrangler v3+ installed (npx wrangler is fine)
#   - `wrangler login` already completed (Cloudflare account auth)
#   - $REPO_ROOT/.env must contain OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
#
# Usage from this folder:
#   bash deploy.sh
#
# After success, copy the printed worker URL and paste it into
#   index.html → const WORKER_URL = '<URL>';

set -euo pipefail

# Resolve repo root by walking up to the first .env we find
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$HERE"
while [[ "$REPO_ROOT" != "/" && ! -f "$REPO_ROOT/.env" ]]; do
  REPO_ROOT="$(dirname "$REPO_ROOT")"
done

if [[ ! -f "$REPO_ROOT/.env" ]]; then
  echo "ERROR: could not find an .env file by walking up from $HERE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$REPO_ROOT/.env"
set +a

: "${OPENROUTER_API_KEY:?OPENROUTER_API_KEY not set in .env}"
: "${SUPABASE_URL:?SUPABASE_URL not set in .env}"
: "${SUPABASE_SERVICE_KEY:?SUPABASE_SERVICE_KEY not set in .env}"

# Generate a random salt if HASH_SALT was not pre-set (fine to keep ephemeral per deploy).
HASH_SALT_VAL="${HASH_SALT:-$(openssl rand -hex 24)}"

cd "$HERE"

echo "[1/3] Pushing secrets..."
echo "$OPENROUTER_API_KEY"       | npx wrangler secret put OPENROUTER_API_KEY
echo "$SUPABASE_URL"             | npx wrangler secret put SUPABASE_URL
echo "$SUPABASE_SERVICE_KEY"     | npx wrangler secret put SUPABASE_SERVICE_KEY
echo "$HASH_SALT_VAL"            | npx wrangler secret put HASH_SALT

echo "[2/3] Deploying worker..."
npx wrangler deploy

echo "[3/3] Done. Copy the printed URL above into index.html → const WORKER_URL = '...';"
