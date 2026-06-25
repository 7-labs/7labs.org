import { aiCatalog } from "./aiCatalog";

export type ToolValues = Record<string, string>;

const styleMap: Record<string, string> = {
  cinematic: "cinematic realism, dramatic lighting, shallow depth of field, high dynamic range, detailed textures",
  product: "premium product photography, studio lighting, clean background, crisp reflections, commercial advertising style",
  anime: "high quality anime illustration, expressive character design, clean line art, vibrant colors",
  minimal: "minimalist poster design, clean composition, generous whitespace, refined typography area",
  "3d": "high-end 3D render, realistic materials, soft shadows, detailed geometry",
  premium: "premium luxury visual, refined materials, elegant lighting, high-end commercial photography",
  natural: "fresh natural daylight, organic texture, warm atmosphere, lifestyle photography",
  tech: "futuristic technology aesthetic, sleek surfaces, cool lighting, clean gradients",
  festival: "holiday campaign visual, celebratory composition, premium promotional style",
  bold: "bold educational thumbnail, high contrast, strong focal point, title-safe space",
  energetic: "energetic creator thumbnail, expressive composition, vibrant colors, high contrast",
  photorealistic: "photorealistic, high detail, realistic materials, professional lighting",
  "3d render": "3D render, realistic materials, detailed geometry, soft studio light",
  "poster design": "poster design, strong graphic composition, bold visual hierarchy"
};

function val(values: ToolValues, key: string, fallback = ""): string {
  return (values[key] ?? fallback).toString().trim();
}

function truncate(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function extractKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[,.!?;:()[\]{}"'`*_#<>/\\|]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3);
  const stop = new Set(["the", "and", "for", "with", "this", "that", "from", "into", "need", "want", "tool", "tools", "create", "make", "help", "about", "using", "user", "users"]);
  return Array.from(new Set(tokens.filter((token) => !stop.has(token)))).slice(0, 14);
}

function sentenceSplit(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 24);
}

function section(title: string, body: string): string {
  return `## ${title}\n${body.trim()}`;
}

function list(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function makePromptBlock(title: string, body: string, negative?: string, params?: string): string {
  return `# ${title}\n\n## Prompt\n${body}\n\n${negative ? `## Negative Prompt\n${negative}\n\n` : ""}${params ? `## Parameters / Notes\n${params}\n\n` : ""}## Usage Notes\n- Generate 2-4 rough versions first, then iterate on the strongest composition.\n- Add final typography in a design tool when the model struggles with readable text.\n- Check brand, copyright, and likeness rights before commercial use.`;
}

function scoreSentence(sentence: string, keywords: string[]): number {
  const lower = sentence.toLowerCase();
  let score = keywords.reduce((acc, word) => acc + (lower.includes(word) ? 1 : 0), 0);
  if (/\d/.test(sentence)) score += 1;
  if (/\b(risk|decision|recommend|must|deadline|important|conclude|result|goal|priority)\b/.test(lower)) score += 1;
  return score;
}

function summarizeText(text: string, style = "executive"): string {
  const sentences = sentenceSplit(text);
  const keywords = extractKeywords(text).slice(0, 10);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(words / 200));
  const scored = sentences.map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence, keywords) }));
  const ordered = [...scored].sort((a, b) => b.score - a.score);
  const keyPoints = ordered.slice(0, 6).sort((a, b) => a.index - b.index).map(({ sentence }) => `- ${truncate(sentence, 190)}`).join("\n")
    || "- The pasted document is short. Add more source text for a more reliable summary.";
  const tldr = ordered[0] ? truncate(ordered[0].sentence, 220) : "Add more document text for a useful summary.";
  const modeBlock = style === "actions"
    ? section("Action Items", list(["Identify which decisions need an owner.", "Convert unresolved questions into follow-up tasks.", "Verify claims that do not include clear evidence in the source text."]))
    : style === "outline"
      ? section("Suggested Outline", "1. Background and goal\n2. Core argument\n3. Evidence or data\n4. Risks and limitations\n5. Recommended next steps")
      : section("Next Steps", list(["Separate factual claims from interpretation.", "Add page or paragraph citations before sharing with a team.", "Turn the summary into a decision memo if action is required."]));

  return `# Document Summary\n\n${section("TL;DR", tldr)}\n\n${section("Document stats", `~${words} words, ~${readMin} min read. Local extractive summary — no file parsing or external model call.`)}\n\n${section("Key Points", keyPoints)}\n\n${section("Keywords", keywords.length ? list(keywords) : "- No stable keywords extracted.")}\n\n${modeBlock}\n\n${section("Questions to verify", list(["Does the summary preserve the document's main claim?", "Are any numbers, dates, or names worth checking against the source?", "Is anything important missing because it was not in the pasted text?"]))}\n\n${section("Reliability Note", "This MVP uses local rule-based summarization. A production document tool should add PDF parsing, chunk retrieval, page citations, and human review for high-stakes decisions.")}`;
}

function aiToolFinder(values: ToolValues): string {
  const taskRaw = val(values, "task");
  const task = taskRaw.toLowerCase();
  const budget = val(values, "budget", "free");
  const workflow = val(values, "workflow", "individual");
  const keywords = extractKeywords(taskRaw);

  const scored = aiCatalog.map((tool) => {
    let score = 0;
    const haystack = `${tool.name} ${tool.category} ${tool.tags.join(" ")} ${tool.strengths.join(" ")}`.toLowerCase();
    for (const keyword of keywords) if (haystack.includes(keyword)) score += 2;
    if (/code|coding|debug|bug|developer|sql|regex|git|api|typescript/.test(task) && tool.category === "coding") score += 8;
    if (/image|photo|thumbnail|poster|midjourney|stable|diffusion|design/.test(task) && ["image", "design"].includes(tool.category)) score += 8;
    if (/video|short|tiktok|reel|youtube|runway|sora|veo/.test(task) && tool.category === "video") score += 8;
    if (/pdf|document|paper|research|report|resume|meeting|notes/.test(task) && ["docs", "writing"].includes(tool.category)) score += 8;
    if (/search|research|citation|current|sources/.test(task) && tool.category === "search") score += 8;
    if (/write|copy|content|newsletter|linkedin|marketing|product description/.test(task) && ["writing", "productivity", "design"].includes(tool.category)) score += 5;
    if (budget === "free" && tool.freeTier === "yes") score += 3;
    if (budget === "free" && tool.freeTier === "limited") score += 1;
    if (workflow === "developer" && tool.category === "coding") score += 4;
    if (workflow === "marketing" && ["writing", "design", "image", "video"].includes(tool.category)) score += 4;
    if (workflow === "research" && ["docs", "search"].includes(tool.category)) score += 4;
    return { tool, score };
  }).sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 5);
  const recommendations = top.map(({ tool }, index) => {
    return `### ${index + 1}. ${tool.name}\n- Category: ${tool.category}\n- Best for: ${tool.strengths.join("; ")}\n- Watch out: ${tool.limitations.join("; ")}\n- Free tier: ${tool.freeTier}\n- English workflow fit: ${tool.englishFit}\n- Website: ${tool.url}`;
  }).join("\n\n");
  const topPick = top[0]?.tool;
  const budgetNote = budget === "free"
    ? "You prefer free or freemium tools, so the ranking rewards a real free tier."
    : budget === "low"
      ? "A low-cost subscription is acceptable, so strong paid tools are included."
      : "Quality is the priority, so capable premium tools are weighted higher.";
  const workflowNote = workflow === "developer"
    ? "Workflow: developer — coding-first tools rank higher."
    : workflow === "marketing"
      ? "Workflow: marketing — writing, design, and media tools rank higher."
      : workflow === "research"
        ? "Workflow: research — document and search tools rank higher."
        : "Workflow: individual creator — general, low-friction tools rank higher.";
  const watchOuts = top.slice(0, 3).map(({ tool }) => tool.limitations[0]).filter(Boolean);

  const nextStepMap: Record<string, [string, string][]> = {
    developer: [
      ["/tools/error-explainer", "decode a stack trace and get a debugging plan"],
      ["/tools/regex-generator", "draft a tested pattern for parsing or validation"]
    ],
    marketing: [
      ["/tools/youtube-script-generator", "turn the topic into a retention-focused video outline"],
      ["/tools/linkedin-post-generator", "spin the same idea into a ready-to-post update"]
    ],
    research: [
      ["/tools/pdf-summarizer", "compress a long document into key points"],
      ["/tools/research-paper-explainer", "get a plain-English breakdown of a paper"]
    ]
  };
  const nextSteps: [string, string][] = [
    ["/tools/prompt-optimizer", "structure your task into a reusable prompt"],
    ...(nextStepMap[workflow] ?? [
      ["/tools/image-prompt-generator", "craft a detailed image prompt for your idea"],
      ["/tools/youtube-thumbnail-prompt-generator", "design a click-ready thumbnail prompt"]
    ] as [string, string][])
  ];
  const nextStepsBlock = section(
    "Do this next in 7labs",
    `These free 7labs tools turn this recommendation into output without leaving the site:\n${list(nextSteps.map(([href, why]) => `[${href.replace("/tools/", "").replace(/-/g, " ")}](${href}) — ${why}`))}`
  );

  return `# AI Tool Stack Recommendation\n\n${section("Your task", taskRaw || "Describe what you want to accomplish.")}\n\n${topPick ? section("Top pick", `${topPick.name} — ${topPick.strengths[0] ?? "best overall fit for this task"}. Free tier: ${topPick.freeTier}. English fit: ${topPick.englishFit}.`) + "\n\n" : ""}${recommendations}\n\n${section("Budget & workflow fit", `${budgetNote}\n${workflowNote}`)}\n\n${section("Watch-outs", list(watchOuts.length ? watchOuts : ["Free-tier limits and pricing change often — confirm before you commit."]))}\n\n${section("Recommended Workflow", "1. Use 7labs to structure the task and generate a reusable prompt.\n2. Use the top recommended tool for the core output.\n3. Use a second tool only for review, formatting, or platform-specific polish.\n4. Save the winning prompt and turn repeat tasks into a checklist.")}\n\n${section("Copy-ready Prompt", `Act as an AI tools consultant. Recommend the best three tools for this task. Explain best-fit scenario, pricing/free-tier concerns, limitations, and the exact workflow. Task: ${taskRaw}`)}\n\n${nextStepsBlock}`;
}

const catalogAliases: { match: RegExp; name: string }[] = [
  { match: /chat\s*gpt|openai|gpt-?[45]|^gpt$/i, name: "ChatGPT" },
  { match: /claude|anthropic/i, name: "Claude" },
  { match: /gemini|bard/i, name: "Google Gemini" },
  { match: /perplexity/i, name: "Perplexity" },
  { match: /cursor/i, name: "Cursor" },
  { match: /copilot/i, name: "GitHub Copilot" },
  { match: /windsurf/i, name: "Windsurf" },
  { match: /midjourney/i, name: "Midjourney" },
  { match: /stable\s*diffusion|sdxl|stability/i, name: "Stable Diffusion / SDXL" },
  { match: /canva/i, name: "Canva AI" },
  { match: /runway/i, name: "Runway" },
  { match: /notion/i, name: "Notion AI" }
];

function findCatalogTool(name: string): (typeof aiCatalog)[number] | undefined {
  const target = catalogAliases.find((entry) => entry.match.test(name))?.name;
  return aiCatalog.find((tool) => (target ? tool.name === target : tool.name.toLowerCase() === name.toLowerCase()));
}

function comparisonGenerator(values: ToolValues): string {
  const toolNames = val(values, "tools");
  const task = val(values, "task");
  const criteria = val(values, "criteria", "quality, price, speed, ease of use, reliability").split(/,|\n/).map((item) => item.trim()).filter(Boolean);
  const names = toolNames.split(/,|\bvs\b|\n/i).map((item) => item.trim()).filter(Boolean).slice(0, 4);
  let matched = 0;
  const rows = names.map((name) => {
    const hit = findCatalogTool(name);
    if (!hit) return `| ${name} | Not in the 7labs catalog — test it on your own task | Verify pricing, privacy, output quality, and export limits | unknown | unknown |`;
    matched += 1;
    return `| ${hit.name} | ${hit.strengths.slice(0, 2).join("; ")} | ${hit.limitations.slice(0, 2).join("; ")} | ${hit.freeTier} | ${hit.englishFit} |`;
  }).join("\n");
  const readNote = matched
    ? "Rows for tools in the 7labs catalog use curated strengths and limitations. Always verify current pricing and feature limits on each tool's official site before deciding."
    : "These tools are not in the 7labs catalog, so the table shows a neutral checklist. Run each one on your real task before committing.";
  return `# AI Tool Comparison\n\n${section("Decision context", task || "Define the specific job you need the tool to do.")}\n\n## Criteria\n${list(criteria)}\n\n## Comparison\n| Tool | Strengths | Watch-outs | Free tier | English fit |\n|---|---|---|---|---|\n${rows}\n\n${section("How to read this", readNote)}\n\n${section("Recommended Decision Process", `1. Run the SAME representative task in every tool.\n2. Score each tool against your criteria: ${criteria.join(", ")}.\n3. Compare output quality, time-to-result, and editing effort.\n4. Check pricing, data privacy, and team sharing before scaling.\n5. Pick one primary tool and one backup, not five overlapping subscriptions.`)}\n\n${section("Copy-ready evaluation prompt", `Act as a neutral AI tools analyst. Compare ${names.join(", ") || "the tools"} for this task: ${task || "[describe the task]"}. For each tool, give best-fit scenario, strengths, limitations, and pricing/free-tier concerns, then a final recommendation with one primary and one backup choice.`)}\n\n${section("Do this next in 7labs", "Not sure which tools to even compare? Try [ai tool finder](/tools/ai-tool-finder) for a ranked stack, then [prompt optimizer](/tools/prompt-optimizer) to structure the task you will run in each tool.")}`;
}

function imagePrompt(values: ToolValues): string {
  const subject = val(values, "subject");
  const style = val(values, "style", "cinematic");
  const ratio = val(values, "ratio", "1:1");
  const details = val(values, "details");
  const prompt = `${subject}, ${styleMap[style] ?? style}, strong focal point, balanced rule-of-thirds composition, controlled depth of field, soft key light with gentle rim light, professional color grading, rich material detail, high resolution${details ? `, ${details}` : ""}`;
  return makePromptBlock("AI Image Prompt", prompt, "low quality, blurry, watermark, distorted anatomy, messy composition, unreadable text, extra fingers, oversaturated, jpeg artifacts", `Aspect ratio: ${ratio}\nQuality: high — render 3-4 variations, then upscale the strongest.\nLighting: shift the key/fill ratio for mood (soft = friendly, hard = dramatic).\nIteration tip: keep the seed fixed when refining composition; change one variable at a time.\nModel routing: Midjourney for style, SDXL for control, DALL-E or Gemini for text-in-image.`);
}

function videoPrompt(values: ToolValues): string {
  const idea = val(values, "idea");
  const duration = val(values, "duration", "8s");
  const camera = val(values, "camera", "slow push-in");
  return `# AI Video Prompt\n\n## Main Prompt\n${idea}. Duration: ${duration}. Camera: ${camera}. Cinematic lighting, realistic physics and motion, coherent subject across frames, smooth transitions, shallow focus on the subject.\n\n## Negative / Avoid\nflicker, morphing, distorted hands or faces, jittery motion, random on-screen text, abrupt cuts, watermark.\n\n## Shot Plan\n1. Opening (0-2s): establish the scene and subject; lead with the most striking frame.\n2. Middle: use the ${camera} move to emphasize the key action or change.\n3. Ending: hold on the most reusable frame for a thumbnail or ad still.\n\n## Audio / Pacing\n- Pacing: ${duration} total — keep one clear action and do not overload the shot.\n- Suggested audio: a subtle ambient bed plus one accent at the key moment.\n\n## Provider Notes\n- Veo, Runway, Pika, and Kling each interpret motion differently — generate 2-3 takes and keep the steadiest.\n- Lock the seed where supported when iterating on a single shot.`;
}

function midjourneyPrompt(values: ToolValues): string {
  const subject = val(values, "subject");
  const style = val(values, "style", "cinematic, ultra detailed, professional composition");
  const ar = val(values, "ar", "--ar 16:9");
  const prompt = `${subject}, ${style}, dramatic lighting, strong focal point, refined color palette, rich texture, depth and atmosphere ${ar} --stylize 250 --quality 1 --v 6`;
  return makePromptBlock("Midjourney Prompt", prompt, undefined, "Parameters: --stylize controls artistic license (try 100 / 250 / 500), --quality sets detail, --chaos 5-15 adds variety.\nWorkflow: generate a grid, upscale the strongest, then use Vary (Subtle) to refine.\nText: Midjourney struggles with words — add headlines in a design tool afterward.");
}

function stableDiffusionPrompt(values: ToolValues): string {
  const subject = val(values, "subject");
  const style = val(values, "style", "photorealistic");
  const negative = val(values, "negative", "low quality, blurry, watermark, bad anatomy, extra fingers, deformed, text, logo");
  const positive = `${subject}, ${styleMap[style] ?? style}, masterpiece, best quality, highly detailed, detailed lighting, sharp focus, professional composition, 8k`;
  return makePromptBlock("Stable Diffusion Prompt", positive, negative, "SDXL starting point: 1024x1024, CFG 5-8, Steps 25-35, Sampler DPM++ 2M Karras.\nControl: use a reference image or ControlNet for product or pose accuracy; add a LoRA for a specific style.\nIteration: fix the seed, then adjust CFG and steps one at a time.");
}

function productPhotoPrompt(values: ToolValues): string {
  const product = val(values, "product");
  const audience = val(values, "audience", "premium consumers");
  const mood = val(values, "mood", "premium");
  const prompt = `${product}, designed for ${audience}, ${styleMap[mood] ?? mood}, commercial product photography, hero three-quarter angle, soft boxed key light with gentle reflections, seamless gradient background, crisp material texture, shallow depth of field, premium brand feeling, generous negative space for a headline, no random text`;
  return makePromptBlock("Product Photography Prompt", prompt, "low quality, distorted product, wrong logo, unreadable text, cluttered background, harsh shadow, plastic-looking reflections", "Framing: ecommerce hero 1:1 or 4:5; landing-page hero 16:9.\nLighting: soft key for a clean catalog look, hard light for dramatic launch shots.\nVariations: also try a top-down flat lay and an in-context lifestyle shot.\nAdd the final logo and headline in a design tool.");
}

function youtubeThumbnailPrompt(values: ToolValues): string {
  const topic = val(values, "topic");
  const style = val(values, "style", "bold");
  const headline = val(values, "headline", topic);
  const prompt = `YouTube thumbnail background for: ${topic}, ${styleMap[style] ?? style}, single strong focal subject, clean 16:9 composition, high contrast with a punchy accent color, subject on one side, title-safe negative space on the other, expressive but not cluttered, modern creator aesthetic, headline placeholder: "${headline}"`;
  return makePromptBlock("YouTube Thumbnail Prompt", prompt, "messy layout, tiny text, unreadable typography, low contrast, watermark, busy background", "Composition: keep one subject and 3-4 words maximum.\nContrast: use a saturated accent against a darker background so it pops on mobile.\nText: add the final headline in Figma, Canva, or Photoshop for crisp readability.\nTest: preview at small size — if it is unreadable as a thumbnail, simplify.");
}

function promptOptimizer(values: ToolValues): string {
  const original = val(values, "prompt");
  const goal = val(values, "goal", "make the output more specific, structured, and useful");
  const format = val(values, "format", "markdown");
  return `# Optimized Prompt\n\n## Role\nYou are an expert assistant. Your goal is to ${goal}.\n\n## Context\nThe user's original request:\n${original || "(paste the request you want to improve)"}\n\n## Instructions\n1. Restate the objective in one sentence, then state any assumptions briefly.\n2. Ask for missing inputs only if they block a correct answer; otherwise proceed.\n3. Focus on the user's actual task — no generic filler.\n4. Show reasoning only where it helps the user verify the result.\n5. Provide a concrete example or worked sample where useful.\n\n## Constraints\n- Output format: ${format}.\n- Be specific and actionable; prefer steps, tables, or templates over prose.\n- Flag anything uncertain instead of guessing.\n\n## Output Format\nReturn:\n- A concise answer\n- Step-by-step recommendations\n- A reusable checklist or template\n- Risks, caveats, or the next decision\n\n## Self-check before answering\n- Does the answer directly serve the stated goal?\n- Is every claim either supported or clearly marked as an assumption?\n- Could the user act on this without a follow-up question?`;
}

function promptTranslator(values: ToolValues): string {
  const input = val(values, "input");
  const target = val(values, "target", "general");
  const extra = target === "image" ? "Include subject, style, lighting, composition, camera, constraints, and negative prompt." : target === "video" ? "Include scene, action, camera movement, pacing, duration, and visual constraints." : target === "coding" ? "Include environment, expected behavior, actual behavior, inputs, outputs, and constraints." : "Include role, task, context, constraints, and output format.";
  return `# English Prompt Translation\n\n## Clean English Prompt\nYou are an expert assistant for ${target} tasks. ${input || "(paste your rough or mixed-language notes)"}\n\nRewrite this into clear, unambiguous English that preserves the original intent and makes the request actionable. ${extra}\n\n## Structured Version\n- Goal: the finished result the user wants\n- Context: relevant background from the notes\n- Constraints: tone, length, format, must-haves and must-avoids\n- Output format: how the answer should be returned\n\n## Original Notes (kept for reference)\n${input || "(none provided)"}\n\n## Note\nThis is a structural rewrite, not a certified translation. Review nuance for sensitive content.`;
}

function errorExplainer(values: ToolValues): string {
  const error = val(values, "error");
  const context = val(values, "context", "not specified");
  const keywords = extractKeywords(error).slice(0, 8);
  const lower = error.toLowerCase();
  const causes: string[] = [];
  if (/undefined|null|cannot read/.test(lower)) causes.push("A value is null or undefined before a property or method is accessed.");
  if (/module not found|can't resolve|cannot find module/.test(lower)) causes.push("A package, file path, alias, or build dependency is missing or misconfigured.");
  if (/hydration/.test(lower)) causes.push("Server-rendered HTML does not match client-rendered HTML.");
  if (/syntax|unexpected token/.test(lower)) causes.push("Syntax, escaping, or file-format parsing is likely failing.");
  if (/permission|unauthorized|forbidden|401|403/.test(lower)) causes.push("Authentication, authorization, or environment secrets may be incorrect.");
  if (/timeout|timed out|etimedout/.test(lower)) causes.push("A network or async operation exceeded its time limit — check latency, retries, and timeout settings.");
  if (/cors|cross-origin/.test(lower)) causes.push("A cross-origin request was blocked — check server CORS headers and allowed origins.");
  if (/econnrefused|fetch failed|enotfound|network error/.test(lower)) causes.push("A connection failed — verify the host, port, URL, and that the service is running.");
  if (/is not a function|not assignable|type '/.test(lower)) causes.push("A type or shape mismatch — confirm the value's type and that the property or method exists.");
  if (/rate limit|429|too many requests/.test(lower)) causes.push("A rate limit was hit — add backoff, caching, or request batching.");
  if (!causes.length) causes.push("The error needs more runtime context, but the first step is to isolate the failing line and recent change.");

  return `# Error Explanation\n\n${section("Context", context)}\n\n${section("Likely Causes", list(causes))}\n\n${section("Debugging Steps", "1. Reproduce the error with the smallest possible input.\n2. Identify the exact line, request, or build step that fails.\n3. Check recent changes, environment variables, package versions, and data shape.\n4. Add logging around the failing value or dependency.\n5. Fix one suspected cause at a time and rerun the same test.")}\n\n${section("Keywords Detected", keywords.length ? list(keywords) : "- None detected")}\n\n${section("Original Error", "```text\n" + truncate(error, 1800) + "\n```")}`;
}

function regexGenerator(values: ToolValues): string {
  const pattern = val(values, "pattern").toLowerCase();
  const flavor = val(values, "flavor", "javascript");
  let regex = "";
  let examples = "";
  if (/email/.test(pattern)) {
    regex = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
    examples = "Matches: hello@example.com, user.name@company.co";
  } else if (/phone|telephone/.test(pattern)) {
    regex = "^\\+?1?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$";
    examples = "Matches: 555-123-4567, (555) 123-4567, +1 555 123 4567";
  } else if (/slug/.test(pattern)) {
    regex = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
    examples = "Matches: ai-tool-finder, product-123";
  } else if (/invoice|id/.test(pattern)) {
    regex = "\\b[A-Z]{2,5}-\\d{4}-\\d{3,6}\\b";
    examples = "Matches: INV-2026-0042";
  } else {
    regex = "TODO: describe a concrete pattern such as email, phone, slug, date, or invoice ID";
    examples = "Add positive and negative examples to make this precise.";
  }
  const literal = flavor === "javascript" ? `/${regex}/` : regex;
  return `# Regex Draft\n\n## Pattern\n\`${literal}\`\n\n## Example Use\n${examples}\n\n## Notes\n- Test with both positive and negative examples.\n- Regex validation is rarely perfect for all edge cases.\n- Escape backslashes correctly when embedding this in ${flavor}.`;
}

function sqlGenerator(values: ToolValues): string {
  const request = val(values, "request");
  const schema = val(values, "schema", "No schema provided. Replace table and column names before running.");
  const dialect = val(values, "dialect", "postgres");
  const lower = request.toLowerCase();
  const isMysql = /mysql|maria/.test(dialect.toLowerCase());
  const monthExpr = isMysql ? "DATE_FORMAT(created_at, '%Y-%m-01')" : "date_trunc('month', created_at)";
  const recent = isMysql ? "created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)" : "created_at >= CURRENT_DATE - INTERVAL '12 months'";
  const agg = /revenue|amount|sum|total|mrr|arr/.test(lower) ? "SUM(monthly_amount) AS total_amount" : /average|avg|mean/.test(lower) ? "AVG(value) AS average_value" : "COUNT(*) AS records";
  const byMonth = /month|monthly|trend|over time/.test(lower);
  const byPlan = /plan|tier|segment|category|per /.test(lower);
  const selectCols = [byMonth ? `${monthExpr} AS month` : "", byPlan ? "plan" : "", agg].filter(Boolean).join(",\n  ");
  const groupCount = (byMonth ? 1 : 0) + (byPlan ? 1 : 0);
  const groupBy = groupCount ? `\nGROUP BY ${Array.from({ length: groupCount }, (_, i) => i + 1).join(", ")}\nORDER BY ${Array.from({ length: groupCount }, (_, i) => i + 1).join(", ")}` : "";
  const where = /active|paid|status|current/.test(lower) ? "status = 'active'\n  AND " : "";
  const query = `-- Review table and column names before running.\nSELECT\n  ${selectCols}\nFROM your_table\nWHERE ${where}${recent}${groupBy}\nLIMIT 1000;`;
  return `# SQL Query Draft\n\n${section("Request", request || "Describe the data question, tables, and filters you need.")}\n\n${section("Schema Notes", schema)}\n\n## ${dialect.toUpperCase()} Query\n\n\`\`\`sql\n${query}\n\`\`\`\n\n${section("How this was drafted", `Detected ${agg.replace(/ AS.*/, "")}${byMonth ? ", monthly grouping" : ""}${byPlan ? ", category grouping" : ""}${where ? ", active-status filter" : ""}. Adjust columns to match your real schema.`)}\n\n${section("Validation Checklist", "- Confirm the date column and timezone.\n- Replace your_table and column names with your real schema.\n- Remove LIMIT once the query is verified.\n- Compare totals against a known dashboard or source of truth.")}`;
}

function tryRepairJson(input: string): string {
  let text = input.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  text = text.replace(/([{,]\s*)([A-Za-z_$][\w$-]*)(\s*:)/g, '$1"$2"$3');
  text = text.replace(/'/g, '"');
  text = text.replace(/,\s*([}\]])/g, "$1");
  return text;
}

function jsonFixer(values: ToolValues): string {
  const input = val(values, "json");
  const repaired = tryRepairJson(input);
  try {
    const parsed = JSON.parse(repaired) as unknown;
    return `# Fixed JSON\n\n\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\`\n\n## Notes\n- Parsed successfully after basic cleanup.\n- Check semantic correctness before using in production.`;
  } catch (error) {
    return `# JSON Repair Attempt\n\n\`\`\`json\n${repaired}\n\`\`\`\n\n## Still needs manual review\n${error instanceof Error ? error.message : "Unknown parse error"}\n\n## Common fixes\n- Quote all object keys.\n- Use double quotes, not single quotes.\n- Remove trailing commas.\n- Escape inner quotes inside strings.`;
  }
}

function yamlFixer(values: ToolValues): string {
  const yaml = val(values, "yaml");
  const context = val(values, "context", "YAML config");
  const risky = yaml.split(/\r?\n/).filter((line) => /:\s*$|:\s+true|:\s+false|\t/.test(line)).slice(0, 8);
  return `# YAML Review\n\n${section("Context", context)}\n\n${section("Likely Issues to Check", list(["Use spaces, not tabs.", "Keep indentation consistent within each nested block.", "Quote strings that contain colons, hashes, or leading zeros.", "Validate booleans and environment variables for your specific platform."]))}\n\n${section("Lines worth checking", risky.length ? list(risky.map((line) => `\`${line}\``)) : "- No obvious risky lines detected by the local MVP rules.")}\n\n${section("Validation Commands", "```bash\npython -c 'import yaml,sys; yaml.safe_load(sys.stdin)' < file.yml\n# or use your platform-specific validator, such as docker compose config or kubectl apply --dry-run=client\n```")}`;
}

function gitCommand(values: ToolValues): string {
  const taskRaw = val(values, "task");
  const task = taskRaw.toLowerCase();
  const risk = val(values, "risk", "safe");
  const steps: string[] = ["git status"];
  if (/new branch|create branch|feature branch/.test(task)) steps.push("git switch -c feature/my-branch", "git add -p", 'git commit -m "describe the change"', "git push -u origin HEAD");
  else if (/undo|revert|last commit/.test(task)) steps.push(/keep|soft|staged/.test(task) ? "git reset --soft HEAD~1" : "git revert HEAD");
  else if (/squash/.test(task)) steps.push("git rebase -i origin/main   # mark later commits as 'squash'");
  else if (/rebase/.test(task)) steps.push("git fetch origin", "git rebase origin/main");
  else if (/merge/.test(task)) steps.push("git switch main", "git pull", "git merge --no-ff feature/my-branch");
  else if (/cherry/.test(task)) steps.push("git cherry-pick <commit-sha>");
  else if (/tag|release/.test(task)) steps.push('git tag -a v1.0.0 -m "release v1.0.0"', "git push origin v1.0.0");
  else if (/amend/.test(task)) steps.push("git commit --amend --no-edit");
  else if (/discard|clean|reset changes/.test(task)) steps.push("git restore .   # discard unstaged changes", "git clean -nd   # preview untracked removals before -fd");
  else if (/delete branch/.test(task)) steps.push("git branch -d feature/my-branch", "git push origin --delete feature/my-branch");
  else if (/stash/.test(task)) steps.push('git stash push -m "work in progress"', "git stash list", "git stash pop");
  else if (/log|history/.test(task)) steps.push("git log --oneline --graph --decorate -20");
  else steps.push("# Add the specific command sequence here after confirming the repo state.");
  if (risk === "advanced") steps.push("# Advanced: these commands can rewrite history — back up first and confirm before force-pushing.");
  steps.push("git status");
  const destructive = /reset|revert|clean|rebase|amend|--force|--delete|delete/.test(steps.join(" "));
  return `# Git Command Sequence\n\n${section("Goal", taskRaw || "Describe the Git workflow you need.")}\n\n\`\`\`bash\n${steps.join("\n")}\n\`\`\`\n\n## Safety Notes\n- Run \`git status\` before and after the sequence.\n- ${destructive ? "This sequence changes or removes work — create a backup branch first: \`git branch backup-before-change\`." : "These commands are non-destructive, but review them before running."}\n- Avoid force push on shared branches unless your team agrees.`;
}

function cronGenerator(values: ToolValues): string {
  const scheduleRaw = val(values, "schedule");
  const schedule = scheduleRaw.toLowerCase();
  const format = val(values, "format", "standard");
  let cron = "0 0 * * *";
  let meaning = "Every day at midnight (server time).";
  if (/every 5 min|5 minute/.test(schedule)) { cron = "*/5 * * * *"; meaning = "Every 5 minutes."; }
  else if (/15 minute|every 15|quarter hour/.test(schedule)) { cron = "*/15 * * * *"; meaning = "Every 15 minutes."; }
  else if (/30 min|half hour|every 30/.test(schedule)) { cron = "*/30 * * * *"; meaning = "Every 30 minutes."; }
  else if (/hour|hourly/.test(schedule)) { cron = "0 * * * *"; meaning = "At minute 0 of every hour."; }
  else if (/weekday|week day|business day|monday|friday/.test(schedule)) { cron = "30 8 * * 1-5"; meaning = "At 08:30, Monday through Friday."; }
  else if (/weekend|saturday|sunday/.test(schedule)) { cron = "0 9 * * 6,0"; meaning = "At 09:00 on Saturday and Sunday."; }
  else if (/week|weekly/.test(schedule)) { cron = "0 9 * * 1"; meaning = "At 09:00 every Monday."; }
  else if (/month|monthly|first day/.test(schedule)) { cron = "0 0 1 * *"; meaning = "At 00:00 on the 1st of every month."; }
  else if (/year|annual/.test(schedule)) { cron = "0 0 1 1 *"; meaning = "At 00:00 on January 1st."; }
  else if (/midnight|daily|every day/.test(schedule)) { cron = "0 0 * * *"; meaning = "Every day at midnight (server time)."; }
  const quartz = format === "quartz" ? `\n\nQuartz-style (6-7 fields) draft: \`0 ${cron}\`` : "";
  return `# Cron Expression\n\n\`${cron}\`${quartz}\n\n${section("Meaning", `${meaning}\nRequested: ${scheduleRaw || "not specified"}`)}\n\n${section("Field reference", "\`\`\`\n*  *  *  *  *\n|  |  |  |  +-- day of week (0-6, Sunday = 0)\n|  |  |  +----- month (1-12)\n|  |  +-------- day of month (1-31)\n|  +----------- hour (0-23)\n+-------------- minute (0-59)\n\`\`\`")}\n\n${section("Reminder", "- Cron runs in the server or runtime timezone unless configured otherwise.\n- Test in staging before scheduling production jobs.\n- GitHub Actions, Vercel, systemd timers, and Cloudflare Cron Triggers each differ slightly in syntax or field count.")}`;
}

function codeExplainer(values: ToolValues): string {
  const code = val(values, "code");
  const level = val(values, "level", "practical");
  const lc = code.toLowerCase();
  const lineCount = code.split(/\r?\n/).filter((line) => line.trim()).length;
  const language = /function|const|=>|import|export/.test(code) ? "JavaScript / TypeScript" : /def |import |print\(/.test(code) ? "Python" : /select |from |where /i.test(code) ? "SQL" : /func |package /.test(code) ? "Go" : "Unknown or mixed";
  const constructs: string[] = [];
  if (lc.includes("async") || lc.includes("await") || lc.includes("promise") || lc.includes(".then")) constructs.push("Asynchronous code — watch for unhandled rejections and race conditions.");
  if (lc.includes("usestate") || lc.includes("useeffect") || lc.includes("usememo") || lc.includes("usecallback")) constructs.push("React hooks — check dependency arrays and re-render behavior.");
  if (lc.includes("for ") || lc.includes("while ") || lc.includes(".map") || lc.includes(".foreach") || lc.includes(".reduce")) constructs.push("Iteration — confirm bounds and behavior on empty input.");
  if (lc.includes("try") || lc.includes("catch") || lc.includes("throw")) constructs.push("Error handling — verify which errors are caught and which are surfaced.");
  if (lc.includes("fetch") || lc.includes("axios") || lc.includes("http")) constructs.push("Network I/O — handle timeouts, status codes, and failures.");
  if (lc.includes("import ") || lc.includes("require(")) constructs.push("External dependencies — confirm they are installed and trusted.");
  return `# Code Explanation\n\n${section("At a glance", `Language: ${language}. ~${lineCount} non-empty line${lineCount === 1 ? "" : "s"}. ${level} explanation.`)}\n\n${section("What to look for", constructs.length ? list(constructs) : list(["Identify the inputs the code expects.", "Identify the output or side effect it produces.", "Note what can be null, undefined, or missing."]))}\n\n${section("Review Checklist", "- What inputs does the code expect, and what happens on bad input?\n- What output or side effect does it produce?\n- Are secrets or user inputs handled safely?\n- Can the logic be tested with small examples?")}\n\n${section("Snippet", "```text\n" + truncate(code, 1600) + "\n```")}`;
}

function apiToCurl(values: ToolValues): string {
  const method = val(values, "method", "GET");
  const url = val(values, "url");
  const headers = val(values, "headers").split(/\r?\n/).map((h) => h.trim()).filter(Boolean).map((h) => `  -H '${h.replace(/'/g, "'\\''")}'`).join(" \\\n");
  const body = val(values, "body");
  const bodyPart = body && method !== "GET" ? ` \\\n  -d '${body.replace(/'/g, "'\\''")}'` : "";
  return `# cURL Command\n\n\`\`\`bash\ncurl -X ${method} '${url}'${headers ? ` \\\n${headers}` : ""}${bodyPart}\n\`\`\`\n\n## Notes\n- Replace secrets before sharing this command.\n- Add \`-i\` to inspect response headers.\n- Add \`--fail-with-body\` in scripts to fail on HTTP errors.`;
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function tsType(value: JsonValue, name: string): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    const first = value[0];
    return first === undefined ? "unknown[]" : `${tsType(first, name)}[]`;
  }
  if (typeof value !== "object") return typeof value;
  const lines = Object.entries(value).map(([key, child]) => `  ${/^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)}: ${tsType(child, key)};`);
  return `{
${lines.join("\n")}
}`;
}

function typeScriptType(values: ToolValues): string {
  const input = tryRepairJson(val(values, "json"));
  const name = val(values, "name", "Root").replace(/[^A-Za-z0-9_$]/g, "") || "Root";
  try {
    const parsed = JSON.parse(input) as JsonValue;
    return `# TypeScript Type\n\n\`\`\`ts\nexport interface ${name} ${tsType(Array.isArray(parsed) ? parsed[0] ?? {} : parsed, name)}\n\`\`\`\n\n## Notes\n- Review optional fields if the sample is incomplete.\n- For production SDKs, infer from multiple samples or an OpenAPI schema.`;
  } catch (error) {
    return `# TypeScript Type Generator\n\nCould not parse the JSON sample. Fix the JSON first, then run this tool again.\n\nError: ${error instanceof Error ? error.message : "Unknown parse error"}`;
  }
}

function chatWithPdf(values: ToolValues): string {
  const text = val(values, "text");
  const question = val(values, "question");
  const qWords = extractKeywords(question);
  const ranked = sentenceSplit(text)
    .map((sentence) => ({ sentence, hits: qWords.filter((word) => sentence.toLowerCase().includes(word)).length }))
    .filter((item) => item.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 4);
  const strong = ranked.some((item) => item.hits >= 2);
  const answer = !text.trim()
    ? "Paste the document text first. This tool answers only from the text you provide — it does not browse the web or use outside knowledge."
    : ranked.length
      ? `The pasted text addresses this question. ${strong ? "Several passages overlap strongly with your question." : "Matches are weak — confirm against the full source before relying on this."} Read the excerpts below and verify before using the answer in a decision.`
      : "No passages in the pasted text matched your question. Add more of the document, or rephrase using words likely to appear in the text.";
  const excerpts = ranked.length
    ? ranked.map((item, index) => `${index + 1}. (${item.hits} keyword match${item.hits === 1 ? "" : "es"}) ${truncate(item.sentence, 240)}`).join("\n")
    : "- No strong local matches found.";
  return `# Document Q&A\n\n${section("Question", question || "Add a question about the pasted text.")}\n\n${section("Answer", answer)}\n\n${section("Relevant Excerpts", excerpts)}\n\n${section("Ask better questions", list(["Use words that are likely to appear in the document.", "Ask one thing at a time.", "For totals or dates, name the section or term you expect."]))}\n\n${section("Production Upgrade", "Use embeddings, chunk retrieval, page numbers, and source citations before turning this into a paid document Q&A product.")}`;
}

function paperExplainer(values: ToolValues): string {
  const paper = val(values, "paper");
  const audience = val(values, "audience", "general");
  const keywords = extractKeywords(paper).slice(0, 10);
  const sentences = sentenceSplit(paper);
  const pick = (re: RegExp, fallback: string) => {
    const found = sentences.filter((sentence) => re.test(sentence.toLowerCase())).slice(0, 2);
    return found.length ? found.map((sentence) => `- ${truncate(sentence, 200)}`).join("\n") : `- ${fallback}`;
  };
  const problem = pick(/propose|address|problem|gap|challenge|aim|introduc|motivat|question/, "Not clearly stated — look for the gap or question the paper targets.");
  const method = pick(/method|approach|dataset|experiment|we (use|train|evaluat|test|present)|model|benchmark|framework|architecture/, "Not clearly stated — look for the data, model, or experiment used.");
  const findings = pick(/result|show|find|improv|achiev|outperform|accuracy|increase|reduce|demonstrat|observe/, "Not clearly stated — look for what the paper proved or measured.");
  const limits = pick(/however|limitation|future work|constraint|assumption|does not|cannot|small|fail|threat/, "Not stated — check whether limitations or threats to validity are discussed.");
  const audienceNote = audience === "technical"
    ? "Technical audience: keep the method and evaluation detail."
    : audience === "product"
      ? "Product audience: focus on what it enables and what to build."
      : "General audience: focus on the plain-English takeaway.";
  return `# Research Paper Explainer\n\n${section("Plain-English Summary", `${audienceNote} Topics detected: ${keywords.join(", ") || "the pasted topic"}. The sections below quote sentences from the pasted text as a scaffold — verify against the full paper.`)}\n\n${section("Problem", problem)}\n\n${section("Method", method)}\n\n${section("Findings", findings)}\n\n${section("Limitations", limits)}\n\n${section("Practical Implication", `For a ${audience} reader: decide what you would do differently if these findings hold, then confirm with the full paper before acting.`)}\n\n${section("Source Excerpt", "```text\n" + truncate(paper, 1400) + "\n```")}`;
}

const WEAK_RESUME_VERBS = ["managed", "worked", "helped", "responsible", "handled", "assisted", "involved", "participated", "did", "made", "supported"];
const STRONG_RESUME_VERBS = ["Led", "Drove", "Built", "Launched", "Delivered", "Improved", "Reduced", "Increased", "Owned", "Designed"];

function resumeOptimizer(values: ToolValues): string {
  const resume = val(values, "resume");
  const role = val(values, "role");
  const lines = resume.split(/\r?\n/).map((line) => line.replace(/^[-*•]\s*/, "").trim()).filter(Boolean).slice(0, 6);
  const rewritten = lines.map((line) => {
    const opener = line.split(/\s+/)[0] ?? "";
    const weak = WEAK_RESUME_VERBS.includes(opener.toLowerCase());
    const verbNote = weak ? ` Replace the weak opener "${opener}" with a stronger verb such as ${STRONG_RESUME_VERBS.slice(0, 3).join(", ")}.` : "";
    return `- **Original:** ${truncate(line, 120)}\n  **Rewrite (X-Y-Z):** Accomplished [${truncate(line, 70)}] as measured by [add a real metric], by [doing what].${verbNote}`;
  }).join("\n") || "- Add 3-5 bullets describing actions, tools, scale, and measurable results.";
  const roleWords = extractKeywords(role);
  const resumeLower = resume.toLowerCase();
  const missing = roleWords.filter((word) => !resumeLower.includes(word));
  return `# Resume Optimization\n\n${section("Target role", role || "Add the role you are targeting.")}\n\n${section("Rewritten Bullets", rewritten)}\n\n${section("Role Keyword Gaps", missing.length ? `These role-related words are missing from your resume — add them only where they are truthfully accurate:\n${list(missing)}` : "Your resume already reflects the main role keywords detected.")}\n\n${section("Metrics to Add", "- Revenue, cost savings, retention, conversion, speed, quality, or reliability impact.\n- Team size, project scope, users served, data volume, or systems supported.\n- Before/after improvement where possible.")}\n\n${section("Rule", "Keep every claim truthful. If you do not have a metric, add scope or frequency instead of inventing a number.")}`;
}

function meetingNotes(values: ToolValues): string {
  const notes = val(values, "notes");
  const tone = val(values, "tone", "professional");
  const sentences = sentenceSplit(notes);
  const summary = sentences.slice(0, 6).map((s) => `- ${truncate(s, 160)}`).join("\n");
  const decisions = sentences.filter((s) => /decided|agreed|will ship|approved|chose|going with|final|locked/i.test(s)).slice(0, 4);
  const actions = sentences.filter((s) => /will |need to|action|owner|assign|follow up|by (monday|tuesday|wednesday|thursday|friday|next|eod|tomorrow)|todo|to-do/i.test(s)).slice(0, 5);
  return `# Meeting Notes\n\n${section("Summary", summary || "- Add more meeting notes for a stronger summary.")}\n\n${section("Decisions", decisions.length ? list(decisions.map((s) => truncate(s, 160))) : "- No explicit decisions detected — confirm what was decided and who owns it.")}\n\n${section("Action Items", actions.length ? list(actions.map((s) => `${truncate(s, 150)} — Owner: TBD, Due: TBD`)) : "- No clear action items detected — assign an owner and a due date to each next step.")}\n\n${section("Open Questions", "- List anything unresolved that still needs a decision or more information.")}\n\n${section("Follow-up Email", `Subject: Meeting recap and next steps\n\nHi team,\n\nThanks for the ${tone} discussion. Below are the key takeaways, decisions, and action items. Please reply with corrections, owners, or due dates I missed.\n\nBest,`)}`;
}

function youtubeScript(values: ToolValues): string {
  const topic = val(values, "topic");
  const audience = val(values, "audience", "general viewers");
  const length = val(values, "length", "8min");
  return `# YouTube Script Outline\n\n${section("Topic", topic)}\n\n${section("Audience", audience)}\n\n${section("Hook Options (first 10 seconds)", list([`Open with the payoff: show the end result of "${topic}" before explaining it.`, `Open with the pain: name the exact problem ${audience} have with ${topic}.`, "Open with a bold claim, then promise to prove it by the end."]))}\n\n${section("Structure", `1. Hook (0:00-0:10): one of the openers above.\n2. Promise (0:10-0:30): what ${audience} can do after watching.\n3. Context (0:30-1:00): why ${topic} matters now.\n4. Main sections: 3-5 practical points, each with a concrete example or demo.\n5. Demo or story: show the workflow, not just opinions.\n6. Recap: restate the framework in one line.\n7. CTA: ask viewers to try a tool, comment a use case, or subscribe.`)}\n\n${section("Retention Beats", "- Re-state the payoff roughly every 90 seconds.\n- Add a pattern interrupt (b-roll, zoom, on-screen text) at each section change.\n- Tease the best tip early and deliver it near the end.")}\n\n${section("Length Guidance", `${length}: keep each section tight and cut anything that does not serve the viewer promise.`)}\n\n${section("Thumbnail & Title Pairing", "- Before vs after workflow.\n- Tool-stack screenshot with one bold claim.\n- Face with a clear emotion plus a 3-4 word headline.")}`;
}

function tiktokHook(values: ToolValues): string {
  const topic = val(values, "topic");
  const style = val(values, "style", "curiosity");
  const hooks = style === "contrarian"
    ? [`Everyone is using ${topic} wrong.`, `The popular advice about ${topic} misses one thing.`, `I stopped doing the obvious ${topic} tactic and got better results.`]
    : style === "problem"
      ? [`If ${topic} feels hard, try this instead.`, `This fixes the biggest problem with ${topic}.`, `Here is the fastest way to improve ${topic}.`]
      : style === "story"
        ? [`I tried ${topic} for a week. Here is what surprised me.`, `I made one change to ${topic}, and the result was obvious.`, `This started as a small ${topic} experiment.`]
        : [`I found a faster way to do ${topic}.`, `Most people miss this part of ${topic}.`, `Save this if you care about ${topic}.`];
  return `# Short-Form Video Hooks\n\n${section("Hooks", list(hooks))}\n\n${section("Why these work", `They open with stakes or curiosity in the first 1-2 seconds, name "${topic}" so the right viewers stop scrolling, and promise a fast payoff.`)}\n\n${section("Opening Shot Ideas", "- Show the final result first.\n- Cut to the messy before state.\n- Overlay one clear promise in 5-7 words.")}\n\n${section("Retention Tips", "- Deliver the first value point within 5 seconds.\n- Keep one idea per video.\n- End on a loop or a question to drive replays and comments.")}\n\n${section("CTA Options", "- Save this for later.\n- Comment 'workflow' and I will share the template.\n- Follow for practical AI tools.")}`;
}

function linkedInPost(values: ToolValues): string {
  const idea = val(values, "idea");
  const tone = val(values, "tone", "insightful");
  const body = idea || "Share the specific lesson or result you want to post about.";
  const lesson = tone === "concise"
    ? "useful tools beat generic content when people have a job to do."
    : tone === "bold"
      ? "stop shipping another chat box — remove steps from real work instead."
      : "the products that win remove steps from real work, not add another place to type.";
  return `# LinkedIn Post Draft\n\n## Hook options\n- Most people get this wrong: ${truncate(body, 100)}\n- I used to believe the hard part was the idea. It is not.\n- A short story about ${truncate(body, 80)} taught me something useful.\n\n## Post\n${body}\n\nWhat changed my approach:\n\n- Start with the real user task, not the technology.\n- Build the smallest useful version first.\n- Measure repeat usage before adding cost or complexity.\n- Turn the winning workflow into a repeatable template.\n\nThe lesson: ${lesson}\n\n## Engagement\n- End with a question: "What are you trying to simplify right now?"\n- Reply to early comments quickly to boost reach.\n\n## Formatting\n- Short lines, one idea per line, white space between thoughts.\n- 3-5 relevant hashtags at the end, not in the body.`;
}

function productDescription(values: ToolValues): string {
  const product = val(values, "product");
  const features = val(values, "features");
  const audience = val(values, "audience", "busy customers");
  const featureLines = features.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean).slice(0, 6);
  const benefits = featureLines.length
    ? list(featureLines.map((f) => `**${f}** -> so you can [benefit]: state the outcome ${audience} get from it.`))
    : "- Add key features to generate stronger benefit bullets.";
  return `# Product Description\n\n${section("Positioning", `${product || "[Product]"} helps ${audience} get the outcome they want faster, with less manual effort and a cleaner workflow.`)}\n\n${section("Short Description (product page)", `${product || "[Product]"} is built for ${audience}. It turns ${featureLines[0] ?? "your core feature"} into a real result, without the busywork.`)}\n\n${section("Benefit Bullets", benefits)}\n\n${section("Ad Angles", "- Save time without changing your workflow.\n- Replace messy manual steps with a repeatable system.\n- Get better output with less trial and error.")}\n\n${section("SEO Keywords to weave in", featureLines.length ? list(featureLines.slice(0, 4).map((f) => f.toLowerCase())) : "- Add features to suggest keywords.")}\n\n${section("CTA Options", "- Try it free and see the workflow in action.\n- Start free — no credit card.\n- See it work in under 2 minutes.")}`;
}

function newsletterOutline(values: ToolValues): string {
  const topic = val(values, "topic");
  const audience = val(values, "audience", "readers");
  return `# Newsletter Outline\n\n${section("Subject Lines", list([`A practical guide to ${topic}`, `What ${audience} should know about ${topic}`, `5 useful lessons from ${topic}`, `The ${topic} playbook (steal this)`, `${topic}: what worked, what did not`]))}\n\n${section("Preview Text", `One line that expands the subject and earns the open — tease the most useful takeaway about ${topic}.`)}\n\n${section("Issue Structure", `1. Intro: why ${topic} matters this week (2-3 sentences).\n2. Main idea: the useful framework or observation.\n3. Practical example: show the workflow or a before/after.\n4. Tools/resources: 2-4 links or templates to add.\n5. CTA: ask ${audience} to reply with their use case.`)}\n\n${section("Proof to Add", "- A concrete number, screenshot, or before/after.\n- A short quote or reader example.\n- A link to the full guide or template.")}\n\n${section("Publishing Notes", "Keep the intro short, use scannable sections, and give readers one action they can take immediately.")}`;
}

function timestampConverter(values: ToolValues): string {
  const input = val(values, "value");
  const numeric = /^\d+$/.test(input) ? Number(input) : NaN;
  const date = Number.isFinite(numeric) ? new Date(input.length >= 13 ? numeric : numeric * 1000) : new Date(input);
  if (Number.isNaN(date.getTime())) return `# Timestamp Converter\n\nCould not parse \`${input}\`. Try a Unix timestamp (seconds or milliseconds) or an ISO date string like 2026-06-24T09:00:00Z.`;
  const detected = /^\d+$/.test(input) ? (input.length >= 13 ? "Unix milliseconds" : "Unix seconds") : "date string";
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getUTCDay()];
  return `# Timestamp Conversion\n\n${section("Detected input", `\`${input}\` parsed as a ${detected}.`)}\n\n- ISO 8601 (UTC): \`${date.toISOString()}\`\n- UTC date: \`${date.toISOString().slice(0, 10)}\` (${weekday})\n- UTC time: \`${date.toISOString().slice(11, 19)}\`\n- Unix seconds: \`${Math.floor(date.getTime() / 1000)}\`\n- Unix milliseconds: \`${date.getTime()}\`\n- Local string (viewer timezone): \`${date.toString()}\`\n\n## Notes\n- "Local string" depends on the viewer's browser or server timezone; everything else is UTC.\n- For scheduled jobs, store and compare in UTC to avoid daylight-saving bugs.`;
}

function textCleanup(values: ToolValues): string {
  const text = val(values, "text");
  const mode = val(values, "mode", "readable");
  let cleaned = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (mode === "single") cleaned = cleaned.replace(/\s*\n\s*/g, " ");
  if (mode === "bullets") cleaned = cleaned.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => `- ${line}`).join("\n");
  const modeNote = mode === "single" ? "collapsed everything to a single line/paragraph" : mode === "bullets" ? "converted non-empty lines to bullet points" : "normalized spaces and blank lines, preserved paragraphs";
  return `# Cleaned Text\n\n\`\`\`text\n${cleaned}\n\`\`\`\n\n${section("What changed", `Mode: ${mode} — ${modeNote}. Trimmed extra spaces and tabs.\nLength: ${text.length} -> ${cleaned.length} characters.`)}`;
}

export function executeTool(slug: string, values: ToolValues): string {
  switch (slug) {
    case "ai-tool-finder": return aiToolFinder(values);
    case "ai-tool-comparison-generator": return comparisonGenerator(values);
    case "image-prompt-generator": return imagePrompt(values);
    case "video-prompt-generator": return videoPrompt(values);
    case "midjourney-prompt-generator": return midjourneyPrompt(values);
    case "stable-diffusion-prompt-generator": return stableDiffusionPrompt(values);
    case "product-photo-prompt-generator": return productPhotoPrompt(values);
    case "youtube-thumbnail-prompt-generator": return youtubeThumbnailPrompt(values);
    case "prompt-optimizer": return promptOptimizer(values);
    case "prompt-translator": return promptTranslator(values);
    case "error-explainer": return errorExplainer(values);
    case "regex-generator": return regexGenerator(values);
    case "sql-generator": return sqlGenerator(values);
    case "json-fixer": return jsonFixer(values);
    case "yaml-fixer": return yamlFixer(values);
    case "git-command-generator": return gitCommand(values);
    case "cron-generator": return cronGenerator(values);
    case "code-explainer": return codeExplainer(values);
    case "api-to-curl-converter": return apiToCurl(values);
    case "typescript-type-generator": return typeScriptType(values);
    case "pdf-summarizer": return summarizeText(val(values, "text"), val(values, "style", "executive"));
    case "chat-with-pdf": return chatWithPdf(values);
    case "research-paper-explainer": return paperExplainer(values);
    case "resume-optimizer": return resumeOptimizer(values);
    case "meeting-notes-generator": return meetingNotes(values);
    case "youtube-script-generator": return youtubeScript(values);
    case "tiktok-hook-generator": return tiktokHook(values);
    case "linkedin-post-generator": return linkedInPost(values);
    case "product-description-generator": return productDescription(values);
    case "newsletter-outline-generator": return newsletterOutline(values);
    case "timestamp-converter": return timestampConverter(values);
    case "text-cleanup-tool": return textCleanup(values);
    default:
      return `# ${slug}\n\nThis tool is registered but does not have a local executor yet. Connect it to /api/ai or add a rule-based executor in lib/toolExecutors.ts.`;
  }
}
