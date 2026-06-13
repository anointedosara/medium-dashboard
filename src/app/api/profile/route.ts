import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getCurrentUser, logActivity, toPublicUser } from "@/lib/auth";

const EDITABLE = [
  "fullName",
  "lastName",
  "username",
  "phone",
  "city",
  "country",
  "zip",
  "bio",
  "timezone",
  "avatar",
  "role",
  "plan",
];

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const key of EDITABLE) {
    if (key in body) patch[key] = body[key];
  }
  patch.updatedAt = new Date().toISOString();

  const db = await getStore();
  const updated = await db.collection("users").updateOne({ _id: user._id }, patch);
  if (!updated) return NextResponse.json({ error: "User not found." }, { status: 404 });

  await logActivity(user._id, "Updated profile", Object.keys(patch).filter((k) => k !== "updatedAt").join(", "));
  return NextResponse.json({ ok: true, user: toPublicUser(updated) });
}
