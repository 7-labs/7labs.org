export type ComparePage = {
  slug: string;
  title: string;
  description: string;
  left: string;
  right: string;
  verdict: string;
  lastReviewed: string;
  sourceLastChecked?: string;
  selectionCriteria: string[];
  bestForLeft: string;
  bestForRight: string;
  decisionRule: string;
  evidenceNotes: string[];
  sources: { label: string; url: string; type: "official" | "product" | "pricing" | "docs"; purpose: string; lastChecked: string }[];
  rows: { factor: string; left: string; right: string }[];
  relatedTools: string[];
};

export const comparePages: ComparePage[] = [
  {
    slug: "chatgpt-vs-gemini",
    title: "ChatGPT vs Gemini: Which AI Assistant Should You Use?",
    description: "A practical comparison for writing, coding, multimodal work, ecosystem fit, and API-driven tools.",
    left: "ChatGPT",
    right: "Gemini",
    verdict: "For general English workflows, choose based on ecosystem, task type, and cost. 7labs can act as a neutral pre-work layer that structures the task before sending it to a primary model.",
    lastReviewed: "2026-06-21",
    sourceLastChecked: "2026-06-03",
    selectionCriteria: ["General writing", "Coding help", "Multimodal support", "Ecosystem fit", "API cost control"],
    bestForLeft: "Broad assistant workflows, custom GPT-style tasks, and OpenAI-compatible API ecosystems.",
    bestForRight: "Google ecosystem users, multimodal work, and Gemini API experiments.",
    decisionRule: "Choose the assistant that matches the workspace where the task will actually be finished, then use 7labs to structure the input before spending model calls.",
    evidenceNotes: ["Feature availability, limits, and pricing can change; verify current provider pages before purchase.", "This comparison is task-first rather than a universal model ranking."],
    sources: [
      { label: "ChatGPT", url: "https://chatgpt.com/", type: "product", purpose: "Official product entry point for ChatGPT workflow availability.", lastChecked: "2026-06-03" },
      { label: "Gemini", url: "https://gemini.google.com/", type: "product", purpose: "Official product entry point for Gemini workflow availability.", lastChecked: "2026-06-03" }
    ],
    rows: [
      { factor: "General writing", left: "Strong", right: "Strong" },
      { factor: "Google ecosystem", left: "Medium", right: "Strong" },
      { factor: "Multimodal tasks", left: "Strong", right: "Strong" },
      { factor: "Tool-site cost control", left: "Depends on model tier", right: "Lightweight tiers can fit high-volume tasks" }
    ],
    relatedTools: ["ai-tool-finder", "prompt-optimizer", "pdf-summarizer"]
  },
  {
    slug: "claude-vs-chatgpt",
    title: "Claude vs ChatGPT: Long Documents, Writing, and Workflows",
    description: "Compare Claude and ChatGPT for long-form writing, document analysis, coding discussion, and general productivity.",
    left: "Claude",
    right: "ChatGPT",
    verdict: "Try Claude first for long-form drafting and document-heavy review. Try ChatGPT first for broad workflows, ecosystem features, and general assistant use.",
    lastReviewed: "2026-06-21",
    sourceLastChecked: "2026-06-03",
    selectionCriteria: ["Long-form drafting", "Document analysis", "General assistant breadth", "Coding discussion", "Team workflow fit"],
    bestForLeft: "Long-form writing, document review, and natural editorial workflows.",
    bestForRight: "General assistant tasks, broad ecosystem features, and mixed productivity workflows.",
    decisionRule: "Use Claude when prose and document review are the main task; use ChatGPT when the task spans tools, coding discussion, and broad assistant behavior.",
    evidenceNotes: ["Model behavior and subscription limits change over time, so rerun hands-on tests for paid team decisions.", "Long-document work still needs source verification."],
    sources: [
      { label: "Claude", url: "https://claude.ai/", type: "product", purpose: "Official product entry point for Claude workflow availability.", lastChecked: "2026-06-03" },
      { label: "ChatGPT", url: "https://chatgpt.com/", type: "product", purpose: "Official product entry point for ChatGPT workflow availability.", lastChecked: "2026-06-03" }
    ],
    rows: [
      { factor: "Long documents", left: "Strong", right: "Strong" },
      { factor: "Natural writing", left: "Strong", right: "Strong" },
      { factor: "Ecosystem", left: "Medium", right: "Strong" },
      { factor: "Coding discussion", left: "Strong", right: "Strong" }
    ],
    relatedTools: ["pdf-summarizer", "research-paper-explainer", "prompt-optimizer"]
  },
  {
    slug: "midjourney-vs-stable-diffusion",
    title: "Midjourney vs Stable Diffusion: AI Image Tool Choice",
    description: "Compare visual taste, control, cost, local deployment, and learning curve.",
    left: "Midjourney",
    right: "Stable Diffusion",
    verdict: "Use Midjourney when you want fast, high-aesthetic concepts. Use Stable Diffusion when you need control, local workflows, and extensibility.",
    lastReviewed: "2026-06-21",
    sourceLastChecked: "2026-06-03",
    selectionCriteria: ["Aesthetic quality", "Control", "Learning curve", "Local deployment", "Commercial finishing"],
    bestForLeft: "Fast high-aesthetic concepts and art-direction exploration.",
    bestForRight: "Control-heavy workflows, local generation, and extensible image pipelines.",
    decisionRule: "Choose Midjourney for speed and taste; choose Stable Diffusion when control, locality, and custom workflows matter more.",
    evidenceNotes: ["Image tool capabilities and license details should be reviewed before commercial deployment.", "Typography and exact product fidelity usually require post-production."],
    sources: [
      { label: "Midjourney", url: "https://www.midjourney.com/", type: "product", purpose: "Official product surface for Midjourney image workflow positioning.", lastChecked: "2026-06-03" },
      { label: "Stability AI", url: "https://stability.ai/", type: "product", purpose: "Official product surface for Stable Diffusion ecosystem positioning.", lastChecked: "2026-06-03" }
    ],
    rows: [
      { factor: "Visual taste", left: "Strong out of the box", right: "Depends on model and workflow" },
      { factor: "Control", left: "Medium", right: "Strong" },
      { factor: "Learning curve", left: "Lower", right: "Higher" },
      { factor: "Local deployment", left: "Not the focus", right: "Good fit" }
    ],
    relatedTools: ["midjourney-prompt-generator", "stable-diffusion-prompt-generator", "product-photo-prompt-generator"]
  },
  {
    slug: "cursor-vs-copilot",
    title: "Cursor vs GitHub Copilot: AI Coding Workflow Comparison",
    description: "Compare AI coding tools for autocomplete, codebase-aware edits, onboarding, and team adoption.",
    left: "Cursor",
    right: "GitHub Copilot",
    verdict: "Choose Cursor when multi-file agentic editing is the priority. Choose Copilot when you want mature autocomplete inside an existing IDE workflow.",
    lastReviewed: "2026-06-21",
    sourceLastChecked: "2026-06-03",
    selectionCriteria: ["Autocomplete", "Multi-file editing", "IDE adoption friction", "Team policy fit", "Manual review support"],
    bestForLeft: "Agentic codebase edits, project-wide refactors, and workflows where switching editor context is acceptable.",
    bestForRight: "Autocomplete and AI assistance inside existing GitHub and VS Code-centric workflows.",
    decisionRule: "Choose Cursor when agentic multi-file edits are worth adopting a focused IDE; choose Copilot when lower-friction autocomplete is the main need.",
    evidenceNotes: ["Teams should test both tools on a representative private repo before standardizing.", "Human diff review remains mandatory for production code."],
    sources: [
      { label: "Cursor", url: "https://www.cursor.com/", type: "product", purpose: "Official product surface for Cursor coding workflow positioning.", lastChecked: "2026-06-03" },
      { label: "GitHub Copilot", url: "https://github.com/features/copilot", type: "product", purpose: "Official product surface for Copilot coding workflow positioning.", lastChecked: "2026-06-03" }
    ],
    rows: [
      { factor: "Autocomplete", left: "Strong", right: "Strong" },
      { factor: "Multi-file agent work", left: "Strong", right: "Medium to strong depending on setup" },
      { factor: "Adoption friction", left: "Higher", right: "Lower for GitHub/VS Code users" },
      { factor: "Best companion", left: "Manual diff review", right: "Focused prompts and review checklist" }
    ],
    relatedTools: ["error-explainer", "code-explainer", "git-command-generator"]
  }
];

export function getComparePage(slug: string): ComparePage | undefined {
  return comparePages.find((page) => page.slug === slug);
}
