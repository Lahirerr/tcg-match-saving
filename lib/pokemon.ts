import type { Pokemon } from "@/lib/types";

export async function fetchPokemonData(): Promise<Pokemon[]> {
  try {
    const res = await fetch("/pokemon-data.json");
    const data = (await res.json()) as Pokemon[];
    return data;
  } catch (e) {
    console.error("โหลดข้อมูลโปเกมอนไม่สำเร็จ", e);
    return [];
  }
}

export function spriteFor(byId: Map<number, Pokemon>, id: number | undefined | null): string | null {
  if (id === undefined || id === null) return null;
  const p = byId.get(id);
  return p ? p.sprite : null;
}
