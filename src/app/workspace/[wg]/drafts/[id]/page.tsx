export default function DraftPage({
  params,
}: {
  params: { wg: string; id: string };
}) {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Draft — {params.wg} / {params.id}</h1>
      <p className="text-[var(--text-secondary)]">
        Collaborative document editor — 00 Phase 7.3. Use DocumentEditor (Yjs).
      </p>
    </main>
  );
}
