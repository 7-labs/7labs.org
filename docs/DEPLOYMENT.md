# Deployment Guide

## 1. Launch contract

The production target is a Next.js App Router site with route handlers kept in the repo but public model calls disabled by default. The recommended Cloudflare target is Workers with the OpenNext adapter.

Cloudflare Pages static export is not the default contract because this project contains `app/api/*` route handlers. Use static Pages only after removing or splitting the API routes into a separate Worker.

## 2. Required production defaults

Set these before public launch:

```text
NEXT_PUBLIC_SITE_URL=https://7labs.org
AI_PROVIDER=none
AI_GATEWAY_ENABLED=false
AI_ALLOW_CLIENT_SYSTEM_PROMPT=false
ALLOW_CUSTOM_AI_BASE_URL=false
ANALYTICS_PROVIDER=none
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_CF_BEACON_TOKEN=
NEWSLETTER_PROVIDER=none
NEWSLETTER_FORM_ENABLED=false
```

Do not enable `AI_PROVIDER=openai`, `AI_PROVIDER=openrouter`, or `AI_PROVIDER=google` until auth, quotas, caching, rate limits, provider-side token limits, and spend alerts are implemented.

## 3. Cloudflare Workers deployment

Install dependencies in the deployment runtime, not in the local SSD workspace:

```bash
npm ci --ignore-scripts --no-audit --registry=https://registry.npmjs.org
```

Validate and deploy:

```bash
./deploy.sh validate
./deploy.sh cf-deploy
./deploy.sh cf-logs
```

The Cloudflare config lives in `wrangler.jsonc` and uses `.open-next/worker.js` plus `.open-next/assets`. The deploy script uses `npx --no-install` so it fails fast if `@opennextjs/cloudflare` or `wrangler` is missing instead of silently installing packages during deployment.

The OpenNext adapter config lives in `open-next.config.ts`. Keep `public/_headers` so generated `_next/static` assets receive long-lived immutable cache headers.

The Worker is configured with custom-domain routes for both `7labs.org` and `www.7labs.org`. Cloudflare must have an active zone for the domain before those routes can serve traffic.

`www.7labs.org` must 308-redirect to the apex domain. This is implemented in `middleware.ts` so the redirect preserves the full pathname and query string on the Workers runtime:

```text
https://www.7labs.org/:path* -> https://7labs.org/:path*
```

For non-interactive deployment, the runtime must have Cloudflare authentication available:

```bash
export CLOUDFLARE_API_TOKEN=...
```

Alternatively, run `wrangler login` in an interactive OpenClaw shell before deploying. `./deploy.sh cf-deploy` and `./deploy.sh cf-logs` both stop at auth preflight when Wrangler is not authenticated.

## 4. Domain preflight

Before submitting Search Console or sitemap URLs, verify the production domain serves this app:

```bash
curl -I -L https://7labs.org
curl -fsS https://7labs.org/robots.txt
curl -fsS https://7labs.org/sitemap.xml
```

Expected:

- `/` returns `200` from the deployed 7labs app, not a registrar or parked-domain page.
- `/robots.txt` is plain text and includes the sitemap.
- `/sitemap.xml` is XML and includes `/tools`, `/best`, `/compare`, tool pages, best guides, and comparison pages.
- Canonical URLs use `https://7labs.org`.
- `https://www.7labs.org/*` returns a permanent redirect to the matching apex URL.

Current read-only probe on June 15, 2026 confirmed `https://7labs.org` still redirects to Dynadot's for-sale page, with nameservers `ns1.dyna-ns.net` and `ns2.dyna-ns.net` and A record `198.18.2.234`. DNS/registrar routing must be fixed before SEO launch validation can pass. Future unblock work should start from `PROJECT_STATE.md` and `ops/current-state.json`.

## 5. Launch checklist

- Set verification meta values only after the owner has Search Console and Bing Webmaster tokens:

```text
NEXT_PUBLIC_GSC_VERIFICATION=
NEXT_PUBLIC_BING_VERIFICATION=
```

With both values empty, no verification meta tags render.

- Verify Google Search Console.
- Verify Bing Webmaster Tools.
- Submit sitemap: `https://7labs.org/sitemap.xml`.
- Choose analytics only after launch goals are clear; keep both `ANALYTICS_PROVIDER=none` and `NEXT_PUBLIC_ANALYTICS_ENABLED=false` until configured intentionally.
- Add error monitoring.
- Confirm canonical URLs and robots rules.
- Confirm BreadcrumbList, WebApplication, FAQPage, Article/TechArticle, ItemList, WebSite, and Organization schema in rendered HTML.
- Test mobile layouts.
- Configure caching and rate limits.
- Confirm output feedback buttons on tool pages.
- Confirm newsletter capture stays hidden while `NEWSLETTER_PROVIDER=none` or `NEWSLETTER_FORM_ENABLED=false`.
- Confirm `/api/ai` returns the disabled-gateway response unless `AI_GATEWAY_ENABLED=true` is intentionally set in a protected environment.

Run the post-deploy smoke script against the production URL or a preview URL:

```bash
SITE_URL=https://7labs.org npm run smoke:prod
SITE_URL=http://127.0.0.1:3337 ./deploy.sh smoke
```

## 6. Analytics

Custom product events use Workers Analytics Engine when the owner enables:

```text
ANALYTICS_PROVIDER=workers-analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

The Worker event sink is optional. Keep `ANALYTICS_PROVIDER=none` and ship without an `EVENTS` binding until the Cloudflare account has Workers Analytics Engine enabled. After that, add an `analytics_engine_datasets` binding named `EVENTS` in `wrangler.jsonc`; Workers Analytics Engine creates the dataset automatically after the first write from a deployed Worker with the binding configured.

Cloudflare Web Analytics pageviews are separately gated by:

```text
NEXT_PUBLIC_CF_BEACON_TOKEN=
```

Leave the token empty to render no beacon script.

Quick query for top events:

```sql
SELECT blob1 AS event, count() AS events
FROM seven_labs_events
WHERE timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY event
ORDER BY events DESC
```

See `docs/ANALYTICS.md` for the canonical event taxonomy and owner review queries.

## 7. API cost controls

Before enabling external models:

- Add IP rate limits.
- Add daily quotas for logged-in users.
- Cache identical inputs.
- Enforce token limits by tool.
- Keep `/api/ai` body caps, prompt caps, content-type checks, provider allowlists, provider-side output token limits, provider timeouts, response truncation, and sanitized error handling enabled.
- Charge image generation per output.
- Charge long documents by page, file size, or token usage.
- Reserve premium models for paid workflows.

## 8. DNS recommendation

- Point root domain `7labs.org` to the main site.
- Redirect `www.7labs.org` to root domain.
- Reserve `api.7labs.org` for future API services.
- Reserve `app.7labs.org` for logged-in workspace features.
