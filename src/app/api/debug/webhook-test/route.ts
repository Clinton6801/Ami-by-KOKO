/**
 * DEBUG ENDPOINT - Test webhook functionality (development only)
 * POST /api/debug/webhook-test?email=parent@example.com
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function createTestSignature(body: string): string {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  return crypto.createHmac("sha512", secret).update(body).digest("hex");
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Debug endpoint disabled in production" }, { status: 403 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (usersErr || !users) {
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return NextResponse.json(
      { error: "User not found", availableUsers: users.map(u => u.email) },
      { status: 404 }
    );
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subData, error: subErr } = await (supabase as any)
    .from("subscriptions")
    .upsert({
      profile_id: user.id,
      plan: "individual",
      paystack_reference: `test_${Date.now()}`,
      active: true,
      expires_at: expiresAt.toISOString(),
    }, { onConflict: "profile_id" })
    .select();

  if (subErr) {
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email },
    subscription: subData?.[0],
  });
}
