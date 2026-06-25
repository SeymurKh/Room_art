"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export function ContactForm({ settings }: { settings: SiteSettings }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function buildWhatsAppUrl() {
    const parts = [];
    if (name) parts.push(`Name: ${name}`);
    if (email) parts.push(`Email: ${email}`);
    if (subject) parts.push(`Subject: ${subject}`);
    if (message) parts.push(`Message: ${message}`);
    const body =
      parts.length > 0
        ? `Hello ROOM,%0A%0A${parts.join("%0A")}`
        : "Hello ROOM, I would like to discuss a collaboration.";
    return `https://wa.me/${settings.whatsappNumber}?text=${body}`;
  }

  return (
    <div className="grid gap-4 border border-black/10 bg-white/35 p-6 md:p-10">
      <input
        className="admin-input"
        name="name"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="admin-input"
        name="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="admin-input"
        name="subject"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        className="admin-input min-h-40 resize-none"
        name="message"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea]"
      >
        Send on WhatsApp <ArrowUpRight size={16} />
      </a>
    </div>
  );
}