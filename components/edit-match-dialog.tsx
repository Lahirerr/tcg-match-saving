"use client";

import { useEffect, useState } from "react";
import { AceSpecPicker } from "@/components/ace-spec-picker";
import { BrickToggle } from "@/components/brick-toggle";
import { DeckPickerField } from "@/components/deck-picker-field";
import { PokemonPickerDialog } from "@/components/pokemon-picker-dialog";
import { ResultPicker } from "@/components/result-picker";
import { TurnOrderPicker } from "@/components/turn-order-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_PER_SIDE } from "@/lib/constants";
import type { DeckPreset, Match, MatchResult, Pokemon, TurnOrder } from "@/lib/types";

const fieldInputCls =
  "w-full bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2.5 h-auto text-[var(--app-text)] text-[14.5px] focus-visible:ring-[var(--app-accent)]";

interface EditMatchDialogProps {
  match: Match | null;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Match) => void;
  pokemonData: Pokemon[];
  pokemonById: Map<number, Pokemon>;
  pokemonLoading: boolean;
  deckPresets: DeckPreset[];
  onAddDeckPreset: (pokemon: Pokemon[], suffix: string) => void;
  onDeleteDeckPreset: (id: string) => void;
}

export function EditMatchDialog({
  match,
  onOpenChange,
  onSave,
  pokemonData,
  pokemonById,
  pokemonLoading,
  deckPresets,
  onAddDeckPreset,
  onDeleteDeckPreset,
}: EditMatchDialogProps) {
  const [date, setDate] = useState("");
  const [oppSelection, setOppSelection] = useState<Pokemon[]>([]);
  const [oppSuffix, setOppSuffix] = useState("");
  const [result, setResult] = useState<MatchResult>("W");
  const [order, setOrder] = useState<TurnOrder>("");
  const [brick, setBrick] = useState(false);
  const [aceSpec, setAceSpec] = useState("");
  const [notes, setNotes] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  useEffect(() => {
    if (!match) return;
    setDate(match.date);
    const oppPokemon = match.oppDeckIds
      .map((id) => pokemonById.get(id))
      .filter((p): p is Pokemon => !!p);
    setOppSelection(oppPokemon);
    const namesJoined = oppPokemon.map((p) => p.name).join(" & ");
    setOppSuffix(
      oppPokemon.length > 0 && match.oppDeck.startsWith(namesJoined)
        ? match.oppDeck.slice(namesJoined.length).trim()
        : ""
    );
    setResult(match.result);
    setOrder(match.order);
    setBrick(match.brick);
    setAceSpec(match.aceSpec || "");
    setNotes(match.notes);
  }, [match, pokemonById]);

  function toggleOpp(pokemon: Pokemon) {
    setOppSelection((prev) => {
      const idx = prev.findIndex((p) => p.id === pokemon.id);
      if (idx !== -1) return prev.filter((p) => p.id !== pokemon.id);
      if (prev.length >= MAX_PER_SIDE) return prev;
      return [...prev, pokemon];
    });
  }

  function removeOpp(id: number) {
    setOppSelection((prev) => prev.filter((p) => p.id !== id));
  }

  function applyPreset(preset: DeckPreset) {
    const pokemon = preset.pokemonIds
      .map((id) => pokemonById.get(id))
      .filter((p): p is Pokemon => !!p);
    setOppSelection(pokemon);
    setOppSuffix(preset.suffix);
  }

  const canSave = !!match && oppSelection.length > 0;

  function handleSave() {
    if (!match || oppSelection.length === 0) return;
    const oppDeckName =
      oppSelection.map((p) => p.name).join(" & ") + (oppSuffix.trim() ? ` ${oppSuffix.trim()}` : "");
    onSave({
      ...match,
      date: match.mode === "live" ? date || match.date : match.date,
      oppDeck: oppDeckName,
      oppDeckIds: oppSelection.map((p) => p.id),
      result,
      order,
      brick,
      aceSpec,
      notes: notes.trim(),
    });
  }

  return (
    <>
      <Dialog open={match !== null} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton
          className="p-0 gap-0 bg-[var(--app-surface)] max-w-[calc(100%-2rem)] sm:max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden"
        >
          <DialogHeader className="px-[18px] pt-4 pb-3 border-b border-[var(--app-border)] shrink-0">
            <DialogTitle className="font-display text-[17px] font-semibold m-0 text-[var(--app-text)]">
              แก้ไขแมทช์
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto p-[18px] flex flex-col gap-3.5">
            {match?.mode === "live" ? (
              <div>
                <Label htmlFor="em_date" className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
                  วันที่
                </Label>
                <Input
                  id="em_date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={fieldInputCls}
                />
              </div>
            ) : null}

            <DeckPickerField
              label="เด็คคู่แข่ง (สูงสุด 2 ตัว)"
              loading={pokemonLoading}
              items={oppSelection}
              onRemove={removeOpp}
              onAdd={() => {
                setPickerSearch("");
                setPickerOpen(true);
              }}
              byId={pokemonById}
              presets={deckPresets}
              onApplyPreset={applyPreset}
              onSavePreset={() => onAddDeckPreset(oppSelection, oppSuffix)}
              onDeletePreset={onDeleteDeckPreset}
            />

            <div>
              <Label
                htmlFor="em_opp_suffix"
                className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5"
              >
                รายละเอียดเด็คคู่แข่ง (ไม่บังคับ)
              </Label>
              <Input
                id="em_opp_suffix"
                type="text"
                placeholder="เช่น ex, VMAX, Box"
                value={oppSuffix}
                onChange={(e) => setOppSuffix(e.target.value)}
                className={fieldInputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <ResultPicker value={result} onChange={setResult} name="em_result" />
              <TurnOrderPicker value={order} onChange={setOrder} name="em_order" />
            </div>

            <BrickToggle value={brick} onToggle={() => setBrick((v) => !v)} />

            <AceSpecPicker value={aceSpec} onChange={setAceSpec} name="em_ace_spec" />

            <div>
              <Label htmlFor="em_notes" className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
                หมายเหตุ (ไม่บังคับ)
              </Label>
              <Textarea
                id="em_notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[56px] resize-y bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2.5 text-[var(--app-text)] text-[14.5px] focus-visible:ring-[var(--app-accent)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-lg"
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                disabled={!canSave}
                onClick={handleSave}
                className="border-0 bg-[var(--app-accent)] text-white font-semibold rounded-lg hover:bg-[var(--app-accent)] hover:brightness-110"
              >
                บันทึกการแก้ไข
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PokemonPickerDialog
        open={pickerOpen}
        context={pickerOpen ? "opp" : null}
        pokemonData={pokemonData}
        selectedIds={oppSelection.map((p) => p.id)}
        search={pickerSearch}
        onSearchChange={setPickerSearch}
        onToggle={toggleOpp}
        onOpenChange={(open) => {
          if (!open) setPickerOpen(false);
        }}
      />
    </>
  );
}
