import type { ToolValues } from "@/lib/toolExecutors";

export type RunHistoryEntry = {
  id: string;
  values: ToolValues;
  outputPreview: string;
  createdAt: string;
};

export const RUN_HISTORY_LIMIT = 5;
export const RUN_HISTORY_OUTPUT_LIMIT = 500;

export function runHistoryKey(toolSlug: string): string {
  return `7labs:history:${toolSlug}`;
}

export function createRunHistoryEntry(values: ToolValues, output: string, now = new Date()): RunHistoryEntry {
  const createdAt = now.toISOString();
  return {
    id: `${createdAt}-${Object.keys(values).length}-${output.length}`,
    values: { ...values },
    outputPreview: output.slice(0, RUN_HISTORY_OUTPUT_LIMIT),
    createdAt
  };
}

export function mergeRunHistory(entries: RunHistoryEntry[], entry: RunHistoryEntry): RunHistoryEntry[] {
  const withoutDuplicate = entries.filter((item) => item.id !== entry.id);
  return [entry, ...withoutDuplicate].slice(0, RUN_HISTORY_LIMIT);
}

export function parseRunHistory(raw: string | null): RunHistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is RunHistoryEntry => {
        return Boolean(
          item &&
          typeof item === "object" &&
          typeof (item as RunHistoryEntry).id === "string" &&
          typeof (item as RunHistoryEntry).createdAt === "string" &&
          typeof (item as RunHistoryEntry).outputPreview === "string" &&
          (item as RunHistoryEntry).values &&
          typeof (item as RunHistoryEntry).values === "object"
        );
      })
      .slice(0, RUN_HISTORY_LIMIT);
  } catch {
    return [];
  }
}
