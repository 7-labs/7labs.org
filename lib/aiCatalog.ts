export type CatalogTool = {
  name: string;
  category: "coding" | "writing" | "image" | "video" | "search" | "docs" | "design" | "productivity";
  tags: string[];
  strengths: string[];
  limitations: string[];
  freeTier: "yes" | "limited" | "no" | "unknown";
  englishFit: "excellent" | "good" | "medium" | "unknown";
  url: string;
};

export const aiCatalog: CatalogTool[] = [
  {
    name: "ChatGPT",
    category: "productivity",
    tags: ["general", "writing", "coding", "docs", "brainstorming", "workflow"],
    strengths: ["Broad general-purpose coverage", "Strong for writing, summarization, coding help, and workflow design", "Large ecosystem"],
    limitations: ["Vertical tasks still need clear prompts", "Premium features may require subscription"],
    freeTier: "limited",
    englishFit: "excellent",
    url: "https://chatgpt.com"
  },
  {
    name: "Claude",
    category: "writing",
    tags: ["writing", "docs", "long context", "research", "analysis"],
    strengths: ["Strong long-document understanding", "Natural writing style", "Useful for reports, summaries, and code discussion"],
    limitations: ["Availability and quotas vary", "Capabilities differ by model tier"],
    freeTier: "limited",
    englishFit: "excellent",
    url: "https://claude.ai"
  },
  {
    name: "Google Gemini",
    category: "productivity",
    tags: ["general", "multimodal", "coding", "docs", "image prompt", "google"],
    strengths: ["Strong multimodal and Google ecosystem fit", "Useful for lightweight API integrations", "Good for broad productivity tasks"],
    limitations: ["Model tiers vary widely", "Requires careful model routing for products"],
    freeTier: "limited",
    englishFit: "excellent",
    url: "https://gemini.google.com"
  },
  {
    name: "Perplexity",
    category: "search",
    tags: ["search", "research", "citations", "current information", "sources"],
    strengths: ["Good for web research and source-backed answers", "Fast research search experience"],
    limitations: ["Not primarily a production writing or coding environment"],
    freeTier: "limited",
    englishFit: "excellent",
    url: "https://www.perplexity.ai"
  },
  {
    name: "Cursor",
    category: "coding",
    tags: ["coding", "IDE", "agent", "codebase", "debug"],
    strengths: ["Deep IDE integration", "Useful for multi-file edits", "Strong developer workflow"],
    limitations: ["Requires adopting a specific editor workflow", "Team costs need evaluation"],
    freeTier: "limited",
    englishFit: "excellent",
    url: "https://cursor.com"
  },
  {
    name: "GitHub Copilot",
    category: "coding",
    tags: ["coding", "autocomplete", "IDE", "enterprise", "github"],
    strengths: ["Mature coding autocomplete", "Strong GitHub and VS Code ecosystem fit"],
    limitations: ["Better for coding assistance than broad research tasks"],
    freeTier: "limited",
    englishFit: "excellent",
    url: "https://github.com/features/copilot"
  },
  {
    name: "Windsurf",
    category: "coding",
    tags: ["coding", "agent", "IDE", "codebase", "workflow"],
    strengths: ["Agentic coding editor experience", "Good for multi-file coding workflows"],
    limitations: ["Learning curve", "Fit depends on existing development workflow"],
    freeTier: "limited",
    englishFit: "good",
    url: "https://windsurf.com"
  },
  {
    name: "Midjourney",
    category: "image",
    tags: ["image", "art", "cover", "poster", "style", "prompt"],
    strengths: ["Strong visual taste and style quality", "Great for concept art, posters, and visual exploration"],
    limitations: ["Precise text and layout usually need post-production", "Typically paid"],
    freeTier: "no",
    englishFit: "excellent",
    url: "https://www.midjourney.com"
  },
  {
    name: "Stable Diffusion / SDXL",
    category: "image",
    tags: ["image", "open source", "local", "controlnet", "lora", "product photo"],
    strengths: ["Open ecosystem", "Can run locally", "Highly controllable with the right workflow"],
    limitations: ["Higher setup and learning cost", "Quality depends on model and workflow"],
    freeTier: "yes",
    englishFit: "good",
    url: "https://stability.ai"
  },
  {
    name: "Canva AI",
    category: "design",
    tags: ["design", "poster", "social media", "template", "creator", "thumbnail"],
    strengths: ["Templates and editing flow are friendly", "Good for non-designers and social assets"],
    limitations: ["Premium assets and features often require subscription", "Less flexible than pro design software"],
    freeTier: "limited",
    englishFit: "excellent",
    url: "https://www.canva.com"
  },
  {
    name: "Runway",
    category: "video",
    tags: ["video", "image to video", "creative", "editing", "ads"],
    strengths: ["Mature AI video creation workflow", "Useful for creative short clips and motion experiments"],
    limitations: ["Generation can be costly", "Precise control still takes iteration"],
    freeTier: "limited",
    englishFit: "good",
    url: "https://runwayml.com"
  },
  {
    name: "Notion AI",
    category: "docs",
    tags: ["docs", "notes", "team", "writing", "summary", "knowledge base"],
    strengths: ["Works inside team knowledge bases", "Good for summarizing and rewriting notes"],
    limitations: ["Best for teams already using Notion", "External file workflows can be limited"],
    freeTier: "limited",
    englishFit: "excellent",
    url: "https://www.notion.com/product/ai"
  }
];
