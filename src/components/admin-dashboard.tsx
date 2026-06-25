"use client";

import { useMemo, useState } from "react";
import { Check, CopyPlus, LogOut, Save, Trash2 } from "lucide-react";
import type { Artist, Artwork, Exhibition, SiteData } from "@/lib/types";
import { logoutAdmin, saveAdminData } from "@/app/admin/actions";

type Tab = "settings" | "pages" | "artists" | "artworks" | "events" | "json";

const tabs: [Tab, string][] = [
  ["settings", "Settings"],
  ["pages", "Home / About"],
  ["artists", "Artists"],
  ["artworks", "Artworks"],
  ["events", "Events"],
  ["json", "JSON"],
];

export function AdminDashboard({ initialData, saved, saveError }: { initialData: SiteData; saved: boolean; saveError?: string | null }) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>("settings");
  const payload = useMemo(() => JSON.stringify(data), [data]);

  function update<K extends keyof SiteData>(key: K, value: SiteData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(([id, label]) => (
              <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${tab === id ? "bg-[#11100e] text-[#f4f1ea]" : "border border-black/12"}`}>
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

        {tab === "pages" ? (
          <div className="grid gap-6">
            <Panel title="Home">
              <Grid>
                <Field label="Eyebrow" value={data.home.eyebrow} onChange={(value) => update("home", { ...data.home, eyebrow: value })} />
                <Field label="Headline" value={data.home.headline} onChange={(value) => update("home", { ...data.home, headline: value })} />
                <Field label="Hero image path" value={data.home.heroImage} onChange={(value) => update("home", { ...data.home, heroImage: value })} />
                <Field label="Current exhibition slug" value={data.home.currentExhibitionSlug} onChange={(value) => update("home", { ...data.home, currentExhibitionSlug: value })} />
              </Grid>
              <Field multiline label="Intro" value={data.home.intro} onChange={(value) => update("home", { ...data.home, intro: value })} />
            </Panel>
            <Panel title="About">
              <Grid>
                <Field multiline label="Concept" value={data.about.concept} onChange={(value) => update("about", { ...data.about, concept: value })} />
                <Field multiline label="Vision" value={data.about.vision} onChange={(value) => update("about", { ...data.about, vision: value })} />
                <Field multiline label="Identity" value={data.about.identity} onChange={(value) => update("about", { ...data.about, identity: value })} />
                <Field label="Image path" value={data.about.image} onChange={(value) => update("about", { ...data.about, image: value })} />
              </Grid>
            </Panel>
          </div>
        ) : null}

        {tab === "artists" ? (
          <Collection
            title="Artists"
            items={data.artists}
            onAdd={() => update("artists", [...data.artists, { ...data.artists[0], slug: `artist-${data.artists.length + 1}`, name: "New Artist" }])}
            onRemove={(index) => update("artists", data.artists.filter((_, i) => i !== index))}
            render={(artist, index) => (
              <Grid>
                {(["slug", "name", "role", "portrait", "bio", "statement"] as (keyof Artist)[]).map((key) => (
                  <Field key={key} multiline={key === "bio" || key === "statement"} label={key} value={artist[key]} onChange={(value) => updateItem(data.artists, index, { ...artist, [key]: value }, (items) => update("artists", items))} />
                ))}
              </Grid>
            )}
          />
        ) : null}

        {tab === "artworks" ? (
          <Collection
            title="Artworks"
            items={data.artworks}
            onAdd={() => update("artworks", [...data.artworks, { ...data.artworks[0], slug: `artwork-${data.artworks.length + 1}`, title: "New Artwork" }])}
            onRemove={(index) => update("artworks", data.artworks.filter((_, i) => i !== index))}
            render={(artwork, index) => (
              <Grid>
                {(["slug", "title", "artistSlug", "year", "medium", "category", "dimensions", "image", "availability", "description"] as (keyof Artwork)[]).map((key) => (
                  <Field key={key} multiline={key === "description"} label={key} value={artwork[key]} onChange={(value) => updateItem(data.artworks, index, { ...artwork, [key]: value }, (items) => update("artworks", items))} />
                ))}
              </Grid>
            )}
          />
        ) : null}

        {tab === "events" ? (
          <Collection
            title="Exhibitions & events"
            items={data.exhibitions}
            onAdd={() => update("exhibitions", [...data.exhibitions, { ...data.exhibitions[0], slug: `event-${data.exhibitions.length + 1}`, title: "New Event" }])}
            onRemove={(index) => update("exhibitions", data.exhibitions.filter((_, i) => i !== index))}
            render={(event, index) => (
              <Grid>
                {(["slug", "title", "type", "status", "date", "image", "description"] as (keyof Exhibition)[]).map((key) => (
                  <Field key={key} multiline={key === "description"} label={key} value={event[key]} onChange={(value) => updateItem(data.exhibitions, index, { ...event, [key]: value }, (items) => update("exhibitions", items))} />
                ))}
              </Grid>
            )}
          />
        ) : null}

        {tab === "json" ? (
          <Panel title="Raw JSON editor">
            <textarea
              className="admin-input min-h-[620px] font-mono text-xs"
              value={JSON.stringify(data, null, 2)}
              onChange={(event) => {
                try {
                  setData(JSON.parse(event.target.value) as SiteData);
                } catch {
                  event.currentTarget.dataset.invalid = "true";
                }
              }}
            />
          </Panel>
        ) : null}
      </form>
    </main>
  );
}

function updateItem<T>(items: T[], index: number, next: T, commit: (items: T[]) => void) {
  commit(items.map((item, i) => (i === index ? next : item)));
}

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
    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f6a61]">
      {label}
      {multiline ? (
        <textarea className="admin-input mt-2 min-h-28 resize-y text-sm normal-case tracking-normal text-[#11100e]" value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="admin-input mt-2 text-sm normal-case tracking-normal text-[#11100e]" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function Collection<T extends { slug: string; title?: string; name?: string }>({
  title,
  items,
  onAdd,
  onRemove,
  render,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <Panel title={title}>
      <button type="button" onClick={onAdd} className="inline-flex w-fit items-center gap-2 border border-black/14 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">
        <CopyPlus size={16} /> Add item
      </button>
      <div className="grid gap-5">
        {items.map((item, index) => (
          <article key={`${item.slug}-${index}`} className="border border-black/10 bg-[#f4f1ea] p-4">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="room-serif text-3xl">{item.title ?? item.name ?? item.slug}</h3>
              <button type="button" onClick={() => onRemove(index)} className="grid size-10 place-items-center border border-black/12" aria-label="Remove item" title="Remove item">
                <Trash2 size={16} />
              </button>
            </div>
            {render(item, index)}
          </article>
        ))}
      </div>
    </Panel>
  );
}
