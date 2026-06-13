import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser, logActivity } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (user) await logActivity(user._id, "Signed out");
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
