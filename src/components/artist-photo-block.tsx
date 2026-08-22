"use client";

import { RoomImage } from "@/components/room-image";

/**
 * ArtistPhotoBlock — блок с фотографиями артиста.
 *
 * Портрет крупно по центру. До 6 студийных фото распределены
 * равномерно по бокам (3 слева, 3 справа). Если фото меньше —
 * распределяются автоматически.
 */
export function ArtistPhotoBlock({
  portrait,
  name,
  photos,
}: {
  portrait: string;
  name: string;
  photos: string[];
}) {
  const hasPhotos = photos.length > 0;

  if (!hasPhotos) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <div className="relative w-full max-w-sm aspect-[3/4] overflow-hidden rounded-2xl bg-black shadow-2xl">
          <RoomImage
            src={portrait}
            alt={name}
            fill
            priority
            className="object-cover"
            fallbackText={name}
          />
        </div>
      </div>
    );
  }

  // Varied aspect ratios for visual interest
  const aspects = ["3/4", "4/3", "1/1", "3/4", "4/3", "1/1"];

  // Split photos evenly: first half left, second half right
  const mid = Math.ceil(photos.length / 2);
  const leftPhotos = photos.slice(0, mid);
  const rightPhotos = photos.slice(mid);

  return (
    <div className="flex items-center justify-center gap-3" style={{ minHeight: "60vh" }}>
      {/* Left column — photos stacked vertically */}
      <div className="flex flex-col gap-3 flex-1 max-w-[28%]">
        {leftPhotos.map((photo, i) => (
          <div key={photo} className="relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: aspects[i] }}>
            <RoomImage src={photo} alt={`${name} — ${i + 1}`} fill className="object-cover" fallbackText="" sizes="20vw" />
          </div>
        ))}
      </div>

      {/* Center — portrait */}
      <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl shrink-0" style={{ width: "44%", aspectRatio: "3/4" }}>
        <RoomImage src={portrait} alt={name} fill priority className="object-cover" fallbackText={name} sizes="40vw" />
      </div>

      {/* Right column — photos stacked vertically */}
      <div className="flex flex-col gap-3 flex-1 max-w-[28%]">
        {rightPhotos.map((photo, i) => (
          <div key={photo} className="relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: aspects[mid + i] }}>
            <RoomImage src={photo} alt={`${name} — ${mid + i + 1}`} fill className="object-cover" fallbackText="" sizes="20vw" />
          </div>
        ))}
      </div>
    </div>
  );
}