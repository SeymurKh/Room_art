import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/auth";

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const UPLOADS_ROOT = path.resolve(process.cwd(), "public", "uploads");

function isUnderUploads(filePath: string): boolean {
  if (!filePath || !filePath.startsWith("/uploads/")) return false;
  const normalized = filePath.replace(/^\//, "").replace(/\//g, path.sep);
  const resolved = path.resolve(process.cwd(), "public", normalized);
  return resolved.startsWith(UPLOADS_ROOT + path.sep);
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

  // Validate MIME type
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: `File type "${file.type}" is not allowed. Allowed: ${ALLOWED_MIME.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the 20MB limit.` },
      { status: 400 }
    );
  }

  const uploadsDir = path.resolve(process.cwd(), "public", folder.replace(/\//g, path.sep));
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const uniqueName = `${randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

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
