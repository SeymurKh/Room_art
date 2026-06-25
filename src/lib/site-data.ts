import { promises as fs } from "fs";
import path from "path";
import { defaultSiteData } from "@/data/defaultSiteData";
import type { SiteData } from "@/lib/types";

const dataFile = path.join(process.cwd(), "data", "site-data.json");

export async function getSiteData(): Promise<SiteData> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw) as SiteData;
  } catch {
    return defaultSiteData;
  }
}

export async function saveSiteData(data: SiteData) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}

export function artistName(data: SiteData, slug: string) {
  return data.artists.find((artist) => artist.slug === slug)?.name ?? "ROOM artist";
}
