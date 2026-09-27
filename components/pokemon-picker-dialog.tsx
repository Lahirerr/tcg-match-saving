"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MAX_PER_SIDE } from "@/lib/constants";
import type { Pokemon } from "@/lib/types";

interface PokemonPickerDialogProps {
  open: boolean;
  context: "mine" | "opp" | null;
  pokemonData: Pokemon[];
  selectedIds: number[];
  search: string;
  onSearchChange: (value: string) => void;
  onToggle: (pokemon: Pokemon) => void;
  onOpenChange: (open: boolean) => void;
}

const RESULT_LIMIT = 150;

export function PokemonPickerDialog({
  open,
  context,
  pokemonData,
  selectedIds,
  search,
  onSearchChange,
  onToggle,
  onOpenChange,
}: PokemonPickerDialogProps) {
  const title =
    context === "mine"
      ? `เลือกโปเกมอนสำหรับเด็คของฉัน (สูงสุด ${MAX_PER_SIDE} ตัว)`
      : `เลือกโปเกมอนสำหรับเด็คคู่แข่ง (สูงสุด ${MAX_PER_SIDE} ตัว)`;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? pokemonData.filter((p) => p.name.toLowerCase().indexOf(q) !== -1)
      : pokemonData;
  }, [pokemonData, search]);

  const limited = filtered.slice(0, RESULT_LIMIT);
  const atLimit = selectedIds.length >= MAX_PER_SIDE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="p-0 gap-0 bg-[var(--app-surface)] max-w-[calc(100%-2rem)] sm:max-w-[480px] max-h-[78vh] sm:max-h-[620px] flex flex-col overflow-hidden"
      >
        <DialogHeader className="px-[18px] pt-4 pb-3 border-b border-[var(--app-border)] shrink-0 space-y-2.5">
          <DialogTitle className="font-display text-[17px] font-semibold m-0 text-[var(--app-text)]">
            {title}
          </DialogTitle>
          <Input
            type="text"
            autoFocus
            placeholder="ค้นหาชื่อโปเกมอน (ภาษาอังกฤษ)…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2.5 text-[var(--app-text)] text-[14.5px] focus-visible:ring-[var(--app-accent)]"
          />
        </DialogHeader>
        <div className="overflow-y-auto p-3 grid grid-cols-[repeat(auto-fill,minmax(78px,1fr))] gap-2">
          {limited.length === 0 ? (
            <div className="col-span-full text-center text-[var(--app-text-muted)] text-[13.5px] py-8 px-2.5">
              ไม่พบโปเกมอนที่ตรงกับ &ldquo;{search}&rdquo;
            </div>
          ) : (
            <>
              {limited.map((p) => {
                const isPicked = selectedIds.indexOf(p.id) !== -1;
                const isDisabled = !isPicked && atLimit;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onToggle(p)}
                    className={
                      "flex flex-col items-center gap-1 bg-[var(--app-surface-2)] border rounded-[10px] p-2 cursor-pointer text-center " +
                      (isPicked
                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                        : "border-[var(--app-border)] hover:border-[var(--app-accent)]") +
                      (isDisabled ? " opacity-40 pointer-events-none" : "")
                    }
                  >
                    <img
                      className="w-10 h-10 object-contain [image-rendering:pixelated]"
                      src={p.sprite}
                      alt=""
                      loading="lazy"
                    />
                    <span className="text-[11px] leading-tight break-words text-[var(--app-text)]">
                      {p.name}
                      {isPicked ? " ✓" : ""}
                    </span>
                  </button>
                );
              })}
              {atLimit ? (
                <div className="col-span-full text-center text-[var(--app-text-muted)] text-xs py-2 px-2.5">
                  เลือกครบ {MAX_PER_SIDE} ตัวแล้ว — แตะตัวที่เลือกไว้เพื่อเอาออก
                </div>
              ) : filtered.length > limited.length ? (
                <div className="col-span-full text-center text-[var(--app-text-muted)] text-xs py-2 px-2.5">
                  พิมพ์ค้นหาต่อเพื่อดูผลลัพธ์ที่ตรงมากขึ้น (ทั้งหมด {filtered.length} รายการ)
                </div>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
