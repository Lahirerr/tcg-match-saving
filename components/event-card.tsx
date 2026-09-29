import Link from "next/link";
import { DeckSprites } from "@/components/deck-sprites";
import { EVENT_CATEGORY_ICON_CLASS, EVENT_CATEGORY_LABELS } from "@/lib/constants";
import { formatDateLabel } from "@/lib/format";
import type { OverallStats, Pokemon, PtcgEvent } from "@/lib/types";

interface EventCardProps {
  event: PtcgEvent;
  byId: Map<number, Pokemon>;
  stats: OverallStats;
}

export function EventCard({ event, byId, stats }: EventCardProps) {
  return (
    <Link
      href={`/event/${event.id}`}
      className="block bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-4 hover:border-[var(--app-accent)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-display text-[16px] font-semibold">
              {event.name || "รายการที่ยังไม่ระบุชื่อ"}
            </span>
            {event.category && EVENT_CATEGORY_LABELS[event.category] ? (
              <span className="inline-flex items-center gap-1 border border-[var(--app-border)] bg-[var(--app-surface-2)] rounded-full px-2 py-0.5 font-semibold text-[11px] shrink-0">
                <span
                  className={`inline-block w-3 h-3 rounded-full border border-black/20 ${EVENT_CATEGORY_ICON_CLASS[event.category]}`}
                />
                {EVENT_CATEGORY_LABELS[event.category]}
              </span>
            ) : null}
          </div>
          <div className="text-[13px] text-[var(--app-text-muted)] mt-1 flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
            <span>{formatDateLabel(event.date)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <DeckSprites ids={event.myDeckIds} byId={byId} />
              {event.myDeck}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-lg font-semibold">
            {stats.total === 0 ? "—" : `${stats.wins}W ${stats.losses}L`}
          </div>
          <div className="text-[11px] text-[var(--app-text-muted)]">
            {stats.total} รอบ{stats.winRate === null ? "" : ` · ${stats.winRate}%`}
          </div>
        </div>
      </div>
    </Link>
  );
}
