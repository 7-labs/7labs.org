"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getTool, ToolDefinition } from "@/lib/tools";
import { trackEvent } from "@/lib/analytics";
import { executeTool, ToolValues } from "@/lib/toolExecutors";
import { RunHistory } from "@/components/RunHistory";
import { buildPrefilledToolUrl, initialToolValues, valuesFromSearch } from "@/lib/toolUrlState";
import { createRunHistoryEntry, RunHistoryEntry } from "@/lib/runHistory";
import { renderMarkdown } from "@/lib/markdown";

type FieldControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export function ToolRunner({ tool }: { tool: ToolDefinition }) {
  const [values, setValues] = useState<ToolValues>(() => initialToolValues(tool));
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [feedback, setFeedback] = useState<"useful" | "needs_improvement" | "">("");
  const [statusMessage, setStatusMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [actionStatus, setActionStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [latestHistoryEntry, setLatestHistoryEntry] = useState<RunHistoryEntry | null>(null);
  const fieldRefs = useRef<Record<string, FieldControl | null>>({});
  const requiredMissing = useMemo(() => {
    return tool.fields.some((field) => field.required && !String(values[field.name] ?? "").trim());
  }, [tool.fields, values]);
  const shareReady = useMemo(() => {
    return tool.fields.some((field) => {
      const value = String(values[field.name] ?? "").trim();
      return value.length > 0 && value !== (field.defaultValue ?? "");
    });
  }, [tool.fields, values]);
  const nextSteps = useMemo(() => {
    return tool.relatedSlugs
      .slice(0, 3)
      .map((slug) => {
        const related = getTool(slug);
        return related ? { slug, name: related.name } : null;
      })
      .filter((entry): entry is { slug: string; name: string } => entry !== null);
  }, [tool.relatedSlugs]);

  function announce(tone: "success" | "error", text: string) {
    setStatusMessage(text);
    setActionStatus({ tone, text });
  }

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
    setValidationMessage("");
    setActionStatus(null);
    setStatusMessage("Input changed. Generate a new result before copying or submitting feedback.");
  }

  function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requiredMissing) {
      const firstMissing = tool.fields.find(
        (field) => field.required && !String(values[field.name] ?? "").trim()
      );
      const message = firstMissing
        ? `Fill in the required "${firstMissing.label}" field before generating a result.`
        : "Fill in the required fields before generating a result.";
      setValidationMessage(message);
      setStatusMessage(message);
      if (firstMissing) {
        const control = fieldRefs.current[firstMissing.name];
        if (control) {
          control.focus({ preventScroll: true });
          control.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }
    setValidationMessage("");
    setActionStatus(null);
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
      announce("success", "Generated result copied.");
      trackEvent({ event: "copy_output", toolSlug: tool.slug, value: "copy" });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      announce("error", "Copy failed. Select the generated result manually.");
    }
  }

  async function sharePrefilledLink() {
    const share = buildPrefilledToolUrl(tool, values, window.location.href);
    if (!share.includedKeys.length) {
      announce("error", "Add at least one non-default field value before sharing a prefilled link.");
      return;
    }
    try {
      await navigator.clipboard.writeText(share.url);
      setShared(true);
      const omitted = share.omittedKeys.length ? ` Omitted oversized fields: ${share.omittedKeys.join(", ")}.` : "";
      announce("success", `Prefilled link copied.${omitted}`);
      trackEvent({ event: "copy_output", toolSlug: tool.slug, value: "share_link" });
      setTimeout(() => setShared(false), 1600);
    } catch {
      announce("error", "Share link copy failed. Copy the current browser URL manually.");
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
    announce("success", "Markdown file downloaded.");
    trackEvent({ event: "copy_output", toolSlug: tool.slug, value: "download_md" });
  }

  function loadExample(example: ToolDefinition["exampleRuns"][number]) {
    setValues((prev) => ({ ...prev, ...example.values }));
    if (result) setResult("");
    setCopied(false);
    setShared(false);
    setFeedback("");
    setValidationMessage("");
    setActionStatus(null);
    setStatusMessage("Example loaded. Generate a new result before copying or submitting feedback.");
    trackEvent({ event: "example_loaded", toolSlug: tool.slug, value: example.label });
  }

  function restoreHistory(historyValues: ToolValues) {
    setValues((prev) => ({ ...prev, ...historyValues }));
    if (result) setResult("");
    setCopied(false);
    setShared(false);
    setFeedback("");
    setValidationMessage("");
    setActionStatus(null);
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
        <form onSubmit={run} className="tool-form" noValidate>
          {tool.fields.map((field) => (
            <label key={field.name} className="field">
              <span>{field.label}{field.required ? <b> *</b> : null}</span>
              {field.type === "textarea" ? (
                <textarea
                  ref={(node) => { fieldRefs.current[field.name] = node; }}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  required={field.required}
                  onChange={(event) => update(field.name, event.target.value)}
                  rows={7}
                />
              ) : field.type === "select" ? (
                <select
                  ref={(node) => { fieldRefs.current[field.name] = node; }}
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
                  ref={(node) => { fieldRefs.current[field.name] = node; }}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  required={field.required}
                  onChange={(event) => update(field.name, event.target.value)}
                />
              )}
            </label>
          ))}
          {validationMessage ? (
            <p className="form-validation" role="alert">{validationMessage}</p>
          ) : null}
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
            <button className="ghost-button" type="button" disabled={!shareReady} onClick={sharePrefilledLink}>{shared ? "Link copied" : "Share link"}</button>
            <button className="ghost-button" type="button" disabled={!result} onClick={copy}>{copied ? "Copied" : "Copy"}</button>
            <button className="ghost-button" type="button" disabled={!result} onClick={downloadMarkdown}>Download .md</button>
          </div>
        </div>
        {actionStatus ? (
          <p className={`action-status action-status-${actionStatus.tone}`} role="status">{actionStatus.text}</p>
        ) : null}
        {result ? (
          <>
            <div className="result-box result-rendered" aria-live="polite">{renderMarkdown(result)}</div>
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
            {nextSteps.length > 0 ? (
              <div className="next-step" aria-label="Next step">
                <strong>Next step</strong>
                <div className="next-step-links">
                  {nextSteps.map((step) => (
                    <Link key={step.slug} className="ghost-button" href={`/tools/${step.slug}`}>{step.name}</Link>
                  ))}
                </div>
              </div>
            ) : null}
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
