"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, LogOut } from "lucide-react";
import { EventAccordion } from "@/components/admin/event-accordion";
import { Panel, Grid, Field } from "@/components/admin/admin-fields";
import type { Event } from "@/lib/types";
import type { VersionedSiteData } from "@/lib/site-data";
import {
  deleteSingleEvent,
  logoutAdmin,
  saveAdminData,
  setSingleEventFeatured,
} from "@/app/admin/actions";

type Tab = "settings" | "events";

const tabs: [Tab, string][] = [
  ["settings", "Settings"],
  ["events", "Events"],
];

export function AdminDashboard({
  initialData,
  saved,
  saveError,
}: {
  initialData: VersionedSiteData;
  saved?: boolean;
  saveError?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("settings");
  const [draftData, setDraftData] = useState(initialData);
  const data = draftData.revision === initialData.revision ? draftData : initialData;

  function updateData(updater: (current: VersionedSiteData) => VersionedSiteData) {
    setDraftData((current) =>
      updater(current.revision === initialData.revision ? current : initialData)
    );
  }

  function updateEvents(fn: (prev: Event[]) => Event[]) {
    updateData((prev) => ({ ...prev, events: fn(prev.events) }));
  }

  function handleImageChange(eventIndex: number, path: string) {
    updateData((prev) => ({
      ...prev,
      events: prev.events.map((ev, i) => i === eventIndex ? { ...ev, image: path } : ev),
    }));
  }

  function deleteEvent(event: Event) {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    void deleteSingleEvent(event.slug, data.revision, [event.image, event.video, ...(event.gallery ?? [])]);
  }

  function addNewEvent() {
    const newEvent: Event = {
      slug: `event-${crypto.randomUUID()}`, title: "", status: "Upcoming", date: "", image: "",
      heroTransform: "translate(0px, 0px) scale(1)", thumbTransform: "translate(0px, 0px) scale(1)",
      detailTransform: "translate(0px, 0px) scale(1)", featured: false, description: "", gallery: [], video: "",
    };
    updateData((prev) => ({ ...prev, events: [...prev.events, newEvent] }));
    setTab("events");
  }

  function toggleFeatured(index: number, currentFeatured: boolean) {
    const newFeatured = !currentFeatured;
    const event = data.events[index];
    if (!event) return;
    updateData((prev) => ({
      ...prev,
      events: prev.events.map((ev, i) => i === index ? { ...ev, featured: newFeatured } : ev),
    }));
    void setSingleEventFeatured(event.slug, newFeatured, data.revision);
  }

  const dataPayload = useMemo(() => {
    return JSON.stringify({ settings: data.settings, about: data.about });
  }, [data.settings, data.about]);

  return (
    <main className="min-h-screen bg-[#f4f1ea]">
      <header className="border-b border-black/10 bg-[#11100e] py-5 text-[#f4f1ea]">
        <div className="room-shell flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-kicker text-white/50">ROOM</p>
            <h1 className="room-serif text-4xl">Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/artists" className="border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Artists</Link>
            <Link href="/admin/artworks" className="border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Artworks</Link>
            <form action={logoutAdmin}>
              <button type="submit" className="inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]"><LogOut size={14} /> Logout</button>
            </form>
          </div>
        </div>
      </header>

      <div className="room-shell py-8">
        {saved ? <div className="mb-6 inline-flex items-center gap-2 border border-black/10 bg-white/50 px-4 py-3 text-sm"><Check size={14} className="text-green-600" /> Saved.</div> : null}
        {saveError ? <div className="mb-6 inline-flex items-start gap-2 border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm text-red-800"><span className="mt-0.5 shrink-0">⚠</span> {saveError}</div> : null}

        <div className="mb-6 flex gap-2">
          {tabs.map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition ${tab === key ? "bg-[#11100e] text-[#f4f1ea]" : "border border-black/14 text-[#6f6a61] hover:bg-black/5"}`}>{label}</button>
          ))}
          <button type="button" onClick={addNewEvent} className="ml-auto inline-flex items-center gap-2 border border-black/14 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]">+ Add event</button>
        </div>

        {tab === "settings" ? (
          <form action={saveAdminData}>
            <input type="hidden" name="payload" value={dataPayload} readOnly />
            <input type="hidden" name="revision" value={data.revision} readOnly />
            <Panel title="Settings">
              <Grid>
                <Field required label="WhatsApp Number" value={data.settings.whatsappNumber} onChange={(v) => updateData((prev) => ({ ...prev, settings: { ...prev.settings, whatsappNumber: v } }))} />
                <Field required type="email" label="Email" value={data.settings.email} onChange={(v) => updateData((prev) => ({ ...prev, settings: { ...prev.settings, email: v } }))} />
                <Field required label="Phone" value={data.settings.phone} onChange={(v) => updateData((prev) => ({ ...prev, settings: { ...prev.settings, phone: v } }))} />
                <Field required label="Address" value={data.settings.address} onChange={(v) => updateData((prev) => ({ ...prev, settings: { ...prev.settings, address: v } }))} />
              </Grid>
              <Field required type="url" label="Instagram URL" value={data.settings.instagram} onChange={(v) => updateData((prev) => ({ ...prev, settings: { ...prev.settings, instagram: v } }))} />
            </Panel>
            <Panel title="About">
              <Field required multiline label="Concept" value={data.about.concept} onChange={(v) => updateData((prev) => ({ ...prev, about: { ...prev.about, concept: v } }))} />
              <Field required multiline label="Vision" value={data.about.vision} onChange={(v) => updateData((prev) => ({ ...prev, about: { ...prev.about, vision: v } }))} />
              <Field required multiline label="Identity" value={data.about.identity} onChange={(v) => updateData((prev) => ({ ...prev, about: { ...prev.about, identity: v } }))} />
            </Panel>
            <div className="mt-6">
              <button type="submit" className="inline-flex items-center gap-2 bg-[#11100e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea]">Save settings</button>
            </div>
          </form>
        ) : null}

        {tab === "events" ? (
          <div className="space-y-4">
            {data.events.length === 0 ? <p className="text-sm text-[#6f6a61]">No events yet. Click &quot;+ Add event&quot; to create one.</p> : null}
            {data.events.map((event, i) => (
              <EventAccordion key={event.slug} event={event} eventIndex={i} revision={data.revision} updateEvents={updateEvents} deleteEvent={deleteEvent} toggleFeatured={toggleFeatured} handleImageChange={handleImageChange} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
