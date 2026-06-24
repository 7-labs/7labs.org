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

function extractFencedJson(output: string): unknown {
  const match = output.match(/```json\n([\s\S]*?)\n```/);
  assert.ok(match, "expected a ```json fenced block in the output");
  return JSON.parse(match![1]);
}

function extractInlineCode(output: string, label: string): string {
  // Matches a line like: - ISO 8601 (UTC): `2026-06-03T08:00:00.000Z`
  const re = new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\`]*\`([^\`]+)\``);
  const match = output.match(re);
  assert.ok(match, `expected an inline-code value labelled "${label}"`);
  return match![1];
}

describe("local tool executors — output correctness", () => {
  it("timestamp-converter parses Unix seconds and emits the correct UTC ISO string", () => {
    // 1780473600 is a 10-digit value, so it must be treated as Unix SECONDS.
    // new Date(1780473600 * 1000).toISOString() === 2026-06-03T08:00:00.000Z
    const output = executeTool("timestamp-converter", { value: "1780473600" });

    assert.match(output, /parsed as a Unix seconds/, "should detect Unix seconds, not milliseconds");
    assert.equal(extractInlineCode(output, "ISO 8601 (UTC):"), "2026-06-03T08:00:00.000Z");
    assert.equal(extractInlineCode(output, "UTC date:"), "2026-06-03");
    assert.equal(extractInlineCode(output, "UTC time:"), "08:00:00");
    assert.equal(extractInlineCode(output, "Unix seconds:"), "1780473600");
    assert.equal(extractInlineCode(output, "Unix milliseconds:"), "1780473600000");
  });

  it("json-fixer round-trips already-valid JSON", () => {
    const input = '{"name":"7labs","active":true}';
    const output = executeTool("json-fixer", { json: input });

    assert.match(output, /^# Fixed JSON/, "valid JSON should report a successful fix, not a repair attempt");
    const parsed = extractFencedJson(output) as { name?: string; active?: boolean };
    assert.deepEqual(parsed, { name: "7labs", active: true });
  });

  it("json-fixer repairs unquoted keys, single quotes, and trailing commas into valid JSON", () => {
    const output = executeTool("json-fixer", { json: "{ name: 'Acme', features: ['x',], }" });

    assert.match(output, /^# Fixed JSON/, "this sample is repairable and should parse after cleanup");
    const parsed = extractFencedJson(output) as { name?: string; features?: string[] };
    // Quoted keys, double-quoted strings, no trailing commas — i.e. genuinely valid JSON.
    assert.deepEqual(parsed, { name: "Acme", features: ["x"] });
  });

  it("regex-generator emits a pattern that compiles via new RegExp without throwing", () => {
    const output = executeTool("regex-generator", { pattern: "match an email address", flavor: "javascript" });

    // Pattern is rendered as `/.../` for the JavaScript flavor; strip the slash delimiters.
    const literal = extractInlineCode(output, "## Pattern");
    const source = literal.replace(/^\/(.*)\/$/, "$1");
    assert.notEqual(source, "", "expected a non-empty regex source");
    assert.doesNotThrow(() => new RegExp(source), "suggested regex must be a valid pattern");

    // Sanity-check the email regex actually matches a real email and rejects junk.
    const compiled = new RegExp(source);
    assert.ok(compiled.test("hello@example.com"));
    assert.equal(compiled.test("not-an-email"), false);
  });

  it("cron-generator emits the correct cron field for an every-5-minutes schedule", () => {
    const output = executeTool("cron-generator", { schedule: "every 5 minutes", format: "standard" });

    assert.match(output, /\*\/5 \* \* \* \*/, "every-5-minutes should produce */5 * * * *");
    assert.equal(extractInlineCode(output, "# Cron Expression"), "*/5 * * * *");
    assert.match(output, /Every 5 minutes\./);
  });
});
