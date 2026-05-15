"use client";

/**
 * Certificate — downloadable achievement certificate.
 * Generated as a canvas image, downloadable as PNG.
 * Shareable on WhatsApp.
 */
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CertificateProps {
  childName: string;
  achievement: string;   // e.g. "mastered all 26 letters" or "completed the Story Arc"
  subject?: string;      // e.g. "English Phonics"
  onClose: () => void;
}

export default function Certificate({ childName, achievement, subject = "English Phonics", onClose }: CertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 800;
    const H = 560;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = "#FFFBF0";
    ctx.fillRect(0, 0, W, H);

    // Amber border
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 12;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    // Inner border
    ctx.strokeStyle = "#FCD34D";
    ctx.lineWidth = 3;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // Corner decorations
    const corners = [[50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50]];
    corners.forEach(([x, y]) => {
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Parrot emoji (top centre)
    ctx.font = "56px serif";
    ctx.textAlign = "center";
    ctx.fillText("🦜", W / 2, 110);

    // "Certificate of Achievement"
    ctx.fillStyle = "#92400E";
    ctx.font = "bold 18px sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("CERTIFICATE OF ACHIEVEMENT", W / 2, 155);
    ctx.letterSpacing = "0px";

    // Divider
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 180, 170);
    ctx.lineTo(W / 2 + 180, 170);
    ctx.stroke();

    // "This certifies that"
    ctx.fillStyle = "#78716C";
    ctx.font = "italic 16px serif";
    ctx.fillText("This certifies that", W / 2, 210);

    // Child name
    ctx.fillStyle = "#1C1917";
    ctx.font = "bold 48px serif";
    ctx.fillText(childName, W / 2, 270);

    // Underline name
    const nameWidth = ctx.measureText(childName).width;
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameWidth / 2, 280);
    ctx.lineTo(W / 2 + nameWidth / 2, 280);
    ctx.stroke();

    // Achievement text
    ctx.fillStyle = "#44403C";
    ctx.font = "18px sans-serif";
    ctx.fillText(`has ${achievement}`, W / 2, 320);

    // Subject
    ctx.fillStyle = "#166534";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(subject, W / 2, 355);

    // "with Àmì by Kòkò"
    ctx.fillStyle = "#78716C";
    ctx.font = "italic 16px serif";
    ctx.fillText("with Àmì by Kòkò", W / 2, 390);

    // Date
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    ctx.fillStyle = "#A8A29E";
    ctx.font = "14px sans-serif";
    ctx.fillText(date, W / 2, 430);

    // Bottom divider
    ctx.strokeStyle = "#FCD34D";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 200, 450);
    ctx.lineTo(W / 2 + 200, 450);
    ctx.stroke();

    // Signature line
    ctx.fillStyle = "#D97706";
    ctx.font = "bold italic 22px serif";
    ctx.fillText("Àmì by Kòkò", W / 2, 490);
    ctx.fillStyle = "#A8A29E";
    ctx.font = "11px sans-serif";
    ctx.fillText("amibykoko.com", W / 2, 510);

    setDataUrl(canvas.toDataURL("image/png"));
  }, [childName, achievement, subject]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${childName.replace(/\s+/g, "_")}_certificate.png`;
    a.click();
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `🎉 ${childName} has ${achievement} with Àmì by Kòkò! 🦜\n\nTry it free at amibykoko.com`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg"
      >
        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview */}
        {dataUrl && (
          <div className="p-4 bg-stone-50 border-b border-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt="Certificate preview"
              className="w-full rounded-2xl shadow-sm" />
          </div>
        )}

        {/* Actions */}
        <div className="p-5 flex flex-col gap-3">
          <h2 className="font-extrabold text-stone-800 text-lg text-center">
            🎉 Certificate ready!
          </h2>

          <button onClick={download}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-amber-200">
            ⬇ Download PNG
          </button>

          <button onClick={shareWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-green-200">
            📱 Share on WhatsApp
          </button>

          <button onClick={onClose}
            className="w-full text-stone-500 font-semibold py-2.5 rounded-2xl hover:bg-stone-50 transition text-sm">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
