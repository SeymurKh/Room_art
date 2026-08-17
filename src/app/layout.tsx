import type { Metadata } from "next";
import localFont from "next/font/local";
import { PageTransition } from "@/components/page-transition";
import { ScrollTools } from "@/components/scroll-tools";
import "./globals.css";

const editorialNew = localFont({
  src: [
    {
      path: "../../public/fonts/PPEditorialNew-Ultralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/PPEditorialNew-UltralightItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/PPEditorialNew-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/PPEditorialNew-Italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-editorial-new",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://roombaku.com"),
  title: {
    default: "ROOM Baku — Contemporary Art Space",
    template: "%s — ROOM Baku",
  },
  description:
    "A contemporary art space and gallery platform in Baku, Azerbaijan. Events, artists, and cultural encounters.",
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
    <html lang="en" data-scroll-behavior="smooth" className={editorialNew.variable}>
      <body>
        <ScrollTools />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}