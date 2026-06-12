import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const expectedTools = [
  "ai-tool-finder",
  "ai-tool-comparison-generator",
  "image-prompt-generator",
  "video-prompt-generator",
  "midjourney-prompt-generator",
  "stable-diffusion-prompt-generator",
  "product-photo-prompt-generator",
  "youtube-thumbnail-prompt-generator",
  "prompt-optimizer",
  "prompt-translator",
  "error-explainer",
  "regex-generator",
  "sql-generator",
  "json-fixer",
  "yaml-fixer",
  "git-command-generator",
  "cron-generator",
  "code-explainer",
  "api-to-curl-converter",
  "typescript-type-generator",
  "pdf-summarizer",
  "chat-with-pdf",
  "research-paper-explainer",
  "resume-optimizer",
  "meeting-notes-generator",
  "youtube-script-generator",
  "tiktok-hook-generator",
  "linkedin-post-generator",
  "product-description-generator",
  "newsletter-outline-generator",
  "timestamp-converter",
  "text-cleanup-tool"
];
const expectedBest = [
  "best-ai-for-coding",
  "best-ai-for-writing",
  "best-ai-for-image-generation",
  "best-ai-for-pdf",
  "best-ai-for-youtube"
];
const expectedCompare = [
  "chatgpt-vs-gemini",
  "claude-vs-chatgpt",
  "midjourney-vs-stable-diffusion",
  "cursor-vs-copilot"
];
const expectedPromptPages = [
  "midjourney-prompts",
  "stable-diffusion-prompts",
  "product-photo-prompts",
  "youtube-thumbnail-prompts",
  "ai-video-prompts",
  "image-prompts"
];
const expectedStaticRoutes = ["", "/tools", "/best", "/compare", "/prompts", "/models", "/roadmap", "/privacy", "/terms"];
const expectedAnalyticsEvents = [
  "tool_run",
  "example_loaded",
  "copy_output",
  "feedback_submitted",
  "category_filter",
  "best_compare_click",
  "newsletter_signup"
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function arrayBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Missing marker: ${marker}`);
  const assignmentIndex = source.indexOf("=", markerIndex);
  let start = source.indexOf("[", assignmentIndex);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unclosed array for marker: ${marker}`);
}

function objectBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Missing marker: ${marker}`);
  let start = source.indexOf("{", markerIndex);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unclosed object for marker: ${marker}`);
}

function extractSlugs(block) {
  return [...block.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]);
}

function sameList(label, actual, expected) {
  const missing = expected.filter((slug) => !actual.includes(slug));
  const extra = actual.filter((slug) => !expected.includes(slug));
  if (actual.length !== expected.length || missing.length || extra.length) {
    fail(`${label} mismatch: expected ${expected.length}, got ${actual.length}; missing=${missing.join(",")}; extra=${extra.join(",")}`);
  }
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".open-next", ".wrangler", ".git"].includes(entry.name)) continue;
    if (entry.name === ".DS_Store" || entry.name === "tsconfig.tsbuildinfo") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const toolSource = read("lib/tools.ts");
const executorSource = read("lib/toolExecutors.ts");
const bestSource = read("lib/bestPages.ts");
const compareSource = read("lib/comparePages.ts");
const promptSource = read("lib/promptPages.ts");
const toolSlugs = extractSlugs(arrayBlock(toolSource, "const baseTools"));
const bestSlugs = extractSlugs(arrayBlock(bestSource, "export const bestPages"));
const compareSlugs = extractSlugs(arrayBlock(compareSource, "export const comparePages"));
const promptSlugs = extractSlugs(arrayBlock(promptSource, "export const promptPages"));
sameList("tools", toolSlugs, expectedTools);
sameList("best pages", bestSlugs, expectedBest);
sameList("compare pages", compareSlugs, expectedCompare);
sameList("prompt pages", promptSlugs, expectedPromptPages);

const detailKeys = [...objectBlock(toolSource, "const toolLaunchDetails").matchAll(/"([^"]+)":\s*detail\(/g)].map((match) => match[1]);
sameList("tool launch details", detailKeys, expectedTools);
const executorCases = [...executorSource.matchAll(/case "([^"]+)":\s*return/g)].map((match) => match[1]);
sameList("tool executors", executorCases, expectedTools);

const sourceFiles = walk(root).filter((file) => /\.(ts|tsx|mjs|js|json|md|css|svg)$/.test(file));
for (const file of sourceFiles) {
  const relative = path.relative(root, file);
  const content = fs.readFileSync(file, "utf8");
  if (/[\u3400-\u9FFF]/.test(content)) fail(`Chinese text found in ${relative}`);
  if (relative !== "scripts/validate-static.mjs" && /(sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|OPENAI_API_KEY=sk-|GOOGLE_API_KEY=AIza)/.test(content)) {
    fail(`Possible secret value found in ${relative}`);
  }
  if (/runtime\s*=\s*["']edge["']/.test(content)) {
    fail(`OpenNext Cloudflare does not support edge runtime declarations: ${relative}`);
  }
  if (/artifactory|verdaccio|npm\.pkg\.github\.com/.test(content) && relative !== "scripts/validate-static.mjs") {
    fail(`Unexpected private/internal URL hint found in ${relative}`);
  }
}

const lock = JSON.parse(read("package-lock.json"));
for (const [pkg, meta] of Object.entries(lock.packages || {})) {
  if (meta && typeof meta === "object" && typeof meta.resolved === "string" && !meta.resolved.startsWith("https://registry.npmjs.org/")) {
    fail(`Non-public registry URL for ${pkg}: ${meta.resolved}`);
  }
}

const sitemap = read("app/sitemap.ts");
if (!sitemap.includes('new Date("2026-05-31")')) fail("sitemap lastModified must be stable 2026-05-31");
if (/new Date\(\s*\)/.test(sitemap)) fail("sitemap must not use new Date() without a stable value");
for (const route of expectedStaticRoutes) {
  const routeText = route ? `"${route}"` : '""';
  if (!sitemap.includes(routeText)) fail(`sitemap is missing static route ${route || "/"}`);
}
if (!sitemap.includes("promptPages")) fail("sitemap must include prompt detail pages from lib/promptPages.ts");

const robots = read("app/robots.ts");
if (!robots.includes('disallow: "/api/"')) fail("robots.ts must disallow /api/");
if (!robots.includes("sitemap:")) fail("robots.ts must expose sitemap");

const envExample = read(".env.example");
if (!envExample.includes("AI_PROVIDER=none")) fail(".env.example must default AI_PROVIDER=none");
if (!envExample.includes("AI_GATEWAY_ENABLED=false")) fail(".env.example must default AI_GATEWAY_ENABLED=false");
if (!envExample.includes("ALLOW_CUSTOM_AI_BASE_URL=false")) fail(".env.example must default ALLOW_CUSTOM_AI_BASE_URL=false");
if (!envExample.includes("ANALYTICS_PROVIDER=none")) fail(".env.example must default ANALYTICS_PROVIDER=none");
if (!envExample.includes("workers-analytics")) fail(".env.example must document workers-analytics as the supported analytics provider");
if (!envExample.includes("NEXT_PUBLIC_ANALYTICS_ENABLED=false")) fail(".env.example must default NEXT_PUBLIC_ANALYTICS_ENABLED=false");
if (!envExample.includes("NEXT_PUBLIC_CF_BEACON_TOKEN=")) fail(".env.example must document NEXT_PUBLIC_CF_BEACON_TOKEN with an empty default");
if (!envExample.includes("NEWSLETTER_PROVIDER=none")) fail(".env.example must default NEWSLETTER_PROVIDER=none");
if (!envExample.includes("NEWSLETTER_FORM_ENABLED=false")) fail(".env.example must default NEWSLETTER_FORM_ENABLED=false");

const pkg = JSON.parse(read("package.json"));
if (pkg.scripts?.["validate:static"] !== "node scripts/validate-static.mjs") fail("package.json missing validate:static script");
if (!pkg.scripts?.["validate:prod"]?.includes("npm run validate:static")) fail("package.json missing validate:prod chain");
if (!pkg.scripts?.["validate:prod"]?.includes("npm run test:unit")) fail("package.json validate:prod must run unit tests");
if (pkg.scripts?.["test:e2e"] !== "playwright test") fail("package.json missing test:e2e script");
if (pkg.dependencies?.next !== "^16.2.6") fail("next dependency must remain ^16.2.6");
if (pkg.dependencies?.react !== "^19.2.1") fail("react dependency must remain ^19.2.1");
if (pkg.dependencies?.["react-dom"] !== "^19.2.1") fail("react-dom dependency must remain ^19.2.1");
if (pkg.devDependencies?.["@opennextjs/cloudflare"] !== "^1.19.11") fail("package.json missing @opennextjs/cloudflare dev dependency");
if (!pkg.devDependencies?.["@playwright/test"]) fail("package.json missing @playwright/test dev dependency for WP-4 E2E smoke");
if (pkg.devDependencies?.wrangler !== "^4.97.0") fail("package.json missing wrangler dev dependency");
if (pkg.devDependencies?.tsx !== "^4.22.4") fail("package.json missing tsx dev dependency");
if (!fs.existsSync(path.join(root, "playwright.config.ts"))) fail("playwright.config.ts is required for WP-4 E2E smoke");
if (!fs.existsSync(path.join(root, "tests/e2e/smoke.spec.ts"))) fail("tests/e2e/smoke.spec.ts is required for WP-4 E2E smoke");
if (!fs.existsSync(path.join(root, ".github/workflows/validate.yml"))) fail(".github/workflows/validate.yml is required for WP-4 CI");
if (!fs.existsSync(path.join(root, ".github/workflows/deploy.yml"))) fail(".github/workflows/deploy.yml is required for WP-4 deploy CI");
const validateWorkflow = read(".github/workflows/validate.yml");
const deployWorkflow = read(".github/workflows/deploy.yml");
if (!validateWorkflow.includes("npm run validate:prod")) fail("validate workflow must run validate:prod");
if (!validateWorkflow.includes("npm run test:e2e")) fail("validate workflow must run Playwright smoke");
if (!validateWorkflow.includes("opennextjs-cloudflare preview")) fail("validate workflow must run E2E against an OpenNext preview");
if (!deployWorkflow.includes("workflow_run")) fail("deploy workflow must wait for the Validate workflow");
if (!deployWorkflow.includes("CLOUDFLARE_API_TOKEN")) fail("deploy workflow must use the CLOUDFLARE_API_TOKEN secret");
if (!deployWorkflow.includes("wrangler deploy")) fail("deploy workflow must run wrangler deploy");
if (!deployWorkflow.includes("npm run smoke:prod")) fail("deploy workflow must run production smoke");

if (!fs.existsSync(path.join(root, "open-next.config.ts"))) fail("open-next.config.ts is required for Cloudflare/OpenNext builds");
const openNextConfig = read("open-next.config.ts");
if (!openNextConfig.includes("defineCloudflareConfig")) fail("open-next.config.ts must use defineCloudflareConfig");
const wranglerConfig = read("wrangler.jsonc");
if (!wranglerConfig.includes('"main": ".open-next/worker.js"')) fail("wrangler.jsonc must point to .open-next/worker.js");
if (!wranglerConfig.includes('"directory": ".open-next/assets"')) fail("wrangler.jsonc must point assets to .open-next/assets");
if (!wranglerConfig.includes('"nodejs_compat"')) fail("wrangler.jsonc must enable nodejs_compat");
if (!wranglerConfig.includes('"binding": "EVENTS"')) fail("wrangler.jsonc must bind Workers Analytics Engine as EVENTS");
if (!wranglerConfig.includes('"dataset": "seven_labs_events"')) fail("wrangler.jsonc must use the seven_labs_events Analytics Engine dataset");
const headers = read("public/_headers");
if (!headers.includes("/_next/static/*")) fail("public/_headers must cache Next static assets");
if (!headers.includes("max-age=31536000")) fail("public/_headers must set long-lived static asset cache");
const fontFiles = fs.readdirSync(path.join(root, "public/fonts"));
if (fontFiles.some((file) => file.endsWith(".ttf"))) fail("public/fonts must not ship TTF files after WP-3 font conversion");
for (const fontFile of ["fraunces-700.woff2", "ibm-plex-sans-400.woff2", "ibm-plex-sans-500.woff2", "ibm-plex-sans-600.woff2", "ibm-plex-sans-700.woff2"]) {
  if (!fontFiles.includes(fontFile)) fail(`Missing converted font file: public/fonts/${fontFile}`);
}

if (!fs.existsSync(path.join(root, "app/best/page.tsx"))) fail("/best hub page is missing");
if (!fs.existsSync(path.join(root, "app/compare/page.tsx"))) fail("/compare hub page is missing");
if (!fs.existsSync(path.join(root, "app/prompts/[slug]/page.tsx"))) fail("/prompts/[slug] detail page is missing");
if (!fs.existsSync(path.join(root, "components/PromptExampleList.tsx"))) fail("components/PromptExampleList.tsx is required for prompt example copy buttons");
if (!fs.existsSync(path.join(root, "components/ToolSearch.tsx"))) fail("components/ToolSearch.tsx is required for tools search/filter");
if (!fs.existsSync(path.join(root, "components/RunHistory.tsx"))) fail("components/RunHistory.tsx is required for local run history");
if (!fs.existsSync(path.join(root, "app/llms.txt/route.ts"))) fail("/llms.txt route is missing");
if (!fs.existsSync(path.join(root, "lib/ogTemplate.tsx"))) fail("lib/ogTemplate.tsx is required for per-page OG images");
for (const routeGroup of ["tools", "best", "compare", "prompts"]) {
  if (!fs.existsSync(path.join(root, `app/${routeGroup}/[slug]/opengraph-image.tsx`))) {
    fail(`/${routeGroup}/[slug]/opengraph-image.tsx is missing`);
  }
}
const homePage = read("app/page.tsx");
if (!homePage.includes("canonical: siteUrl")) fail("homepage must define canonical metadata");
if (homePage.includes("7 Labs")) fail("homepage must not claim seven active labs while only six tool categories exist");
const layout = read("app/layout.tsx");
if (layout.includes(".ttf")) fail("layout must load converted .woff2 fonts, not TTF files");
if (!layout.includes(".woff2")) fail("layout must reference .woff2 fonts");

const toolPage = read("app/tools/[slug]/page.tsx");
if (!toolPage.includes('"@type": "WebApplication"')) fail("tool pages must include WebApplication JSON-LD");
if (!toolPage.includes('"@type": "FAQPage"')) fail("tool pages must include visible FAQ JSON-LD");
if (!toolPage.includes("breadcrumbJsonLd")) fail("tool pages must include BreadcrumbList JSON-LD");
if (!toolPage.includes("category=${tool.category}")) fail("tool pages must link back to their category hub");
if (!toolPage.includes("/opengraph-image")) fail("tool pages must point metadata images at per-page OG routes");
const toolsPage = read("app/tools/page.tsx");
const toolSearch = read("components/ToolSearch.tsx");
const toolRunner = read("components/ToolRunner.tsx");
if (!toolsPage.includes("<ToolSearch totalTools={tools.length}")) fail("/tools must render ToolSearch controls");
if (!toolsPage.includes("<ToolGrid tools={tools}")) fail("/tools must render the full server-side tool grid");
if (!toolSearch.includes("type=\"search\"")) fail("ToolSearch must include a search input");
if (!toolSearch.includes("aria-pressed")) fail("ToolSearch category filters must expose pressed state");
if (!read("components/ToolCard.tsx").includes("data-tool-card")) fail("Tool cards must expose data attributes for client-side filtering without client-rendering the grid");
if (!toolRunner.includes("valuesFromSearch")) fail("ToolRunner must support URL-prefilled field values");
if (!toolRunner.includes("Share link")) fail("ToolRunner must expose a prefilled-link share action");
if (!toolRunner.includes("Download .md")) fail("ToolRunner must expose markdown downloads");
if (!toolRunner.includes("<RunHistory")) fail("ToolRunner must render local run history");
const bestPage = read("app/best/[slug]/page.tsx");
const comparePage = read("app/compare/[slug]/page.tsx");
const promptsIndexPage = read("app/prompts/page.tsx");
const promptDetailPage = read("app/prompts/[slug]/page.tsx");
const llmsTxtRoute = read("app/llms.txt/route.ts");
if (!bestPage.includes("breadcrumbJsonLd")) fail("best pages must include BreadcrumbList JSON-LD");
if (!bestPage.includes("articleJsonLd")) fail("best pages must include Article JSON-LD");
if (!bestPage.includes("itemListJsonLd")) fail("best pages must include ItemList JSON-LD");
if (!bestPage.includes("/opengraph-image")) fail("best pages must point metadata images at per-page OG routes");
if (!comparePage.includes("breadcrumbJsonLd")) fail("compare pages must include BreadcrumbList JSON-LD");
if (!comparePage.includes("articleJsonLd")) fail("compare pages must include Article JSON-LD");
if (!comparePage.includes("itemListJsonLd")) fail("compare pages must include ItemList JSON-LD");
if (!comparePage.includes("relatedComparisons.includes")) fail("compare pages must link back to related best guides");
if (!comparePage.includes("/opengraph-image")) fail("compare pages must point metadata images at per-page OG routes");
if (!promptsIndexPage.includes("promptPages.map")) fail("/prompts must link prompt library detail pages");
if (!promptDetailPage.includes("PromptExampleList")) fail("prompt detail pages must render copy-ready examples");
if (!promptDetailPage.includes('"@type": "FAQPage"')) fail("prompt detail pages must include FAQPage JSON-LD");
if (!promptDetailPage.includes("itemListJsonLd")) fail("prompt detail pages must include ItemList JSON-LD");
if (!promptDetailPage.includes("/opengraph-image")) fail("prompt detail pages must point metadata images at per-page OG routes");
if (!llmsTxtRoute.includes("tools") || !llmsTxtRoute.includes("bestPages") || !llmsTxtRoute.includes("comparePages") || !llmsTxtRoute.includes("promptPages")) {
  fail("llms.txt route must include tools, best pages, compare pages, and prompt pages");
}
if (!fs.existsSync(path.join(root, "app/api/events/route.ts"))) fail("/api/events route is missing");
if (!fs.existsSync(path.join(root, "lib/eventSink.ts"))) fail("lib/eventSink.ts is required for Workers Analytics Engine events");
if (!fs.existsSync(path.join(root, "docs/ANALYTICS.md"))) fail("docs/ANALYTICS.md is required as the event taxonomy source");

const eventsRoute = read("app/api/events/route.ts");
const routeEvents = [...arrayBlock(eventsRoute, "const allowedEvents").matchAll(/"([^"]+)"/g)].map((match) => match[1]);
sameList("analytics route events", routeEvents, expectedAnalyticsEvents);
const analyticsSource = read("lib/analytics.ts");
const typeEvents = [...analyticsSource.matchAll(/\|\s*"([^"]+)"/g)].map((match) => match[1]);
sameList("analytics type events", typeEvents, expectedAnalyticsEvents);
const analyticsDoc = read("docs/ANALYTICS.md");
const docEvents = [...analyticsDoc.matchAll(/\| `([^`]+)` \|/g)].map((match) => match[1]);
sameList("analytics doc events", docEvents, expectedAnalyticsEvents);
if (!read("lib/eventSink.ts").includes("writeDataPoint")) fail("lib/eventSink.ts must write Analytics Engine data points");
if (!read("app/layout.tsx").includes("https://static.cloudflareinsights.com/beacon.min.js")) fail("layout must support the Cloudflare Web Analytics beacon");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  tools: toolSlugs.length,
  bestPages: bestSlugs.length,
  comparePages: compareSlugs.length,
  promptPages: promptSlugs.length,
  filesChecked: sourceFiles.length
}, null, 2));
