"use client";

/**
 * PWAManager — handles:
 * 1. Service worker registration (production only)
 * 2. Offline queue flushing with 'Syncing...' indicator
 * 3. App install prompt after 3rd session
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { flushQueue, getQueue } from "@/lib/offlineQueue";

const SESSION_COUNT_KEY = "ami_session_count";
const INSTALL_DISMISSED_KEY = "ami_install_dismissed";

export default function PWAManager() {
  const [syncing, setSyncing] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Register service worker
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 2. Flush offline queue when back online
    function handleOnline() {
      const queue = getQueue();
      if (queue.length === 0) return;
      setSyncing(true);
      flushQueue().finally(() => {
        setTimeout(() => setSyncing(false), 1000);
      });
    }

    window.addEventListener("online", handleOnline);

    // Flush on mount too (in case we came back online while app was closed)
    if (navigator.onLine) {
      const queue = getQueue();
      if (queue.length > 0) {
        setSyncing(true);
        flushQueue().finally(() => setTimeout(() => setSyncing(false), 1000));
      }
    }

    // 3. Track session count for install prompt
    const count = parseInt(localStorage.getItem(SESSION_COUNT_KEY) ?? "0") + 1;
    localStorage.setItem(SESSION_COUNT_KEY, String(count));

    // 4. Listen for beforeinstallprompt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleInstallPrompt(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
      if (!dismissed && count >= 3) {
        setShowInstall(true);
      }
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShowInstall(false);
    setDeferredPrompt(null);
  }

  function dismissInstall() {
    localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
    setShowInstall(false);
  }

  return (
    <>
      {/* Syncing indicator */}
      <AnimatePresence>
        {syncing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              🔄
            </motion.span>
            Syncing progress…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install prompt */}
      <AnimatePresence>
        {showInstall && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismissInstall}
              className="fixed inset-0 bg-black/30 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-10 max-w-lg mx-auto"
            >
              <div className="flex items-center gap-4 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ami-koko.svg" alt="Àmì and Kòkò" className="w-16 h-16 object-contain" />
                <div>
                  <p className="font-extrabold text-stone-900">Learn faster with the app!</p>
                  <p className="text-stone-500 text-sm mt-0.5">Add Àmì to your home screen for quick access</p>
                </div>
              </div>
              <button
                onClick={handleInstall}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition shadow-md shadow-amber-200 mb-3"
              >
                📱 Add to Home Screen
              </button>
              <button
                onClick={dismissInstall}
                className="w-full text-stone-400 text-sm py-2"
              >
                Maybe later
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
