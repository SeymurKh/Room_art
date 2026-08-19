import path from "path";
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import sharp from "sharp";

const NIGAR_SLUG = "artist-6937bb11-649c-4679-8be5-e34a088ef0a4";

const dataFile = path.resolve(process.cwd(), "data", "site-data.json");
const cnntngrDir = path.resolve(process.cwd(), "cntnngr");
const artworksDir = path.resolve(process.cwd(), "public", "uploads", "artworks");

type JsonArtwork = {
  slug?: string;
  title?: string;
  artistSlug?: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  widthCm?: number;
  heightCm?: number;
  image?: string;
  availability?: string;
  description?: string;
  price?: string;
  displayed?: boolean;
};

const raw = readFileSync(dataFile, "utf8");
const siteData = JSON.parse(raw) as {
  settings: unknown;
  artists: unknown[];
  artworks: JsonArtwork[];
  events: unknown[];
  about: unknown;
};

async function main() {
  const oldNigar = siteData.artworks.filter((a) => a.artistSlug === NIGAR_SLUG);
  const oldImages = new Set<string>(
    oldNigar
      .map((a) => a.image)
      .filter((v): v is string => typeof v === "string")
  );

  // Keep only non-Nigar artworks, normalize the new "price" field everywhere.
  siteData.artworks = siteData.artworks
    .filter((a) => a.artistSlug !== NIGAR_SLUG)
    .map((a) => ({ ...a, price: typeof a.price === "string" ? a.price : "" }));

  const files = readdirSync(cnntngrDir)
    .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const src = path.join(cnntngrDir, file);
    const meta = await sharp(src).metadata();
    const w = meta.width ?? 1000;
    const h = meta.height ?? 1000;

    // Derive a reasonable placeholder size (longest side ~ 100 cm).
    let widthCm: number;
    let heightCm: number;
    if (w >= h) {
      widthCm = 100;
      heightCm = Math.max(10, Math.round((h / w) * 100));
    } else {
      heightCm = 100;
      widthCm = Math.max(10, Math.round((w / h) * 100));
    }

    const id = randomUUID();
    const outFile = path.join(artworksDir, `${id}.webp`);
    await sharp(src).rotate().toColorspace("srgb").webp({ quality: 85 }).toFile(outFile);

    siteData.artworks.push({
      slug: `artwork-${id}`,
      title: `Untitled ${i + 1}`,
      artistSlug: NIGAR_SLUG,
      year: "2026",
      medium: "Acrylic on canvas",
      dimensions: `${widthCm} × ${heightCm} cm`,
      widthCm,
      heightCm,
      image: `/uploads/artworks/${id}.webp`,
      availability: "Available",
      description: "",
      price: "",
      displayed: false,
    });
  }

  writeFileSync(dataFile, JSON.stringify(siteData, null, 2) + "\n", "utf8");

  let deleted = 0;
  for (const img of oldImages) {
    if (!img.startsWith("/uploads/")) continue;
    const p = path.resolve(process.cwd(), "public", img.replace(/^\//, ""));
    if (existsSync(p)) {
      rmSync(p);
      deleted++;
    }
  }

  console.log(
    `Removed ${oldNigar.length} old Nigar artworks (deleted files: ${deleted}); imported ${files.length} new artworks from cntnngr.`
  );
}

main();
