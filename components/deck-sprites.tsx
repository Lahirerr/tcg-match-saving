import type { Pokemon } from "@/lib/types";

interface DeckSpritesProps {
  ids: number[];
  byId: Map<number, Pokemon>;
}

export function DeckSprites({ ids, byId }: DeckSpritesProps) {
  return (
    <>
      {ids.map((id) => {
        const sprite = byId.get(id)?.sprite;
        if (!sprite) return null;
        return (
          <img
            key={id}
            className="w-6 h-6 object-contain [image-rendering:pixelated] inline-block"
            src={sprite}
            alt=""
          />
        );
      })}
    </>
  );
}
