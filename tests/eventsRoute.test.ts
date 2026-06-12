import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/events/route";

function jsonRequest(body: unknown): NextRequest {
  return new NextRequest("https://7labs.org/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

async function postJson(body: unknown) {
  const response = await POST(jsonRequest(body));
  const json = await response.json();
  return { response, json };
}

describe("/api/events", () => {
  it("accepts whitelisted non-newsletter events when analytics provider is none", async () => {
    process.env.ANALYTICS_PROVIDER = "none";
    const events = [
      "tool_run",
      "example_loaded",
      "copy_output",
      "feedback_submitted",
      "category_filter",
      "best_compare_click"
    ];

    for (const event of events) {
      const { response, json } = await postJson({ event, toolSlug: "regex-generator", value: "copy" });
      assert.equal(response.status, 200);
      assert.equal(json.provider, "none");
      assert.equal(json.accepted, true);
      assert.equal(json.event, event);
    }
  });

  it("rejects unknown event names", async () => {
    process.env.ANALYTICS_PROVIDER = "none";
    const { response, json } = await postJson({ event: "raw_prompt_saved", value: "should not be accepted" });

    assert.equal(response.status, 400);
    assert.equal(json.code, "unsupported_event");
  });

  it("rejects oversized payloads", async () => {
    process.env.ANALYTICS_PROVIDER = "none";
    const oversized = JSON.stringify({ event: "tool_run", value: "x".repeat(5000) });
    const { response, json } = await postJson(oversized);

    assert.equal(response.status, 413);
    assert.equal(json.code, "body_too_large");
  });

  it("never echoes raw event input or output-like values", async () => {
    process.env.ANALYTICS_PROVIDER = "none";
    const rawValue = "private generated output that should never be echoed";
    const { response, json } = await postJson({
      event: "tool_run",
      toolSlug: "regex-generator",
      value: rawValue
    });

    assert.equal(response.status, 200);
    assert.equal(JSON.stringify(json).includes(rawValue), false);
  });
});
