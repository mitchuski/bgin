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

/**
 * Call NEAR Cloud AI (OpenAI-compatible chat completions).
 */
async function inferNear(
  apiKey: string,
  systemPrompt: string,
  messages: InferenceMessage[],
  model: string
): Promise<string> {
  const body = {
    model,
    max_tokens: 2048,
    temperature: 0.7,
    messages: [
      { role: 'system' as const, content: systemPrompt },
      ...messages.filter((m) => m.role !== 'system'),
    ],
  };
  const res = await fetch(`${NEAR_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NEAR AI: ${res.status} ${err || res.statusText}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string; role?: string }; finish_reason?: string }>;
  };
  const text = data.choices?.[0]?.message?.content ?? '';
  return text;
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
export async function runMageInference(
  systemPrompt: string,
  messages: InferenceMessage[]
): Promise<InferenceResult> {
  const nearKey = process.env.NEAR_AI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (nearKey) {
    const model = process.env.NEAR_AI_MODEL?.trim() || 'deepseek-ai/DeepSeek-V3.1';
    const text = await inferNear(nearKey, systemPrompt, messages, model);
    return { text, provider: 'near' };
  }

  if (anthropicKey) {
    const model = process.env.ANTHROPIC_MAGE_MODEL?.trim() || 'claude-sonnet-4-20250514';
    const text = await inferAnthropic(anthropicKey, systemPrompt, messages, model);
    return { text, provider: 'anthropic' };
  }

  throw new Error(
    'No inference provider configured. Set NEAR_AI_API_KEY (recommended) or ANTHROPIC_API_KEY in .env'
  );
}
