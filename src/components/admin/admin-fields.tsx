"use client";

import type { LocalizedText } from "@/lib/i18n/config";

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-black/10 bg-white/36 p-5 md:p-7">
      <h2 className="room-serif text-4xl">{title}</h2>
      <div className="mt-6 grid gap-5">{children}</div>
    </section>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export type EditLang = "en" | "az";

/**
 * Переключатель языка редактирования. Ставится вверху формы —
 * все локализуемые поля ниже переключаются разом.
 */
export function LangToggle({
  lang,
  onChange,
}: {
  lang: EditLang;
  onChange: (lang: EditLang) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
        Editing language
      </span>
      <div className="flex overflow-hidden border border-black/20">
        {(["en", "az"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              lang === code
                ? "bg-[#11100e] text-[#f4f1ea]"
                : "text-[#6f6a61] hover:bg-black/5"
            }`}
          >
            {code === "en" ? "EN" : "AZ"}
          </button>
        ))}
      </div>
      {lang === "az" ? (
        <span className="text-[10px] uppercase tracking-wider text-[#6f6a61]">
          AZ-перевод; пустое поле показывает EN на сайте
        </span>
      ) : null}
    </div>
  );
}

/** Индикатор: AZ-перевод не заполнен хотя бы в одном из полей. */
export function AzBadge({ fields }: { fields: (LocalizedText | undefined)[] }) {
  const missing = fields.some((f) => !f?.az?.trim());
  if (!missing) return null;
  return (
    <span
      className="ml-2 inline-block border border-amber-400/60 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700"
      title="AZ translation missing — site will show English"
    >
      AZ missing
    </span>
  );
}

export function Field({
  label,
  value,
  onChange,
  multiline,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  required?: boolean;
  type?: "text" | "email" | "url";
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
      {label}
      {multiline ? (
        <textarea
          className="admin-input mt-2 min-h-28 resize-y text-sm normal-case tracking-normal text-[#11100e]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      ) : (
        <input
          className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      )}
    </label>
  );
}

/**
 * Локализуемое поле: редактирует значение для активного языка (lang),
 * хранящееся как LocalizedText. Показывает бейдж «AZ missing».
 */
export function LocalizedField({
  label,
  value,
  lang,
  onChange,
  multiline,
  required,
  placeholder,
}: {
  label: string;
  value: LocalizedText;
  lang: EditLang;
  onChange: (v: LocalizedText) => void;
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Field
        label={`${label} (${lang.toUpperCase()})`}
        value={value[lang]}
        onChange={(v) => onChange({ ...value, [lang]: v })}
        multiline={multiline}
        required={required}
      />
      {placeholder && !value[lang] ? (
        <p className="mt-1 text-[10px] normal-case tracking-normal text-[#6f6a61]/70">
          {placeholder}
        </p>
      ) : null}
    </div>
  );
}
