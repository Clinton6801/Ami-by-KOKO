"use client";

/**
 * useCertificates — fetches and awards certificates for a child.
 *
 * Certificates are awarded when milestones are reached (e.g., completing A-F, A-Z, etc.).
 * Each certificate type can only be earned once per child.
 */
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Certificate, CertificateType } from "@/types";

export function useCertificates(childId: string | null) {
  const supabase = createClient();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!childId) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("certificates")
        .select("*")
        .eq("child_id", childId)
        .order("earned_at", { ascending: false });
      if (!cancelled) {
        setCertificates((data as Certificate[]) ?? []);
        setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  /**
   * Award a certificate to a child if they haven't already earned it.
   * Returns true if the certificate was newly awarded, false if already earned.
   */
  const awardCertificate = useCallback(
    async (type: CertificateType): Promise<boolean> => {
      if (!childId) return false;

      // Check if already earned
      const alreadyEarned = certificates.some(c => c.type === type);
      if (alreadyEarned) return false;

      // Insert new certificate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("certificates")
        .insert({ child_id: childId, type });

      if (error) {
        console.error("Failed to award certificate:", error);
        return false;
      }

      // Refresh certificates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("certificates")
        .select("*")
        .eq("child_id", childId)
        .order("earned_at", { ascending: false });
      setCertificates((data as Certificate[]) ?? []);

      return true;
    },
    [childId, certificates, supabase]
  );

  /**
   * Check if a specific certificate type has been earned.
   */
  const hasCertificate = useCallback(
    (type: CertificateType): boolean => {
      return certificates.some(c => c.type === type);
    },
    [certificates]
  );

  return { certificates, loading, awardCertificate, hasCertificate };
}
