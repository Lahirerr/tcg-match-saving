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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ACE_SPEC_BY_KEY } from "@/lib/constants";
import { fetchPokemonData } from "@/lib/pokemon";
import { loadMatches } from "@/lib/storage";
import { computeOverallStats } from "@/lib/stats";
import type { Match, MatchMode, Pokemon } from "@/lib/types";

type ModeFilter = "all" | MatchMode;

interface DeckGroup {
  key: string;
  name: string;
  aceSpec: string;
  deckIds: number[];
  matches: Match[];
}

interface MatrixCell {
  games: number;
  wins: number;
  losses: number;
  winRate: number;
}

function deckDisplayLabel(name: string, aceSpec: string): string {
  const spec = aceSpec ? ACE_SPEC_BY_KEY[aceSpec] : undefined;
  return spec ? `${name} · ${spec.label}` : name;
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
      const aceSpec = m.aceSpec || "";
      const key = `${m.myDeck}\u0000${aceSpec}`;
      const group = map.get(key);
      if (group) group.matches.push(m);
      else map.set(key, { key, name: m.myDeck, aceSpec, deckIds: m.myDeckIds, matches: [m] });
    });
    return Array.from(map.values()).sort((a, b) => b.matches.length - a.matches.length);
  }, [matches, modeFilter]);

  useEffect(() => {
    setSelected(new Set(deckGroups.map((g) => g.key)));
  }, [deckGroups]);

  function toggleDeck(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const compareRows = useMemo(() => {
    return deckGroups
      .filter((g) => selected.has(g.key))
      .map((g) => ({ ...g, stats: computeOverallStats(g.matches) }))
      .sort((a, b) => (b.stats.winRate ?? -1) - (a.stats.winRate ?? -1));
  }, [deckGroups, selected]);

  const matrixRows = useMemo(() => {
    const oppMap = new Map<string, { oppIds: number[]; cells: Map<string, MatrixCell>; totalGames: number }>();
    compareRows.forEach((deck) => {
      deck.matches.forEach((m) => {
        if (!m.oppDeck) return;
        let opp = oppMap.get(m.oppDeck);
        if (!opp) {
          opp = { oppIds: m.oppDeckIds, cells: new Map(), totalGames: 0 };
          oppMap.set(m.oppDeck, opp);
        }
        let cell = opp.cells.get(deck.key);
        if (!cell) {
          cell = { games: 0, wins: 0, losses: 0, winRate: 0 };
          opp.cells.set(deck.key, cell);
        }
        cell.games++;
        if (m.result === "W") cell.wins++;
        else if (m.result === "L") cell.losses++;
        opp.totalGames++;
      });
    });
    oppMap.forEach((opp) => {
      opp.cells.forEach((cell) => {
        cell.winRate = cell.games > 0 ? Math.round((cell.wins / cell.games) * 100) : 0;
      });
    });
    return Array.from(oppMap.entries())
      .map(([oppName, data]) => ({ oppName, oppIds: data.oppIds, cells: data.cells, totalGames: data.totalGames }))
      .sort((a, b) => b.totalGames - a.totalGames);
  }, [compareRows]);

  if (!loaded) {
    return (
      <div className="max-w-[880px] mx-auto px-5 pt-8 pb-16 text-center text-[var(--app-text-muted)] text-sm">
        กำลังโหลด…
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-5 pt-8 pb-16">
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
          เลือกเด็คที่อยากเทียบ แล้วดูอัตราชนะและตารางเจอคู่ต่อสู้แต่ละฝั่ง
          (เด็คเดียวกันแต่ ACE SPEC ต่างกัน นับเป็นคนละเด็ค)
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
                onClick={() => setSelected(new Set(deckGroups.map((g) => g.key)))}
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
                const isChecked = selected.has(g.key);
                return (
                  <label
                    key={g.key}
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
                      onChange={() => toggleDeck(g.key)}
                      className="sr-only"
                    />
                    <DeckSprites ids={g.deckIds} byId={pokemonById} />
                    <span>{deckDisplayLabel(g.name, g.aceSpec)}</span>
                    <span className="text-[var(--app-text-muted)]">({g.matches.length})</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px] mb-6">
            <h2 className="font-display text-[19px] font-semibold mb-3.5">อัตราชนะรวม</h2>
            {compareRows.length === 0 ? (
              <div className="text-center py-8 px-2.5 text-[var(--app-text-muted)] text-sm">
                เลือกเด็คอย่างน้อย 1 อันด้านบนเพื่อเปรียบเทียบ
              </div>
            ) : (
              <div>
                {compareRows.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center gap-3 py-3 border-b border-[var(--app-border)] last:border-b-0"
                  >
                    <div className="w-[130px] sm:w-[200px] shrink-0 flex items-center gap-1.5 text-[13.5px] font-medium min-w-0">
                      <DeckSprites ids={row.deckIds} byId={pokemonById} />
                      <span className="truncate">{deckDisplayLabel(row.name, row.aceSpec)}</span>
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

          <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-[22px]">
            <h2 className="font-display text-[19px] font-semibold mb-1">ตารางเจอคู่ต่อสู้</h2>
            <p className="text-[12.5px] text-[var(--app-text-muted)] mb-3.5">
              แต่ละแถวคือเด็คคู่แข่งที่เจอ แต่ละคอลัมน์คือเด็คที่เลือกเปรียบเทียบ — ดูว่าเด็คไหนรับมือคู่แข่งฝั่งไหนได้ดีกว่ากัน
            </p>
            {compareRows.length === 0 ? (
              <div className="text-center py-8 px-2.5 text-[var(--app-text-muted)] text-sm">
                เลือกเด็คอย่างน้อย 1 อันด้านบนเพื่อดูตาราง
              </div>
            ) : matrixRows.length === 0 ? (
              <div className="text-center py-8 px-2.5 text-[var(--app-text-muted)] text-sm">
                เด็คที่เลือกยังไม่มีประวัติเจอคู่ต่อสู้
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full text-sm border-collapse">
                  <TableHeader>
                    <TableRow className="text-[var(--app-text-muted)] text-[12.5px] hover:bg-transparent">
                      <TableHead className="text-left px-2 py-2 font-normal sticky left-0 bg-[var(--app-surface)]">
                        เด็คคู่แข่ง
                      </TableHead>
                      {compareRows.map((deck) => (
                        <TableHead
                          key={deck.key}
                          className="text-center px-2 py-2 font-normal min-w-[110px]"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-[var(--app-text)] font-medium">
                              <DeckSprites ids={deck.deckIds} byId={pokemonById} />
                            </span>
                            <span className="leading-tight text-center">
                              {deckDisplayLabel(deck.name, deck.aceSpec)}
                            </span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matrixRows.map((row) => (
                      <TableRow key={row.oppName} className="hover:bg-transparent">
                        <TableCell className="px-2 py-2.5 border-b border-[var(--app-border)] sticky left-0 bg-[var(--app-surface)]">
                          <div className="flex items-center gap-1.5">
                            <DeckSprites ids={row.oppIds} byId={pokemonById} />
                            {row.oppName}
                          </div>
                        </TableCell>
                        {compareRows.map((deck) => {
                          const cell = row.cells.get(deck.key);
                          return (
                            <TableCell
                              key={deck.key}
                              className="px-2 py-2.5 border-b border-[var(--app-border)] text-center"
                            >
                              {cell ? (
                                <>
                                  <div className="font-semibold text-[13.5px]">{cell.winRate}%</div>
                                  <div className="text-[11px] text-[var(--app-text-muted)]">
                                    {cell.wins}W {cell.losses}L
                                  </div>
                                </>
                              ) : (
                                <span className="text-[var(--app-text-muted)]">—</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
