"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ToolDefinition } from "@/lib/tools";
import { trackEvent } from "@/lib/analytics";
import { executeTool, ToolValues } from "@/lib/toolExecutors";
import { RunHistory } from "@/components/RunHistory";
import { buildPrefilledToolUrl, initialToolValues, valuesFromSearch } from "@/lib/toolUrlState";
import { createRunHistoryEntry, RunHistoryEntry } from "@/lib/runHistory";

export function ToolRunner({ tool }: { tool: ToolDefinition }) {
  const [values, setValues] = useState<ToolValues>(() => initialToolValues(tool));
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [feedback, setFeedback] = useState<"useful" | "needs_improvement" | "">("");
  const [statusMessage, setStatusMessage] = useState("");
  const [latestHistoryEntry, setLatestHistoryEntry] = useState<RunHistoryEntry | null>(null);
  const requiredMissing = useMemo(() => {
    return tool.fields.some((field) => field.required && !String(values[field.name] ?? "").trim());
  }, [tool.fields, values]);

  useEffect(() => {
    const next = valuesFromSearch(tool, window.location.search, initialToolValues(tool));
    if (next.appliedKeys.length) {
      setValues(next.values);
      setStatusMessage(`Prefilled ${next.appliedKeys.length} field${next.appliedKeys.length === 1 ? "" : "s"} from the URL.`);
    }
  }, [tool]);

  function update(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (result) setResult("");
    setCopied(false);
    setShared(false);
    setFeedback("");
    setStatusMessage("Input changed. Generate a new result before copying or submitting feedback.");
  }

  function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requiredMissing) return;
    const output = executeTool(tool.slug, values);
    setResult(output);
    setCopied(false);
    setShared(false);
    setFeedback("");
    setLatestHistoryEntry(createRunHistoryEntry(values, output));
    setStatusMessage("Generated result is ready.");
    trackEvent({ event: "tool_run", toolSlug: tool.slug });
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setStatusMessage("Generated result copied.");
      trackEvent({ event: "copy_output", toolSlug: tool.slug, value: "copy" });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setStatusMessage("Copy failed. Select the generated result manually.");
    }
  }

  async function sharePrefilledLink() {
    const share = buildPrefilledToolUrl(tool, values, window.location.href);
    if (!share.includedKeys.length) {
      setStatusMessage("Add at least one non-default field value before sharing a prefilled link.");
      return;
    }
    try {
      await navigator.clipboard.writeText(share.url);
      setShared(true);
      const omitted = share.omittedKeys.length ? ` Omitted oversized fields: ${share.omittedKeys.join(", ")}.` : "";
      setStatusMessage(`Prefilled link copied.${omitted}`);
      trackEvent({ event: "copy_output", toolSlug: tool.slug, value: "share_link" });
      setTimeout(() => setShared(false), 1600);
    } catch {
      setStatusMessage("Share link copy failed. Copy the current browser URL manually.");
    }
  }

  function downloadMarkdown() {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${tool.slug}-output.md`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatusMessage("Markdown file downloaded.");
    trackEvent({ event: "copy_output", toolSlug: tool.slug, value: "download_md" });
  }

  function loadExample(example: ToolDefinition["exampleRuns"][number]) {
    setValues((prev) => ({ ...prev, ...example.values }));
    if (result) setResult("");
    setCopied(false);
    setShared(false);
    setFeedback("");
    setStatusMessage("Example loaded. Generate a new result before copying or submitting feedback.");
    trackEvent({ event: "example_loaded", toolSlug: tool.slug, value: example.label });
  }

  function restoreHistory(historyValues: ToolValues) {
    setValues((prev) => ({ ...prev, ...historyValues }));
    if (result) setResult("");
    setCopied(false);
    setShared(false);
    setFeedback("");
    setStatusMessage("Recent run restored. Generate again to refresh the output.");
  }

  function submitFeedback(value: "useful" | "needs_improvement") {
    setFeedback(value);
    setStatusMessage(value === "useful" ? "Marked useful." : "Feedback saved.");
    trackEvent({ event: "feedback_submitted", toolSlug: tool.slug, value });
  }

  return (
    <section className="runner-shell" id="try">
      <div className="runner-form-card">
        <div className="section-kicker">Try it now</div>
        <h2>Use this tool</h2>
        <form onSubmit={run} className="tool-form">
          {tool.fields.map((field) => (
            <label key={field.name} className="field">
              <span>{field.label}{field.required ? <b> *</b> : null}</span>
              {field.type === "textarea" ? (
                <textarea
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  required={field.required}
                  onChange={(event) => update(field.name, event.target.value)}
                  rows={7}
                />
              ) : field.type === "select" ? (
                <select
                  value={values[field.name] ?? field.defaultValue ?? ""}
                  required={field.required}
                  onChange={(event) => update(field.name, event.target.value)}
                >
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  required={field.required}
                  onChange={(event) => update(field.name, event.target.value)}
                />
              )}
            </label>
          ))}
          <button className="primary-button" disabled={requiredMissing} type="submit">Generate output</button>
        </form>
        <div className="examples-row">
          {tool.exampleRuns.slice(0, 4).map((example) => (
            <button key={example.label} type="button" onClick={() => loadExample(example)}>{example.label}</button>
          ))}
        </div>
        <div className="trust-note">
          <strong>No API key required.</strong>
          <span>This tool runs on the local rule engine by default. It does not call an external AI model while <code>AI_PROVIDER=none</code>.</span>
        </div>
        <RunHistory tool={tool} latestEntry={latestHistoryEntry} onRestore={restoreHistory} />
      </div>
      <div className="runner-result-card">
        <div className="sr-only" role="status" aria-live="polite">{statusMessage}</div>
        <div className="result-head">
          <div>
            <div className="section-kicker">Output</div>
            <h2>Generated result</h2>
          </div>
          <div className="result-actions">
            <button className="ghost-button" type="button" onClick={sharePrefilledLink}>{shared ? "Link copied" : "Share link"}</button>
            <button className="ghost-button" type="button" disabled={!result} onClick={copy}>{copied ? "Copied" : "Copy"}</button>
            <button className="ghost-button" type="button" disabled={!result} onClick={downloadMarkdown}>Download .md</button>
          </div>
        </div>
        {result ? (
          <>
            <pre className="result-box" aria-live="polite">{result}</pre>
            <div className="feedback-row" aria-label="Output feedback">
              <button className="ghost-button" type="button" onClick={() => submitFeedback("useful")}>
                {feedback === "useful" ? "Marked useful" : "Useful"}
              </button>
              <button className="ghost-button" type="button" onClick={() => submitFeedback("needs_improvement")}>
                {feedback === "needs_improvement" ? "Feedback saved" : "Needs improvement"}
              </button>
              {tool.relatedSlugs[0] ? (
                <Link className="secondary-button" href={`/tools/${tool.relatedSlugs[0]}`}>Try related tool</Link>
              ) : null}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Fill out the form to generate a structured result. The default tool engine runs locally in the browser, so it works without an API key.</p>
            <p>For stronger assisted output, 7labs can add provider-backed generation after quotas, caching, rate limits, and spend controls are ready.</p>
            <div className="sample-output">
              <strong>Sample output:</strong>
              <p>{tool.sampleOutput}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
