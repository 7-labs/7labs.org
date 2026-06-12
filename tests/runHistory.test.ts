import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRunHistoryEntry, mergeRunHistory, parseRunHistory, RUN_HISTORY_LIMIT, RUN_HISTORY_OUTPUT_LIMIT, runHistoryKey } from "../lib/runHistory";

describe("run history helpers", () => {
  it("uses a per-tool browser storage key", () => {
    assert.equal(runHistoryKey("regex-generator"), "7labs:history:regex-generator");
  });

  it("caps output previews and keeps the newest five entries", () => {
    const entries = Array.from({ length: 6 }, (_, index) => createRunHistoryEntry(
      { pattern: `value-${index}` },
      "x".repeat(RUN_HISTORY_OUTPUT_LIMIT + 25),
      new Date(Date.UTC(2026, 5, 12, 10, index))
    ));
    const merged = entries.reduce((current, entry) => mergeRunHistory(current, entry), [] as typeof entries);

    assert.equal(merged.length, RUN_HISTORY_LIMIT);
    assert.equal(merged[0].values.pattern, "value-5");
    assert.equal(merged[0].outputPreview.length, RUN_HISTORY_OUTPUT_LIMIT);
  });

  it("ignores malformed stored data", () => {
    assert.deepEqual(parseRunHistory("not json"), []);
    assert.deepEqual(parseRunHistory(JSON.stringify([{ missing: true }])), []);
  });
});
