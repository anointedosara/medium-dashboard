import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/** Real activity feed for the signed-in user: sign-ins, projects, profile edits, etc. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const db = await getStore();
  const activities = await db
    .collection("activities")
    .find({ userId: user._id }, { sort: { createdAt: -1 }, limit: 50 });

  const events = activities.map((a) => ({
    id: a._id,
    action: String(a.action ?? ""),
    detail: String(a.detail ?? ""),
    createdAt: String(a.createdAt ?? ""),
  }));

  return NextResponse.json({ events });
}

/** Remove a single timeline entry (scoped to the owning user). */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const db = await getStore();
  await db.collection("activities").deleteOne({ _id: id, userId: user._id });
  return NextResponse.json({ ok: true });
}
