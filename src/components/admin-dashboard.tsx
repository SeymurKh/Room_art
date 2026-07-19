"use client";

import { useMemo, useState } from "react";
import { Check, LogOut, Save } from "lucide-react";
import type { SiteData, Exhibition } from "@/lib/types";
import { logoutAdmin, saveAdminData } from "@/app/admin/actions";

type Tab = "settings" | "about" | "events";

const tabs: [Tab, string][] = [
  ["settings", "Settings"],
  ["about", "About"],
  ["events", "Events"],
];

type EventSection = "current" | "upcoming" | "past";

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

  const eventList =
    eventSection === "current" ? currentEvents
    : eventSection === "upcoming" ? upcomingEvents
    : pastEvents;

  return (
    <main className="min-h-screen bg-[#f4f1ea]">
      <header className="border-b border-black/10 bg-[#11100e] py-5 text-[#f4f1ea]">
        <div className="room-shell flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-kicker text-white/50">Single admin panel</p>
            <h1 className="room-serif text-4xl">ROOM Control Room</h1>
          </div>
          <form action={logoutAdmin}>
            <button className="inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">
              <LogOut size={16} /> Logout
            </button>
          </form>
        </div>
      </header>

      <form action={saveAdminData} className="room-shell py-8">
        <input type="hidden" name="payload" value={payload} readOnly />

        <div className="mb-8 border border-black/10 bg-white/36 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="room-serif text-4xl">Artists & Artworks</h2>
              <p className="mt-1 text-sm text-[#6f6a61]">Manage artists and their artworks on a dedicated page.</p>
            </div>
            <a
              href="/admin/artists"
              className="inline-flex items-center gap-2 bg-[#11100e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea]"
            >
              Manage Artists →
            </a>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${
                  tab === id
                    ? "bg-[#11100e] text-[#f4f1ea]"
                    : "border border-black/40 text-[#11100e] transition hover:bg-black/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 bg-[#11100e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea]">
            <Save size={16} /> Save changes
          </button>
        </div>

        {saveError ? (
          <div className="mb-6 inline-flex items-start gap-2 border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm text-red-800">
            <span className="mt-0.5 shrink-0">⚠</span> {saveError}
          </div>
        ) : null}
        {saved ? (
          <div className="mb-6 inline-flex items-center gap-2 border border-black/10 bg-white/50 px-4 py-3 text-sm">
            <Check size={16} /> Changes saved.
          </div>
        ) : null}

        {tab === "settings" ? (
          <Panel title="Global settings">
            <Grid>
              {Object.entries(data.settings).map(([key, value]) => (
                <Field key={key} label={key} value={String(value)} onChange={(next) => update("settings", { ...data.settings, [key]: next })} />
              ))}
            </Grid>
          </Panel>
        ) : null}

        {tab === "about" ? (
          <Panel title="About">
            <Field multiline label="Concept" value={data.about.concept} onChange={(value) => update("about", { ...data.about, concept: value })} />
            <Field multiline label="Vision" value={data.about.vision} onChange={(value) => update("about", { ...data.about, vision: value })} />
            <Field multiline label="Identity" value={data.about.identity} onChange={(value) => update("about", { ...data.about, identity: value })} />
          </Panel>
        ) : null}

        {tab === "events" ? (
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {([
                ["current", `Current (${currentEvents.length})`],
                ["upcoming", `Upcoming (${upcomingEvents.length})`],
                ["past", `Past (${pastEvents.length})`],
              ] as [EventSection, string][]).map(([section, label]) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setEventSection(section)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${
                    eventSection === section
                      ? "bg-[#11100e] text-[#f4f1ea]"
                      : "border border-black/40 text-[#11100e] transition hover:bg-black/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {eventList.length === 0 ? (
              <p className="py-8 text-sm text-[#6f6a61]">No events in this section.</p>
            ) : (
              <Panel title={eventSection.charAt(0).toUpperCase() + eventSection.slice(1)}>
                <div className="grid gap-5">
                  {eventList.map((event, index) => (
                    <article key={event.slug} className="border border-black/10 bg-[#f4f1ea] p-4">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <h3 className="room-serif text-3xl">{event.title}</h3>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete "${event.title}"? This cannot be undone.`)) {
                              update(
                                "exhibitions",
                                data.exhibitions.filter((e) => e.slug !== event.slug)
                              );
                            }
                          }}
                          className="grid size-10 place-items-center border border-black/40 text-[#11100e] transition hover:border-red-400 hover:text-red-600"
                          aria-label={`Delete ${event.title}`}
                          title={`Delete ${event.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <Grid>
                        {(["slug", "title", "type", "status", "date", "image", "description"] as (keyof Exhibition)[]).map((key) => (
                          <Field
                            key={key}
                            multiline={key === "description"}
                            label={key}
                            value={String(event[key])}
                            onChange={(value) => {
                              const updated = data.exhibitions.map((e, i) =>
                                i === index ? { ...e, [key]: value } : e
                              );
                              update("exhibitions", updated);
                            }}
                          />
                        ))}
                      </Grid>
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update("exhibitions", [
                      ...data.exhibitions,
                      {
                        slug: `event-${Date.now()}`,
                        title: "New Event",
                        type: "Exhibition" as const,
                        status: eventSection === "current" ? "Current" : eventSection === "upcoming" ? "Upcoming" : "Past",
                        date: "",
                        image: "",
                        description: "",
                      },
                    ])
                  }
                  className="mt-5 inline-flex items-center gap-2 border border-black/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#11100e] transition hover:bg-black/5"
                >
                  + Add event
                </button>
              </Panel>
            )}
          </div>
        ) : null}
      </form>
    </main>
  );
}

import { Trash2 } from "lucide-react";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-black/10 bg-white/36 p-5 md:p-7">
      <h2 className="room-serif text-4xl">{title}</h2>
      <div className="mt-6 grid gap-5">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
      {label}
      {multiline ? (
        <textarea className="admin-input mt-2 min-h-28 resize-y text-sm normal-case tracking-normal text-[#11100e]" value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}