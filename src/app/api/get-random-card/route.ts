// File: /src/app/api/get-random-card/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://1m7c4gd9m6.execute-api.us-west-1.amazonaws.com/dev/get-random-card"
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch card" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching random card:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
