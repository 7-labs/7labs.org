# Production Readiness Review

Review date: 2026-06-03

## Executive status

The application code is ready for a Cloudflare Workers/OpenNext launch candidate. Clean runtime validation, unit tests, production build, OpenNext bundle generation, Workers runtime preview, browser QA, API probes, and SEO endpoint probes all passed.

Production deployment is not complete because the current Cloudflare runtime is not authenticated and the public domain is still parked at Dynadot. Do not mark SEO launch complete until both external blockers are resolved.

## What changed

- Product positioning: tightened the site around practical AI workflows and removed the active "seven labs" mismatch while the product currently exposes six tool categories.
- Frontend: added `/best` and `/compare` hubs, improved navigation, fixed stale generated output after input changes, added reduced-motion handling, disabled button states, mobile table wrapping, and hidden live status messaging.
- Backend/API: hardened `/api/ai` with JSON content-type checks, body caps, prompt caps, provider gating, base URL allowlisting, output token limits, provider timeouts, response truncation, and sanitized errors.
- Events/newsletter: kept analytics disabled by default, added explicit newsletter feature gating, and prevented silent email capture without a provider.
- SEO/content: added canonical metadata, PNG social image routing, Article/TechArticle JSON-LD, ItemList JSON-LD, better breadcrumbs, source freshness text, and crawlable `/best` and `/compare` hubs.
- Deployment: added Cloudflare Workers/OpenNext config, static asset cache headers, deploy preflight scripts, auth checks, and generated bitmap metadata assets.
- Database: added starter production constraints, indexes, and RLS posture notes for future Supabase/Postgres use.
- Testing: added unit coverage for all 32 local tool executors and expanded static validation to cover deployment config, executor coverage, disabled production defaults, and generated-output exclusions.

## P0 before production SEO launch

- Point `7labs.org` at the deployed app. Current probe returned a 302 to Dynadot's for-sale page and nameservers under `dyna-ns.net`.
- Authenticate Wrangler in the deployment runtime with an interactive login or `CLOUDFLARE_API_TOKEN`.
- Deploy the Worker after auth, then run `./deploy.sh cf-logs` and browser QA against the real public URL.
- Keep `AI_PROVIDER=none` and `AI_GATEWAY_ENABLED=false` until auth, rate limits, quotas, caching, spend alerts, and paid-user boundaries exist.

## P1 after launch

- Add Search Console and Bing Webmaster Tools after the public domain serves this app.
- Add a real analytics provider only when the event taxonomy is ready.
- Add persisted tool feedback and run repeat-usage analysis before turning more tools into provider-backed AI workflows.
- Add Terms of Service, final privacy policy, and high-risk-output disclaimers.
- Add source update workflow for best-of and comparison pages.

## P2 growth backlog

- Expand from 5 best-of pages and 4 comparison pages only after the current pages index cleanly.
- Add affiliate and pricing data only with last-checked dates and source links.
- Add account, saved history, exports, credits, and billing after repeat usage is proven.
- Add document upload with parsing, page citations, retention controls, and deletion controls.
- Add programmatic OG image generation for each guide and comparison page.

## Validation evidence

Local source validation:

```bash
npm run validate:static
```

Result:

```text
ok=true, tools=32, bestPages=5, comparePages=4, filesChecked=50
```

OpenClaw clean dependency and production validation:

```bash
npm ci --ignore-scripts --no-audit --fund=false --registry=https://registry.npmjs.org
./deploy.sh cf-build
```

Result:

```text
npm run validate:static: pass
npm run test:unit: 2 tests pass
next build: pass, 58 app routes generated
npm run typecheck:source: pass
npm audit --audit-level=moderate: 0 vulnerabilities
opennextjs-cloudflare build: pass, .open-next/worker.js generated
```

Workers runtime preview:

```bash
npx --no-install opennextjs-cloudflare preview --port 3337 --ip 127.0.0.1
```

Browser QA result:

```text
Desktop home: 200, title present, H1 present, 2 JSON-LD scripts, no visible text overflow
Mobile home: 200, title present, H1 present, 2 JSON-LD scripts, no visible text overflow
Tool page: 200, 5 JSON-LD scripts, no visible text overflow
Best hub: 200, 4 JSON-LD scripts, no visible text overflow
Compare page: 200, 5 JSON-LD scripts, no visible text overflow
Tool interaction: generated output, Copy enabled after run, old result cleared after input edit
```

API and SEO preview probes:

```text
POST /api/ai with JSON: provider=none, no external model call
POST /api/ai with text/plain: 415
POST /api/events tool_run: provider=none, accepted=true
POST /api/events newsletter_signup: 501 while newsletter is disabled
GET /robots.txt: 200 text/plain
GET /sitemap.xml: 200 XML with production canonical URLs
GET /opengraph-image.png: 200 image/png
GET /_next/static/*: cache-control public,max-age=31536000,immutable
```

Deployment blockers:

```text
./deploy.sh cf-deploy: blocked at Wrangler auth preflight
./deploy.sh cf-logs: blocked at Wrangler auth preflight
curl -I -L https://7labs.org: 302 to https://forsale.dynadot.com/7labs.org?drefid=2071
DNS: 7labs.org resolves through dyna-ns.net nameservers
```

## Launch commands after blockers are fixed

```bash
npm ci --ignore-scripts --no-audit --registry=https://registry.npmjs.org
./deploy.sh validate
./deploy.sh cf-deploy
./deploy.sh cf-logs
curl -I -L https://7labs.org
curl -fsS https://7labs.org/robots.txt
curl -fsS https://7labs.org/sitemap.xml
```
