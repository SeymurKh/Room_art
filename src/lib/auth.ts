import { cookies } from "next/headers";
import { createHash } from "crypto";

const cookieName = "room-admin-session";

export function ensureAdminCredentials() {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET) {
    const nodeEnv = process.env.NODE_ENV as string | undefined;
    if (nodeEnv === "production") {
      throw new Error(
        "ADMIN_PASSWORD and ADMIN_SECRET must be set in production environment"
      );
    }
    console.warn(
      "⚠ Using default admin credentials. Set ADMIN_PASSWORD and ADMIN_SECRET in .env before production."
    );
    console.warn("  Default password: room-admin");
  }
}

function secret() {
  return process.env.ADMIN_SECRET ?? "room-local-secret";
}

export function adminPassword() {
  ensureAdminCredentials();
  return process.env.ADMIN_PASSWORD ?? "room-admin";
}

function sessionValue() {
  return createHash("sha256")
    .update(`${adminPassword()}:${secret()}`)
    .digest("hex");
}

export async function isAdmin() {
  const store = await cookies();
  return store.get(cookieName)?.value === sessionValue();
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(cookieName, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(cookieName);
}
