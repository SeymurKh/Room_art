"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { UploadField } from "@/components/upload-field";
import type { Artist } from "@/lib/types";

export function ArtistForm({ defaults }: { defaults: Artist }) {
  const [data, setData] = useState<Artist>(defaults);

  function updateField(key: keyof Artist, value: string) {
    const next = { ...data, [key]: value };
    setData(next);
    const el = document.getElementById("payload") as HTMLInputElement;
    if (el) el.value = JSON.stringify(next);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Field label="Name" value={data.name} onChange={(v) => updateField("name", v)} />
      <Field label="Role" value={data.role} onChange={(v) => updateField("role", v)} />
      <UploadField label="Portrait" value={data.portrait} onChange={(v) => updateField("portrait", v)} folder="uploads/artists" />
      <Field multiline label="Bio" value={data.bio} onChange={(v) => updateField("bio", v)} />
      <Field multiline label="Statement" value={data.statement} onChange={(v) => updateField("statement", v)} />
      <button
        type="submit"
        className="mt-6 inline-flex items-center gap-2 bg-[#11100e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea]"
      >
        <Save size={16} /> Save artist
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
      {label}
      {multiline ? (
        <textarea
          id={id}
          className="admin-input mt-2 min-h-28 resize-y text-sm normal-case tracking-normal text-[#11100e]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}