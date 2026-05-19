import { NextResponse } from "next/server";
import { saveConfig } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    saveConfig(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
