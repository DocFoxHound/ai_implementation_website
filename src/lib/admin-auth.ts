import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const adminCookieName = "ironpoint_admin";

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "ironpoint-admin";
}

function adminSecret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "ironpoint-local-dev-secret";
}

export function createAdminSessionToken() {
  return createHmac("sha256", adminSecret()).update(adminPassword()).digest("hex");
}

export function isValidAdminPassword(password: string) {
  const expected = Buffer.from(adminPassword());
  const received = Buffer.from(password);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;
  const expected = createAdminSessionToken();
  if (!token) return false;

  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  if (tokenBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(tokenBuffer, expectedBuffer);
}

export function adminPasswordIsDefault() {
  return !process.env.ADMIN_PASSWORD;
}
