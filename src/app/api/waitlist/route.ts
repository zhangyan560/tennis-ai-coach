import { NextRequest, NextResponse } from "next/server";
import { appendFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Append to local CSV file (simplest validation storage)
    const filePath = join(process.cwd(), "waitlist.csv");
    const timestamp = new Date().toISOString();
    const line = `${timestamp},${email}\n`;
    await appendFile(filePath, line);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Don't expose errors to users
  }
}
