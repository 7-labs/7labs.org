# Product Roadmap

## Phase 1: English-first MVP tools site

Implemented in this project:

- English-first homepage and directory
- 32 working launch tools
- 5 Best AI for pages
- 4 AI tool comparison pages
- Local rule-based tool executor
- Prompt Studio
- Developer Lab
- Document Lab MVP
- Creator Lab
- SEO entry pages
- Optional AI API gateway
- Static validation script
- BreadcrumbList, WebApplication, WebSite, Organization, and visible FAQ schema
- No-op analytics and newsletter seams with `none` defaults

## Production-grade priority cut

### P0: Launch trust and conversion proof

- Resolve the public taxonomy gap: the site says seven labs, but the tool taxonomy currently has six active lab categories. Either make Model Router the seventh lab or stop claiming seven active labs until the seventh is real.
- Keep the value proposition narrow: 7labs is a workflow-prep layer that helps users choose tools, structure prompts, and avoid wasted AI credits; it is not a universal chatbot or generic AI directory.
- Turn `/api/events` from a no-op seam into a privacy-safe measurement sink before judging launch performance. Track tool run, copy, feedback, category, best/compare, and newsletter events without storing raw user inputs or generated outputs.
- Keep `AI_PROVIDER=none` for public MVP until quotas, caching, IP rate limits, provider spend alerts, and abuse controls are implemented.

### P1: Deepen the winning MVP lanes

- Prioritize AI Tool Finder, Prompt Studio, Developer Lab, and Document Lab because they already map to the homepage task lanes and visible conversion path.
- Deepen the top 10 tool pages with better examples, clearer output quality warnings, and more specific next steps after copy or feedback.
- Add source freshness rules for Best AI and comparison pages: source links, last-reviewed dates, first-hand test notes for paid recommendations, and visible caveats when pricing or limits may change.
- Add a deliberate email or waitlist path only after the capture provider, privacy copy, and expected follow-up are clear.

### P2: Expand only after usage data

- Add new pages only when they contain a working tool, distinct search intent, sample input, sample output, limitations, and a measurable next action.
- Add saved prompts, history, credits, and paid document workflows after repeat-use data identifies the 1-3 workflows worth monetizing.
- Defer browser extensions, VS Code extensions, public API, affiliate admin, and bulk page generation until the core funnel has measurable usage and trust.

## Phase 2: Launch measurement

- Tool-run and copy-event tracking
- Output feedback aggregation
- Search Console and Bing Webmaster Tools review
- Top 10 tool-page content deepening
- First newsletter provider selection
- First public launch channel tests

## Phase 3: User system

- Login and registration
- Daily free quota
- Credits
- User history
- Favorite tools
- Saved prompts
- Persisted tool ratings and feedback

## Phase 4: Paid document workflows

- PDF upload
- OCR and PDF text parsing
- Vector indexing
- Page citations
- Multi-file Q&A
- Export to Markdown, PDF, and Notion
- Team spaces
- File retention controls

## Phase 5: AI tool database

- Admin panel for AI tools
- Pricing and feature updates
- User reviews
- Affiliate links
- Best AI for draft generation with human review
- Last verified date for each tool profile

## Phase 6: Plugins and API

- Browser extension
- VS Code extension
- Public API
- Team workspace
- Zapier or Make integration
