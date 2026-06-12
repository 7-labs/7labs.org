export type ToolCategory = "finder" | "dev" | "prompt" | "docs" | "creator" | "utility";

export type ToolField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
};

export type ToolExampleRun = {
  label: string;
  values: Record<string, string>;
  outputPreview: string;
};

type ToolLaunchDetails = {
  primaryIntent: string;
  lastReviewed: string;
  exampleRuns: ToolExampleRun[];
  sampleOutput: string;
  limitations: string[];
  upgradePath: string;
  conversionGoal: string;
  relatedBestSlugs: string[];
  relatedCompareSlugs: string[];
};

type BaseToolDefinition = {
  slug: string;
  name: string;
  tagline: string;
  category: ToolCategory;
  priority: number;
  description: string;
  keywords: string[];
  fields: ToolField[];
  examples: string[];
  howItWorks: string[];
  useCases: string[];
  relatedSlugs: string[];
  monetization: "free" | "freemium" | "pro";
};

export type ToolDefinition = BaseToolDefinition & ToolLaunchDetails;

export const categories: Record<ToolCategory, { name: string; description: string; accent: string }> = {
  finder: {
    name: "AI Finder Lab",
    description: "Help users pick the right AI tool stack by task, budget, workflow, and output format.",
    accent: "blue"
  },
  dev: {
    name: "Developer Lab",
    description: "Developer utilities for debugging, regex, SQL, JSON, YAML, Git, cron, cURL, and code explanation.",
    accent: "green"
  },
  prompt: {
    name: "Prompt Studio",
    description: "Reusable prompt builders for images, video, product photos, thumbnails, and model-specific workflows.",
    accent: "purple"
  },
  docs: {
    name: "Document Lab",
    description: "Turn PDFs, papers, meeting notes, resumes, and long documents into summaries and action plans.",
    accent: "orange"
  },
  creator: {
    name: "Creator Lab",
    description: "English-first creator tools for YouTube, TikTok, LinkedIn, ecommerce, newsletters, and launch copy.",
    accent: "pink"
  },
  utility: {
    name: "Utility Lab",
    description: "Low-cost utility tools that capture long-tail search demand and pair well with AI upgrades.",
    accent: "slate"
  }
};

const LAST_REVIEWED = "2026-05-31";

function detail(input: Omit<ToolLaunchDetails, "lastReviewed"> & { lastReviewed?: string }): ToolLaunchDetails {
  return {
    lastReviewed: input.lastReviewed ?? LAST_REVIEWED,
    primaryIntent: input.primaryIntent,
    exampleRuns: input.exampleRuns,
    sampleOutput: input.sampleOutput,
    limitations: input.limitations,
    upgradePath: input.upgradePath,
    conversionGoal: input.conversionGoal,
    relatedBestSlugs: input.relatedBestSlugs,
    relatedCompareSlugs: input.relatedCompareSlugs
  };
}

const toolLaunchDetails: Record<string, ToolLaunchDetails> = {
  "ai-tool-finder": detail({
    primaryIntent: "Pick a practical AI stack from task, budget, and workflow constraints.",
    exampleRuns: [{
      label: "YouTube creator stack",
      values: {
        task: "I need a low-cost AI stack for writing YouTube scripts, creating thumbnail prompts, and repurposing ideas into Shorts.",
        budget: "free",
        workflow: "individual"
      },
      outputPreview: "Recommended stack: 7labs YouTube Script Generator for structure, YouTube Thumbnail Prompt Generator for visual concepts, TikTok Hook Generator for Shorts, and a stronger model only for final script expansion."
    }],
    sampleOutput: "A ranked tool stack, trade-offs, a workflow order, caveats, and a reusable prompt for the next tool.",
    limitations: ["Uses a curated local catalog, not live pricing data.", "Does not test tools inside user accounts.", "Free-tier availability can change and should be checked before purchase."],
    upgradePath: "Add verified tool profiles, last-checked pricing, affiliate links, and user feedback once traffic identifies repeat tasks.",
    conversionGoal: "Move broad AI tool research into one executable workflow.",
    relatedBestSlugs: ["best-ai-for-coding", "best-ai-for-youtube"],
    relatedCompareSlugs: ["chatgpt-vs-gemini", "claude-vs-chatgpt"]
  }),
  "ai-tool-comparison-generator": detail({
    primaryIntent: "Turn a vague tool decision into a task-specific comparison.",
    exampleRuns: [{
      label: "Long document tools",
      values: {
        tools: "ChatGPT, Claude, Gemini",
        task: "Compare them for summarizing long PDFs and drafting client-ready reports.",
        criteria: "long context, citations, cost, team review"
      },
      outputPreview: "A decision table with best-fit tasks, caveats, and a recommended workflow before choosing a paid plan."
    }],
    sampleOutput: "A side-by-side comparison with criteria, best fit, caveats, and a recommended next step.",
    limitations: ["Not a substitute for hands-on testing.", "Does not fetch live feature limits.", "External product claims need periodic review."],
    upgradePath: "Connect external tool profiles with last-verified dates and source links.",
    conversionGoal: "Send users from comparison intent to a specific trial or 7labs workflow.",
    relatedBestSlugs: ["best-ai-for-coding", "best-ai-for-pdf"],
    relatedCompareSlugs: ["chatgpt-vs-gemini", "claude-vs-chatgpt"]
  }),
  "image-prompt-generator": detail({
    primaryIntent: "Convert a rough visual idea into a structured image prompt.",
    exampleRuns: [{
      label: "Landing page hero",
      values: { subject: "a futuristic coffee maker on a marble counter", style: "cinematic", platform: "general" },
      outputPreview: "Prompt sections for subject, composition, lighting, material detail, style notes, and negative prompt."
    }],
    sampleOutput: "A model-ready image prompt with composition, style, lighting, quality notes, and negative prompt guidance.",
    limitations: ["Generates prompts, not images.", "Model-specific syntax still needs tuning.", "Text in generated images usually needs manual finishing."],
    upgradePath: "Add model presets, prompt history, and image-generation provider routing after usage proves demand.",
    conversionGoal: "Prepare better prompts before users spend image credits.",
    relatedBestSlugs: ["best-ai-for-image-generation"],
    relatedCompareSlugs: ["midjourney-vs-stable-diffusion"]
  }),
  "video-prompt-generator": detail({
    primaryIntent: "Plan AI video shots before spending video-generation credits.",
    exampleRuns: [{
      label: "Product reveal",
      values: { idea: "a SaaS dashboard turning messy notes into a clean task board", style: "cinematic", duration: "8 seconds" },
      outputPreview: "Shot description with subject motion, camera move, pacing, visual constraints, and retry notes."
    }],
    sampleOutput: "A shot-ready AI video prompt with scene, camera movement, duration, pacing, and quality constraints.",
    limitations: ["No video rendering in the MVP.", "Provider capabilities vary widely.", "Precise product UI usually needs post-production."],
    upgradePath: "Add provider-specific templates for Veo, Runway, Pika, and Kling once video demand is measured.",
    conversionGoal: "Reduce wasted video-generation retries.",
    relatedBestSlugs: ["best-ai-for-image-generation", "best-ai-for-youtube"],
    relatedCompareSlugs: []
  }),
  "midjourney-prompt-generator": detail({
    primaryIntent: "Translate a visual idea into Midjourney-friendly prompt structure.",
    exampleRuns: [{
      label: "Hero visual",
      values: { subject: "solo founder at a desk surrounded by workflow cards", style: "editorial", aspect: "16:9" },
      outputPreview: "A concise Midjourney prompt with aspect ratio, style guidance, composition, and iteration notes."
    }],
    sampleOutput: "A Midjourney prompt with subject, composition, lighting, style, aspect ratio, and iteration advice.",
    limitations: ["Does not guarantee Midjourney account access or exact output.", "Text and layouts often need external editing.", "Live Midjourney parameters may change."],
    upgradePath: "Add version presets, prompt variants, and saved style recipes.",
    conversionGoal: "Help users form high-quality prompts before image generation.",
    relatedBestSlugs: ["best-ai-for-image-generation"],
    relatedCompareSlugs: ["midjourney-vs-stable-diffusion"]
  }),
  "stable-diffusion-prompt-generator": detail({
    primaryIntent: "Create Stable Diffusion and SDXL prompts with controllable constraints.",
    exampleRuns: [{
      label: "Product ad",
      values: { subject: "wireless earbuds on a graphite desk", style: "commercial", model: "sdxl" },
      outputPreview: "Positive prompt, negative prompt, size guidance, CFG notes, and suggested sampling assumptions."
    }],
    sampleOutput: "A Stable Diffusion prompt package with positive prompt, negative prompt, and parameter suggestions.",
    limitations: ["Local model quality depends on checkpoint and workflow.", "Advanced ControlNet or LoRA setup is outside the MVP.", "Prompt syntax may need model-specific tuning."],
    upgradePath: "Add SDXL presets, LoRA notes, ControlNet branches, and saved generation recipes.",
    conversionGoal: "Make open image workflows easier to start.",
    relatedBestSlugs: ["best-ai-for-image-generation"],
    relatedCompareSlugs: ["midjourney-vs-stable-diffusion"]
  }),
  "product-photo-prompt-generator": detail({
    primaryIntent: "Create product photography prompts for ecommerce and launch pages.",
    exampleRuns: [{
      label: "Shopify hero shot",
      values: { product: "minimalist desk lamp", audience: "remote workers", background: "warm home office" },
      outputPreview: "A commercial product photo setup with angle, lighting, background, props, and negative prompt."
    }],
    sampleOutput: "A product photo prompt with commercial framing, materials, lighting, background, and ad-ready variants.",
    limitations: ["Generated images still need brand and legal review.", "Packaging text should be added manually.", "Exact product geometry may require reference images."],
    upgradePath: "Add reference-image workflows, marketplace-specific presets, and A/B prompt variants.",
    conversionGoal: "Support ecommerce users before they move into paid image generation or design tools.",
    relatedBestSlugs: ["best-ai-for-image-generation"],
    relatedCompareSlugs: ["midjourney-vs-stable-diffusion"]
  }),
  "youtube-thumbnail-prompt-generator": detail({
    primaryIntent: "Design a thumbnail visual concept before creating the image.",
    exampleRuns: [{
      label: "AI coding video",
      values: {
        topic: "I replaced 10 hours of debugging with one AI workflow",
        emotion: "surprised but credible",
        style: "high-contrast"
      },
      outputPreview: "Thumbnail concept with focal subject, contrast plan, title-safe area, background idea, and text placement notes."
    }],
    sampleOutput: "A thumbnail prompt with central subject, emotion, color contrast, title-safe composition, and variant ideas.",
    limitations: ["Does not generate the final thumbnail image.", "Readable text should usually be added in Canva, Figma, or Photoshop.", "Click-through rate depends on audience and title fit."],
    upgradePath: "Add title pairing, thumbnail A/B variants, and export presets for creator workflows.",
    conversionGoal: "Move YouTube search traffic into the Creator Lab workflow.",
    relatedBestSlugs: ["best-ai-for-youtube", "best-ai-for-image-generation"],
    relatedCompareSlugs: ["midjourney-vs-stable-diffusion"]
  }),
  "prompt-optimizer": detail({
    primaryIntent: "Turn a loose prompt into a structured instruction that models can follow.",
    exampleRuns: [{
      label: "Marketing rewrite",
      values: { prompt: "Rewrite this landing page copy and make it better", goal: "clear SaaS homepage section", tone: "direct" },
      outputPreview: "An optimized prompt with role, goal, context, constraints, output format, and review checklist."
    }],
    sampleOutput: "A stronger prompt with context, constraints, output format, examples, and evaluation criteria.",
    limitations: ["Does not call a model by default.", "Bad source context still limits output quality.", "Highly regulated topics need expert review."],
    upgradePath: "Add saved templates, model-specific variants, and feedback-based prompt scoring.",
    conversionGoal: "Create repeat use across every other 7labs tool.",
    relatedBestSlugs: ["best-ai-for-writing", "best-ai-for-coding"],
    relatedCompareSlugs: ["chatgpt-vs-gemini", "claude-vs-chatgpt"]
  }),
  "prompt-translator": detail({
    primaryIntent: "Convert rough multilingual notes into clear English prompts.",
    exampleRuns: [{
      label: "Creator prompt cleanup",
      values: { source: "rough mixed-language notes for a product launch video", target: "english", style: "professional" },
      outputPreview: "A clean English prompt with audience, task, tone, and output format preserved."
    }],
    sampleOutput: "A polished English prompt that keeps intent while improving structure and clarity.",
    limitations: ["Not a certified translation tool.", "Nuance can be lost without context.", "Sensitive content still needs human review."],
    upgradePath: "Add side-by-side review, glossary support, and model-assisted rewrite modes.",
    conversionGoal: "Help non-native prompt notes work better in English-first AI tools.",
    relatedBestSlugs: ["best-ai-for-writing"],
    relatedCompareSlugs: ["chatgpt-vs-gemini"]
  }),
  "error-explainer": detail({
    primaryIntent: "Classify an error and turn it into checks, fixes, and prevention notes.",
    exampleRuns: [{
      label: "Next.js runtime error",
      values: {
        error: "TypeError: Cannot read properties of undefined (reading 'map') in app/tools/page.tsx",
        context: "The page filters tools by category from searchParams.",
        language: "typescript"
      },
      outputPreview: "Likely cause: optional data is undefined. Checks: inspect searchParams and array defaults. Fix: guard before map and add fallback state."
    }],
    sampleOutput: "A structured error diagnosis with likely causes, reproduction checks, fix options, and prevention notes.",
    limitations: ["Cannot inspect your repo unless you paste enough context.", "May miss environment-specific failures.", "Security-sensitive logs should be redacted first."],
    upgradePath: "Add stack trace parsing, framework-specific fix templates, and optional model-assisted diagnosis.",
    conversionGoal: "Earn repeat developer usage from high-frequency debugging tasks.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: ["cursor-vs-copilot"]
  }),
  "regex-generator": detail({
    primaryIntent: "Generate a regex pattern with practical sample matches and caveats.",
    exampleRuns: [{
      label: "Invoice IDs",
      values: {
        pattern: "Match invoice IDs like INV-2026-0042 and reject lowercase or missing year.",
        flavor: "javascript",
        strictness: "balanced"
      },
      outputPreview: "Suggested pattern: /^INV-\\d{4}-\\d{4}$/ with sample matches, non-matches, and JavaScript usage notes."
    }],
    sampleOutput: "A regex pattern, examples that should match, examples that should fail, and implementation notes.",
    limitations: ["Complex natural-language rules may need manual refinement.", "Regex flavor differences matter.", "Always test against real samples before production use."],
    upgradePath: "Add interactive test cases, language-specific snippets, and saved regex recipes.",
    conversionGoal: "Capture repeat developer utility searches.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: ["cursor-vs-copilot"]
  }),
  "sql-generator": detail({
    primaryIntent: "Draft a readable SQL query from a business question.",
    exampleRuns: [{
      label: "Revenue by plan",
      values: {
        request: "Show monthly recurring revenue by plan for active subscriptions in 2026.",
        dialect: "postgres",
        tables: "subscriptions(id, plan, status, monthly_amount, created_at)"
      },
      outputPreview: "A Postgres SELECT with date_trunc, SUM(monthly_amount), status filter, GROUP BY month and plan, and safety notes."
    }],
    sampleOutput: "A draft SQL query with assumptions, filters, grouping, ordering, and review notes.",
    limitations: ["Does not connect to your database.", "Schema assumptions must be verified.", "Never run destructive SQL without review."],
    upgradePath: "Add schema upload, dialect validation, EXPLAIN hints, and read-only query review.",
    conversionGoal: "Convert developer and operator searches into repeat utility usage.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: ["cursor-vs-copilot"]
  }),
  "json-fixer": detail({
    primaryIntent: "Repair common JSON formatting mistakes quickly.",
    exampleRuns: [{
      label: "Trailing commas",
      values: { json: "{ name: 'Acme', features: ['fast', 'secure',], }" },
      outputPreview: "A valid JSON object with quoted keys, double-quoted strings, removed trailing commas, and a checklist of fixes."
    }],
    sampleOutput: "Cleaned JSON plus a short explanation of what changed.",
    limitations: ["Cannot infer missing business data.", "Severely malformed JSON may need manual cleanup.", "Large files should be validated with a parser."],
    upgradePath: "Add parser-based validation, diff view, schema checks, and copy-safe formatting.",
    conversionGoal: "Create instant-value developer utility usage.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: ["cursor-vs-copilot"]
  }),
  "yaml-fixer": detail({
    primaryIntent: "Diagnose YAML indentation, quoting, list, and boolean issues.",
    exampleRuns: [{
      label: "GitHub Actions YAML",
      values: { yaml: "name: build\\non:\\n push:\\njobs:\\n build:\\n  runs-on: ubuntu-latest", context: "GitHub Actions workflow" },
      outputPreview: "Indentation notes, likely parser issue, and a cleaner YAML skeleton."
    }],
    sampleOutput: "A cleaned YAML draft and troubleshooting checklist.",
    limitations: ["Does not run the target platform parser.", "YAML anchors and advanced syntax may need expert review.", "Whitespace-sensitive files should be tested after changes."],
    upgradePath: "Add parser validation, platform presets, and side-by-side diffs.",
    conversionGoal: "Help developers fix configuration files without opening a full chat session.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: ["cursor-vs-copilot"]
  }),
  "git-command-generator": detail({
    primaryIntent: "Create safe Git command sequences for common workflows.",
    exampleRuns: [{
      label: "New branch workflow",
      values: { task: "Create a new branch, stage only changed source files, commit, and push.", risk: "safe" },
      outputPreview: "Commands for git switch -c, git status --short, git add selected paths, git commit, and git push -u with safety notes."
    }],
    sampleOutput: "A command sequence with preflight checks and warnings around destructive operations.",
    limitations: ["Cannot see your repo state.", "Dangerous commands still need human confirmation.", "Authentication and remotes vary by machine."],
    upgradePath: "Add repo-aware mode, command risk scoring, and shell-specific snippets.",
    conversionGoal: "Make developer utility users trust 7labs for repeat operations.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: ["cursor-vs-copilot"]
  }),
  "cron-generator": detail({
    primaryIntent: "Generate cron expressions with plain-English schedule notes.",
    exampleRuns: [{
      label: "Weekday report",
      values: { schedule: "Run every weekday at 8:30 AM", timezone: "UTC" },
      outputPreview: "Cron: 30 8 * * 1-5 with timezone caveats and testing notes."
    }],
    sampleOutput: "A cron expression, explanation, examples, and timezone caveats.",
    limitations: ["Cron syntax differs across systems.", "Timezone handling depends on runtime environment.", "Production schedules should be tested with a dry run."],
    upgradePath: "Add platform presets for GitHub Actions, Vercel, systemd timers, and Cloudflare Cron Triggers.",
    conversionGoal: "Serve high-intent operations searches.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: []
  }),
  "code-explainer": detail({
    primaryIntent: "Explain a code snippet in practical terms.",
    exampleRuns: [{
      label: "React state snippet",
      values: { code: "const [copied, setCopied] = useState(false);", language: "typescript", focus: "state and UI behavior" },
      outputPreview: "Explanation of state purpose, inputs, output behavior, risks, and possible simplification."
    }],
    sampleOutput: "A concise code explanation with inputs, outputs, side effects, risks, and refactor ideas.",
    limitations: ["Small snippets can miss surrounding architecture.", "Generated explanations need review for security-sensitive code.", "No repository-wide analysis in the MVP."],
    upgradePath: "Add multi-file context, framework presets, and review checklists.",
    conversionGoal: "Build trust with developer learners and operators.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: ["cursor-vs-copilot"]
  }),
  "api-to-curl-converter": detail({
    primaryIntent: "Turn API request notes into a copy-ready cURL command.",
    exampleRuns: [{
      label: "POST JSON API",
      values: { method: "POST", url: "https://api.example.com/v1/tasks", headers: "Authorization: Bearer TOKEN", body: "{\"title\":\"Test\"}" },
      outputPreview: "A formatted curl command with method, headers, JSON body, and safety note to avoid pasting real tokens."
    }],
    sampleOutput: "A cURL command plus notes about auth headers, JSON escaping, and safe token handling.",
    limitations: ["Does not validate live endpoint behavior.", "Tokens should be replaced with placeholders.", "Multipart or streaming requests may need manual edits."],
    upgradePath: "Add import from fetch/OpenAPI snippets and Postman-style export.",
    conversionGoal: "Convert API debugging searches into practical developer utility usage.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: []
  }),
  "typescript-type-generator": detail({
    primaryIntent: "Create pragmatic TypeScript interfaces from JSON samples.",
    exampleRuns: [{
      label: "API response",
      values: { json: "{\"id\":123,\"name\":\"Acme\",\"tags\":[\"ai\",\"tools\"],\"active\":true}", name: "CompanyProfile" },
      outputPreview: "An interface with id, name, tags, active, optional notes, and nested object handling guidance."
    }],
    sampleOutput: "A TypeScript interface draft with optionality notes and nested type suggestions.",
    limitations: ["One sample cannot prove all possible fields.", "Nullable and optional semantics need product review.", "Runtime validation requires a schema library."],
    upgradePath: "Add Zod/schema generation, multi-sample merging, and API contract export.",
    conversionGoal: "Serve developer workflow users who need fast typed scaffolding.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: ["cursor-vs-copilot"]
  }),
  "pdf-summarizer": detail({
    primaryIntent: "Summarize pasted document text into decisions, risks, and next actions.",
    exampleRuns: [{
      label: "Investor memo",
      values: {
        text: "A four-page memo describing market risk, revenue growth, hiring constraints, and launch priorities.",
        summaryType: "executive"
      },
      outputPreview: "Executive summary with key points, risks, action items, unknowns, and verification notes."
    }],
    sampleOutput: "A structured document summary with key points, keywords, action items, and reliability caveats.",
    limitations: ["MVP uses pasted text, not file upload.", "No page citations yet.", "Sensitive documents should not be pasted into untrusted deployments."],
    upgradePath: "Add PDF parsing, page citations, export, retention controls, and model-assisted long-document mode.",
    conversionGoal: "Identify whether Document Lab deserves paid workflow investment.",
    relatedBestSlugs: ["best-ai-for-pdf"],
    relatedCompareSlugs: ["claude-vs-chatgpt", "chatgpt-vs-gemini"]
  }),
  "chat-with-pdf": detail({
    primaryIntent: "Answer a question against pasted document text with evidence snippets.",
    exampleRuns: [{
      label: "Contract question",
      values: { document: "Pasted contract section with renewal and termination clauses.", question: "What are the cancellation terms?" },
      outputPreview: "A direct answer, relevant excerpt, uncertainty note, and follow-up questions."
    }],
    sampleOutput: "A question-focused answer with cited excerpts from pasted text and caveats.",
    limitations: ["No upload, embeddings, or page citations in the MVP.", "Answers depend on the pasted excerpt.", "Legal or financial documents need expert review."],
    upgradePath: "Add chunking, source citations, multi-file Q&A, and retention controls.",
    conversionGoal: "Validate paid document Q&A demand without file storage.",
    relatedBestSlugs: ["best-ai-for-pdf"],
    relatedCompareSlugs: ["claude-vs-chatgpt"]
  }),
  "research-paper-explainer": detail({
    primaryIntent: "Explain a paper's problem, method, findings, and limitations.",
    exampleRuns: [{
      label: "Abstract explainer",
      values: { paper: "Abstract about a retrieval-augmented generation evaluation benchmark.", audience: "product team" },
      outputPreview: "Problem, method, findings, practical implications, limitations, and questions to verify."
    }],
    sampleOutput: "A paper explainer with plain-English summary, method, findings, limitations, and implications.",
    limitations: ["Works from pasted sections, not full-paper parsing.", "Does not verify citations.", "Technical claims need expert review."],
    upgradePath: "Add DOI/source links, section-aware parsing, and citation-aware summaries.",
    conversionGoal: "Serve research and document users before a paid PDF workflow.",
    relatedBestSlugs: ["best-ai-for-pdf"],
    relatedCompareSlugs: ["claude-vs-chatgpt", "chatgpt-vs-gemini"]
  }),
  "resume-optimizer": detail({
    primaryIntent: "Rewrite resume bullets for clearer outcomes and role fit.",
    exampleRuns: [{
      label: "Product manager bullet",
      values: {
        resume: "Managed roadmap and worked with engineers to improve onboarding.",
        role: "Senior Product Manager, B2B SaaS",
        tone: "achievement"
      },
      outputPreview: "Rewritten bullet with stronger action verb, scope, measurable impact placeholder, and ATS keyword suggestions."
    }],
    sampleOutput: "Improved resume bullets with action verbs, measurable framing, and role-specific positioning notes.",
    limitations: ["Does not verify employment history.", "Metrics should not be invented.", "Final resume should match the user's actual experience."],
    upgradePath: "Add job-description matching, ATS checks, saved versions, and export.",
    conversionGoal: "Capture practical career-search intent without requiring login.",
    relatedBestSlugs: ["best-ai-for-writing"],
    relatedCompareSlugs: ["claude-vs-chatgpt", "chatgpt-vs-gemini"]
  }),
  "meeting-notes-generator": detail({
    primaryIntent: "Turn rough meeting notes into decisions, actions, owners, and follow-up copy.",
    exampleRuns: [{
      label: "Launch meeting",
      values: { notes: "Discussed launch date, homepage fixes, owner assignments, and open analytics question.", audience: "internal team" },
      outputPreview: "Summary, decisions, action items with owners, open questions, and follow-up email draft."
    }],
    sampleOutput: "Clean meeting notes with decisions, action items, owners, deadlines, open questions, and a follow-up draft.",
    limitations: ["No audio transcription in the MVP.", "Owner and deadline inference may need review.", "Sensitive meeting content should be handled carefully."],
    upgradePath: "Add transcript import, calendar context, and export to team tools.",
    conversionGoal: "Probe productivity use cases that can become saved workflows.",
    relatedBestSlugs: ["best-ai-for-writing", "best-ai-for-pdf"],
    relatedCompareSlugs: ["chatgpt-vs-gemini"]
  }),
  "youtube-script-generator": detail({
    primaryIntent: "Build a YouTube script structure from a topic and audience.",
    exampleRuns: [{
      label: "Workflow tutorial",
      values: { topic: "How to use AI to debug production errors faster", audience: "software developers", length: "8 minutes" },
      outputPreview: "Hook, promise, outline sections, examples, retention beats, transitions, and call to action."
    }],
    sampleOutput: "A YouTube script outline with hook, promise, sections, examples, transitions, and CTA.",
    limitations: ["Does not know your audience retention data.", "Final script needs voice and examples.", "No YouTube API integration in the MVP."],
    upgradePath: "Add title/thumbnail pairing, retention checkpoints, and Shorts repurposing.",
    conversionGoal: "Anchor Creator Lab as a repeat creator workflow.",
    relatedBestSlugs: ["best-ai-for-youtube", "best-ai-for-writing"],
    relatedCompareSlugs: ["chatgpt-vs-gemini"]
  }),
  "tiktok-hook-generator": detail({
    primaryIntent: "Generate short-form video hooks with stakes and fast openers.",
    exampleRuns: [{
      label: "Founder lesson",
      values: { topic: "I wasted a week picking the wrong AI tool stack", audience: "indie hackers", style: "curiosity" },
      outputPreview: "Hook variants using curiosity, contrast, mistake framing, and fast payoff language."
    }],
    sampleOutput: "A set of short-form hooks with angle, opening line, why it works, and CTA notes.",
    limitations: ["Hook performance must be tested with real viewers.", "Platform trends change quickly.", "The MVP does not publish or analyze videos."],
    upgradePath: "Add platform-specific variants, retention tags, and performance feedback loops.",
    conversionGoal: "Capture creator traffic and push users into repeat content workflows.",
    relatedBestSlugs: ["best-ai-for-youtube", "best-ai-for-writing"],
    relatedCompareSlugs: []
  }),
  "linkedin-post-generator": detail({
    primaryIntent: "Draft LinkedIn posts for professional English audiences.",
    exampleRuns: [{
      label: "Product launch post",
      values: { topic: "We launched a free AI tool finder for creators and developers.", audience: "founders and builders", format: "launch" },
      outputPreview: "A concise launch post with opener, problem, useful proof points, CTA, and optional comment prompt."
    }],
    sampleOutput: "A LinkedIn post draft with hook, body, proof, CTA, and format-specific notes.",
    limitations: ["Best performance requires personal voice and real proof.", "Over-polished AI posts can look generic.", "No LinkedIn publishing integration in the MVP."],
    upgradePath: "Add voice profiles, saved post formats, and performance tracking.",
    conversionGoal: "Support B2B creator and founder acquisition channels.",
    relatedBestSlugs: ["best-ai-for-writing"],
    relatedCompareSlugs: ["claude-vs-chatgpt", "chatgpt-vs-gemini"]
  }),
  "product-description-generator": detail({
    primaryIntent: "Convert product features into benefits, product-page copy, and ad angles.",
    exampleRuns: [{
      label: "SaaS product page",
      values: { product: "AI meeting notes app", features: "records calls, extracts action items, syncs with Slack", audience: "busy startup teams" },
      outputPreview: "Positioning, benefit bullets, product description, ad angles, and CTA options."
    }],
    sampleOutput: "Product copy with positioning, benefits, bullets, ad angles, and CTA suggestions.",
    limitations: ["Does not verify product claims.", "Compliance-sensitive products need review.", "Conversion rate depends on offer, proof, and audience fit."],
    upgradePath: "Add ecommerce templates, brand voice profiles, and landing-page section exports.",
    conversionGoal: "Monetize creator and ecommerce workflow demand later.",
    relatedBestSlugs: ["best-ai-for-writing", "best-ai-for-image-generation"],
    relatedCompareSlugs: []
  }),
  "newsletter-outline-generator": detail({
    primaryIntent: "Turn a topic into a newsletter issue structure.",
    exampleRuns: [{
      label: "AI tools roundup",
      values: { topic: "5 AI workflows that saved my team time this week", audience: "founders and marketers" },
      outputPreview: "Subject lines, opener, sections, examples to add, CTA, and link placeholders."
    }],
    sampleOutput: "A newsletter outline with subject lines, intro, sections, proof points, links to add, and CTA.",
    limitations: ["Does not write from live sources.", "Links and claims need manual verification.", "Final voice should match the sender."],
    upgradePath: "Add source collection, saved issue templates, and email platform export.",
    conversionGoal: "Build repeat writing workflows and future newsletter capture.",
    relatedBestSlugs: ["best-ai-for-writing"],
    relatedCompareSlugs: ["claude-vs-chatgpt"]
  }),
  "timestamp-converter": detail({
    primaryIntent: "Convert timestamps and date strings while making parsing assumptions clear.",
    exampleRuns: [{
      label: "Unix seconds",
      values: { value: "1717200000" },
      outputPreview: "Detected seconds timestamp, ISO UTC output, local browser note, and parsing caveat."
    }],
    sampleOutput: "Readable UTC and local time notes with timestamp parsing assumptions.",
    limitations: ["Browser locale affects local display.", "Ambiguous date strings can parse unexpectedly.", "Timezone names should be checked for scheduled jobs."],
    upgradePath: "Add timezone selector, batch conversion, and log-format presets.",
    conversionGoal: "Capture high-frequency utility searches at low cost.",
    relatedBestSlugs: ["best-ai-for-coding"],
    relatedCompareSlugs: []
  }),
  "text-cleanup-tool": detail({
    primaryIntent: "Clean pasted text for prompts, documents, and publishing.",
    exampleRuns: [{
      label: "Transcript cleanup",
      values: { text: "  This is   messy text.\\n\\n\\nIt has extra spaces.  ", mode: "readable" },
      outputPreview: "Clean paragraphs with trimmed spaces, normalized line breaks, and content preserved."
    }],
    sampleOutput: "Cleaned text in the selected format plus a note about what changed.",
    limitations: ["Does not rewrite content unless the mode implies structure.", "Semantic cleanup still needs human review.", "Very large text should be processed in chunks."],
    upgradePath: "Add diff view, batch cleanup, and prompt-ready formatting presets.",
    conversionGoal: "Serve practical prompt and document preparation traffic.",
    relatedBestSlugs: ["best-ai-for-writing", "best-ai-for-pdf"],
    relatedCompareSlugs: []
  })
};

const baseTools: BaseToolDefinition[] = ([
  {
    slug: "ai-tool-finder",
    name: "AI Tool Finder",
    tagline: "Describe a task and get a practical AI tool stack.",
    category: "finder",
    priority: 100,
    description: "A task-first AI tool recommender for English-speaking users. It maps your goal, budget, and workflow to tools, trade-offs, and a copy-ready prompt.",
    keywords: ["AI tool finder", "best AI tools", "best AI for", "AI tool recommendations", "AI workflow"],
    fields: [
      { name: "task", label: "What do you want to accomplish?", type: "textarea", required: true, placeholder: "Example: I need a low-cost AI stack for creating YouTube thumbnails and short-form video scripts." },
      { name: "budget", label: "Budget", type: "select", defaultValue: "free", options: [
        { label: "Prefer free or freemium", value: "free" },
        { label: "Low-cost subscription is okay", value: "low" },
        { label: "Best quality, flexible budget", value: "pro" }
      ]},
      { name: "workflow", label: "Workflow type", type: "select", defaultValue: "individual", options: [
        { label: "Individual creator", value: "individual" },
        { label: "Developer / builder", value: "developer" },
        { label: "Marketing team", value: "marketing" },
        { label: "Research / documents", value: "research" }
      ]}
    ],
    examples: ["Find AI tools for coding", "Create YouTube thumbnails and scripts", "Summarize PDFs with citations", "Build a marketing content workflow"],
    howItWorks: ["Extracts task intent and constraints", "Matches your request against a curated AI tool catalog", "Ranks tools by use case, free tier, and workflow fit", "Outputs a stack, caveats, and a prompt you can reuse"],
    useCases: ["Choosing an AI stack", "Comparing AI tools", "Building a repeatable workflow", "Finding freemium alternatives"],
    relatedSlugs: ["ai-tool-comparison-generator", "prompt-optimizer", "pdf-summarizer"],
    monetization: "free"
  },
  {
    slug: "ai-tool-comparison-generator",
    name: "AI Tool Comparison Generator",
    tagline: "Compare two or three AI tools for a specific job.",
    category: "finder",
    priority: 96,
    description: "Generate a decision-oriented comparison table with strengths, limitations, best-fit tasks, and a recommended workflow.",
    keywords: ["compare AI tools", "AI tools comparison", "ChatGPT vs Gemini", "Claude vs ChatGPT"],
    fields: [
      { name: "tools", label: "Tools to compare", type: "text", required: true, placeholder: "Example: ChatGPT, Claude, Gemini" },
      { name: "task", label: "Decision context", type: "textarea", required: true, placeholder: "Example: I need to summarize long PDFs and draft client-ready reports." },
      { name: "criteria", label: "Top criteria", type: "text", placeholder: "Example: accuracy, price, citations, long context, team use" }
    ],
    examples: ["ChatGPT vs Claude for long docs", "Midjourney vs Stable Diffusion for product images", "Cursor vs Copilot for coding"],
    howItWorks: ["Clarifies the job-to-be-done", "Builds a compact comparison", "Highlights caveats instead of only positives", "Ends with a recommended decision path"],
    useCases: ["Tool selection", "Buyer research", "Team recommendations", "Affiliate content pages"],
    relatedSlugs: ["ai-tool-finder", "prompt-optimizer", "text-cleanup-tool"],
    monetization: "free"
  },
  {
    slug: "image-prompt-generator",
    name: "AI Image Prompt Generator",
    tagline: "Turn a rough idea into a model-ready image prompt.",
    category: "prompt",
    priority: 98,
    description: "Create structured English prompts for Midjourney, Stable Diffusion, Gemini, DALL·E, and other image models. Includes subject, composition, lighting, style, and negative prompts.",
    keywords: ["AI image prompt generator", "image prompt", "Midjourney prompt", "Stable Diffusion prompt"],
    fields: [
      { name: "subject", label: "Main subject", type: "text", required: true, placeholder: "Example: a futuristic coffee maker on a marble kitchen counter" },
      { name: "style", label: "Visual style", type: "select", defaultValue: "cinematic", options: [
        { label: "Cinematic realism", value: "cinematic" },
        { label: "Product photography", value: "product" },
        { label: "Anime illustration", value: "anime" },
        { label: "Minimal poster", value: "minimal" },
        { label: "3D render", value: "3d" }
      ]},
      { name: "ratio", label: "Aspect ratio", type: "select", defaultValue: "1:1", options: [
        { label: "1:1 square", value: "1:1" },
        { label: "16:9 landscape", value: "16:9" },
        { label: "9:16 vertical", value: "9:16" },
        { label: "4:5 social post", value: "4:5" }
      ]},
      { name: "details", label: "Extra details", type: "textarea", placeholder: "Example: soft morning light, shallow depth of field, no text, premium lifestyle mood" }
    ],
    examples: ["Premium skincare bottle", "YouTube thumbnail background", "Game character concept", "Minimal SaaS hero image"],
    howItWorks: ["Turns the subject into visual language", "Adds composition, camera, lighting, and style", "Includes negative prompts to reduce common artifacts", "Returns copy-ready variants"],
    useCases: ["AI image generation", "Marketing visuals", "Product concepts", "Creator thumbnails"],
    relatedSlugs: ["midjourney-prompt-generator", "stable-diffusion-prompt-generator", "product-photo-prompt-generator"],
    monetization: "free"
  },
  {
    slug: "video-prompt-generator",
    name: "AI Video Prompt Generator",
    tagline: "Create camera-aware prompts for video models.",
    category: "prompt",
    priority: 94,
    description: "Convert a video idea into scene, subject movement, camera movement, duration, pacing, and quality constraints for AI video generation tools.",
    keywords: ["AI video prompt generator", "video prompt", "Runway prompt", "Sora prompt", "Veo prompt"],
    fields: [
      { name: "idea", label: "Video idea", type: "textarea", required: true, placeholder: "Example: A smartwatch floating above a desk while notifications appear as subtle light trails." },
      { name: "duration", label: "Duration", type: "select", defaultValue: "8s", options: [
        { label: "5 seconds", value: "5s" },
        { label: "8 seconds", value: "8s" },
        { label: "15 seconds", value: "15s" },
        { label: "30 seconds", value: "30s" }
      ]},
      { name: "camera", label: "Camera movement", type: "select", defaultValue: "slow push-in", options: [
        { label: "Slow push-in", value: "slow push-in" },
        { label: "Orbit shot", value: "orbit shot" },
        { label: "Handheld documentary", value: "handheld documentary" },
        { label: "Top-down", value: "top-down" }
      ]}
    ],
    examples: ["Product ad shot", "Travel vlog intro", "App launch teaser", "Coffee pour close-up"],
    howItWorks: ["Defines scene and subject motion", "Adds camera movement and pacing", "Adds constraints that reduce flicker and random text", "Gives a shot-by-shot iteration plan"],
    useCases: ["AI video generation", "Short-form ads", "Storyboards", "Creator b-roll"],
    relatedSlugs: ["image-prompt-generator", "youtube-script-generator", "prompt-optimizer"],
    monetization: "free"
  },
  {
    slug: "midjourney-prompt-generator",
    name: "Midjourney Prompt Generator",
    tagline: "Generate Midjourney prompts with style and parameters.",
    category: "prompt",
    priority: 92,
    description: "Build Midjourney prompts with visual style, composition, aspect ratio, stylize guidance, and iteration notes.",
    keywords: ["Midjourney prompt generator", "MJ prompt", "Midjourney prompts"],
    fields: [
      { name: "subject", label: "Subject", type: "text", required: true, placeholder: "Example: a neon-lit rainy street in a future city" },
      { name: "style", label: "Style keywords", type: "text", placeholder: "Example: cinematic, neon noir, ultra detailed, high contrast" },
      { name: "ar", label: "Aspect ratio", type: "select", defaultValue: "--ar 16:9", options: [
        { label: "16:9", value: "--ar 16:9" },
        { label: "1:1", value: "--ar 1:1" },
        { label: "9:16", value: "--ar 9:16" },
        { label: "3:2", value: "--ar 3:2" }
      ]}
    ],
    examples: ["Movie poster", "SaaS hero visual", "Game concept art", "Editorial cover"],
    howItWorks: ["Builds a high-signal subject phrase", "Adds style and composition language", "Appends Midjourney parameters", "Suggests iteration settings"],
    useCases: ["Midjourney image generation", "Concept art", "Campaign visuals", "Creator covers"],
    relatedSlugs: ["image-prompt-generator", "stable-diffusion-prompt-generator", "product-photo-prompt-generator"],
    monetization: "free"
  },
  {
    slug: "stable-diffusion-prompt-generator",
    name: "Stable Diffusion Prompt Generator",
    tagline: "Generate positive and negative prompts for SDXL.",
    category: "prompt",
    priority: 91,
    description: "Create Stable Diffusion and SDXL prompts with positive prompt, negative prompt, size guidance, and parameter suggestions.",
    keywords: ["Stable Diffusion prompt generator", "SDXL prompt", "negative prompt"],
    fields: [
      { name: "subject", label: "Subject", type: "text", required: true, placeholder: "Example: white running shoe product photo" },
      { name: "style", label: "Style", type: "select", defaultValue: "photorealistic", options: [
        { label: "Photorealistic", value: "photorealistic" },
        { label: "Anime", value: "anime" },
        { label: "3D render", value: "3d render" },
        { label: "Poster design", value: "poster design" }
      ]},
      { name: "negative", label: "Things to avoid", type: "textarea", placeholder: "Example: blurry, watermark, bad anatomy, random text, distorted logo" }
    ],
    examples: ["SDXL product shot", "Anime character", "Realistic portrait", "Poster graphic"],
    howItWorks: ["Generates a positive prompt", "Generates a negative prompt", "Adds SDXL-friendly size and parameter guidance", "Suggests optional ControlNet/reference image use"],
    useCases: ["Stable Diffusion generation", "LoRA testing", "Product visuals", "Local AI image workflows"],
    relatedSlugs: ["image-prompt-generator", "product-photo-prompt-generator", "midjourney-prompt-generator"],
    monetization: "free"
  },
  {
    slug: "product-photo-prompt-generator",
    name: "Product Photo Prompt Generator",
    tagline: "Create commercial product photography prompts.",
    category: "prompt",
    priority: 90,
    description: "Generate prompt-ready product photography setups for ecommerce, landing pages, ads, and social posts.",
    keywords: ["product photography prompt", "AI product photo", "ecommerce product image prompt"],
    fields: [
      { name: "product", label: "Product", type: "text", required: true, placeholder: "Example: a premium vitamin C serum bottle" },
      { name: "audience", label: "Target audience", type: "text", placeholder: "Example: urban women ages 25-35" },
      { name: "mood", label: "Visual mood", type: "select", defaultValue: "premium", options: [
        { label: "Premium", value: "premium" },
        { label: "Natural", value: "natural" },
        { label: "Tech", value: "tech" },
        { label: "Holiday campaign", value: "festival" }
      ]}
    ],
    examples: ["Skincare hero image", "Headphones ecommerce shot", "Food brand ad", "SaaS device mockup"],
    howItWorks: ["Extracts product and buyer context", "Chooses a commercial photography direction", "Adds lighting, material, composition, and headline space", "Returns platform-specific usage notes"],
    useCases: ["Ecommerce hero images", "Product ads", "Landing page visuals", "Social media product posts"],
    relatedSlugs: ["image-prompt-generator", "youtube-thumbnail-prompt-generator", "stable-diffusion-prompt-generator"],
    monetization: "freemium"
  },
  {
    slug: "youtube-thumbnail-prompt-generator",
    name: "YouTube Thumbnail Prompt Generator",
    tagline: "Generate thumbnail prompts with clear subject and headline space.",
    category: "prompt",
    priority: 88,
    description: "Create AI image prompts for YouTube thumbnail backgrounds, creator visuals, and high-contrast title-safe compositions.",
    keywords: ["YouTube thumbnail prompt", "AI thumbnail generator", "thumbnail prompt generator"],
    fields: [
      { name: "topic", label: "Video topic", type: "text", required: true, placeholder: "Example: I tested 10 AI tools for freelancers" },
      { name: "style", label: "Thumbnail style", type: "select", defaultValue: "bold", options: [
        { label: "Bold educational", value: "bold" },
        { label: "Cinematic tech", value: "cinematic" },
        { label: "Minimal premium", value: "minimal" },
        { label: "Energetic creator", value: "energetic" }
      ]},
      { name: "headline", label: "Headline text", type: "text", placeholder: "Example: 10 AI Tools I Actually Use" }
    ],
    examples: ["AI tools ranking", "Coding tutorial", "Productivity video", "Startup story"],
    howItWorks: ["Defines the visual hook", "Creates a title-safe composition", "Adds contrast and focal point guidance", "Suggests headline and layout notes"],
    useCases: ["YouTube thumbnails", "Course covers", "Video ads", "Creator branding"],
    relatedSlugs: ["youtube-script-generator", "image-prompt-generator", "video-prompt-generator"],
    monetization: "free"
  },
  {
    slug: "prompt-optimizer",
    name: "Prompt Optimizer",
    tagline: "Rewrite vague prompts into structured, reusable instructions.",
    category: "prompt",
    priority: 87,
    description: "Improve an existing prompt by adding role, goal, context, constraints, output format, evaluation criteria, and iteration steps.",
    keywords: ["prompt optimizer", "improve prompt", "AI prompt enhancer"],
    fields: [
      { name: "prompt", label: "Original prompt", type: "textarea", required: true, placeholder: "Paste your current prompt here." },
      { name: "goal", label: "Goal", type: "text", placeholder: "Example: Make it more structured and less generic." },
      { name: "format", label: "Preferred output format", type: "select", defaultValue: "markdown", options: [
        { label: "Markdown", value: "markdown" },
        { label: "Table", value: "table" },
        { label: "JSON", value: "json" },
        { label: "Checklist", value: "checklist" }
      ]}
    ],
    examples: ["Improve this ChatGPT prompt", "Make my image prompt more detailed", "Create a reusable research prompt", "Turn this into a JSON prompt"],
    howItWorks: ["Identifies missing context", "Adds constraints and output requirements", "Defines the assistant role and success criteria", "Returns a reusable prompt template"],
    useCases: ["ChatGPT prompts", "Reusable team workflows", "Prompt libraries", "Structured outputs"],
    relatedSlugs: ["prompt-translator", "ai-tool-finder", "text-cleanup-tool"],
    monetization: "free"
  },
  {
    slug: "prompt-translator",
    name: "Prompt Translator",
    tagline: "Convert rough notes into polished English prompts.",
    category: "prompt",
    priority: 84,
    description: "Translate or rewrite rough multilingual notes into clear English prompts that work better with global AI tools.",
    keywords: ["prompt translator", "English prompt", "translate prompt", "prompt rewrite"],
    fields: [
      { name: "input", label: "Raw idea or prompt", type: "textarea", required: true, placeholder: "Paste your rough idea, notes, or non-English prompt." },
      { name: "target", label: "Target use", type: "select", defaultValue: "general", options: [
        { label: "General chatbot", value: "general" },
        { label: "Image model", value: "image" },
        { label: "Video model", value: "video" },
        { label: "Coding assistant", value: "coding" }
      ]}
    ],
    examples: ["Turn my rough idea into an English image prompt", "Rewrite for ChatGPT", "Make this prompt concise", "Translate this coding request"],
    howItWorks: ["Preserves the intent", "Rewrites into clear English", "Adds model-specific structure", "Includes a short version and a detailed version"],
    useCases: ["Global AI tools", "Image prompts", "Video prompts", "Prompt libraries"],
    relatedSlugs: ["prompt-optimizer", "image-prompt-generator", "text-cleanup-tool"],
    monetization: "free"
  },
  {
    slug: "error-explainer",
    name: "Error Explainer",
    tagline: "Paste an error and get likely causes and fixes.",
    category: "dev",
    priority: 89,
    description: "A developer-focused error explanation tool that turns stack traces and error messages into causes, checks, fixes, and prevention notes.",
    keywords: ["error explainer", "debug error", "stack trace explainer", "developer tool"],
    fields: [
      { name: "error", label: "Error message or stack trace", type: "textarea", required: true, placeholder: "Paste your error message, stack trace, or failing log output." },
      { name: "context", label: "Context", type: "text", placeholder: "Example: Next.js 14, TypeScript, Vercel build" }
    ],
    examples: ["TypeError: Cannot read properties of undefined", "Module not found: Can't resolve", "Hydration failed", "SQL syntax error near FROM"],
    howItWorks: ["Detects likely error category", "Extracts suspect keywords", "Suggests fixes in order", "Adds prevention and verification steps"],
    useCases: ["Debugging", "Developer onboarding", "Stack trace triage", "Support documentation"],
    relatedSlugs: ["code-explainer", "json-fixer", "yaml-fixer"],
    monetization: "free"
  },
  {
    slug: "regex-generator",
    name: "Regex Generator",
    tagline: "Describe a pattern and get a regex with examples.",
    category: "dev",
    priority: 86,
    description: "Generate practical regex patterns, sample matches, and implementation notes for common validation and extraction tasks.",
    keywords: ["regex generator", "regular expression generator", "regex examples"],
    fields: [
      { name: "pattern", label: "Pattern to match", type: "textarea", required: true, placeholder: "Example: Match a US phone number, email address, or invoice ID like INV-2026-0042." },
      { name: "flavor", label: "Regex flavor", type: "select", defaultValue: "javascript", options: [
        { label: "JavaScript", value: "javascript" },
        { label: "Python", value: "python" },
        { label: "PCRE", value: "pcre" }
      ]}
    ],
    examples: ["Match an email address", "Match a US phone number", "Extract invoice IDs", "Validate a slug"],
    howItWorks: ["Classifies the pattern", "Builds a conservative expression", "Shows sample matches", "Explains limitations and escaping"],
    useCases: ["Form validation", "Log extraction", "Data cleanup", "Developer utilities"],
    relatedSlugs: ["json-fixer", "sql-generator", "code-explainer"],
    monetization: "free"
  },
  {
    slug: "sql-generator",
    name: "SQL Query Generator",
    tagline: "Turn a plain-English data request into SQL.",
    category: "dev",
    priority: 85,
    description: "Draft SQL queries from plain-English requirements, including SELECT structure, filters, grouping, ordering, and safety notes.",
    keywords: ["SQL generator", "AI SQL query", "SQL query builder"],
    fields: [
      { name: "request", label: "Data request", type: "textarea", required: true, placeholder: "Example: Show monthly revenue by plan for active users in the last 12 months." },
      { name: "schema", label: "Table/schema notes", type: "textarea", placeholder: "Example: users(id, plan, created_at), payments(user_id, amount, paid_at)" },
      { name: "dialect", label: "SQL dialect", type: "select", defaultValue: "postgres", options: [
        { label: "PostgreSQL", value: "postgres" },
        { label: "MySQL", value: "mysql" },
        { label: "BigQuery", value: "bigquery" },
        { label: "SQLite", value: "sqlite" }
      ]}
    ],
    examples: ["Monthly revenue by plan", "Top users by usage", "Find duplicate emails", "Conversion funnel query"],
    howItWorks: ["Translates intent into query parts", "Uses schema hints when provided", "Adds comments and assumptions", "Includes validation checks"],
    useCases: ["Analytics", "Internal dashboards", "Data exploration", "SQL learning"],
    relatedSlugs: ["regex-generator", "error-explainer", "json-fixer"],
    monetization: "free"
  },
  {
    slug: "json-fixer",
    name: "JSON Fixer",
    tagline: "Repair common JSON formatting mistakes.",
    category: "dev",
    priority: 84,
    description: "Fix common JSON issues such as trailing commas, single quotes, unquoted keys, and accidental code fences.",
    keywords: ["JSON fixer", "fix JSON", "JSON formatter", "JSON validator"],
    fields: [
      { name: "json", label: "JSON or JSON-like text", type: "textarea", required: true, placeholder: "Paste broken JSON here." }
    ],
    examples: ["{'name':'7labs',}", "```json { name: 'demo' } ```", "Array with trailing comma", "Unquoted keys"],
    howItWorks: ["Removes code fences", "Normalizes quotes and keys", "Attempts parsing and formatting", "Reports if manual repair is still needed"],
    useCases: ["API debugging", "Config cleanup", "LLM output repair", "Data formatting"],
    relatedSlugs: ["yaml-fixer", "api-to-curl-converter", "error-explainer"],
    monetization: "free"
  },
  {
    slug: "yaml-fixer",
    name: "YAML Fixer",
    tagline: "Explain and repair common YAML problems.",
    category: "dev",
    priority: 83,
    description: "Identify likely YAML indentation, quoting, list, and boolean issues, then provide a cleaner version and troubleshooting checklist.",
    keywords: ["YAML fixer", "fix YAML", "YAML validator", "YAML indentation"],
    fields: [
      { name: "yaml", label: "YAML text", type: "textarea", required: true, placeholder: "Paste YAML here." },
      { name: "context", label: "Context", type: "text", placeholder: "Example: GitHub Actions, Docker Compose, Kubernetes" }
    ],
    examples: ["GitHub Actions workflow", "Docker Compose config", "Kubernetes YAML", "Frontmatter"],
    howItWorks: ["Checks indentation-like patterns", "Flags risky scalars", "Gives a cleaned template", "Suggests validator commands"],
    useCases: ["DevOps configs", "GitHub Actions", "Kubernetes", "Static site frontmatter"],
    relatedSlugs: ["json-fixer", "error-explainer", "git-command-generator"],
    monetization: "free"
  },
  {
    slug: "git-command-generator",
    name: "Git Command Generator",
    tagline: "Describe a Git task and get a safe command sequence.",
    category: "dev",
    priority: 82,
    description: "Generate Git command sequences for everyday tasks with warnings for destructive operations.",
    keywords: ["Git command generator", "git commands", "AI git helper"],
    fields: [
      { name: "task", label: "Git task", type: "textarea", required: true, placeholder: "Example: I want to undo my last commit but keep the changes staged." },
      { name: "risk", label: "Risk tolerance", type: "select", defaultValue: "safe", options: [
        { label: "Safe commands only", value: "safe" },
        { label: "Allow advanced commands with warnings", value: "advanced" }
      ]}
    ],
    examples: ["Undo last commit but keep changes", "Create a new branch", "Rebase feature branch", "Stash uncommitted changes"],
    howItWorks: ["Maps intent to common Git workflows", "Adds verification commands", "Warns before destructive commands", "Explains each step"],
    useCases: ["Git learning", "Daily development", "Release workflows", "Debugging repo states"],
    relatedSlugs: ["error-explainer", "code-explainer", "cron-generator"],
    monetization: "free"
  },
  {
    slug: "cron-generator",
    name: "Cron Expression Generator",
    tagline: "Convert schedules into cron expressions.",
    category: "dev",
    priority: 81,
    description: "Generate cron expressions and plain-English explanations for scheduled jobs.",
    keywords: ["cron generator", "cron expression", "schedule generator"],
    fields: [
      { name: "schedule", label: "Schedule", type: "text", required: true, placeholder: "Example: every weekday at 9:30 AM" },
      { name: "format", label: "Format", type: "select", defaultValue: "standard", options: [
        { label: "Standard 5-field cron", value: "standard" },
        { label: "Quartz 6/7-field", value: "quartz" }
      ]}
    ],
    examples: ["Every day at midnight", "Every weekday at 9 AM", "Every 15 minutes", "First day of every month"],
    howItWorks: ["Recognizes common schedules", "Returns cron expression", "Explains each field", "Adds timezone reminder"],
    useCases: ["Scheduled jobs", "DevOps", "Automation", "Data pipelines"],
    relatedSlugs: ["git-command-generator", "sql-generator", "timestamp-converter"],
    monetization: "free"
  },
  {
    slug: "code-explainer",
    name: "Code Explainer",
    tagline: "Paste code and get a concise explanation.",
    category: "dev",
    priority: 80,
    description: "Explain what a code snippet does, important inputs/outputs, possible risks, and refactoring opportunities.",
    keywords: ["code explainer", "explain code", "AI code explanation"],
    fields: [
      { name: "code", label: "Code snippet", type: "textarea", required: true, placeholder: "Paste a code snippet here." },
      { name: "level", label: "Explanation level", type: "select", defaultValue: "practical", options: [
        { label: "Beginner", value: "beginner" },
        { label: "Practical developer", value: "practical" },
        { label: "Architecture review", value: "architecture" }
      ]}
    ],
    examples: ["Explain this React hook", "Explain this SQL query", "Explain this Python function", "Review this API route"],
    howItWorks: ["Detects likely language", "Summarizes behavior", "Lists inputs, outputs, and side effects", "Adds risks and improvement ideas"],
    useCases: ["Learning code", "Code review", "Documentation", "Debugging"],
    relatedSlugs: ["error-explainer", "typescript-type-generator", "regex-generator"],
    monetization: "free"
  },
  {
    slug: "api-to-curl-converter",
    name: "API to cURL Converter",
    tagline: "Turn API request notes into a cURL command.",
    category: "dev",
    priority: 79,
    description: "Generate a copy-ready cURL command from method, URL, headers, and request body notes.",
    keywords: ["API to curl", "curl generator", "API request generator"],
    fields: [
      { name: "method", label: "HTTP method", type: "select", defaultValue: "GET", options: [
        { label: "GET", value: "GET" },
        { label: "POST", value: "POST" },
        { label: "PUT", value: "PUT" },
        { label: "PATCH", value: "PATCH" },
        { label: "DELETE", value: "DELETE" }
      ]},
      { name: "url", label: "URL", type: "text", required: true, placeholder: "https://api.example.com/v1/items" },
      { name: "headers", label: "Headers", type: "textarea", placeholder: "Authorization: Bearer YOUR_TOKEN\nContent-Type: application/json" },
      { name: "body", label: "Body", type: "textarea", placeholder: "{ \"name\": \"demo\" }" }
    ],
    examples: ["POST JSON request", "GET with Bearer token", "PATCH user profile", "Delete a resource"],
    howItWorks: ["Combines method and URL", "Adds headers safely", "Adds body when relevant", "Returns notes for testing"],
    useCases: ["API docs", "Testing endpoints", "Debugging integrations", "Support snippets"],
    relatedSlugs: ["json-fixer", "error-explainer", "typescript-type-generator"],
    monetization: "free"
  },
  {
    slug: "typescript-type-generator",
    name: "TypeScript Type Generator",
    tagline: "Generate TypeScript interfaces from JSON samples.",
    category: "dev",
    priority: 78,
    description: "Create a pragmatic TypeScript interface from a JSON sample, with optional types and nested object handling.",
    keywords: ["TypeScript type generator", "JSON to TypeScript", "interface generator"],
    fields: [
      { name: "json", label: "JSON sample", type: "textarea", required: true, placeholder: "Paste a JSON object or array sample." },
      { name: "name", label: "Root type name", type: "text", defaultValue: "Root", placeholder: "Example: UserProfile" }
    ],
    examples: ["JSON API response", "User profile object", "Product catalog item", "Analytics event"],
    howItWorks: ["Parses sample JSON", "Infers primitive and nested types", "Handles arrays", "Returns an editable TypeScript interface"],
    useCases: ["Frontend API typing", "SDK generation", "Documentation", "TypeScript learning"],
    relatedSlugs: ["json-fixer", "code-explainer", "api-to-curl-converter"],
    monetization: "free"
  },
  {
    slug: "pdf-summarizer",
    name: "PDF Summarizer",
    tagline: "Paste document text and get a structured summary.",
    category: "docs",
    priority: 88,
    description: "Summarize pasted PDF or document text into key points, keywords, next actions, and reliability notes. Production version should add file upload and source citations.",
    keywords: ["PDF summarizer", "summarize PDF", "document summary", "AI PDF tool"],
    fields: [
      { name: "text", label: "Document text", type: "textarea", required: true, placeholder: "Paste extracted PDF or document text here." },
      { name: "style", label: "Summary style", type: "select", defaultValue: "executive", options: [
        { label: "Executive summary", value: "executive" },
        { label: "Action items", value: "actions" },
        { label: "Outline", value: "outline" }
      ]}
    ],
    examples: ["Research paper abstract and sections", "Business report", "Meeting transcript", "Product requirements doc"],
    howItWorks: ["Splits text into meaningful sentences", "Extracts keywords", "Creates a structured summary", "Adds next steps and reliability warnings"],
    useCases: ["PDF summaries", "Report review", "Meeting notes", "Research triage"],
    relatedSlugs: ["chat-with-pdf", "research-paper-explainer", "meeting-notes-generator"],
    monetization: "freemium"
  },
  {
    slug: "chat-with-pdf",
    name: "Chat with PDF",
    tagline: "Ask a question about pasted document text.",
    category: "docs",
    priority: 86,
    description: "Ask a question about a document and get an answer with relevant excerpts from pasted text. Production version should use chunking, embeddings, and page citations.",
    keywords: ["chat with PDF", "PDF question answering", "ask PDF", "document Q&A"],
    fields: [
      { name: "text", label: "Document text", type: "textarea", required: true, placeholder: "Paste document text here." },
      { name: "question", label: "Question", type: "text", required: true, placeholder: "Example: What are the top risks mentioned in this report?" }
    ],
    examples: ["What are the risks?", "What should we do next?", "Summarize the methodology", "Find pricing assumptions"],
    howItWorks: ["Extracts question keywords", "Finds relevant text snippets", "Returns a cautious answer", "Separates answer from evidence"],
    useCases: ["Document Q&A", "Research review", "Client report analysis", "Knowledge-base MVP"],
    relatedSlugs: ["pdf-summarizer", "research-paper-explainer", "meeting-notes-generator"],
    monetization: "pro"
  },
  {
    slug: "research-paper-explainer",
    name: "Research Paper Explainer",
    tagline: "Turn a paper abstract into a plain-English explanation.",
    category: "docs",
    priority: 84,
    description: "Explain a paper's problem, method, findings, limitations, and practical implications from an abstract or pasted section.",
    keywords: ["research paper explainer", "paper summary", "explain research paper"],
    fields: [
      { name: "paper", label: "Abstract or paper text", type: "textarea", required: true, placeholder: "Paste an abstract, introduction, or paper section." },
      { name: "audience", label: "Audience", type: "select", defaultValue: "general", options: [
        { label: "General reader", value: "general" },
        { label: "Product team", value: "product" },
        { label: "Technical team", value: "technical" }
      ]}
    ],
    examples: ["Explain a machine learning paper", "Summarize a medical abstract", "Turn a paper into product implications", "Identify limitations"],
    howItWorks: ["Identifies problem and method", "Extracts likely contributions", "Notes limitations and missing evidence", "Reframes for the chosen audience"],
    useCases: ["Academic reading", "R&D triage", "Product research", "Literature reviews"],
    relatedSlugs: ["pdf-summarizer", "chat-with-pdf", "meeting-notes-generator"],
    monetization: "freemium"
  },
  {
    slug: "resume-optimizer",
    name: "Resume Optimizer",
    tagline: "Improve resume bullets for a target role.",
    category: "docs",
    priority: 82,
    description: "Rewrite resume bullets with stronger action verbs, measurable outcomes, and role-specific positioning.",
    keywords: ["resume optimizer", "AI resume bullet generator", "resume rewrite"],
    fields: [
      { name: "resume", label: "Resume bullets or experience", type: "textarea", required: true, placeholder: "Paste resume bullets or work experience." },
      { name: "role", label: "Target role", type: "text", required: true, placeholder: "Example: Product Manager, Data Analyst, Frontend Engineer" }
    ],
    examples: ["Optimize product manager bullets", "Rewrite software engineer experience", "Make resume more measurable", "Tailor for data analyst role"],
    howItWorks: ["Detects weak bullets", "Adds action-result structure", "Suggests metrics to collect", "Keeps claims realistic"],
    useCases: ["Job applications", "Career coaching", "Portfolio updates", "LinkedIn profile copy"],
    relatedSlugs: ["linkedin-post-generator", "prompt-optimizer", "meeting-notes-generator"],
    monetization: "freemium"
  },
  {
    slug: "meeting-notes-generator",
    name: "Meeting Notes Generator",
    tagline: "Turn messy notes into decisions and action items.",
    category: "docs",
    priority: 81,
    description: "Convert rough meeting notes into summary, decisions, action items, owners, open questions, and follow-up email draft.",
    keywords: ["meeting notes generator", "meeting summary", "action items generator"],
    fields: [
      { name: "notes", label: "Raw meeting notes", type: "textarea", required: true, placeholder: "Paste rough notes or transcript excerpts." },
      { name: "tone", label: "Follow-up tone", type: "select", defaultValue: "professional", options: [
        { label: "Professional", value: "professional" },
        { label: "Concise", value: "concise" },
        { label: "Friendly", value: "friendly" }
      ]}
    ],
    examples: ["Team standup notes", "Client call recap", "Sales discovery call", "Product planning meeting"],
    howItWorks: ["Groups notes by theme", "Extracts decisions and actions", "Adds open questions", "Drafts a follow-up email"],
    useCases: ["Team meetings", "Client calls", "Sales notes", "Project management"],
    relatedSlugs: ["pdf-summarizer", "chat-with-pdf", "resume-optimizer"],
    monetization: "freemium"
  },
  {
    slug: "youtube-script-generator",
    name: "YouTube Script Generator",
    tagline: "Create a structured video script from a topic.",
    category: "creator",
    priority: 80,
    description: "Generate a YouTube script outline with hook, promise, sections, examples, transitions, and call-to-action.",
    keywords: ["YouTube script generator", "AI video script", "creator script"],
    fields: [
      { name: "topic", label: "Video topic", type: "text", required: true, placeholder: "Example: The best AI tools for freelancers in 2026" },
      { name: "audience", label: "Audience", type: "text", placeholder: "Example: freelancers, indie hackers, marketers" },
      { name: "length", label: "Length", type: "select", defaultValue: "8min", options: [
        { label: "Short: 3-5 minutes", value: "5min" },
        { label: "Standard: 8-10 minutes", value: "8min" },
        { label: "Deep dive: 15+ minutes", value: "15min" }
      ]}
    ],
    examples: ["AI tools for freelancers", "How I built a SaaS in 30 days", "Best Notion setup", "Beginner coding tutorial"],
    howItWorks: ["Creates a hook and promise", "Breaks the topic into sections", "Adds examples and transitions", "Ends with CTA and thumbnail ideas"],
    useCases: ["YouTube creators", "Course videos", "Explainer videos", "Launch videos"],
    relatedSlugs: ["youtube-thumbnail-prompt-generator", "tiktok-hook-generator", "newsletter-outline-generator"],
    monetization: "free"
  },
  {
    slug: "tiktok-hook-generator",
    name: "TikTok Hook Generator",
    tagline: "Generate punchy hooks for short-form videos.",
    category: "creator",
    priority: 78,
    description: "Create short-form video hooks with curiosity, contrast, stakes, and fast openers for TikTok, Reels, and Shorts.",
    keywords: ["TikTok hook generator", "short video hooks", "Reels hook", "YouTube Shorts hook"],
    fields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "Example: AI tools that save 10 hours per week" },
      { name: "style", label: "Hook style", type: "select", defaultValue: "curiosity", options: [
        { label: "Curiosity", value: "curiosity" },
        { label: "Contrarian", value: "contrarian" },
        { label: "Problem-solution", value: "problem" },
        { label: "Story", value: "story" }
      ]}
    ],
    examples: ["AI productivity hacks", "Freelancer tools", "Before/after case study", "Coding tip"],
    howItWorks: ["Identifies audience pain", "Creates multiple hook styles", "Adds opening shot ideas", "Suggests CTA variants"],
    useCases: ["TikTok", "Instagram Reels", "YouTube Shorts", "Launch teasers"],
    relatedSlugs: ["youtube-script-generator", "linkedin-post-generator", "youtube-thumbnail-prompt-generator"],
    monetization: "free"
  },
  {
    slug: "linkedin-post-generator",
    name: "LinkedIn Post Generator",
    tagline: "Turn an idea into a professional LinkedIn post.",
    category: "creator",
    priority: 77,
    description: "Draft LinkedIn posts for launches, lessons learned, case studies, hiring updates, and thought leadership.",
    keywords: ["LinkedIn post generator", "AI LinkedIn post", "professional social media copy"],
    fields: [
      { name: "idea", label: "Post idea", type: "textarea", required: true, placeholder: "Example: What I learned building a tool-first AI website instead of a blog." },
      { name: "tone", label: "Tone", type: "select", defaultValue: "insightful", options: [
        { label: "Insightful", value: "insightful" },
        { label: "Founder story", value: "founder" },
        { label: "Tactical", value: "tactical" },
        { label: "Concise", value: "concise" }
      ]}
    ],
    examples: ["Founder lesson", "Product launch", "Case study", "Hiring announcement"],
    howItWorks: ["Creates a strong first line", "Structures the narrative", "Adds bullets or short paragraphs", "Suggests CTA and hashtags"],
    useCases: ["Founder updates", "B2B marketing", "Career content", "Product launches"],
    relatedSlugs: ["resume-optimizer", "newsletter-outline-generator", "product-description-generator"],
    monetization: "free"
  },
  {
    slug: "product-description-generator",
    name: "Product Description Generator",
    tagline: "Create product copy from features and audience.",
    category: "creator",
    priority: 76,
    description: "Turn product features into clear benefits, ecommerce descriptions, landing page copy, and ad angles.",
    keywords: ["product description generator", "ecommerce copy generator", "AI product copy"],
    fields: [
      { name: "product", label: "Product", type: "text", required: true, placeholder: "Example: AI-powered meeting notes app" },
      { name: "features", label: "Features", type: "textarea", required: true, placeholder: "Example: records calls, extracts action items, syncs with Slack" },
      { name: "audience", label: "Audience", type: "text", placeholder: "Example: busy startup teams" }
    ],
    examples: ["SaaS landing page copy", "Amazon listing", "Shopify product description", "Ad angles"],
    howItWorks: ["Separates features from benefits", "Writes concise product copy", "Adds bullet benefits", "Suggests ad angles and CTA"],
    useCases: ["Ecommerce", "SaaS landing pages", "Ads", "Product launches"],
    relatedSlugs: ["product-photo-prompt-generator", "linkedin-post-generator", "newsletter-outline-generator"],
    monetization: "freemium"
  },
  {
    slug: "newsletter-outline-generator",
    name: "Newsletter Outline Generator",
    tagline: "Turn a topic into a publishable newsletter structure.",
    category: "creator",
    priority: 75,
    description: "Create a newsletter outline with subject lines, intro, sections, examples, links-to-add, and CTA.",
    keywords: ["newsletter outline generator", "AI newsletter writer", "email newsletter"],
    fields: [
      { name: "topic", label: "Newsletter topic", type: "text", required: true, placeholder: "Example: 5 AI workflows that saved my team time this week" },
      { name: "audience", label: "Audience", type: "text", placeholder: "Example: founders and marketers" }
    ],
    examples: ["Weekly AI tools roundup", "Founder update", "Product launch newsletter", "Educational issue"],
    howItWorks: ["Generates subject line options", "Builds a scannable structure", "Adds practical sections", "Suggests CTA and link placeholders"],
    useCases: ["Newsletter creators", "Founder updates", "Marketing emails", "Community updates"],
    relatedSlugs: ["linkedin-post-generator", "prompt-optimizer", "text-cleanup-tool"],
    monetization: "free"
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    tagline: "Convert Unix timestamps and ISO dates quickly.",
    category: "utility",
    priority: 72,
    description: "Convert Unix timestamps, milliseconds, and ISO-like date strings into readable UTC and local time notes.",
    keywords: ["timestamp converter", "Unix timestamp", "epoch converter"],
    fields: [
      { name: "value", label: "Timestamp or date", type: "text", required: true, placeholder: "Example: 1717200000 or 2026-05-31T12:00:00Z" }
    ],
    examples: ["1717200000", "1717200000000", "2026-05-31T12:00:00Z", "May 31 2026"],
    howItWorks: ["Detects seconds, milliseconds, or date string", "Converts to ISO format", "Shows UTC and browser-local output", "Notes parsing assumptions"],
    useCases: ["Debugging logs", "API timestamps", "Analytics", "Scheduling"],
    relatedSlugs: ["cron-generator", "json-fixer", "api-to-curl-converter"],
    monetization: "free"
  },
  {
    slug: "text-cleanup-tool",
    name: "Text Cleanup Tool",
    tagline: "Clean messy text for prompts, docs, and publishing.",
    category: "utility",
    priority: 70,
    description: "Remove extra spaces, normalize line breaks, trim repeated blank lines, and prepare text for prompts or documents.",
    keywords: ["text cleanup", "clean text", "remove extra spaces", "prompt cleanup"],
    fields: [
      { name: "text", label: "Messy text", type: "textarea", required: true, placeholder: "Paste messy text here." },
      { name: "mode", label: "Cleanup mode", type: "select", defaultValue: "readable", options: [
        { label: "Readable paragraphs", value: "readable" },
        { label: "Single line", value: "single" },
        { label: "Bullet-ready", value: "bullets" }
      ]}
    ],
    examples: ["Clean copied website text", "Prepare transcript notes", "Normalize prompt text", "Remove extra line breaks"],
    howItWorks: ["Trims whitespace", "Normalizes repeated line breaks", "Applies the selected output style", "Keeps content unchanged where possible"],
    useCases: ["Prompt preparation", "Document cleanup", "Publishing", "Transcripts"],
    relatedSlugs: ["prompt-optimizer", "pdf-summarizer", "prompt-translator"],
    monetization: "free"
  }
] as BaseToolDefinition[]);

function withLaunchDetails(tool: BaseToolDefinition): ToolDefinition {
  const launchDetails = toolLaunchDetails[tool.slug];
  if (!launchDetails) {
    throw new Error(`Missing launch details for tool: ${tool.slug}`);
  }
  return { ...tool, ...launchDetails };
}

export const tools: ToolDefinition[] = baseTools.map(withLaunchDetails).sort((a, b) => b.priority - a.priority);

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getRelatedTools(slugs: string[]): ToolDefinition[] {
  return slugs.map(getTool).filter((tool): tool is ToolDefinition => Boolean(tool));
}
