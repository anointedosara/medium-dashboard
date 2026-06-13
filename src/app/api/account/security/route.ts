import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword, logActivity } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { currentPassword, newPassword, confirmPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "All password fields are required." }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
  }
  if (String(newPassword).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const db = await getStore();
  const doc = await db.collection("users").findOne({ _id: user._id });
  if (!doc || !verifyPassword(currentPassword, doc.password as string)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  await db.collection("users").updateOne({ _id: user._id }, { password: hashPassword(newPassword) });
  await logActivity(user._id, "Changed password");
  return NextResponse.json({ ok: true, message: "Password updated successfully." });
}
