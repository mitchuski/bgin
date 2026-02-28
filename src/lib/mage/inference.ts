/**
 * Mage inference — NEAR Cloud AI (OpenAI-compatible) or Anthropic.
 * Same private inference as agentprivacy_master. 03_MAGE_AGENTS, MAGE_ISSUES_REVIEW.
 */

export interface InferenceMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InferenceResult {
  text: string;
  provider: 'near' | 'anthropic';
}

const NEAR_BASE = 'https://cloud-api.near.ai/v1';
const NEAR_PROXY_URL = process.env.NEXT_PUBLIC_NEAR_PROXY_URL || 'https://near-ai-proxy.privacymage.workers.dev';
const REQUEST_TIMEOUT_MS = 30000; // 30 second timeout
const MAX_RETRIES = 2;

/**
 * Fetch with timeout support.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Sleep helper for retry delays.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call NEAR Cloud AI (OpenAI-compatible chat completions).
 * Includes timeout and retry logic for resilience.
 * Supports both direct API calls (with API key) and proxy calls (worker handles auth).
 */
async function inferNear(
  apiKey: string,
  systemPrompt: string,
  messages: InferenceMessage[],
  model: string
): Promise<string> {
  // Loosened constraints to match agentprivacy_master:
  // - No max_tokens limit (allow full responses)
  // - Temperature 0.8 for slightly creative but focused responses
  const body = {
    model,
    temperature: 0.8,
    presence_penalty: 0.1,
    messages: [
      { role: 'system' as const, content: systemPrompt },
      ...messages.filter((m) => m.role !== 'system'),
    ],
  };

  let lastError: Error | null = null;
  // Try direct API first, then fall back to proxy if it fails
  const endpoints = [
    { url: `${NEAR_BASE}/chat/completions`, useAuth: true, name: 'direct' },
    { url: `${NEAR_PROXY_URL}/v1/chat/completions`, useAuth: false, name: 'proxy' },
  ];

  for (const endpoint of endpoints) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          if (process.env.NODE_ENV === 'development') {
            console.log(`[mage/inference] Retry attempt ${attempt + 1}/${MAX_RETRIES} (${endpoint.name}) after ${delay}ms`);
          }
          await sleep(delay);
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        // Only include auth header for direct API calls (proxy handles its own auth)
        if (endpoint.useAuth) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        if (process.env.NODE_ENV === 'development' && attempt === 0) {
          console.log(`[mage/inference] Trying ${endpoint.name} endpoint: ${endpoint.url}`);
        }

        const res = await fetchWithTimeout(endpoint.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.text();
          const status = res.status;
          if (process.env.NODE_ENV === 'development' && (status === 401 || status === 403)) {
            console.error(`[mage/inference] NEAR auth failed (${endpoint.name}):`, status, err || res.statusText);
          }
          // Don't retry auth errors on direct calls, but try proxy instead
          if (status === 401 || status === 403) {
            if (endpoint.name === 'direct') {
              lastError = new Error(`NEAR AI: Auth failed on direct call, trying proxy...`);
              break; // Move to proxy endpoint
            }
            const hint = err ? ` (${err.slice(0, 120)})` : '';
            throw new Error(
              `NEAR AI: Invalid or expired API key${hint}. Get a key at https://cloud.near.ai (API Keys), add credits; set NEAR_AI_API_KEY in .env.local (local) or in Cloudflare Worker Variables and Secrets (production).`
            );
          }
          // Retry on 5xx errors or rate limits
          if (status >= 500 || status === 429) {
            lastError = new Error(`NEAR AI: ${status} ${err || res.statusText}`);
            continue;
          }
          throw new Error(`NEAR AI: ${status} ${err || res.statusText}`);
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string; role?: string }; finish_reason?: string }>;
        };
        const text = data.choices?.[0]?.message?.content ?? '';
        if (process.env.NODE_ENV === 'development') {
          console.log(`[mage/inference] Success via ${endpoint.name} endpoint`);
        }
        return text;
      } catch (error) {
        if (error instanceof Error) {
          // Don't retry auth errors
          if (error.message.includes('Invalid or expired API key')) {
            throw error;
          }
          // Handle timeout/abort
          if (error.name === 'AbortError') {
            lastError = new Error(`NEAR AI: Request timed out after ${REQUEST_TIMEOUT_MS}ms (${endpoint.name})`);
            if (process.env.NODE_ENV === 'development') {
              console.error(`[mage/inference] Request timed out (${endpoint.name})`);
            }
            continue;
          }
          lastError = error;
        }
      }
    }
  }

  throw lastError || new Error('NEAR AI: Unknown error after retries');
}

/**
 * Call Anthropic Messages API.
 */
async function inferAnthropic(
  apiKey: string,
  systemPrompt: string,
  messages: InferenceMessage[],
  model: string
): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });
  const anthropicMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    }));
  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: systemPrompt,
    messages: anthropicMessages,
  });
  const block = response.content[0];
  return block?.type === 'text' ? block.text : '';
}

/**
 * Run Mage inference. Prefers NEAR Cloud AI when NEAR_AI_API_KEY is set;
 * otherwise uses ANTHROPIC_API_KEY. Throws if no provider is configured.
 */
/** Strip BOM, CRLF, and other non-printable chars that can sneak in from .env files */
function sanitizeApiKey(raw: string | undefined): string {
  if (raw == null || typeof raw !== 'string') return '';
  return raw.replace(/^\uFEFF/, '').replace(/\s/g, '').trim();
}

export async function runMageInference(
  systemPrompt: string,
  messages: InferenceMessage[]
): Promise<InferenceResult> {
  const nearKey = sanitizeApiKey(process.env.NEAR_AI_API_KEY);
  const anthropicKey = sanitizeApiKey(process.env.ANTHROPIC_API_KEY);

  if (process.env.NODE_ENV === 'development' && nearKey) {
    console.log('[mage/inference] NEAR key present, length:', nearKey.length, 'prefix:', nearKey.slice(0, 5) + '...');
  }

  if (nearKey) {
    // Default to openai/gpt-oss-120b to match agentprivacy_master
    const model = process.env.NEAR_AI_MODEL?.trim() || 'openai/gpt-oss-120b';
    const text = await inferNear(nearKey, systemPrompt, messages, model);
    return { text, provider: 'near' };
  }

  if (anthropicKey) {
    const model = process.env.ANTHROPIC_MAGE_MODEL?.trim() || 'claude-sonnet-4-20250514';
    const text = await inferAnthropic(anthropicKey, systemPrompt, messages, model);
    return { text, provider: 'anthropic' };
  }

  throw new Error(
    'No inference provider configured. Set NEAR_AI_API_KEY (recommended) or ANTHROPIC_API_KEY in .env.local (local) or in Cloudflare Worker Variables and Secrets (production).'
  );
}
