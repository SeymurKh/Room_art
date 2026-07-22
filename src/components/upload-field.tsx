"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

export function UploadField({
  label,
  value,
  onChange,
  folder,
}: {
  label: string;
  value: string;
  onChange: (path: string) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Upload failed" }));
        alert(`Upload failed: ${errData.error ?? res.statusText}`);
        return;
      }
      const data = await res.json();
      if (data.path) {
        onChange(data.path);
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed due to a network error.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!value) {
      onChange("");
      return;
    }
    // Delete file first, then clear path
    try {
      await fetch(`/api/upload?path=${encodeURIComponent(value)}`, { method: "DELETE" });
    } catch {
      // ignore delete errors
    }
    onChange("");
  }

  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
      {label}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 border border-black/40 px-4 py-2 text-xs text-[#11100e] transition hover:bg-black/5 disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
        </button>
        {value ? (
          <span className="flex items-center gap-2 text-sm text-[#11100e]">
            <span className="max-w-[200px] truncate font-mono text-xs text-[#6f6a61]">{value}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="grid size-6 place-items-center border border-black/40 text-[#11100e] transition hover:border-red-400 hover:text-red-600"
              aria-label="Remove file"
              title="Remove file"
            >
              <X size={12} />
            </button>
          </span>
        ) : null}
        <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
      </div>
    </label>
  );
}