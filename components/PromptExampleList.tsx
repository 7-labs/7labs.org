"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { PromptExample } from "@/lib/promptPages";

function copyText(example: PromptExample): string {
  return [
    example.prompt,
    example.negativePrompt ? `Negative prompt: ${example.negativePrompt}` : "",
    example.notes ? `Notes: ${example.notes}` : ""
  ].filter(Boolean).join("\n\n");
}

export function PromptExampleList({ examples, pageSlug }: { examples: PromptExample[]; pageSlug: string }) {
  const [copied, setCopied] = useState("");

  async function copy(example: PromptExample) {
    try {
      await navigator.clipboard.writeText(copyText(example));
      setCopied(example.label);
      trackEvent({ event: "copy_output", value: "prompt_example", target: pageSlug });
      setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  }

  return (
    <div className="prompt-example-list">
      {examples.map((example, index) => (
        <article className="sample-panel prompt-example" key={example.label}>
          <div className="prompt-example-head">
            <div>
              <span className="pill pill-purple">Example {index + 1}</span>
              <h3>{example.label}</h3>
            </div>
            <button className="ghost-button" type="button" onClick={() => copy(example)}>
              {copied === example.label ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="prompt-box">{example.prompt}</pre>
          {example.negativePrompt ? (
            <>
              <h4>Negative prompt</h4>
              <p>{example.negativePrompt}</p>
            </>
          ) : null}
          <p className="meta-line">{example.notes}</p>
        </article>
      ))}
    </div>
  );
}
