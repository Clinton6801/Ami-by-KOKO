"use client";

/**
 * useCertificates — fetches and awards certificates for a child.
 *
 * Reads use the browser Supabase client.
 * Writes go through /api/certificates/award (service role) to bypass RLS.
 */
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Certificate, CertificateType } from "@/types";

export function useCertificates(childId: string | null) {
  const supabase = createClient();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!childId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("certificates")
      .select("*")
      .eq("child_id", childId)
      .order("earned_at", { ascending: false });

    console.log("[useCertificates] fetched:", data?.length ?? 0, "error:", error);
    setCertificates((data as Certificate[]) ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [childId, refresh]);

  /**
   * Award a certificate via service-role API route.
   * Returns true if newly awarded, false if already earned or error.
   */
  const awardCertificate = useCallback(
    async (type: CertificateType): Promise<boolean> => {
      if (!childId) return false;

      // Optimistic check — skip if already in local state
      if (certificates.some(c => c.type === type)) {
        console.log("[useCertificates] already earned locally:", type);
        return false;
      }

      console.log("[useCertificates] calling /api/certificates/award for:", type);

      const res = await fetch("/api/certificates/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, type }),
      });

      const json = await res.json();
      console.log("[useCertificates] award response:", json);

      if (!res.ok) {
        console.error("[useCertificates] award failed:", json.error);
        return false;
      }

      if (!json.awarded) {
        // Already earned in DB — refresh local state
        await refresh();
        return false;
      }

      // Newly awarded — refresh and notify parent
      await refresh();

      // WhatsApp notification (fire-and-forget)
      fetch("/api/notifications/whatsapp/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          type: "milestone",
          detail: type.replace(/_/g, " "),
        }),
      }).catch(() => {});

      return true;
    },
    [childId, certificates, refresh]
  );

  const hasCertificate = useCallback(
    (type: CertificateType): boolean => certificates.some(c => c.type === type),
    [certificates]
  );

  return { certificates, loading, awardCertificate, hasCertificate, refresh };
}
