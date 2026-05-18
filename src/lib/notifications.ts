/**
 * Server-side notification helper.
 * Looks up the parent's phone number and sends a WhatsApp notification.
 * Silently skips if no phone number is saved — never throws.
 */
import { createClient } from "@supabase/supabase-js";
import type { WhatsAppNotificationType } from "@/app/api/notifications/whatsapp/route";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface NotifyOptions {
  /** The parent's profile_id (auth user id) */
  profileId: string;
  type: WhatsAppNotificationType;
  childName: string;
  detail: string;
  appUrl?: string;
}

export async function sendWhatsAppNotification(opts: NotifyOptions): Promise<void> {
  try {
    const supabase = getAdminClient();

    // Look up parent's phone number
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone_number, whatsapp_notifications")
      .eq("id", opts.profileId)
      .single();

    // Skip silently if no number or notifications disabled
    if (!profile?.phone_number || profile.whatsapp_notifications === false) return;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ami-by-koko.vercel.app";

    await fetch(`${baseUrl}/api/notifications/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: profile.phone_number,
        type: opts.type,
        data: {
          childName: opts.childName,
          detail: opts.detail,
          appUrl: baseUrl,
        },
      }),
    });
  } catch {
    // Never let notification failures break the main flow
  }
}
