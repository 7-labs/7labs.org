import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { executeTool } from "../lib/toolExecutors";
import { tools, type ToolDefinition } from "../lib/tools";

const fieldValues: Record<string, string> = {
  apiKey: "sk-example-redacted",
  audience: "solo founders",
  background: "clean studio background",
  code: "function add(a: number, b: number) { return a + b; }",
  context: "Next.js production build",
  criteria: "quality, cost, speed, reliability",
  duration: "8s",
  endpoint: "https://api.example.com/v1/items",
  emotion: "confident",
  error: "TypeError: Cannot read properties of undefined",
  features: "Fast setup, clean workflow, reusable output",
  flavor: "javascript",
  goal: "make the output specific and actionable",
  idea: "A dashboard that turns rough notes into an execution plan",
  input: "Rewrite this task as a clear English AI prompt.",
  json: "{\"name\":\"7labs\",\"active\":true}",
  length: "8min",
  method: "GET",
  mode: "readable",
  mood: "premium",
  notes: "We agreed to ship the first version this week. The owner will validate the production checklist.",
  paper: "This paper studies retrieval augmented generation systems and evaluates answer quality under source constraints.",
  pattern: "email address",
  product: "AI workflow planner",
  prompt: "Create a concise launch checklist for a SaaS landing page.",
  question: "What are the key action items?",
  request: "Select users created in the last 30 days grouped by plan.",
  resume: "Built internal tools for marketing operations and reporting.",
  role: "product manager",
  style: "cinematic",
  subject: "a premium AI workspace on a clean desk",
  target: "general",
  task: "Choose a low-cost AI stack for writing, research, and image prompts.",
  text: "Messy   copied text\n\n\nwith too many spaces.",
  tone: "insightful",
  tools: "ChatGPT, Claude, Gemini",
  topic: "AI tools for product teams",
  value: "1780473600",
  workflow: "individual",
  yaml: "name: 7labs\nactive: true"
};

function valuesForTool(tool: ToolDefinition): Record<string, string> {
  const values: Record<string, string> = {};

  for (const field of tool.fields) {
    if (field.type === "select") {
      values[field.name] = field.defaultValue || field.options?.[0]?.value || "";
      continue;
    }
    values[field.name] = field.defaultValue || fieldValues[field.name] || `Example ${field.label}`;
  }

  return values;
}

describe("local tool executors", () => {
  it("has one executable local executor for every public tool", () => {
    assert.equal(tools.length, 32);

    for (const tool of tools) {
      const output = executeTool(tool.slug, valuesForTool(tool));

      assert.notEqual(
        output,
        `# ${tool.slug}\n\nThis tool is registered but does not have a local executor yet. Connect it to /api/ai or add a rule-based executor in lib/toolExecutors.ts.`,
        `${tool.slug} fell back to the missing-executor placeholder`
      );
      assert.match(output, /^# /, `${tool.slug} should return Markdown with a heading`);
      assert.ok(output.length > 40, `${tool.slug} should return useful output`);
      assert.ok(output.length < 20000, `${tool.slug} should keep output bounded`);
    }
  });

  it("keeps all launch categories represented", () => {
    const categories = new Set(tools.map((tool) => tool.category));
    assert.deepEqual(
      Array.from(categories).sort(),
      ["creator", "dev", "docs", "finder", "prompt", "utility"]
    );
  });
});
