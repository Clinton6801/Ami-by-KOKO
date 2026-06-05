/**
 * POST /api/school/students/backfill-auth
 * Creates Supabase auth accounts for all school students that have a PIN
 * but no auth_user_id. Called once by the school admin to fix existing students.
 *
 * Body: { schoolId }
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { friendlyError } from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  console.log("[backfill-auth] Starting backfill...");
  console.log("[backfill-auth] Service role key present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { schoolId } = await request.json();
  if (!schoolId) {
    console.log("[backfill-auth] Missing schoolId");
    return NextResponse.json({ error: "schoolId required" }, { status: 400 });
  }

  const cookieStore = await cookies();
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

  // Verify caller is school admin
  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) {
    console.log("[backfill-auth] Not authenticated");
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (anonClient as any)
    .from("profiles").select("role, school_id").eq("id", user.id).single();
  
  if (!profile || profile.role !== "school_admin" || profile.school_id !== schoolId) {
    console.log("[backfill-auth] Not authorized");
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const serviceClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Fetch all students with a PIN but no auth_user_id
  console.log("[backfill-auth] Fetching students without auth accounts...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students, error: fetchErr } = await (serviceClient as any)
    .from("children")
    .select("id, student_pin, auth_user_id, name")
    .eq("school_id", schoolId)
    .not("student_pin", "is", null)
    .is("auth_user_id", null);

  if (fetchErr) {
    console.error("[backfill-auth] Fetch students error:", fetchErr);
    return NextResponse.json({ error: friendlyError(fetchErr, "Failed to fetch students.") }, { status: 500 });
  }

  console.log("[backfill-auth] Found students to fix:", students?.length ?? 0);

  if (!students || students.length === 0) {
    console.log("[backfill-auth] No students need fixing");
    return NextResponse.json({ message: "All students already have auth accounts.", created: 0, failed: 0 });
  }

  // Fetch school_code for password construction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (serviceClient as any)
    .from("schools")
    .select("school_code")
    .eq("id", schoolId)
    .single();

  const schoolCode = (school?.school_code ?? schoolId).toUpperCase();
  console.log("[backfill-auth] Using school code:", schoolCode);

  let created = 0;
  const errors: string[] = [];

  for (const student of students as { id: string; student_pin: string; auth_user_id: string | null; name: string }[]) {
    try {
      const email = `student_${student.id}@amibykoko.app`;
      const password = `${schoolCode}-${student.student_pin}`;
      
      console.log(`[backfill-auth] Creating auth for ${student.name} (${student.id})...`);

      // Check if auth user already exists with this email
      let existingUser = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: listData } = await (adminClient.auth.admin as any).listUsers();
        existingUser = listData?.users?.find((u: any) => u.email === email);
      } catch (listErr) {
        console.log(`[backfill-auth] Could not list users for ${student.id}, proceeding with create...`);
      }

      let authUserId: string | null = null;

      if (existingUser) {
        authUserId = existingUser.id;
        console.log(`[backfill-auth] Found existing auth user for ${student.id}: ${authUserId}`);
      } else {
        const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authErr) {
          console.error(`[backfill-auth] Failed to create auth for ${student.id}:`, authErr.message);
          errors.push(`${student.name}: ${authErr.message}`);
          continue;
        }
        authUserId = authUser?.user?.id ?? null;
        console.log(`[backfill-auth] Created new auth account: ${authUserId}`);
      }

      if (authUserId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: linkErr } = await (serviceClient as any)
          .from("children")
          .update({ auth_user_id: authUserId })
          .eq("id", student.id);
        
        if (linkErr) {
          console.error(`[backfill-auth] Failed to link auth_user_id for ${student.id}:`, linkErr);
          errors.push(`${student.name}: Failed to link auth account`);
        } else {
          created++;
          console.log(`[backfill-auth] Successfully fixed ${student.name}`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[backfill-auth] Unexpected error for ${student.name}:`, message);
      errors.push(`${student.name}: ${message}`);
    }
  }

  const summary = `Fixed ${created} of ${students.length} students.${errors.length > 0 ? ` ${errors.length} failed.` : ""}`;
  console.log("[backfill-auth]", summary);
  
  return NextResponse.json({
    message: summary,
    created,
    failed: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
