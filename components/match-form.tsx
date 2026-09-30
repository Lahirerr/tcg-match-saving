"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AceSpecPicker } from "@/components/ace-spec-picker";
import { DeckPickerField } from "@/components/deck-picker-field";
import { MAX_PER_SIDE } from "@/lib/constants";
import type { DeckPreset, MatchResult, Pokemon, TurnOrder } from "@/lib/types";

const fieldInputCls =
  "w-full bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2.5 h-auto text-[var(--app-text)] text-[14.5px] focus-visible:ring-[var(--app-accent)]";

const pillLabelCls =
  "inline-flex items-center px-4 py-2.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-2)] text-sm text-[var(--app-text)] cursor-pointer select-none";

interface MatchFormProps {
  formTitle: string;
  date: string;
  onDateChange: (v: string) => void;
  mineSelection: Pokemon[];
  oppSelection: Pokemon[];
  onOpenPicker: (ctx: "mine" | "opp") => void;
  onRemovePokemon: (ctx: "mine" | "opp", id: number) => void;
  pokemonLoading: boolean;
  pokemonById: Map<number, Pokemon>;
  deckPresets: DeckPreset[];
  onApplyDeckPreset: (ctx: "mine" | "opp", preset: DeckPreset) => void;
  onSaveDeckPreset: (ctx: "mine" | "opp") => void;
  onDeleteDeckPreset: (id: string) => void;
  mineSuffix: string;
  onMineSuffixChange: (v: string) => void;
  oppSuffix: string;
  onOppSuffixChange: (v: string) => void;
  result: MatchResult;
  onResultChange: (v: MatchResult) => void;
  order: TurnOrder;
  onOrderChange: (v: TurnOrder) => void;
  brick: boolean;
  onBrickToggle: () => void;
  aceSpec: string;
  onAceSpecChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function MatchForm({
  formTitle,
  date,
  onDateChange,
  mineSelection,
  oppSelection,
  onOpenPicker,
  onRemovePokemon,
  pokemonLoading,
  pokemonById,
  deckPresets,
  onApplyDeckPreset,
  onSaveDeckPreset,
  onDeleteDeckPreset,
  mineSuffix,
  onMineSuffixChange,
  oppSuffix,
  onOppSuffixChange,
  result,
  onResultChange,
  order,
  onOrderChange,
  brick,
  onBrickToggle,
  aceSpec,
  onAceSpecChange,
  notes,
  onNotesChange,
  onSubmit,
}: MatchFormProps) {
  const canSubmit = mineSelection.length > 0 && oppSelection.length > 0;

  return (
    <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px] mb-6">
      <h2 className="font-display text-[19px] font-semibold mb-4">{formTitle}</h2>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-3.5 mb-3.5">
          <div>
            <Label htmlFor="f_date" className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
              วันที่
            </Label>
            <Input
              id="f_date"
              type="date"
              required
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className={fieldInputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
          <DeckPickerField
            label="เด็คของฉัน (สูงสุด 2 ตัว)"
            loading={pokemonLoading}
            items={mineSelection}
            onRemove={(id) => onRemovePokemon("mine", id)}
            onAdd={() => onOpenPicker("mine")}
            byId={pokemonById}
            presets={deckPresets}
            onApplyPreset={(preset) => onApplyDeckPreset("mine", preset)}
            onSavePreset={() => onSaveDeckPreset("mine")}
            onDeletePreset={onDeleteDeckPreset}
          />
          <DeckPickerField
            label="เด็คคู่แข่ง (สูงสุด 2 ตัว)"
            loading={pokemonLoading}
            items={oppSelection}
            onRemove={(id) => onRemovePokemon("opp", id)}
            onAdd={() => onOpenPicker("opp")}
            byId={pokemonById}
            presets={deckPresets}
            onApplyPreset={(preset) => onApplyDeckPreset("opp", preset)}
            onSavePreset={() => onSaveDeckPreset("opp")}
            onDeletePreset={onDeleteDeckPreset}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
          <div>
            <Label
              htmlFor="f_mine_suffix"
              className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5"
            >
              รายละเอียดเด็คของฉัน (ไม่บังคับ)
            </Label>
            <Input
              id="f_mine_suffix"
              type="text"
              placeholder="เช่น ex, VMAX, Box"
              value={mineSuffix}
              onChange={(e) => onMineSuffixChange(e.target.value)}
              className={fieldInputCls}
            />
          </div>
          <div>
            <Label
              htmlFor="f_opp_suffix"
              className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5"
            >
              รายละเอียดเด็คคู่แข่ง (ไม่บังคับ)
            </Label>
            <Input
              id="f_opp_suffix"
              type="text"
              placeholder="เช่น ex, VMAX, Box"
              value={oppSuffix}
              onChange={(e) => onOppSuffixChange(e.target.value)}
              className={fieldInputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
          <div>
            <span className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
              ผลการแข่งขัน
            </span>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <input
                  type="radio"
                  name="result"
                  id="r_w"
                  checked={result === "W"}
                  onChange={() => onResultChange("W")}
                  className="peer sr-only"
                />
                <label
                  htmlFor="r_w"
                  className={`${pillLabelCls} peer-checked:border-[var(--app-win)] peer-checked:bg-[var(--app-win-soft)] peer-checked:text-[var(--app-win)] peer-checked:font-semibold`}
                >
                  ชนะ
                </label>
              </div>
              <div className="relative">
                <input
                  type="radio"
                  name="result"
                  id="r_l"
                  checked={result === "L"}
                  onChange={() => onResultChange("L")}
                  className="peer sr-only"
                />
                <label
                  htmlFor="r_l"
                  className={`${pillLabelCls} peer-checked:border-[var(--app-loss)] peer-checked:bg-[var(--app-loss-soft)] peer-checked:text-[var(--app-loss)] peer-checked:font-semibold`}
                >
                  แพ้
                </label>
              </div>
            </div>
          </div>
          <div>
            <span className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
              ใครเริ่มก่อน
            </span>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <input
                  type="radio"
                  name="order"
                  id="o_first"
                  checked={order === "first"}
                  onChange={() => onOrderChange("first")}
                  className="peer sr-only"
                />
                <label
                  htmlFor="o_first"
                  className={`${pillLabelCls} peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent-soft)] peer-checked:font-semibold`}
                >
                  ฉันเริ่มก่อน
                </label>
              </div>
              <div className="relative">
                <input
                  type="radio"
                  name="order"
                  id="o_second"
                  checked={order === "second"}
                  onChange={() => onOrderChange("second")}
                  className="peer sr-only"
                />
                <label
                  htmlFor="o_second"
                  className={`${pillLabelCls} peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent-soft)] peer-checked:font-semibold`}
                >
                  คู่แข่งเริ่มก่อน
                </label>
              </div>
              <div className="relative">
                <input
                  type="radio"
                  name="order"
                  id="o_na"
                  checked={order === ""}
                  onChange={() => onOrderChange("")}
                  className="peer sr-only"
                />
                <label
                  htmlFor="o_na"
                  className={`${pillLabelCls} peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent-soft)] peer-checked:font-semibold`}
                >
                  ไม่ระบุ
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 mb-3.5">
          <div>
            <span className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
              มือเปิดเกม
            </span>
            <button
              type="button"
              aria-pressed={brick}
              onClick={onBrickToggle}
              className="group inline-flex items-center gap-2 border border-[var(--app-border)] bg-[var(--app-surface-2)] text-[var(--app-text)] text-sm px-4 py-2.5 rounded-lg cursor-pointer select-none aria-[pressed=true]:border-[var(--app-accent)] aria-[pressed=true]:bg-[var(--app-accent-soft)] aria-[pressed=true]:font-semibold"
            >
              <span className="w-[17px] h-[17px] rounded border border-[var(--app-text-muted)] bg-[var(--app-surface)] flex items-center justify-center text-[11px] shrink-0 group-aria-[pressed=true]:bg-[var(--app-accent)] group-aria-[pressed=true]:border-[var(--app-accent)] group-aria-[pressed=true]:text-white">
                🧱
              </span>
              มือนี้ Brick (เปิดมือไม่มีของ)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 mb-3.5">
          <AceSpecPicker value={aceSpec} onChange={onAceSpecChange} />
        </div>

        <div className="grid grid-cols-1 gap-3.5 mb-3.5">
          <div>
            <Label htmlFor="f_notes" className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
              หมายเหตุ (ไม่บังคับ)
            </Label>
            <Textarea
              id="f_notes"
              placeholder="เช่น เปิดมือช้า, โดนล็อกพลังงานตั้งแต่ต้นเกม"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full min-h-[56px] resize-y bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2.5 text-[var(--app-text)] text-[14.5px] focus-visible:ring-[var(--app-accent)]"
            />
          </div>
        </div>

        <p className="text-[var(--app-loss)] text-[12.5px] min-h-[1em] mb-1">
          {!canSubmit
            ? `เลือกโปเกมอนอย่างน้อย 1 ตัวของทั้งสองฝั่งก่อนบันทึก (สูงสุด ${MAX_PER_SIDE} ตัวต่อฝั่ง)`
            : ""}
        </p>
        <Button
          type="submit"
          className="border-0 bg-[var(--app-accent)] text-white font-semibold text-[15px] px-[22px] py-[11px] h-auto rounded-[9px] cursor-pointer hover:bg-[var(--app-accent)] hover:brightness-110"
        >
          บันทึกแมทช์
        </Button>
      </form>
    </section>
  );
}
