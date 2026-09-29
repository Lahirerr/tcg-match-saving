import { DeckSprites } from "@/components/deck-sprites";
import { EVENT_CATEGORY_ICON_CLASS, EVENT_CATEGORY_LABELS } from "@/lib/constants";
import { formatDateLabel } from "@/lib/format";
import { idsForDeck } from "@/lib/stats";
import type { Match, Pokemon } from "@/lib/types";

interface LogListProps {
  matches: Match[];
  byId: Map<number, Pokemon>;
  pendingDelete: Record<string, boolean>;
  onDeleteClick: (id: string) => void;
  showEventMeta?: boolean;
}

export function LogList({
  matches,
  byId,
  pendingDelete,
  onDeleteClick,
  showEventMeta = true,
}: LogListProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-8 px-2.5 text-[var(--app-text-muted)] text-sm">
        ยังไม่มีบันทึกการแข่งขัน — เริ่มบันทึกแมทช์แรกของคุณด้วยฟอร์มด้านบน
      </div>
    );
  }

  const sorted = matches.slice().sort((a, b) => b.createdAt - a.createdAt);
  const groups: string[] = [];
  const groupMap = new Map<string, Match[]>();
  sorted.forEach((m) => {
    if (!groupMap.has(m.date)) {
      groupMap.set(m.date, []);
      groups.push(m.date);
    }
    groupMap.get(m.date)!.push(m);
  });

  return (
    <div>
      {groups.map((date) => (
        <div key={date} className="mb-[18px]">
          <p className="text-[12.5px] text-[var(--app-text-muted)] font-semibold mb-2">
            {formatDateLabel(date)}
          </p>
          {groupMap.get(date)!.map((m) => {
            const orderLabel =
              m.order === "first" ? "ฉันเริ่มก่อน" : m.order === "second" ? "คู่แข่งเริ่มก่อน" : "";
            const resultWord = m.result === "W" ? "ชนะ" : m.result === "L" ? "แพ้" : "เสมอ (บันทึกเดิม)";
            const isConfirming = !!pendingDelete[m.id];
            const resultPillCls =
              m.result === "W"
                ? "bg-[var(--app-win-soft)] text-[var(--app-win)]"
                : "bg-[var(--app-loss-soft)] text-[var(--app-loss)]";

            return (
              <div
                key={m.id}
                className="flex items-center gap-3 py-2.5 border-b border-[var(--app-border)] last:border-b-0"
              >
                <div
                  className={`w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 ${resultPillCls}`}
                >
                  {m.result}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-medium flex items-center flex-wrap gap-1">
                    <span className="inline-flex items-center gap-1">
                      <DeckSprites ids={idsForDeck(m, "my")} byId={byId} />
                      {m.myDeck}
                    </span>
                    <span className="text-[var(--app-text-muted)] font-normal mx-1">vs</span>
                    <span className="inline-flex items-center gap-1">
                      <DeckSprites ids={idsForDeck(m, "opp")} byId={byId} />
                      {m.oppDeck}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-[var(--app-text-muted)] mt-0.5 flex flex-wrap items-center gap-x-1.5">
                    <span>
                      {resultWord}
                      {orderLabel ? ` · ${orderLabel}` : ""}
                      {m.brick ? " · 🧱 Brick" : ""}
                    </span>
                    {showEventMeta && m.eventName ? <span>· {m.eventName}</span> : null}
                    {showEventMeta && m.eventCategory && EVENT_CATEGORY_LABELS[m.eventCategory] ? (
                      <span className="inline-flex items-center gap-1 border border-[var(--app-border)] bg-[var(--app-surface-2)] rounded-full px-2 py-0.5 font-semibold text-[11px]">
                        <span
                          className={`inline-block w-3 h-3 rounded-full border border-black/20 ${EVENT_CATEGORY_ICON_CLASS[m.eventCategory]}`}
                        />
                        {EVENT_CATEGORY_LABELS[m.eventCategory]}
                      </span>
                    ) : null}
                  </div>
                  {m.notes ? (
                    <div className="text-[13px] text-[var(--app-text-muted)] mt-1">{m.notes}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteClick(m.id)}
                  className={
                    "shrink-0 border text-[12.5px] px-2.5 py-1.5 rounded-lg cursor-pointer " +
                    (isConfirming
                      ? "border-[var(--app-loss)] text-[var(--app-loss)] font-semibold"
                      : "border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-2)]")
                  }
                >
                  {isConfirming ? "ยืนยันการลบ" : "ลบ"}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
