#!/usr/bin/env sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
AUTH_DIR="${ROOT_DIR}/ops/registry/auth"
AUTH_FILE="${AUTH_DIR}/htpasswd"

if [ -z "${REGISTRY_USERNAME:-}" ] || [ -z "${REGISTRY_PASSWORD:-}" ]; then
  echo "REGISTRY_USERNAME et REGISTRY_PASSWORD doivent etre definis" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker est requis pour generer le fichier htpasswd" >&2
  exit 1
fi

mkdir -p "$AUTH_DIR"

docker run --rm --entrypoint htpasswd httpd:2-alpine \
  -Bbn "$REGISTRY_USERNAME" "$REGISTRY_PASSWORD" > "$AUTH_FILE"

chmod 600 "$AUTH_FILE"
