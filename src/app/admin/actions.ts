"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { getSiteData, saveSiteData, SiteDataValidationError } from "@/lib/site-data";
import type { Artist, Artwork, Exhibition } from "@/lib/types";

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
    const data = JSON.parse(payload);
    await saveSiteData(data);
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
    data.artists[index] = artist;
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
  data.artists = data.artists.filter((a) => a.slug !== slug);
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
  data.artworks = data.artworks.filter((a) => a.slug !== slug);
  await saveSiteData(data);
  revalidatePath("/artists");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/artworks");
  redirect("/admin/artworks");
}
