import { getSiteData } from "@/lib/site-data";
import { HomeExperience } from "@/components/home-experience";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getSiteData();
  return <HomeExperience data={data} />;
}
