import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase GET /api/devices error:", error);
      return NextResponse.json(
        { error: "Failed to fetch devices" },
        { status: 500 }
      );
    }

    return NextResponse.json({ devices: data || [] });
  } catch (err) {
    console.error("GET /api/devices unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
