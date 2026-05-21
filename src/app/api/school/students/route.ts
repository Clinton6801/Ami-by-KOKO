/**
 * POST   /api/school/students  — create a student + Supabase auth account
 * PATCH  /api/school/students  — update a student (updates auth password if PIN changed)
 * DELETE /api/school/students  — delete a student + their auth account
 *
 * Uses the service role key to bypass RLS and manage auth users.
 * Verifies the caller is a school_admin for the given school_id before acting.
 *
 * Student auth strategy:
 * - Synthetic email: {child_id}@students.amibykoko.com
 * - Password: {school_id}-{pin}  (never shown to the student)
 * - This gives students a real cross-device Supabase session via PIN login
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { friendlyError } from "@/lib/api/errors";

async function getClients() {
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

  // Service role client for DB writes (bypasses RLS)
  const serviceClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Admin client for auth.admin operations (createUser, updateUser, deleteUser)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  return { anonClient, serviceClient, adminClient };
}

/** Verify caller is a school_admin for the given schoolId */
async function verifyAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  anonClient: any,
  schoolId: string
): Promise<{ userId: string } | NextResponse> {
  const { data: { user }, error } = await anonClient.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (anonClient as any)
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "school_admin" || profile.school_id !== schoolId) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  return { userId: user.id };
}

/** Synthetic email for a student — never receives real email */
function studentEmail(childId: string): string {
  return `${childId}@students.amibykoko.com`;
}

/** Password derived from school + PIN — never shown to the student */
function studentPassword(schoolId: string, pin: string): string {
  return `${schoolId}-${pin}`;
}

// ─── POST — create student ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { schoolId, name, age, cls, term, pin, avatar } = body;

  if (!schoolId || !name?.trim()) {
    return NextResponse.json({ error: "schoolId and name are required." }, { status: 400 });
  }

  const { anonClient, serviceClient, adminClient } = await getClients();
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) return auth;

  // 1. Create the children row first to get the child ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: child, error: childErr } = await (serviceClient as any)
    .from("children")
    .insert({
      name: name.trim(),
      age: age ? parseInt(age) : null,
      class: cls ?? "sprout_1",
      term: term ?? 1,
      student_pin: pin || null,
      avatar_url: avatar ?? "🧒🏾",
      school_id: schoolId,
    })
    .select()
    .single();

  if (childErr || !child) {
    return NextResponse.json({ error: friendlyError(childErr, "Failed to add student.") }, { status: 500 });
  }

  // 2. Create Supabase auth account (only if PIN is set — PIN is required for login)
  if (pin) {
    const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
      email: studentEmail(child.id),
      password: studentPassword(schoolId, pin),
      email_confirm: true, // skip email confirmation
      user_metadata: {
        role: "student",
        child_id: child.id,
        school_id: schoolId,
      },
    });

    if (!authErr && authUser?.user) {
      // 3. Link auth_user_id back to the children row
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (serviceClient as any)
        .from("children")
        .update({ auth_user_id: authUser.user.id })
        .eq("id", child.id);

      child.auth_user_id = authUser.user.id;
    }
    // Auth creation failure is non-fatal — student can still be added manually
    // and the admin can edit to trigger auth creation on next save
  }

  return NextResponse.json({ student: child });
}

// ─── PATCH — update student ───────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { schoolId, studentId, name, age, cls, term, pin, avatar } = body;

  if (!schoolId || !studentId) {
    return NextResponse.json({ error: "schoolId and studentId are required." }, { status: 400 });
  }

  const { anonClient, serviceClient, adminClient } = await getClients();
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) return auth;

  // Fetch current child to check existing auth_user_id and PIN
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (serviceClient as any)
    .from("children")
    .select("auth_user_id, student_pin")
    .eq("id", studentId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (serviceClient as any)
    .from("children")
    .update({
      name: name?.trim(),
      age: age ? parseInt(age) : null,
      class: cls,
      term,
      student_pin: pin || null,
      avatar_url: avatar,
    })
    .eq("id", studentId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: friendlyError(error, "Failed to update student.") }, { status: 500 });

  // Create or update auth account
  if (pin) {
    if (existing?.auth_user_id) {
      // Auth account exists — update password only if PIN changed
      if (pin !== existing?.student_pin) {
        await adminClient.auth.admin.updateUserById(existing.auth_user_id, {
          password: studentPassword(schoolId, pin),
        });
      }
    } else {
      // No auth account yet — create one now (regardless of whether PIN changed)
      const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
        email: studentEmail(studentId),
        password: studentPassword(schoolId, pin),
        email_confirm: true,
        user_metadata: { role: "student", child_id: studentId, school_id: schoolId },
      });
      if (authErr) {
        console.error("[students PATCH] auth create error:", authErr);
      } else if (authUser?.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (serviceClient as any)
          .from("children")
          .update({ auth_user_id: authUser.user.id })
          .eq("id", studentId);
        console.log("[students PATCH] auth account created:", authUser.user.id);
      }
    }
  }

  return NextResponse.json({ student: data });
}

// ─── DELETE — remove student ──────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { schoolId, studentId } = body;

  if (!schoolId || !studentId) {
    return NextResponse.json({ error: "schoolId and studentId are required." }, { status: 400 });
  }

  const { anonClient, serviceClient, adminClient } = await getClients();
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) return auth;

  // Fetch auth_user_id before deleting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: child } = await (serviceClient as any)
    .from("children")
    .select("auth_user_id")
    .eq("id", studentId)
    .single();

  // Delete the children row (cascades to progress, sessions, assignment_progress)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (serviceClient as any)
    .from("children")
    .delete()
    .eq("id", studentId)
    .eq("school_id", schoolId);

  if (error) return NextResponse.json({ error: friendlyError(error, "Failed to remove student.") }, { status: 500 });

  // Delete the Supabase auth account
  if (child?.auth_user_id) {
    await adminClient.auth.admin.deleteUser(child.auth_user_id);
  }

  return NextResponse.json({ ok: true });
}
