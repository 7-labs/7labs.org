const siteUrl = (process.env.SITE_URL || "https://7labs.org").replace(/\/$/, "");

const failures = [];

function url(path) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function fail(label, message) {
  failures.push(`${label}: ${message}`);
}

async function textProbe(label, path, options, check) {
  let response;
  try {
    response = await fetch(url(path), options);
  } catch (error) {
    fail(label, `request failed: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  const body = await response.text();
  if (!response.ok) {
    fail(label, `expected 2xx, got ${response.status}`);
    return;
  }

  try {
    check(response, body);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

async function jsonProbe(label, path, body, check) {
  await textProbe(
    label,
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    },
    (response, text) => {
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`expected application/json, got ${contentType || "missing content-type"}`);
      }
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("response body is not valid JSON");
      }
      check(json);
    }
  );
}

await textProbe("home", "/", undefined, (_response, body) => {
  if (!body.includes("<h1")) throw new Error("missing <h1");
});

await textProbe("robots", "/robots.txt", undefined, (response, body) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/plain")) throw new Error(`expected text/plain, got ${contentType || "missing content-type"}`);
  if (!body.includes("Sitemap:")) throw new Error("missing Sitemap directive");
});

await textProbe("sitemap", "/sitemap.xml", undefined, (_response, body) => {
  if (!body.includes("<urlset")) throw new Error("missing <urlset");
});

await textProbe("tool page", "/tools/regex-generator", undefined, (_response, body) => {
  if (!body.includes("<h1")) throw new Error("missing <h1");
});

await jsonProbe("api ai", "/api/ai", {}, (json) => {
  if (typeof json.provider !== "string") throw new Error("missing provider");
});

await jsonProbe("api events", "/api/events", { event: "tool_run", toolSlug: "regex-generator" }, (json) => {
  if (json.accepted !== true) throw new Error("event was not accepted");
});

if (failures.length) {
  console.error(`Smoke failed for ${siteUrl}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Smoke passed for ${siteUrl}`);
