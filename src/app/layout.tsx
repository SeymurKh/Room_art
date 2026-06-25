import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROOM Baku",
  description: "A contemporary art space and gallery platform in Baku, Azerbaijan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
