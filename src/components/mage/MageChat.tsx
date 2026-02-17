'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signedFetch, getParticipantId } from '@/lib/swordsman/signedFetch';
import { getEpisodicContextForPrompt, updateEpisodicMemory } from '@/lib/mage/episodicMemory';
import { localDB } from '@/lib/storage/local';
import MessageBubble from './MessageBubble';
import SourceReference from './SourceReference';
import CrossWgHint from './CrossWgHint';
import PrivacyBudgetIndicator from './PrivacyBudgetIndicator';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { BLOCK14_TIMETABLE, BLOCK14_WORKING_GROUPS, getSessionsByDay } from '@/lib/block14/sessions';

interface Message {
  role: 'participant' | 'mage';
  content: string;
  sources?: Array<{ documentTitle: string; documentDate: string; relevanceScore?: number }>;
  crossWgRefs?: Array<{ workingGroup: string; topic: string; hint?: string }>;
}

export default function MageChat({ wg, embedded }: { wg: string; embedded?: boolean }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyBudgetRemaining, setPrivacyBudgetRemaining] = useState<number | null>(null);
  const [episodicContext, setEpisodicContext] = useState<Array<{ topic?: string; summary?: string }>>([]);
  const [castModalIndex, setCastModalIndex] = useState<number | null>(null);
  const [castLoading, setCastLoading] = useState(false);
  const [castSuccess, setCastSuccess] = useState<string | null>(null);
  const [castSpellbookModalIndex, setCastSpellbookModalIndex] = useState<number | null>(null);
  const [castSpellbookLoading, setCastSpellbookLoading] = useState(false);
  const [castSpellbookSuccess, setCastSpellbookSuccess] = useState<string | null>(null);
  const [castMessageIndices, setCastMessageIndices] = useState<number[]>([]);

  const loadEpisodicContext = useCallback(async () => {
    const ctx = await getEpisodicContextForPrompt(wg, 10);
    setEpisodicContext(ctx);
  }, [wg]);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) router.replace('/ceremony');
    });
    loadEpisodicContext();
  }, [router, loadEpisodicContext]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'participant', content: text }]);
    setLoading(true);

    try {
      const participantId = await getParticipantId();
      if (!participantId) {
        router.replace('/ceremony');
        return;
      }

      const prefs = await localDB.privacyPreferences.get('default');
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const body = {
        message: text,
        conversationHistory,
        participantContext: {
          allowEpisodicMemory: prefs?.allowEpisodicMemory ?? true,
        },
        episodicContext,
      };

      const res = await signedFetch(`/api/mage/${wg}/chat`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? `Error ${res.status}`);
        setMessages((prev) => prev.slice(0, -1));
        setInput(text);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'mage',
          content: data.message,
          sources: data.sources,
          crossWgRefs: data.crossWgReferences,
        },
      ]);
      setPrivacyBudgetRemaining(data.privacyBudgetRemaining ?? null);

      if (data.episodicMemoryUpdate?.topicsExplored?.length && (prefs?.allowEpisodicMemory ?? true)) {
        await updateEpisodicMemory(participantId, wg, {
          query: text,
          topicsExplored: data.episodicMemoryUpdate.topicsExplored,
          timestamp: new Date().toISOString(),
        });
        loadEpisodicContext();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send');
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, wg, episodicContext, router, loadEpisodicContext]);

  const openCastModal = useCallback((index: number) => {
    setCastModalIndex(index);
    setCastSuccess(null);
  }, []);

  const castToSession = useCallback(async (sessionId: string, sessionTitle: string, sessionWg: string) => {
    if (castModalIndex == null) return;
    const msg = messages[castModalIndex];
    if (!msg || msg.role !== 'mage') return;
    const prevMsg = castModalIndex > 0 ? messages[castModalIndex - 1] : null;
    const mageQuery = prevMsg?.role === 'participant' ? prevMsg.content : '';
    setCastLoading(true);
    setCastSuccess(null);
    try {
      const res = await signedFetch('/api/spellbook/entries', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          sessionTitle,
          workingGroup: sessionWg,
          mageQuery,
          mageResponse: msg.content,
          sources: msg.sources ?? [],
          crossWgRefs: msg.crossWgRefs ?? [],
        }),
      });
      if (res.ok) {
        if (castModalIndex !== null) setCastMessageIndices((prev) => (prev.includes(castModalIndex) ? prev : [...prev, castModalIndex]));
        setCastSuccess('Cast added to this session and to the ' + sessionWg.toUpperCase() + ' spellbook.');
        setTimeout(() => { setCastModalIndex(null); setCastSuccess(null); }, 2000);
      } else {
        const data = await res.json();
        setCastSuccess(data.message ?? 'Failed to cast');
      }
    } catch (e) {
      setCastSuccess(e instanceof Error ? e.message : 'Failed to cast');
    } finally {
      setCastLoading(false);
    }
  }, [castModalIndex, messages]);

  const openCastSpellbookModal = useCallback((index: number) => {
    setCastSpellbookModalIndex(index);
    setCastSpellbookSuccess(null);
  }, []);

  const castToSpellbook = useCallback(async (targetWg: string) => {
    if (castSpellbookModalIndex == null) return;
    const msg = messages[castSpellbookModalIndex];
    if (!msg || msg.role !== 'mage') return;
    const prevMsg = castSpellbookModalIndex > 0 ? messages[castSpellbookModalIndex - 1] : null;
    const mageQuery = prevMsg?.role === 'participant' ? prevMsg.content : '';
    const g = BLOCK14_WORKING_GROUPS.find((x) => x.id === targetWg);
    const sessionTitle = g ? `${g.label} Spellbook` : `${targetWg.toUpperCase()} Spellbook`;
    setCastSpellbookLoading(true);
    setCastSpellbookSuccess(null);
    try {
      const res = await signedFetch('/api/spellbook/entries', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: `spellbook-${targetWg}`,
          sessionTitle,
          workingGroup: targetWg,
          mageQuery,
          mageResponse: msg.content,
          sources: msg.sources ?? [],
          crossWgRefs: msg.crossWgRefs ?? [],
        }),
      });
      if (res.ok) {
        if (castSpellbookModalIndex !== null) setCastMessageIndices((prev) => (prev.includes(castSpellbookModalIndex) ? prev : [...prev, castSpellbookModalIndex]));
        setCastSpellbookSuccess('Added to ' + sessionTitle + '.');
        setTimeout(() => { setCastSpellbookModalIndex(null); setCastSpellbookSuccess(null); }, 2000);
      } else {
        const data = await res.json();
        setCastSpellbookSuccess(data.message ?? 'Failed to add');
      }
    } catch (e) {
      setCastSpellbookSuccess(e instanceof Error ? e.message : 'Failed to add');
    } finally {
      setCastSpellbookLoading(false);
    }
  }, [castSpellbookModalIndex, messages]);

  return (
    <div className={embedded ? 'flex flex-col flex-1 min-h-0' : 'flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto'}>
      {!embedded && (
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold capitalize">Mage: {wg}</h1>
          {privacyBudgetRemaining !== null && (
            <PrivacyBudgetIndicator remaining={privacyBudgetRemaining} max={16} />
          )}
        </div>
      )}
      {embedded && privacyBudgetRemaining !== null && (
        <div className="shrink-0 flex justify-end mb-1 pr-2">
          <PrivacyBudgetIndicator remaining={privacyBudgetRemaining} max={16} />
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded border border-[var(--wg-cyber)] bg-[var(--wg-cyber)]/10 text-sm text-[var(--wg-cyber)]">
          {error}
        </div>
      )}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <p className="text-[var(--text-muted)] text-sm">
            Ask a question about the {wg.toUpperCase()} domain. Your conversation is private and contributes to your knowledge path.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i}>
            <MessageBubble role={m.role} content={m.content} />
            {m.role === 'mage' && m.sources && m.sources.length > 0 && (
              <div className="mt-2 ml-2 space-y-1">
                {m.sources.map((s, j) => (
                  <SourceReference
                    key={j}
                    title={s.documentTitle}
                    date={s.documentDate}
                    relevance={s.relevanceScore}
                  />
                ))}
              </div>
            )}
            {m.role === 'mage' && m.crossWgRefs && m.crossWgRefs.length > 0 && (
              <div className="mt-2 ml-2">
                {m.crossWgRefs.map((r, j) => (
                  <CrossWgHint
                    key={j}
                    workingGroup={r.workingGroup}
                    topic={r.topic}
                    hint={r.hint}
                  />
                ))}
              </div>
            )}
            {m.role === 'mage' && (
              <div className="mt-2 ml-2">
                {castMessageIndices.includes(i) ? (
                  <span className="text-xs text-[var(--text-muted)]">Already cast</span>
                ) : (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <button
                      type="button"
                      onClick={() => openCastModal(i)}
                      className="text-xs text-[var(--mage)] hover:underline"
                    >
                      🔮 Cast to session
                    </button>
                    <button
                      type="button"
                      onClick={() => openCastSpellbookModal(i)}
                      className="text-xs text-[var(--mage)] hover:underline"
                    >
                      📜 Cast to spellbook
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && <MessageBubble role="mage" content="…" />}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask the Mage…"
          className="flex-1 rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none"
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? '…' : 'Send'}
        </Button>
      </div>

      <Modal
        open={castModalIndex !== null}
        onClose={() => { setCastModalIndex(null); setCastSuccess(null); }}
        title="🔮 Cast to session"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Choose a Block 14 session. This response will be added to that session and to the spellbook for its working group.
        </p>
        {castSuccess && <p className="text-sm mb-3 text-[var(--mage)]">{castSuccess}</p>}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          <section>
            <p className="text-xs text-[var(--text-muted)] font-medium sticky top-0 bg-[var(--bg-primary)] py-1">March 1, 2026</p>
            <div className="space-y-1 mt-1">
              {getSessionsByDay('March 1').map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => castToSession(s.id, s.title, s.workingGroup)}
                  disabled={castLoading}
                  className="block w-full text-left p-2 rounded border border-[var(--border)] hover:border-[var(--mage)] disabled:opacity-50 text-sm"
                >
                  <span className="font-medium">{s.title}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">({s.room} · {s.workingGroup})</span>
                </button>
              ))}
            </div>
          </section>
          <section>
            <p className="text-xs text-[var(--text-muted)] font-medium sticky top-0 bg-[var(--bg-primary)] py-1">March 2, 2026</p>
            <div className="space-y-1 mt-1">
              {getSessionsByDay('March 2').map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => castToSession(s.id, s.title, s.workingGroup)}
                  disabled={castLoading}
                  className="block w-full text-left p-2 rounded border border-[var(--border)] hover:border-[var(--mage)] disabled:opacity-50 text-sm"
                >
                  <span className="font-medium">{s.title}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">({s.room} · {s.workingGroup})</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </Modal>

      <Modal
        open={castSpellbookModalIndex !== null}
        onClose={() => { setCastSpellbookModalIndex(null); setCastSpellbookSuccess(null); }}
        title="📜 Cast to spellbook"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Add this response to a working group spellbook. It will appear in that spellbook view.
        </p>
        {castSpellbookSuccess && <p className="text-sm mb-3 text-[var(--mage)]">{castSpellbookSuccess}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {BLOCK14_WORKING_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => castToSpellbook(g.id)}
              disabled={castSpellbookLoading}
              className="text-left p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--mage)] disabled:opacity-50 flex items-center gap-2"
            >
              <span className="text-xl">{g.emoji}</span>
              <span className="font-medium">{g.label} Spellbook</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
