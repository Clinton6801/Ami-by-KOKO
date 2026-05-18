/**
 * Dynamic OG image — served at /og-image.png
 * Uses Next.js ImageResponse to generate a 1200×630 PNG.
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FEF9C3 0%, #FEF3C7 50%, #FDE68A 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background decorative circles */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(245,158,11,0.15)",
          display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(22,163,74,0.12)",
          display: "flex",
        }} />

        {/* Parrot emoji */}
        <div style={{ fontSize: 120, marginBottom: 24, display: "flex" }}>🦜</div>

        {/* App name */}
        <div style={{
          fontSize: 72,
          fontWeight: 900,
          color: "#92400E",
          marginBottom: 16,
          display: "flex",
          letterSpacing: "-2px",
        }}>
          Àmì by Kòkò
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 32,
          color: "#78716C",
          textAlign: "center",
          maxWidth: 800,
          display: "flex",
          lineHeight: 1.4,
        }}>
          Phonics &amp; early learning for African children aged 0–8
        </div>

        {/* Badge */}
        <div style={{
          marginTop: 32,
          background: "#F59E0B",
          color: "white",
          fontSize: 24,
          fontWeight: 700,
          padding: "12px 32px",
          borderRadius: 50,
          display: "flex",
        }}>
          🌍 Free to start · English + African languages
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
