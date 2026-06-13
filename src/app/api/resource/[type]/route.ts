import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getCurrentUser, logActivity } from "@/lib/auth";

const ALLOWED = new Set(["projects", "products", "orders", "team", "notifications", "people", "billing", "chats", "schedules", "tasks"]);
// Resources whose frequent writes shouldn't flood the activity/notification feed.
const SILENT = new Set(["chats", "tasks"]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (!ALLOWED.has(type)) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const db = await getStore();
  const items = await db.collection(type).find({ userId: user._id }, { sort: { createdAt: -1 } });
  return NextResponse.json({ items });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (!ALLOWED.has(type)) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  delete body._id;
  delete body.userId;

  const db = await getStore();
  const item = await db.collection(type).insertOne({
    ...body,
    userId: user._id,
    createdAt: new Date().toISOString(),
  });

  // Chats persist silently — individual messages shouldn't flood the activity feed.
  if (type !== "chats") {
    await logActivity(user._id, `Created ${type.replace(/s$/, "")}`, String(body.name || body.product || body.customer || ""));
  }
  return NextResponse.json({ ok: true, item });
}
