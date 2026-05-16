/**
 * POST /api/school/create
 * Creates a school and links it to the calling user's profile.
 * Uses the service role key to bypass RLS — safe because we
 * verify the user's session server-side before doing anything.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "School name is required." }, { status: 400 });
  }

  const cookieStore = await cookies();

  // 1. Verify the user's session with the anon client
  const anonClient = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* server component — safe to ignore */ }
        },
      },
    }
  );

  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // 2. Use the service role client to bypass RLS for the insert
  const serviceClient = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  // 3. Insert the school — cast to any to work around service-role client generic inference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school, error: schoolErr } = await (serviceClient as any)
    .from("schools")
    .insert({ name: name.trim(), subscription_active: false })
    .select("id, school_code")
    .single();

  if (schoolErr || !school) {
    // Sanitise error — never expose raw Postgres messages to the client
    const msg = schoolErr?.code === "23505"
      ? "A school with this name already exists."
      : "Failed to create school. Please try again.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // 4. Link the profile to the new school
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileErr } = await (serviceClient as any)
    .from("profiles")
    .update({ school_id: school.id, role: "school_admin" })
    .eq("id", user.id);

  if (profileErr) {
    return NextResponse.json(
      { error: "School created but failed to link your profile. Please contact support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ school });
}
