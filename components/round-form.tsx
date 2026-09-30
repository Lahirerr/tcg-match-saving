"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BrickToggle } from "@/components/brick-toggle";
import { DeckPickerField } from "@/components/deck-picker-field";
import { ResultPicker } from "@/components/result-picker";
import { TurnOrderPicker } from "@/components/turn-order-picker";
import { MAX_PER_SIDE } from "@/lib/constants";
import type { DeckPreset, MatchResult, Pokemon, TurnOrder } from "@/lib/types";

const fieldInputCls =
  "w-full bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2.5 h-auto text-[var(--app-text)] text-[14.5px] focus-visible:ring-[var(--app-accent)]";

interface RoundFormProps {
  oppSelection: Pokemon[];
  onOpenPicker: () => void;
  onRemovePokemon: (id: number) => void;
  pokemonLoading: boolean;
  pokemonById: Map<number, Pokemon>;
  deckPresets: DeckPreset[];
  onApplyDeckPreset: (preset: DeckPreset) => void;
  onSaveDeckPreset: () => void;
  onDeleteDeckPreset: (id: string) => void;
  oppSuffix: string;
  onOppSuffixChange: (v: string) => void;
  result: MatchResult;
  onResultChange: (v: MatchResult) => void;
  order: TurnOrder;
  onOrderChange: (v: TurnOrder) => void;
  brick: boolean;
  onBrickToggle: () => void;
  notes: string;
  onNotesChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function RoundForm({
  oppSelection,
  onOpenPicker,
  onRemovePokemon,
  pokemonLoading,
  pokemonById,
  deckPresets,
  onApplyDeckPreset,
  onSaveDeckPreset,
  onDeleteDeckPreset,
  oppSuffix,
  onOppSuffixChange,
  result,
  onResultChange,
  order,
  onOrderChange,
  brick,
  onBrickToggle,
  notes,
  onNotesChange,
  onSubmit,
}: RoundFormProps) {
  const canSubmit = oppSelection.length > 0;

  return (
    <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px] mb-6">
      <h2 className="font-display text-[19px] font-semibold mb-4">บันทึกรอบใหม่</h2>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
          <DeckPickerField
            label="เด็คคู่แข่ง (สูงสุด 2 ตัว)"
            loading={pokemonLoading}
            items={oppSelection}
            onRemove={onRemovePokemon}
            onAdd={onOpenPicker}
            byId={pokemonById}
            presets={deckPresets}
            onApplyPreset={onApplyDeckPreset}
            onSavePreset={onSaveDeckPreset}
            onDeletePreset={onDeleteDeckPreset}
          />
          <div>
            <Label
              htmlFor="rf_opp_suffix"
              className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5"
            >
              รายละเอียดเด็คคู่แข่ง (ไม่บังคับ)
            </Label>
            <Input
              id="rf_opp_suffix"
              type="text"
              placeholder="เช่น ex, VMAX, Box"
              value={oppSuffix}
              onChange={(e) => onOppSuffixChange(e.target.value)}
              className={fieldInputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
          <ResultPicker value={result} onChange={onResultChange} />
          <TurnOrderPicker value={order} onChange={onOrderChange} />
        </div>

        <div className="grid grid-cols-1 gap-3.5 mb-3.5">
          <BrickToggle value={brick} onToggle={onBrickToggle} />
        </div>

        <div className="grid grid-cols-1 gap-3.5 mb-3.5">
          <div>
            <Label htmlFor="rf_notes" className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
              หมายเหตุ (ไม่บังคับ)
            </Label>
            <Textarea
              id="rf_notes"
              placeholder="เช่น เปิดมือช้า, โดนล็อกพลังงานตั้งแต่ต้นเกม"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full min-h-[56px] resize-y bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2.5 text-[var(--app-text)] text-[14.5px] focus-visible:ring-[var(--app-accent)]"
            />
          </div>
        </div>

        <p className="text-[var(--app-loss)] text-[12.5px] min-h-[1em] mb-1">
          {!canSubmit ? `เลือกโปเกมอนอย่างน้อย 1 ตัวของเด็คคู่แข่งก่อนบันทึก (สูงสุด ${MAX_PER_SIDE} ตัว)` : ""}
        </p>
        <Button
          type="submit"
          className="border-0 bg-[var(--app-accent)] text-white font-semibold text-[15px] px-[22px] py-[11px] h-auto rounded-[9px] cursor-pointer hover:bg-[var(--app-accent)] hover:brightness-110"
        >
          บันทึกรอบ
        </Button>
      </form>
    </section>
  );
}
