import { DECK_PRESETS_STORAGE_KEY, EVENTS_STORAGE_KEY, STORAGE_KEY } from "@/lib/constants";
import { uid } from "@/lib/format";
import type { DeckPreset, Match, PtcgEvent } from "@/lib/types";

export function loadMatches(): Match[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("ไม่สามารถโหลดข้อมูลได้", e);
    return [];
  }
}

export function saveMatches(matches: Match[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
    return true;
  } catch (e) {
    console.error("ไม่สามารถบันทึกข้อมูลได้", e);
    return false;
  }
}

export function loadEvents(): PtcgEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("ไม่สามารถโหลดข้อมูลรายการได้", e);
    return [];
  }
}

export function saveEvents(events: PtcgEvent[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (e) {
    console.error("ไม่สามารถบันทึกข้อมูลรายการได้", e);
    return false;
  }
}

export function loadDeckPresets(): DeckPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DECK_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("ไม่สามารถโหลดเด็คที่บันทึกไว้ได้", e);
    return [];
  }
}

export function saveDeckPresets(presets: DeckPreset[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(DECK_PRESETS_STORAGE_KEY, JSON.stringify(presets));
    return true;
  } catch (e) {
    console.error("ไม่สามารถบันทึกเด็คที่ใช้บ่อยได้", e);
    return false;
  }
}

/**
 * Loads matches + events, grouping any legacy offline-mode matches (logged
 * before events existed) into synthetic events keyed by name+category+date,
 * so old data keeps showing up under the new event-based history.
 */
export function loadMatchesWithMigration(): { matches: Match[]; events: PtcgEvent[] } {
  const matches = loadMatches();
  const events = loadEvents();

  const legacy = matches.filter((m) => m.mode === "offline" && !m.eventId);
  if (legacy.length === 0) return { matches, events };

  const groups = new Map<string, Match[]>();
  legacy.forEach((m) => {
    const key = `${m.eventName}\u0000${m.eventCategory}\u0000${m.date}`;
    const group = groups.get(key);
    if (group) group.push(m);
    else groups.set(key, [m]);
  });

  const newEvents: PtcgEvent[] = [];
  const eventIdByMatchId = new Map<string, string>();
  groups.forEach((group) => {
    const sorted = group.slice().sort((a, b) => a.createdAt - b.createdAt);
    const first = sorted[0];
    const eventId = uid();
    newEvents.push({
      id: eventId,
      name: first.eventName || "รายการที่ยังไม่ระบุชื่อ",
      category: first.eventCategory,
      date: first.date,
      myDeck: first.myDeck,
      myDeckIds: first.myDeckIds,
      aceSpec: first.aceSpec || "",
      createdAt: first.createdAt,
    });
    group.forEach((m) => eventIdByMatchId.set(m.id, eventId));
  });

  const migratedMatches = matches.map((m) =>
    eventIdByMatchId.has(m.id) ? { ...m, eventId: eventIdByMatchId.get(m.id) } : m
  );
  const mergedEvents = [...events, ...newEvents];

  saveMatches(migratedMatches);
  saveEvents(mergedEvents);

  return { matches: migratedMatches, events: mergedEvents };
}
