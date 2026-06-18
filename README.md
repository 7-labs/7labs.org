# 7labs.org AI Tools for Real Work

This is the English-first MVP for `7labs.org`. It is not a generic content site and not another universal chatbot. It is a practical AI tools workbench for real tasks: AI tool discovery, developer utilities, prompt generation, document workflows, creator workflows, and long-tail utility tools.

## What is included

- English-first homepage and SEO metadata
- Tools directory organized into focused work labs
- 32 launch tools
- Local rule-based tool executor, so the MVP works without any API key
- AI Tool Finder and AI Tool Comparison Generator
- Prompt Studio: image, video, Midjourney, Stable Diffusion, product photos, YouTube thumbnails, prompt optimization, prompt translation
- Developer Lab: error explanation, regex, SQL, JSON/YAML repair, Git, cron, code explanation, cURL, TypeScript types
- Document Lab: PDF/document summary, document Q&A, research paper explanation, resume optimization, meeting notes
- Creator Lab: YouTube scripts, TikTok hooks, LinkedIn posts, product descriptions, newsletters
- Best AI for pages: coding, writing, image generation, PDF, YouTube
- Comparison pages: ChatGPT vs Gemini, Claude vs ChatGPT, Midjourney vs Stable Diffusion, Cursor vs Copilot
- Optional `/api/ai` gateway for OpenAI-compatible, OpenRouter, or Gemini model upgrades
- `/api/ai` input guards for prompt length, temperature bounds, provider timeouts, response truncation, and sanitized provider errors
- `/api/events` no-op event seam for tool runs, examples, copy actions, feedback, category filters, comparison clicks, and future newsletter capture
- SEO-ready sitemap and robots
- Absolute canonical URLs, visible FAQ, WebApplication schema, BreadcrumbList schema, WebSite schema, and Organization schema
- Article/TechArticle and ItemList schema on best-of and comparison pages
- `/best` and `/compare` hub pages for internal linking and crawl paths
- Deployment, growth, roadmap, SEO, and database starter docs
- Cloudflare Workers/OpenNext deployment config and `deploy.sh` validation/deploy/log commands

## Quick start

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production build

```bash
npm run build
npm run start
```

## Validation

```bash
npm run validate:static
npm run validate:prod
```

For this local SSD workspace, dependency installation, build, preview, and browser QA should run in the temporary OpenClaw `7labs-org` validation workspace, not on the control Mac.

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Default mode:

```text
AI_PROVIDER=none
AI_GATEWAY_ENABLED=false
```

This means the project runs on built-in local rule-based tools and does not call external models. This is the recommended launch mode for cost control and SEO validation.

Analytics and newsletter capture are also disabled by default:

```text
ANALYTICS_PROVIDER=none
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEWSLETTER_PROVIDER=none
NEWSLETTER_FORM_ENABLED=false
```

To enable model-assisted output later:

```text
AI_PROVIDER=openai
AI_GATEWAY_ENABLED=true
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4.1-mini
```

Or:

```text
AI_PROVIDER=google
AI_GATEWAY_ENABLED=true
GOOGLE_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash-lite
```

Do not enable provider-backed output on the public site until auth, quotas, caching, rate limits, provider-side output limits, and spend alerts are implemented.

## Recommended launch strategy for English users

1. Deploy the MVP as an English-first AI tools site.
2. Connect Google Search Console, Bing Webmaster Tools, Analytics, and PostHog.
3. Watch which pages get indexed and which tools get repeat usage.
4. Upgrade only the top 3-5 tools with LLM assistance.
5. Add login, credits, history, exports, and paid document workflows.
6. Grow through Product Hunt, Hacker News, Reddit, Indie Hackers, GitHub, and creator-focused SEO pages.

## Cloudflare deployment

This repo targets Cloudflare Workers with OpenNext for the full Next.js app because `app/api/*` route handlers remain in-tree. Static Pages export is only appropriate after moving API routes into a separate Worker.

```bash
npm ci --ignore-scripts --no-audit --registry=https://registry.npmjs.org
./deploy.sh validate
./deploy.sh cf-deploy
./deploy.sh cf-logs
```

The deploy script uses `npx --no-install`, so it requires `@opennextjs/cloudflare` and `wrangler` from the project dependencies and fails instead of silently installing packages during deployment. `cf-deploy` and `cf-logs` also require Wrangler authentication through `CLOUDFLARE_API_TOKEN` or an interactive `wrangler login`.

Production is live on Cloudflare. As of June 18, 2026, `https://7labs.org` returns `200`, the GitHub Actions deploy workflow is green, and `www.7labs.org` redirects to the apex domain.

## Project structure

```text
app/                  Next.js App Router pages
components/           Shared UI components
lib/tools.ts          Tool definitions
lib/toolExecutors.ts  Local rule-based executor
lib/aiCatalog.ts      AI tool recommendation catalog
lib/bestPages.ts      Best AI for pages
lib/comparePages.ts   Comparison pages
app/api/ai/route.ts   Optional AI API gateway
app/api/events/route.ts  No-op analytics and newsletter event seam
scripts/validate-static.mjs Static launch-surface validation
docs/                 Deployment, growth, SEO, and roadmap docs
database/schema.sql   Starter schema for Supabase/Postgres
```

## Next features worth building

- Authentication and credits
- Tool usage history
- Saved prompt templates
- PDF upload, parsing, and source citations
- AI tool database admin panel
- Persisted user feedback and ratings
- Browser extension
- Affiliate link management
- Stripe, Lemon Squeezy, or Paddle billing
- Email capture and newsletter automation

## Production notes

This is a product MVP, not a final production system. Before paid public launch, add:

- Terms of service and privacy policy
- API cost limits and abuse prevention
- Payment and refund logic
- File deletion and retention controls
- Human review warnings for high-risk outputs
- Compliance review for your target markets
