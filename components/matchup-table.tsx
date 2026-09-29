import { DeckSprites } from "@/components/deck-sprites";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MatchupRow, Pokemon } from "@/lib/types";

interface MatchupTableProps {
  rows: MatchupRow[];
  byId: Map<number, Pokemon>;
}

export function MatchupTable({ rows, byId }: MatchupTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-8 px-2.5 text-[var(--app-text-muted)] text-sm">
        ยังไม่มีข้อมูลพอสำหรับสรุปคู่ต่อสู้ — บันทึกแมทช์สักสองสามเกมก่อน
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-sm border-collapse">
        <TableHeader>
          <TableRow className="text-[var(--app-text-muted)] text-[12.5px] hover:bg-transparent">
            <TableHead className="text-left px-2 py-2 font-normal">เด็คคู่แข่ง</TableHead>
            <TableHead className="text-right px-2 py-2 font-normal">เกม</TableHead>
            <TableHead className="text-right px-2 py-2 font-normal">ชนะ</TableHead>
            <TableHead className="text-right px-2 py-2 font-normal">แพ้</TableHead>
            <TableHead className="text-left px-2 py-2 font-normal">อัตราชนะ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.deck} className="hover:bg-transparent">
              <TableCell className="px-2 py-2.5 border-b border-[var(--app-border)]">
                <div className="flex items-center gap-1.5">
                  <DeckSprites ids={r.deckIds} byId={byId} />
                  {r.deck}
                </div>
              </TableCell>
              <TableCell className="px-2 py-2.5 border-b border-[var(--app-border)] text-right">
                {r.games}
              </TableCell>
              <TableCell className="px-2 py-2.5 border-b border-[var(--app-border)] text-right">
                {r.wins}
              </TableCell>
              <TableCell className="px-2 py-2.5 border-b border-[var(--app-border)] text-right">
                {r.losses}
              </TableCell>
              <TableCell className="px-2 py-2.5 border-b border-[var(--app-border)] min-w-[120px]">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--app-tie-soft)] overflow-hidden">
                    <span
                      className="block h-full bg-[var(--app-win)]"
                      style={{ width: `${r.winRate}%` }}
                    />
                  </div>
                  <span className="text-[12.5px] min-w-[34px] text-right">{r.winRate}%</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
