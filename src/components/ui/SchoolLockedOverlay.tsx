"use client";

/**
 * SchoolLockedOverlay — shown to students whose school subscription is inactive.
 * Never shows pricing or payment buttons. Directs them to ask their teacher.
 */
import { motion, AnimatePresence } from "framer-motion";

interface SchoolLockedOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SchoolLockedOverlay({ isOpen, onClose }: SchoolLockedOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-10 max-w-lg mx-auto"
          >
            <div className="text-center mb-4">
              <motion.span
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl inline-block"
              >
                🦜
              </motion.span>
            </div>

            <h2 className="text-2xl font-extrabold text-stone-900 text-center mb-2">
              This is locked! 🔒
            </h2>
            <p className="text-stone-500 text-sm text-center mb-8 leading-relaxed">
              Ask your teacher to unlock everything for your class!
            </p>

            <button
              onClick={onClose}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg py-4 rounded-2xl transition active:scale-95 shadow-md shadow-amber-200"
            >
              Got it! 👍
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
