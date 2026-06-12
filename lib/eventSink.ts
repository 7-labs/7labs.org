import type { AnalyticsEventName } from "@/lib/analytics";

export type ValidatedEventPayload = {
  event: AnalyticsEventName;
  toolSlug?: string;
  value?: string;
};

type AnalyticsEngineDataset = {
  writeDataPoint(dataPoint: {
    blobs: string[];
    doubles: number[];
    indexes: string[];
  }): void;
};

function eventsDataset(env: unknown): AnalyticsEngineDataset | undefined {
  const binding = (env as { EVENTS?: unknown } | undefined)?.EVENTS;
  if (!binding || typeof binding !== "object") return undefined;
  const candidate = binding as Partial<AnalyticsEngineDataset>;
  return typeof candidate.writeDataPoint === "function" ? (candidate as AnalyticsEngineDataset) : undefined;
}

export function recordEvent(env: unknown, payload: ValidatedEventPayload): void {
  try {
    const dataset = eventsDataset(env);
    if (!dataset) return;
    dataset.writeDataPoint({
      blobs: [payload.event, payload.toolSlug ?? "", payload.value ?? ""],
      doubles: [1],
      indexes: [payload.event]
    });
  } catch {
    // Analytics must never block the request path.
  }
}
