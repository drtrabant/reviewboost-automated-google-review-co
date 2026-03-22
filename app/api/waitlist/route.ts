import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const { email: rawEmail } = body as Record<string, unknown>;

    if (typeof rawEmail !== "string" || !EMAIL_REGEX.test(rawEmail.trim())) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 422 });
    }

    const email = rawEmail.trim().toLowerCase().replace(/[<>]/g, "");

    // Forward to webhook if configured (Zapier, Make, etc.)
    const webhookUrl = process.env.WAITLIST_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, timestamp: new Date().toISOString() }),
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        // Non-blocking — still return success
      }
    }

    return NextResponse.json({ success: true, message: "You're on the list!" });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
}
