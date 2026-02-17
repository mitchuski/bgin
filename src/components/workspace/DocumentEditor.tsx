'use client';
/** 00 Phase 7.3 — Yjs CRDT collaborative editor. */

export default function DocumentEditor({ documentId }: { documentId: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-secondary)] min-h-[200px]">
      <p className="text-[var(--text-muted)]">DocumentEditor — {documentId} (Yjs + Tiptap)</p>
    </div>
  );
}
