"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { EditMatchDialog } from "@/components/edit-match-dialog";
import { ModeTabs } from "@/components/mode-tabs";
import { MatchForm } from "@/components/match-form";
import { OfflineHome } from "@/components/offline-home";
import { PokemonPickerDialog } from "@/components/pokemon-picker-dialog";
import { MatchupTable } from "@/components/matchup-table";
import { LogList } from "@/components/log-list";
import { Pagination } from "@/components/pagination";
import { StatChips } from "@/components/stat-chips";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODE_COPY } from "@/lib/constants";
import { formatDateLabel, nowTimestamp, todayISO, uid, uniqueSorted } from "@/lib/format";
import { fetchPokemonData } from "@/lib/pokemon";
import { loadMatchesWithMigration, saveEvents, saveMatches } from "@/lib/storage";
import { computeMatchupStats, computeOverallStats } from "@/lib/stats";
import { useDeckPresets } from "@/lib/use-deck-presets";
import { usePagination } from "@/lib/use-pagination";
import type {
  DeckPreset,
  Match,
  MatchMode,
  MatchResult,
  PickerSelection,
  Pokemon,
  PtcgEvent,
  TurnOrder,
} from "@/lib/types";

const DECK_FILTER_ALL = "__all__";
const HISTORY_FILTER_ALL = "__all__";
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];
const DEFAULT_PAGE_SIZE = 10;

export function MatchLogApp() {
  const [mode, setMode] = useState<MatchMode>("live");
  const [matches, setMatches] = useState<Match[]>([]);
  const [events, setEvents] = useState<PtcgEvent[]>([]);
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [pokemonLoading, setPokemonLoading] = useState(true);

  const [selection, setSelection] = useState<PickerSelection>({ mine: [], opp: [] });
  const [pickerContext, setPickerContext] = useState<"mine" | "opp" | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  const [date, setDate] = useState("");
  const [mineSuffix, setMineSuffix] = useState("");
  const [oppSuffix, setOppSuffix] = useState("");
  const [result, setResult] = useState<MatchResult>("W");
  const [order, setOrder] = useState<TurnOrder>("");
  const [brick, setBrick] = useState(false);
  const [aceSpec, setAceSpec] = useState("");
  const [notes, setNotes] = useState("");

  const { presets: deckPresets, addPreset: addDeckPreset, removePreset: removeDeckPreset } =
    useDeckPresets();

  const [filterValue, setFilterValue] = useState("");
  const [historyFilterValue, setHistoryFilterValue] = useState("");
  const [matchupSearch, setMatchupSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Record<string, boolean>>({});
  const pendingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  useEffect(() => {
    const data = loadMatchesWithMigration();
    setMatches(data.matches);
    setEvents(data.events);
    setDate(todayISO());
    fetchPokemonData().then((data) => {
      setPokemonData(data);
      setPokemonLoading(false);
    });
  }, []);

  const pokemonById = useMemo(() => {
    const map = new Map<number, Pokemon>();
    pokemonData.forEach((p) => map.set(p.id, p));
    return map;
  }, [pokemonData]);

  function switchMode(next: MatchMode) {
    setMode(next);
    setFilterValue("");
    setHistoryFilterValue("");
    setMatchupSearch("");
    historyPagination.resetPage();
    matchupPagination.resetPage();
    if (next === "live") {
      setDate(todayISO());
    }
  }

  function openPicker(context: "mine" | "opp") {
    setPickerContext(context);
    setPickerSearch("");
  }

  function closePicker() {
    setPickerContext(null);
  }

  function togglePokemon(pokemon: Pokemon) {
    if (!pickerContext) return;
    setSelection((prev) => {
      const arr = prev[pickerContext];
      const idx = arr.findIndex((p) => p.id === pokemon.id);
      if (idx !== -1) {
        return { ...prev, [pickerContext]: arr.filter((p) => p.id !== pokemon.id) };
      }
      if (arr.length >= 2) return prev;
      return { ...prev, [pickerContext]: [...arr, pokemon] };
    });
  }

  function removePokemon(context: "mine" | "opp", id: number) {
    setSelection((prev) => ({ ...prev, [context]: prev[context].filter((p) => p.id !== id) }));
  }

  function applyDeckPreset(context: "mine" | "opp", preset: DeckPreset) {
    const pokemon = preset.pokemonIds
      .map((id) => pokemonById.get(id))
      .filter((p): p is Pokemon => !!p);
    setSelection((prev) => ({ ...prev, [context]: pokemon }));
    if (context === "mine") setMineSuffix(preset.suffix);
    else setOppSuffix(preset.suffix);
  }

  function saveDeckPreset(context: "mine" | "opp") {
    addDeckPreset(selection[context], context === "mine" ? mineSuffix : oppSuffix);
  }

  function handleDeleteClick(id: string) {
    if (pendingDelete[id]) {
      clearTimeout(pendingTimers.current[id]);
      delete pendingTimers.current[id];
      setPendingDelete((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setMatches((prev) => {
        const next = prev.filter((m) => m.id !== id);
        saveMatches(next);
        return next;
      });
    } else {
      setPendingDelete((prev) => ({ ...prev, [id]: true }));
      pendingTimers.current[id] = setTimeout(() => {
        setPendingDelete((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 3000);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selection.mine.length === 0 || selection.opp.length === 0) return;

    const dateVal = date || todayISO();
    const myDeckName =
      selection.mine.map((p) => p.name).join(" & ") + (mineSuffix.trim() ? ` ${mineSuffix.trim()}` : "");
    const oppDeckName =
      selection.opp.map((p) => p.name).join(" & ") + (oppSuffix.trim() ? ` ${oppSuffix.trim()}` : "");
    const createdAt = nowTimestamp();

    const newMatch: Match = {
      id: uid(),
      mode: "live",
      date: dateVal,
      eventName: "",
      eventCategory: "",
      myDeck: myDeckName,
      myDeckIds: selection.mine.map((p) => p.id),
      oppDeck: oppDeckName,
      oppDeckIds: selection.opp.map((p) => p.id),
      result,
      order,
      brick,
      aceSpec,
      notes: notes.trim(),
      createdAt,
    };

    setMatches((prev) => {
      const next = [...prev, newMatch];
      saveMatches(next);
      return next;
    });

    // Reset only the fields the original app resets after a submit — deck-of-mine
    // selection, its suffix, and the date are intentionally left as-is so logging
    // several games in a row with the same deck stays fast.
    setSelection((prev) => ({ ...prev, opp: [] }));
    setBrick(false);
    setAceSpec("");
    setOppSuffix("");
    setNotes("");
    setResult("W");
    setOrder("");
    historyPagination.resetPage();
  }

  function handleEditSave(updated: Match) {
    setMatches((prev) => {
      const next = prev.map((m) => (m.id === updated.id ? updated : m));
      saveMatches(next);
      return next;
    });
    setEditingMatch(null);
  }

  function handleCreateEvent(newEvent: PtcgEvent) {
    setEvents((prev) => {
      const next = [...prev, newEvent];
      saveEvents(next);
      return next;
    });
  }

  const liveMatches = useMemo(() => matches.filter((m) => (m.mode || "live") === "live"), [matches]);
  const offlineMatches = useMemo(() => matches.filter((m) => m.mode === "offline"), [matches]);
  const overallStats = useMemo(() => computeOverallStats(liveMatches), [liveMatches]);
  const deckOptions = useMemo(() => uniqueSorted(liveMatches.map((m) => m.myDeck)), [liveMatches]);
  const filtered = useMemo(
    () => (filterValue ? liveMatches.filter((m) => m.myDeck === filterValue) : liveMatches),
    [liveMatches, filterValue]
  );
  const matchupRows = useMemo(() => computeMatchupStats(filtered), [filtered]);
  const matchupFiltered = useMemo(() => {
    const q = matchupSearch.trim().toLowerCase();
    return q ? matchupRows.filter((r) => r.deck.toLowerCase().includes(q)) : matchupRows;
  }, [matchupRows, matchupSearch]);
  const matchupPagination = usePagination(matchupFiltered, DEFAULT_PAGE_SIZE);

  const historyDateOptions = useMemo(
    () => uniqueSorted(liveMatches.map((m) => m.date)).sort((a, b) => b.localeCompare(a)),
    [liveMatches]
  );
  const historyFiltered = useMemo(() => {
    const base = !historyFilterValue ? filtered : filtered.filter((m) => m.date === historyFilterValue);
    return base.slice().sort((a, b) => b.createdAt - a.createdAt);
  }, [filtered, historyFilterValue]);
  const historyPagination = usePagination(historyFiltered, DEFAULT_PAGE_SIZE);

  const copy = MODE_COPY[mode];

  return (
    <div className="max-w-[880px] mx-auto px-5 pt-8 pb-16">
      <ModeTabs mode={mode} onChange={switchMode} />

      <div className="flex justify-end mb-2">
        <Link
          href="/compare"
          className="inline-flex items-center gap-1 text-[13px] text-[var(--app-text-muted)] hover:text-[var(--app-accent)]"
        >
          📊 เปรียบเทียบเด็ค
        </Link>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-5 mb-7">
        <div>
          <p className="font-display text-[27px] sm:text-[32px] font-semibold tracking-tight mb-1">
            {copy.wordmark}
          </p>
          <p className="text-[var(--app-text-muted)] text-sm">{copy.tagline}</p>
        </div>
        {mode === "live" ? <StatChips stats={overallStats} /> : null}
      </header>

      {mode === "live" ? (
        <>
          <MatchForm
            formTitle={copy.formTitle}
            date={date}
            onDateChange={setDate}
            mineSelection={selection.mine}
            oppSelection={selection.opp}
            onOpenPicker={openPicker}
            onRemovePokemon={removePokemon}
            pokemonLoading={pokemonLoading}
            pokemonById={pokemonById}
            deckPresets={deckPresets}
            onApplyDeckPreset={applyDeckPreset}
            onSaveDeckPreset={saveDeckPreset}
            onDeleteDeckPreset={removeDeckPreset}
            mineSuffix={mineSuffix}
            onMineSuffixChange={setMineSuffix}
            oppSuffix={oppSuffix}
            onOppSuffixChange={setOppSuffix}
            result={result}
            onResultChange={setResult}
            order={order}
            onOrderChange={setOrder}
            brick={brick}
            onBrickToggle={() => setBrick((v) => !v)}
            aceSpec={aceSpec}
            onAceSpecChange={setAceSpec}
            notes={notes}
            onNotesChange={setNotes}
            onSubmit={handleSubmit}
          />

          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px] mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2.5 mb-3.5">
              <h2 className="font-display text-[19px] font-semibold">สรุปคู่ต่อสู้</h2>
              <Select
                value={filterValue === "" ? DECK_FILTER_ALL : filterValue}
                onValueChange={(v) => {
                  setFilterValue(!v || v === DECK_FILTER_ALL ? "" : v);
                  historyPagination.resetPage();
                  matchupPagination.resetPage();
                }}
              >
                <SelectTrigger className="w-auto min-w-[160px] bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2 h-auto text-[var(--app-text)] text-[14.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DECK_FILTER_ALL}>เด็คของฉันทั้งหมด</SelectItem>
                  {deckOptions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="text"
              placeholder="ค้นหาเด็คคู่แข่ง…"
              value={matchupSearch}
              onChange={(e) => {
                setMatchupSearch(e.target.value);
                matchupPagination.resetPage();
              }}
              className="w-full bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2.5 h-auto text-[var(--app-text)] text-[14.5px] focus-visible:ring-[var(--app-accent)] mb-3"
            />
            <MatchupTable rows={matchupPagination.items} byId={pokemonById} />
            <Pagination
              page={matchupPagination.page}
              pageCount={matchupPagination.pageCount}
              pageSize={matchupPagination.pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              totalItems={matchupPagination.totalItems}
              onPageChange={matchupPagination.setPage}
              onPageSizeChange={matchupPagination.setPageSize}
            />
          </section>

          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px]">
            <div className="flex items-center justify-between flex-wrap gap-2.5 mb-3.5">
              <h2 className="font-display text-[19px] font-semibold">ประวัติการแข่งขัน</h2>
              <Select
                value={historyFilterValue === "" ? HISTORY_FILTER_ALL : historyFilterValue}
                onValueChange={(v) => {
                  setHistoryFilterValue(!v || v === HISTORY_FILTER_ALL ? "" : v);
                  historyPagination.resetPage();
                }}
              >
                <SelectTrigger className="w-auto min-w-[160px] bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2 h-auto text-[var(--app-text)] text-[14.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HISTORY_FILTER_ALL}>ทุกวัน</SelectItem>
                  {historyDateOptions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {formatDateLabel(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <LogList
              matches={historyPagination.items}
              byId={pokemonById}
              pendingDelete={pendingDelete}
              onDeleteClick={handleDeleteClick}
              onEditClick={setEditingMatch}
            />
            <Pagination
              page={historyPagination.page}
              pageCount={historyPagination.pageCount}
              pageSize={historyPagination.pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              totalItems={historyPagination.totalItems}
              onPageChange={historyPagination.setPage}
              onPageSizeChange={historyPagination.setPageSize}
            />
          </section>

          <PokemonPickerDialog
            open={pickerContext !== null}
            context={pickerContext}
            pokemonData={pokemonData}
            selectedIds={pickerContext ? selection[pickerContext].map((p) => p.id) : []}
            search={pickerSearch}
            onSearchChange={setPickerSearch}
            onToggle={togglePokemon}
            onOpenChange={(open) => {
              if (!open) closePicker();
            }}
          />

          <EditMatchDialog
            match={editingMatch}
            onOpenChange={(open) => {
              if (!open) setEditingMatch(null);
            }}
            onSave={handleEditSave}
            pokemonData={pokemonData}
            pokemonById={pokemonById}
            pokemonLoading={pokemonLoading}
            deckPresets={deckPresets}
            onAddDeckPreset={addDeckPreset}
            onDeleteDeckPreset={removeDeckPreset}
          />
        </>
      ) : (
        <OfflineHome
          events={events}
          matches={offlineMatches}
          pokemonData={pokemonData}
          pokemonById={pokemonById}
          pokemonLoading={pokemonLoading}
          onCreateEvent={handleCreateEvent}
        />
      )}
    </div>
  );
}
