import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/ai/route";

const MANAGED_ENV_KEYS = ["AI_PROVIDER", "AI_GATEWAY_ENABLED"] as const;

function jsonRequest(body: unknown): NextRequest {
  return new NextRequest("https://7labs.org/api/ai", {
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

describe("/api/ai", () => {
  const saved = new Map<string, string | undefined>();

  beforeEach(() => {
    for (const key of MANAGED_ENV_KEYS) saved.set(key, process.env[key]);
  });

  afterEach(() => {
    for (const key of MANAGED_ENV_KEYS) {
      const original = saved.get(key);
      if (original === undefined) delete process.env[key];
      else process.env[key] = original;
    }
    saved.clear();
  });

  it("returns the local none-mode response without echoing the prompt", async () => {
    delete process.env.AI_PROVIDER; // unset => defaults to "none"
    delete process.env.AI_GATEWAY_ENABLED;

    const marker = "ZZ_UNIQUE_PROMPT_MARKER_7labs_42";
    const { response, json } = await postJson({ prompt: marker });

    assert.equal(response.status, 200);
    assert.equal(json.provider, "none");
    assert.equal(typeof json.text, "string");
    // None-mode must not echo the user prompt back into the response.
    assert.equal(
      json.text.includes(marker),
      false,
      "none-mode response must not echo the submitted prompt"
    );
  });

  it("also treats an explicit AI_PROVIDER=none as local none-mode", async () => {
    process.env.AI_PROVIDER = "none";
    delete process.env.AI_GATEWAY_ENABLED;

    const marker = "ZZ_EXPLICIT_NONE_MARKER_7labs_99";
    const { response, json } = await postJson({ prompt: marker });

    assert.equal(response.status, 200);
    assert.equal(json.provider, "none");
    assert.equal(json.text.includes(marker), false);
  });

  it("blocks provider mode with 403 when the AI gateway is not enabled", async () => {
    process.env.AI_PROVIDER = "openai";
    delete process.env.AI_GATEWAY_ENABLED; // gate flag missing

    const { response, json } = await postJson({ prompt: "summarize this text" });

    assert.equal(response.status, 403);
    assert.equal(json.code, "ai_gateway_disabled");
  });
});
