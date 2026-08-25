"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { sendContactEmail } from "@/app/contact/actions";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(false);
    try {
      await sendContactEmail(formData);
      setSent(true);
    } catch {
      setError(true);
    }
  }

  if (sent) {
    return (
      <div className="grid gap-4 border border-black/10 bg-white/35 p-5 md:p-10">
        <p className="room-serif text-2xl">Thank you!</p>
        <p className="text-sm leading-7 text-[#6f6a61]">Your message has been sent. We will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="grid gap-4 border border-black/10 bg-white/35 p-5 md:p-10">
      <input
        className="admin-input"
        name="name"
        placeholder="Name"
        required
      />
      <input
        className="admin-input"
        name="email"
        type="email"
        placeholder="Email"
        required
      />
      <input
        className="admin-input"
        name="subject"
        placeholder="Subject"
      />
      <textarea
        className="admin-input min-h-40 resize-none"
        name="message"
        placeholder="Message"
        required
      />
      {error ? (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      ) : null}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] md:w-fit"
      >
        Send message <ArrowUpRight size={16} />
      </button>
    </form>
  );
}