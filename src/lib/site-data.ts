import { promises as fs } from "fs";
import path from "path";
import { unstable_cache as cache } from "next/cache";
import { revalidatePath } from "next/cache";
import { defaultSiteData } from "@/data/defaultSiteData";
import { siteDataSchema } from "@/lib/site-data-schema";
import type { SiteData } from "@/lib/types";

const dataFile = path.join(process.cwd(), "data", "site-data.json");

const CACHE_TAG = "site-data";

async function readSiteData(): Promise<SiteData> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    const validated = siteDataSchema.parse(parsed);
    return validated as SiteData;
  } catch {
    return defaultSiteData;
  }
}

export const getSiteData = cache(readSiteData, ["site-data"], {
  tags: [CACHE_TAG],
  revalidate: false,
});

export class SiteDataValidationError extends Error {
  public issues: string[];
  constructor(issues: string[]) {
    super("Invalid site data");
    this.name = "SiteDataValidationError";
    this.issues = issues;
  }
}

export async function saveSiteData(data: unknown) {
  const result = siteDataSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    throw new SiteDataValidationError(issues);
  }
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(result.data, null, 2), "utf8");
  revalidatePath("/", "layout");
}

export function artistName(data: SiteData, slug: string) {
  return data.artists.find((artist) => artist.slug === slug)?.name ?? "ROOM artist";
}
