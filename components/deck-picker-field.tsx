"use client";

import { DeckSprites } from "@/components/deck-sprites";
import { MAX_PER_SIDE } from "@/lib/constants";
import type { DeckPreset, Pokemon } from "@/lib/types";

interface DeckPickerFieldProps {
  label: string;
  loading: boolean;
  items: Pokemon[];
  onRemove: (id: number) => void;
  onAdd: () => void;
  byId: Map<number, Pokemon>;
  presets: DeckPreset[];
  onApplyPreset: (preset: DeckPreset) => void;
  onSavePreset: () => void;
  onDeletePreset: (id: string) => void;
}

export function DeckPickerField({
  label,
  loading,
  items,
  onRemove,
  onAdd,
  byId,
  presets,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
}: DeckPickerFieldProps) {
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

      {!loading && presets.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {presets.map((preset) => (
            <span
              key={preset.id}
              className="inline-flex items-center gap-1 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-full py-1 pr-1 pl-1.5 text-[12.5px] text-[var(--app-text)]"
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 cursor-pointer"
                onClick={() => onApplyPreset(preset)}
              >
                <DeckSprites ids={preset.pokemonIds} byId={byId} />
                {preset.label}
              </button>
              <button
                type="button"
                aria-label="ลบเด็คที่บันทึกไว้"
                className="text-[var(--app-text-muted)] hover:text-[var(--app-loss)] text-xs leading-none px-0.5 cursor-pointer"
                onClick={() => onDeletePreset(preset.id)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <button
          type="button"
          onClick={onSavePreset}
          className="mt-2 text-[12px] text-[var(--app-accent)] hover:underline cursor-pointer"
        >
          + บันทึกเป็นเด็คที่ใช้บ่อย
        </button>
      ) : null}
    </div>
  );
}
