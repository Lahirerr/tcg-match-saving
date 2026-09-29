export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
}

export type MatchMode = "live" | "offline";
export type MatchResult = "W" | "L";
export type TurnOrder = "first" | "second" | "";
export type EventCategory = "gym" | "gbl" | "ubl" | "pbl" | "mbl" | "";

export interface Match {
  id: string;
  mode: MatchMode;
  date: string;
  eventName: string;
  eventCategory: EventCategory;
  eventId?: string;
  myDeck: string;
  myDeckIds: number[];
  oppDeck: string;
  oppDeckIds: number[];
  result: MatchResult;
  order: TurnOrder;
  brick: boolean;
  notes: string;
  createdAt: number;
}

export interface PtcgEvent {
  id: string;
  name: string;
  category: EventCategory;
  date: string;
  myDeck: string;
  myDeckIds: number[];
  createdAt: number;
}

export interface PickerSelection {
  mine: Pokemon[];
  opp: Pokemon[];
}

export interface OverallStats {
  total: number;
  wins: number;
  losses: number;
  winRate: number | null;
  streakCount: number;
  streakResult: MatchResult | null;
  bricks: number;
  brickRate: number | null;
}

export interface MatchupRow {
  deck: string;
  deckIds: number[];
  games: number;
  wins: number;
  losses: number;
  winRate: number;
}
