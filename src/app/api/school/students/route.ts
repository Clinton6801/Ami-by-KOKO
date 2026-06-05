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
  return `student_${childId}@amibykoko.app`;
}

/** Password: SCHOOLCODE-PIN */
function studentPassword(schoolCode: string, pin: string): string {
  return `${schoolCode.toUpperCase()}-${pin}`;
}

// ─── POST — create student ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  console.log("[POST students] Starting student creation");
  console.log("[POST students] Service role key present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const body = await request.json();
  const { schoolId, name, age, cls, term, pin, avatar } = body;
  console.log("[POST students] Received body:", { schoolId, name, age, cls, term, pin: pin ? "***" : null, avatar });

  if (!schoolId || !name?.trim()) {
    console.log("[POST students] Validation failed: missing schoolId or name");
    return NextResponse.json({ error: "schoolId and name are required." }, { status: 400 });
  }

  console.log("[POST students] Getting clients...");
  const { anonClient, serviceClient, adminClient } = await getClients();
  console.log("[POST students] Clients created successfully");
  
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) {
    console.log("[POST students] Admin verification failed");
    return auth;
  }
  console.log("[POST students] Admin verified:", auth.userId);

  // Step 1: Create the children row first to get the child ID
  console.log("[POST students] Step 1: Inserting child into database...");
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

  console.log("[POST students] Step 1 result:", { childId: child?.id, error: childErr?.message });
  
  if (childErr || !child) {
    console.error("[POST students] Step 1 failed:", childErr);
    return NextResponse.json({ error: friendlyError(childErr, "Failed to add student.") }, { status: 500 });
  }

  // Step 2: Create Supabase auth account (only if PIN is set — PIN is required for login)
  if (pin) {
    console.log("[POST students] Step 2: PIN provided, fetching school code...");
    
    // Fetch school_code for password construction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: school, error: schoolErr } = await (serviceClient as any)
      .from("schools")
      .select("school_code")
      .eq("id", schoolId)
      .single();
    
    console.log("[POST students] Step 2a result:", { schoolCode: school?.school_code, error: schoolErr?.message });
    
    if (schoolErr || !school?.school_code) {
      console.error("[POST students] Step 2a failed: Could not fetch school code");
      // Continue anyway — use schoolId as fallback
    }
    
    const schoolCode = (school?.school_code ?? schoolId).toUpperCase();
    const email = studentEmail(child.id);
    const password = studentPassword(schoolCode, pin);
    
    console.log("[POST students] Step 2b: Creating auth account...", { email, passwordLength: password.length });

    const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email confirmation
      user_metadata: {
        role: "student",
        child_id: child.id,
        school_id: schoolId,
      },
    });

    console.log("[POST students] Step 2b result:", { authUserId: authUser?.user?.id, error: authErr?.message });

    if (authErr) {
      console.error("[POST students] Step 2b failed: Auth creation error", authErr);
    } else if (authUser?.user?.id) {
      // Step 3: Link auth_user_id back to the children row
      console.log("[POST students] Step 3: Updating auth_user_id on child record...");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateErr } = await (serviceClient as any)
        .from("children")
        .update({ auth_user_id: authUser.user.id })
        .eq("id", child.id);
      
      console.log("[POST students] Step 3 result:", { error: updateErr?.message });
      
      if (!updateErr) {
        child.auth_user_id = authUser.user.id;
        console.log("[POST students] Auth account successfully created and linked");
      } else {
        console.error("[POST students] Step 3 failed: Could not update auth_user_id", updateErr);
      }
    }
  } else {
    console.log("[POST students] No PIN provided - skipping auth account creation");
  }

  console.log("[POST students] Returning student:", { childId: child.id, name: child.name, hasAuth: !!child.auth_user_id });
  return NextResponse.json({ student: child });
}

// ─── PATCH — update student ───────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  console.log("[PATCH students] Starting student update");
  const body = await request.json();
  const { schoolId, studentId, name, age, cls, term, pin, avatar } = body;
  console.log("[PATCH students] Received:", { schoolId, studentId, name, pin: pin ? "***" : null });

  if (!schoolId || !studentId) {
    return NextResponse.json({ error: "schoolId and studentId are required." }, { status: 400 });
  }

  const { anonClient, serviceClient, adminClient } = await getClients();
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) return auth;

  // Fetch current child to check existing auth_user_id and PIN
  console.log("[PATCH students] Fetching existing student record...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (serviceClient as any)
    .from("children")
    .select("auth_user_id, student_pin")
    .eq("id", studentId)
    .single();
  
  console.log("[PATCH students] Existing record:", { auth_user_id: existing?.auth_user_id, pin: existing?.student_pin ? "***" : null });

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

  if (error) {
    console.error("[PATCH students] Database update failed:", error);
    return NextResponse.json({ error: friendlyError(error, "Failed to update student.") }, { status: 500 });
  }

  console.log("[PATCH students] Database update successful");

  // Fetch school_code for password construction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (serviceClient as any)
    .from("schools")
    .select("school_code")
    .eq("id", schoolId)
    .single();
  const schoolCode = (school?.school_code ?? schoolId).toUpperCase();

  // Create or update auth account
  if (pin) {
    if (existing?.auth_user_id) {
      // Auth account exists — update password only if PIN changed
      if (pin !== existing?.student_pin) {
        console.log("[PATCH students] PIN changed - updating auth password");
        const { error: updateErr } = await adminClient.auth.admin.updateUserById(existing.auth_user_id, {
          password: studentPassword(schoolCode, pin),
        });
        if (updateErr) console.error("[PATCH students] Password update failed:", updateErr);
        else console.log("[PATCH students] Password updated successfully");
      } else {
        console.log("[PATCH students] PIN unchanged - no auth update needed");
      }
    } else {
      // No auth account yet — create one now
      console.log("[PATCH students] No auth account yet - creating new one");
      const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
        email: studentEmail(studentId),
        password: studentPassword(schoolCode, pin),
        email_confirm: true,
        user_metadata: { role: "student", child_id: studentId, school_id: schoolId },
      });
      if (authErr) {
        console.error("[PATCH students] Auth create error:", authErr);
      } else if (authUser?.user?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: linkErr } = await (serviceClient as any)
          .from("children")
          .update({ auth_user_id: authUser.user.id })
          .eq("id", studentId);
        
        if (linkErr) console.error("[PATCH students] Link auth_user_id failed:", linkErr);
        else console.log("[PATCH students] Auth account created and linked:", authUser.user.id);
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
