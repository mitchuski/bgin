'use client';

export default function EmojiPicker({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (emoji: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-[var(--text-muted)] w-full mb-1">Choose your marker:</span>
      {options.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={`text-2xl p-2 rounded-lg transition-all ${
            value === emoji
              ? 'bg-[var(--mage)]/20 ring-2 ring-[var(--mage)] scale-110'
              : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80'
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
