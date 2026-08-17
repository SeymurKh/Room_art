"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, Upload, Video } from "lucide-react";

const IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];
const VIDEO_MIME = ["video/mp4", "video/webm"];
const MAX_IMAGE = 100 * 1024 * 1024; // 100 MB
const MAX_VIDEO = 200 * 1024 * 1024; // 200 MB

async function uploadFile(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error ?? res.statusText);
  }
  const data = await res.json();
  return data.path as string;
}

export function EventMediaManager({
  photos,
  video,
  onPhotosChange,
  onVideoChange,
  scheduleDeletion,
}: {
  photos: string[];
  video: string;
  onPhotosChange: (photos: string[]) => void;
  onVideoChange: (video: string) => void;
  scheduleDeletion: (path: string) => void;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  async function handleAddPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    for (const file of list) {
      if (!IMAGE_MIME.includes(file.type)) {
        alert(`File type "${file.type}" is not allowed for photos.`);
        continue;
      }
      if (file.size > MAX_IMAGE) {
        alert(`File "${file.name}" exceeds the 100MB limit.`);
        continue;
      }
    }
    setUploadingPhoto(true);
    try {
      const valid = list.filter(
        (f) => IMAGE_MIME.includes(f.type) && f.size <= MAX_IMAGE
      );
      const paths: string[] = [];
      for (const file of valid) {
        paths.push(await uploadFile(file, "uploads/events"));
      }
      onPhotosChange([...photos, ...paths]);
    } catch (err) {
      console.error(err);
      alert("Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  function removePhoto(path: string) {
    scheduleDeletion(path);
    onPhotosChange(photos.filter((p) => p !== path));
  }

  async function handleVideo(file: File | undefined) {
    if (!file) return;
    if (!VIDEO_MIME.includes(file.type)) {
      alert(`File type "${file.type}" is not allowed for video. Allowed: mp4, webm.`);
      return;
    }
    if (file.size > MAX_VIDEO) {
      alert(`File "${file.name}" exceeds the 200MB limit.`);
      return;
    }
    setUploadingVideo(true);
    try {
      const path = await uploadFile(file, "uploads/events");
      if (video && video !== path) scheduleDeletion(video);
      onVideoChange(path);
    } catch (err) {
      console.error(err);
      alert("Video upload failed.");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  function removeVideo() {
    if (video) scheduleDeletion(video);
    onVideoChange("");
  }

  return (
    <div className="mt-5 grid gap-6 border-t border-black/10 pt-5">
      {/* Video */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
          Video
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploadingVideo}
            className="inline-flex items-center gap-2 border border-black/40 px-4 py-2 text-xs text-[#11100e] transition hover:bg-black/5 disabled:opacity-50"
          >
            <Upload size={14} />
            {uploadingVideo ? "Uploading..." : video ? "Replace video" : "Upload video"}
          </button>
          {video ? (
            <span className="inline-flex items-center gap-2 text-sm text-[#11100e]">
              <Video size={14} className="text-[#6f6a61]" />
              <span className="max-w-[200px] truncate font-mono text-xs text-[#6f6a61]">
                {video}
              </span>
              <button
                type="button"
                onClick={removeVideo}
                className="grid size-6 place-items-center border border-black/40 text-[#11100e] transition hover:border-red-400 hover:text-red-600"
                aria-label="Remove video"
                title="Remove video"
              >
                <Trash2 size={12} />
              </button>
            </span>
          ) : null}
          <input
            ref={videoInputRef}
            type="file"
            accept={VIDEO_MIME.join(",")}
            className="hidden"
            onChange={(e) => handleVideo(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* Photo gallery */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
            Photo gallery ({photos.length})
          </p>
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="inline-flex items-center gap-2 border border-black/40 px-4 py-2 text-xs text-[#11100e] transition hover:bg-black/5 disabled:opacity-50"
          >
            <Plus size={14} />
            {uploadingPhoto ? "Uploading..." : "Add photos"}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept={IMAGE_MIME.join(",")}
            multiple
            className="hidden"
            onChange={(e) => handleAddPhotos(e.target.files)}
          />
        </div>

        {photos.length === 0 ? (
          <p className="mt-3 text-sm text-[#6f6a61]">No photos yet.</p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {photos.map((path, index) => (
              <div
                key={`${path}-${index}`}
                className="group relative aspect-square overflow-hidden border border-black/10 bg-[#e2ded4]"
              >
                <img
                  src={path}
                  alt="Gallery"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-1 top-1 bg-black/60 px-1 text-[10px] text-white">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePhoto(path)}
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
    </div>
  );
}