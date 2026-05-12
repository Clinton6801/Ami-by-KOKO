"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// ─── Feature cards ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    emoji: "🔤",
    title: "Phonics A–Z",
    description: "Every letter comes alive with Kòkò's voice and Nigerian word associations.",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    emoji: "🇳🇬",
    title: "Yorùbá & English",
    description: "Learn in both languages. \"A is for Apple\" and \"A is for Àgbàdo\".",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    emoji: "🎵",
    title: "DJ Booth",
    description: "Mix letter sounds into music. Learning through creativity.",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    emoji: "📖",
    title: "Story Mode",
    description: "Kòkò lost his voice! Help him find it by learning the alphabet.",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
];

// ─── Testimonial placeholders ─────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "My daughter asks to use it every morning before school.",
    name: "Ngozi A.",
    location: "Lagos",
    avatar: "👩🏾",
  },
  {
    quote: "Finally an app that teaches Yorùbá the right way.",
    name: "Tayo O.",
    location: "Ibadan",
    avatar: "👨🏾",
  },
  {
    quote: "Our pupils love Kòkò. It's the first thing they ask for.",
    name: "Mrs. Emeka",
    location: "Abuja — Primary School Teacher",
    avatar: "👩🏾‍🏫",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-amber-50 overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>🦜</span>
          <span className="font-bold text-amber-900 text-lg">Àmì by Kòkò</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-stone-600 hover:text-amber-700 px-3 py-2 rounded-xl hover:bg-amber-100 transition"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-medium px-4 py-1.5 rounded-full w-fit">
            🇳🇬 Made for Nigerian children
          </span>

          <h1 className="text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
            Learning letters
            <span className="text-amber-500"> feels like </span>
            play
          </h1>

          <p className="text-lg text-stone-600 max-w-md leading-relaxed">
            Àmì and her talking parrot Kòkò guide children aged 0–8 through
            phonics in <strong>English and Yorùbá</strong> — with Nigerian
            names, foods, and stories they recognise.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition shadow-lg shadow-amber-200"
            >
              Start Learning Free
              <span aria-hidden>→</span>
            </Link>
            <a
              href="mailto:schools@amibykoko.com"
              className="flex items-center justify-center gap-2 border-2 border-green-700 text-green-800 font-semibold text-lg px-8 py-4 rounded-2xl hover:bg-green-50 transition"
            >
              🏫 For Schools
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <span className="flex items-center gap-1">✓ Free to start</span>
            <span className="flex items-center gap-1">✓ No ads</span>
            <span className="flex items-center gap-1">✓ Works on mobile</span>
          </div>
        </motion.div>

        {/* Right — character illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative w-72 h-80 lg:w-[420px] lg:h-[480px]">
            {/* Decorative background blob */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-green-200 rounded-[60%_40%_50%_50%/50%_60%_40%_50%] opacity-60" />

            {/* Character image */}
            <div className="relative z-10 w-full h-full">
              <Image
                src="/ami.png"
                alt="Àmì, a Nigerian girl, holding Kòkò her talking parrot"
                fill
                className="object-contain drop-shadow-2xl"
                priority
                sizes="(max-width: 768px) 288px, 420px"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Social proof strip ──────────────────────────────── */}
      <div className="bg-amber-500 py-3 px-6">
        <p className="text-center text-white text-sm font-medium">
          🌟 Designed for Nigerian families · English free · Yorùbá, Igbo & Hausa coming
        </p>
      </div>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-3">
            Everything a child needs to love reading
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto">
            Built around how Nigerian children actually learn — through sound,
            story, and play.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`${f.bg} border ${f.border} rounded-3xl p-6 flex flex-col gap-3`}
            >
              <span className="text-4xl">{f.emoji}</span>
              <h3 className="font-bold text-stone-800 text-lg">{f.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-stone-900 text-center mb-12"
          >
            How it works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create a free account", desc: "Sign up as a parent in under a minute. Add your child's name and age.", icon: "👩‍👦" },
              { step: "2", title: "Pick a language", desc: "Start with English (free). Unlock Yorùbá with a simple subscription.", icon: "🌍" },
              { step: "3", title: "Learn with Kòkò", desc: "Tap letters, hear sounds, trace shapes, and help Kòkò find his voice.", icon: "🦜" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="font-bold text-stone-800 text-lg">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-stone-900 text-center mb-12"
        >
          What parents are saying
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col gap-4"
            >
              <p className="text-stone-700 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <span className="text-3xl">{t.avatar}</span>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{t.name}</p>
                  <p className="text-stone-400 text-xs">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-stone-400 text-xs mt-6">
          * Testimonials are illustrative placeholders — replace with real reviews before launch.
        </p>
      </section>

      {/* ── School CTA ──────────────────────────────────────── */}
      <section className="bg-green-800 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <span className="text-5xl">🏫</span>
          <h2 className="text-3xl font-bold text-white">
            Bring Àmì by Kòkò to your school
          </h2>
          <p className="text-green-200 max-w-xl leading-relaxed">
            School plan includes class-level progress reports, pupil management,
            CSV exports, and your school&apos;s branding on the welcome screen.
          </p>
          <a
            href="mailto:schools@amibykoko.com"
            className="bg-amber-500 hover:bg-amber-400 text-white font-semibold text-lg px-10 py-4 rounded-2xl transition shadow-lg"
          >
            Contact us for school pricing →
          </a>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="py-20 px-6 text-center bg-amber-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto flex flex-col items-center gap-6"
        >
          <span className="text-6xl">🦜</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-stone-900">
            Ready to start the adventure?
          </h2>
          <p className="text-stone-500">
            English phonics is completely free. No credit card needed.
          </p>
          <Link
            href="/auth/signup"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xl px-12 py-5 rounded-2xl transition shadow-lg shadow-amber-200"
          >
            Create Free Account
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦜</span>
            <span className="font-bold text-white">Àmì by Kòkò</span>
          </div>
          <p className="text-sm text-center">
            Made with ❤️ for Nigerian children everywhere.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="mailto:hello@amibykoko.com" className="hover:text-white transition">
              Contact
            </a>
            <a href="/auth/signup" className="hover:text-white transition">
              Sign up
            </a>
            <a href="mailto:schools@amibykoko.com" className="hover:text-white transition">
              Schools
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
