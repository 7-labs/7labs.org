import type { ToolDefinition } from "@/lib/tools";
import type { ToolValues } from "@/lib/toolExecutors";

export const TOOL_QUERY_VALUE_LIMIT = 600;
export const TOOL_SHARE_URL_LIMIT = 2000;

type PrefillResult = {
  values: ToolValues;
  appliedKeys: string[];
};

type ShareUrlResult = {
  url: string;
  includedKeys: string[];
  omittedKeys: string[];
};

function capValue(value: string): string {
  return value.slice(0, TOOL_QUERY_VALUE_LIMIT);
}

function fieldNames(tool: ToolDefinition): Set<string> {
  return new Set(tool.fields.map((field) => field.name));
}

function primaryFieldName(tool: ToolDefinition): string | undefined {
  return tool.fields.find((field) => field.required)?.name ?? tool.fields[0]?.name;
}

function normalizeSelectValue(field: ToolDefinition["fields"][number], value: string): string | undefined {
  if (field.type !== "select") return value;
  return field.options?.some((option) => option.value === value) ? value : undefined;
}

export function initialToolValues(tool: ToolDefinition): ToolValues {
  return Object.fromEntries(tool.fields.map((field) => [field.name, field.defaultValue ?? ""]));
}

export function valuesFromSearch(tool: ToolDefinition, search: string, baseValues: ToolValues = initialToolValues(tool)): PrefillResult {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const names = fieldNames(tool);
  const nextValues: ToolValues = { ...baseValues };
  const appliedKeys: string[] = [];

  for (const field of tool.fields) {
    const raw = params.get(field.name);
    if (raw === null) continue;
    const normalized = normalizeSelectValue(field, capValue(raw));
    if (normalized === undefined) continue;
    nextValues[field.name] = normalized;
    appliedKeys.push(field.name);
  }

  const primary = primaryFieldName(tool);
  if (primary && !appliedKeys.includes(primary) && !names.has("description")) {
    const aliasValue = params.get("description") ?? params.get("q") ?? params.get("input");
    const field = tool.fields.find((item) => item.name === primary);
    if (field && aliasValue !== null) {
      const normalized = normalizeSelectValue(field, capValue(aliasValue));
      if (normalized !== undefined) {
        nextValues[primary] = normalized;
        appliedKeys.push(primary);
      }
    }
  }

  return { values: nextValues, appliedKeys };
}

export function buildPrefilledToolUrl(tool: ToolDefinition, values: ToolValues, baseUrl: string): ShareUrlResult {
  const url = new URL(baseUrl);
  url.search = "";
  const includedKeys: string[] = [];
  const omittedKeys: string[] = [];

  for (const field of tool.fields) {
    const rawValue = String(values[field.name] ?? "").trim();
    if (!rawValue || rawValue === (field.defaultValue ?? "")) continue;
    if (field.type === "textarea" && rawValue.length > TOOL_QUERY_VALUE_LIMIT) {
      omittedKeys.push(field.name);
      continue;
    }

    const nextUrl = new URL(url.toString());
    nextUrl.searchParams.set(field.name, capValue(rawValue));
    if (nextUrl.toString().length > TOOL_SHARE_URL_LIMIT) {
      omittedKeys.push(field.name);
      continue;
    }
    url.searchParams.set(field.name, capValue(rawValue));
    includedKeys.push(field.name);
  }

  return { url: url.toString(), includedKeys, omittedKeys };
}
