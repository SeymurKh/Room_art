"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { saveSiteData, SiteDataValidationError } from "@/lib/site-data";

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
