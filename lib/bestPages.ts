export type BestPage = {
  slug: string;
  title: string;
  description: string;
  intent: string;
  lastReviewed: string;
  sourceLastChecked?: string;
  selectionCriteria: string[];
  evidenceNotes: string[];
  relatedComparisons: string[];
  sources: { label: string; url: string; type: "official" | "product" | "pricing" | "docs"; purpose: string; lastChecked: string }[];
  picks: { name: string; bestFor: string; why: string; caveat: string }[];
  workflow: string[];
  relatedTools: string[];
};

export const bestPages: BestPage[] = [
  {
    slug: "best-ai-for-coding",
    title: "Best AI for Coding: Pick the Right Developer Workflow",
    description: "Choose AI tools for autocomplete, multi-file edits, debugging, SQL, regex, code explanation, and developer utilities.",
    intent: "Users searching this are usually not looking for a generic list. They want to know which AI tool fits a specific coding task and how to combine it with safe review habits.",
    lastReviewed: "2026-05-31",
    sourceLastChecked: "2026-06-03",
    selectionCriteria: ["Codebase context", "Autocomplete quality", "Debugging support", "Review burden", "Adoption friction"],
    evidenceNotes: ["Recommendations are workflow-based and should be retested when IDE agents change pricing, limits, or model defaults.", "Developer tools are ranked by task fit, not by brand popularity alone."],
    relatedComparisons: ["cursor-vs-copilot", "chatgpt-vs-gemini"],
    sources: [
      { label: "GitHub Copilot", url: "https://github.com/features/copilot", type: "product", purpose: "Official product surface for Copilot positioning and workflow fit.", lastChecked: "2026-06-03" },
      { label: "Cursor", url: "https://www.cursor.com/", type: "product", purpose: "Official product surface for Cursor positioning and codebase-editing workflow fit.", lastChecked: "2026-06-03" }
    ],
    picks: [
      { name: "Cursor / Windsurf", bestFor: "Multi-file edits", why: "They work inside an IDE and understand more of the codebase context.", caveat: "Requires adopting a new editor-style workflow." },
      { name: "GitHub Copilot", bestFor: "Daily autocomplete", why: "It is mature inside common developer environments.", caveat: "Complex tasks still need human planning and review." },
      { name: "ChatGPT / Claude / Gemini", bestFor: "Explaining, debugging, architecture", why: "Useful when you paste a focused snippet plus clear context.", caveat: "Avoid pasting secrets, private keys, or sensitive proprietary code." },
      { name: "7labs Developer Lab", bestFor: "Small repeatable tasks", why: "Regex, JSON, Git, cron, cURL, and SQL tasks can be handled faster than a general chat flow.", caveat: "Deep semantic code review should use a stronger model or IDE agent." }
    ],
    workflow: ["Use Error Explainer to classify the issue.", "Use Code Explainer to understand the relevant snippet.", "Use Regex, SQL, Git, cron, or JSON tools for focused tasks.", "Use an IDE agent for multi-file changes, then manually review the diff."],
    relatedTools: ["error-explainer", "code-explainer", "regex-generator", "sql-generator"]
  },
  {
    slug: "best-ai-for-writing",
    title: "Best AI for Writing: From Idea to Publishable Draft",
    description: "A practical workflow for writing, editing, adapting, and publishing English content with AI tools.",
    intent: "Writing tool searches are broad. The highest-value answer is a task-specific workflow: outline, draft, revise, platform adaptation, and final review.",
    lastReviewed: "2026-05-31",
    sourceLastChecked: "2026-06-03",
    selectionCriteria: ["Draft quality", "Long-form control", "Platform adaptation", "Editing workflow", "Human review cost"],
    evidenceNotes: ["Writing quality depends heavily on prompt context, examples, and final human editing.", "The page avoids fixed claims about model rankings because model behavior changes over time."],
    relatedComparisons: ["claude-vs-chatgpt", "chatgpt-vs-gemini"],
    sources: [
      { label: "ChatGPT", url: "https://chatgpt.com/", type: "product", purpose: "Official product entry point for general assistant workflow availability.", lastChecked: "2026-06-03" },
      { label: "Claude", url: "https://claude.ai/", type: "product", purpose: "Official product entry point for long-form writing and document workflow positioning.", lastChecked: "2026-06-03" },
      { label: "Notion AI", url: "https://www.notion.com/product/ai", type: "product", purpose: "Official product surface for workspace writing and team-document workflow fit.", lastChecked: "2026-06-03" }
    ],
    picks: [
      { name: "ChatGPT", bestFor: "General drafting and structure", why: "Good for turning ideas into outlines and first drafts.", caveat: "Needs clear audience, tone, and output format." },
      { name: "Claude", bestFor: "Long-form writing", why: "Often strong for natural prose, long context, and document-style work.", caveat: "Model availability and limits vary." },
      { name: "Notion AI", bestFor: "Team docs", why: "Works well when content already lives in a knowledge base.", caveat: "Less ideal for users outside the Notion ecosystem." },
      { name: "7labs Creator Lab", bestFor: "Platform-specific writing", why: "YouTube, LinkedIn, newsletters, and product copy should not all use the same prompt.", caveat: "Performance still depends on real audience feedback." }
    ],
    workflow: ["Use Prompt Optimizer to define audience and output format.", "Generate an outline before generating full copy.", "Adapt the copy by platform: LinkedIn, YouTube, newsletter, product page.", "Track performance and save the winning templates."],
    relatedTools: ["prompt-optimizer", "linkedin-post-generator", "youtube-script-generator", "newsletter-outline-generator"]
  },
  {
    slug: "best-ai-for-image-generation",
    title: "Best AI for Image Generation: Tools and Prompt Workflow",
    description: "Compare AI image tools and use a prompt-first workflow for product photos, thumbnails, concept art, and marketing visuals.",
    intent: "Most users want controllable images, not just another free image generator. A prompt-first workflow lowers cost and improves results across tools.",
    lastReviewed: "2026-05-31",
    sourceLastChecked: "2026-06-03",
    selectionCriteria: ["Visual quality", "Control", "Learning curve", "Commercial finishing workflow", "Prompt portability"],
    evidenceNotes: ["Image-model tools change quickly, so the page emphasizes workflow selection over live pricing claims.", "Prompt preparation is separated from image generation to avoid unnecessary paid credit use."],
    relatedComparisons: ["midjourney-vs-stable-diffusion"],
    sources: [
      { label: "Midjourney", url: "https://www.midjourney.com/", type: "product", purpose: "Official product surface for image-generation workflow positioning.", lastChecked: "2026-06-03" },
      { label: "Stability AI", url: "https://stability.ai/", type: "product", purpose: "Official product surface for Stable Diffusion ecosystem positioning.", lastChecked: "2026-06-03" },
      { label: "Canva", url: "https://www.canva.com/", type: "product", purpose: "Official product surface for design-finishing and creator workflow fit.", lastChecked: "2026-06-03" }
    ],
    picks: [
      { name: "Midjourney", bestFor: "High-aesthetic visuals", why: "Strong style quality for posters, concepts, and mood exploration.", caveat: "Precise text and layout usually need post-production." },
      { name: "Stable Diffusion", bestFor: "Control and local workflows", why: "Open ecosystem with LoRA, ControlNet, and local deployment options.", caveat: "Setup and workflow complexity are higher." },
      { name: "Canva AI", bestFor: "Social posts and non-designers", why: "Templates and editing make assets easier to finish.", caveat: "Premium features may require subscription." },
      { name: "7labs Prompt Studio", bestFor: "Low-cost prompt preparation", why: "Get the prompt right before spending credits on image generation.", caveat: "The MVP generates prompts, not images." }
    ],
    workflow: ["Generate a general image prompt first.", "Convert it into Midjourney or Stable Diffusion format.", "First pass: composition. Second pass: style. Third pass: commercial details.", "Add final typography in Canva, Figma, or Photoshop."],
    relatedTools: ["image-prompt-generator", "midjourney-prompt-generator", "stable-diffusion-prompt-generator", "product-photo-prompt-generator"]
  },
  {
    slug: "best-ai-for-pdf",
    title: "Best AI for PDF: Summary, Q&A, and Research Workflows",
    description: "Use AI to summarize PDFs, ask document questions, explain papers, and turn meetings into action items.",
    intent: "Document workflows monetize better because users have clear work tasks, time pressure, and a need for citations and exports.",
    lastReviewed: "2026-05-31",
    sourceLastChecked: "2026-06-03",
    selectionCriteria: ["Long-document handling", "Citation needs", "Privacy risk", "Export workflow", "Review cost"],
    evidenceNotes: ["The MVP uses pasted text only; production PDF upload should require retention controls and citation UX.", "Document recommendations prioritize verification behavior over raw summary speed."],
    relatedComparisons: ["claude-vs-chatgpt", "chatgpt-vs-gemini"],
    sources: [
      { label: "ChatGPT", url: "https://chatgpt.com/", type: "product", purpose: "Official product entry point for document and general assistant workflows.", lastChecked: "2026-06-03" },
      { label: "Claude", url: "https://claude.ai/", type: "product", purpose: "Official product entry point for long-document assistant workflows.", lastChecked: "2026-06-03" },
      { label: "Gemini", url: "https://gemini.google.com/", type: "product", purpose: "Official product entry point for Google assistant and multimodal workflows.", lastChecked: "2026-06-03" }
    ],
    picks: [
      { name: "Claude / ChatGPT / Gemini", bestFor: "Long-document reasoning", why: "Useful for summaries and structured analysis when the source is provided.", caveat: "Privacy and citation reliability matter." },
      { name: "Notion AI", bestFor: "Team knowledge bases", why: "Good for notes and docs that already live in Notion.", caveat: "External file workflows vary." },
      { name: "7labs Document Lab", bestFor: "Focused summaries and Q&A", why: "Can be built around citations, export, history, and team workflows.", caveat: "The MVP uses pasted text; production should add PDF parsing and page citations." }
    ],
    workflow: ["Extract or upload the document text.", "Use PDF Summarizer for first-pass summary.", "Use Chat with PDF for targeted questions.", "Verify key claims against source excerpts before sharing."],
    relatedTools: ["pdf-summarizer", "chat-with-pdf", "research-paper-explainer", "meeting-notes-generator"]
  },
  {
    slug: "best-ai-for-youtube",
    title: "Best AI for YouTube: Script, Thumbnail, and Workflow Stack",
    description: "Build a YouTube workflow with script outlines, thumbnail prompts, hooks, and content repurposing.",
    intent: "English-speaking creators often search for AI tools that help them move from idea to script to thumbnail to Shorts without losing the core message.",
    lastReviewed: "2026-05-31",
    sourceLastChecked: "2026-06-03",
    selectionCriteria: ["Script structure", "Thumbnail concept control", "Short-form repurposing", "Workflow repeatability", "Cost before publishing"],
    evidenceNotes: ["Creator tool recommendations should be checked against real retention and click-through data.", "The 7labs workflow prepares scripts and prompts before users spend paid image or video credits."],
    relatedComparisons: ["chatgpt-vs-gemini", "midjourney-vs-stable-diffusion"],
    sources: [
      { label: "ChatGPT", url: "https://chatgpt.com/", type: "product", purpose: "Official product entry point for creator script and ideation workflows.", lastChecked: "2026-06-03" },
      { label: "Claude", url: "https://claude.ai/", type: "product", purpose: "Official product entry point for long-form script drafting workflows.", lastChecked: "2026-06-03" },
      { label: "Midjourney", url: "https://www.midjourney.com/", type: "product", purpose: "Official product surface for thumbnail visual exploration workflows.", lastChecked: "2026-06-03" },
      { label: "Canva", url: "https://www.canva.com/", type: "product", purpose: "Official product surface for thumbnail and social-design finishing workflows.", lastChecked: "2026-06-03" }
    ],
    picks: [
      { name: "ChatGPT / Claude", bestFor: "Script structure", why: "Good for turning a topic into outline, examples, and narrative flow.", caveat: "Needs a clear audience and video promise." },
      { name: "Midjourney / Canva", bestFor: "Thumbnail exploration", why: "Combines AI visuals with editable design finishing.", caveat: "Readable text should usually be added after generation." },
      { name: "7labs Creator Lab", bestFor: "Repeatable creator workflow", why: "Combines YouTube scripts, thumbnail prompts, and short-form hooks in one toolset.", caveat: "Audience retention data should drive iteration." }
    ],
    workflow: ["Use YouTube Script Generator to structure the story.", "Use YouTube Thumbnail Prompt Generator to create visual concepts.", "Use TikTok Hook Generator to repurpose the strongest idea into Shorts.", "Save the winning script and thumbnail template for the next video."],
    relatedTools: ["youtube-script-generator", "youtube-thumbnail-prompt-generator", "tiktok-hook-generator"]
  }
];

export function getBestPage(slug: string): BestPage | undefined {
  return bestPages.find((page) => page.slug === slug);
}
