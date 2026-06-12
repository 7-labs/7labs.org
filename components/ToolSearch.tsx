"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categories, ToolCategory } from "@/lib/tools";
import { trackEvent } from "@/lib/analytics";

const categoryEntries = Object.entries(categories) as [ToolCategory, typeof categories[ToolCategory]][];

function queryTerms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function ToolSearch({ totalTools }: { totalTools: number }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const [shownCount, setShownCount] = useState(totalTools);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    if (requestedCategory && requestedCategory in categories) {
      setCategory(requestedCategory as ToolCategory);
    }
  }, []);

  useEffect(() => {
    const terms = queryTerms(query);
    let nextShown = 0;
    document.querySelectorAll<HTMLElement>("[data-tool-card]").forEach((card) => {
      const categoryMatch = category === "all" || card.dataset.category === category;
      const haystack = card.dataset.search ?? "";
      const queryMatch = terms.every((term) => haystack.includes(term));
      const visible = categoryMatch && queryMatch;
      card.hidden = !visible;
      if (visible) nextShown += 1;
    });
    setShownCount(nextShown);
  }, [category, query]);

  const hasNoResults = shownCount === 0;

  function selectCategory(nextCategory: ToolCategory | "all") {
    setCategory(nextCategory);
    const params = new URLSearchParams(window.location.search);
    if (nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);
    const nextQuery = params.toString();
    window.history.replaceState(null, "", nextQuery ? `/tools?${nextQuery}` : "/tools");
    trackEvent({ event: "category_filter", category: nextCategory });
  }

  return (
    <>
      <section className="section tool-search-panel" aria-labelledby="tools-filter-heading">
        <div className="section-head">
          <div>
            <div className="section-kicker">Find Tools</div>
            <h2 id="tools-filter-heading">Search by task or lab</h2>
            <p>Filter the directory without leaving the page. All tool links are still present in the initial HTML for crawlers.</p>
          </div>
          <span className="meta-line">{shownCount} of {totalTools} tools shown</span>
        </div>
        <label className="field tool-search-field">
          <span>Search tools</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try regex, YouTube, PDF, prompt, SQL, resume"
          />
        </label>
        <div className="category-chips" aria-label="Filter by lab">
          <button className="ghost-button category-chip" type="button" aria-pressed={category === "all"} onClick={() => selectCategory("all")}>All</button>
          {categoryEntries.map(([key, value]) => (
            <button
              className="ghost-button category-chip"
              key={key}
              type="button"
              aria-pressed={category === key}
              onClick={() => selectCategory(key)}
            >
              {value.name}
            </button>
          ))}
        </div>
      </section>

      <div className="empty-state tool-search-empty" hidden={!hasNoResults} aria-live="polite">
        <p>No tools match that filter.</p>
        <Link className="secondary-button" href="/tools/ai-tool-finder">Try AI Tool Finder</Link>
      </div>
    </>
  );
}
