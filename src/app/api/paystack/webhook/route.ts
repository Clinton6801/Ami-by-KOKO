/**
 * Paystack webhook handler.
 * Receives charge.success events and activates the subscription.
 *
 * Setup in Paystack dashboard:
 * Settings → API Keys & Webhooks → Webhook URL:
 * https://yourdomain.com/api/paystack/webhook
 */
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

// Use service role key — this runs server-side only
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  // Verify the request is genuinely from Paystack
  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "charge.success") {
    const data = event.data;
    const reference = data.reference as string;
    const email = (data.customer as { email: string }).email;
    const metadata = data.metadata as Record<string, string> | null;

    const supabase = getAdminClient();

    // Find the profile by email
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (user) {
      // Upsert subscription — active for 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabase.from("subscriptions").upsert({
        profile_id: user.id,
        plan: (metadata?.plan as "individual" | "school") ?? "individual",
        paystack_reference: reference,
        active: true,
        expires_at: expiresAt.toISOString(),
      }, { onConflict: "profile_id" });
    }
  }

  return NextResponse.json({ received: true });
}
