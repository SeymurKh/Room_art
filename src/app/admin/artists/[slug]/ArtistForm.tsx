"use client";

import { useState, useRef } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { UploadField } from "@/components/upload-field";
import type { Artist } from "@/lib/types";

const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_IMAGE = 100 * 1024 * 1024;

export function ArtistForm({ defaults }: { defaults: Artist }) {
  const [data, setData] = useState<Artist>({
    ...defaults,
    slug: defaults.slug || `artist-${crypto.randomUUID()}`,
    photos: defaults.photos ?? [],
  });
  const dataRef = useRef(data);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [uploadCount, setUploadCount] = useState(0);

  function trackUpload(isUploading: boolean) {
    setUploadCount((count) => Math.max(0, count + (isUploading ? 1 : -1)));
  }

  function syncPayload(next: Artist) {
    const el = document.getElementById("payload") as HTMLInputElement;
    if (el) el.value = JSON.stringify(next);
  }

  function updateField(key: keyof Artist, value: string) {
    const next = { ...dataRef.current, [key]: value };
    dataRef.current = next;
    setData(next);
    syncPayload(next);
  }

  function handlePortraitChange(path: string, pendingDeletion?: string) {
    updateField("portrait", path);
    if (pendingDeletion) {
      setPendingDeletions((prev) =>
        prev.includes(pendingDeletion) ? prev : [...prev, pendingDeletion]
      );
    }
  }

  function addPhoto(path: string) {
    // Upload callbacks may complete in sequence while still holding the same
    // render's callback. Always append to the latest state to retain every file.
    const next = { ...dataRef.current, photos: [...dataRef.current.photos, path] };
    dataRef.current = next;
    setData(next);
    syncPayload(next);
  }

  function removePhoto(index: number) {
    const removed = dataRef.current.photos[index];
    const nextPhotos = dataRef.current.photos.filter((_, i) => i !== index);
    const next = { ...dataRef.current, photos: nextPhotos };
    dataRef.current = next;
    setData(next);
    if (removed && removed.startsWith("/uploads/")) {
      setPendingDeletions((prev) =>
        prev.includes(removed) ? prev : [...prev, removed]
      );
    }
    syncPayload(next);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Field required label="Name" value={data.name} onChange={(v) => updateField("name", v)} />
      <Field required label="Role" value={data.role} onChange={(v) => updateField("role", v)} />
      <UploadField label="Portrait" value={data.portrait} onChange={handlePortraitChange} folder="uploads/artists" onUploadingChange={trackUpload} />
      <input type="hidden" name="pendingDeletions" value={JSON.stringify(pendingDeletions)} />

      {/* Studio photos */}
      <StudioPhotosManager photos={data.photos} onAdd={addPhoto} onRemove={removePhoto} onUploadingChange={trackUpload} />

      <Field multiline label="Bio" value={data.bio} onChange={(v) => updateField("bio", v)} />
      <Field multiline label="Statement" value={data.statement} onChange={(v) => updateField("statement", v)} />
      <button
        type="submit"
        disabled={uploadCount > 0}
        className="mt-6 inline-flex items-center gap-2 bg-[#11100e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea]"
      >
        <Save size={16} /> {uploadCount > 0 ? "Uploading photos…" : "Save artist"}
      </button>
    </div>
  );
}

function StudioPhotosManager({
  photos,
  onAdd,
  onRemove,
  onUploadingChange,
}: {
  photos: string[];
  onAdd: (path: string) => void;
  onRemove: (index: number) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleAdd(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).filter((f) => IMAGE_MIME.includes(f.type) && f.size <= MAX_IMAGE);
    if (list.length === 0) return;
    setUploading(true);
    onUploadingChange(true);
    try {
      for (const file of list) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "uploads/artists");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          alert(`Upload failed: ${err.error ?? res.statusText}`);
          continue;
        }
        const data = await res.json();
        if (data.path) onAdd(data.path);
      }
    } catch (err) {
      console.error(err);
      alert("Photo upload failed.");
    } finally {
      setUploading(false);
      onUploadingChange(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="border-t border-black/10 pt-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
          Studio photos ({photos.length})
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 border border-black/40 px-4 py-2 text-xs text-[#11100e] transition hover:bg-black/5 disabled:opacity-50"
        >
          <Plus size={14} />
          {uploading ? "Uploading..." : "Add photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_MIME.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleAdd(e.target.files)}
        />
      </div>

      {photos.length === 0 ? (
        <p className="mt-3 text-sm text-[#6f6a61]">No studio photos yet.</p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {photos.map((path, index) => (
            <div
              key={`${path}-${index}`}
              className="group relative aspect-square overflow-hidden border border-black/10 bg-[#e2ded4]"
            >
              <img src={path} alt="Studio" className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 bg-black/60 px-1 text-[10px] text-white">
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute right-1 top-1 grid size-6 place-items-center bg-black/60 text-white transition hover:bg-red-600"
                aria-label="Remove photo"
                title="Remove photo"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
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
          required={required}
        />
      ) : (
        <input
          id={id}
          className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      )}
    </label>
  );
}
