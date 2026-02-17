'use client';

export default function MessageBubble({
  role,
  content,
}: {
  role: 'mage' | 'participant';
  content: string;
}) {
  return (
    <div className={role === 'mage' ? 'text-left' : 'text-right'}>
      <div className="inline-block rounded-lg border p-3 bg-[var(--bg-secondary)] max-w-[80%]">
        {content}
      </div>
    </div>
  );
}
