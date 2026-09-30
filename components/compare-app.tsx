"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DeckSprites } from "@/components/deck-sprites";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPokemonData } from "@/lib/pokemon";
import { loadMatches } from "@/lib/storage";
import { computeOverallStats } from "@/lib/stats";
import type { Match, MatchMode, Pokemon } from "@/lib/types";

type ModeFilter = "all" | MatchMode;

interface DeckGroup {
  name: string;
  deckIds: number[];
  matches: Match[];
}

export function CompareApp() {
  const [loaded, setLoaded] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pokemonById, setPokemonById] = useState<Map<number, Pokemon>>(new Map());

  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMatches(loadMatches());
    setLoaded(true);
    fetchPokemonData().then((list) => {
      const map = new Map<number, Pokemon>();
      list.forEach((p) => map.set(p.id, p));
      setPokemonById(map);
    });
  }, []);

  const deckGroups = useMemo<DeckGroup[]>(() => {
    const source =
      modeFilter === "all" ? matches : matches.filter((m) => (m.mode || "live") === modeFilter);
    const map = new Map<string, DeckGroup>();
    source.forEach((m) => {
      if (!m.myDeck) return;
      const group = map.get(m.myDeck);
      if (group) group.matches.push(m);
      else map.set(m.myDeck, { name: m.myDeck, deckIds: m.myDeckIds, matches: [m] });
    });
    return Array.from(map.values()).sort((a, b) => b.matches.length - a.matches.length);
  }, [matches, modeFilter]);

  useEffect(() => {
    setSelected(new Set(deckGroups.map((g) => g.name)));
  }, [deckGroups]);

  function toggleDeck(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const compareRows = useMemo(() => {
    return deckGroups
      .filter((g) => selected.has(g.name))
      .map((g) => ({ ...g, stats: computeOverallStats(g.matches) }))
      .sort((a, b) => (b.stats.winRate ?? -1) - (a.stats.winRate ?? -1));
  }, [deckGroups, selected]);

  if (!loaded) {
    return (
      <div className="max-w-[880px] mx-auto px-5 pt-8 pb-16 text-center text-[var(--app-text-muted)] text-sm">
        กำลังโหลด…
      </div>
    );
  }

  return (
    <div className="max-w-[880px] mx-auto px-5 pt-8 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-[13px] text-[var(--app-text-muted)] hover:text-[var(--app-text)] mb-5"
      >
        ← กลับไปหน้าแรก
      </Link>

      <header className="mb-7">
        <p className="font-display text-[27px] sm:text-[32px] font-semibold tracking-tight mb-1">
          เปรียบเทียบเด็ค
        </p>
        <p className="text-[var(--app-text-muted)] text-sm">
          เลือกเด็คที่อยากเทียบ แล้วดูอัตราชนะเรียงข้างกัน
        </p>
      </header>

      {deckGroups.length === 0 ? (
        <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px]">
          <div className="text-center py-8 px-2.5 text-[var(--app-text-muted)] text-sm">
            ยังไม่มีข้อมูลเด็คให้เปรียบเทียบ — บันทึกแมทช์อย่างน้อยสองสามเกมก่อน
          </div>
        </section>
      ) : (
        <>
          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px] mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2.5 mb-3.5">
              <h2 className="font-display text-[19px] font-semibold">เลือกเด็ค</h2>
              <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as ModeFilter)}>
                <SelectTrigger className="w-auto min-w-[140px] bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-[11px] py-2 h-auto text-[var(--app-text)] text-[14.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกโหมด</SelectItem>
                  <SelectItem value="live">TCG Live</SelectItem>
                  <SelectItem value="offline">เล่นข้างนอก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 mb-3 text-[12.5px]">
              <button
                type="button"
                className="text-[var(--app-accent)] hover:underline cursor-pointer"
                onClick={() => setSelected(new Set(deckGroups.map((g) => g.name)))}
              >
                เลือกทั้งหมด
              </button>
              <button
                type="button"
                className="text-[var(--app-accent)] hover:underline cursor-pointer"
                onClick={() => setSelected(new Set())}
              >
                ล้างที่เลือก
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {deckGroups.map((g) => {
                const isChecked = selected.has(g.name);
                return (
                  <label
                    key={g.name}
                    className={
                      "inline-flex items-center gap-1.5 border rounded-full pl-1 pr-3 py-1 text-[13px] cursor-pointer select-none " +
                      (isChecked
                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)] font-semibold"
                        : "border-[var(--app-border)] bg-[var(--app-surface-2)]")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDeck(g.name)}
                      className="sr-only"
                    />
                    <DeckSprites ids={g.deckIds} byId={pokemonById} />
                    <span>{g.name}</span>
                    <span className="text-[var(--app-text-muted)]">({g.matches.length})</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px]">
            <h2 className="font-display text-[19px] font-semibold mb-3.5">อัตราชนะ</h2>
            {compareRows.length === 0 ? (
              <div className="text-center py-8 px-2.5 text-[var(--app-text-muted)] text-sm">
                เลือกเด็คอย่างน้อย 1 อันด้านบนเพื่อเปรียบเทียบ
              </div>
            ) : (
              <div>
                {compareRows.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center gap-3 py-3 border-b border-[var(--app-border)] last:border-b-0"
                  >
                    <div className="w-[110px] sm:w-[180px] shrink-0 flex items-center gap-1.5 text-[13.5px] font-medium min-w-0">
                      <DeckSprites ids={row.deckIds} byId={pokemonById} />
                      <span className="truncate">{row.name}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 rounded-full bg-[var(--app-tie-soft)] overflow-hidden">
                          <span
                            className="block h-full bg-[var(--app-win)] rounded-full"
                            style={{ width: `${row.stats.winRate ?? 0}%` }}
                          />
                        </div>
                        <span className="text-[13px] font-semibold min-w-[42px] text-right">
                          {row.stats.winRate === null ? "—" : `${row.stats.winRate}%`}
                        </span>
                      </div>
                      <div className="text-[12px] text-[var(--app-text-muted)] mt-1">
                        {row.stats.total} เกม · {row.stats.wins}W {row.stats.losses}L · 🧱{" "}
                        {row.stats.brickRate === null ? "—" : `${row.stats.brickRate}%`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
