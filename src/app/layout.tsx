import type { Metadata } from "next";
import localFont from "next/font/local";
import { PageTransition } from "@/components/page-transition";
import { ScrollTools } from "@/components/scroll-tools";
import "./globals.css";

const inter = localFont({
  src: "../../public/fonts/Inter-VariableFont.ttf",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://roomgallery.art"),
  title: {
    default: "ROOM — Contemporary Art Space",
    template: "%s — ROOM",
  },
  description:
    "ROOM is a contemporary art space in Baku where art, wine, and culture come together through exhibitions, artists, and curated encounters.",
  openGraph: {
    title: "ROOM — Contemporary Art Space",
    description:
      "A contemporary art space in Baku where art, wine, and culture come together through exhibitions, artists, and curated encounters.",
    type: "website",
    siteName: "ROOM",
    url: "https://roomgallery.art",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ROOM — Contemporary Art Space",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROOM — Contemporary Art Space",
    description:
      "A contemporary art space in Baku where art, wine, and culture come together through exhibitions, artists, and curated encounters.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ArtGallery",
              name: "ROOM",
              description:
                "A contemporary art space in Baku where art, wine, and culture come together through exhibitions, artists, and curated encounters.",
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