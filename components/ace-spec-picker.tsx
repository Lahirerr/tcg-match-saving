import { ACE_SPEC_OPTIONS } from "@/lib/constants";

interface AceSpecPickerProps {
  value: string;
  onChange: (v: string) => void;
  name?: string;
}

export function AceSpecPicker({ value, onChange, name = "aceSpec" }: AceSpecPickerProps) {
  return (
    <div>
      <span className="block text-[12.5px] text-[var(--app-text-muted)] mb-1.5">
        ACE SPEC (ไม่บังคับ)
      </span>
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <input
            type="radio"
            name={name}
            id={`${name}_none`}
            value=""
            checked={value === ""}
            onChange={() => onChange("")}
            className="peer sr-only"
          />
          <label
            htmlFor={`${name}_none`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] text-[13.5px] text-[var(--app-text)] cursor-pointer select-none peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent-soft)] peer-checked:font-semibold"
          >
            ไม่มี
          </label>
        </div>
        {ACE_SPEC_OPTIONS.map((opt) => (
          <div className="relative" key={opt.key}>
            <input
              type="radio"
              name={name}
              id={`${name}_${opt.key}`}
              value={opt.key}
              checked={value === opt.key}
              onChange={() => onChange(opt.key)}
              className="peer sr-only"
            />
            <label
              htmlFor={`${name}_${opt.key}`}
              className="inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] text-[13px] text-[var(--app-text)] cursor-pointer select-none peer-checked:border-[var(--app-accent)] peer-checked:bg-[var(--app-accent-soft)] peer-checked:font-semibold"
            >
              <img src={opt.icon} alt="" className="w-6 h-6 object-contain shrink-0" />
              {opt.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
