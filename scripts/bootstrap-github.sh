#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/local.env.txt}"
REPO_NAME="${GITHUB_REPO_NAME:-7labs.org}"
REPO_VISIBILITY="${GITHUB_REPO_VISIBILITY:-public}"

read_env_value() {
  local key="$1"
  local file="$2"
  sed -n "s/^${key}=//p" "$file" | head -n 1
}

require_bin() {
  local bin_name="$1"
  if ! command -v "$bin_name" >/dev/null 2>&1; then
    echo "Missing required command: $bin_name" >&2
    exit 1
  fi
}

require_env_value() {
  local key="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "Missing required value: $key" >&2
    exit 1
  fi
}

require_bin git
require_bin gh

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

GH_TOKEN="${GH_TOKEN:-$(read_env_value GITHUB_TOKEN "$ENV_FILE")}"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-$(read_env_value CLOUDFLARE_API_TOKEN "$ENV_FILE")}"
if [[ -z "$CLOUDFLARE_API_TOKEN" ]]; then
  CLOUDFLARE_API_TOKEN="$(read_env_value Cloudflare_TOKEN "$ENV_FILE")"
fi

require_env_value GITHUB_TOKEN "$GH_TOKEN"
require_env_value CLOUDFLARE_API_TOKEN "$CLOUDFLARE_API_TOKEN"

export GH_TOKEN
export GITHUB_TOKEN="$GH_TOKEN"

REPO_OWNER="${GITHUB_REPO_OWNER:-$(gh api user --jq .login)}"
require_env_value GITHUB_REPO_OWNER "$REPO_OWNER"

REPO_SLUG="${REPO_OWNER}/${REPO_NAME}"
REMOTE_URL="https://github.com/${REPO_SLUG}.git"

if ! gh repo view "$REPO_SLUG" >/dev/null 2>&1; then
  gh repo create "$REPO_SLUG" \
    --"${REPO_VISIBILITY}" \
    --source="$ROOT_DIR" \
    --remote=origin \
    --push \
    --description "English-first AI tools workbench for ${REPO_NAME}"
else
  if git -C "$ROOT_DIR" remote get-url origin >/dev/null 2>&1; then
    git -C "$ROOT_DIR" remote set-url origin "$REMOTE_URL"
  else
    git -C "$ROOT_DIR" remote add origin "$REMOTE_URL"
  fi
  git -C "$ROOT_DIR" push -u origin "$(git -C "$ROOT_DIR" branch --show-current)"
fi

printf '%s' "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN --repo "$REPO_SLUG"

printf 'repo=%s\nremote=%s\nsecret=CLOUDFLARE_API_TOKEN\n' "$REPO_SLUG" "$REMOTE_URL"
