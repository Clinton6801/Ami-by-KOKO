"use client";

/**
 * TracingCanvas — trace the letter itself.
 *
 * How it works:
 * - Ghost letter is rendered to an offscreen canvas to get its pixel map
 * - "Letter pixels" = pixels where the ghost letter has opacity > 0
 * - As the child draws, we check which letter pixels their stroke covers
 * - Progress = covered letter pixels / total letter pixels
 * - Completes at 55% coverage — forgiving but requires actually tracing the letter
 * - No dots, no waypoints, no strict path — just colour in the letter
 */
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SIZE = 160;
const COMPLETION_THRESHOLD = 0.80; // 80% of letter pixels must be covered
const BRUSH_RADIUS = 10; // px — how wide the child's "brush" is

interface SingleCanvasProps {
  letter: string;
  isLower?: boolean;
  hideLabel?: boolean;
  onComplete?: () => void;
}

function SingleCanvas({ letter, isLower = false, hideLabel = false, onComplete }: SingleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const completedRef = useRef(false);

  // Set of pixel indices that belong to the letter
  const letterPixels = useRef<Set<number>>(new Set());
  // Set of letter pixel indices the child has covered
  const coveredPixels = useRef<Set<number>>(new Set());

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const strokeColour = isLower ? "#16A34A" : "#F59E0B";
  const ghostColour = isLower ? "rgba(22,163,74,0.18)" : "rgba(245,158,11,0.18)";

  // Build the letter pixel map from an offscreen canvas
  const buildLetterMap = useCallback(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = SIZE;
    offscreen.height = SIZE;
    const ctx = offscreen.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.font = `bold ${SIZE * 0.78}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    ctx.fillText(letter, SIZE / 2, SIZE / 2);

    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const pixels = new Set<number>();
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Alpha channel — if > 30, this pixel is part of the letter
      if (imageData.data[i + 3] > 30) {
        pixels.add(i / 4); // pixel index
      }
    }
    letterPixels.current = pixels;
  }, [letter]);

  // Draw the ghost letter on the visible canvas
  const drawGhost = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.font = `bold ${SIZE * 0.78}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ghostColour;
    ctx.fillText(letter, SIZE / 2, SIZE / 2);
  }, [letter, ghostColour]);

  useEffect(() => {
    coveredPixels.current = new Set();
    completedRef.current = false;
    setProgress(0);
    setDone(false);
    buildLetterMap();
    drawGhost();
  }, [letter, buildLetterMap, drawGhost]);

  function getPos(e: React.TouchEvent | React.MouseEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  }

  // Check which letter pixels the brush at (x, y) covers
  function coverPixels(x: number, y: number) {
    if (completedRef.current) return;
    const cx = Math.round(x);
    const cy = Math.round(y);

    for (let dx = -BRUSH_RADIUS; dx <= BRUSH_RADIUS; dx++) {
      for (let dy = -BRUSH_RADIUS; dy <= BRUSH_RADIUS; dy++) {
        if (dx * dx + dy * dy > BRUSH_RADIUS * BRUSH_RADIUS) continue;
        const px = cx + dx;
        const py = cy + dy;
        if (px < 0 || px >= SIZE || py < 0 || py >= SIZE) continue;
        const idx = py * SIZE + px;
        if (letterPixels.current.has(idx)) {
          coveredPixels.current.add(idx);
        }
      }
    }

    const total = letterPixels.current.size;
    if (total === 0) return;

    const pct = coveredPixels.current.size / total;
    setProgress(Math.min(1, pct));

    if (pct >= COMPLETION_THRESHOLD && !completedRef.current) {
      completedRef.current = true;
      setDone(true);
      onComplete?.();
    }
  }

  function startDraw(e: React.TouchEvent | React.MouseEvent) {
    if (done) return;
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    coverPixels(x, y);
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    if (!isDrawing.current || done) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = BRUSH_RADIUS * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.65;
    ctx.stroke();
    ctx.globalAlpha = 1;
    coverPixels(x, y);
  }

  function endDraw() {
    isDrawing.current = false;
  }

  function reset() {
    coveredPixels.current = new Set();
    completedRef.current = false;
    setProgress(0);
    setDone(false);
    drawGhost();
  }

  const pct = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      {!hideLabel && (
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
          {isLower ? "Small" : "Capital"} {letter}
        </span>
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ width: SIZE, height: SIZE }}
          className={`touch-none rounded-2xl border-2 bg-white transition-colors ${
            done ? "border-green-400 shadow-md shadow-green-100" : "border-amber-200"
          }`}
          aria-label={`Trace the ${isLower ? "lowercase" : "uppercase"} letter ${letter}`}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-green-500/15 pointer-events-none"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.4, 1] }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-4xl"
              >
                ⭐
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div style={{ width: SIZE }}>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              done ? "bg-green-500" : isLower ? "bg-green-400" : "bg-amber-400"
            }`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-stone-400">
            {done ? "✓ Great job!" : `${pct}%`}
          </span>
          <button
            type="button"
            onClick={reset}
            className="text-[10px] text-stone-400 hover:text-stone-600 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface TracingCanvasProps {
  letter: string;
  onTraced?: () => void;
  /** "letter" (default) shows uppercase + lowercase. "number" shows a single canvas. */
  mode?: "letter" | "number";
}

export default function TracingCanvas({ letter, onTraced, mode = "letter" }: TracingCanvasProps) {
  const [upperDone, setUpperDone] = useState(false);
  const [lowerDone, setLowerDone] = useState(false);

  const handleUpperDone = useCallback(() => setUpperDone(true), []);

  const handleLowerDone = useCallback(() => {
    setLowerDone(true);
    onTraced?.();
  }, [onTraced]);

  useEffect(() => {
    if (upperDone && lowerDone) onTraced?.();
  }, [upperDone, lowerDone, onTraced]);

  // ── Number mode — single canvas, no uppercase/lowercase labels ──
  if (mode === "number") {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <p className="text-sm font-semibold text-stone-600 text-center">
          Colour in the number with your finger ✏️
        </p>
        <SingleCanvas
          letter={letter}
          isLower={false}
          hideLabel
          onComplete={onTraced}
        />
      </div>
    );
  }

  // ── Letter mode — uppercase + lowercase ──
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-sm font-semibold text-stone-600 text-center">
        Colour in the letter with your finger ✏️
      </p>

      <div className="flex gap-5 justify-center flex-wrap">
        <SingleCanvas letter={letter.toUpperCase()} isLower={false} onComplete={handleUpperDone} />
        <SingleCanvas letter={letter.toLowerCase()} isLower={true} onComplete={handleLowerDone} />
      </div>

      <AnimatePresence>
        {upperDone && lowerDone && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-50 border-2 border-green-300 rounded-2xl px-5 py-3 text-center"
          >
            <p className="font-extrabold text-green-700">🎉 Amazing tracing!</p>
            <p className="text-green-600 text-xs mt-0.5">You traced both letters!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
