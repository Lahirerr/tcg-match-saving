"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeckSprites } from "@/components/deck-sprites";
import { LogList } from "@/components/log-list";
import { MatchupTable } from "@/components/matchup-table";
import { Pagination } from "@/components/pagination";
import { PokemonPickerDialog } from "@/components/pokemon-picker-dialog";
import { RoundForm } from "@/components/round-form";
import { StatChips } from "@/components/stat-chips";
import { EVENT_CATEGORY_ICON_SRC, EVENT_CATEGORY_LABELS, MAX_PER_SIDE } from "@/lib/constants";
import { formatDateLabel, uid } from "@/lib/format";
import { fetchPokemonData } from "@/lib/pokemon";
import { loadMatchesWithMigration, saveEvents, saveMatches } from "@/lib/storage";
import { computeMatchupStats, computeOverallStats } from "@/lib/stats";
import { useDeckPresets } from "@/lib/use-deck-presets";
import type { DeckPreset, Match, MatchResult, Pokemon, PtcgEvent, TurnOrder } from "@/lib/types";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];
const DEFAULT_PAGE_SIZE = 10;

interface EventDetailAppProps {
  eventId: string;
}

export function EventDetailApp({ eventId }: EventDetailAppProps) {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [events, setEvents] = useState<PtcgEvent[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [pokemonById, setPokemonById] = useState<Map<number, Pokemon>>(new Map());
  const [pokemonLoading, setPokemonLoading] = useState(true);

  const [oppSelection, setOppSelection] = useState<Pokemon[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [oppSuffix, setOppSuffix] = useState("");
  const [result, setResult] = useState<MatchResult>("W");
  const [order, setOrder] = useState<TurnOrder>("");
  const [brick, setBrick] = useState(false);
  const [aceSpec, setAceSpec] = useState("");
  const [notes, setNotes] = useState("");

  const { presets: deckPresets, addPreset: addDeckPreset, removePreset: removeDeckPreset } =
    useDeckPresets();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pendingDelete, setPendingDelete] = useState<Record<string, boolean>>({});
  const pendingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(false);
  const pendingDeleteEventTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const data = loadMatchesWithMigration();
    setMatches(data.matches);
    setEvents(data.events);
    setLoaded(true);
    fetchPokemonData().then((list) => {
      setPokemonData(list);
      const map = new Map<number, Pokemon>();
      list.forEach((p) => map.set(p.id, p));
      setPokemonById(map);
      setPokemonLoading(false);
    });
  }, []);

  const event = useMemo(() => events.find((e) => e.id === eventId) ?? null, [events, eventId]);
  const eventMatches = useMemo(() => matches.filter((m) => m.eventId === eventId), [matches, eventId]);
  const stats = useMemo(() => computeOverallStats(eventMatches), [eventMatches]);
  const matchupRows = useMemo(() => computeMatchupStats(eventMatches), [eventMatches]);

  const sortedHistory = useMemo(
    () => eventMatches.slice().sort((a, b) => b.createdAt - a.createdAt),
    [eventMatches]
  );
  const pageCount = Math.max(1, Math.ceil(sortedHistory.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedHistory = useMemo(
    () => sortedHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedHistory, currentPage, pageSize]
  );

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

  function applyOppPreset(preset: DeckPreset) {
    const pokemon = preset.pokemonIds
      .map((id) => pokemonById.get(id))
      .filter((p): p is Pokemon => !!p);
    setOppSelection(pokemon);
    setOppSuffix(preset.suffix);
  }

  function saveOppPreset() {
    addDeckPreset(oppSelection, oppSuffix);
  }

  function persistMatches(next: Match[]) {
    setMatches(next);
    saveMatches(next);
  }

  function handleAddRound(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event || oppSelection.length === 0) return;

    const oppDeckName =
      oppSelection.map((p) => p.name).join(" & ") + (oppSuffix.trim() ? ` ${oppSuffix.trim()}` : "");

    const newMatch: Match = {
      id: uid(),
      mode: "offline",
      date: event.date,
      eventName: event.name,
      eventCategory: event.category,
      eventId: event.id,
      myDeck: event.myDeck,
      myDeckIds: event.myDeckIds,
      oppDeck: oppDeckName,
      oppDeckIds: oppSelection.map((p) => p.id),
      result,
      order,
      brick,
      aceSpec,
      notes: notes.trim(),
      createdAt: Date.now(),
    };

    persistMatches([...matches, newMatch]);
    setOppSelection([]);
    setOppSuffix("");
    setBrick(false);
    setAceSpec("");
    setNotes("");
    setResult("W");
    setOrder("");
    setPage(1);
  }

  function handleDeleteRound(id: string) {
    if (pendingDelete[id]) {
      clearTimeout(pendingTimers.current[id]);
      delete pendingTimers.current[id];
      setPendingDelete((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      persistMatches(matches.filter((m) => m.id !== id));
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

  function handleDeleteEventClick() {
    if (!event) return;
    if (pendingDeleteEvent) {
      if (pendingDeleteEventTimer.current) clearTimeout(pendingDeleteEventTimer.current);
      setEvents((prev) => {
        const next = prev.filter((e) => e.id !== event.id);
        saveEvents(next);
        return next;
      });
      saveMatches(matches.filter((m) => m.eventId !== event.id));
      router.push("/");
    } else {
      setPendingDeleteEvent(true);
      pendingDeleteEventTimer.current = setTimeout(() => setPendingDeleteEvent(false), 3000);
    }
  }

  if (!loaded) {
    return (
      <div className="max-w-[880px] mx-auto px-5 pt-8 pb-16 text-center text-[var(--app-text-muted)] text-sm">
        กำลังโหลด…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-[880px] mx-auto px-5 pt-8 pb-16 text-center">
        <p className="text-[var(--app-text-muted)] text-sm mb-3">ไม่พบรายการนี้ — อาจถูกลบไปแล้ว</p>
        <Link href="/" className="text-[var(--app-accent)] text-sm font-semibold underline">
          ← กลับไปหน้าแรก
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[880px] mx-auto px-5 pt-8 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-[13px] text-[var(--app-text-muted)] hover:text-[var(--app-text)] mb-5"
      >
        ← กลับไปหน้ารายการ
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-5 mb-7">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <p className="font-display text-[27px] sm:text-[32px] font-semibold tracking-tight">
              {event.name || "รายการที่ยังไม่ระบุชื่อ"}
            </p>
            {event.category && EVENT_CATEGORY_LABELS[event.category] ? (
              <span className="inline-flex items-center gap-1 border border-[var(--app-border)] bg-[var(--app-surface-2)] rounded-full px-2.5 py-1 font-semibold text-[12px]">
                <img
                  src={EVENT_CATEGORY_ICON_SRC[event.category]}
                  alt=""
                  className="w-3.5 h-3.5 object-contain"
                />
                {EVENT_CATEGORY_LABELS[event.category]}
              </span>
            ) : null}
          </div>
          <p className="text-[var(--app-text-muted)] text-sm flex items-center gap-1.5 flex-wrap">
            <span>{formatDateLabel(event.date)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <DeckSprites ids={event.myDeckIds} byId={pokemonById} />
              {event.myDeck}
            </span>
          </p>
        </div>
        <StatChips stats={stats} />
      </header>

      <RoundForm
        oppSelection={oppSelection}
        onOpenPicker={() => {
          setPickerSearch("");
          setPickerOpen(true);
        }}
        onRemovePokemon={removeOpp}
        pokemonLoading={pokemonLoading}
        pokemonById={pokemonById}
        deckPresets={deckPresets}
        onApplyDeckPreset={applyOppPreset}
        onSaveDeckPreset={saveOppPreset}
        onDeleteDeckPreset={removeDeckPreset}
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
        onSubmit={handleAddRound}
      />

      <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px] mb-6">
        <h2 className="font-display text-[19px] font-semibold mb-3.5">สรุปคู่ต่อสู้</h2>
        <MatchupTable rows={matchupRows} byId={pokemonById} />
      </section>

      <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px]">
        <h2 className="font-display text-[19px] font-semibold mb-3.5">ประวัติรอบการแข่งขัน</h2>
        <LogList
          matches={paginatedHistory}
          byId={pokemonById}
          pendingDelete={pendingDelete}
          onDeleteClick={handleDeleteRound}
          showEventMeta={false}
        />
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalItems={sortedHistory.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </section>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleDeleteEventClick}
          className={
            "border text-[13px] px-3.5 py-2 rounded-lg cursor-pointer " +
            (pendingDeleteEvent
              ? "border-[var(--app-loss)] text-[var(--app-loss)] font-semibold"
              : "border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-2)]")
          }
        >
          {pendingDeleteEvent ? "ยืนยันการลบรายการนี้ (รวมทุกรอบ)" : "ลบรายการนี้"}
        </button>
      </div>

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
    </div>
  );
}
