"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { sendContactEmail } from "@/app/[lang]/contact/actions";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export function ContactForm({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await sendContactEmail(formData);
    if (result.error) {
      // Сервер возвращает ключ ошибки — переводим здесь.
      const map: Record<string, string> = {
        validation: t.contact.errValidation,
        rateLimit: t.contact.errRateLimit,
        notConfigured: t.contact.errNotConfigured,
        send: t.contact.errSend,
      };
      setError(map[result.error] ?? t.contact.errSend);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="grid gap-4 border border-black/10 bg-white/35 p-5 md:p-10">
        <p className="room-serif text-2xl">{t.contact.thankYou}</p>
        <p className="text-sm leading-7 text-[#6f6a61]">{t.contact.sent}</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="grid gap-4 border border-black/10 bg-white/35 p-5 md:p-10">
      <input
        type="text"
        className="hidden"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <input
        className="admin-input"
        name="name"
        placeholder={t.contact.namePlaceholder}
        required
        maxLength={120}
      />
      <input
        className="admin-input"
        name="email"
        type="email"
        placeholder={t.contact.emailPlaceholder}
        required
        maxLength={254}
      />
      <input
        className="admin-input"
        name="subject"
        placeholder={t.contact.subjectPlaceholder}
        maxLength={200}
      />
      <textarea
        className="admin-input min-h-40 resize-none"
        name="message"
        placeholder={t.contact.messagePlaceholder}
        required
        maxLength={5000}
      />
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] md:w-fit"
      >
        {t.contact.send} <ArrowUpRight size={16} />
      </button>
    </form>
  );
}