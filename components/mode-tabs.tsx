"use client";

import type { MatchMode } from "@/lib/types";

interface ModeTabsProps {
  mode: MatchMode;
  onChange: (mode: MatchMode) => void;
}

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  const baseCls =
    "flex-1 border rounded-xl text-center shadow-sm py-3 px-3.5 font-display text-[15px] font-semibold cursor-pointer";
  const activeCls = "border-[var(--app-accent)] bg-[var(--app-accent-soft)] text-[var(--app-text)]";
  const inactiveCls = "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)]";

  return (
    <div className="flex gap-2 mb-[22px]">
      <button
        type="button"
        onClick={() => onChange("live")}
        className={`${baseCls} ${mode === "live" ? activeCls : inactiveCls}`}
      >
        📱 TCG Live
        <span className="block font-sans text-[11px] font-normal text-[var(--app-text-muted)] mt-0.5">
          บันทึกประจำวัน
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange("offline")}
        className={`${baseCls} ${mode === "offline" ? activeCls : inactiveCls}`}
      >
        🎪 เล่นข้างนอก
        <span className="block font-sans text-[11px] font-normal text-[var(--app-text-muted)] mt-0.5">
          ตั้งชื่อรายการ · เลือกวันที่ · ระบุประเภท
        </span>
      </button>
    </div>
  );
}
