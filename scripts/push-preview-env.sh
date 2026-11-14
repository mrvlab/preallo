#!/usr/bin/env bash
# Copies the Clerk keys from .env.local into the preallo-qa Vercel project for Preview
# (the next branch, which serves preallo-qa.vercel.app, and the PR branch). Values go from
# the file straight into `vercel env add` on stdin; nothing is printed.
#
# Run from the repo root, signed in to the personal Vercel account:
#   vercel login
#   bash scripts/push-preview-env.sh
set -euo pipefail

SCOPE=marvinxkiyingis-projects
PROJECT=preallo-qa
BRANCHES=(next feat/preallo-rebuild)
KEYS=(NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY)

[ -f .env.local ] || { echo "Run this from the repo root (no .env.local here)."; exit 1; }

vercel link --yes --project "$PROJECT" --scope "$SCOPE" >/dev/null

for key in "${KEYS[@]}"; do
  value=$(grep -E "^${key}=" .env.local | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')
  if [ -z "$value" ]; then
    echo "$key is missing from .env.local"
    exit 1
  fi
  for branch in "${BRANCHES[@]}"; do
    printf '%s' "$value" | vercel env add "$key" preview "$branch" --scope "$SCOPE" >/dev/null
    echo "Added $key for Preview ($branch)"
  done
done
