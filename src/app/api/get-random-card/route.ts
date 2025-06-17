// File: /src/app/api/get-random-card/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // ✅ Important!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data: availableCards, error } = await supabase
    .from("cards")
    .select("*")
    .gt("quantity", 0);

  if (error || !availableCards || availableCards.length === 0) {
    return NextResponse.json({ error: "No available cards" }, { status: 404 });
  }

  const selected =
    availableCards[Math.floor(Math.random() * availableCards.length)];
  return NextResponse.json(selected);
}
