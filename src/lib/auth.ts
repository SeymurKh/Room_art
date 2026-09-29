import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

const cookieName = "room-admin-session";

export function ensureAdminCredentials() {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_PASSWORD and ADMIN_SECRET must be set in production.");
    }
  }
}

function secret() {
  ensureAdminCredentials();
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

function matchesSession(value: string | undefined): boolean {
  if (!value) return false;
  const expected = Buffer.from(sessionValue(), "hex");
  const actual = Buffer.from(value, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function isAdmin() {
  const store = await cookies();
  return matchesSession(store.get(cookieName)?.value);
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
