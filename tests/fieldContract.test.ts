import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, it } from "node:test";
import { tools } from "../lib/tools";

const here = path.dirname(fileURLToPath(import.meta.url));
const executorSource = readFileSync(path.join(here, "..", "lib", "toolExecutors.ts"), "utf8");

/**
 * Collect every key read via val(values, "KEY", ...) inside a chunk of source text.
 * Matches both single- and double-quoted keys.
 */
function valKeys(source: string): Set<string> {
  const keys = new Set<string>();
  const re = /\bval\(\s*values\s*,\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

/**
 * Extract the body of a named top-level `function NAME(...) { ... }` declaration by
 * walking braces from the opening `{` of its signature to the matching close.
 */
function functionBody(source: string, name: string): string | undefined {
  const signature = new RegExp(`function\\s+${name}\\s*\\(`).exec(source);
  if (!signature) return undefined;
  const open = source.indexOf("{", signature.index);
  if (open === -1) return undefined;
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    const char = source[i];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  return undefined;
}

/**
 * Parse the executeTool switch and, for each `case "<slug>":` line, resolve the set
 * of value keys that slug reads:
 *  - keys read inline in the case body (e.g. summarizeText(val(values, "text"), ...))
 *  - keys read inside any helper function the case delegates to (fnName(values))
 */
function executorKeysBySlug(source: string): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();
  // Split the switch into per-case segments. Each case runs until the next `case "` or `default:`.
  const caseRe = /case\s+"([^"]+)"\s*:([\s\S]*?)(?=\n\s*case\s+"|\n\s*default\s*:)/g;
  let match: RegExpExecArray | null;
  while ((match = caseRe.exec(source)) !== null) {
    const slug = match[1];
    const caseBody = match[2];
    const keys = valKeys(caseBody);

    // Follow every helper call of the form fnName(values) referenced in the case body.
    const callRe = /\b([A-Za-z_$][\w$]*)\s*\(\s*values\b/g;
    let call: RegExpExecArray | null;
    while ((call = callRe.exec(caseBody)) !== null) {
      const fn = call[1];
      if (fn === "val") continue;
      const body = functionBody(source, fn);
      if (body) {
        for (const key of valKeys(body)) keys.add(key);
      }
    }

    result.set(slug, keys);
  }
  return result;
}

describe("field/executor contract", () => {
  const keysBySlug = executorKeysBySlug(executorSource);

  it("parses an executor case for every public tool", () => {
    for (const tool of tools) {
      assert.ok(
        keysBySlug.has(tool.slug),
        `no executor case parsed for "${tool.slug}" — switch shape may have changed`
      );
    }
  });

  it("every executor-read value key is backed by a declared tool field", () => {
    const mismatches: string[] = [];

    for (const tool of tools) {
      const readKeys = keysBySlug.get(tool.slug);
      if (!readKeys) continue; // covered by the previous test
      const fieldNames = new Set(tool.fields.map((field) => field.name));
      for (const key of readKeys) {
        if (!fieldNames.has(key)) {
          mismatches.push(
            `${tool.slug}: executor reads val(values, "${key}") but no field named "${key}" exists ` +
              `(fields: ${[...fieldNames].join(", ") || "none"})`
          );
        }
      }
    }

    assert.equal(
      mismatches.length,
      0,
      `Executor reads keys with no matching tool field:\n${mismatches.join("\n")}`
    );
  });
});
