#!/bin/sh
# Lädt dist/ versioniert auf den Asset-Server (S3-kompatibel) hoch:
#   s3://$PK_S3_BUCKET/plan-kit/<version>/plan-kit.js
# Bereits veröffentlichte Versionen werden nie überschrieben.
#
# Benötigt: aws-cli, Zugangsdaten in der Umgebung, PK_S3_BUCKET.
# Optional: PK_S3_ENDPOINT (für nicht-AWS S3), PK_S3_PREFIX (Default: plan-kit)
set -eu

: "${PK_S3_BUCKET:?PK_S3_BUCKET ist nicht gesetzt}"
PREFIX="${PK_S3_PREFIX:-plan-kit}"
VERSION=$(node -p "require('./package.json').version")
DEST="s3://$PK_S3_BUCKET/$PREFIX/$VERSION/"
ENDPOINT_ARG=""
[ -n "${PK_S3_ENDPOINT:-}" ] && ENDPOINT_ARG="--endpoint-url $PK_S3_ENDPOINT"

# shellcheck disable=SC2086
if aws s3 ls $ENDPOINT_ARG "${DEST}plan-kit.js" >/dev/null 2>&1; then
  echo "Version $VERSION existiert bereits unter $DEST – Version in package.json erhöhen." >&2
  exit 1
fi

# shellcheck disable=SC2086
aws s3 cp $ENDPOINT_ARG dist/ "$DEST" --recursive \
  --cache-control "public, max-age=31536000, immutable"

echo "Veröffentlicht: $DEST"
