import type { Metadata } from "next";
import { inter } from "@/lib/fonts";
import { PageTransition } from "@/components/page-transition";
import { ScrollTools } from "@/components/scroll-tools";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://roomgallery.art"),
  title: {
    default: "ROOM admin",
    template: "%s — ROOM admin",
  },
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

/**
 * Root layout дерева админки. Отдельный root layout (второй в приложении) —
 * админка живёт вне [lang], интерфейс её всегда английский.
 */
export default function AdminRootLayout({
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