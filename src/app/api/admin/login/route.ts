import { NextResponse } from "next/server";
import { adminCookieName, createAdminSessionToken, isValidAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ message: "Invalid admin password." }, { status: 401 });
  }

  const response = NextResponse.json({ message: "Signed in." });
  response.cookies.set(adminCookieName, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}
