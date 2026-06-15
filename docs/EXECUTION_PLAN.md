# 7labs.org Execution Plan (Codex Task Source of Truth)

Plan date: 2026-06-12
Owner: project owner (human). Executor: Codex (one work package per session).
Status of codebase at plan time: `validate:prod` green, 58 routes, 32 tools, 5 best pages, 4 compare pages, Cloudflare Workers/OpenNext target, production domain still parked at Dynadot (see `docs/PRODUCTION_READINESS_REVIEW.md`).

This document is the ONLY task list Codex should execute from. If a task conflicts with an idea in `README.md`, `docs/GROWTH_PLAN.md`, or `docs/PRODUCT_ROADMAP.md`, THIS file wins. Those docs are background context.

---

## 0. Hard guardrails (read before every session, non-negotiable)

These exist to prevent scope drift. Violating any of these means the work package is rejected.

1. **Do not add runtime dependencies.** `package.json` dependencies stay exactly `next`, `react`, `react-dom` unless a task below explicitly says otherwise. Dev-only tooling additions must be listed in the task.
2. **No CSS frameworks.** No Tailwind, no CSS-in-JS, no component libraries. All styling continues in `app/globals.css` using the existing custom-property design language.
3. **Never change existing URLs.** The 32 tool slugs, 5 best slugs, 4 compare slugs, and all static routes are frozen. New pages may be added; existing paths may not be renamed or removed.
4. **Repo defaults stay OFF.** `AI_PROVIDER=none`, `AI_GATEWAY_ENABLED=false`, `ANALYTICS_PROVIDER=none`, `NEXT_PUBLIC_ANALYTICS_ENABLED=false`, `NEWSLETTER_PROVIDER=none`, `NEWSLETTER_FORM_ENABLED=false` in `.env.example` and in code fallbacks. Features are enabled per-environment by the owner, never by changing repo defaults.
5. **Privacy invariant.** `/api/events` and any analytics sink must never store or transmit raw user inputs, generated outputs, emails (outside the gated newsletter path), or full IP addresses. Event payloads are: event name, tool slug, optional short enum value.
6. **English-only site content.** No i18n scaffolding, no Chinese pages.
7. **SEO page contract.** Every new indexable page must ship with: a working interactive element or genuinely useful curated content at the top, sample input AND sample output, a limitations note, visible FAQ whose text exactly matches any FAQ JSON-LD, canonical URL, BreadcrumbList JSON-LD, entry in `app/sitemap.ts`, and entry in `scripts/validate-static.mjs`.
8. **Keep the validator honest.** `scripts/validate-static.mjs` hardcodes expected slugs and routes. When adding pages, extend the expected arrays in the same commit. Never weaken or delete existing checks.
9. **Stable sitemap dates.** Only bump a page's `lastModified` when its content materially changes. Never set all dates to "now".
10. **Do not touch** `deploy.sh` auth/preflight logic, Wrangler secrets handling, or `.env*` files beyond `.env.example` documentation lines.
11. **Definition of Done for every task** (no exceptions):
    - `npm run validate:prod` passes (static validation + unit tests + production build + typecheck).
    - New logic has unit tests where the task says so.
    - Closeout reported: files changed, commands run with pass/fail output, residual risks.
12. **When uncertain, stop and ask.** Do not invent new pages, tools, copy themes, dependencies, or architecture not listed here.

Baseline command before starting any session:

```bash
npm ci --ignore-scripts --no-audit --registry=https://registry.npmjs.org
npm run validate:prod   # must be green BEFORE you change anything
```

---

## 1. Execution order and ROI rationale

| Order | WP | Theme | ROI rationale | Blocked by |
|---|---|---|---|---|
| 1 | WP-0 | Launch unblock + trust pages | Site is invisible until domain + deploy resolve; everything else compounds on a live domain | Owner: domain + Wrangler auth |
| 2 | WP-1 | Real measurement (events + web analytics) | Cannot prioritize tools/pages without usage data; cheapest highest-leverage dev work | WP-0 deploy (for prod data), code can ship before |
| 3 | WP-2 | SEO surface expansion (prompt pages, OG, llms.txt, sitemap hygiene) | Direct organic-traffic driver; site is content/SEO-led by design | None (parallel-safe with WP-1) |
| 4 | WP-3 | UI/UX + performance (search, share links, history, fonts, mobile nav) | Converts arriving traffic into repeat usage; woff2 fonts are a large CWV win | None (parallel-safe) |
| 5 | WP-4 | Git + CI/CD + E2E smoke | Protects all later work; cheap insurance | Owner: GitHub repo + token secret |
| 6 | WP-5 | AI gateway hardening (caching, rate limits, per-tool flags) | Prereq for upgrading top tools to LLM output; build only after WP-1 shows which tools earn it | WP-1 data, owner go-decision |
| 7 | WP-6 | Newsletter + feedback persistence | Monetization groundwork; pointless before traffic exists | WP-0, WP-1, owner provider choice |

WP-1, WP-2, WP-3 are independent and may run as separate parallel Codex sessions. WP-5 and WP-6 are GATED: do not start them until the owner explicitly says go.

Explicitly DEFERRED (do not build now — see section 9): blog/tutorials, model detail pages, more best-of/compare pages, auth/credits/billing, PDF upload pipeline, browser extension, admin panel, affiliate system, database-backed anything.

---

## 2. WP-0 — Launch unblock + trust pages

Goal: the app serves production traffic at `https://7labs.org` with Search Console connected, and the two missing trust pages exist.

### Owner tasks (humans only — Codex must NOT attempt these)

- O0.1 Confirm ownership of `7labs.org`. As of 2026-06-15 the domain still 302-redirects to a Dynadot for-sale page with `dyna-ns.net` nameservers. If the domain is not actually owned, STOP: every SEO task in this plan assumes this exact domain.
- O0.2 Move the domain onto a Cloudflare zone (change nameservers at the registrar).
- O0.3 Provide Wrangler auth in the deploy runtime (`CLOUDFLARE_API_TOKEN` or `wrangler login`), verify with `npx --no-install wrangler whoami`.
- O0.4 After first deploy: create Google Search Console + Bing Webmaster properties (DNS TXT verification), submit `https://7labs.org/sitemap.xml`.

### Codex tasks

**T0.1 — Custom domain routing in Wrangler config** (S)
- MODIFY `wrangler.jsonc`: add custom-domain routes for the Worker:
  ```jsonc
  "routes": [
    { "pattern": "7labs.org", "custom_domain": true },
    { "pattern": "www.7labs.org", "custom_domain": true }
  ]
  ```
- MODIFY `docs/DEPLOYMENT.md`: document that `www` must 308-redirect to apex. Implement the redirect in the worker request path only if OpenNext/Next config cannot express it; preferred: Next.js `redirects()` in `next.config.mjs` matching the `www.7labs.org` host.
- Acceptance: `validate:prod` green; `wrangler.jsonc` parses (`npx --no-install wrangler deploy --dry-run` succeeds aside from auth).

**T0.2 — Terms of Service page** (S)
- CREATE `app/terms/page.tsx`: plain-English ToS covering acceptable use, no-warranty for generated output, human-review warning for high-stakes output (resume, legal, medical), third-party trademark note for compared products, contact route. Match the prose style of `app/privacy/page.tsx`. Canonical `/terms`.
- MODIFY `components/Footer.tsx`: add Terms link next to Privacy.
- MODIFY `app/sitemap.ts`: add `/terms` to `staticRoutes`.
- MODIFY `scripts/validate-static.mjs`: add `/terms` to `expectedStaticRoutes`.
- Acceptance: `validate:prod` green; page renders with H1, canonical, breadcrumbs not required.

**T0.3 — Search-engine verification seam** (S)
- MODIFY `app/layout.tsx`: support env-gated meta verification:
  ```ts
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } : undefined
  }
  ```
- MODIFY `.env.example`: document both vars, empty by default.
- Acceptance: with vars unset, no verification meta tags render; with vars set in a local `.env.local` test, tags render. Show evidence of both states from the build/preview HTML.

**T0.4 — Post-deploy smoke script** (S)
- CREATE `scripts/smoke-prod.mjs` (node, no deps): fetch and assert `https://<SITE_URL>` 200 + `<h1`, `/robots.txt` 200 text/plain, `/sitemap.xml` 200 + `<urlset`, `/tools/regex-generator` 200, `/api/ai` POST `{}` returns JSON with `provider`, `/api/events` POST tool_run accepted. Reads `SITE_URL` env, defaults to `https://7labs.org`.
- MODIFY `package.json`: add script `"smoke:prod": "node scripts/smoke-prod.mjs"`.
- MODIFY `deploy.sh`: add a `smoke` subcommand that runs it.
- Acceptance: script exits non-zero with a clear message per failed probe; run it against the OpenNext preview (`SITE_URL=http://127.0.0.1:3337`) and show output.

---

## 3. WP-1 — Real measurement (highest dev ROI)

Goal: replace the `/api/events` no-op with a privacy-safe Workers Analytics Engine sink plus optional Cloudflare Web Analytics beacon, so launch decisions (which tools to deepen, which pages index) are data-driven. No cookies, no consent banner needed, no PII.

Architecture decision (already made — do not revisit): use Cloudflare **Workers Analytics Engine** for custom events (free tier, SQL-queryable, zero PII by construction) and **Cloudflare Web Analytics** for pageviews. No third-party analytics, no self-hosted Umami for this property.

**T1.1 — Analytics Engine binding + provider** (M)
- MODIFY `wrangler.jsonc`:
  ```jsonc
  "analytics_engine_datasets": [
    { "binding": "EVENTS", "dataset": "seven_labs_events" }
  ]
  ```
- CREATE `lib/eventSink.ts`: a server-only module exporting `recordEvent(env, payload)` where payload is the already-validated event from the route. Write one data point: `blobs: [event, toolSlug ?? "", value ?? ""]`, `doubles: [1]`, `indexes: [event]`. Defensive: wrap in try/catch, never throw to the request path.
- MODIFY `app/api/events/route.ts`: when `ANALYTICS_PROVIDER=workers-analytics`, obtain the binding via `getCloudflareContext()` from `@opennextjs/cloudflare` and call `recordEvent`. Keep the existing validation, event whitelist, and `none` no-op behavior untouched. The binding is absent in `next dev`/`next start` — code must degrade to no-op without errors there.
- MODIFY `.env.example`: document `ANALYTICS_PROVIDER=workers-analytics` as the supported value, default stays `none`.
- MODIFY `scripts/validate-static.mjs`: assert `.env.example` still ships `ANALYTICS_PROVIDER=none`.
- CREATE `tests/eventsRoute.test.ts`: unit-test the route's validation/whitelist logic with provider `none` (no binding needed): accepts whitelisted events, rejects unknown event names, rejects oversized values, never echoes raw input.
- Acceptance: `validate:prod` green incl. new tests; in OpenNext preview (`opennextjs-cloudflare preview`) a POSTed `tool_run` event returns accepted and (with the dataset bound) `wrangler` shows the dataset configured. Document the query snippet (`SELECT blob1, count() FROM seven_labs_events ...`) in `docs/DEPLOYMENT.md`.

**T1.2 — Client beacon hardening** (S)
- MODIFY `lib/analytics.ts`: send events with `navigator.sendBeacon` (fallback `fetch keepalive`), fire-and-forget, hard-capped payload, no-op unless `NEXT_PUBLIC_ANALYTICS_ENABLED=true`. Keep the exported `trackEvent` signature unchanged so call sites don't change.
- Acceptance: with the flag false (default), zero network calls (verify in preview devtools/network or by code path test); with flag true in preview, events reach `/api/events`.

**T1.3 — Cloudflare Web Analytics beacon (env-gated)** (S)
- MODIFY `app/layout.tsx`: if `NEXT_PUBLIC_CF_BEACON_TOKEN` is set, render the CF Web Analytics script tag (`https://static.cloudflareinsights.com/beacon.min.js` with `data-cf-beacon`). Unset (default) renders nothing.
- MODIFY `.env.example`: document the var.
- Acceptance: default build HTML contains no beacon script; with token set in preview, it does.

**T1.4 — Event taxonomy doc** (S)
- CREATE `docs/ANALYTICS.md`: the canonical event list (tool_run, copy_output, example_loaded, feedback_submitted, category_filter, best_compare_click, newsletter_signup), what each means, what is deliberately NOT collected, and 5 ready-to-run Analytics Engine SQL queries (top tools by runs, copy rate per tool, feedback ratio per tool, best/compare CTR, weekly trend).
- Acceptance: doc exists, events listed match the route whitelist exactly.

---

## 4. WP-2 — SEO surface expansion

Goal: add the missing prompt-library page type (the highest-intent SEO surface this site can own), per-page OG images, llms.txt, and per-page sitemap freshness — without touching existing URLs.

**T2.1 — Prompt library data + pages** (L)
- CREATE `lib/promptPages.ts`: typed data for exactly these 6 pages (slug → wrapped tool slug):
  1. `midjourney-prompts` → `midjourney-prompt-generator`
  2. `stable-diffusion-prompts` → `stable-diffusion-prompt-generator`
  3. `product-photo-prompts` → `product-photo-prompt-generator`
  4. `youtube-thumbnail-prompts` → `youtube-thumbnail-prompt-generator`
  5. `ai-video-prompts` → `video-prompt-generator`
  6. `image-prompts` → `image-prompt-generator`
  Each entry: `slug`, `title`, `metaDescription` (<155 chars), `intro`, `toolSlug`, `examples` (10–15 hand-curated complete prompts, each with `label`, `prompt`, `notes`, and where relevant `negativePrompt`), `tips` (5–8 bullets), `faq` (4–6 Q&A), `lastReviewed` (set to the authoring date), `relatedSlugs`.
  Content quality bar: examples must be concrete and usable verbatim (subject + style + lighting + composition + parameters), not template fragments. Write them from the style vocabulary already in `lib/toolExecutors.ts` (`styleMap`) so site voice stays consistent.
- CREATE `app/prompts/[slug]/page.tsx`: `generateStaticParams` from `promptPages`; layout = hero (H1, intro) → embedded `<ToolRunner tool={...}/>` for the wrapped tool → examples list with per-example Copy buttons (reuse a small client component; CREATE `components/PromptExampleList.tsx`) → tips → FAQ (visible) → related links (its tool page, 2 related prompt pages, `/prompts` hub). Metadata: canonical, title, description. JSON-LD: BreadcrumbList + FAQPage (mirroring visible FAQ only) + ItemList of examples.
- MODIFY `app/prompts/page.tsx`: add a "Prompt libraries" section linking all 6 pages (crawl path requirement).
- MODIFY `app/sitemap.ts`: include prompt pages with `lastModified` from each page's `lastReviewed`.
- MODIFY `scripts/validate-static.mjs`: add `expectedPromptPages` array with the 6 slugs, validate `lib/promptPages.ts` and sitemap coverage the same way best/compare are validated.
- CREATE `tests/promptPages.test.ts`: every entry has all required fields, metaDescription length ≤ 160, ≥10 examples, faq ≥4, toolSlug exists in `lib/tools.ts`, relatedSlugs resolve.
- Duplicate-intent guardrail: prompt pages target "[X] prompts / prompt examples" intent; tool pages target "[X] prompt generator" intent. H1s and meta descriptions must not duplicate the corresponding tool page.
- Acceptance: `validate:prod` green; route count grows by exactly 6; each page renders tool + ≥10 examples + FAQ in preview.

**T2.2 — Per-page sitemap freshness** (S)
- MODIFY `lib/tools.ts`, `lib/bestPages.ts`, `lib/comparePages.ts`: add optional `lastReviewed?: string` (ISO date). Backfill best/compare pages with their real last-review date (they render "source freshness" text already — keep consistent). Tools without the field fall back to the launch date.
- MODIFY `app/sitemap.ts`: per-entry `lastModified` from `lastReviewed ?? new Date("2026-05-31")`. No other date changes (guardrail 9).
- Acceptance: `validate:prod` green; sitemap XML in preview shows differentiated dates only where `lastReviewed` was set.

**T2.3 — llms.txt** (S)
- CREATE `app/llms.txt/route.ts`: `export const dynamic = "force-static"`; GET returns `text/plain` markdown built from `tools`, `bestPages`, `comparePages`, `promptPages`: one-line site description, then sections with absolute URLs + one-line descriptions.
- MODIFY `scripts/validate-static.mjs`: assert the route file exists.
- Acceptance: `/llms.txt` returns 200 text/plain in preview listing all page groups.

**T2.4 — Per-page OG images (verify-first)** (M)
- Step 1 (spike, do not skip): CREATE `app/tools/[slug]/opengraph-image.tsx` using `next/og` `ImageResponse` for ONE route group only; run `./deploy.sh cf-build` + OpenNext preview and verify the PNG renders on the Workers runtime. **If it fails on workerd, STOP this task**, report, and keep the existing static `app/opengraph-image.png` site-wide — do not hand-roll an alternative renderer.
- Step 2 (only if spike passes): replicate for `app/best/[slug]/`, `app/compare/[slug]/`, `app/prompts/[slug]/`. Single shared template helper CREATE `lib/ogTemplate.tsx`: dark background consistent with site palette, kicker (page type), title, `7labs.org` brand mark. Use the bundled IBM Plex/Fraunces font data via `fetch`-free local file read patterns supported by `next/og` (import the font file as ArrayBuffer); if font embedding is brittle on workerd, system fonts are acceptable.
- Acceptance: preview returns image/png at `/tools/regex-generator/opengraph-image` (and per group), `<meta property="og:image">` points at the per-page image, `validate:prod` green.

**T2.5 — Internal-link audit pass** (S)
- MODIFY `app/tools/[slug]/page.tsx`: ensure every tool page links: ≥3 related tools, its category hub, and at least one relevant `/best` or `/compare` page (add a small mapping in `lib/tools.ts` or derive from category — keep it data-driven, no per-page hardcoding).
- MODIFY `app/best/[slug]/page.tsx` and `app/compare/[slug]/page.tsx`: cross-link each best page to ≥1 comparison and vice versa where topically true.
- CREATE `tests/internalLinks.test.ts`: data-level test that every tool has ≥3 resolvable relatedSlugs and every best/compare entry's related links resolve.
- Acceptance: tests pass; spot-check 3 pages in preview.

---

## 5. WP-3 — UI/UX + performance

Goal: convert visitors into repeat users and lock in strong Core Web Vitals. No backend, no deps.

**T3.1 — woff2 fonts (biggest CWV win, ~900 KB → ~250 KB)** (S)
- Convert the 5 TTFs in `public/fonts/` to woff2 (dev-time only; use `npx -y` fonttools/wawoff2 or any offline converter — converted binaries are committed, the tool is not added to package.json).
- MODIFY `app/globals.css` (or wherever `@font-face` lives — grep first): `src: url(...woff2) format("woff2")`, keep `font-display: swap`. Delete the TTFs after the woff2 files render correctly in preview.
- MODIFY `public/_headers` if font paths are extension-matched.
- Acceptance: preview renders both families correctly (screenshot evidence), total font payload reported before/after, `validate:prod` green.

**T3.2 — Tools search + category filter** (M)
- CREATE `components/ToolSearch.tsx` (client): text input + category chips above the grid on `/tools`; filters the already-rendered tool list client-side (simple case-insensitive scoring over title/description/tags — no fuzzy-search dep). Zero-result state suggests the AI Tool Finder. Emits `category_filter` via `trackEvent`.
- MODIFY `app/tools/page.tsx`: server component passes the full tool list into the client component; the static HTML must still contain all tool links for crawlers (render the full grid in a `<noscript>` or render grid server-side and filter via hide — choose the approach that keeps all `<a href>` in the initial HTML).
- Acceptance: filtering works in preview, initial HTML still contains all 32 tool links (curl + grep evidence), keyboard accessible (input labeled, chips are buttons).

**T3.3 — Shareable prefilled tool URLs** (M)
- MODIFY `components/ToolRunner.tsx`: on mount, read `window.location.search` (inside `useEffect` — do NOT use `useSearchParams`, it would force dynamic rendering/Suspense on static pages) and prefill matching field names (validate against the tool's field list, cap value lengths, ignore unknown keys). Add a "Share prefilled link" ghost button next to Copy: builds `?field=value` URL for current values (cap total URL at 2000 chars; omit oversized textareas with a status message), copies to clipboard, fires `trackEvent({event: "copy_output", value: "share_link"})`-style event reusing the existing whitelist (extend whitelist only if needed and mirror in `/api/events` + tests).
- Acceptance: opening `/tools/regex-generator?description=match+emails` prefills the field in preview; share button produces a working URL; static rendering preserved (build output still shows the route as static).

**T3.4 — Local run history (no server)** (M)
- CREATE `components/RunHistory.tsx` (client): stores last 5 runs per tool in `localStorage` (`7labs:history:<slug>`, value = field values + first 500 chars of output + timestamp), renders a compact "Recent runs" list with Restore and Clear-all. No PII leaves the browser — state this in the UI copy.
- MODIFY `components/ToolRunner.tsx`: write history on successful run; mount `RunHistory` under the form. Guard all storage access in try/catch (private mode).
- Acceptance: run → reload → restore works in preview; clearing works; SSR build unaffected.

**T3.5 — Mobile navigation** (S)
- MODIFY `components/Header.tsx` + `app/globals.css`: at narrow widths collapse the 5 nav links into a disclosure menu. Prefer CSS-only `<details>/<summary>` or a tiny client toggle with `aria-expanded`; trap nothing, Escape closes if JS-based.
- Acceptance: 375px-wide preview screenshot shows usable nav; desktop unchanged; keyboard operable.

**T3.6 — Copy/download output formats** (S)
- MODIFY `components/ToolRunner.tsx`: next to Copy add a small "Download .md" action (Blob + anchor download, filename `<slug>-output.md`). Fires existing copy event with a distinguishing value.
- Acceptance: downloads a correct file in preview.

**T3.7 — Accessibility + CWV check (closeout task for the WP)** (S)
- Run Lighthouse (mobile) against OpenNext preview for `/`, `/tools`, one tool page, one prompt page. Targets: Performance ≥ 90, Accessibility ≥ 95, LCP < 2.5s, CLS < 0.1.
- Fix only what the report flags within existing files (contrast, tap targets, missing labels). No redesign.
- Acceptance: report scores quoted in closeout; regressions from T3.1–T3.6 fixed.

---

## 6. WP-4 — Repo, CI/CD, E2E smoke

Goal: version control + automated validation so later WPs can't silently break the site. Note: this directory is currently NOT a git repository.

### Owner tasks
- O4.1 Create the GitHub repository (private), add `CLOUDFLARE_API_TOKEN` as an Actions secret, decide branch protection.

### Codex tasks

**T4.1 — Git init + hygiene** (S)
- `git init`, verify `.gitignore` covers `.open-next/`, `.next/`, `node_modules/`, `.env*` (except `.env.example`), `tsconfig.tsbuildinfo`, `.DS_Store`; initial commit. Do NOT commit `.env.local` or any secret; scan staged files first.
- Acceptance: `git status` clean after commit; no secrets in the tree (`git grep -i "api_key\|secret\|token" -- ':!*.example' ':!docs'` reviewed).

**T4.2 — GitHub Actions: validate on PR, deploy on main** (M)
- CREATE `.github/workflows/validate.yml`: on PR + push to main → `npm ci --ignore-scripts`, `npm run validate:prod`.
- CREATE `.github/workflows/deploy.yml`: on push to main (after validate) → `./deploy.sh cf-build` then `npx --no-install wrangler deploy` with `CLOUDFLARE_API_TOKEN` from secrets; then `SITE_URL=https://7labs.org npm run smoke:prod`.
- Acceptance: workflows lint (actionlint if available, else YAML parse), dry-run documented; first real run is owner-triggered.

**T4.3 — Playwright smoke suite** (M)
- Allowed dev-dependency addition: `@playwright/test`.
- CREATE `tests/e2e/smoke.spec.ts` + `playwright.config.ts` (baseURL from `E2E_BASE_URL`, default the OpenNext preview port). 7 journeys: home renders H1; /tools shows 32 cards; run regex-generator with example → output appears → Copy enables; input edit clears stale output; best page renders with JSON-LD count; compare page renders; prompt page (after WP-2) renders tool + examples.
- MODIFY `package.json`: `"test:e2e": "playwright test"`. CI runs it against a started preview; locally it runs on the OpenClaw workspace, never on the control Mac.
- Acceptance: suite green against preview (output shown); flake-free across 2 consecutive runs.

---

## 7. WP-5 — AI gateway enablement (GATED — owner go-decision required)

Precondition gates (ALL must be true before starting): production live ≥2 weeks; WP-1 data identifies top tools by repeat usage; owner picks provider + budget; owner says "go WP-5".

Goal: allow the top 3–5 tools (chosen from data, not guessed) to optionally upgrade output via `/api/ai`, with cost and abuse controls that make the worst case boring.

**T5.1 — Cloudflare AI Gateway in front of the provider** (S)
- Config-only: route provider calls through a Cloudflare AI Gateway URL via the existing `OPENAI_BASE_URL` env (the route handler already supports base-URL override behind `ALLOW_CUSTOM_AI_BASE_URL`). Document setup + spend alerts + gateway caching in `docs/DEPLOYMENT.md`. No code change expected; if the allowlist in `app/api/ai/route.ts` blocks the gateway host, extend the allowlist explicitly to the owner's gateway hostname only.

**T5.2 — Edge caching of identical runs** (M)
- MODIFY `wrangler.jsonc`: add KV namespace binding `AI_CACHE`.
- MODIFY `app/api/ai/route.ts`: cache key = SHA-256 of (tool slug + normalized prompt + model); on hit return cached output with `x-7labs-cache: hit`; on miss store with 7-day TTL and size cap. Binding accessed via `getCloudflareContext()`; absent binding → skip caching silently.
- CREATE `tests/aiCache.test.ts` for key normalization (whitespace/case rules).
- Acceptance: preview with binding shows hit on second identical request; `validate:prod` green.

**T5.3 — IP rate limiting + daily spend stop** (M)
- MODIFY `app/api/ai/route.ts` + `lib/` helper: per-IP daily counter and a global daily counter in KV (`AI_CACHE` or dedicated `AI_QUOTA` namespace). Limits from env (`FREE_DAILY_AI_LIMIT` per IP, `AI_DAILY_GLOBAL_LIMIT` global). Over limit → 429 with friendly JSON; the client must transparently fall back to the local rule engine.
- IP source: `request.headers.get("cf-connecting-ip")`, stored only as a salted SHA-256 hash with day-bucket key, auto-expiring TTL 48h (privacy invariant).
- Acceptance: unit tests for counter key/rollover logic; manual 429 demonstration in preview with limit=2.

**T5.4 — Per-tool AI flag + graceful client fallback** (M)
- MODIFY `lib/tools.ts`: optional `aiEligible?: boolean` (set true ONLY for the tools the owner names from WP-1 data).
- MODIFY `components/ToolRunner.tsx`: when the tool is aiEligible AND `NEXT_PUBLIC_AI_ENABLED=true`, offer an "Enhanced (AI)" toggle; on run, call `/api/ai`; on any error/timeout/429 → run the local executor and label the output "Local engine result". Default OFF; the local path remains the default experience.
- Acceptance: with gateway disabled (repo default) UI shows no toggle; with preview env enabled, success and forced-failure paths both produce output; `validate:prod` green.

---

## 8. WP-6 — Newsletter + feedback persistence (GATED — owner provider choice required)

Precondition gates: production live, WP-1 shipping data, owner has chosen the email provider (recommendation: Buttondown — simple token API, double opt-in built in) and accepts its privacy policy implications.

**T6.1 — Newsletter provider adapter** (M)
- CREATE `lib/newsletter.ts`: `subscribe(email): Promise<{ok, reason?}>` with a `buttondown` implementation (`NEWSLETTER_PROVIDER=buttondown`, `BUTTONDOWN_API_KEY`); provider `none` keeps today's 501 behavior.
- MODIFY `app/api/events/route.ts` newsletter path: validate email shape server-side, call adapter, never log the email, rate-limit by IP-hash (reuse WP-5 helper or a minimal KV counter), honeypot field check.
- MODIFY `components/NewsletterCapture.tsx`: honeypot input, success/double-opt-in messaging, link to `/privacy`.
- Acceptance: provider none → 501 unchanged (test); buttondown mocked unit test for adapter; manual happy path documented against a sandbox key in preview.

**T6.2 — Feedback aggregation view** (S)
- No database. Feedback already lands in Analytics Engine (WP-1). CREATE `docs/ANALYTICS.md` addition: per-tool feedback ratio query + a monthly review checklist (which tools get deepened vs. demoted). This is an owner ritual, not code.

---

## 9. Deferred backlog — explicitly DO NOT BUILD in this plan cycle

Listed so Codex never "helpfully" starts them:

- Blog/tutorial system (`/blog/*`) — only after current surfaces index and WP-2 pages prove out.
- Model detail pages (`/models/[slug]`) — pricing/limits churn too fast; high maintenance, low trust if stale. The `/models` hub stays as-is.
- Additional best-of/compare pages — gated on Search Console showing the existing 9 indexed cleanly (owner decision with data).
- Auth, credits, billing, Stripe/Paddle — Phase 3+ of `docs/PRODUCT_ROADMAP.md`.
- PDF upload/parsing/RAG, vector anything.
- Admin panel, affiliate system, browser/VS Code extensions, public API.
- Supabase/Postgres wiring (`database/schema.sql` stays a starter doc).
- Dark mode, redesigns, CSS framework migrations.

---

## 10. Codex session protocol

1. Read this file, `README.md`, `docs/PRODUCTION_READINESS_REVIEW.md` first. Read any file you will modify in full before editing.
2. One work package (or one large task) per session. State which task IDs you are executing.
3. Run the baseline (`npm ci ...` + `npm run validate:prod`) BEFORE changes; if baseline is red, stop and report — do not fix unrelated breakage silently.
4. Follow guardrails in section 0. If a task seems to require breaking one, stop and report instead.
5. Builds/preview/E2E run in the OpenClaw test workspace (`~/test-workspace/7labs-org/`), not on the control Mac.
6. Closeout every session: task IDs done, files created/modified, commands run with pass/fail evidence, deviations from this plan (should be none), residual risks.
7. Update the status table below in the same commit as the work.

## 11. Status tracker

| Task | Status | Date | Evidence |
|---|---|---|---|
| T0.1–T0.4 | Codex tasks validated; owner launch blockers remain | 2026-06-12 | OpenClaw `npm ci` pass; `npm run validate:prod` pass; `./deploy.sh cf-build` pass; `wrangler deploy --dry-run` pass with `EVENTS` + `ASSETS`; OpenNext preview smoke pass; default HTML has no verification/beacon tags; fake verification/beacon env renders tags. Production smoke still blocked because `7labs.org` redirects to Dynadot |
| T1.1–T1.4 | code implemented and preview-validated; production data pending deploy | 2026-06-12 | `wrangler.jsonc` binds `EVENTS` to `seven_labs_events`; `/api/events` accepts `workers-analytics` in OpenNext preview with binding; `docs/ANALYTICS.md` event taxonomy validated against route whitelist; `trackEvent` unit tests cover disabled, sendBeacon, and fetch fallback; `npm run validate:prod` pass on OpenClaw |
| T2.1–T2.5 | implemented and preview-validated | 2026-06-12 | Added 6 prompt-library pages, `llms.txt`, per-page sitemap freshness, per-page OG images for tools/best/compare/prompts, and internal-link tests. OpenClaw `npm run validate:prod` pass: 16 tests, 113 static pages. `./deploy.sh cf-build` pass; `wrangler deploy --dry-run` pass. workerd preview probes: `/prompts/midjourney-prompts` 200 with 10 examples, `/llms.txt` 200 text/plain, prompt sitemap date `2026-06-12`, representative OG routes 200 `image/png`. Remote Playwright desktop/mobile QA passed with no horizontal overflow. |
| T3.1–T3.7 | implemented and preview-validated; production CWV confirmation pending | 2026-06-12 | Converted 5 TTF fonts to woff2 and removed TTF assets; `/tools` now has static HTML with all 32 tool links plus client search/category filters; tool pages support safe prefilled URLs, share links, local run history, and `.md` downloads; mobile nav uses a CSS disclosure menu. OpenClaw baseline and final `npm run validate:prod` pass: 22 tests, 113 static pages, typecheck pass. `./deploy.sh cf-build` pass; `wrangler deploy --dry-run` pass with `EVENTS` + `ASSETS`. Remote Playwright QA passed: 32 initial tool links, filtering, prefill, share URL, download filename, history restore, mobile nav, and no 390px overflow. Lighthouse actual-throttling mobile pass on `/`, `/tools`, `/tools/regex-generator`, `/prompts/midjourney-prompts`: Performance 100 and Accessibility 100 on all four routes, LCP 77–97ms, CLS < 0.001, TBT 0. Residual: default simulated mobile Lighthouse on local workerd preview still reports LCP >2.5s, so production CWV should be rechecked after deploy. |
| T4.1–T4.3 | implemented and committed; owner GitHub setup still pending | 2026-06-12 | Initialized git, tightened `.gitignore` for `.env*` with `.env.example` exception, staged only repo files, scanned staged content before commit, and created initial commit `WP-4: add CI and E2E smoke`. Added `.github/workflows/validate.yml` for PR/main validation plus OpenNext preview E2E, `.github/workflows/deploy.yml` gated on successful Validate workflow runs on main, `playwright.config.ts`, and 7 Playwright smoke journeys. Added `@playwright/test` dev dependency and `npm run test:e2e`. Validation: local `npm run validate:static` pass; workflow YAML parse pass (`actionlint` not installed); OpenClaw `npm ci && npm run validate:prod` pass; final OpenClaw `npm run validate:prod` pass with 22 tests, 113 static pages, typecheck pass; `./deploy.sh cf-build` pass; `wrangler deploy --dry-run` pass with `EVENTS` + `ASSETS`. E2E against OpenNext preview passed twice consecutively: 7/7, then 7/7. |
| T5.x | GATED | | awaiting owner go + WP-1 data |
| T6.x | GATED | | awaiting owner provider choice |
| O0.1 domain | **BLOCKER** | 2026-06-15 probe | `7labs.org` still parked at Dynadot: NS `ns1.dyna-ns.net` / `ns2.dyna-ns.net`, A `198.18.2.234`, HTTPS 302 to `https://forsale.dynadot.com/7labs.org?drefid=2071` |
| O0.3 wrangler auth | **BLOCKER** | 2026-06-15 preflight | `deploy-readiness-preflight.py` verdict `blocked`: no usable Cloudflare deploy auth path proven; GitHub repo/secret also not proven in this handoff |

## 12. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Domain not actually owned / not recoverable | unknown | fatal to SEO plan | O0.1 first; if lost, owner picks new domain → single env change (`NEXT_PUBLIC_SITE_URL`) + this plan still holds |
| `next/og` ImageResponse unsupported quirks on workerd | medium | T2.4 only | spike-first design; fallback = keep static OG |
| Prompt pages cannibalize tool pages in SERP | low-medium | dilution | distinct intent/H1/meta enforced in T2.1; monitor in GSC |
| Analytics Engine binding absent in dev breaks routes | low | broken local dev | degrade-to-noop requirement in T1.1 |
| Codex adds dependencies or reskins UI | medium | churn, bundle bloat | guardrails 1–2; reject WP in review |
| AI gateway cost runaway when enabled | low (gated) | money | WP-5 caching + per-IP + global daily stop + AI Gateway spend alerts; defaults stay off |
| Validator counts drift from real pages | low | false-green CI | guardrail 8: same-commit validator updates |
