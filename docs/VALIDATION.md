# Validation Notes

This English-first build should be validated in the temporary OpenClaw `7labs-org` workspace with:

```bash
npm ci --ignore-scripts --no-audit --registry=https://registry.npmjs.org
npm audit --audit-level=moderate
npm run validate:prod
```

Required pass conditions:

- `npm audit`: 0 moderate-or-higher vulnerabilities.
- `npm run validate:static`: confirms 32 tools, 5 best-of pages, 4 comparison pages, `/best` and `/compare` hubs, executor coverage, stable sitemap date, `/api/` robots exclusion, no Chinese text in active source/docs, no obvious secrets, no private registry URLs, OpenNext/Wrangler config, static cache headers, expected schemas, and disabled production defaults.
- `npm run test:unit`: runs the local executor tests and confirms all 32 public tools return real Markdown output instead of a missing-executor placeholder.
- `npm run validate:prod`: runs static validation, unit tests, Next build, and source typecheck.
- `./deploy.sh cf-build`: runs the full production validation chain, npm audit, Next build, and OpenNext Cloudflare bundle generation.
- Browser QA: desktop and mobile routes for `/`, key tool pages, `/best`, representative compare pages, `/sitemap.xml`, and `/robots.txt`.
- Rendered HTML: canonical tags, OpenGraph/Twitter metadata including social image, visible FAQ matching FAQ schema, WebApplication, BreadcrumbList, Article/TechArticle, ItemList, WebSite, and Organization JSON-LD.
- Production URL QA: `https://7labs.org/`, `/robots.txt`, `/sitemap.xml`, and one representative tool page return the deployed 7labs app, not registrar or parked-domain HTML.

Notes:

- Default mode is `AI_PROVIDER=none` and `AI_GATEWAY_ENABLED=false`, so the public launch cannot accidentally become a paid-model proxy.
- `/api/ai` and `/api/events` intentionally do not declare the Next edge-runtime export because OpenNext Cloudflare does not support it.
- `/api/events` returns a safe no-op response while `ANALYTICS_PROVIDER=none`; client beacons stay disabled until `NEXT_PUBLIC_ANALYTICS_ENABLED=true`.
- Connect LLM providers only after measuring which tools get repeat usage.
- Do not fall back to local dependency installation, local preview, or local browser QA for this SSD workspace.
