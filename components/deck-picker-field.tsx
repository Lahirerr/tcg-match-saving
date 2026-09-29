"use client";

import { MAX_PER_SIDE } from "@/lib/constants";
import type { Pokemon } from "@/lib/types";

interface DeckPickerFieldProps {
  label: string;
  loading: boolean;
  items: Pokemon[];
  onRemove: (id: number) => void;
  onAdd: () => void;
}

export function DeckPickerField({ label, loading, items, onRemove, onAdd }: DeckPickerFieldProps) {
  return (
    <div>
      <label className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">{label}</label>
      <div className="w-full min-h-[44px] flex items-center flex-wrap gap-2 bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-lg p-1.5">
        {loading ? (
          <span className="text-[var(--app-text-muted)] text-sm px-1">กำลังโหลด…</span>
        ) : (
          <>
            {items.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-full py-1 pr-1.5 pl-1 text-[13px] text-[var(--app-text)]"
              >
                <img
                  className="w-[26px] h-[26px] object-contain [image-rendering:pixelated]"
                  src={p.sprite}
                  alt=""
                />
                <span>{p.name}</span>
                <button
                  type="button"
                  className="text-[var(--app-text-muted)] hover:text-[var(--app-loss)] text-sm leading-none px-0.5 cursor-pointer"
                  aria-label="เอาออก"
                  onClick={() => onRemove(p.id)}
                >
                  ✕
                </button>
              </span>
            ))}
            {items.length < MAX_PER_SIDE ? (
              <button
                type="button"
                className="border border-dashed border-[var(--app-border)] text-[var(--app-text-muted)] text-[13.5px] px-3 py-2 rounded-full cursor-pointer hover:border-[var(--app-accent)] hover:text-[var(--app-accent)]"
                onClick={onAdd}
              >
                {items.length === 0 ? "🃏 แตะเพื่อเลือกโปเกมอน" : "+ เพิ่มอีก 1 ตัว"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
