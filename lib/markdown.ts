import { Fragment, ReactNode, createElement } from "react";

// Safe Markdown -> React renderer.
//
// Returns an array of React nodes built entirely from React.createElement and
// plain text children. It never produces an HTML string and never uses
// dangerouslySetInnerHTML, so any unrecognized markup is rendered verbatim as
// escaped text. URLs in links are sanitized to http(s)/mailto only.
//
// Supported block syntax: # / ## / ### headings, - and 1. lists, fenced code
// blocks (```), Markdown tables (| a | b |), and paragraphs. Supported inline
// syntax: **bold**, `inline code`, and [text](url) links.

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; href: string };

const SAFE_LINK = /^(https?:\/\/|mailto:|\/)/i;

function sanitizeHref(href: string): string | null {
  const trimmed = href.trim();
  return SAFE_LINK.test(trimmed) ? trimmed : null;
}

// Tokenize a single line of text into inline spans. The order of the
// alternation matters: code spans win over bold so backtick contents are never
// re-parsed.
function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const [raw] = match;
    if (raw.startsWith("`")) {
      tokens.push({ type: "code", value: raw.slice(1, -1) });
    } else if (raw.startsWith("**")) {
      tokens.push({ type: "bold", value: raw.slice(2, -2) });
    } else {
      const split = raw.indexOf("](");
      const label = raw.slice(1, split);
      const href = raw.slice(split + 2, -1);
      const safe = sanitizeHref(href);
      if (safe) {
        tokens.push({ type: "link", value: label, href: safe });
      } else {
        tokens.push({ type: "text", value: raw });
      }
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }
  return tokens;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return tokenizeInline(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (token.type) {
      case "bold":
        return createElement("strong", { key }, token.value);
      case "code":
        return createElement("code", { key }, token.value);
      case "link": {
        // External links open in a new tab; internal/relative deep-links stay
        // in-tab so the in-site funnel (e.g. finder tool deep-links) is preserved.
        const external = /^https?:\/\//i.test(token.href);
        return createElement(
          "a",
          external
            ? { key, href: token.href, target: "_blank", rel: "noopener noreferrer" }
            : { key, href: token.href },
          token.value
        );
      }
      default:
        return createElement(Fragment, { key }, token.value);
    }
  });
}

function isTableDivider(line: string): boolean {
  const cells = line.trim().replace(/^\||\|$/g, "").split("|");
  return cells.length > 0 && cells.every((cell) => /^\s*:?-+:?\s*$/.test(cell));
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function renderMarkdown(markdown: string): ReactNode {
  const lines = (markdown ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: { ordered: boolean; text: string }[] = [];
  let key = 0;

  function flushParagraph() {
    if (!paragraph.length) return;
    const text = paragraph.join(" ");
    blocks.push(createElement("p", { key: `p-${key++}` }, renderInline(text, `p-${key}`)));
    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) return;
    const ordered = listItems[0].ordered;
    const items = listItems.map((item, index) =>
      createElement("li", { key: `li-${key}-${index}` }, renderInline(item.text, `li-${key}-${index}`))
    );
    blocks.push(createElement(ordered ? "ol" : "ul", { key: `list-${key++}` }, items));
    listItems = [];
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced code block.
    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      blocks.push(
        createElement(
          "pre",
          { key: `pre-${key++}`, className: "md-code-block" },
          createElement("code", null, codeLines.join("\n"))
        )
      );
      continue;
    }

    // Table: a header row followed by a divider row of dashes.
    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      isTableDivider(lines[i + 1]) &&
      trimmed.includes("|")
    ) {
      flushParagraph();
      flushList();
      const header = splitRow(line);
      i += 2; // skip header + divider
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      i -= 1; // step back so the for-loop increment lands on the next line
      const thead = createElement(
        "thead",
        { key: `thead-${key}` },
        createElement(
          "tr",
          null,
          header.map((cell, ci) => createElement("th", { key: `th-${ci}` }, renderInline(cell, `th-${key}-${ci}`)))
        )
      );
      const tbody = createElement(
        "tbody",
        { key: `tbody-${key}` },
        rows.map((row, ri) =>
          createElement(
            "tr",
            { key: `tr-${ri}` },
            row.map((cell, ci) =>
              createElement("td", { key: `td-${ri}-${ci}` }, renderInline(cell, `td-${key}-${ri}-${ci}`))
            )
          )
        )
      );
      blocks.push(
        createElement("table", { key: `table-${key++}`, className: "md-table" }, [thead, tbody])
      );
      continue;
    }

    // Headings.
    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      blocks.push(
        createElement(`h${level + 1}`, { key: `h-${key++}` }, renderInline(heading[2], `h-${key}`))
      );
      continue;
    }

    // List items (unordered "- " / ordered "1. ").
    const unordered = /^[-*]\s+(.*)$/.exec(trimmed);
    const ordered = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (unordered || ordered) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      if (listItems.length && listItems[0].ordered !== isOrdered) {
        flushList();
      }
      listItems.push({ ordered: isOrdered, text: (unordered ?? ordered)![1] });
      continue;
    }

    // Blank line: terminates the current paragraph/list.
    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Anything else accumulates into a paragraph.
    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return createElement(Fragment, null, blocks);
}
