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
  },
  twitter: {
    card: "summary_large_image",
    title: "ROOM — Contemporary Art Space",
    description:
      "A contemporary art space in Baku where art, wine, and culture come together through exhibitions, artists, and curated encounters.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={inter.variable}>
      <body>
        <ScrollTools />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}