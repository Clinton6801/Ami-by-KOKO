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

// Use service role key — this runs server-side only, bypasses RLS
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("[webhook] NEXT_PUBLIC_SUPABASE_URL present:", !!url);
  console.log("[webhook] SUPABASE_SERVICE_ROLE_KEY present:", !!key);

  if (!url || !key) {
    throw new Error("Missing Supabase env vars — cannot create admin client");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  console.log("[webhook] PAYSTACK_SECRET_KEY present:", !!secret);

  if (!secret) {
    console.error("[webhook] PAYSTACK_SECRET_KEY is not set — cannot verify signature");
    return false;
  }

  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  const match = hash === signature;
  console.log("[webhook] Signature match:", match);
  return match;
}

export async function POST(request: NextRequest) {
  console.log("[webhook] POST received");

  const body = await request.text();
  console.log("[webhook] Raw body length:", body.length);

  const signature = request.headers.get("x-paystack-signature") ?? "";
  console.log("[webhook] x-paystack-signature present:", !!signature);

  // Verify the request is genuinely from Paystack
  if (!verifySignature(body, signature)) {
    console.error("[webhook] Signature verification FAILED — rejecting request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  console.log("[webhook] Signature verified OK");

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch (err) {
    console.error("[webhook] JSON parse error:", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[webhook] Event type received:", event.event);
  console.log("[webhook] Full event body:", JSON.stringify(event, null, 2));

  if (event.event !== "charge.success") {
    console.log("[webhook] Ignoring non-charge.success event:", event.event);
    return NextResponse.json({ received: true });
  }

  console.log("[webhook] Handling charge.success");

  const data = event.data;
  const reference = data.reference as string;
  const customer = data.customer as { email: string } | null;
  const metadata = data.metadata as Record<string, string> | null;

  console.log("[webhook] reference:", reference);
  console.log("[webhook] customer.email:", customer?.email);
  console.log("[webhook] metadata:", JSON.stringify(metadata));

  // Prefer profile_id from metadata (passed at checkout), fall back to email lookup
  let profileId: string | null = metadata?.profile_id ?? null;
  console.log("[webhook] profile_id from metadata:", profileId);

  let supabase: ReturnType<typeof getAdminClient>;
  try {
    supabase = getAdminClient();
  } catch (err) {
    console.error("[webhook] Failed to create admin client:", err);
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  // If no profile_id in metadata, look up by email
  if (!profileId) {
    const email = customer?.email;
    if (!email) {
      console.error("[webhook] No profile_id in metadata and no customer email — cannot identify user");
      return NextResponse.json({ error: "Cannot identify user" }, { status: 400 });
    }

    console.log("[webhook] No profile_id in metadata — looking up user by email:", email);

    // listUsers supports a filter by email to avoid paginating all users
    const { data: userList, error: lookupError } = await supabase.auth.admin.listUsers({
      // @ts-expect-error — filter param exists at runtime but is missing from older type defs
      filter: `email.eq.${email}`,
    });

    // Fall back: search the returned page manually if filter isn't supported
    const matchedUser = userList?.users?.find((u) => u.email === email) ?? null;

    if (lookupError || !matchedUser) {
      console.error("[webhook] User lookup by email failed:", lookupError?.message ?? "user not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    profileId = matchedUser.id;
    console.log("[webhook] Resolved profile_id from email lookup:", profileId);
  }

  // Upsert subscription — active for 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const plan = (metadata?.plan as "individual" | "school") ?? "individual";
  console.log("[webhook] Writing subscription — profile_id:", profileId, "plan:", plan, "expires_at:", expiresAt.toISOString());

  // NOTE: subscriptions table has no unique constraint on profile_id,
  // so we insert a new row rather than upsert (which requires a unique column).
  // To avoid duplicates on retry, we first check for an existing row with this reference.
  const { data: existing, error: checkError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("paystack_reference", reference)
    .maybeSingle();

  if (checkError) {
    console.error("[webhook] Error checking for existing subscription:", checkError.message, checkError);
  }

  if (existing) {
    console.log("[webhook] Subscription for reference already exists — updating active/expires_at:", existing.id);
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        active: true,
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("[webhook] DB update FAILED:", updateError.message, updateError);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    console.log("[webhook] DB update SUCCESS for id:", existing.id);
  } else {
    console.log("[webhook] No existing row — inserting new subscription");
    const { data: inserted, error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        profile_id: profileId,
        plan,
        paystack_reference: reference,
        active: true,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[webhook] DB insert FAILED:", insertError.message, insertError);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    console.log("[webhook] DB insert SUCCESS — new subscription id:", inserted?.id);
  }

  console.log("[webhook] Done — returning 200");
  return NextResponse.json({ received: true });
}
