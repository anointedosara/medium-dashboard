import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { verifyPassword, startSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getStore();
    const user = await db.collection("users").findOne({ email: String(email).toLowerCase() });
    if (!user || !verifyPassword(password, user.password as string)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await startSession(user._id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed." },
      { status: 500 }
    );
  }
}
