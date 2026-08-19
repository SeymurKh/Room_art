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
    displayed: defaults.displayed ?? false,
  });

  function updateField(key: keyof Artwork, value: string | number | boolean) {
    let next = { ...data, [key]: value };

    // Auto-calculate dimensions when width or height changes
    if (key === "widthCm" || key === "heightCm") {
      const width = key === "widthCm" ? (value as number) : data.widthCm;
      const height = key === "heightCm" ? (value as number) : data.heightCm;
      if (width > 0 && height > 0) {
        next = { ...next, dimensions: `${width} × ${height} cm` };
      }
    }

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
      <Field label="Medium" value={data.medium} onChange={(v) => updateField("medium", v)} placeholder="e.g. Acrylic on canvas" />
      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
        Dimensions
        <input
          type="text"
          readOnly
          value={data.dimensions}
          className="admin-input mt-2 cursor-not-allowed bg-black/5 text-sm normal-case tracking-normal text-[#6f6a61]"
        />
      </label>
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
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
        <input
          type="checkbox"
          checked={data.displayed}
          onChange={(e) => updateField("displayed", e.target.checked)}
          className="size-4 accent-[#11100e]"
        />
        On display
      </label>
      <Field label="Price" value={data.price ?? ""} onChange={(v) => updateField("price", v)} placeholder="e.g. AZN 2500 / € 1900" />
      <Field multiline label="Description" value={data.description ?? ""} onChange={(v) => updateField("description", v)} />
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
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
          placeholder={placeholder}
        />
      ) : (
        <input
          id={id}
          className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
