import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { trackEvent } from "../lib/analytics";

function setGlobal(name: "window" | "navigator" | "fetch", value: unknown): PropertyDescriptor | undefined {
  const original = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value
  });
  return original;
}

function restoreGlobal(name: "window" | "navigator" | "fetch", original: PropertyDescriptor | undefined): void {
  if (original) {
    Object.defineProperty(globalThis, name, original);
    return;
  }
  delete (globalThis as Record<string, unknown>)[name];
}

describe("trackEvent", () => {
  it("does not send network calls when analytics is disabled", () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = "false";
    let beaconCalls = 0;
    let fetchCalls = 0;
    const originalWindow = setGlobal("window", { location: { pathname: "/tools" } });
    const originalNavigator = setGlobal("navigator", {
      sendBeacon: () => {
        beaconCalls += 1;
        return true;
      }
    });
    const originalFetch = setGlobal("fetch", () => {
      fetchCalls += 1;
      return Promise.resolve(new Response());
    });

    try {
      trackEvent({ event: "tool_run", toolSlug: "regex-generator" });
      assert.equal(beaconCalls, 0);
      assert.equal(fetchCalls, 0);
    } finally {
      restoreGlobal("fetch", originalFetch);
      restoreGlobal("navigator", originalNavigator);
      restoreGlobal("window", originalWindow);
    }
  });

  it("sends a capped payload with sendBeacon when analytics is enabled", async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = "true";
    let beaconUrl = "";
    let beaconBody: Blob | undefined;
    const originalWindow = setGlobal("window", { location: { pathname: "/tools/regex-generator" } });
    const originalNavigator = setGlobal("navigator", {
      sendBeacon: (url: string, body: Blob) => {
        beaconUrl = url;
        beaconBody = body;
        return true;
      }
    });
    const originalFetch = setGlobal("fetch", () => {
      throw new Error("fetch fallback should not run when sendBeacon succeeds");
    });

    try {
      trackEvent({ event: "copy_output", toolSlug: "regex-generator", value: "copy" });
      assert.equal(beaconUrl, "/api/events");
      assert.ok(beaconBody);
      const body = JSON.parse(await beaconBody.text());
      assert.equal(body.event, "copy_output");
      assert.equal(body.page, "/tools/regex-generator");
      assert.equal(body.toolSlug, "regex-generator");
      assert.equal(body.value, "copy");
    } finally {
      restoreGlobal("fetch", originalFetch);
      restoreGlobal("navigator", originalNavigator);
      restoreGlobal("window", originalWindow);
    }
  });

  it("falls back to fetch keepalive when sendBeacon returns false", () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = "true";
    let fetchInit: RequestInit | undefined;
    const originalWindow = setGlobal("window", { location: { pathname: "/tools" } });
    const originalNavigator = setGlobal("navigator", {
      sendBeacon: () => false
    });
    const originalFetch = setGlobal("fetch", (_url: string, init: RequestInit) => {
      fetchInit = init;
      return Promise.resolve(new Response());
    });

    try {
      trackEvent({ event: "category_filter", category: "prompt" });
      assert.equal(fetchInit?.method, "POST");
      assert.equal(fetchInit?.keepalive, true);
    } finally {
      restoreGlobal("fetch", originalFetch);
      restoreGlobal("navigator", originalNavigator);
      restoreGlobal("window", originalWindow);
    }
  });
});
