"use client";

import type { Lang } from "@/lib/types";

const OPTIONS: { value: Lang; label: string; aria: string }[] = [
  { value: "he", label: "אָ", aria: "Hebrew only" },
  { value: "both", label: "Both", aria: "Hebrew and English" },
  { value: "en", label: "EN", aria: "English only" },
];

export function LangToggle({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Reading language"
      className="inline-flex rounded-full border border-vellum-edge bg-[#ece0c3] p-[3px] text-sm shadow-inner"
    >
      {OPTIONS.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            aria-label={o.aria}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3 py-[3px] font-display leading-none transition-colors ${
              active
                ? "bg-ink text-vellum shadow"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
