"use server";

import { redirect } from "next/navigation";

const TO_EMAIL = "roomcommunityofficial@gmail.com";

export async function sendContactEmail(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=required");
  }

  // TODO: Replace with actual email sending (Resend, Nodemailer, etc.)
  // when deployed to production with API key configured.
  console.log("[contact] New message:", { name, email, subject, message, to: TO_EMAIL });

  redirect("/contact?sent=1");
}
