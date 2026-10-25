"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ShareCard } from "@/components/share-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Match, OverallStats, Pokemon, PtcgEvent } from "@/lib/types";

interface ShareImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: PtcgEvent;
  matches: Match[];
  byId: Map<number, Pokemon>;
  stats: OverallStats;
}

export function ShareImageDialog({
  open,
  onOpenChange,
  event,
  matches,
  byId,
  stats,
}: ShareImageDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) {
      setImageUrl(null);
      setFailed(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!cardRef.current) return;
      try {
        // Wait for every <img> in the card (ACE SPEC icon, category badge, etc.) to
        // finish loading — html-to-image rasterizes whatever's painted right now, so
        // an image still mid-fetch comes out blank.
        const imgs = Array.from(cardRef.current.querySelectorAll("img"));
        await Promise.all(
          imgs.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            });
          })
        );
        if (cancelled || !cardRef.current) return;
        const url = await toPng(cardRef.current, { pixelRatio: 2 });
        if (!cancelled) setImageUrl(url);
      } catch (e) {
        console.error("สร้างรูปสรุปไม่สำเร็จ", e);
        if (!cancelled) setFailed(true);
      }
    }, 50);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, event, matches, byId, stats]);

  function handleDownload() {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${event.name || "match-summary"}.png`;
    a.click();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton
          className="p-0 gap-0 bg-[var(--app-surface)] max-w-[calc(100%-2rem)] sm:max-w-[520px] max-h-[88vh] flex flex-col overflow-hidden"
        >
          <DialogHeader className="px-[18px] pt-4 pb-3 border-b border-[var(--app-border)] shrink-0">
            <DialogTitle className="font-display text-[17px] font-semibold m-0 text-[var(--app-text)]">
              รูปสรุปสำหรับแชร์
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto p-[18px] flex flex-col items-center gap-3.5">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="รูปสรุปผลการแข่งขัน"
                className="w-full rounded-lg border border-[var(--app-border)]"
              />
            ) : (
              <div className="text-[var(--app-text-muted)] text-sm py-10">
                {failed ? "สร้างรูปไม่สำเร็จ ลองใหม่อีกครั้ง" : "กำลังสร้างรูป…"}
              </div>
            )}
            <Button
              type="button"
              disabled={!imageUrl}
              onClick={handleDownload}
              className="w-full border-0 bg-[var(--app-accent)] text-white font-semibold rounded-lg hover:bg-[var(--app-accent)] hover:brightness-110"
            >
              ดาวน์โหลดรูป
            </Button>
            <p className="text-[11px] text-[var(--app-text-muted)] text-center">
              บนมือถือ: กดค้างที่รูปเพื่อบันทึก หรือกดดาวน์โหลดด้านบน
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {open ? (
        <div style={{ position: "fixed", top: 0, left: -9999, zIndex: -1, pointerEvents: "none" }}>
          <ShareCard ref={cardRef} event={event} matches={matches} byId={byId} stats={stats} />
        </div>
      ) : null}
    </>
  );
}
