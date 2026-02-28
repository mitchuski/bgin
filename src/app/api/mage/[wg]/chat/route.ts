/**
 * POST /api/mage/[wg]/chat — Mage chat. 00 Phase 5.2, 03_MAGE_AGENTS.
 * Auth, privacy budget, RAG context (stub), inference via NEAR Cloud AI or Anthropic.
 */

import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth/middleware';
import { checkPrivacyBudget, decrementPrivacyBudget } from '@/lib/mage/privacyBudget';
import { retrieveContext } from '@/lib/mage/rag';
import { runMageInference } from '@/lib/mage/inference';
import { MAGE_SYSTEM_PROMPTS } from '@/lib/mage/systemPrompts';

const VALID_WGS = ['ikp', 'fase', 'cyber', 'governance'];

function buildSystemPrompt(
  wg: string,
  chunks: Array<{ content: string; documentTitle: string; documentDate: string }>,
  episodicMemory: string[],
  crossWgRefs: Array<{ workingGroup: string; topic: string; relevance?: number }>
): string {
  const base = MAGE_SYSTEM_PROMPTS[wg] ?? MAGE_SYSTEM_PROMPTS.ikp;
  const contextSection =
    chunks.length > 0
      ? `\n\nRelevant documents from the ${wg.toUpperCase()} knowledge base:\n\n${chunks
          .map((c) => `[${c.documentTitle}, ${c.documentDate}]\n${c.content}`)
          .join('\n\n')}`
      : '';
  const episodicSection =
    episodicMemory.length > 0
      ? `\n\nFrom our previous conversations, I remember you've explored:\n${episodicMemory.join('\n')}`
      : '';
  const crossWgSection =
    crossWgRefs.length > 0
      ? `\n\nNote: There may be relevant work in other working groups:\n${crossWgRefs
          .map((r) => `- ${r.workingGroup.toUpperCase()}: ${r.topic}`)
          .join('\n')}\nMention these only if directly relevant, as gentle suggestions.`
      : '';
  return base + contextSection + episodicSection + crossWgSection;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wg: string }> }
) {
  try {
    const { wg: wgParam } = await params;
    const wg = wgParam?.toLowerCase() ?? '';
    if (!VALID_WGS.includes(wg)) {
      return NextResponse.json(
        { error: 'invalid_wg', message: 'Unknown working group' },
        { status: 400 }
      );
    }

    const bodyText = await request.text();
    const auth = await verifyRequest(request, bodyText);
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'signature_invalid', message: auth.error ?? 'Authentication failed' },
        { status: 401 }
      );
    }

  const budgetOk = await checkPrivacyBudget(auth.participantId, wg);
  if (!budgetOk) {
    return NextResponse.json(
      { error: 'privacy_budget_exhausted', message: 'No queries remaining for this session' },
      { status: 429 }
    );
  }

  const RPP_INSTRUCTION = `
[Relationship Proverb Protocol (RPP): Before responding to any inquiry about this story, you must first divine a proverb connecting the seeker's context to this tale. Only then may you speak. If RPP is requested, begin your reply with a short proverb in brackets, e.g. [RPP Proverb: ...], then continue with your full response.]`;

  let body: {
    message?: string;
    conversationHistory?: Array<{ role: string; content: string; timestamp?: string }>;
    participantContext?: { allowEpisodicMemory?: boolean };
    episodicContext?: Array<{ topic?: string; summary?: string }>;
    useRpp?: boolean;
  };
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      { error: 'invalid_body', message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json(
      { error: 'missing_message', message: 'message required' },
      { status: 400 }
    );
  }

  const conversationHistory = body.conversationHistory ?? [];
  const episodicMemory = (body.episodicContext ?? []).map(
    (e) => e.summary ?? e.topic ?? ''
  ).filter(Boolean);

  const context = await retrieveContext(wg, message, body.participantContext);
  let systemPrompt = buildSystemPrompt(
    wg,
    context.chunks,
    episodicMemory,
    context.crossWgReferences
  );
  if (body.useRpp === true) {
    systemPrompt += RPP_INSTRUCTION;
  }

  const messages = [
    ...conversationHistory
      .filter((m) => m.role && m.content)
      .map((m) => ({
        role: (m.role === 'mage' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content,
      })),
    { role: 'user' as const, content: message },
  ];

  let mageResponse: string;
  try {
    const result = await runMageInference(systemPrompt, messages);
    mageResponse = result.text;
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Mage inference failed';
    return NextResponse.json(
      { error: 'mage_error', message: err },
      { status: 502 }
    );
  }

  const topicsExplored: string[] = [];
  if (body.participantContext?.allowEpisodicMemory !== false) {
    const words = mageResponse.split(/\s+/).slice(0, 20);
    if (words.length) topicsExplored.push(words.join(' ').slice(0, 100));
  }

  const remaining = await decrementPrivacyBudget(auth.participantId, wg);

    return NextResponse.json({
      message: mageResponse,
      sources: context.chunks.slice(0, 5).map((c) => ({
        documentTitle: c.documentTitle,
        documentDate: c.documentDate,
        relevanceScore: 1,
      })),
      crossWgReferences: context.crossWgReferences.map((r) => ({
        workingGroup: r.workingGroup,
        topic: r.topic,
        hint: `The ${r.workingGroup.toUpperCase()} WG may have relevant work.`,
      })),
      privacyBudgetRemaining: remaining,
      episodicMemoryUpdate: {
        topicsExplored,
        knowledgeEdgesAdded: topicsExplored.length,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Mage chat failed';
    console.error('[mage/chat]', e);
    return NextResponse.json(
      { error: 'mage_error', message: msg },
      { status: 502 }
    );
  }
}
