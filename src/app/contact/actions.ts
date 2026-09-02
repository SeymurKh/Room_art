"use server";

import { Resend } from "resend";

const TO_EMAIL = "roomcommunityofficial@gmail.com";

export async function sendContactEmail(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: "Please fill in all required fields." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    return { error: "Email service is not configured." };
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ROOM Contact Form <onboarding@resend.com>",
      to: TO_EMAIL,
      replyTo: email,
      subject: subject || `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #11100e; border-bottom: 1px solid #e5e5e5; padding-bottom: 12px;">New message from ROOM website</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px 0; color: #6f6a61; font-weight: 600; width: 100px;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6f6a61; font-weight: 600;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            ${subject ? `<tr><td style="padding: 8px 0; color: #6f6a61; font-weight: 600;">Subject</td><td style="padding: 8px 0;">${subject}</td></tr>` : ""}
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #f4f1ea; border-left: 3px solid #a58e63;">
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("[contact] Failed to send email:", error);
    return { error: "Failed to send message. Please try again later." };
  }
}
