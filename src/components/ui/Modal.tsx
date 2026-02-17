'use client';

export default function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        {title && <h3 className="font-medium mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
