import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { isAdmin } from "@/lib/auth";

const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const ALLOWED_VIDEO_MIME = ["video/mp4", "video/webm"];

const MAX_INPUT_SIZE = 100 * 1024 * 1024; // 100 MB for images
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB for video
const MAX_OUTPUT_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_DIMENSION = 2400;
const DEFAULT_QUALITY = 85;
const FALLBACK_QUALITY = 75;

const UPLOADS_ROOT = path.resolve(process.cwd(), "public", "uploads");

function isUnderUploads(filePath: string): boolean {
  if (!filePath || !filePath.startsWith("/uploads/")) return false;
  const normalized = filePath.replace(/^\//, "").replace(/\//g, path.sep);
  const resolved = path.resolve(process.cwd(), "public", normalized);
  return resolved.startsWith(UPLOADS_ROOT + path.sep);
}

async function optimizeImage(input: Buffer): Promise<Buffer> {
  const metadata = await sharp(input).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  let pipeline = sharp(input).rotate();

  // Convert to sRGB only when the source is in another color space.
  // Already-sRGB images (the common case) are left untouched, which avoids
  // noisy libvips warnings from unusual/exotic embedded ICC profiles.
  if (metadata.space && metadata.space !== "srgb") {
    pipeline = pipeline.toColorspace("srgb");
  }

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  let output = await pipeline.webp({ quality: DEFAULT_QUALITY }).toBuffer();

  if (output.length > MAX_OUTPUT_SIZE) {
    let fallback = sharp(input)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });

    if (metadata.space && metadata.space !== "srgb") {
      fallback = fallback.toColorspace("srgb");
    }

    output = await fallback.webp({ quality: FALLBACK_QUALITY }).toBuffer();
  }

  return output;
}

function isAllowed(folder: string, mime: string): boolean {
  const path_ = folder.replace(/\\/g, "/").toLowerCase();
  if (path_.includes("video")) return ALLOWED_VIDEO_MIME.includes(mime);
  return ALLOWED_IMAGE_MIME.includes(mime);
}

function maxSizeFor(mime: string): number {
  return ALLOWED_VIDEO_MIME.includes(mime) ? MAX_VIDEO_SIZE : MAX_INPUT_SIZE;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "uploads";
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!isAllowed(folder, file.type)) {
    return NextResponse.json(
      { error: `File type "${file.type}" is not allowed for this folder.` },
      { status: 400 }
    );
  }

  const maxSize = maxSizeFor(file.type);
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the ${maxSize / 1024 / 1024}MB limit.` },
      { status: 400 }
    );
  }

  const uploadsDir = path.resolve(process.cwd(), "public", folder.replace(/\//g, path.sep));
  await fs.mkdir(uploadsDir, { recursive: true });

  const isVideo = ALLOWED_VIDEO_MIME.includes(file.type);
  const ext = isVideo
    ? file.type === "video/webm"
      ? "webm"
      : "mp4"
    : "webp";
  const uniqueName = `${randomUUID()}.${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  if (isVideo) {
    await fs.writeFile(filePath, inputBuffer);
  } else {
    const outputBuffer = await optimizeImage(inputBuffer);
    await fs.writeFile(filePath, outputBuffer);
  }

  const publicPath = `/${folder}/${uniqueName}`;
  return NextResponse.json({ path: publicPath });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");
  if (!filePath) {
    return NextResponse.json({ error: "No path provided" }, { status: 400 });
  }

  if (!isUnderUploads(filePath)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const normalized = filePath.replace(/^\//, "").replace(/\//g, path.sep);
  const fullPath = path.resolve(process.cwd(), "public", normalized);
  try {
    await fs.unlink(fullPath);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ deleted: false, error: "File not found" }, { status: 404 });
  }
}