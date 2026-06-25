"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { saveSiteData } from "@/lib/site-data";
import type { SiteData } from "@/lib/types";

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
  const data = JSON.parse(payload) as SiteData;
  await saveSiteData(data);
  revalidatePath("/");
  revalidatePath("/artists");
  revalidatePath("/gallery");
  revalidatePath("/events");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}
