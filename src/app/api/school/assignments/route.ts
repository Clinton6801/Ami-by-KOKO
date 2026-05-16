/**
 * POST   /api/school/assignments  — create assignment + auto-assign to class
 * PATCH  /api/school/assignments  — update assignment
 *
 * Uses service role to bypass RLS.
 * Verifies caller is a school_admin for the given school.
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyAdmin(anonClient: any, schoolId: string): Promise<{ userId: string } | NextResponse> {
  const { data: { user }, error } = await anonClient.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (anonClient as any)
    .from("profiles").select("role, school_id").eq("id", user.id).single();

  if (!profile || profile.role !== "school_admin" || profile.school_id !== schoolId) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }
  return { userId: user.id };
}

function deriveActivityType(subject: string): string {
  if (subject === "numeracy") return "counting";
  if (subject === "world") return "matching";
  return "tracing"; // literacy default
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { schoolId, cls, subject, term, title, contentKeys, dueDate, autoAssign } = body;

  if (!schoolId || !cls || !subject || !term || !title || !contentKeys?.length) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { anonClient, serviceClient } = await getClients();
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) return auth;

  const payload = {
    school_id: schoolId,
    class: cls,
    subject,
    term,
    title: title.trim(),
    activity_type: deriveActivityType(subject),
    content_keys: contentKeys,
    due_date: dueDate || null,
    created_by: auth.userId,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignment, error: aErr } = await (serviceClient as any)
    .from("assignments").insert(payload).select("id").single();

  if (aErr || !assignment) {
    return NextResponse.json({ error: aErr?.message ?? "Failed to create assignment." }, { status: 500 });
  }

  // Auto-assign to all students in this class
  if (autoAssign) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: students } = await (serviceClient as any)
      .from("children").select("id").eq("school_id", schoolId).eq("class", cls);

    if (students && students.length > 0) {
      const rows = students.map((s: { id: string }) => ({
        assignment_id: assignment.id,
        child_id: s.id,
        completed: false,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (serviceClient as any).from("assignment_progress").insert(rows);
    }
  }

  return NextResponse.json({ assignment });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { schoolId, assignmentId, cls, subject, term, title, contentKeys, dueDate } = body;

  if (!schoolId || !assignmentId) {
    return NextResponse.json({ error: "schoolId and assignmentId are required." }, { status: 400 });
  }

  const { anonClient, serviceClient } = await getClients();
  const auth = await verifyAdmin(anonClient, schoolId);
  if (auth instanceof NextResponse) return auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (serviceClient as any)
    .from("assignments")
    .update({
      class: cls,
      subject,
      term,
      title: title?.trim(),
      activity_type: subject ? deriveActivityType(subject) : undefined,
      content_keys: contentKeys,
      due_date: dueDate || null,
    })
    .eq("id", assignmentId)
    .eq("school_id", schoolId)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assignment: data });
}
