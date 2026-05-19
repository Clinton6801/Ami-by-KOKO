/**
 * awardCertificate — client-side helper to award a certificate via the API.
 * Returns true if newly awarded, false if already earned or error.
 * Never throws — all errors are caught and logged.
 *
 * Use this in pages/components that don't have useCertificates mounted.
 */
import type { CertificateType } from "@/types";

export async function awardCertificate(
  childId: string,
  type: CertificateType
): Promise<boolean> {
  try {
    const res = await fetch("/api/certificates/award", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, type }),
    });
    const json = await res.json();
    console.log(`[awardCertificate] ${type}:`, json);
    return res.ok && json.awarded === true;
  } catch (err) {
    console.error("[awardCertificate] error:", err);
    return false;
  }
}
