#!/usr/bin/env bash
# Copies the Clerk production keys from .env.production.local into the preallo-qa Vercel
# project for Production (www.preallo.com). Values go from the file straight into
# `vercel env add` on stdin; nothing is printed.
#
# Paste the live keys from Clerk (Production > API keys) into .env.production.local:
#   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
#   CLERK_SECRET_KEY=sk_live_...
# then, from the repo root, signed in to the personal Vercel account:
#   bash scripts/push-production-env.sh
set -euo pipefail

SCOPE=marvinxkiyingis-projects
PROJECT=preallo-qa
FILE=.env.production.local
KEYS=(NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY)
# The shell function that picks the personal Vercel login does not reach scripts.
VERCEL=(vercel)
[ -d "$HOME/.vercel-personal" ] && VERCEL+=(--global-config "$HOME/.vercel-personal")

[ -f "$FILE" ] || { echo "Create $FILE in the repo root with the Clerk live keys first."; exit 1; }

"${VERCEL[@]}" link --yes --project "$PROJECT" --scope "$SCOPE" >/dev/null

for key in "${KEYS[@]}"; do
  value=$(grep -E "^${key}=" "$FILE" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')
  if [ -z "$value" ]; then
    echo "$key is missing from $FILE"
    exit 1
  fi
  case "$key:$value" in
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:pk_live_*|CLERK_SECRET_KEY:sk_live_*) ;;
    *) echo "$key is not a live key (expected pk_live_ or sk_live_)"; exit 1 ;;
  esac
  printf '%s' "$value" | "${VERCEL[@]}" env add "$key" production --scope "$SCOPE" >/dev/null
  echo "Added $key for Production"
done
