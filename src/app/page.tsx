import { getSiteData } from "@/lib/site-data";
import { HomeExperience } from "@/components/home-experience";

export default async function Home() {
  const data = await getSiteData();
  return <HomeExperience data={data} />;
}