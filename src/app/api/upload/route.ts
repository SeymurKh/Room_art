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

const UPLOADS_ROOT = path.resolve(process.cwd(), "public", "uploads");
const UPLOAD_FOLDERS = [
  "uploads/artists",
  "uploads/artworks",
  "uploads/events",
] as const;
const MAX_MULTIPART_OVERHEAD = 1024 * 1024;

async function optimizeImage(input: Buffer): Promise<Buffer> {
  const metadata = await sharp(input).metadata();
  const attempts = [
    { dimension: MAX_DIMENSION, quality: DEFAULT_QUALITY },
    { dimension: 2000, quality: 75 },
    { dimension: 1600, quality: 60 },
    { dimension: 1200, quality: 45 },
  ];

  for (const attempt of attempts) {
    let pipeline = sharp(input).rotate().resize({
      width: attempt.dimension,
      height: attempt.dimension,
      fit: "inside",
      withoutEnlargement: true,
    });
    if (metadata.space && metadata.space !== "srgb") {
      pipeline = pipeline.toColorspace("srgb");
    }
    const output = await pipeline.webp({ quality: attempt.quality }).toBuffer();
    if (output.length <= MAX_OUTPUT_SIZE) return output;
  }

  throw new Error("Image cannot be optimized below the output size limit.");
}

function isAllowed(folder: string, mime: string): boolean {
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) return false;
  if (folder === "uploads/events") {
    return ALLOWED_IMAGE_MIME.includes(mime) || ALLOWED_VIDEO_MIME.includes(mime);
  }
  return ALLOWED_IMAGE_MIME.includes(mime);
}

function maxSizeFor(mime: string): number {
  return ALLOWED_VIDEO_MIME.includes(mime) ? MAX_VIDEO_SIZE : MAX_INPUT_SIZE;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_VIDEO_SIZE + MAX_MULTIPART_OVERHEAD) {
    return NextResponse.json({ error: "Upload request is too large." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart upload." }, { status: 400 });
  }
  const file = formData.get("file");
  const folderValue = formData.get("folder");
  const folder = typeof folderValue === "string" ? folderValue : "";
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
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

  const uploadsDir = path.join(UPLOADS_ROOT, folder.slice("uploads/".length));
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
    const isMp4 = file.type === "video/mp4" && inputBuffer.length >= 12 && inputBuffer.toString("ascii", 4, 8) === "ftyp";
    const isWebm = file.type === "video/webm" && inputBuffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    if (!isMp4 && !isWebm) {
      return NextResponse.json({ error: "The uploaded file is not a valid MP4 or WebM video." }, { status: 400 });
    }
    await fs.writeFile(filePath, inputBuffer);
  } else {
    let outputBuffer: Buffer;
    try {
      const metadata = await sharp(inputBuffer).metadata();
      const expectedFormat: Record<string, string> = {
        "image/jpeg": "jpeg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "heif",
        "image/gif": "gif",
      };
      if (!metadata.format || metadata.format !== expectedFormat[file.type]) {
        return NextResponse.json({ error: "Image content does not match its declared file type." }, { status: 400 });
      }
      outputBuffer = await optimizeImage(inputBuffer);
    } catch {
      return NextResponse.json({ error: "Image is invalid or could not be optimized within the 2MB output limit." }, { status: 400 });
    }
    await fs.writeFile(filePath, outputBuffer);
  }

  const publicPath = `/${folder}/${uniqueName}`;
  return NextResponse.json({ path: publicPath });
}

