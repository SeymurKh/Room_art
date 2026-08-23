"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { adminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { getSiteData, saveSiteData, SiteDataValidationError } from "@/lib/site-data";
import type { Artist, Artwork, Event } from "@/lib/types";

const UPLOADS_ROOT = path.resolve(process.cwd(), "public", "uploads");

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

function findRemovedImages(current: { image?: string }[], incoming: { image?: string }[]): string[] {
  const currentImages = new Set(current.map((item) => item.image).filter(Boolean));
  const incomingImages = new Set(incoming.map((item) => item.image).filter(Boolean));
  return Array.from(currentImages).filter((img): img is string => !!img && !incomingImages.has(img) && img.startsWith("/uploads/"));
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password !== adminPassword()) {
    redirect("/admin?error=1");
  }
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
    const current = await getSiteData();

    // Delete images removed from events (including deleted events and replaced images)
    const removedEventImages = findRemovedImages(current.events, incoming.events ?? []);
    const pendingDeletions: string[] = Array.isArray(incoming.__pendingDeletions) ? incoming.__pendingDeletions : [];
    const imagesToDelete = new Set([...removedEventImages, ...pendingDeletions]);

    // Dashboard only edits settings/about/events — preserve current artists/artworks
    // to prevent data loss when editing artist/artwork in another tab.
    const merged = {
      ...incoming,
      artists: current.artists,
      artworks: current.artworks,
    };
    delete (merged as { __pendingDeletions?: string[] }).__pendingDeletions;

    await saveSiteData(merged);

    for (const img of imagesToDelete) {
      await tryDeleteFile(img);
    }
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
  let data;
  try {
    parsed = JSON.parse(payload);
    pendingDeletions = JSON.parse(pendingDeletionsRaw);
    data = await getSiteData();
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artists/${slug}?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect(`/admin/artists/${slug}?error=json`);
    return;
  }

  const index = data.artists.findIndex((a) => a.slug === slug);
  if (index === -1) redirect("/admin/artists?error=notfound");
  const existing = data.artists[index];
  if (parsed.portrait !== existing.portrait) {
    const oldPortrait = pendingDeletions.find((p) => p === existing.portrait) ?? existing.portrait;
    await tryDeleteFile(oldPortrait);
  }
  for (const p of pendingDeletions) {
    await tryDeleteFile(p);
  }
  if (parsed.slug !== existing.slug) {
    data.artworks = data.artworks.map((aw) =>
      aw.artistSlug === existing.slug ? { ...aw, artistSlug: parsed.slug } : aw
    );
  }
  data.artists[index] = parsed;

  try {
    await saveSiteData(data);
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
  revalidatePath("/admin");
  revalidatePath("/admin/artists");
  redirect("/admin/artists?saved=1");
}

export async function createArtist(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const payload = String(formData.get("payload") ?? "");

  let artist: Artist;
  let data;
  try {
    artist = JSON.parse(payload);
    data = await getSiteData();
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artists/new?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artists/new?error=json");
    return;
  }

  data.artists.unshift(artist);

  try {
    await saveSiteData(data);
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
  revalidatePath("/admin");
  revalidatePath("/admin/artists");
  redirect("/admin/artists?saved=1");
}

export async function deleteArtist(slug: string) {
  if (!(await isAdmin())) redirect("/admin");
  const data = await getSiteData();
  const artist = data.artists.find((a) => a.slug === slug);
  if (artist?.portrait) await tryDeleteFile(artist.portrait);
  // Delete all artworks belonging to this artist (and their image files)
  const artistArtworks = data.artworks.filter((aw) => aw.artistSlug === slug);
  for (const aw of artistArtworks) {
    if (aw.image) await tryDeleteFile(aw.image);
  }
  data.artists = data.artists.filter((a) => a.slug !== slug);
  data.artworks = data.artworks.filter((aw) => aw.artistSlug !== slug);
  await saveSiteData(data);
  revalidatePath("/artists");
  revalidatePath("/gallery");
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
  let data;
  try {
    artwork = JSON.parse(payload);
    pendingDeletions = JSON.parse(pendingDeletionsRaw);
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
  const existing = data.artworks[index];
  if (artwork.image !== existing.image) {
    const oldImage = pendingDeletions.find((p) => p === existing.image) ?? existing.image;
    await tryDeleteFile(oldImage);
  }
  for (const p of pendingDeletions) {
    await tryDeleteFile(p);
  }
  data.artworks[index] = artwork;

  try {
    await saveSiteData(data);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artworks/${slug}?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect(`/admin/artworks/${slug}?error=json`);
    return;
  }

  revalidatePath("/artists");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/artworks");
  redirect("/admin/artworks?saved=1");
}

export async function createArtwork(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const payload = String(formData.get("payload") ?? "");

  let artwork: Artwork;
  let data;
  try {
    artwork = JSON.parse(payload);
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
  data.artworks.unshift(artwork);

  try {
    await saveSiteData(data);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artworks/new?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artworks/new?error=json");
    return;
  }

  revalidatePath("/artists");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/artworks");
  redirect("/admin/artworks?saved=1");
}

export async function deleteArtwork(slug: string) {
  if (!(await isAdmin())) redirect("/admin");
  const data = await getSiteData();
  const artwork = data.artworks.find((a) => a.slug === slug);
  if (artwork?.image) await tryDeleteFile(artwork.image);
  data.artworks = data.artworks.filter((a) => a.slug !== slug);
  await saveSiteData(data);
  revalidatePath("/artists");
  revalidatePath("/gallery");
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
  let data;
  try {
    event = JSON.parse(payload) as Event;
    pendingDeletions = JSON.parse(pendingDeletionsRaw);
    data = await getSiteData();
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin?error=json");
    return;
  }

  const index = data.events.findIndex((e) => e.slug === slug);

  if (index === -1) {
    // New event — add to the list
    for (const p of pendingDeletions) {
      await tryDeleteFile(p);
    }
    data.events.push(event);
  } else {
    // Existing event — update
    const existing = data.events[index];
    if (event.image !== existing.image && existing.image?.startsWith("/uploads/")) {
      await tryDeleteFile(existing.image);
    }
    for (const p of pendingDeletions) {
      await tryDeleteFile(p);
    }
    data.events[index] = event;
  }

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
  revalidatePath("/events/[slug]", "page");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}
