"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeckPickerField } from "@/components/deck-picker-field";
import { EventCategoryPicker } from "@/components/event-category-picker";
import type { EventCategory, Pokemon } from "@/lib/types";

const fieldInputCls =
  "w-full bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2.5 h-auto text-[var(--app-text)] text-[14.5px] focus-visible:ring-[var(--app-accent)]";

interface EventFormProps {
  formTitle: string;
  date: string;
  onDateChange: (v: string) => void;
  eventName: string;
  onEventNameChange: (v: string) => void;
  eventCategory: EventCategory;
  onEventCategoryChange: (v: EventCategory) => void;
  mineSelection: Pokemon[];
  onOpenPicker: () => void;
  onRemovePokemon: (id: number) => void;
  pokemonLoading: boolean;
  mineSuffix: string;
  onMineSuffixChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function EventForm({
  formTitle,
  date,
  onDateChange,
  eventName,
  onEventNameChange,
  eventCategory,
  onEventCategoryChange,
  mineSelection,
  onOpenPicker,
  onRemovePokemon,
  pokemonLoading,
  mineSuffix,
  onMineSuffixChange,
  onSubmit,
}: EventFormProps) {
  const canSubmit = mineSelection.length > 0;

  return (
    <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px] mb-6">
      <h2 className="font-display text-[19px] font-semibold mb-4">{formTitle}</h2>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
          <div>
            <Label htmlFor="ef_date" className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
              วันที่
            </Label>
            <Input
              id="ef_date"
              type="date"
              required
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className={fieldInputCls}
            />
          </div>
          <div>
            <Label
              htmlFor="ef_event_name"
              className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5"
            >
              ชื่อรายการ / สนาม (ไม่บังคับ)
            </Label>
            <Input
              id="ef_event_name"
              type="text"
              placeholder="เช่น Regional Bangkok, ร้าน ABC Card Shop"
              value={eventName}
              onChange={(e) => onEventNameChange(e.target.value)}
              className={fieldInputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 mb-3.5">
          <EventCategoryPicker value={eventCategory} onChange={onEventCategoryChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
          <DeckPickerField
            label="เด็คของฉัน (สูงสุด 2 ตัว)"
            loading={pokemonLoading}
            items={mineSelection}
            onRemove={onRemovePokemon}
            onAdd={onOpenPicker}
          />
          <div>
            <Label
              htmlFor="ef_mine_suffix"
              className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5"
            >
              รายละเอียดเด็ค (ไม่บังคับ)
            </Label>
            <Input
              id="ef_mine_suffix"
              type="text"
              placeholder="เช่น ex, VMAX, Box"
              value={mineSuffix}
              onChange={(e) => onMineSuffixChange(e.target.value)}
              className={fieldInputCls}
            />
          </div>
        </div>

        <p className="text-[var(--app-loss)] text-[12.5px] min-h-[1em] mb-1">
          {!canSubmit ? "เลือกโปเกมอนอย่างน้อย 1 ตัวสำหรับเด็คของฉันก่อนสร้างรายการ" : ""}
        </p>
        <Button
          type="submit"
          className="border-0 bg-[var(--app-accent)] text-white font-semibold text-[15px] px-[22px] py-[11px] h-auto rounded-[9px] cursor-pointer hover:bg-[var(--app-accent)] hover:brightness-110"
        >
          สร้างรายการ
        </Button>
      </form>
    </section>
  );
}
