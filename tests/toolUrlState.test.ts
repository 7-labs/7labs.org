import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTool } from "../lib/tools";
import { buildPrefilledToolUrl, initialToolValues, valuesFromSearch } from "../lib/toolUrlState";

describe("tool URL state", () => {
  it("prefills matching field names and caps long values", () => {
    const tool = getTool("youtube-script-generator");
    assert.ok(tool);
    const longTopic = "x".repeat(700);
    const result = valuesFromSearch(tool, `?topic=${longTopic}&unknown=ignored`, initialToolValues(tool));

    assert.equal(result.appliedKeys.includes("topic"), true);
    assert.equal(result.values.topic.length, 600);
    assert.equal("unknown" in result.values, false);
  });

  it("accepts description as a primary-field alias for single-task links", () => {
    const tool = getTool("regex-generator");
    assert.ok(tool);
    const result = valuesFromSearch(tool, "?description=match+emails", initialToolValues(tool));

    assert.equal(result.values.pattern, "match emails");
    assert.deepEqual(result.appliedKeys, ["pattern"]);
  });

  it("builds shareable URLs and omits oversized textarea values", () => {
    const tool = getTool("regex-generator");
    assert.ok(tool);
    const share = buildPrefilledToolUrl(
      tool,
      { pattern: "match emails", flavor: "javascript" },
      "https://7labs.org/tools/regex-generator?old=value"
    );

    assert.equal(share.url, "https://7labs.org/tools/regex-generator?pattern=match+emails");
    assert.deepEqual(share.includedKeys, ["pattern"]);
    assert.deepEqual(share.omittedKeys, []);

    const oversized = buildPrefilledToolUrl(tool, { pattern: "x".repeat(700) }, "https://7labs.org/tools/regex-generator");
    assert.deepEqual(oversized.includedKeys, []);
    assert.deepEqual(oversized.omittedKeys, ["pattern"]);
  });
});
