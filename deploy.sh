#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-validate}"
SITE_URL="${SITE_URL:-${NEXT_PUBLIC_SITE_URL:-https://7labs.org}}"
LOG_SECONDS="${WRANGLER_LOG_SECONDS:-45}"

require_local_package_bin() {
  local bin_name="$1"
  if ! npx --no-install "$bin_name" --version >/dev/null 2>&1; then
    echo "Missing local package binary: $bin_name" >&2
    echo "Run npm ci in the deployment runtime, with Cloudflare/OpenNext dependencies installed, before $MODE." >&2
    exit 1
  fi
}

require_cloudflare_auth() {
  local auth_output
  if ! auth_output="$(npx --no-install wrangler whoami 2>&1)"; then
    echo "$auth_output" >&2
    exit 1
  fi
  if echo "$auth_output" | grep -qi "not authenticated"; then
    echo "$auth_output" >&2
    echo "Blocked: Wrangler is not authenticated. Set CLOUDFLARE_API_TOKEN in the deployment runtime or run wrangler login interactively." >&2
    exit 1
  fi
  echo "$auth_output"
}

check_public_defaults() {
  if [[ "${AI_PROVIDER:-none}" != "none" && "${AI_GATEWAY_ENABLED:-false}" != "true" ]]; then
    echo "Blocked: AI_PROVIDER is not none but AI_GATEWAY_ENABLED is not true." >&2
    echo "Keep provider mode disabled until auth, quotas, caching, rate limits, and spend alerts exist." >&2
    exit 1
  fi
  if [[ "${NEWSLETTER_PROVIDER:-none}" != "none" && "${NEWSLETTER_FORM_ENABLED:-false}" != "true" ]]; then
    echo "Blocked: NEWSLETTER_PROVIDER is set but NEWSLETTER_FORM_ENABLED is not true." >&2
    exit 1
  fi
}

validate() {
  check_public_defaults
  npm run validate:prod
  npm audit --audit-level=moderate
}

cf_build() {
  check_public_defaults
  validate
  require_local_package_bin opennextjs-cloudflare
  NEXT_PUBLIC_SITE_URL="$SITE_URL" NEXT_TELEMETRY_DISABLED=1 npx --no-install opennextjs-cloudflare build
}

cf_deploy() {
  check_public_defaults
  require_local_package_bin opennextjs-cloudflare
  require_local_package_bin wrangler
  require_cloudflare_auth
  validate
  NEXT_PUBLIC_SITE_URL="$SITE_URL" NEXT_TELEMETRY_DISABLED=1 npx --no-install opennextjs-cloudflare build
  npx --no-install wrangler deploy
}

cf_logs() {
  require_local_package_bin wrangler
  require_cloudflare_auth
  npx --no-install wrangler deployments list
  perl -e 'alarm shift; exec @ARGV' "$LOG_SECONDS" npx --no-install wrangler tail --format pretty || true
}

smoke() {
  SITE_URL="$SITE_URL" npm run smoke:prod
}

case "$MODE" in
  validate)
    validate
    ;;
  cf-build)
    cf_build
    ;;
  cf-deploy)
    cf_deploy
    ;;
  cf-logs)
    cf_logs
    ;;
  smoke)
    smoke
    ;;
  *)
    echo "Usage: ./deploy.sh [validate|cf-build|cf-deploy|cf-logs|smoke]" >&2
    exit 2
    ;;
esac
