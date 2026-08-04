#!/bin/sh
set -e

export PATH="$PATH:/app/node_modules/.bin"

if [ "$SKIP_MIGRATIONS" != "true" ] && [ "$SKIP_MIGRATIONS" != "1" ]; then
  echo "==> Running database migrations..."
  prisma migrate deploy
else
  echo "==> Skipping database migrations (SKIP_MIGRATIONS set)."
fi

if [ "$SKIP_INGESTION" != "true" ] && [ "$SKIP_INGESTION" != "1" ]; then
  echo "==> Running data ingestion..."
  node ./dist/ingest.mjs
else
  echo "==> Skipping data ingestion (SKIP_INGESTION set)."
fi

exec "$@"
