"use client";

import { useEffect, useState } from "react";
import { uid } from "@/lib/format";
import { loadDeckPresets, saveDeckPresets } from "@/lib/storage";
import type { DeckPreset, Pokemon } from "@/lib/types";

export function useDeckPresets() {
  const [presets, setPresets] = useState<DeckPreset[]>([]);

  useEffect(() => {
    setPresets(loadDeckPresets());
  }, []);

  function addPreset(pokemon: Pokemon[], suffix: string) {
    if (pokemon.length === 0) return;
    const pokemonIds = pokemon.map((p) => p.id);
    const cleanSuffix = suffix.trim();
    const label = pokemon.map((p) => p.name).join(" & ") + (cleanSuffix ? ` ${cleanSuffix}` : "");

    setPresets((prev) => {
      const exists = prev.some(
        (p) =>
          p.suffix === cleanSuffix &&
          p.pokemonIds.length === pokemonIds.length &&
          p.pokemonIds.every((id, i) => id === pokemonIds[i])
      );
      if (exists) return prev;
      const next = [...prev, { id: uid(), label, pokemonIds, suffix: cleanSuffix }];
      saveDeckPresets(next);
      return next;
    });
  }

  function removePreset(id: string) {
    setPresets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveDeckPresets(next);
      return next;
    });
  }

  return { presets, addPreset, removePreset };
}
