import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { promptPages } from "../lib/promptPages";
import { getTool } from "../lib/tools";

const expectedSlugs = [
  "midjourney-prompts",
  "stable-diffusion-prompts",
  "product-photo-prompts",
  "youtube-thumbnail-prompts",
  "ai-video-prompts",
  "image-prompts"
];

describe("promptPages", () => {
  it("keeps the planned static prompt library set explicit", () => {
    assert.deepEqual(promptPages.map((page) => page.slug), expectedSlugs);
  });

  it("wraps existing prompt tools with complete SEO content", () => {
    for (const page of promptPages) {
      const tool = getTool(page.toolSlug);

      assert.ok(tool, `${page.slug} must point at an existing tool`);
      assert.equal(tool?.category, "prompt", `${page.slug} must wrap a prompt-category tool`);
      assert.notEqual(page.title, tool?.name, `${page.slug} should not duplicate the tool page H1`);
      assert.notEqual(page.metaDescription, tool?.description, `${page.slug} should have its own meta description`);
      assert.ok(page.metaDescription.length <= 160, `${page.slug} meta description is too long`);
      assert.ok(page.intro.length >= 80, `${page.slug} needs a substantive intro`);
      assert.ok(page.examples.length >= 10, `${page.slug} needs at least 10 examples`);
      assert.ok(page.tips.length >= 4, `${page.slug} needs at least 4 model notes`);
      assert.ok(page.faq.length >= 4, `${page.slug} needs at least 4 FAQ items`);
      assert.match(page.lastReviewed, /^\d{4}-\d{2}-\d{2}$/, `${page.slug} needs an ISO review date`);

      for (const example of page.examples) {
        assert.ok(example.label.length >= 3, `${page.slug} has an unlabeled example`);
        assert.ok(example.prompt.length >= 80, `${page.slug} example prompt is too thin: ${example.label}`);
        assert.ok(example.notes.length >= 20, `${page.slug} example needs practical notes: ${example.label}`);
      }
    }
  });

  it("uses valid prompt page cross-links", () => {
    const slugs = new Set(promptPages.map((page) => page.slug));

    for (const page of promptPages) {
      assert.ok(page.relatedSlugs.length >= 3, `${page.slug} needs at least three related prompt pages`);
      for (const relatedSlug of page.relatedSlugs) {
        assert.notEqual(relatedSlug, page.slug, `${page.slug} must not link to itself`);
        assert.ok(slugs.has(relatedSlug), `${page.slug} has unknown related prompt page ${relatedSlug}`);
      }
    }
  });
});
