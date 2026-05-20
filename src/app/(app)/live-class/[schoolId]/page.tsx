"use client";

/**
 * /live-class/[schoolId] — Student view for Live Class Mode.
 *
 * Subscribes to Supabase Realtime channel: live-class-{schoolId}-{classLevel}
 * When teacher broadcasts 'navigate', student is taken to that content.
 * When teacher broadcasts 'end', student returns to /home.
 */
import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useChild } from "@/hooks/useChild";
import type { Subject } from "@/types";

interface LiveClassEvent {
  type: "start" | "navigate" | "end";
  subject: Subject;
  contentKey: string;
  teacherId: string;
  title?: string;
}

interface Props {
  params: Promise<{ schoolId: string }>;
}

function getContentUrl(event: LiveClassEvent): string {
  if (event.subject === "literacy") return `/phonics/english/${event.contentKey.toLowerCase()}`;
  if (event.subject === "numeracy") return `/numeracy/english/${event.contentKey}`;
  if (event.subject === "world") {
    // world items need category — look up from key
    const worldCategories: Record<string, string> = {
      head: "body", eyes: "body", nose: "body", mouth: "body", hands: "body", feet: "body",
      dog: "animals", cat: "animals", cow: "animals", goat: "animals", chicken: "animals", parrot: "animals",
      mango: "fruits", orange: "fruits", banana: "fruits",
      cup: "objects", book: "objects", bag: "objects", shoe: "objects", ball: "objects", spoon: "objects",
      sun: "weather", rain: "weather", cloud: "weather",
    };
    const cat = worldCategories[event.contentKey] ?? "body";
    return `/world/${cat}/${event.contentKey}`;
  }
  return "/home";
}

export default function LiveClassPage({ params }: Props) {
  const { schoolId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { activeChild } = useChild();

  const [status, setStatus] = useState<"waiting" | "active" | "ended">("waiting");
  const [currentEvent, setCurrentEvent] = useState<LiveClassEvent | null>(null);
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState<string | null>(null);

  // Determine channel name from child's class
  useEffect(() => {
    if (activeChild) {
      const cls = (activeChild as { class?: string }).class ?? "sprout_1";
      setChannelName(`live-class-${schoolId}-${cls}`);
    }
  }, [activeChild, schoolId]);

  // Subscribe to realtime channel
  useEffect(() => {
    if (!channelName) return;

    const channel = supabase.channel(channelName);

    channel.on("broadcast", { event: "live_class" }, ({ payload }: { payload: LiveClassEvent }) => {
      console.log("[LiveClass] received:", payload);

      if (payload.type === "start") {
        setStatus("active");
        setCurrentEvent(payload);
      } else if (payload.type === "navigate") {
        setCurrentEvent(payload);
        if (joined) {
          router.push(getContentUrl(payload));
        }
      } else if (payload.type === "end") {
        setStatus("ended");
        setTimeout(() => router.push("/home"), 2000);
      }
    });

    channel.subscribe((status) => {
      console.log("[LiveClass] channel status:", status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, joined]);

  function handleJoin() {
    setJoined(true);
    if (currentEvent) {
      router.push(getContentUrl(currentEvent));
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-6">
      <AnimatePresence mode="wait">
        {status === "waiting" && (
          <motion.div key="waiting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center max-w-sm">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-7xl"
            >
              🦜
            </motion.div>
            <h1 className="text-2xl font-extrabold text-stone-800">Waiting for your teacher…</h1>
            <p className="text-stone-500 text-sm leading-relaxed">
              Your teacher will start the live class soon. Stay on this screen!
            </p>
            <div className="flex gap-2 items-center">
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                className="w-2 h-2 rounded-full bg-amber-500"/>
              <span className="text-xs text-stone-400 font-semibold">Live · Waiting</span>
            </div>
          </motion.div>
        )}

        {status === "active" && !joined && (
          <motion.div key="join" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5 text-center max-w-sm">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-7xl"
            >
              🎉
            </motion.div>
            <h1 className="text-2xl font-extrabold text-stone-800">Live Class is starting!</h1>
            <p className="text-stone-500 text-sm">
              {currentEvent?.title ?? "Your teacher is ready. Tap to join!"}
            </p>
            <button
              onClick={handleJoin}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xl py-5 rounded-2xl transition shadow-xl shadow-amber-200 active:scale-95"
              style={{ minHeight: 64 }}
            >
              Join Class 🚀
            </button>
          </motion.div>
        )}

        {status === "ended" && (
          <motion.div key="ended" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="text-7xl">✅</div>
            <h1 className="text-2xl font-extrabold text-stone-800">Class is over!</h1>
            <p className="text-stone-500 text-sm">Great work today. Taking you back home…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
