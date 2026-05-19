/**
 * POST /api/certificates/award
 * Awards a certificate to a child using the service role key (bypasses RLS).
 * Uses ON CONFLICT DO NOTHING so duplicate awards are silently ignored.
 *
 * Body: { childId: string, type: CertificateType }
 * Returns: { awarded: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { childId, type } = await request.json();

  if (!childId || !type) {
    return NextResponse.json({ error: "childId and type are required." }, { status: 400 });
  }

  const cookieStore = await cookies();

  // Verify the caller is authenticated
  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* server component */ }
        },
      },
    }
  );

  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Use service role to bypass RLS
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if already awarded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (adminClient as any)
    .from("certificates")
    .select("id")
    .eq("child_id", childId)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    console.log(`[certificates/award] already exists: ${childId} / ${type}`);
    return NextResponse.json({ awarded: false, reason: "already_earned" });
  }

  // Insert
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertErr } = await (adminClient as any)
    .from("certificates")
    .insert({ child_id: childId, type });

  if (insertErr) {
    // ON CONFLICT — already exists, not an error
    if (insertErr.code === "23505") {
      return NextResponse.json({ awarded: false, reason: "already_earned" });
    }
    console.error("[certificates/award] insert error:", insertErr);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  console.log(`[certificates/award] ✅ awarded: ${childId} / ${type}`);
  return NextResponse.json({ awarded: true });
}
