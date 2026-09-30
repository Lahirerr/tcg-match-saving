import type { TurnOrder } from "@/lib/types";

const pillLabelCls =
  "inline-flex items-center px-4 py-2.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-2)] text-sm text-[var(--app-text)] cursor-pointer select-none";

interface TurnOrderPickerProps {
  value: TurnOrder;
  onChange: (v: TurnOrder) => void;
  name?: string;
}

export function TurnOrderPicker({ value, onChange, name = "order" }: TurnOrderPickerProps) {
  return (
    <div>
      <span className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">ใครเริ่มก่อน</span>
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <input
            type="radio"
            name={name}
            id={`${name}_first`}
            checked={value === "first"}
            onChange={() => onChange("first")}
            className="peer sr-only"
          />
          <label
            htmlFor={`${name}_first`}
            className={`${pillLabelCls} peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent-soft)] peer-checked:font-semibold`}
          >
            ฉันเริ่มก่อน
          </label>
        </div>
        <div className="relative">
          <input
            type="radio"
            name={name}
            id={`${name}_second`}
            checked={value === "second"}
            onChange={() => onChange("second")}
            className="peer sr-only"
          />
          <label
            htmlFor={`${name}_second`}
            className={`${pillLabelCls} peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent-soft)] peer-checked:font-semibold`}
          >
            คู่แข่งเริ่มก่อน
          </label>
        </div>
        <div className="relative">
          <input
            type="radio"
            name={name}
            id={`${name}_na`}
            checked={value === ""}
            onChange={() => onChange("")}
            className="peer sr-only"
          />
          <label
            htmlFor={`${name}_na`}
            className={`${pillLabelCls} peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent-soft)] peer-checked:font-semibold`}
          >
            ไม่ระบุ
          </label>
        </div>
      </div>
    </div>
  );
}
