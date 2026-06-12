import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bestPages, getBestPage } from "../lib/bestPages";
import { comparePages, getComparePage } from "../lib/comparePages";
import { promptPages, getPromptPage } from "../lib/promptPages";
import { categories, getTool, tools } from "../lib/tools";

describe("internal SEO links", () => {
  it("gives every tool valid related tools and decision-support links", () => {
    for (const tool of tools) {
      assert.ok(categories[tool.category], `${tool.slug} has an unknown category`);
      assert.ok(tool.relatedSlugs.length >= 3, `${tool.slug} needs at least three related tools`);

      for (const relatedSlug of tool.relatedSlugs) {
        assert.notEqual(relatedSlug, tool.slug, `${tool.slug} must not relate to itself`);
        assert.ok(getTool(relatedSlug), `${tool.slug} has unknown related tool ${relatedSlug}`);
      }

      for (const bestSlug of tool.relatedBestSlugs) {
        assert.ok(getBestPage(bestSlug), `${tool.slug} has unknown related best page ${bestSlug}`);
      }

      for (const compareSlug of tool.relatedCompareSlugs) {
        assert.ok(getComparePage(compareSlug), `${tool.slug} has unknown related compare page ${compareSlug}`);
      }

      assert.ok(
        tool.relatedBestSlugs.length + tool.relatedCompareSlugs.length >= 1,
        `${tool.slug} needs at least one best or compare link`
      );
    }
  });

  it("keeps best guide references resolvable", () => {
    for (const page of bestPages) {
      assert.ok(page.relatedTools.length >= 3, `${page.slug} needs related tools`);
      for (const toolSlug of page.relatedTools) {
        assert.ok(getTool(toolSlug), `${page.slug} has unknown related tool ${toolSlug}`);
      }
      for (const compareSlug of page.relatedComparisons) {
        assert.ok(getComparePage(compareSlug), `${page.slug} has unknown related comparison ${compareSlug}`);
      }
    }
  });

  it("keeps comparison pages linked back from best guides", () => {
    for (const page of comparePages) {
      assert.ok(page.relatedTools.length >= 3, `${page.slug} needs related tools`);
      for (const toolSlug of page.relatedTools) {
        assert.ok(getTool(toolSlug), `${page.slug} has unknown related tool ${toolSlug}`);
      }

      const backlinks = bestPages.filter((bestPage) => bestPage.relatedComparisons.includes(page.slug));
      assert.ok(backlinks.length >= 1, `${page.slug} needs at least one best-guide backlink`);
    }
  });

  it("keeps prompt library references resolvable", () => {
    for (const page of promptPages) {
      assert.ok(getTool(page.toolSlug), `${page.slug} has unknown wrapped tool ${page.toolSlug}`);
      for (const relatedSlug of page.relatedSlugs) {
        assert.ok(getPromptPage(relatedSlug), `${page.slug} has unknown related prompt page ${relatedSlug}`);
      }
    }
  });
});
