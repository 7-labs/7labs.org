import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function jsonLdTypes(page: Page): Promise<string[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => (
    nodes.map((node) => node.textContent ?? "")
  ));

  return blocks.flatMap((block) => {
    try {
      const parsed = JSON.parse(block) as { "@type"?: string } | { "@type"?: string }[];
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return items.map((item) => item["@type"]).filter((type): type is string => Boolean(type));
    } catch {
      return [];
    }
  });
}

test.describe("launch smoke", () => {
  test("home renders the primary H1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pick the right AI workflow before you spend credits.");
  });

  test("/tools renders all 32 tool cards", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.locator("[data-tool-card]")).toHaveCount(32);
    await expect(page.getByRole("searchbox", { name: "Search tools" })).toBeVisible();
  });

  test("regex generator can load an example, run, and copy output", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/tools/regex-generator");
    await page.getByRole("button", { name: "Invoice ID" }).click();
    await page.getByRole("button", { name: "Generate output" }).click();

    await expect(page.locator(".result-box")).toContainText("# Regex Draft");
    const copyButton = page.getByRole("button", { name: "Copy" });
    await expect(copyButton).toBeEnabled();
    await copyButton.click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  });

  test("editing regex input clears stale output", async ({ page }) => {
    await page.goto("/tools/regex-generator");
    await page.getByRole("textbox", { name: /pattern to match/i }).fill("match emails");
    await page.getByRole("button", { name: "Generate output" }).click();
    await expect(page.locator(".result-box")).toContainText("# Regex Draft");

    await page.getByRole("textbox", { name: /pattern to match/i }).fill("match phone numbers");
    await expect(page.locator(".result-box")).toHaveCount(0);
    await expect(page.getByText("Fill out the form to generate a structured result.")).toBeVisible();
  });

  test("best page renders guide JSON-LD", async ({ page }) => {
    await page.goto("/best/best-ai-for-coding");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Best AI for Coding");
    await expect.poll(async () => page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(3);
    const types = await jsonLdTypes(page);
    expect(types).toContain("TechArticle");
    expect(types).toContain("ItemList");
  });

  test("compare page renders the decision guide", async ({ page }) => {
    await page.goto("/compare/chatgpt-vs-gemini");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ChatGPT vs Gemini");
    await expect(page.getByRole("heading", { name: "Verdict" })).toBeVisible();
    await expect.poll(async () => page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(3);
    const types = await jsonLdTypes(page);
    expect(types).toContain("TechArticle");
    expect(types).toContain("ItemList");
  });

  test("prompt page renders its tool and curated examples", async ({ page }) => {
    await page.goto("/prompts/midjourney-prompts");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Midjourney Prompts");
    await expect(page.getByRole("heading", { name: "Use this tool" })).toBeVisible();
    await expect.poll(async () => page.locator(".prompt-example").count()).toBeGreaterThanOrEqual(10);
  });
});
