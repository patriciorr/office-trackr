#!/usr/bin/env bash
# Spins up the full stack (mongo+backend+frontend) in ephemeral Docker containers,
# waits for the frontend to respond, runs Cypress, then always tears everything down.
set -uo pipefail

cd "$(dirname "$0")/../../.."
COMPOSE_FILE="docker-compose.e2e.yml"

cleanup() {
  echo "Tearing down e2e Docker stack..."
  docker compose -f "$COMPOSE_FILE" down -v --remove-orphans
}
trap cleanup EXIT

echo "Starting e2e Docker stack..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "Waiting for the backend to accept connections..."
for _ in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/auth/login || echo "000")
  [ "$code" != "000" ] && break
  sleep 1
done

npx wait-on -t 120000 http://localhost:3000

cd frontend
npx cypress run "$@"
exit_code=$?

exit $exit_code
