import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/** Real, per-user in-app notifications (fed from logged account activity). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const db = await getStore();
  const rows = await db
    .collection("notifications")
    .find({ userId: user._id }, { sort: { createdAt: -1 }, limit: 50 });

  const items = rows.map((n) => ({
    id: n._id,
    title: String(n.title ?? ""),
    body: String(n.body ?? ""),
    read: Boolean(n.read),
    createdAt: String(n.createdAt ?? ""),
  }));
  const unread = items.filter((n) => !n.read).length;

  return NextResponse.json({ items, unread });
}

/** Mark notifications read — body { id } for one, { all:true } for every one. */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const db = await getStore();

  if (body.all) {
    const rows = await db.collection("notifications").find({ userId: user._id, read: false });
    for (const n of rows) await db.collection("notifications").updateOne({ _id: n._id }, { read: true });
    return NextResponse.json({ ok: true, updated: rows.length });
  }
  if (body.id) {
    await db.collection("notifications").updateOne({ _id: body.id, userId: user._id }, { read: true });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Nothing to do." }, { status: 400 });
}

/** Dismiss notifications — body { id } for one, { all:true } to clear all. */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const db = await getStore();

  if (body.all) {
    const rows = await db.collection("notifications").find({ userId: user._id });
    for (const n of rows) await db.collection("notifications").deleteOne({ _id: n._id });
    return NextResponse.json({ ok: true, removed: rows.length });
  }
  if (body.id) {
    await db.collection("notifications").deleteOne({ _id: body.id, userId: user._id });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Nothing to do." }, { status: 400 });
}
