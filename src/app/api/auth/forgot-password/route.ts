import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { logActivity } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const db = await getStore();
    const user = await db.collection("users").findOne({ email: String(email).toLowerCase() });
    if (user) await logActivity(user._id, "Requested password reset");

    // Always return success to avoid leaking which emails are registered.
    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, reset instructions have been sent.",
    });
  } catch {
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
