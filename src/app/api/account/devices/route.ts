import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getCurrentUser, getCurrentSessionId, logActivity } from "@/lib/auth";

/** Lists the real, currently-active sessions (devices) for the signed-in user. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const currentId = await getCurrentSessionId();
  const db = await getStore();
  const rows = await db.collection("sessions").find(
    { userId: user._id },
    { sort: { lastSeenAt: -1 } }
  );

  const devices = rows.map((s) => ({
    id: s._id,
    device: s.device,
    browser: s.browser,
    os: s.os,
    location: s.location,
    createdAt: s.createdAt,
    lastSeenAt: s.lastSeenAt,
    current: s._id === currentId,
  }));

  return NextResponse.json({ devices });
}

/**
 * Sign out devices.
 *   - body { id }     → revoke that one session
 *   - body { all:true } → revoke every OTHER session, keep the current one
 */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const currentId = await getCurrentSessionId();
  const body = await req.json().catch(() => ({}));
  const db = await getStore();

  if (body.all) {
    const rows = await db.collection("sessions").find({ userId: user._id });
    let removed = 0;
    for (const s of rows) {
      if (s._id === currentId) continue; // keep this device signed in
      await db.collection("sessions").deleteOne({ _id: s._id });
      removed++;
    }
    await logActivity(user._id, "Signed out from all devices", `${removed} session(s) revoked`);
    return NextResponse.json({ ok: true, removed });
  }

  if (body.id) {
    const session = await db.collection("sessions").findOne({ _id: body.id, userId: user._id });
    if (!session) return NextResponse.json({ error: "Device not found." }, { status: 404 });
    await db.collection("sessions").deleteOne({ _id: body.id, userId: user._id });
    await logActivity(user._id, "Signed out a device", String(session.device || ""));
    return NextResponse.json({ ok: true, current: body.id === currentId });
  }

  return NextResponse.json({ error: "Nothing to do." }, { status: 400 });
}
