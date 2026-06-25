import { NextRequest, NextResponse } from "next/server";

type AiBody = {
  prompt?: string;
  system?: string;
  temperature?: number;
};

const MAX_PROMPT_CHARS = 8000;
const MAX_SYSTEM_CHARS = 2000;
const MAX_BODY_CHARS = 12000;
const MAX_RESPONSE_CHARS = 12000;
const MAX_OUTPUT_TOKENS = 900;
const AI_TIMEOUT_MS = 20000;
const DEFAULT_SYSTEM_PROMPT = "You are a concise AI assistant for 7labs.org tools. Return structured Markdown.";

function jsonError(code: string, message: string, status: number, details?: Record<string, unknown>) {
  return NextResponse.json({ code, message, ...(details ? { details } : {}) }, { status });
}

function clampTemperature(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0.3;
  return Math.min(1, Math.max(0, value));
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[Output truncated for safety.]`;
}

async function fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function providerFailure(status: number) {
  return jsonError("provider_failed", "AI provider request failed", 502, { providerStatus: status });
}

async function readBody(request: NextRequest): Promise<AiBody> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("unsupported-content-type");
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_CHARS) {
    throw new Error("body-too-large");
  }

  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) {
    throw new Error("body-too-large");
  }
  if (!text.trim()) return {};
  const parsed = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("invalid-payload");
  }
  return parsed as AiBody;
}

function enabled(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}

function openAiBaseUrl(provider: string): string {
  const defaultBaseUrl = provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
  const configured = (process.env.OPENAI_BASE_URL || defaultBaseUrl).replace(/\/$/, "");
  const allowed = new Set(["https://api.openai.com/v1", "https://openrouter.ai/api/v1"]);
  if (!allowed.has(configured) && !enabled(process.env.ALLOW_CUSTOM_AI_BASE_URL)) {
    throw new Error("unsupported-base-url");
  }
  return configured;
}

export async function POST(request: NextRequest) {
  let body: AiBody;
  try {
    body = await readBody(request);
  } catch (error) {
    const bodyTooLarge = error instanceof Error && error.message === "body-too-large";
    const unsupportedContentType = error instanceof Error && error.message === "unsupported-content-type";
    if (bodyTooLarge) return jsonError("body_too_large", "AI request body is too large", 413, { maxBodyChars: MAX_BODY_CHARS });
    if (unsupportedContentType) return jsonError("unsupported_content_type", "AI requests must use application/json", 415);
    return jsonError("invalid_payload", "Invalid AI request payload", 400);
  }

  const provider = (process.env.AI_PROVIDER || "none").toLowerCase();
  const prompt = body.prompt?.trim();
  if (provider === "none") {
    return NextResponse.json({
      provider: "none",
      text: `AI_PROVIDER=none. This public launch uses local rule-based tools only. To enable model-assisted output, set AI_PROVIDER plus AI_GATEWAY_ENABLED=true after auth, quotas, caching, rate limits, and spend alerts are configured.`
    });
  }

  if (!prompt) {
    return jsonError("missing_prompt", "Missing prompt", 400);
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return jsonError("prompt_too_long", "Prompt is too long", 413, { maxPromptChars: MAX_PROMPT_CHARS });
  }
  const system = enabled(process.env.AI_ALLOW_CLIENT_SYSTEM_PROMPT)
    ? body.system?.trim().slice(0, MAX_SYSTEM_CHARS)
    : undefined;
  const temperature = clampTemperature(body.temperature);

  if (!enabled(process.env.AI_GATEWAY_ENABLED)) {
    return jsonError(
      "ai_gateway_disabled",
      "AI provider mode is blocked until AI_GATEWAY_ENABLED=true and production abuse controls are configured.",
      403
    );
  }

  if (provider === "openai" || provider === "openrouter") {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    if (!apiKey) return jsonError("missing_openai_api_key", "Missing OPENAI_API_KEY", 500);

    let baseUrl: string;
    try {
      baseUrl = openAiBaseUrl(provider);
    } catch {
      return jsonError("unsupported_ai_base_url", "OPENAI_BASE_URL is not allowlisted for public provider mode", 500);
    }

    let response: Response;
    try {
      response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: MAX_OUTPUT_TOKENS,
          messages: [
            { role: "system", content: system || DEFAULT_SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ]
        })
      });
    } catch {
      return jsonError("provider_timeout", "AI provider request timed out", 504);
    }
    if (!response.ok) {
      return providerFailure(response.status);
    }
    let json: { choices?: Array<{ message?: { content?: string } }> };
    try {
      json = await response.json();
    } catch {
      return jsonError("provider_bad_response", "AI provider returned a non-JSON response", 502);
    }
    const text = truncateText(json.choices?.[0]?.message?.content ?? "", MAX_RESPONSE_CHARS);
    return NextResponse.json({ provider, model, text });
  }

  if (provider === "google") {
    const apiKey = process.env.GOOGLE_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    if (!apiKey) return jsonError("missing_google_api_key", "Missing GOOGLE_API_KEY", 500);

    let response: Response;
    try {
      response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${system ? `${system}

` : ""}${prompt}` }] }],
          generationConfig: { temperature, maxOutputTokens: MAX_OUTPUT_TOKENS }
        })
      });
    } catch {
      return jsonError("provider_timeout", "AI provider request timed out", 504);
    }
    if (!response.ok) {
      return providerFailure(response.status);
    }
    let json: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    try {
      json = await response.json();
    } catch {
      return jsonError("provider_bad_response", "AI provider returned a non-JSON response", 502);
    }
    const text = truncateText(json.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? "", MAX_RESPONSE_CHARS);
    return NextResponse.json({ provider, model, text });
  }

  return jsonError("unsupported_ai_provider", `Unsupported AI_PROVIDER: ${provider}`, 400);
}
