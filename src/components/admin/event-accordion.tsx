"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Save, Star, Trash2 } from "lucide-react";
import { UploadField } from "@/components/upload-field";
import { EventMediaManager } from "@/components/event-media-manager";
import { STRIPES } from "@/components/events-scrolltelling";
import { PreviewBlock } from "@/components/admin/preview-block";
import { Field, Grid } from "@/components/admin/admin-fields";
import { saveSingleEvent } from "@/app/admin/actions";
import type { Event } from "@/lib/types";

function getHeroClipPath(status: Event["status"]): string {
  const stripe = STRIPES.find((s) => s.key === status);
  return stripe?.clipPath ?? STRIPES[0].clipPath;
}

export function EventAccordion({
  event,
  eventIndex,
  updateEvents,
  deleteEvent,
  toggleFeatured,
  handleImageChange,
  scheduleDeletion,
}: {
  event: Event;
  eventIndex: number;
  updateEvents: (fn: (prev: Event[]) => Event[]) => void;
  deleteEvent: (event: Event) => void;
  toggleFeatured: (index: number, currentFeatured: boolean) => void;
  handleImageChange: (eventIndex: number, path: string, pendingDeletion?: string) => void;
  scheduleDeletion: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pendingDels, setPendingDels] = useState<string[]>([]);

  const eventPayload = useMemo(() => JSON.stringify(event), [event]);

  return (
    <div className="border border-black/10 bg-[#f4f1ea]">
      {/* Header — always visible */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex flex-1 items-center gap-3 text-left">
          <span className="text-xs text-[#6f6a61]">{open ? "▼" : "▶"}</span>
          <h3 className="room-serif text-2xl">{event.title}</h3>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6f6a61]">{event.status}</span>
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => toggleFeatured(eventIndex, event.featured)} className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider border transition ${event.featured ? "bg-yellow-100 border-yellow-400 text-yellow-800" : "border-black/20 text-[#6f6a61] hover:border-black/40"}`} title={event.featured ? "Featured in hero" : "Not in hero"}>
            <Star size={12} fill={event.featured ? "currentColor" : "none"} />{event.featured ? "Hero ★" : "Feature"}
          </button>
          <button type="button" onClick={() => deleteEvent(event)} className="grid size-8 place-items-center border border-black/40 text-[#11100e] transition hover:border-red-400 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Expanded content */}
      {open ? (
        <div className="border-t border-black/10 px-4 pb-4 pt-4">
          <form action={saveSingleEvent}>
            <input type="hidden" name="slug" value={event.slug} />
            <input type="hidden" name="payload" value={eventPayload} readOnly />
            <input type="hidden" name="pendingDeletions" value={JSON.stringify(pendingDels)} />
            <Grid>
              <Field label="Title" value={event.title} onChange={(v) => updateEvents((prev) => prev.map((ev, i) => i === eventIndex ? { ...ev, title: v } : ev))} />
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">Status<select className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]" value={event.status} onChange={(e) => updateEvents((prev) => prev.map((ev, i) => i === eventIndex ? { ...ev, status: e.target.value as Event["status"] } : ev))}><option value="Upcoming">Upcoming</option><option value="Current">Current</option><option value="Past">Past</option></select></label>
              <Field label="Date" value={event.date} onChange={(v) => updateEvents((prev) => prev.map((ev, i) => i === eventIndex ? { ...ev, date: v } : ev))} />
              <UploadField label="Image" value={event.image} onChange={(v, pending) => { handleImageChange(eventIndex, v, pending); if (pending) setPendingDels((prev) => [...prev, pending]); }} folder="uploads/events" />
            </Grid>
            <Field multiline label="Description" value={event.description} onChange={(v) => updateEvents((prev) => prev.map((ev, i) => i === eventIndex ? { ...ev, description: v } : ev))} />

            <div className="mt-4 border-t border-black/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">Image Position & Zoom</p>
                <Link href="/events" target="_blank" className="text-[10px] uppercase tracking-wider text-[#6f6a61] underline hover:text-[#11100e]">View site →</Link>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <PreviewBlock label="Hero" event={event} index={eventIndex} updateEvents={updateEvents} previewKey="hero" containerClassName="h-64 bg-[#11100e] rounded-xl" containerStyle={{ clipPath: getHeroClipPath(event.status) }} />
                <PreviewBlock label="Thumbnail" event={event} index={eventIndex} updateEvents={updateEvents} previewKey="thumb" containerClassName="aspect-3/2 max-w-sm bg-[#e2ded4] rounded-xl" imageMode="contain" />
              </div>
            </div>

            <EventMediaManager
              photos={event.gallery ?? []}
              video={event.video ?? ""}
              onPhotosChange={(photos) => updateEvents((prev) => prev.map((e, i) => i === eventIndex ? { ...e, gallery: photos } : e))}
              onVideoChange={(video) => updateEvents((prev) => prev.map((e, i) => i === eventIndex ? { ...e, video } : e))}
              scheduleDeletion={scheduleDeletion}
            />

            <div className="mt-4 flex justify-end">
              <button type="submit" className="inline-flex items-center gap-2 bg-[#11100e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea]"><Save size={16} /> Save event</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}