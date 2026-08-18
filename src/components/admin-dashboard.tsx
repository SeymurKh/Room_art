"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Check, LogOut, Save, Star, Trash2 } from "lucide-react";
import { UploadField } from "@/components/upload-field";
import { PositionedImage, buildTransform } from "@/components/positioned-image";
import { EventMediaManager } from "@/components/event-media-manager";
import { STRIPES } from "@/components/events-scrolltelling";
import type { SiteData, Event } from "@/lib/types";
import { logoutAdmin, saveAdminData } from "@/app/admin/actions";

type Tab = "settings" | "about" | "events";
type PreviewKey = "hero" | "thumb" | "detail";

const tabs: [Tab, string][] = [
  ["settings", "Settings"],
  ["about", "About"],
  ["events", "Events"],
];

function getHeroClipPath(status: Event["status"]): string {
  const stripe = STRIPES.find((s) => s.key === status);
  return stripe?.clipPath ?? STRIPES[0].clipPath;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function PreviewBlock({
  label,
  event,
  index,
  updateEvents,
  previewKey,
  containerClassName,
  containerStyle,
  dimmed = false,
}: {
  label: string;
  event: Event;
  index: number;
  updateEvents: (fn: (prev: Event[]) => Event[]) => void;
  previewKey: PreviewKey;
  containerClassName: string;
  containerStyle?: React.CSSProperties;
  dimmed?: boolean;
}) {
  const field = `${previewKey}Transform` as keyof Event;
  const transform = (event[field] as string) ?? "translate(0px, 0px) scale(1)";
  const parsed = (() => {
    const m = transform.match(/translate\(([^)]+)\)\s*scale\(([^)]+)\)/);
    if (!m) return { tx: 0, ty: 0, scale: 1 };
    const [x, y] = m[1].split(/,\s*/);
    return {
      tx: parseFloat(x) || 0,
      ty: parseFloat(y) || 0,
      scale: parseFloat(m[2]) ?? 1,
    };
  })();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  function saveTransform(tx: number, ty: number, scale: number) {
    const value = buildTransform(tx, ty, scale);
    updateEvents((prev) =>
      prev.map((ev, i) => (i === index ? { ...ev, [field]: value } : ev))
    );
  }

  function handleReset() {
    saveTransform(0, 0, 1);
  }

  function handlePointerDown(clientX: number, clientY: number) {
    lastMouseRef.current = { x: clientX, y: clientY };
  }

  function handlePointerMove(clientX: number, clientY: number) {
    const dx = clientX - lastMouseRef.current.x;
    const dy = clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: clientX, y: clientY };
    saveTransform(parsed.tx + dx, parsed.ty + dy, parsed.scale);
  }

  return (
    <div className={`flex flex-col gap-2 ${dimmed ? "opacity-40" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6f6a61]">{label}</p>
        <button
          type="button"
          onClick={handleReset}
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-black/20 hover:border-black/40"
        >
          Reset
        </button>
      </div>
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${containerClassName}`}
        style={containerStyle}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          if (e.buttons !== 1) return;
          handlePointerMove(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (!touch) return;
          handlePointerDown(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (!touch) return;
          e.preventDefault();
          handlePointerMove(touch.clientX, touch.clientY);
        }}
      >
        {event.image ? (
          <PositionedImage
            src={event.image}
            alt=""
            transform={transform}
            containerClassName="h-full w-full"
            draggable={false}
            clipPath={containerStyle?.clipPath as string | undefined}
            loading="eager"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#6f6a61]">No image</div>
        )}
      </div>
      <label className="flex items-center gap-2 text-xs text-[#6f6a61]">
        Zoom
        <input
          type="range"
          min="0.3"
          max="3"
          step="0.05"
          value={clamp(parsed.scale, 0.3, 3)}
          onChange={(e) => {
            const s = parseFloat(e.target.value);
            saveTransform(parsed.tx, parsed.ty, s);
          }}
          className="h-4 w-full accent-[#11100e]"
        />
        <span className="w-8 text-right tabular-nums">{parsed.scale.toFixed(2)}x</span>
      </label>
    </div>
  );
}

export function AdminDashboard({ initialData, saved, saveError }: { initialData: SiteData; saved: boolean; saveError?: string | null }) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>("settings");
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const payload = useMemo(() => JSON.stringify({ ...data, __pendingDeletions: pendingDeletions }), [data, pendingDeletions]);

  function update<K extends keyof SiteData>(key: K, value: SiteData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  const updateEvents = useCallback((fn: (prev: Event[]) => Event[]) => {
    setData((prev) => ({ ...prev, events: fn(prev.events) }));
  }, []);

  const scheduleDeletion = useCallback((path: string) => {
    if (!path || !path.startsWith("/uploads/")) return;
    setPendingDeletions((prev) => (prev.includes(path) ? prev : [...prev, path]));
  }, []);

  const deleteEvent = useCallback((event: Event) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    if (event.image && event.image.startsWith("/uploads/")) {
      scheduleDeletion(event.image);
    }
    if (event.video && event.video.startsWith("/uploads/")) {
      scheduleDeletion(event.video);
    }
    (event.gallery ?? []).forEach((p) => {
      if (p.startsWith("/uploads/")) scheduleDeletion(p);
    });
    setData((prev) => ({ ...prev, events: prev.events.filter((e) => e.slug !== event.slug) }));
  }, [scheduleDeletion]);

  const toggleFeatured = useCallback((index: number, currentFeatured: boolean) => {
    setData((prev) => {
      const event = prev.events[index];
      if (!event) return prev;
      const newFeatured = !currentFeatured;
      const updated = prev.events.map((ev, i) => {
        if (newFeatured && i !== index && ev.status === event.status && ev.featured) return { ...ev, featured: false };
        if (i === index) return { ...ev, featured: newFeatured };
        return ev;
      });
      return { ...prev, events: updated };
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f1ea]">
      <header className="border-b border-black/10 bg-[#11100e] py-5 text-[#f4f1ea]">
        <div className="room-shell flex flex-wrap items-center justify-between gap-4">
          <div><p className="section-kicker text-white/50">Single admin panel</p><h1 className="room-serif text-4xl">ROOM Control Room</h1></div>
          <form action={logoutAdmin}><button className="inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]"><LogOut size={16} /> Logout</button></form>
        </div>
      </header>
      <form action={saveAdminData} className="room-shell py-8">
        <input type="hidden" name="payload" value={payload} readOnly />
        <div className="mb-8 border border-black/10 bg-white/36 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="room-serif text-4xl">Artists & Artworks</h2><p className="mt-1 text-sm text-[#6f6a61]">Manage artists and artworks on dedicated pages.</p></div><div className="flex flex-wrap items-center gap-3"><Link href="/admin/artists" className="inline-flex items-center gap-2 bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">Manage Artists →</Link><Link href="/admin/artworks" className="inline-flex items-center gap-2 border border-black/40 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#11100e] transition hover:bg-black/5">Manage Artworks →</Link></div></div>
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">{tabs.map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${tab === id ? "bg-[#11100e] text-[#f4f1ea]" : "border border-black/40 text-[#11100e] transition hover:bg-black/5"}`}>{label}</button>)}</div>
          <button className="inline-flex items-center gap-2 bg-[#11100e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea]"><Save size={16} /> Save changes</button>
        </div>
        {saveError && <div className="mb-6 inline-flex items-start gap-2 border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm text-red-800"><span className="mt-0.5 shrink-0">⚠</span> {saveError}</div>}
        {saved && <div className="mb-6 inline-flex items-center gap-2 border border-black/10 bg-white/50 px-4 py-3 text-sm"><Check size={16} /> Changes saved.</div>}
        {tab === "settings" && <Panel title="Global settings"><Grid>{Object.entries(data.settings).map(([key, value]) => <Field key={key} label={key} value={String(value)} onChange={(next) => update("settings", { ...data.settings, [key]: next })} />)}</Grid></Panel>}
        {tab === "about" && <Panel title="About"><Field multiline label="Concept" value={data.about.concept} onChange={(v) => update("about", { ...data.about, concept: v })} /><Field multiline label="Vision" value={data.about.vision} onChange={(v) => update("about", { ...data.about, vision: v })} /><Field multiline label="Identity" value={data.about.identity} onChange={(v) => update("about", { ...data.about, identity: v })} /></Panel>}
        {tab === "events" && <div>
          <Panel title="Events">
            {data.events.length === 0 ? <p className="py-4 text-sm text-[#6f6a61]">No events yet.</p> : <div className="grid gap-5">{data.events.map((event) => {
              const eventIndex = data.events.findIndex((e) => e.slug === event.slug);
              return (
              <article key={event.slug} className="border border-black/10 bg-[#f4f1ea] p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="room-serif text-3xl">{event.title}</h3>
                    <button type="button" onClick={() => toggleFeatured(eventIndex, event.featured)} className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider border transition ${event.featured ? "bg-yellow-100 border-yellow-400 text-yellow-800" : "border-black/20 text-[#6f6a61] hover:border-black/40"}`} title={event.featured ? "Featured in hero" : "Not in hero"}>
                      <Star size={12} fill={event.featured ? "currentColor" : "none"} />{event.featured ? "Hero ★" : "Feature"}
                    </button>
                  </div>
                  <button type="button" onClick={() => deleteEvent(event)} className="grid size-10 place-items-center border border-black/40 text-[#11100e] transition hover:border-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
                <Grid>{(["title", "status", "date", "image", "description"] as (keyof Event)[]).map((key) => {
                  if (key === "image") return <UploadField key={key} label="Image" value={event.image} onChange={(v) => updateEvents((prev) => prev.map((e, i) => i === eventIndex ? { ...e, image: v } : e))} folder="uploads/events" />;
                  if (key === "status") return <label key={key} className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">Status<select className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]" value={event.status} onChange={(e) => updateEvents((prev) => prev.map((ev, i) => i === eventIndex ? { ...ev, status: e.target.value as Event["status"] } : ev))}><option value="Upcoming">Upcoming</option><option value="Current">Current</option><option value="Past">Past</option></select></label>;
                  return <Field key={key} multiline={key === "description"} label={key} value={String(event[key])} onChange={(v) => updateEvents((prev) => prev.map((ev, i) => i === eventIndex ? { ...ev, [key]: v } : ev))} />;
                })}</Grid>
                <div className="mt-5 border-t border-black/10 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">Image Position & Zoom — drag to move, slider to zoom</p>
                    <Link href="/events" target="_blank" className="text-[10px] uppercase tracking-wider text-[#6f6a61] underline hover:text-[#11100e]">View site →</Link>
                  </div>
                  <div className="grid gap-5 md:grid-cols-3">
                    <PreviewBlock label="Hero" event={event} index={eventIndex} updateEvents={updateEvents} previewKey="hero" containerClassName="h-80 bg-[#11100e]" containerStyle={{ clipPath: getHeroClipPath(event.status) }} dimmed={!event.featured} />
                    <PreviewBlock label="Thumbnail" event={event} index={eventIndex} updateEvents={updateEvents} previewKey="thumb" containerClassName="aspect-4/3 bg-[#ebe7df]" />
                    <PreviewBlock label="Detail" event={event} index={eventIndex} updateEvents={updateEvents} previewKey="detail" containerClassName="aspect-[3/4] bg-black" />
                  </div>
                </div>
                <EventMediaManager
                  photos={event.gallery ?? []}
                  video={event.video ?? ""}
                  onPhotosChange={(photos) => updateEvents((prev) => prev.map((e, i) => i === eventIndex ? { ...e, gallery: photos } : e))}
                  onVideoChange={(video) => updateEvents((prev) => prev.map((e, i) => i === eventIndex ? { ...e, video } : e))}
                  scheduleDeletion={scheduleDeletion}
                />
              </article>
              );
            })}</div>}
            <button type="button" onClick={() => update("events", [...data.events, { slug: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: "New Event", status: "Upcoming", date: "", image: "", heroTransform: "translate(0px, 0px) scale(1)", thumbTransform: "translate(0px, 0px) scale(1)", detailTransform: "translate(0px, 0px) scale(1)", featured: false, description: "", gallery: [], video: "" }])} className="mt-5 inline-flex items-center gap-2 border border-black/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#11100e] transition hover:bg-black/5">+ Add event</button>
          </Panel>
        </div>}
      </form>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="border border-black/10 bg-white/36 p-5 md:p-7"><h2 className="room-serif text-4xl">{title}</h2><div className="mt-6 grid gap-5">{children}</div></section>; }
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 md:grid-cols-2">{children}</div>; }
function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) { return <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">{label}{multiline ? <textarea className="admin-input mt-2 min-h-28 resize-y text-sm normal-case tracking-normal text-[#11100e]" value={value} onChange={e => onChange(e.target.value)} /> : <input className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]" value={value} onChange={e => onChange(e.target.value)} />}</label>; }