import type { EventCategory, MatchMode } from "@/lib/types";

export const STORAGE_KEY = "ptcg_matchlog_v1";
export const EVENTS_STORAGE_KEY = "ptcg_events_v1";
export const DECK_PRESETS_STORAGE_KEY = "ptcg_deck_presets_v1";
export const MAX_PER_SIDE = 2;

// Placeholder labels — swap these for the real ACE SPEC card names.
export const ACE_SPEC_OPTIONS: { key: string; label: string; icon: string }[] = [
  { key: "ace-1", label: "ACE SPEC 1", icon: "/ace-specs/ace-1.png" },
  { key: "ace-2", label: "ACE SPEC 2", icon: "/ace-specs/ace-2.png" },
  { key: "ace-3", label: "ACE SPEC 3", icon: "/ace-specs/ace-3.png" },
  { key: "ace-4", label: "ACE SPEC 4", icon: "/ace-specs/ace-4.png" },
  { key: "ace-5", label: "ACE SPEC 5", icon: "/ace-specs/ace-5.png" },
  { key: "ace-6", label: "ACE SPEC 6", icon: "/ace-specs/ace-6.png" },
  { key: "ace-7", label: "ACE SPEC 7", icon: "/ace-specs/ace-7.png" },
];

export const ACE_SPEC_BY_KEY: Record<string, { label: string; icon: string }> = Object.fromEntries(
  ACE_SPEC_OPTIONS.map((o) => [o.key, { label: o.label, icon: o.icon }])
);

export const EVENT_CATEGORY_LABELS: Record<Exclude<EventCategory, "">, string> = {
  gym: "Gym",
  gbl: "GBL",
  ubl: "UBL",
  pbl: "PBL",
  mbl: "MBL",
};

export const EVENT_CATEGORY_ICON_SRC: Record<Exclude<EventCategory, "">, string> = {
  gym: "/balls/pokeball.png",
  gbl: "/balls/greatball.png",
  ubl: "/balls/ultraball.png",
  pbl: "/balls/premierball.png",
  mbl: "/balls/masterball.png",
};

export const EVENT_CATEGORY_PEER_CLASS: Record<Exclude<EventCategory, "">, string> = {
  gym: "peer-checked:border-[#e64545] peer-checked:bg-[#fbe1e1]",
  gbl: "peer-checked:border-[#3a7bd5] peer-checked:bg-[#e1ebfb]",
  ubl: "peer-checked:border-[#c89a2e] peer-checked:bg-[#faf1d8]",
  pbl: "peer-checked:border-[#c93a3a] peer-checked:bg-[#fdeeee]",
  mbl: "peer-checked:border-[#7c4fd9] peer-checked:bg-[#ede3fb]",
};

export const MODE_COPY: Record<
  MatchMode,
  { wordmark: string; tagline: string; formTitle: string }
> = {
  live: {
    wordmark: "สมุดแมทช์ · TCG Live",
    tagline: "บันทึกผลแมทช์ TCG Live ประจำวัน แล้วดูอัตราชนะของเด็คคุณ",
    formTitle: "บันทึกแมทช์ใหม่ (TCG Live)",
  },
  offline: {
    wordmark: "สมุดแมทช์ · เล่นข้างนอก",
    tagline: "สร้างรายการแข่งขัน แล้วบันทึกผลทีละรอบในรายการนั้น",
    formTitle: "สร้างรายการใหม่",
  },
};
