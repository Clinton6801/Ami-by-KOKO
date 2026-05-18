/**
 * POST /api/notifications/whatsapp
 * Sends a WhatsApp message to a parent via WhatsApp Cloud API.
 * Called internally by other routes — never directly from the client.
 *
 * Silently skips if the parent has no phone number saved.
 * Requires env vars: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN
 */
import { NextRequest, NextResponse } from "next/server";

export type WhatsAppNotificationType =
  | "assignment_complete"
  | "new_assignment"
  | "milestone"
  | "streak";

interface WhatsAppPayload {
  to: string;
  type: WhatsAppNotificationType;
  data: {
    childName: string;
    detail: string;
    appUrl?: string;
  };
}

function buildMessage(payload: WhatsAppPayload): string {
  const { childName, detail, appUrl } = payload.data;
  const url = appUrl ?? "https://ami-by-koko.vercel.app";

  switch (payload.type) {
    case "assignment_complete":
      return `🦜 Great news! ${childName} just completed their assignment '${detail}' on Àmì by Kòkò! View their progress: ${url}`;
    case "new_assignment":
      return `📝 ${childName}'s teacher has set a new assignment: '${detail}'. Open Àmì by Kòkò to see it: ${url}`;
    case "milestone":
      return `🏆 ${childName} just earned the '${detail}' certificate on Àmì by Kòkò! Download it here: ${url}`;
    case "streak":
      return `🔥 ${childName} has been learning with Kòkò for 7 days in a row! Keep it up! ${url}`;
    default:
      return `🦜 ${childName} has an update on Àmì by Kòkò! ${url}`;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json() as WhatsAppPayload;
  const { to, type, data } = body;

  if (!to || !type || !data?.childName) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  // Silently skip if WhatsApp is not configured
  if (!phoneNumberId || !accessToken) {
    return NextResponse.json({ skipped: true, reason: "WhatsApp not configured" });
  }

  // Normalise phone number — ensure it starts with country code, no +
  const normalised = to.replace(/\D/g, "").replace(/^0/, "234");

  const message = buildMessage({ to, type, data });

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalised,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("WhatsApp API error:", err);
      return NextResponse.json({ error: "WhatsApp send failed." }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("WhatsApp fetch error:", err);
    return NextResponse.json({ error: "Network error." }, { status: 500 });
  }
}

// ─── Webhook for incoming messages (verification + logging) ──────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}
