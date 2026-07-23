"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { UploadField } from "@/components/upload-field";
import type { Artwork, Artist } from "@/lib/types";

export function ArtworkForm({
  defaults,
  artists,
  preselectedArtist = false,
}: {
  defaults: Artwork;
  artists: Artist[];
  preselectedArtist?: boolean;
}) {
  const [data, setData] = useState<Artwork>({
    ...defaults,
    slug: defaults.slug || `artwork-${crypto.randomUUID()}`,
  });

  function updateField(key: keyof Artwork, value: string | number) {
    const next = { ...data, [key]: value };
    setData(next);
    const el = document.getElementById("payload") as HTMLInputElement;
    if (el) el.value = JSON.stringify(next);
  }

  const selectedArtistName = artists.find((a) => a.slug === defaults.artistSlug)?.name ?? defaults.artistSlug;

  return (
    <div className="max-w-2xl space-y-5">
      <Field label="Title" value={data.title} onChange={(v) => updateField("title", v)} />
      {preselectedArtist ? (
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
          Artist
          <p className="mt-1 text-sm normal-case tracking-normal text-[#11100e]">{selectedArtistName}</p>
          <input type="hidden" name="preselectedArtistSlug" value={defaults.artistSlug} />
        </label>
      ) : (
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
          Artist
          <select
            className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]"
            value={data.artistSlug}
            onChange={(e) => updateField("artistSlug", e.target.value)}
          >
            <option value="">— Select artist —</option>
            {artists.map((a) => (
              <option key={a.slug} value={a.slug}>{a.name}</option>
            ))}
          </select>
        </label>
      )}
      <Field label="Year" value={data.year} onChange={(v) => updateField("year", v)} />
      <Field label="Dimensions" value={data.dimensions} onChange={(v) => updateField("dimensions", v)} />
      <label htmlFor="field-width-cm" className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
        Width (cm)
        <input
          id="field-width-cm"
          type="number"
          min="1"
          className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]"
          value={data.widthCm || ""}
          onChange={(e) => updateField("widthCm", e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </label>
      <label htmlFor="field-height-cm" className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
        Height (cm)
        <input
          id="field-height-cm"
          type="number"
          min="1"
          className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]"
          value={data.heightCm || ""}
          onChange={(e) => updateField("heightCm", e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </label>
      <UploadField label="Image" value={data.image} onChange={(v) => updateField("image", v)} folder="uploads/artworks" />
      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
        Availability
        <select
          className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]"
          value={data.availability}
          onChange={(e) => updateField("availability", e.target.value)}
        >
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Private collection">Private collection</option>
        </select>
      </label>
      <Field multiline label="Description" value={data.description} onChange={(v) => updateField("description", v)} />
      <button
        type="submit"
        className="mt-6 inline-flex items-center gap-2 bg-[#11100e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea]"
      >
        <Save size={16} /> Save artwork
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