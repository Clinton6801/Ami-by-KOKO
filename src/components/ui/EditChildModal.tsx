"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Child } from "@/types";

const AVATARS = ["🧒🏾", "👦🏾", "👧🏾", "🧒🏽", "👦🏽", "👧🏽", "🧒🏿", "👦🏿", "👧🏿"];

interface EditChildModalProps {
  child: Child;
  onSaved: (updated: Child) => void;
  onClose: () => void;
}

export default function EditChildModal({ child, onSaved, onClose }: EditChildModalProps) {
  const supabase = createClient();
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(child.age?.toString() ?? "");
  const [avatar, setAvatar] = useState(child.avatar_url ?? "👧🏾");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("children")
      .update({
        name: name.trim(),
        age: age ? parseInt(age) : null,
        avatar_url: avatar,
      })
      .eq("id", child.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    onSaved(data as Child);
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
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 px-6 pt-6 pb-8 text-center relative">
          <button onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl leading-none"
            aria-label="Close">✕</button>
          <div className="text-5xl mb-2">{avatar}</div>
          <h2 className="text-xl font-extrabold text-white">Edit profile</h2>
          <p className="text-green-100 text-sm mt-1">Update {child.name}&apos;s details</p>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 flex flex-col gap-4">

          {/* Avatar picker */}
          <div>
            <p className="text-sm font-semibold text-stone-600 mb-2">Avatar</p>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map(a => (
                <button key={a} type="button" onClick={() => setAvatar(a)}
                  className={`text-2xl w-10 h-10 rounded-xl transition ${
                    avatar === a ? "bg-green-100 ring-2 ring-green-400 scale-110" : "bg-stone-50 hover:bg-green-50"
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="editName" className="text-sm font-semibold text-stone-600 mb-1 block">
              Name
            </label>
            <input id="editName" type="text" required value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
          </div>

          {/* Age */}
          <div>
            <label htmlFor="editAge" className="text-sm font-semibold text-stone-600 mb-1 block">
              Age <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input id="editAge" type="number" min={1} max={12} value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 5"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-400"/>
          </div>

          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()}
              className="flex-1 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold transition disabled:opacity-60">
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
