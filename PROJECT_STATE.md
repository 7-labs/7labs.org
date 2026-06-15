# Project State

Updated: 2026-06-15
Project: `7labs-ai-workbench-english`
Git head: `f1ccfa4`

## Current code state

WP-0 through WP-4 are complete in the repository and the codebase handoff baseline is commit `f1ccfa4`.

- WP-0: launch routing, trust pages, verification seam, and production smoke script completed.
- WP-1: analytics event sink and client event plumbing completed.
- WP-2: prompt-library pages, sitemap freshness, `llms.txt`, OG images, and internal-link pass completed.
- WP-3: UI/UX and performance pass completed.
- WP-4: git, CI workflows, and Playwright smoke coverage completed.
- WP-5: gated and not started.
- WP-6: gated and not started.

## Current production state

Production is not live.

Read-only probes on 2026-06-15 confirmed:

- `7labs.org` nameservers: `ns1.dyna-ns.net`, `ns2.dyna-ns.net`
- `7labs.org` A record: `198.18.2.234`
- `https://7labs.org` returns `302` to `https://forsale.dynadot.com/7labs.org?drefid=2071`

Current deploy-readiness verdict: `blocked`

Known blockers:

- Domain is still parked at Dynadot, not serving the app.
- Cloudflare deploy auth is not proven in the active runtime.
- GitHub repository ownership/state is not proven for this handoff.
- GitHub Actions secret `CLOUDFLARE_API_TOKEN` is not proven for this handoff.

## Owner-only actions to unblock launch

These require the project owner or another authorized human. Codex should not attempt them autonomously.

1. Confirm current ownership and registrar control of `7labs.org`.
2. Move `7labs.org` onto the correct Cloudflare zone by changing nameservers at the registrar.
3. Create or confirm the private GitHub repository that will own the deploy workflows.
4. Add the GitHub Actions secret `CLOUDFLARE_API_TOKEN`.
5. Configure the intended branch protection rules.
6. Provide a deploy-auth path in the runtime by either exporting `CLOUDFLARE_API_TOKEN` or completing `wrangler login` in the approved runtime.
7. Run the first owner-approved deploy after the above items are complete.

## Codex-allowed next actions after the owner unblocks

1. Re-run `~/.codex/bin/codex-python ~/.codex/scripts/deploy-readiness-preflight.py --cwd "$PWD" --probe-github --check-openclaw-remote`.
2. Sync or register the OpenClaw workspace if the preflight still reports `openclaw: registered=no`.
3. Run `npm run validate:prod`.
4. Run `./deploy.sh cf-build`.
5. Run `npx --no-install wrangler deploy --dry-run`.
6. After explicit owner approval, run the real deploy flow and post-deploy smoke checks against `https://7labs.org`.

## Canonical handoff files

- Human-readable status: `PROJECT_STATE.md`
- Machine-readable status: `ops/current-state.json`
- Append-only readiness ledger: `ops/deploy-ledger.jsonl`
