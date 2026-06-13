import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    return NextResponse.json({
      status: "ok",
      database: conn.connection.name,
      readyState: conn.connection.readyState, // 1 = connected
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
