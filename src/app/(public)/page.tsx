"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const FEATURES = [
  {
    emoji: "🔤",
    title: "Phonics A–Z",
    description: "Every letter comes alive with Kòkò's voice and African word associations children recognise.",
    gradient: "from-amber-400 to-orange-400",
  },
  {
    emoji: "🌍",
    title: "African Languages",
    description: "\"A is for Apple\" and \"A is for Àgbàdo\" — English alongside mother-tongue languages.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    emoji: "🎵",
    title: "DJ Booth",
    description: "Mix letter sounds into music. Learning through creativity and play.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    emoji: "📖",
    title: "Story Mode",
    description: "Kòkò lost his voice! Help him find it by mastering the alphabet.",
    gradient: "from-rose-400 to-pink-400",
  },
];

const STEPS = [
  { icon: "👩‍👦", step: "1", title: "Create a free account", desc: "Sign up as a parent in under a minute. Add your child's name and age." },
  { icon: "🌍", step: "2", title: "Pick a language", desc: "Start with English (free forever). Unlock African mother-tongue languages with a simple subscription." },
  { icon: "🦜", step: "3", title: "Learn with Kòkò", desc: "Tap letters, hear sounds, trace shapes, and help Kòkò find his voice." },
];

const TESTIMONIALS = [
  { quote: "My daughter asks to use it every morning before school.", name: "Ngozi A.", location: "Lagos, Nigeria", avatar: "👩🏾" },
  { quote: "Finally an app that teaches our language the right way.", name: "Amara K.", location: "Accra, Ghana", avatar: "👨🏾" },
  { quote: "Our pupils love Kòkò. It's the first thing they ask for.", name: "Mrs. Osei", location: "Nairobi, Kenya — Primary School Teacher", avatar: "👩🏾‍🏫" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#FFFBF0" }}>

      {/* ── Sticky Nav ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦜</span>
            <span className="font-extrabold text-amber-900 text-base sm:text-lg">Àmì by Kòkò</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login"
              className="text-sm font-semibold text-stone-600 hover:text-amber-700 px-3 py-2 rounded-xl hover:bg-amber-50 transition hidden sm:block">
              Sign in
            </Link>
            <Link href="/auth/signup"
              className="text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl transition shadow-md shadow-amber-200">
              Start free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-5 sm:gap-6 order-2 lg:order-1"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full w-fit border border-green-200"
            >
              🌍 Built for African children
            </motion.span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.1]">
              Where letters
              <span className="relative inline-block mx-2">
                <span className="relative z-10 text-amber-500">come alive</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-amber-200 rounded-full -z-0 origin-left"
                />
              </span>
              for African kids
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-md leading-relaxed">
              Àmì and her talking parrot Kòkò guide children aged 0–8 through
              phonics in <strong className="text-stone-800">English and African mother-tongue languages</strong> —
              with names, foods, and stories from across the continent.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/signup"
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base sm:text-lg px-7 py-4 rounded-2xl transition shadow-xl shadow-amber-200 active:scale-95">
                Start Learning Free 🎉
              </Link>
              <a href="mailto:schools@amibykoko.com"
                className="flex items-center justify-center gap-2 border-2 border-green-700 text-green-800 font-bold text-base sm:text-lg px-7 py-4 rounded-2xl hover:bg-green-50 transition active:scale-95">
                🏫 For Schools
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-stone-500">
              {["✓ Free to start", "✓ No ads ever", "✓ Works on any phone"].map(t => (
                <span key={t} className="flex items-center gap-1">{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Right — hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <div className="relative w-64 h-72 sm:w-80 sm:h-96 lg:w-[440px] lg:h-[500px]">
              {/* Blob background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-200 to-yellow-200 rounded-[60%_40%_55%_45%/45%_55%_45%_55%] opacity-70" />
              {/* Floating dots */}
              <motion.div animate={{ y: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 3 }}
                className="absolute top-4 right-8 w-5 h-5 rounded-full bg-amber-400 opacity-60" />
              <motion.div animate={{ y: [6, -6, 6] }} transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute bottom-12 left-4 w-4 h-4 rounded-full bg-green-400 opacity-50" />
              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 3.5 }}
                className="absolute top-1/3 left-2 w-3 h-3 rounded-full bg-rose-400 opacity-50" />
              {/* Character */}
              <motion.div
                animate={{ y: [-8, 0, -8] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative z-10 w-full h-full"
              >
                <Image
                  src="/ami-koko.svg"
                  alt="Àmì, an African girl, holding Kòkò her talking parrot"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                  unoptimized
                  sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, 440px"
                />
              </motion.div>
              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute top-4 -left-2 sm:top-6 sm:-left-4 bg-white rounded-2xl rounded-bl-none px-3 py-2 shadow-lg border border-amber-100 z-20"
              >
                <p className="text-xs sm:text-sm font-bold text-stone-800">A is for</p>
                <p className="text-xs sm:text-sm font-extrabold text-amber-600">Àgbàdo! 🌽</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Marquee strip ──────────────────────────────────── */}
      <div className="bg-amber-500 py-3 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex gap-8 text-white text-sm font-semibold">
              <span>🌟 English Phonics — Free</span>
              <span>·</span>
              <span>🌍 African Languages Coming</span>
              <span>·</span>
              <span>🦜 Learn with Kòkò</span>
              <span>·</span>
              <span>📱 Works on any phone</span>
              <span>·</span>
              <span>🏫 School plans available</span>
              <span>·</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-3">
            Everything a child needs to love reading
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto text-sm sm:text-base">
            Built around how African children actually learn — through sound, story, and play.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-6 shadow-md border border-stone-100 flex flex-col gap-3"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-3xl shadow-sm`}>
                {f.emoji}
              </div>
              <h3 className="font-extrabold text-stone-800 text-lg">{f.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-stone-900 text-center mb-12 sm:mb-16"
          >
            Up and learning in 3 steps
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {STEPS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center gap-4 relative"
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-amber-100" />
                )}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl">
                    {item.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-extrabold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-extrabold text-stone-800 text-lg">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-extrabold text-stone-900 text-center mb-10 sm:mb-14"
        >
          What parents are saying
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-6 shadow-md border border-stone-100 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-0.5 text-amber-400 text-sm">
                {"★★★★★".split("").map((s, j) => <span key={j}>{s}</span>)}
              </div>
              <p className="text-stone-700 leading-relaxed text-sm sm:text-base flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-stone-50">
                <span className="text-3xl">{t.avatar}</span>
                <div>
                  <p className="font-bold text-stone-800 text-sm">{t.name}</p>
                  <p className="text-stone-400 text-xs">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-stone-300 text-xs mt-6">
          Illustrative testimonials — replace with real reviews before launch.
        </p>
      </section>

      {/* ── School CTA ─────────────────────────────────────── */}
      <section className="mx-4 sm:mx-6 lg:mx-auto max-w-5xl mb-16 sm:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-green-800 to-green-900 rounded-3xl py-12 sm:py-16 px-6 sm:px-12 text-center flex flex-col items-center gap-5 shadow-2xl"
        >
          <span className="text-5xl sm:text-6xl">🏫</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bring Àmì by Kòkò to your school
          </h2>
          <p className="text-green-200 max-w-xl leading-relaxed text-sm sm:text-base">
            School plan includes class-level progress reports, pupil management,
            CSV exports, and your school&apos;s branding on the welcome screen.
          </p>
          <a href="mailto:schools@amibykoko.com"
            className="bg-amber-500 hover:bg-amber-400 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-4 rounded-2xl transition shadow-lg active:scale-95">
            Contact us for school pricing →
          </a>
        </motion.div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto flex flex-col items-center gap-5 sm:gap-6"
        >
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="text-6xl sm:text-7xl"
          >
            🦜
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            Ready to start the adventure?
          </h2>
          <p className="text-stone-500 text-sm sm:text-base">
            English phonics is completely free. No credit card needed.
          </p>
          <Link href="/auth/signup"
            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg sm:text-xl px-10 sm:px-14 py-4 sm:py-5 rounded-2xl transition shadow-xl shadow-amber-200 active:scale-95">
            Create Free Account 🎉
          </Link>
          <Link href="/auth/login" className="text-sm text-stone-400 hover:text-amber-600 transition">
            Already have an account? Sign in →
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦜</span>
            <span className="font-extrabold text-white">Àmì by Kòkò</span>
          </div>
          <p className="text-sm text-center text-stone-500">
            Made with ❤️ for African children everywhere.
          </p>
          <div className="flex gap-5 sm:gap-6 text-sm">
            <a href="mailto:hello@amibykoko.com" className="hover:text-white transition">Contact</a>
            <a href="/auth/signup" className="hover:text-white transition">Sign up</a>
            <a href="mailto:schools@amibykoko.com" className="hover:text-white transition">Schools</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
