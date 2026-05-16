/**
 * POST   /api/school/students  — create a student
 * PATCH  /api/school/students  — update a student
 * DELETE /api/school/students  — delete a student
 *
 * Uses the service role key to bypass RLS.
 * Verifies the caller is a school_admin for the given school_id before acting.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

  const serviceClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  return { anonClient, serviceClient };
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

// ─── POST — create student ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { schoolId, name, age, cls, term, pin, avatar } = body;

  if (!schoolId || !name?.trim()) {
    return NextResponse.json({ error: "schoolId and name are required." }, { status: 400 });
  }

  const { anonClient, serviceClient } = await getClients();
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) return auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (serviceClient as any)
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ student: data });
}

// ─── PATCH — update student ───────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { schoolId, studentId, name, age, cls, term, pin, avatar } = body;

  if (!schoolId || !studentId) {
    return NextResponse.json({ error: "schoolId and studentId are required." }, { status: 400 });
  }

  const { anonClient, serviceClient } = await getClients();
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) return auth;

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
    .eq("school_id", schoolId)   // safety: only update students in this school
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ student: data });
}

// ─── DELETE — remove student ──────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { schoolId, studentId } = body;

  if (!schoolId || !studentId) {
    return NextResponse.json({ error: "schoolId and studentId are required." }, { status: 400 });
  }

  const { anonClient, serviceClient } = await getClients();
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) return auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (serviceClient as any)
    .from("children")
    .delete()
    .eq("id", studentId)
    .eq("school_id", schoolId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
