import { STORAGE_KEY } from "@/lib/constants";
import type { Match } from "@/lib/types";

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
