# Project State

Updated: 2026-06-18
Project: `7labs-ai-workbench-english`
Git head: `3e4d934`

## Current code state

WP-0 through WP-4 are complete in the repository and the current deploy baseline is commit `3e4d934`.

- WP-0: launch routing, trust pages, verification seam, and production smoke script completed.
- WP-1: analytics event sink and client event plumbing completed.
- WP-2: prompt-library pages, sitemap freshness, `llms.txt`, OG images, and internal-link pass completed.
- WP-3: UI/UX and performance pass completed.
- WP-4: git, CI workflows, and Playwright smoke coverage completed.
- WP-5: gated and not started.
- WP-6: gated and not started.

## Current production state

Production is live.

Read-only probes on 2026-06-18 confirmed:

- `7labs.org` nameservers: `raegan.ns.cloudflare.com`, `simon.ns.cloudflare.com`
- `7labs.org` A record: `198.18.2.234`
- `https://7labs.org` returns `200`
- `https://www.7labs.org/tools/regex-generator?smoke=1` returns `308` to `https://7labs.org/tools/regex-generator?smoke=1`
- `https://7labs.org/robots.txt` returns `200 text/plain`
- GitHub Actions `Validate` run `27747156825` passed
- GitHub Actions `Deploy` run `27747272632` passed
- Cloudflare Worker `7labs-org` deployment is present in `wrangler deployments list`

Current deploy-readiness verdict: `live`

Resolved launch blockers:

- Domain is on the Cloudflare zone and serving the deployed app.
- Cloudflare deploy auth is proven through the GitHub Actions deploy workflow.
- GitHub repository `7-labs/7labs.org` exists and is connected to the local repo.
- GitHub Actions secret `CLOUDFLARE_API_TOKEN` is configured.

## Remaining owner follow-ups

These are no longer blockers for launch, but they remain advisable operator tasks.

1. Add branch protection rules for `main`.
2. Enable Workers Analytics Engine before re-adding the optional `EVENTS` binding.
3. Connect Search Console and Bing Webmaster verification values when ready.
4. Re-run browser QA from the intended operator environment if you need fresh visual acceptance evidence after future deploys.

## Codex-allowed next actions

1. Re-run `SITE_URL=https://7labs.org npm run smoke:prod` after significant deploys.
2. Re-add the optional analytics dataset binding only after the Cloudflare account feature is enabled.
3. Register or sync an OpenClaw workspace if remote browser QA becomes necessary for future UI changes.

## Canonical handoff files

- Human-readable status: `PROJECT_STATE.md`
- Machine-readable status: `ops/current-state.json`
- Append-only readiness ledger: `ops/deploy-ledger.jsonl`
