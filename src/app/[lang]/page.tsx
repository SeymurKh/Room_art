import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/site-data";
import { isLocale } from "@/lib/i18n/config";
import { HomeExperience } from "@/components/home-experience";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const data = await getSiteData();
  return <HomeExperience data={data} />;
}