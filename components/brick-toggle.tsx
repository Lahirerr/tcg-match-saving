interface BrickToggleProps {
  value: boolean;
  onToggle: () => void;
}

export function BrickToggle({ value, onToggle }: BrickToggleProps) {
  return (
    <div>
      <span className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">มือเปิดเกม</span>
      <button
        type="button"
        aria-pressed={value}
        onClick={onToggle}
        className="group inline-flex items-center gap-2 border border-[var(--app-border)] bg-[var(--app-surface-2)] text-[var(--app-text)] text-sm px-4 py-2.5 rounded-lg cursor-pointer select-none aria-[pressed=true]:border-[var(--app-accent)] aria-[pressed=true]:bg-[var(--app-accent-soft)] aria-[pressed=true]:font-semibold"
      >
        <span className="w-[17px] h-[17px] rounded border border-[var(--app-text-muted)] bg-[var(--app-surface)] flex items-center justify-center text-[11px] shrink-0 group-aria-[pressed=true]:bg-[var(--app-accent)] group-aria-[pressed=true]:border-[var(--app-accent)] group-aria-[pressed=true]:text-white">
          🧱
        </span>
        มือนี้ Brick (เปิดมือไม่มีของ)
      </button>
    </div>
  );
}
