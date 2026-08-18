/**
 * DEBUG ENDPOINT - Test real-time listener (development only)
 * POST /api/debug/realtime-test?email=parent@example.com
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (!users) {
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentSub } = await (supabase as any)
    .from("subscriptions")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  const newActive = !currentSub?.active;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updated, error: updateErr } = await (supabase as any)
    .from("subscriptions")
    .upsert({
      profile_id: user.id,
      plan: currentSub?.plan ?? "individual",
      paystack_reference: currentSub?.paystack_reference ?? `debug_${Date.now()}`,
      active: newActive,
      expires_at: newActive ? expiresAt.toISOString() : currentSub?.expires_at,
    }, { onConflict: "profile_id" })
    .select();

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    action: newActive ? "activated" : "deactivated",
    message: "Check browser console for [useAccess] logs",
    subscription: updated?.[0],
  });
}
