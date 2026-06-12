export type AnalyticsEventName =
  | "tool_run"
  | "example_loaded"
  | "copy_output"
  | "feedback_submitted"
  | "category_filter"
  | "best_compare_click"
  | "newsletter_signup";

export type AnalyticsPayload = {
  event: AnalyticsEventName;
  page?: string;
  toolSlug?: string;
  category?: string;
  target?: string;
  value?: string;
};

const MAX_PAYLOAD_CHARS = 1024;

function clean(value: string | undefined, max: number): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

export function trackEvent(payload: AnalyticsPayload): void {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;

  const safePayload: AnalyticsPayload = {
    event: payload.event,
    page: clean(payload.page ?? window.location.pathname, 180),
    toolSlug: clean(payload.toolSlug, 120),
    category: clean(payload.category, 80),
    target: clean(payload.target, 120),
    value: clean(payload.value, 80)
  };

  let body = JSON.stringify(safePayload);
  if (body.length > MAX_PAYLOAD_CHARS) {
    safePayload.value = undefined;
    body = JSON.stringify(safePayload);
  }
  if (body.length > MAX_PAYLOAD_CHARS) return;

  const endpoint = "/api/events";
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(endpoint, blob)) return;
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => undefined);
}
