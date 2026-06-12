"use client";

import { useEffect, useMemo, useState } from "react";
import type { ToolDefinition } from "@/lib/tools";
import type { ToolValues } from "@/lib/toolExecutors";
import { mergeRunHistory, parseRunHistory, RunHistoryEntry, runHistoryKey } from "@/lib/runHistory";

type RunHistoryProps = {
  tool: ToolDefinition;
  latestEntry: RunHistoryEntry | null;
  onRestore: (values: ToolValues) => void;
};

function formatHistoryTime(value: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "Recent";
  }
}

export function RunHistory({ tool, latestEntry, onRestore }: RunHistoryProps) {
  const storageKey = useMemo(() => runHistoryKey(tool.slug), [tool.slug]);
  const [entries, setEntries] = useState<RunHistoryEntry[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      setEntries(parseRunHistory(window.localStorage.getItem(storageKey)));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!latestEntry) return;
    setEntries((current) => {
      const next = mergeRunHistory(current, latestEntry);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        setStorageAvailable(true);
      } catch {
        setStorageAvailable(false);
      }
      return next;
    });
  }, [latestEntry, storageKey]);

  function clearAll() {
    setEntries([]);
    try {
      window.localStorage.removeItem(storageKey);
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }

  return (
    <div className="run-history" aria-label="Recent runs">
      <div className="run-history-head">
        <div>
          <strong>Recent runs</strong>
          <span>Stored only in this browser. Nothing leaves your device.</span>
        </div>
        <button className="ghost-button" type="button" disabled={!entries.length} onClick={clearAll}>Clear</button>
      </div>
      {!storageAvailable ? (
        <p className="meta-line">Browser storage is unavailable, so recent runs cannot be saved in this session.</p>
      ) : null}
      {entries.length > 0 ? (
        <div className="run-history-list">
          {entries.map((entry) => (
            <article className="run-history-item" key={entry.id}>
              <div>
                <span className="meta-line">{formatHistoryTime(entry.createdAt)}</span>
                <p>{entry.outputPreview}</p>
              </div>
              <button className="secondary-button" type="button" onClick={() => onRestore(entry.values)}>Restore</button>
            </article>
          ))}
        </div>
      ) : (
        <p className="meta-line">Run this tool once to save a local restore point.</p>
      )}
    </div>
  );
}
