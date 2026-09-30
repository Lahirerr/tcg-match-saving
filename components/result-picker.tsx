import type { MatchResult } from "@/lib/types";

const pillLabelCls =
  "inline-flex items-center px-4 py-2.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-2)] text-sm text-[var(--app-text)] cursor-pointer select-none";

interface ResultPickerProps {
  value: MatchResult;
  onChange: (v: MatchResult) => void;
  name?: string;
}

export function ResultPicker({ value, onChange, name = "result" }: ResultPickerProps) {
  return (
    <div>
      <span className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">ผลการแข่งขัน</span>
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <input
            type="radio"
            name={name}
            id={`${name}_w`}
            checked={value === "W"}
            onChange={() => onChange("W")}
            className="peer sr-only"
          />
          <label
            htmlFor={`${name}_w`}
            className={`${pillLabelCls} peer-checked:border-[var(--app-win)] peer-checked:bg-[var(--app-win-soft)] peer-checked:text-[var(--app-win)] peer-checked:font-semibold`}
          >
            ชนะ
          </label>
        </div>
        <div className="relative">
          <input
            type="radio"
            name={name}
            id={`${name}_l`}
            checked={value === "L"}
            onChange={() => onChange("L")}
            className="peer sr-only"
          />
          <label
            htmlFor={`${name}_l`}
            className={`${pillLabelCls} peer-checked:border-[var(--app-loss)] peer-checked:bg-[var(--app-loss-soft)] peer-checked:text-[var(--app-loss)] peer-checked:font-semibold`}
          >
            แพ้
          </label>
        </div>
      </div>
    </div>
  );
}
