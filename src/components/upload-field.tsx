"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

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

  function validate(file: File): string | null {
    if (!ALLOWED_MIME.includes(file.type)) {
      return `File type "${file.type}" is not allowed. Allowed: ${ALLOWED_MIME.join(", ")}`;
    }
    if (file.size > MAX_SIZE) {
      return `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the 20MB limit.`;
    }
    return null;
  }

  async function deleteUpload(path: string) {
    if (!path || !path.startsWith("/uploads/")) return;
    try {
      await fetch(`/api/upload?path=${encodeURIComponent(path)}`, { method: "DELETE" });
    } catch {
      // ignore delete errors
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validate(file);
    if (error) {
      alert(error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

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
        const oldPath = value;
        onChange(data.path);
        if (oldPath && oldPath !== data.path) {
          await deleteUpload(oldPath);
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed due to a network error.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!value) {
      onChange("");
      return;
    }
    await deleteUpload(value);
    onChange("");
  }

  const isImage = value && ALLOWED_MIME.some((type) => value.toLowerCase().endsWith(`.${type.split("/")[1]}`));

  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
      {label}
      <div className="mt-2 flex flex-col gap-3">
        <div className="flex items-center gap-3">
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
          <input ref={inputRef} type="file" accept={ALLOWED_MIME.join(",")} className="hidden" onChange={handleFile} />
        </div>
        {value && isImage ? (
          <div className="relative h-40 w-fit max-w-full overflow-hidden border border-black/10 bg-[#e2ded4]">
            <img
              src={value}
              alt="Preview"
              className="h-full w-auto object-contain"
            />
          </div>
        ) : null}
      </div>
    </label>
  );
}
