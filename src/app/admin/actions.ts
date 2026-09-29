"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { timingSafeEqual } from "crypto";
import { adminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { getSiteData, saveSiteData, SiteDataValidationError } from "@/lib/site-data";
import type { Artist, Artwork, Event, SiteData } from "@/lib/types";

const UPLOADS_ROOT = path.resolve(process.cwd(), "public", "uploads");
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
const failedLogins = new Map<string, { count: number; resetAt: number }>();

function isUnderUploads(filePath: string): boolean {
  if (!filePath || !filePath.startsWith("/uploads/")) return false;
  const normalized = filePath.replace(/^\//, "").replace(/\//g, path.sep);
  const resolved = path.resolve(process.cwd(), "public", normalized);
  return resolved.startsWith(UPLOADS_ROOT + path.sep);
}

async function tryDeleteFile(filePath: string) {
  if (!isUnderUploads(filePath)) return;
  try {
    const normalized = filePath.replace(/^\//, "").replace(/\//g, path.sep);
    const fullPath = path.resolve(process.cwd(), "public", normalized);
    await fs.unlink(fullPath);
  } catch {
    // file doesn't exist or can't be deleted — ignore
  }
}

function collectMediaPaths(data: SiteData): Set<string> {
  const paths = new Set<string>();
  const add = (value: string | undefined) => {
    if (value && isUnderUploads(value)) paths.add(value);
  };

  for (const artist of data.artists) {
    add(artist.portrait);
    artist.photos.forEach(add);
  }
  for (const artwork of data.artworks) add(artwork.image);
  for (const event of data.events) {
    add(event.image);
    add(event.video);
    event.gallery.forEach(add);
  }
  return paths;
}

async function cleanupRemovedMedia(
  previous: SiteData,
  additionalCandidates: string[] = []
) {
  const previousPaths = collectMediaPaths(previous);
  // Read after the DB write: another admin session may have referenced a file
  // between this action's save and its filesystem cleanup.
  const latest = await getSiteData();
  const remainingPaths = collectMediaPaths(latest);
  const candidates = new Set([
    ...Array.from(previousPaths).filter((filePath) => !remainingPaths.has(filePath)),
    ...additionalCandidates.filter(isUnderUploads),
  ]);

  for (const filePath of candidates) {
    if (!remainingPaths.has(filePath)) await tryDeleteFile(filePath);
  }
}

function parsePendingDeletions(raw: string): string[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new Error("Invalid pending media list");
  }
  return parsed.filter(isUnderUploads);
}

function parseRevision(value: FormDataEntryValue | number | null): number {
  const revision = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(revision) || revision < 0) {
    throw new SiteDataValidationError(["Missing or invalid data revision. Reload the page and try again."]);
  }
  return revision;
}

function loginIsLimited(clientIp: string): boolean {
  const now = Date.now();
  for (const [key, attempt] of failedLogins) {
    if (attempt.resetAt <= now) failedLogins.delete(key);
  }
  return (failedLogins.get(clientIp)?.count ?? 0) >= LOGIN_MAX_FAILURES;
}

function recordFailedLogin(clientIp: string) {
  const now = Date.now();
  if (failedLogins.size >= 1000 && !failedLogins.has(clientIp)) {
    const oldestKey = failedLogins.keys().next().value;
    if (oldestKey) failedLogins.delete(oldestKey);
  }
  const current = failedLogins.get(clientIp);
  if (!current || current.resetAt <= now) {
    failedLogins.set(clientIp, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    current.count += 1;
  }
}

export async function loginAdmin(formData: FormData) {
  const requestHeaders = await headers();
  const clientIp = requestHeaders.get("x-real-ip")?.trim()
    || requestHeaders.get("x-forwarded-for")?.split(",").at(-1)?.trim()
    || "unknown";
  if (loginIsLimited(clientIp)) redirect("/admin?error=1");

  const password = String(formData.get("password") ?? "");
  const expectedPassword = Buffer.from(adminPassword());
  const submittedPassword = Buffer.from(password);
  const validPassword = submittedPassword.length === expectedPassword.length
    && timingSafeEqual(submittedPassword, expectedPassword);
  if (!validPassword) {
    recordFailedLogin(clientIp);
    redirect("/admin?error=1");
  }
  failedLogins.delete(clientIp);
  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin");
}

export async function saveAdminData(formData: FormData) {
  if (!(await isAdmin())) {
    redirect("/admin");
  }
  const payload = String(formData.get("payload") ?? "");
  try {
    const incoming = JSON.parse(payload);
    const expectedRevision = parseRevision(formData.get("revision"));
    const current = await getSiteData();
    const merged = {
      revision: expectedRevision,
      settings: incoming.settings,
      about: incoming.about,
      events: current.events,
      artists: current.artists,
      artworks: current.artworks,
    };
    await saveSiteData(merged);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(
        `/admin?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`
      );
    }
    redirect("/admin?error=json");
  }
  revalidatePath("/");
  revalidatePath("/artists");
  revalidatePath("/gallery");
  revalidatePath("/events");
  revalidatePath("/events/[slug]", "page");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function saveArtist(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const slug = String(formData.get("slug") ?? "");
  const payload = String(formData.get("payload") ?? "");
  const pendingDeletionsRaw = String(formData.get("pendingDeletions") ?? "[]");

  let parsed: Artist;
  let pendingDeletions: string[];
  let expectedRevision: number;
  let data;
  try {
    parsed = JSON.parse(payload);
    expectedRevision = parseRevision(formData.get("revision"));
    pendingDeletions = parsePendingDeletions(pendingDeletionsRaw);
    data = await getSiteData();
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artists/${slug}?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect(`/admin/artists/${slug}?error=json`);
    return;
  }

  const previous = structuredClone(data);
  data.revision = expectedRevision;
  const index = data.artists.findIndex((a) => a.slug === slug);
  if (index === -1) redirect("/admin/artists?error=notfound");
  const existing = data.artists[index];
  if (parsed.slug !== existing.slug) {
    data.artworks = data.artworks.map((aw) =>
      aw.artistSlug === existing.slug ? { ...aw, artistSlug: parsed.slug } : aw
    );
  }
  data.artists[index] = parsed;

  try {
    await saveSiteData(data);
    await cleanupRemovedMedia(previous, pendingDeletions);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artists/${slug}?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect(`/admin/artists/${slug}?error=json`);
    return;
  }

  revalidatePath("/artists");
  revalidatePath("/artists/[slug]", "page");
  revalidatePath("/gallery");
  revalidatePath("/gallery/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/artists");
  redirect("/admin/artists?saved=1");
}

export async function createArtist(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const payload = String(formData.get("payload") ?? "");

  let artist: Artist;
  let expectedRevision: number;
  let data;
  try {
    artist = JSON.parse(payload);
    expectedRevision = parseRevision(formData.get("revision"));
    data = await getSiteData();
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artists/new?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artists/new?error=json");
    return;
  }

  const previous = structuredClone(data);
  data.revision = expectedRevision;
  data.artists.unshift(artist);

  try {
    await saveSiteData(data);
    await cleanupRemovedMedia(previous);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artists/new?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artists/new?error=json");
    return;
  }

  revalidatePath("/artists");
  revalidatePath("/artists/[slug]", "page");
  revalidatePath("/gallery");
  revalidatePath("/gallery/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/artists");
  redirect("/admin/artists?saved=1");
}

export async function deleteArtist(slug: string, revision: number) {
  if (!(await isAdmin())) redirect("/admin");
  const current = await getSiteData();
  const previous = structuredClone(current);
  const data = structuredClone(current);
  data.revision = parseRevision(revision);
  data.artists = data.artists.filter((a) => a.slug !== slug);
  data.artworks = data.artworks.filter((aw) => aw.artistSlug !== slug);
  try {
    await saveSiteData(data);
    await cleanupRemovedMedia(previous);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artists?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artists?error=json");
    return;
  }
  revalidatePath("/artists");
  revalidatePath("/artists/[slug]", "page");
  revalidatePath("/gallery");
  revalidatePath("/gallery/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/artists");
  redirect("/admin/artists");
}

export async function saveArtwork(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const slug = String(formData.get("slug") ?? "");
  const payload = String(formData.get("payload") ?? "");
  const pendingDeletionsRaw = String(formData.get("pendingDeletions") ?? "[]");

  let artwork: Artwork;
  let pendingDeletions: string[];
  let expectedRevision: number;
  let data;
  try {
    artwork = JSON.parse(payload);
    expectedRevision = parseRevision(formData.get("revision"));
    pendingDeletions = parsePendingDeletions(pendingDeletionsRaw);
    data = await getSiteData();
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artworks/${slug}?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect(`/admin/artworks/${slug}?error=json`);
    return;
  }

  if (!data.artists.some((a) => a.slug === artwork.artistSlug)) {
    redirect(`/admin/artworks/${slug}?error=validation&details=${encodeURIComponent(`Artist with slug "${artwork.artistSlug}" does not exist`)}`);
  }
  const index = data.artworks.findIndex((a) => a.slug === slug);
  if (index === -1) redirect("/admin/artworks?error=notfound");
  const previous = structuredClone(data);
  data.revision = expectedRevision;
  data.artworks[index] = artwork;

  try {
    await saveSiteData(data);
    await cleanupRemovedMedia(previous, pendingDeletions);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artworks/${slug}?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect(`/admin/artworks/${slug}?error=json`);
    return;
  }

  revalidatePath("/artists");
  revalidatePath("/artists/[slug]", "page");
  revalidatePath("/gallery");
  revalidatePath("/gallery/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/artworks");
  redirect("/admin/artworks?saved=1");
}

export async function createArtwork(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const payload = String(formData.get("payload") ?? "");

  let artwork: Artwork;
  let expectedRevision: number;
  let data;
  try {
    artwork = JSON.parse(payload);
    expectedRevision = parseRevision(formData.get("revision"));
    data = await getSiteData();
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artworks/new?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artworks/new?error=json");
    return;
  }

  if (!data.artists.some((a) => a.slug === artwork.artistSlug)) {
    redirect(`/admin/artworks/new?error=validation&details=${encodeURIComponent(`Artist with slug "${artwork.artistSlug}" does not exist`)}`);
  }
  const previous = structuredClone(data);
  data.revision = expectedRevision;
  data.artworks.unshift(artwork);

  try {
    await saveSiteData(data);
    await cleanupRemovedMedia(previous);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artworks/new?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artworks/new?error=json");
    return;
  }

  revalidatePath("/artists");
  revalidatePath("/artists/[slug]", "page");
  revalidatePath("/gallery");
  revalidatePath("/gallery/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/artworks");
  redirect("/admin/artworks?saved=1");
}

export async function deleteArtwork(slug: string, revision: number) {
  if (!(await isAdmin())) redirect("/admin");
  const current = await getSiteData();
  const previous = structuredClone(current);
  const data = structuredClone(current);
  data.revision = parseRevision(revision);
  data.artworks = data.artworks.filter((a) => a.slug !== slug);
  try {
    await saveSiteData(data);
    await cleanupRemovedMedia(previous);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artworks?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artworks?error=json");
    return;
  }
  revalidatePath("/artists");
  revalidatePath("/artists/[slug]", "page");
  revalidatePath("/gallery");
  revalidatePath("/gallery/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/artworks");
  redirect("/admin/artworks");
}

export async function saveSingleEvent(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const slug = String(formData.get("slug") ?? "");
  const payload = String(formData.get("payload") ?? "");
  const pendingDeletionsRaw = String(formData.get("pendingDeletions") ?? "[]");

  let event: Event;
  let pendingDeletions: string[];
  let expectedRevision: number;
  let data;
  try {
    event = JSON.parse(payload) as Event;
    expectedRevision = parseRevision(formData.get("revision"));
    pendingDeletions = parsePendingDeletions(pendingDeletionsRaw);
    data = await getSiteData();
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin?error=json");
    return;
  }

  const previous = structuredClone(data);
  data.revision = expectedRevision;
  const index = data.events.findIndex((e) => e.slug === slug);

  if (index === -1) {
    // New event — add to the list
    data.events.push(event);
  } else {
    // Existing event — update
    data.events[index] = event;
  }

  try {
    await saveSiteData(data);
    await cleanupRemovedMedia(previous, pendingDeletions);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin?error=json");
    return;
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/events/[slug]", "page");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function deleteSingleEvent(
  slug: string,
  revision: number,
  candidateMedia: string[] = []
) {
  if (!(await isAdmin())) redirect("/admin");
  const current = await getSiteData();
  const previous = structuredClone(current);
  const data = structuredClone(current);
  data.revision = parseRevision(revision);
  data.events = data.events.filter((event) => event.slug !== slug);

  try {
    await saveSiteData(data);
    const safeCandidates = Array.isArray(candidateMedia)
      ? candidateMedia.filter((item): item is string => typeof item === "string")
      : [];
    await cleanupRemovedMedia(previous, safeCandidates);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin?error=json");
    return;
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/events/[slug]", "page");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function setSingleEventFeatured(slug: string, featured: boolean, revision: number) {
  if (!(await isAdmin())) redirect("/admin");
  const current = await getSiteData();
  const data = structuredClone(current);
  data.revision = parseRevision(revision);
  const event = data.events.find((item) => item.slug === slug);
  if (!event) redirect("/admin?error=notfound");
  event.featured = featured;

  try {
    await saveSiteData(data);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin?error=json");
    return;
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}
