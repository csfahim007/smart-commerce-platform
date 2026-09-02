#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="/home/administrator/projects/ai-ecommerce-platform"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

API_SERVICE="ai-ecommerce-api.service"
WORKER_GROUP="ai-ecommerce-worker:ai-ecommerce-worker_00"
FRONTEND_CONTAINER="ai-ecommerce-frontend"

log() {
    printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
    printf '\n[ERROR] %s\n' "$*" >&2
    exit 1
}

trap 'fail "Deployment failed at line $LINENO."' ERR

log "Starting deployment"

cd "$APP_DIR"

log "Checking repository"

if [[ ! -d .git ]]; then
    fail "Not a Git repository: $APP_DIR"
fi

if [[ "$(git branch --show-current)" != "main" ]]; then
    fail "Current branch is not main"
fi

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
    fail "Tracked working-tree changes detected. Deployment aborted."
fi

log "Fetching origin/main"

git fetch --prune origin main

LOCAL_COMMIT="$(git rev-parse HEAD)"
REMOTE_COMMIT="$(git rev-parse origin/main)"

if [[ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]]; then
    log "Fast-forwarding to origin/main"
    git merge --ff-only origin/main
else
    log "Already up to date"
fi

log "Current commit: $(git rev-parse --short HEAD)"

log "Checking required environment files"

[[ -f "$BACKEND_DIR/.env" ]] || fail "Missing backend/.env"
[[ -f "$FRONTEND_DIR/.env.production" ]] || fail "Missing frontend/.env.production"

log "Installing backend dependencies"

cd "$BACKEND_DIR"

composer install \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --optimize-autoloader

log "Refreshing Laravel caches"

php artisan optimize

log "Installing frontend dependencies"

cd "$FRONTEND_DIR"

npm ci

log "Building production frontend"

npm run build

[[ -f "$FRONTEND_DIR/dist/index.html" ]] \
    || fail "Frontend build did not produce dist/index.html"

log "Restarting Laravel API"

sudo systemctl restart "$API_SERVICE"

log "Waiting for Laravel API"

sleep 3

if ! sudo systemctl is-active --quiet "$API_SERVICE"; then
    sudo systemctl status "$API_SERVICE" --no-pager || true
    fail "Laravel API service is not active"
fi

log "Restarting queue worker"

sudo supervisorctl restart "$WORKER_GROUP"

sleep 2

log "Checking queue worker"

if ! sudo supervisorctl status "$WORKER_GROUP" | grep -q "RUNNING"; then
    sudo supervisorctl status "$WORKER_GROUP" || true
    fail "Queue worker is not running"
fi

log "Checking frontend container"

if ! docker inspect "$FRONTEND_CONTAINER" >/dev/null 2>&1; then
    fail "Frontend container does not exist"
fi

if [[ "$(docker inspect -f '{{.State.Running}}' "$FRONTEND_CONTAINER")" != "true" ]]; then
    fail "Frontend container is not running"
fi

log "Checking frontend build is mounted"

docker exec "$FRONTEND_CONTAINER" test -f /usr/share/nginx/html/index.html

log "Checking local API response"

if ! curl --fail --silent --show-error \
    --max-time 10 \
    http://172.17.0.1:8000/api/v1/health \
    >/dev/null; then
    fail "Local Laravel API health check failed"
fi

log "Checking public API response"

if ! curl --fail --silent --show-error \
    --max-time 15 \
    https://api-ai-ecommerce-laravel.cloudafk.xyz/api/v1/health \
    >/dev/null; then
    fail "Public Laravel API health check failed"
fi

log "Deployment completed successfully"

printf '\nCommit deployed: %s\n' "$(git rev-parse --short HEAD)"
printf 'API:            %s\n' "$(sudo systemctl is-active "$API_SERVICE")"
printf 'Queue worker:   %s\n' "$(sudo supervisorctl status "$WORKER_GROUP")"
printf 'Frontend:       %s\n' "$(docker inspect -f '{{.State.Status}}' "$FRONTEND_CONTAINER")"
