import { EVENT_CATEGORY_ICON_SRC, EVENT_CATEGORY_PEER_CLASS } from "@/lib/constants";
import type { EventCategory } from "@/lib/types";

const EVENT_CATEGORIES: { value: Exclude<EventCategory, "">; label: string }[] = [
  { value: "gym", label: "Gym" },
  { value: "gbl", label: "GBL" },
  { value: "ubl", label: "UBL" },
  { value: "pbl", label: "PBL" },
  { value: "mbl", label: "MBL" },
];

interface EventCategoryPickerProps {
  value: EventCategory;
  onChange: (v: EventCategory) => void;
}

export function EventCategoryPicker({ value, onChange }: EventCategoryPickerProps) {
  return (
    <div>
      <span className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">ประเภทรายการ</span>
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <input
            type="radio"
            name="eventCategory"
            id="ec_none"
            value=""
            checked={value === ""}
            onChange={() => onChange("")}
            className="peer sr-only"
          />
          <label
            htmlFor="ec_none"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] text-[13.5px] text-[var(--app-text)] cursor-pointer select-none peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent-soft)] peer-checked:font-semibold"
          >
            ไม่ระบุ
          </label>
        </div>
        {EVENT_CATEGORIES.map((cat) => (
          <div className="relative" key={cat.value}>
            <input
              type="radio"
              name="eventCategory"
              id={`ec_${cat.value}`}
              value={cat.value}
              checked={value === cat.value}
              onChange={() => onChange(cat.value)}
              className="peer sr-only"
            />
            <label
              htmlFor={`ec_${cat.value}`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] text-[13.5px] text-[var(--app-text)] cursor-pointer select-none peer-checked:font-semibold ${EVENT_CATEGORY_PEER_CLASS[cat.value]}`}
            >
              <img
                src={EVENT_CATEGORY_ICON_SRC[cat.value]}
                alt=""
                className="w-4 h-4 object-contain shrink-0"
              />
              {cat.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
