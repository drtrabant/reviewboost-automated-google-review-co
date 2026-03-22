import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface WaitlistEntry {
  email: string;
  businessName: string;
  timestamp: string;
  ip: string | null;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_BUSINESS_NAME_LENGTH = 200;
const WAITLIST_FILE = path.join(process.cwd(), "data", "waitlist.json");

function sanitize(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/&/g, "&amp;")
    .trim();
}

function validateEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const cleaned = email.trim().toLowerCase();
  if (cleaned.length === 0 || cleaned.length > MAX_EMAIL_LENGTH) return null;
  if (!EMAIL_REGEX.test(cleaned)) return null;
  return cleaned;
}

function validateBusinessName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const cleaned = sanitize(name);
  if (cleaned.length === 0 || cleaned.length > MAX_BUSINESS_NAME_LENGTH) return null;
  return cleaned;
}

async function ensureDataDir(): Promise<void> {
  const dir = path.dirname(WAITLIST_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(data) as WaitlistEntry[];
  } catch {
    return [];
  }
}

async function writeWaitlist(entries: WaitlistEntry[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

async function forwardToWebhook(entry: WaitlistEntry): Promise<void> {
  const webhookUrl = process.env.WAITLIST_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Webhook failure is non-blocking — we already saved locally
    console.error("Webhook forwarding failed, entry saved locally");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting hint via headers (production would use middleware/Redis)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email: rawEmail, businessName: rawBusinessName } = body as Record<
      string,
      unknown
    >;

    const email = validateEmail(rawEmail);
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 422 }
      );
    }

    const businessName = rawBusinessName ? (validateBusinessName(rawBusinessName) ?? '') : '';

    // Check for duplicate email
    const entries = await readWaitlist();
    const alreadyExists = entries.some((entry) => entry.email === email);

    if (alreadyExists) {
      // Return success to avoid leaking whether an email is registered
      return NextResponse.json({
        success: true,
        message: "You're on the list! We'll be in touch soon.",
      });
    }

    const newEntry: WaitlistEntry = {
      email,
      businessName,
      timestamp: new Date().toISOString(),
      ip,
    };

    entries.push(newEntry);
    await writeWaitlist(entries);

    // Non-blocking webhook forwarding (e.g., to Zapier, Make, Slack)
    forwardToWebhook(newEntry).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "You're on the list! We'll be in touch soon.",
    });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Reject non-POST methods explicitly
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}