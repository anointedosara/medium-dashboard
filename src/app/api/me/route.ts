import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStore } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  const db = await getStore();
  const activities = await db
    .collection("activities")
    .find({ userId: user._id }, { sort: { createdAt: -1 }, limit: 20 });

  return NextResponse.json({ user, activities });
}
