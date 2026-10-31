import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { inter } from "@/lib/fonts";
import { PageTransition } from "@/components/page-transition";
import { ScrollTools } from "@/components/scroll-tools";
import { getDictionary } from "@/lib/i18n";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = getDictionary(locale);
  return {
    metadataBase: new URL("https://roomgallery.art"),
    title: {
      default: t.meta.siteTitle,
      template: t.meta.titleTemplate,
    },
    description: t.meta.description,
    alternates: {
      languages: {
        en: "/",
        az: "/az",
      },
    },
    openGraph: {
      title: t.meta.siteTitle,
      description: t.meta.ogDescription,
      type: "website",
      siteName: "ROOM",
      url: locale === "az" ? "/az" : "/",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t.meta.siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.siteTitle,
      description: t.meta.ogDescription,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/icon.png",
      apple: "/apple-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const t = getDictionary(locale);

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ArtGallery",
              name: "ROOM",
              description: t.meta.ogDescription,
              url: "https://roomgallery.art",
              logo: "https://roomgallery.art/assets/logo.png",
              image: "https://roomgallery.art/og-image.png",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Baku",
                addressCountry: "AZ",
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body>
        <ScrollTools />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}