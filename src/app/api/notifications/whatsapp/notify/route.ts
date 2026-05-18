/**
 * POST /api/notifications/whatsapp/notify
 * Client-callable proxy that looks up the parent's phone number
 * and sends a WhatsApp notification server-side.
 *
 * Accepts: { childId, type, detail }
 * Silently skips if no phone number saved.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { WhatsAppNotificationType } from "../route";

export async function POST(request: NextRequest) {
  const { childId, type, detail } = await request.json() as {
    childId: string;
    type: WhatsAppNotificationType;
    detail: string;
  };

  if (!childId || !type) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
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

  // Verify session
  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) return NextResponse.json({ skipped: true });

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get child's parent_id and name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: child } = await (adminClient as any)
    .from("children")
    .select("name, parent_id")
    .eq("id", childId)
    .single();

  if (!child?.parent_id) return NextResponse.json({ skipped: true });

  // Get parent's phone number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (adminClient as any)
    .from("profiles")
    .select("phone_number, whatsapp_notifications")
    .eq("id", child.parent_id)
    .single();

  if (!profile?.phone_number || profile.whatsapp_notifications === false) {
    return NextResponse.json({ skipped: true, reason: "No phone number" });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ami-by-koko.vercel.app";

  // Forward to the main WhatsApp route
  await fetch(`${baseUrl}/api/notifications/whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: profile.phone_number,
      type,
      data: { childName: child.name, detail, appUrl: baseUrl },
    }),
  });

  return NextResponse.json({ sent: true });
}
