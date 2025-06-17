import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10); // e.g., '2025-06-16'

  // Supabase query: quantity > 0 AND expires >= today (treat as full-day)
  const { data: availableCards, error } = await supabase
    .from("cards")
    .select("*")
    .gt("quantity", 0)
    .gte("expires", today); // compares just the date portion

  if (error || !availableCards || availableCards.length === 0) {
    return NextResponse.json({ error: "No available cards" }, { status: 404 });
  }

  const selected =
    availableCards[Math.floor(Math.random() * availableCards.length)];
  return NextResponse.json(selected);
}
