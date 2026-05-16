/**
 * POST /api/progress
 * Upserts a progress row for a child.
 * Uses service role to bypass RLS for school children
 * (whose parent_id is null, so the browser-client policy blocks writes).
 *
 * Verifies the caller's session before writing.
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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { childId, language, letter, subject, cls, term, patch } = body;

  if (!childId || !language || !letter) {
    return NextResponse.json({ error: "childId, language and letter are required." }, { status: 400 });
  }

  const { anonClient, serviceClient } = await getClients();

  // Verify session
  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (serviceClient as any)
    .from("progress")
    .upsert({
      child_id: childId,
      language,
      letter,
      subject: subject ?? "literacy",
      class: cls ?? null,
      term: term ?? null,
      ...patch,
      last_activity: new Date().toISOString(),
    }, { onConflict: "child_id,language,letter" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
