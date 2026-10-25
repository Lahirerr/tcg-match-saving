import { forwardRef } from "react";
import { ACE_SPEC_BY_KEY } from "@/lib/constants";
import { formatDateLabel } from "@/lib/format";
import type { Match, OverallStats, Pokemon, PtcgEvent } from "@/lib/types";

const COLORS = {
  bg: "#0b1120",
  card: "#131c30",
  border: "#232e47",
  text: "#f5f7fb",
  muted: "#8d96ac",
  win: "#3b5bdb",
  lose: "#8b2635",
};

function Sprites({ ids, byId }: { ids: number[]; byId: Map<number, Pokemon> }) {
  return (
    <>
      {ids.map((id) => {
        const sprite = byId.get(id)?.sprite;
        if (!sprite) return null;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            src={sprite}
            alt=""
            width={28}
            height={28}
            style={{ width: 28, height: 28, objectFit: "contain", imageRendering: "pixelated", flexShrink: 0 }}
          />
        );
      })}
    </>
  );
}

interface ShareCardProps {
  event: PtcgEvent;
  matches: Match[];
  byId: Map<number, Pokemon>;
  stats: OverallStats;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { event, matches, byId, stats },
  ref
) {
  const aceSpec = event.aceSpec ? ACE_SPEC_BY_KEY[event.aceSpec] : undefined;

  return (
    <div
      ref={ref}
      style={{
        width: 680,
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: 28,
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25 }}>
          {event.name || "รายการที่ยังไม่ระบุชื่อ"}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 999,
            padding: "5px 14px",
            fontSize: 13,
            color: COLORS.muted,
          }}
        >
          {formatDateLabel(event.date)}
        </div>
      </div>

      <div
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 2 }}>
            <Sprites ids={event.myDeckIds} byId={byId} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 2 }}>เด็คที่ใช้</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{event.myDeck}</div>
          </div>
          {aceSpec ? (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 999,
                padding: "5px 10px",
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aceSpec.icon} alt="" width={16} height={16} style={{ width: 16, height: 16, objectFit: "contain" }} />
              {aceSpec.label}
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: "14px 0",
          marginBottom: 12,
        }}
      >
        {[
          { label: "สถิติ", value: `${stats.wins}-${stats.losses}` },
          { label: "อัตราชนะ", value: stats.winRate === null ? "—" : `${stats.winRate}%` },
          { label: "จำนวนรอบ", value: `${stats.total}` },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              textAlign: "center",
              borderLeft: i === 0 ? "none" : `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            fontSize: 11,
            color: COLORS.muted,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ width: 28 }}>R</div>
          <div style={{ flex: 1 }}>คู่ต่อสู้</div>
          <div style={{ width: 60, textAlign: "right" }}>ผล</div>
        </div>
        {matches.map((m, i) => {
          const orderLabel = m.order === "first" ? "เริ่มก่อน" : m.order === "second" ? "เริ่มหลัง" : "";
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                borderBottom: i === matches.length - 1 ? "none" : `1px solid ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.muted,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ display: "flex", gap: 2, marginLeft: 10, flexShrink: 0 }}>
                <Sprites ids={m.oppDeckIds} byId={byId} />
              </div>
              <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.oppDeck}
                </div>
                {orderLabel ? (
                  <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 1 }}>{orderLabel}</div>
                ) : null}
              </div>
              <div
                style={{
                  flexShrink: 0,
                  minWidth: 56,
                  textAlign: "center",
                  borderRadius: 7,
                  padding: "5px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  background: m.result === "W" ? COLORS.win : COLORS.lose,
                }}
              >
                {m.result === "W" ? "ชนะ" : "แพ้"}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 18,
          fontSize: 12,
          color: COLORS.muted,
        }}
      >
        จัดทำโดย เพจ บริคแล้วบ่น by MBK
      </div>
    </div>
  );
});
