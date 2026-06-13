import { NextRequest, NextResponse } from "next/server";
import { getStore, newId } from "@/lib/db";
import { hashPassword, startSession, logActivity } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const db = await getStore();
    const existing = await db.collection("users").findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const id = newId();
    const user = await db.collection("users").insertOne({
      _id: id,
      fullName,
      email: String(email).toLowerCase(),
      password: hashPassword(password),
      avatar: "",
      role: "Member",
      bio: "",
      username: String(email).split("@")[0],
      phone: "",
      city: "",
      country: "",
      zip: "",
      timezone: "Pacific Standard Time",
      plan: "Free/Personal",
      createdAt: new Date().toISOString(),
    });

    await logActivity(id, "Account created", `Welcome, ${fullName}`);
    await startSession(id);

    return NextResponse.json({ ok: true, userId: id, name: user.fullName });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signup failed." },
      { status: 500 }
    );
  }
}
