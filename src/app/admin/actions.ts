"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { adminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { getSiteData, saveSiteData, SiteDataValidationError } from "@/lib/site-data";
import type { Artist, Artwork, Exhibition } from "@/lib/types";

async function tryDeleteFile(filePath: string) {
  if (!filePath || !filePath.startsWith("/uploads/")) return;
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    await fs.unlink(fullPath);
  } catch {
    // file doesn't exist or can't be deleted — ignore
  }
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
    // Dashboard only edits settings/about/exhibitions — preserve current artists/artworks
    // to prevent data loss when editing artist/artwork in another tab.
    const merged = {
      ...incoming,
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
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function saveArtist(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const slug = String(formData.get("slug") ?? "");
  const payload = String(formData.get("payload") ?? "");
  try {
    const artist = JSON.parse(payload) as Artist;
    const data = await getSiteData();
    const index = data.artists.findIndex((a) => a.slug === slug);
    if (index === -1) redirect("/admin/artists?error=notfound");
    const oldSlug = data.artists[index].slug;
    data.artists[index] = artist;
    // If slug changed, update artistSlug in all artworks referencing the old slug
    if (artist.slug !== oldSlug) {
      data.artworks = data.artworks.map((aw) =>
        aw.artistSlug === oldSlug ? { ...aw, artistSlug: artist.slug } : aw
      );
    }
    await saveSiteData(data);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artists/${slug}?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect(`/admin/artists/${slug}?error=json`);
  }
  revalidatePath("/artists");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/artists");
  redirect("/admin/artists?saved=1");
}

export async function createArtist(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const payload = String(formData.get("payload") ?? "");
  try {
    const artist = JSON.parse(payload) as Artist;
    const data = await getSiteData();
    data.artists.push(artist);
    await saveSiteData(data);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artists/new?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artists/new?error=json");
  }
  revalidatePath("/artists");
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
  try {
    const artwork = JSON.parse(payload) as Artwork;
    const data = await getSiteData();
    if (!data.artists.some((a) => a.slug === artwork.artistSlug)) {
      redirect(`/admin/artworks/${slug}?error=validation&details=${encodeURIComponent(`Artist with slug "${artwork.artistSlug}" does not exist`)}`);
    }
    const index = data.artworks.findIndex((a) => a.slug === slug);
    if (index === -1) redirect("/admin/artworks?error=notfound");
    data.artworks[index] = artwork;
    await saveSiteData(data);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artworks/${slug}?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect(`/admin/artworks/${slug}?error=json`);
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
  try {
    const artwork = JSON.parse(payload) as Artwork;
    const data = await getSiteData();
    if (!data.artists.some((a) => a.slug === artwork.artistSlug)) {
      redirect(`/admin/artworks/new?error=validation&details=${encodeURIComponent(`Artist with slug "${artwork.artistSlug}" does not exist`)}`);
    }
    data.artworks.push(artwork);
    await saveSiteData(data);
  } catch (error) {
    if (error instanceof SiteDataValidationError) {
      redirect(`/admin/artworks/new?error=validation&details=${encodeURIComponent(error.issues.join(", "))}`);
    }
    redirect("/admin/artworks/new?error=json");
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