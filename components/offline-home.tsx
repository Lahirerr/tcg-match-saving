"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { EventCard } from "@/components/event-card";
import { Pagination } from "@/components/pagination";
import { PokemonPickerDialog } from "@/components/pokemon-picker-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_CATEGORY_LABELS, MAX_PER_SIDE } from "@/lib/constants";
import { todayISO, uid } from "@/lib/format";
import { computeOverallStats } from "@/lib/stats";
import type { EventCategory, Match, Pokemon, PtcgEvent } from "@/lib/types";

const CATEGORY_FILTER_ALL = "__all__";
const EVENT_CATEGORY_KEYS = Object.keys(EVENT_CATEGORY_LABELS) as Exclude<EventCategory, "">[];
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];
const DEFAULT_PAGE_SIZE = 10;

interface OfflineHomeProps {
  events: PtcgEvent[];
  matches: Match[];
  pokemonData: Pokemon[];
  pokemonById: Map<number, Pokemon>;
  pokemonLoading: boolean;
  onCreateEvent: (event: PtcgEvent) => void;
}

export function OfflineHome({
  events,
  matches,
  pokemonData,
  pokemonById,
  pokemonLoading,
  onCreateEvent,
}: OfflineHomeProps) {
  const router = useRouter();

  const [date, setDate] = useState(todayISO());
  const [eventName, setEventName] = useState("");
  const [eventCategory, setEventCategory] = useState<EventCategory>("");
  const [mineSuffix, setMineSuffix] = useState("");
  const [mineSelection, setMineSelection] = useState<Pokemon[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  function toggleMine(pokemon: Pokemon) {
    setMineSelection((prev) => {
      const idx = prev.findIndex((p) => p.id === pokemon.id);
      if (idx !== -1) return prev.filter((p) => p.id !== pokemon.id);
      if (prev.length >= MAX_PER_SIDE) return prev;
      return [...prev, pokemon];
    });
  }

  function removeMine(id: number) {
    setMineSelection((prev) => prev.filter((p) => p.id !== id));
  }

  function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mineSelection.length === 0) return;

    const deckName =
      mineSelection.map((p) => p.name).join(" & ") + (mineSuffix.trim() ? ` ${mineSuffix.trim()}` : "");

    const newEvent: PtcgEvent = {
      id: uid(),
      name: eventName.trim(),
      category: eventCategory,
      date: date || todayISO(),
      myDeck: deckName,
      myDeckIds: mineSelection.map((p) => p.id),
      createdAt: Date.now(),
    };

    onCreateEvent(newEvent);
    router.push(`/event/${newEvent.id}`);
  }

  const matchesByEvent = useMemo(() => {
    const map = new Map<string, Match[]>();
    matches.forEach((m) => {
      if (!m.eventId) return;
      const arr = map.get(m.eventId);
      if (arr) arr.push(m);
      else map.set(m.eventId, [m]);
    });
    return map;
  }, [matches]);

  const sortedEvents = useMemo(() => events.slice().sort((a, b) => b.createdAt - a.createdAt), [events]);
  const filteredEvents = useMemo(
    () => (categoryFilter ? sortedEvents.filter((ev) => ev.category === categoryFilter) : sortedEvents),
    [sortedEvents, categoryFilter]
  );

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedEvents = useMemo(
    () => filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredEvents, currentPage, pageSize]
  );

  return (
    <>
      <EventForm
        formTitle="สร้างรายการใหม่"
        date={date}
        onDateChange={setDate}
        eventName={eventName}
        onEventNameChange={setEventName}
        eventCategory={eventCategory}
        onEventCategoryChange={setEventCategory}
        mineSelection={mineSelection}
        onOpenPicker={() => {
          setPickerSearch("");
          setPickerOpen(true);
        }}
        onRemovePokemon={removeMine}
        pokemonLoading={pokemonLoading}
        mineSuffix={mineSuffix}
        onMineSuffixChange={setMineSuffix}
        onSubmit={handleCreateEvent}
      />

      <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px]">
        <div className="flex items-center justify-between flex-wrap gap-2.5 mb-3.5">
          <h2 className="font-display text-[19px] font-semibold">รายการที่บันทึกไว้</h2>
          <Select
            value={categoryFilter === "" ? CATEGORY_FILTER_ALL : categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(!v || v === CATEGORY_FILTER_ALL ? "" : (v as EventCategory));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-auto min-w-[160px] bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2 h-auto text-[var(--app-text)] text-[14.5px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CATEGORY_FILTER_ALL}>ทุกหมวดหมู่</SelectItem>
              {EVENT_CATEGORY_KEYS.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {EVENT_CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {paginatedEvents.length === 0 ? (
          <div className="text-center py-8 px-2.5 text-[var(--app-text-muted)] text-sm">
            ยังไม่มีรายการที่บันทึกไว้ — สร้างรายการแรกของคุณด้วยฟอร์มด้านบน
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {paginatedEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                byId={pokemonById}
                stats={computeOverallStats(matchesByEvent.get(ev.id) ?? [])}
              />
            ))}
          </div>
        )}
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalItems={filteredEvents.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </section>

      <PokemonPickerDialog
        open={pickerOpen}
        context={pickerOpen ? "mine" : null}
        pokemonData={pokemonData}
        selectedIds={mineSelection.map((p) => p.id)}
        search={pickerSearch}
        onSearchChange={setPickerSearch}
        onToggle={toggleMine}
        onOpenChange={(open) => {
          if (!open) setPickerOpen(false);
        }}
      />
    </>
  );
}
