"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, LogOut, Save } from "lucide-react";
import { UploadField } from "@/components/upload-field";
import type { SiteData, Exhibition } from "@/lib/types";
import { logoutAdmin, saveAdminData } from "@/app/admin/actions";

type Tab = "settings" | "about" | "events";
type EventSection = "current" | "upcoming" | "past";
type PreviewKey = "hero" | "thumb" | "detail";

const tabs: [Tab, string][] = [
  ["settings", "Settings"],
  ["about", "About"],
  ["events", "Events"],
];

/**
 * Parse "translate(Xpx, Ypx) scale(Z)" → { tx, ty, scale }
 */
function parseTransform(t: string): { tx: number; ty: number; scale: number } {
  const m = t.match(/translate\(([^)]+)\)\s*scale\(([^)]+)\)/);
  if (!m) return { tx: 0, ty: 0, scale: 1 };
  const [x, y] = m[1].split(/,\s*/);
  return {
    tx: parseFloat(x) || 0,
    ty: parseFloat(y) || 0,
    scale: parseFloat(m[2]) || 1,
  };
}

/**
 * PreviewBlock — Instagram-style: img in natural size, overflow-hidden container,
 * drag changes translate, slider changes scale. Result stored as "translate(tx px, ty px) scale(s)".
 */
function PreviewBlock({
  label,
  event,
  index,
  data,
  updateExhibitions,
  previewKey,
  containerClassName,
  containerStyle,
  overlay,
}: {
  label: string;
  event: Exhibition;
  index: number;
  data: SiteData;
  updateExhibitions: (u: Exhibition[]) => void;
  previewKey: PreviewKey;
  containerClassName: string;
  containerStyle?: React.CSSProperties;
  overlay?: boolean;
}) {
  const field = `${previewKey}Transform` as keyof Exhibition;
  const transform = (event[field] as string) ?? "translate(0px, 0px) scale(1)";
  const parsed = parseTransform(transform);

  // Refs to accumulate position during drag (avoid stale closure on event prop)
  const txRef = useRef(parsed.tx);
  const tyRef = useRef(parsed.ty);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Sync refs when prop changes externally (e.g. zoom change, or parent re-render from another preview)
  txRef.current = parsed.tx;
  tyRef.current = parsed.ty;

  function saveTransform(tx: number, ty: number, scale: number) {
    const value = `translate(${tx}px, ${ty}px) scale(${scale})`;
    const updated = data.exhibitions.map((ev, i) =>
      i === index ? { ...ev, [field]: value } : ev
    );
    updateExhibitions(updated);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-[#6f6a61]">{label}</p>
      <div
        className={`relative overflow-hidden ${containerClassName}`}
        style={containerStyle}
        onMouseDown={(e) => {
          lastMouseRef.current.x = e.clientX;
          lastMouseRef.current.y = e.clientY;
          txRef.current = parseTransform((event[field] as string) ?? "translate(0px, 0px) scale(1)").tx;
          tyRef.current = parseTransform((event[field] as string) ?? "translate(0px, 0px) scale(1)").ty;
        }}
        onMouseMove={(e) => {
          if (e.buttons !== 1) return;
          const dx = e.clientX - lastMouseRef.current.x;
          const dy = e.clientY - lastMouseRef.current.y;
          lastMouseRef.current.x = e.clientX;
          lastMouseRef.current.y = e.clientY;
          txRef.current += dx;
          tyRef.current += dy;
          saveTransform(txRef.current, tyRef.current, parsed.scale);
        }}
      >
        {event.image ? (
          <img
            src={event.image}
            alt=""
            className="pointer-events-none select-none"
            style={{ width: "auto", height: "auto", maxWidth: "none", transform }}
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#6f6a61]">No image</div>
        )}
        {overlay && event.image && <div className="pointer-events-none absolute inset-0 bg-black/45" />}
      </div>
      <label className="flex items-center gap-2 text-xs text-[#6f6a61]">
        Zoom
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={parsed.scale}
          onChange={(e) => {
            const s = parseFloat(e.target.value);
            saveTransform(txRef.current, tyRef.current, s);
          }}
          className="h-4 w-full accent-[#11100e]"
        />
        <span className="w-8 text-right tabular-nums">{parsed.scale}x</span>
      </label>
    </div>
  );
}

export function AdminDashboard({ initialData, saved, saveError }: { initialData: SiteData; saved: boolean; saveError?: string | null }) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>("settings");
  const [eventSection, setEventSection] = useState<EventSection>("current");
  const payload = useMemo(() => JSON.stringify(data), [data]);

  function update<K extends keyof SiteData>(key: K, value: SiteData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  const currentEvents = data.exhibitions.filter((e) => e.status === "Current");
  const upcomingEvents = data.exhibitions.filter((e) => e.status === "Upcoming");
  const pastEvents = data.exhibitions.filter((e) => e.status === "Past");
  const eventList = eventSection === "current" ? currentEvents : eventSection === "upcoming" ? upcomingEvents : pastEvents;

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
          <div className="flex items-center justify-between gap-4"><div><h2 className="room-serif text-4xl">Artists & Artworks</h2><p className="mt-1 text-sm text-[#6f6a61]">Manage artists and their artworks on a dedicated page.</p></div><Link href="/admin/artists" className="inline-flex items-center gap-2 bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">Manage Artists →</Link></div>
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
          <div className="mb-5 flex flex-wrap gap-2">{([["current", `Current (${currentEvents.length})`], ["upcoming", `Upcoming (${upcomingEvents.length})`], ["past", `Past (${pastEvents.length})`]] as [EventSection, string][]).map(([section, label]) => <button key={section} type="button" onClick={() => setEventSection(section)} className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${eventSection === section ? "bg-[#11100e] text-[#f4f1ea]" : "border border-black/40 text-[#11100e] transition hover:bg-black/5"}`}>{label}</button>)}</div>
          <Panel title={eventSection.charAt(0).toUpperCase() + eventSection.slice(1)}>
            {eventList.length === 0 ? <p className="py-4 text-sm text-[#6f6a61]">No events in this section.</p> : <div className="grid gap-5">{eventList.map((event, index) => (
              <article key={event.slug} className="border border-black/10 bg-[#f4f1ea] p-4">
                <div className="mb-4 flex items-center justify-between gap-4"><h3 className="room-serif text-3xl">{event.title}</h3><button type="button" onClick={() => { if (window.confirm(`Delete "${event.title}"?`)) { if (event.image) fetch(`/api/upload?path=${encodeURIComponent(event.image)}`, { method: "DELETE" }).catch(() => {}); update("exhibitions", data.exhibitions.filter(e => e.slug !== event.slug)); } }} className="grid size-10 place-items-center border border-black/40 text-[#11100e] transition hover:border-red-400 hover:text-red-600"><Trash2 size={16} /></button></div>
                <Grid>{(["title", "type", "status", "date", "image", "description"] as (keyof Exhibition)[]).map((key) => {
                  if (key === "image") return <UploadField key={key} label="Image" value={event.image} onChange={(v) => { const u = data.exhibitions.map((e, i) => i === index ? { ...e, image: v } : e); update("exhibitions", u); }} folder="uploads/events" />;
                  if (key === "type") return <label key={key} className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">Type<select className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]" value={event.type} onChange={(e) => { const u = data.exhibitions.map((ev, i) => i === index ? { ...ev, type: e.target.value as Exhibition["type"] } : ev); update("exhibitions", u); }}><option value="Exhibition">Exhibition</option><option value="Event">Event</option></select></label>;
                  if (key === "status") return <label key={key} className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">Status<select className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]" value={event.status} onChange={(e) => { const u = data.exhibitions.map((ev, i) => i === index ? { ...ev, status: e.target.value as Exhibition["status"] } : ev); update("exhibitions", u); }}><option value="Upcoming">Upcoming</option><option value="Current">Current</option><option value="Past">Past</option></select></label>;
                  return <Field key={key} multiline={key === "description"} label={key} value={String(event[key])} onChange={(v) => { const u = data.exhibitions.map((e, i) => i === index ? { ...e, [key]: v } : e); update("exhibitions", u); }} />;
                })}</Grid>
                <div className="mt-5 border-t border-black/10 pt-5">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">Image Position & Zoom — drag to move, slider to zoom (independent per view)</p>
                  <div className="grid gap-5 md:grid-cols-3">
                    <PreviewBlock label="Hero" event={event} index={index} data={data} updateExhibitions={(u) => update("exhibitions", u)} previewKey="hero" containerClassName="h-36 bg-[#11100e]" containerStyle={{ clipPath: "polygon(0 0, 40% 0, 20% 100%, 0 100%)" }} overlay />
                    <PreviewBlock label="Thumbnail" event={event} index={index} data={data} updateExhibitions={(u) => update("exhibitions", u)} previewKey="thumb" containerClassName="aspect-4/3 bg-[#ebe7df]" />
                    <PreviewBlock label="Detail" event={event} index={index} data={data} updateExhibitions={(u) => update("exhibitions", u)} previewKey="detail" containerClassName="aspect-[3/5] h-64 bg-black" />
                  </div>
                </div>
              </article>
            ))}</div>}
            <button type="button" onClick={() => update("exhibitions", [...data.exhibitions, { slug: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: "New Event", type: "Exhibition" as const, status: eventSection === "current" ? "Current" : eventSection === "upcoming" ? "Upcoming" : "Past", date: "", image: "", heroTransform: "translate(0px, 0px) scale(1)", thumbTransform: "translate(0px, 0px) scale(1)", detailTransform: "translate(0px, 0px) scale(1)", description: "" }])} className="mt-5 inline-flex items-center gap-2 border border-black/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#11100e] transition hover:bg-black/5">+ Add event</button>
          </Panel>
        </div>}
      </form>
    </main>
  );
}

import { Trash2 } from "lucide-react";
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="border border-black/10 bg-white/36 p-5 md:p-7"><h2 className="room-serif text-4xl">{title}</h2><div className="mt-6 grid gap-5">{children}</div></section>; }
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 md:grid-cols-2">{children}</div>; }
function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) { return <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">{label}{multiline ? <textarea className="admin-input mt-2 min-h-28 resize-y text-sm normal-case tracking-normal text-[#11100e]" value={value} onChange={e => onChange(e.target.value)} /> : <input className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]" value={value} onChange={e => onChange(e.target.value)} />}</label>; }