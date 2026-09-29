import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  pageSizeOptions,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--app-border)] text-[13px] text-[var(--app-text-muted)]">
      <div className="flex items-center gap-2">
        <span>แสดงหน้าละ</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-auto min-w-[64px] bg-[var(--app-surface-2)] border-[var(--app-border)] rounded-lg px-2.5 py-1.5 h-auto text-[var(--app-text)] text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>รายการ · ทั้งหมด {totalItems} รายการ</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="border-[var(--app-border)] bg-[var(--app-surface-2)] text-[var(--app-text)] rounded-lg px-2.5 py-1.5 h-auto text-[13px] hover:bg-[var(--app-surface-2)]"
        >
          ก่อนหน้า
        </Button>
        <span className="tabular-nums px-1">
          หน้า {page} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="border-[var(--app-border)] bg-[var(--app-surface-2)] text-[var(--app-text)] rounded-lg px-2.5 py-1.5 h-auto text-[13px] hover:bg-[var(--app-surface-2)]"
        >
          ถัดไป
        </Button>
      </div>
    </div>
  );
}
