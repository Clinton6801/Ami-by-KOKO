"use client";

/**
 * TracingCanvas — simple, forgiving letter tracing for young children.
 *
 * How it works:
 * - Ghost letter shown as a guide
 * - Child draws freely over it with their finger
 * - Progress fills as they cover the canvas with strokes
 * - Marks complete after enough drawing (very forgiving threshold)
 * - No strict path validation — just encourages covering the letter shape
 */
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SIZE = 150; // canvas size in px
// How much of the canvas needs to be "painted" to count as done (0–1)
const COMPLETION_THRESHOLD = 0.18;
// Grid resolution for coverage tracking
const GRID = 20;

interface GuidedCanvasProps {
  letter: string;
  isLower?: boolean;
  onComplete?: () => void;
}

function SingleCanvas({ letter, isLower = false, onComplete }: GuidedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const completed = useRef(false);
  // Track which grid cells have been painted
  const painted = useRef<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const totalCells = GRID * GRID;
  const needed = Math.floor(totalCells * COMPLETION_THRESHOLD);

  const colour = isLower ? "#16A34A" : "#F59E0B";
  const ghostColour = isLower ? "rgba(22,163,74,0.12)" : "rgba(245,158,11,0.12)";

  const drawGhost = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.font = `bold ${SIZE * 0.78}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ghostColour;
    ctx.fillText(letter, SIZE / 2, SIZE / 2);
  }, [letter, ghostColour]);

  useEffect(() => {
    painted.current = new Set();
    completed.current = false;
    setProgress(0);
    setDone(false);
    drawGhost();
  }, [letter, drawGhost]);

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

  function markCoverage(x: number, y: number) {
    if (completed.current) return;
    // Mark nearby grid cells as painted
    const radius = 2; // cells
    const cx = Math.floor((x / SIZE) * GRID);
    const cy = Math.floor((y / SIZE) * GRID);
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const gx = cx + dx;
        const gy = cy + dy;
        if (gx >= 0 && gx < GRID && gy >= 0 && gy < GRID) {
          painted.current.add(gy * GRID + gx);
        }
      }
    }
    const pct = Math.min(1, painted.current.size / needed);
    setProgress(pct);

    if (painted.current.size >= needed && !completed.current) {
      completed.current = true;
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
    markCoverage(x, y);
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    if (!isDrawing.current || done) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = colour;
    ctx.lineWidth = 14; // thick line — easy for small fingers
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
    markCoverage(x, y);
  }

  function endDraw() {
    isDrawing.current = false;
  }

  function reset() {
    painted.current = new Set();
    completed.current = false;
    setProgress(0);
    setDone(false);
    drawGhost();
  }

  const pct = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
        {isLower ? "Small" : "Capital"} {letter}
      </span>

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

        {/* Star on completion */}
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
            className={`h-full rounded-full ${done ? "bg-green-500" : isLower ? "bg-green-400" : "bg-amber-400"}`}
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
}

export default function TracingCanvas({ letter, onTraced }: TracingCanvasProps) {
  const [upperDone, setUpperDone] = useState(false);
  const [lowerDone, setLowerDone] = useState(false);

  const handleUpperDone = useCallback(() => {
    setUpperDone(true);
  }, []);

  const handleLowerDone = useCallback(() => {
    setLowerDone(true);
    // Fire onTraced when at least one is done (lowercase counts)
    onTraced?.();
  }, [onTraced]);

  // Also fire when uppercase is done if lowercase already was
  useEffect(() => {
    if (upperDone && lowerDone) onTraced?.();
  }, [upperDone, lowerDone, onTraced]);

  const bothDone = upperDone && lowerDone;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-sm font-semibold text-stone-600 text-center">
        Trace over the letter with your finger ✏️
      </p>

      <div className="flex gap-5 justify-center flex-wrap">
        <SingleCanvas
          letter={letter.toUpperCase()}
          isLower={false}
          onComplete={handleUpperDone}
        />
        <SingleCanvas
          letter={letter.toLowerCase()}
          isLower={true}
          onComplete={handleLowerDone}
        />
      </div>

      <AnimatePresence>
        {bothDone && (
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
