"use client";

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

export function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
      {label}
      {multiline ? (
        <textarea
          className="admin-input mt-2 min-h-28 resize-y text-sm normal-case tracking-normal text-[#11100e]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}