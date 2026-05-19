"use client";

/**
 * Certificate — downloadable achievement certificate.
 * Generated using html2canvas, downloadable as PNG.
 * Shareable on WhatsApp.
 */
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";

interface CertificateProps {
  childName: string;
  achievement: string;   // e.g. "mastered all 26 letters" or "completed the Story Arc"
  subject?: string;      // e.g. "English Phonics"
  onClose: () => void;
}

export default function Certificate({ childName, achievement, subject = "English Phonics", onClose }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function download() {
    if (!certificateRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#FFFBF0",
        useCORS: true,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${childName.replace(/\s+/g, "_")}_certificate.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download certificate:", error);
    } finally {
      setDownloading(false);
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `🦜 ${childName} just earned the '${subject ?? "Achievement"}' certificate on Àmì by Kòkò! 🎉\n\nTry it free at ami-by-koko.vercel.app`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg"
      >
        {/* Certificate preview - rendered with html2canvas */}
        <div className="p-4 bg-stone-50 border-b border-stone-100">
          <div
            ref={certificateRef}
            className="bg-[#FFFBF0] p-6 rounded-2xl shadow-sm"
            style={{ width: "100%", aspectRatio: "800/560" }}
          >
            {/* Amber border */}
            <div className="border-[12px] border-[#F59E0B] rounded-lg h-full relative">
              {/* Inner border */}
              <div className="border-[3px] border-[#FCD34D] rounded-lg h-full m-1 relative">
                {/* Corner decorations */}
                <div className="absolute top-4 left-4 w-4 h-4 bg-[#F59E0B] rounded-full" />
                <div className="absolute top-4 right-4 w-4 h-4 bg-[#F59E0B] rounded-full" />
                <div className="absolute bottom-4 left-4 w-4 h-4 bg-[#F59E0B] rounded-full" />
                <div className="absolute bottom-4 right-4 w-4 h-4 bg-[#F59E0B] rounded-full" />

                {/* Content */}
                <div className="flex flex-col items-center justify-center h-full px-4 py-2">
                  {/* Parrot emoji */}
                  <div className="text-5xl mb-2">🦜</div>

                  {/* Certificate title */}
                  <div className="text-[#92400E] font-bold text-sm tracking-widest mb-1">
                    CERTIFICATE OF ACHIEVEMENT
                  </div>

                  {/* Divider */}
                  <div className="w-3/4 h-[2px] bg-[#F59E0B] mb-3" />

                  {/* "This certifies that" */}
                  <div className="text-[#78716C] italic text-sm mb-2">
                    This certifies that
                  </div>

                  {/* Child name */}
                  <div className="text-[#1C1917] font-bold text-3xl mb-1">
                    {childName}
                  </div>

                  {/* Underline name */}
                  <div className="w-3/4 h-[2px] bg-[#F59E0B] mb-3" />

                  {/* Achievement text */}
                  <div className="text-[#44403C] text-base mb-1">
                    has {achievement}
                  </div>

                  {/* Subject */}
                  <div className="text-[#166534] font-bold text-lg mb-2">
                    {subject}
                  </div>

                  {/* "with Àmì by Kòkò" */}
                  <div className="text-[#78716C] italic text-sm mb-2">
                    with Àmì by Kòkò
                  </div>

                  {/* Date */}
                  <div className="text-[#A8A29E] text-xs mb-3">
                    {date}
                  </div>

                  {/* Bottom divider */}
                  <div className="w-4/5 h-[1px] bg-[#FCD34D] mb-2" />

                  {/* Signature */}
                  <div className="text-[#D97706] font-bold italic text-lg">
                    Àmì by Kòkò
                  </div>
                  <div className="text-[#A8A29E] text-xs">
                    amibykoko.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 flex flex-col gap-3">
          <h2 className="font-extrabold text-stone-800 text-lg text-center">
            🎉 Certificate ready!
          </h2>

          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {downloading ? "⏳ Downloading..." : "⬇ Download PNG"}
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
