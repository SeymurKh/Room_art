import type { MetadataRoute } from "next";

const BASE = "https://roomgallery.art";

/** Пара URL-ов одной страницы в обеих локали + hreflang-альтернативы. */
function entry(
  path: string,
  opts: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: {
      languages: {
        en: `${BASE}${path}`,
        az: `${BASE}/az${path === "/" ? "" : path}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry("/", { changeFrequency: "weekly", priority: 1 }),
    entry("/gallery", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/artists", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/events", { changeFrequency: "weekly", priority: 0.8 }),
    entry("/about", { changeFrequency: "monthly", priority: 0.6 }),
    entry("/contact", { changeFrequency: "monthly", priority: 0.5 }),
  ];
}