import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { ScrollTools } from "@/components/scroll-tools";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://roombaku.com"),
  title: {
    default: "ROOM Baku — Contemporary Art Space",
    template: "%s — ROOM Baku",
  },
  description:
    "A contemporary art space and gallery platform in Baku, Azerbaijan. Exhibitions, artists, and cultural encounters.",
  openGraph: {
    title: "ROOM Baku",
    description:
      "A contemporary art space and gallery platform in Baku, Azerbaijan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ScrollTools />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
