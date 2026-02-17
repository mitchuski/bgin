'use client';

import { useState } from 'react';
import { signedFetch } from '@/lib/swordsman/signedFetch';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * Optional "Inscribe proverb" on a cast — agree with the cast by publishing a proverb linked to it.
 * Feeds into promise/trust graph.
 */
export default function InscribeProverbButton({
  castEntryId,
  workingGroup,
  label = 'Inscribe proverb',
  className = '',
}: {
  castEntryId: string;
  workingGroup: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setSuccess(null);
    try {
      const res = await signedFetch('/api/proverbs', {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
          workingGroup,
          sourceType: 'cast_agreement',
          castEntryId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Proverb inscribed.');
        setContent('');
        setTimeout(() => { setOpen(false); setSuccess(null); }, 1500);
      } else {
        setSuccess(data.message ?? 'Failed to inscribe');
      }
    } catch (e) {
      setSuccess(e instanceof Error ? e.message : 'Failed to inscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setContent(''); setSuccess(null); }}
        className={className || 'text-xs text-[var(--mage)] hover:underline'}
      >
        ✦ {label}
      </button>
      <Modal open={open} onClose={() => { setOpen(false); setContent(''); setSuccess(null); }} title="✦ Inscribe proverb on cast">
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Agree with this cast by inscribing a proverb. It will appear in the Proverb feed and strengthens the trust graph.
        </p>
        {success && <p className="text-sm mb-3 text-[var(--mage)]">{success}</p>}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Your proverb…"
          rows={3}
          className="w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--mage)] focus:outline-none resize-y"
          disabled={loading}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => { setOpen(false); setContent(''); setSuccess(null); }}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading || !content.trim()}>
            {loading ? '…' : 'Inscribe'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
