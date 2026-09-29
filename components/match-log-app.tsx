"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ModeTabs } from "@/components/mode-tabs";
import { MatchForm } from "@/components/match-form";
import { PokemonPickerDialog } from "@/components/pokemon-picker-dialog";
import { MatchupTable } from "@/components/matchup-table";
import { LogList } from "@/components/log-list";
import { Pagination } from "@/components/pagination";
import { StatChips } from "@/components/stat-chips";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_CATEGORY_LABELS, MODE_COPY } from "@/lib/constants";
import { formatDateLabel, todayISO, uid, uniqueSorted } from "@/lib/format";
import { fetchPokemonData } from "@/lib/pokemon";
import { loadMatches, saveMatches } from "@/lib/storage";
import { computeMatchupStats, computeOverallStats } from "@/lib/stats";
import type {
  EventCategory,
  Match,
  MatchMode,
  MatchResult,
  PickerSelection,
  Pokemon,
  TurnOrder,
} from "@/lib/types";

const DECK_FILTER_ALL = "__all__";
const HISTORY_FILTER_ALL = "__all__";
const EVENT_CATEGORY_KEYS = Object.keys(EVENT_CATEGORY_LABELS) as Exclude<EventCategory, "">[];
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];
const DEFAULT_PAGE_SIZE = 10;

export function MatchLogApp() {
  const [mode, setMode] = useState<MatchMode>("live");
  const [matches, setMatches] = useState<Match[]>([]);
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [pokemonLoading, setPokemonLoading] = useState(true);

  const [selection, setSelection] = useState<PickerSelection>({ mine: [], opp: [] });
  const [pickerContext, setPickerContext] = useState<"mine" | "opp" | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  const [date, setDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventCategory, setEventCategory] = useState<EventCategory>("");
  const [mineSuffix, setMineSuffix] = useState("");
  const [oppSuffix, setOppSuffix] = useState("");
  const [result, setResult] = useState<MatchResult>("W");
  const [order, setOrder] = useState<TurnOrder>("");
  const [brick, setBrick] = useState(false);
  const [notes, setNotes] = useState("");

  const [filterValue, setFilterValue] = useState("");
  const [historyFilterValue, setHistoryFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pendingDelete, setPendingDelete] = useState<Record<string, boolean>>({});
  const pendingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setMatches(loadMatches());
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
    setPage(1);
    if (next === "live") {
      setEventName("");
      setEventCategory("");
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

    const newMatch: Match = {
      id: uid(),
      mode,
      date: dateVal,
      eventName: mode === "offline" ? eventName.trim() : "",
      eventCategory: mode === "offline" ? eventCategory : "",
      myDeck: myDeckName,
      myDeckIds: selection.mine.map((p) => p.id),
      oppDeck: oppDeckName,
      oppDeckIds: selection.opp.map((p) => p.id),
      result,
      order,
      brick,
      notes: notes.trim(),
      createdAt: Date.now(),
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
    if (mode === "offline") {
      setEventName("");
      setEventCategory("");
    }
    setOppSuffix("");
    setNotes("");
    setResult("W");
    setOrder("");
    setPage(1);
  }

  const modeMatches = useMemo(() => matches.filter((m) => (m.mode || "live") === mode), [matches, mode]);
  const overallStats = useMemo(() => computeOverallStats(modeMatches), [modeMatches]);
  const deckOptions = useMemo(() => uniqueSorted(modeMatches.map((m) => m.myDeck)), [modeMatches]);
  const filtered = useMemo(
    () => (filterValue ? modeMatches.filter((m) => m.myDeck === filterValue) : modeMatches),
    [modeMatches, filterValue]
  );
  const matchupRows = useMemo(() => computeMatchupStats(filtered), [filtered]);

  const historyDateOptions = useMemo(
    () => uniqueSorted(modeMatches.map((m) => m.date)).sort((a, b) => b.localeCompare(a)),
    [modeMatches]
  );
  const historyFiltered = useMemo(() => {
    if (!historyFilterValue) return filtered;
    if (mode === "live") return filtered.filter((m) => m.date === historyFilterValue);
    return filtered.filter((m) => m.eventCategory === historyFilterValue);
  }, [filtered, historyFilterValue, mode]);

  const pageCount = Math.max(1, Math.ceil(historyFiltered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedHistory = useMemo(
    () => historyFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [historyFiltered, currentPage, pageSize]
  );

  const copy = MODE_COPY[mode];

  return (
    <div className="max-w-[880px] mx-auto px-5 pt-8 pb-16">
      <ModeTabs mode={mode} onChange={switchMode} />

      <header className="flex flex-wrap items-end justify-between gap-5 mb-7">
        <div>
          <p className="font-display text-[27px] sm:text-[32px] font-semibold tracking-tight mb-1">
            {copy.wordmark}
          </p>
          <p className="text-[var(--app-text-muted)] text-sm">{copy.tagline}</p>
        </div>
        <StatChips stats={overallStats} />
      </header>

      <MatchForm
        mode={mode}
        formTitle={copy.formTitle}
        date={date}
        onDateChange={setDate}
        eventName={eventName}
        onEventNameChange={setEventName}
        eventCategory={eventCategory}
        onEventCategoryChange={setEventCategory}
        mineSelection={selection.mine}
        oppSelection={selection.opp}
        onOpenPicker={openPicker}
        onRemovePokemon={removePokemon}
        pokemonLoading={pokemonLoading}
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
              setPage(1);
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
        <MatchupTable rows={matchupRows} byId={pokemonById} />
      </section>

      <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px]">
        <div className="flex items-center justify-between flex-wrap gap-2.5 mb-3.5">
          <h2 className="font-display text-[19px] font-semibold">ประวัติการแข่งขัน</h2>
          <Select
            value={historyFilterValue === "" ? HISTORY_FILTER_ALL : historyFilterValue}
            onValueChange={(v) => {
              setHistoryFilterValue(!v || v === HISTORY_FILTER_ALL ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-auto min-w-[160px] bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2 h-auto text-[var(--app-text)] text-[14.5px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={HISTORY_FILTER_ALL}>
                {mode === "live" ? "ทุกวัน" : "ทุกหมวดหมู่"}
              </SelectItem>
              {mode === "live"
                ? historyDateOptions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {formatDateLabel(d)}
                    </SelectItem>
                  ))
                : EVENT_CATEGORY_KEYS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {EVENT_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>
        <LogList
          matches={paginatedHistory}
          byId={pokemonById}
          pendingDelete={pendingDelete}
          onDeleteClick={handleDeleteClick}
        />
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalItems={historyFiltered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
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
    </div>
  );
}
