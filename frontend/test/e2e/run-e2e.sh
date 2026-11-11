#!/usr/bin/env bash
# Spins up an isolated Docker stack, runs Cypress, then tears it down.
set -euo pipefail

cd "$(dirname "$0")/../../.."
COMPOSE_FILE="$PWD/frontend/test/e2e/docker-compose.e2e.yml"
PROJECT="office-trackr-e2e-$(date +%s)-$$"
compose=(docker compose --project-name "$PROJECT" -f "$COMPOSE_FILE")

cleanup() {
  echo "Tearing down e2e Docker stack..."
  "${compose[@]}" down -v --remove-orphans
  for service in backend frontend; do
    image="${PROJECT}-${service}:latest"
    if docker image inspect "$image" >/dev/null 2>&1; then
      docker image rm "$image"
    fi
  done
}
trap cleanup EXIT

echo "Starting e2e Docker stack..."
"${compose[@]}" up -d --build

port=$("${compose[@]}" port frontend 80)
base_url="http://$port"
echo "Waiting for the frontend and backend..."
ready=false
for _ in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$base_url/api/auth/login" || true)
  if [ "$code" = "404" ]; then
    ready=true
    break
  fi
  sleep 1
done
if [ "$ready" != true ]; then
  echo "Timed out waiting for the frontend proxy and backend" >&2
  "${compose[@]}" logs
  exit 1
fi

cd frontend
./node_modules/.bin/cypress run --config "baseUrl=$base_url" "$@"
