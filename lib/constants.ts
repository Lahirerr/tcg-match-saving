import type { EventCategory, MatchMode } from "@/lib/types";

export const STORAGE_KEY = "ptcg_matchlog_v1";
export const EVENTS_STORAGE_KEY = "ptcg_events_v1";
export const MAX_PER_SIDE = 2;

export const EVENT_CATEGORY_LABELS: Record<Exclude<EventCategory, "">, string> = {
  gym: "Gym",
  gbl: "GBL",
  ubl: "UBL",
  pbl: "PBL",
  mbl: "MBL",
};

export const EVENT_CATEGORY_ICON_CLASS: Record<Exclude<EventCategory, "">, string> = {
  gym: "bg-[linear-gradient(to_bottom,#e64545_0%,#e64545_46%,#222_46%,#222_54%,#fdfdfd_54%,#fdfdfd_100%)]",
  gbl: "bg-[linear-gradient(to_bottom,#3a7bd5_0%,#3a7bd5_46%,#222_46%,#222_54%,#e4ebf7_54%,#e4ebf7_100%)]",
  ubl: "bg-[linear-gradient(to_bottom,#2b2b2b_0%,#2b2b2b_46%,#222_46%,#222_54%,#f2c94c_54%,#f2c94c_100%)]",
  pbl: "bg-[linear-gradient(to_bottom,#fdfdfd_0%,#fdfdfd_30%,#e64545_30%,#e64545_42%,#222_42%,#222_46%,#fdfdfd_46%,#fdfdfd_100%)]",
  mbl: "bg-[radial-gradient(circle_at_58%_34%,#f2a6e8_0_17%,transparent_18%),linear-gradient(to_bottom,#7c4fd9_0%,#7c4fd9_46%,#222_46%,#222_54%,#ece2fb_54%,#ece2fb_100%)]",
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
