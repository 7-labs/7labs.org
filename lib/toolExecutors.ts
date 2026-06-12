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

function summarizeText(text: string, style = "executive"): string {
  const sentences = sentenceSplit(text);
  const keywords = extractKeywords(text).slice(0, 10);
  const bullets = sentences.slice(0, 6).map((s) => `- ${truncate(s, 190)}`).join("\n") || "- The pasted document is short. Add more source text for a more reliable summary.";
  const modeBlock = style === "actions"
    ? section("Action Items", list(["Identify which decisions need an owner.", "Convert unresolved questions into follow-up tasks.", "Verify claims that do not include clear evidence in the source text."]))
    : style === "outline"
      ? section("Suggested Outline", "1. Background and goal\n2. Core argument\n3. Evidence or data\n4. Risks and limitations\n5. Recommended next steps")
      : section("Next Steps", list(["Separate factual claims from interpretation.", "Add page or paragraph citations before sharing with a team.", "Turn the summary into a decision memo if action is required."]));

  return `# Document Summary\n\n${section("Key Points", bullets)}\n\n${section("Keywords", keywords.length ? list(keywords) : "- No stable keywords extracted.")}\n\n${modeBlock}\n\n${section("Reliability Note", "This MVP uses local rule-based summarization. A production document tool should add PDF parsing, chunk retrieval, page citations, and human review for high-stakes decisions.")}`;
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

  return `# AI Tool Stack Recommendation\n\n${section("Your task", taskRaw)}\n\n${recommendations}\n\n${section("Recommended Workflow", "1. Use 7labs to structure the task and generate a reusable prompt.\n2. Use the top recommended tool for the core output.\n3. Use a second tool only for review, formatting, or platform-specific polish.\n4. Save the winning prompt and turn repeat tasks into a checklist.")}\n\n${section("Copy-ready Prompt", `Act as an AI tools consultant. Recommend the best three tools for this task. Explain best-fit scenario, pricing/free-tier concerns, limitations, and the exact workflow. Task: ${taskRaw}`)}`;
}

function comparisonGenerator(values: ToolValues): string {
  const toolNames = val(values, "tools");
  const task = val(values, "task");
  const criteria = val(values, "criteria", "quality, price, speed, ease of use, reliability");
  const names = toolNames.split(/,|vs|\n/i).map((item) => item.trim()).filter(Boolean).slice(0, 4);
  const rows = names.map((name) => `| ${name} | Best when it fits the task directly | Check pricing, data privacy, output quality, and export limits | Test with the same prompt before committing |`).join("\n");
  return `# AI Tool Comparison\n\n${section("Decision context", task)}\n\n## Criteria\n${list(criteria.split(/,|\n/).map((item) => item.trim()).filter(Boolean))}\n\n| Tool | Likely strength | Caveat | Test step |\n|---|---|---|---|\n${rows}\n\n${section("Recommended Decision Process", "1. Run the same representative task in every tool.\n2. Compare output quality, time-to-result, and editing effort.\n3. Check pricing and team sharing before scaling.\n4. Pick one primary tool and one backup tool, not five overlapping subscriptions.")}`;
}

function imagePrompt(values: ToolValues): string {
  const subject = val(values, "subject");
  const style = val(values, "style", "cinematic");
  const ratio = val(values, "ratio", "1:1");
  const details = val(values, "details");
  const prompt = `${subject}, ${styleMap[style] ?? style}, carefully composed scene, clear focal point, balanced composition, professional color grading, high resolution${details ? `, ${details}` : ""}`;
  return makePromptBlock("AI Image Prompt", prompt, "low quality, blurry, watermark, distorted anatomy, messy composition, unreadable text, extra fingers", `Aspect ratio: ${ratio}\nQuality: high\nIteration tip: keep seed fixed when refining composition.`);
}

function videoPrompt(values: ToolValues): string {
  const idea = val(values, "idea");
  const duration = val(values, "duration", "8s");
  const camera = val(values, "camera", "slow push-in");
  return `# AI Video Prompt\n\n## Main Prompt\n${idea}. Duration: ${duration}. Camera movement: ${camera}. Cinematic lighting, realistic motion, coherent subject, smooth transition, natural depth of field, no flicker, no distorted hands, no random text.\n\n## Shot Plan\n1. Opening: establish scene and subject in the first 1-2 seconds.\n2. Middle: use ${camera} to emphasize the key action.\n3. Ending: hold on the most commercially useful frame for thumbnail or ad reuse.\n\n## Iteration Notes\n- First pass: validate motion and composition.\n- Second pass: refine lighting, textures, and pacing.\n- Third pass: add brand elements or captions in post-production.`;
}

function midjourneyPrompt(values: ToolValues): string {
  const subject = val(values, "subject");
  const style = val(values, "style", "cinematic, ultra detailed, professional composition");
  const ar = val(values, "ar", "--ar 16:9");
  const prompt = `${subject}, ${style}, dramatic composition, high detail, refined color palette, strong focal point ${ar} --stylize 250 --quality 1`;
  return makePromptBlock("Midjourney Prompt", prompt, undefined, "Try --stylize 100 / 250 / 500 to compare style intensity.");
}

function stableDiffusionPrompt(values: ToolValues): string {
  const subject = val(values, "subject");
  const style = val(values, "style", "photorealistic");
  const negative = val(values, "negative", "low quality, blurry, watermark, bad anatomy, extra fingers, deformed, text, logo");
  const positive = `${subject}, ${styleMap[style] ?? style}, masterpiece, best quality, detailed lighting, sharp focus, professional composition`;
  return makePromptBlock("Stable Diffusion Prompt", positive, negative, "SDXL starting point: 1024x1024, CFG 5-8, Steps 25-35. For product shots, use a reference image or ControlNet where available.");
}

function productPhotoPrompt(values: ToolValues): string {
  const product = val(values, "product");
  const audience = val(values, "audience", "premium consumers");
  const mood = val(values, "mood", "premium");
  const prompt = `${product}, designed for ${audience}, ${styleMap[mood] ?? mood}, commercial product photography, clean hero composition, subtle reflections, clear material texture, premium brand feeling, space for headline, no random text`;
  return makePromptBlock("Product Photography Prompt", prompt, "low quality, distorted product, wrong logo, unreadable text, cluttered background, harsh shadow", "Ecommerce hero: 1:1 or 4:5. Landing page hero: 16:9. Add final logo/text in a design tool.");
}

function youtubeThumbnailPrompt(values: ToolValues): string {
  const topic = val(values, "topic");
  const style = val(values, "style", "bold");
  const headline = val(values, "headline", topic);
  const prompt = `YouTube thumbnail background for: ${topic}, ${styleMap[style] ?? style}, strong focal point, clean 16:9 composition, high contrast, title-safe area on one side, expressive but not cluttered, modern creator aesthetic, headline placeholder: "${headline}"`;
  return makePromptBlock("YouTube Thumbnail Prompt", prompt, "messy layout, tiny text, unreadable typography, low contrast, watermark", "Use 16:9. Add final headline text in Figma, Canva, or Photoshop for readability.");
}

function promptOptimizer(values: ToolValues): string {
  const original = val(values, "prompt");
  const goal = val(values, "goal", "make the output more specific, structured, and useful");
  const format = val(values, "format", "markdown");
  return `# Optimized Prompt\n\nYou are an expert task assistant. Your goal is to ${goal}.\n\n## Context\nThe user wants help with the following request:\n${original}\n\n## Instructions\n1. Clarify the objective before generating the final answer.\n2. Make reasonable assumptions and state them briefly.\n3. Provide a structured answer in ${format}.\n4. Include concrete examples where useful.\n5. Avoid generic advice and focus on the user's actual task.\n\n## Output Format\nReturn:\n- A concise answer\n- Step-by-step recommendations\n- A checklist or template the user can reuse\n- Risks, caveats, or next decisions`;
}

function promptTranslator(values: ToolValues): string {
  const input = val(values, "input");
  const target = val(values, "target", "general");
  const extra = target === "image" ? "Include subject, style, lighting, composition, camera, constraints, and negative prompt." : target === "video" ? "Include scene, action, camera movement, pacing, duration, and visual constraints." : target === "coding" ? "Include environment, expected behavior, actual behavior, inputs, outputs, and constraints." : "Include role, task, context, constraints, and output format.";
  return `# English Prompt Translation\n\n## Short Prompt\nRewrite and complete this request for a ${target} AI workflow: ${input}\n\n## Detailed Prompt\nYou are an expert assistant for ${target} tasks. Convert the user's rough notes into a clear English prompt. Preserve the original intent, remove ambiguity, and make the output actionable. ${extra}\n\nUser notes:\n${input}`;
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
  return `# SQL Query Draft\n\n${section("Request", request)}\n\n${section("Schema Notes", schema)}\n\n## ${dialect.toUpperCase()} Query\n\n\`\`\`sql\n-- Review table and column names before running.\nSELECT\n  date_trunc('month', created_at) AS month,\n  COUNT(*) AS records\nFROM your_table\nWHERE created_at >= CURRENT_DATE - INTERVAL '12 months'\nGROUP BY 1\nORDER BY 1;\n\`\`\`\n\n${section("Validation Checklist", "- Confirm date column and timezone.\n- Add WHERE filters for active users, paid plans, or relevant status.\n- Run with LIMIT first if adapting for a large table.\n- Compare totals against a known dashboard or source of truth.")}`;
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
  const task = val(values, "task").toLowerCase();
  const risk = val(values, "risk", "safe");
  let commands = "git status\n";
  if (/undo|last commit|keep/.test(task)) commands += "git reset --soft HEAD~1\n";
  else if (/branch/.test(task)) commands += "git checkout -b feature/my-branch\n";
  else if (/stash/.test(task)) commands += "git stash push -m \"work in progress\"\n";
  else if (/rebase/.test(task)) commands += "git fetch origin\ngit rebase origin/main\n";
  else commands += "# Add the specific command sequence here after confirming the repo state.\n";
  if (risk === "advanced") commands += "# Advanced commands can rewrite history. Confirm with your team before force-pushing.\n";
  return `# Git Command Sequence\n\n\`\`\`bash\n${commands}git status\n\`\`\`\n\n## Safety Notes\n- Run \`git status\` before and after the sequence.\n- Avoid force push unless you understand the branch history.\n- Create a backup branch before destructive operations: \`git branch backup-before-change\`.`;
}

function cronGenerator(values: ToolValues): string {
  const schedule = val(values, "schedule").toLowerCase();
  const format = val(values, "format", "standard");
  let cron = "0 0 * * *";
  if (/15 minute|every 15/.test(schedule)) cron = "*/15 * * * *";
  else if (/weekday|week day|monday|friday/.test(schedule)) cron = "0 9 * * 1-5";
  else if (/midnight/.test(schedule)) cron = "0 0 * * *";
  else if (/month|monthly|first day/.test(schedule)) cron = "0 0 1 * *";
  else if (/hour|hourly/.test(schedule)) cron = "0 * * * *";
  const quartz = format === "quartz" ? `\nQuartz-style draft: \`0 ${cron}\`` : "";
  return `# Cron Expression\n\n\`${cron}\`${quartz}\n\n## Meaning\nRequested schedule: ${val(values, "schedule")}\n\n## Reminder\n- Cron usually runs in the server timezone unless configured otherwise.\n- Test in staging before scheduling production jobs.\n- Some platforms use 5 fields, others use 6 or 7 fields.`;
}

function codeExplainer(values: ToolValues): string {
  const code = val(values, "code");
  const level = val(values, "level", "practical");
  const keywords = extractKeywords(code).slice(0, 12);
  const language = /function|const|=>|import|export/.test(code) ? "JavaScript / TypeScript" : /def |import |print\(/.test(code) ? "Python" : /select |from |where /i.test(code) ? "SQL" : "Unknown or mixed";
  return `# Code Explanation\n\n${section("Likely language", language)}\n\n${section("Summary", `This snippet appears to contain ${keywords.slice(0, 5).join(", ") || "general logic"}. The ${level} explanation should focus on behavior, inputs, outputs, and side effects.`)}\n\n${section("Review Checklist", "- What inputs does the code expect?\n- What output or side effect does it produce?\n- What can be null, undefined, missing, or malformed?\n- Are secrets or user inputs handled safely?\n- Can the logic be tested with small examples?")}\n\n${section("Snippet", "```text\n" + truncate(code, 1800) + "\n```")}`;
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
  const snippets = sentenceSplit(text).filter((s) => qWords.some((word) => s.toLowerCase().includes(word))).slice(0, 4);
  return `# Document Q&A\n\n${section("Question", question)}\n\n${section("Answer", snippets.length ? "The pasted text contains relevant passages. Based on the matched excerpts, answer cautiously and verify against the source before using it in decisions." : "The local MVP did not find strong matching excerpts. Try adding more document text or asking a more specific question.")}\n\n${section("Relevant Excerpts", snippets.length ? snippets.map((s, i) => `${i + 1}. ${truncate(s, 240)}`).join("\n") : "- No strong local matches found.")}\n\n${section("Production Upgrade", "Use embeddings, chunk retrieval, page numbers, and source citations before turning this into a paid document Q&A product.")}`;
}

function paperExplainer(values: ToolValues): string {
  const paper = val(values, "paper");
  const audience = val(values, "audience", "general");
  const keywords = extractKeywords(paper).slice(0, 10);
  return `# Research Paper Explainer\n\n${section("Plain-English Summary", `For a ${audience} audience, this paper appears to focus on: ${keywords.join(", ") || "the pasted topic"}. Use the sections below as a review scaffold, then verify against the full paper.`)}\n\n${section("What to Extract", "- Problem: What gap or question does the paper address?\n- Method: What data, model, experiment, or argument is used?\n- Findings: What changed or was proven?\n- Limitations: What assumptions, dataset constraints, or missing comparisons matter?\n- Practical implication: What would a builder, researcher, or product team do differently?")}\n\n${section("Source Excerpt", "```text\n" + truncate(paper, 1600) + "\n```")}`;
}

function resumeOptimizer(values: ToolValues): string {
  const resume = val(values, "resume");
  const role = val(values, "role");
  const lines = resume.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 6);
  const rewritten = lines.map((line) => `- Improved: Led ${role}-relevant work by turning "${truncate(line, 80)}" into a measurable outcome; add metric, scope, and business impact.`).join("\n") || "- Add 3-5 bullets describing actions, tools, scale, and measurable results.";
  return `# Resume Optimization\n\n${section("Target role", role)}\n\n${section("Rewritten Bullet Drafts", rewritten)}\n\n${section("Metrics to Add", "- Revenue, cost savings, retention, conversion, speed, quality, or reliability impact.\n- Team size, project scope, users served, data volume, or systems supported.\n- Before/after improvement where possible.")}\n\n${section("Rule", "Keep every claim truthful. If you do not have a metric, add scope or frequency instead of inventing a number.")}`;
}

function meetingNotes(values: ToolValues): string {
  const notes = val(values, "notes");
  const tone = val(values, "tone", "professional");
  const sentences = sentenceSplit(notes).slice(0, 6);
  return `# Meeting Notes\n\n${section("Summary", sentences.length ? list(sentences.map((s) => truncate(s, 160))) : "- Add more meeting notes for a stronger summary.")}\n\n${section("Decisions", "- Decision 1: confirm from notes.\n- Decision 2: confirm owner and deadline.")}\n\n${section("Action Items", "- Owner: TBD — Task: confirm next step — Due: TBD.\n- Owner: TBD — Task: resolve open question — Due: TBD.")}\n\n${section("Follow-up Email", `Subject: Meeting recap and next steps\n\nHi team,\n\nThanks for the ${tone} discussion. Here are the key takeaways, decisions, and action items from today's meeting. Please reply with corrections or missing owners.\n\nBest,`)}`;
}

function youtubeScript(values: ToolValues): string {
  const topic = val(values, "topic");
  const audience = val(values, "audience", "general viewers");
  const length = val(values, "length", "8min");
  return `# YouTube Script Outline\n\n${section("Topic", topic)}\n\n${section("Audience", audience)}\n\n${section("Structure", `1. Hook: A surprising claim or problem about ${topic}.\n2. Promise: What viewers will be able to do after watching.\n3. Context: Why this matters now.\n4. Main sections: 3-5 practical points with examples.\n5. Demo or story: show the workflow, not just opinions.\n6. Recap: repeat the key framework.\n7. CTA: ask viewers to try a tool, comment with their use case, or subscribe.`)}\n\n${section("Length Guidance", `${length}: keep each section tight and cut anything that does not support the viewer promise.`)}\n\n${section("Thumbnail Ideas", "- Before vs after workflow.\n- Tool stack screenshot with one bold claim.\n- Human expression plus simple 3-word headline.")}`;
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
  return `# Short-Form Video Hooks\n\n${section("Hooks", list(hooks))}\n\n${section("Opening Shot Ideas", "- Show the final result first.\n- Cut to the messy before state.\n- Overlay one clear promise in 5-7 words.")}\n\n${section("CTA Options", "- Save this for later.\n- Comment 'workflow' and I will share the template.\n- Follow for practical AI tools.")}`;
}

function linkedInPost(values: ToolValues): string {
  const idea = val(values, "idea");
  const tone = val(values, "tone", "insightful");
  return `# LinkedIn Post Draft\n\nI used to think the hard part was having a good idea.\n\nThe harder part is turning that idea into a repeatable workflow.\n\n${idea}\n\nWhat changed my approach:\n\n- Start with the real user task, not the technology.\n- Build the smallest useful tool first.\n- Measure repeat usage before adding expensive AI calls.\n- Turn the winning workflow into a template.\n\nThe lesson: ${tone === "concise" ? "tools beat generic content when users have a job to do." : "AI products win when they remove steps from real work, not when they add another chat box."}\n\nWhat workflow are you trying to simplify right now?`;
}

function productDescription(values: ToolValues): string {
  const product = val(values, "product");
  const features = val(values, "features");
  const audience = val(values, "audience", "busy customers");
  const featureLines = features.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean).slice(0, 6);
  return `# Product Description\n\n${section("Short Description", `${product} helps ${audience} get the outcome they want faster, with less manual effort and a cleaner workflow.`)}\n\n${section("Benefit Bullets", featureLines.length ? list(featureLines.map((f) => `${f}: turn this feature into a clear customer benefit.`)) : "- Add key features to generate stronger benefit bullets.")}\n\n${section("Ad Angles", "- Save time without changing your workflow.\n- Replace messy manual steps with a repeatable system.\n- Get better output with less trial and error.")}\n\n${section("CTA", "Try it free and see the workflow in action.")}`;
}

function newsletterOutline(values: ToolValues): string {
  const topic = val(values, "topic");
  const audience = val(values, "audience", "readers");
  return `# Newsletter Outline\n\n${section("Subject Lines", list([`A practical guide to ${topic}`, `What ${audience} should know about ${topic}`, `5 useful lessons from ${topic}`]))}\n\n${section("Issue Structure", `1. Intro: why ${topic} matters this week.\n2. Main idea: the useful framework or observation.\n3. Practical example: show the workflow or before/after.\n4. Tools/resources: add 2-4 links or templates.\n5. CTA: ask readers to reply with their use case.`)}\n\n${section("Publishing Notes", "Keep the intro short, use scannable sections, and include one action readers can take immediately.")}`;
}

function timestampConverter(values: ToolValues): string {
  const input = val(values, "value");
  const numeric = /^\d+$/.test(input) ? Number(input) : NaN;
  const date = Number.isFinite(numeric) ? new Date(input.length >= 13 ? numeric : numeric * 1000) : new Date(input);
  if (Number.isNaN(date.getTime())) return `# Timestamp Converter\n\nCould not parse \`${input}\`. Try a Unix timestamp, milliseconds timestamp, or ISO date string.`;
  return `# Timestamp Conversion\n\n- Input: \`${input}\`\n- ISO UTC: \`${date.toISOString()}\`\n- Browser/server local string: \`${date.toString()}\`\n- Unix seconds: \`${Math.floor(date.getTime() / 1000)}\`\n- Unix milliseconds: \`${date.getTime()}\`\n\nTimezone note: display time depends on the user's browser or server timezone.`;
}

function textCleanup(values: ToolValues): string {
  const text = val(values, "text");
  const mode = val(values, "mode", "readable");
  let cleaned = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (mode === "single") cleaned = cleaned.replace(/\s*\n\s*/g, " ");
  if (mode === "bullets") cleaned = cleaned.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => `- ${line}`).join("\n");
  return `# Cleaned Text\n\n\`\`\`text\n${cleaned}\n\`\`\``;
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
