import { NextRequest, NextResponse } from "next/server";
import type { AnalyticsEventName } from "@/lib/analytics";
import { recordEvent, type ValidatedEventPayload } from "@/lib/eventSink";

const allowedEvents = new Set<AnalyticsEventName>([
  "tool_run",
  "example_loaded",
  "copy_output",
  "feedback_submitted",
  "category_filter",
  "best_compare_click",
  "newsletter_signup"
]);

const MAX_BODY_CHARS = 4096;

type EventBody = {
  event?: string;
  page?: string;
  toolSlug?: string;
  category?: string;
  target?: string;
  value?: string;
  email?: string;
};

function clean(value: unknown, max = 180): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function jsonError(code: string, message: string, status: number, details?: Record<string, unknown>) {
  return NextResponse.json({ code, message, ...(details ? { details } : {}) }, { status });
}

function enabled(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}

function validEmail(value: string | undefined): boolean {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

async function getCloudflareEnv(): Promise<unknown> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    return getCloudflareContext().env;
  } catch {
    return undefined;
  }
}

async function readBody(request: NextRequest): Promise<EventBody> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_CHARS) {
    throw new Error("body-too-large");
  }

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    throw new Error("unsupported-content-type");
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries()) as EventBody;
  }

  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) {
    throw new Error("body-too-large");
  }
  if (!text.trim()) return {};
  return JSON.parse(text) as EventBody;
}

export async function POST(request: NextRequest) {
  let body: EventBody;
  try {
    body = await readBody(request);
  } catch (error) {
    if (error instanceof Error && error.message === "body-too-large") {
      return jsonError("body_too_large", "Event payload is too large", 413, { maxBodyChars: MAX_BODY_CHARS });
    }
    if (error instanceof Error && error.message === "unsupported-content-type") {
      return jsonError("unsupported_content_type", "Event requests must use JSON or URL-encoded form data", 415);
    }
    return jsonError("invalid_payload", "Invalid event payload", 400);
  }

  const event = clean(body.event, 64) as AnalyticsEventName | undefined;
  if (!event || !allowedEvents.has(event)) {
    return jsonError("unsupported_event", "Unsupported event", 400);
  }

  const payload: ValidatedEventPayload & { page?: string; category?: string; target?: string; email?: string } = {
    event,
    page: clean(body.page),
    toolSlug: clean(body.toolSlug),
    category: clean(body.category),
    target: clean(body.target),
    value: clean(body.value, 80),
    email: event === "newsletter_signup" ? clean(body.email, 254) : undefined
  };

  if (payload.event === "newsletter_signup") {
    const newsletterProvider = (process.env.NEWSLETTER_PROVIDER || "none").toLowerCase();
    if (!enabled(process.env.NEWSLETTER_FORM_ENABLED) || newsletterProvider === "none") {
      return jsonError("newsletter_not_configured", "Newsletter capture is not configured", 501);
    }
    if (!validEmail(payload.email)) {
      return jsonError("invalid_email", "A valid email address is required", 400);
    }
    return jsonError("newsletter_provider_missing", "Newsletter provider integration is not configured in this build", 501, { provider: newsletterProvider });
  }

  const provider = (process.env.ANALYTICS_PROVIDER || "none").toLowerCase();
  if (provider === "none") {
    return NextResponse.json({ provider: "none", accepted: true, event: payload.event });
  }

  if (provider === "workers-analytics") {
    const env = await getCloudflareEnv();
    recordEvent(env, payload);
    return NextResponse.json({ provider, accepted: true, event: payload.event });
  }

  return NextResponse.json({
    provider,
    accepted: false,
    code: "analytics_provider_missing",
    message: "Analytics provider is not configured in this build"
  }, { status: 501 });
}
