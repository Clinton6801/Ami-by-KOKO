"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const AVATARS = ["🧒🏾", "👦🏾", "👧🏾", "🧒🏽", "👦🏽", "👧🏽", "🧒🏿", "👦🏿", "👧🏿"];

interface CreateChildModalProps {
  parentId: string;
  onCreated: () => void;
  onClose?: () => void;
}

export default function CreateChildModal({ parentId, onCreated, onClose }: CreateChildModalProps) {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[2]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("children")
      .insert({
        parent_id: parentId,
        name: name.trim(),
        age: age ? parseInt(age) : null,
        avatar_url: avatar,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 pt-6 pb-8 text-center relative">
          {onClose && (
            <button onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
              aria-label="Close">✕</button>
          )}
          <div className="text-5xl mb-2">{avatar}</div>
          <h2 className="text-xl font-extrabold text-white">Who&apos;s learning today?</h2>
          <p className="text-orange-100 text-sm mt-1">Create a profile for your child</p>
        </div>

        <form onSubmit={handleCreate} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-stone-600 mb-2">Pick an avatar</p>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((a) => (
                <button key={a} type="button" onClick={() => setAvatar(a)}
                  className={`text-2xl w-10 h-10 rounded-xl transition ${
                    avatar === a ? "bg-amber-100 ring-2 ring-amber-400 scale-110" : "bg-stone-50 hover:bg-amber-50"
                  }`}>{a}</button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="childName" className="text-sm font-semibold text-stone-600 mb-1 block">
              Child&apos;s name
            </label>
            <input id="childName" type="text" required value={name}
              onChange={e => setName(e.target.value)} placeholder="e.g. Tayo"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"/>
          </div>

          <div>
            <label htmlFor="childAge" className="text-sm font-semibold text-stone-600 mb-1 block">
              Age <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input id="childAge" type="number" min={1} max={12} value={age}
              onChange={e => setAge(e.target.value)} placeholder="e.g. 5"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"/>
          </div>

          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading || !name.trim()}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-lg py-4 rounded-2xl transition shadow-md shadow-amber-200 mt-1">
            {loading ? "Creating…" : `Let's go, ${name || "friend"}! 🦜`}
          </button>

          {onClose && (
            <button type="button" onClick={onClose}
              className="text-center text-xs text-stone-400 hover:text-stone-600 transition py-1">
              Maybe later — I&apos;ll add this in Settings
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
