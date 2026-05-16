/**
 * POST  /api/sessions  — start a session
 * PATCH /api/sessions  — end a session (set ended_at)
 *
 * Uses service role to bypass RLS for school children
 * (parent_id is null, so the browser-client policy blocks writes).
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
  const { childId, mode } = await request.json();
  if (!childId || !mode) return NextResponse.json({ error: "childId and mode required." }, { status: 400 });

  const { anonClient, serviceClient } = await getClients();
  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (serviceClient as any)
    .from("sessions")
    .insert({ child_id: childId, mode })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessionId: data.id });
}

export async function PATCH(request: NextRequest) {
  const { sessionId } = await request.json();
  if (!sessionId) return NextResponse.json({ error: "sessionId required." }, { status: 400 });

  const { anonClient, serviceClient } = await getClients();
  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (serviceClient as any)
    .from("sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
