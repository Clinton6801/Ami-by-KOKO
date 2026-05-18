/**
 * Paystack webhook handler.
 * Handles charge.success and subscription.create events.
 *
 * Setup in Paystack dashboard:
 * Settings → API Keys & Webhooks → Webhook URL:
 * https://ami-by-koko.vercel.app/api/paystack/webhook
 */
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

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
  console.log("[Paystack webhook] Received request");

  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  // Verify the request is genuinely from Paystack
  if (!verifySignature(body, signature)) {
    console.error("[Paystack webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  console.log("[Paystack webhook] Signature verified");

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    console.error("[Paystack webhook] Invalid JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[Paystack webhook] Event type:", event.event);

  // Handle both charge.success and subscription.create
  if (event.event === "charge.success" || event.event === "subscription.create") {
    const data = event.data;
    const reference = data.reference as string;
    const email = (data.customer as { email: string }).email;
    const metadata = data.metadata as Record<string, string> | null;

    console.log("[Paystack webhook] Processing payment for email:", email, "ref:", reference);

    const supabase = getAdminClient();

    // Find profile directly by email — avoids listUsers() which is slow
    const { data: profileData, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("id",
        // Sub-query: get user id from auth.users by email
        supabase.auth.admin.listUsers().then(() => null) as unknown as string
      )
      .maybeSingle();

    // Use direct auth admin lookup instead
    const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (usersErr) {
      console.error("[Paystack webhook] Failed to list users:", usersErr);
      return NextResponse.json({ error: "Failed to look up user" }, { status: 500 });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      console.error("[Paystack webhook] No user found for email:", email);
      // Return 200 so Paystack doesn't retry — user may not exist yet
      return NextResponse.json({ received: true, note: "User not found" });
    }

    console.log("[Paystack webhook] Found user:", user.id);

    // Upsert subscription — active for 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: upsertErr } = await supabase.from("subscriptions").upsert({
      profile_id: user.id,
      plan: (metadata?.plan as "individual" | "school") ?? "individual",
      paystack_reference: reference,
      active: true,
      expires_at: expiresAt.toISOString(),
    }, { onConflict: "profile_id" });

    if (upsertErr) {
      console.error("[Paystack webhook] Failed to upsert subscription:", upsertErr);
      return NextResponse.json({ error: "DB write failed" }, { status: 500 });
    }

    console.log("[Paystack webhook] Subscription activated for user:", user.id);
    return NextResponse.json({ received: true, activated: true });
  }

  console.log("[Paystack webhook] Unhandled event type:", event.event);
  return NextResponse.json({ received: true });
}
