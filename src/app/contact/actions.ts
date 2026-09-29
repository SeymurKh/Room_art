"use server";

import { Resend } from "resend";
import { z } from "zod";
import { headers } from "next/headers";

const TO_EMAIL = "community@roomgallery.art";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const submissionsByEmail = new Map<string, { count: number; resetAt: number }>();

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().max(200),
  message: z.string().trim().min(1).max(5000),
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  if (submissionsByEmail.size > 1000) {
    for (const [key, entry] of submissionsByEmail) {
      if (entry.resetAt <= now) submissionsByEmail.delete(key);
    }
  }

  const key = clientKey;
  if (submissionsByEmail.size >= 1000 && !submissionsByEmail.has(key)) {
    const oldestKey = submissionsByEmail.keys().next().value;
    if (oldestKey) submissionsByEmail.delete(oldestKey);
  }
  const current = submissionsByEmail.get(key);
  if (!current || current.resetAt <= now) {
    submissionsByEmail.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (current.count >= RATE_LIMIT_MAX) return true;
  current.count += 1;
  return false;
}

export async function sendContactEmail(formData: FormData) {
  if (String(formData.get("website") ?? "").trim()) {
    return { success: true };
  }

  const parsed = contactSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Please check the required fields and their length." };
  }

  const { name, email, message } = parsed.data;
  const subject = parsed.data.subject.replace(/[\r\n]+/g, " ");
  const requestHeaders = await headers();
  const clientKey = requestHeaders.get("x-real-ip")?.trim()
    || requestHeaders.get("x-forwarded-for")?.split(",").at(-1)?.trim()
    || "unknown";
  if (isRateLimited(clientKey)) {
    return { error: "Please wait a few minutes before sending another message." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    return { error: "Email service is not configured." };
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ROOM Contact Form <onboarding@resend.com>",
      to: TO_EMAIL,
      replyTo: email,
      subject: subject || `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #11100e; border-bottom: 1px solid #e5e5e5; padding-bottom: 12px;">New message from ROOM website</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px 0; color: #6f6a61; font-weight: 600; width: 100px;">Name</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #6f6a61; font-weight: 600;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            ${subject ? `<tr><td style="padding: 8px 0; color: #6f6a61; font-weight: 600;">Subject</td><td style="padding: 8px 0;">${escapeHtml(subject)}</td></tr>` : ""}
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #f4f1ea; border-left: 3px solid #a58e63;">
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[contact] Email provider rejected a message");
      return { error: "Failed to send message. Please try again later." };
    }

    return { success: true };
  } catch {
    console.error("[contact] Failed to send email");
    return { error: "Failed to send message. Please try again later." };
  }
}
