/**
 * DEBUG ENDPOINT - Check subscription status (development only)
 * GET /api/debug/subscription-status?email=parent@example.com
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription } = await (supabase as any)
    .from("subscriptions")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  const now = new Date();
  const isActive = subscription && subscription.active && (!subscription.expires_at || new Date(subscription.expires_at) > now);

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    subscription,
    hasPaid: isActive,
  });
}
