#!/usr/bin/env sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE="${ROOT_DIR}/.env"
COMPOSE_FILE="${ROOT_DIR}/compose.prod.yml"
APP_IMAGE_TAG="${APP_IMAGE_TAG:-main}"

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

set -a
. "$ENV_FILE"
set +a

TRAEFIK_NETWORK="${TRAEFIK_PUBLIC_NETWORK:-traefik-public}"

if ! docker network inspect "$TRAEFIK_NETWORK" >/dev/null 2>&1; then
  docker network create "$TRAEFIK_NETWORK" >/dev/null
fi

if [ -n "${REGISTRY_HOST:-}" ] && [ -n "${REGISTRY_USERNAME:-}" ] && [ -n "${REGISTRY_PASSWORD:-}" ]; then
  printf '%s' "$REGISTRY_PASSWORD" | docker login "$REGISTRY_HOST" -u "$REGISTRY_USERNAME" --password-stdin >/dev/null
fi

cd "$ROOT_DIR"

APP_IMAGE_TAG="$APP_IMAGE_TAG" docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull
APP_IMAGE_TAG="$APP_IMAGE_TAG" docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

docker image prune -f >/dev/null
