#!/usr/bin/env sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE="${ROOT_DIR}/.env"
COMPOSE_FILE="${ROOT_DIR}/compose.registry.yml"
AUTH_FILE="${ROOT_DIR}/ops/registry/auth/htpasswd"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker est requis sur le VPS" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose est requis sur le VPS" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Le fichier ${ENV_FILE} est introuvable" >&2
  exit 1
fi

if [ ! -f "$AUTH_FILE" ]; then
  echo "Le fichier ${AUTH_FILE} est introuvable. Lance d abord scripts/setup_registry_auth.sh" >&2
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

TRAEFIK_NETWORK="${TRAEFIK_PUBLIC_NETWORK:-traefik-public}"

if ! docker network inspect "$TRAEFIK_NETWORK" >/dev/null 2>&1; then
  docker network create "$TRAEFIK_NETWORK" >/dev/null
fi

cd "$ROOT_DIR"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
