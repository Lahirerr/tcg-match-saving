import { streakLabel } from "@/lib/stats";
import type { OverallStats } from "@/lib/types";

interface ChipProps {
  value: string | number;
  label: string;
  valueClassName?: string;
}

function Chip({ value, label, valueClassName }: ChipProps) {
  return (
    <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[10px] px-3.5 py-2 text-center min-w-[74px] shadow-sm">
      <span className={`block font-display text-xl font-semibold leading-tight ${valueClassName ?? ""}`}>
        {value}
      </span>
      <span className="block text-[11px] text-[var(--app-text-muted)] leading-tight mt-0.5">{label}</span>
    </div>
  );
}

export function StatChips({ stats }: { stats: OverallStats }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Chip value={stats.total} label="เกมทั้งหมด" />
      <Chip
        value={stats.winRate === null ? "—" : `${stats.winRate}%`}
        label="อัตราชนะ"
        valueClassName="text-[var(--app-win)]"
      />
      <Chip value={`${stats.wins}W ${stats.losses}L`} label="สถิติรวม" />
      <Chip value={streakLabel(stats)} label="ล่าสุดติดต่อกัน" />
      <Chip
        value={`🧱 ${stats.brickRate === null ? "—" : `${stats.brickRate}%`}`}
        label={`อัตรา Brick (${stats.bricks} เกม)`}
      />
    </div>
  );
}
