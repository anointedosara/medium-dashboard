import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getCurrentUser, logActivity } from "@/lib/auth";

const ALLOWED = new Set(["projects", "products", "orders", "team", "notifications", "people", "billing", "chats", "schedules"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  if (!ALLOWED.has(type)) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  delete body._id;
  delete body.userId;

  const db = await getStore();
  // Scope the update to the owning user.
  const existing = await db.collection(type).findOne({ _id: id, userId: user._id });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const item = await db.collection(type).updateOne(
    { _id: id, userId: user._id },
    { ...body, updatedAt: new Date().toISOString() }
  );
  if (type !== "chats") await logActivity(user._id, `Updated ${type.replace(/s$/, "")}`);
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  if (!ALLOWED.has(type)) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const db = await getStore();
  const existing = await db.collection(type).findOne({ _id: id, userId: user._id });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await db.collection(type).deleteOne({ _id: id, userId: user._id });
  if (type !== "chats") await logActivity(user._id, `Deleted ${type.replace(/s$/, "")}`);
  return NextResponse.json({ ok: true });
}
