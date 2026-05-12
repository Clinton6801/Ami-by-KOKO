"use client";

/**
 * TracingCanvas — two side-by-side canvases for uppercase and lowercase tracing.
 * Each has its own ghost guide letter and independent drawing state.
 */
import { useRef, useEffect, useState, useCallback } from "react";

interface SingleCanvasProps {
  letter: string;
  colour: string;
  label: string;
  size: number;
  onTraced?: () => void;
}

function SingleCanvas({ letter, colour, label, size, onTraced }: SingleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [hasTraced, setHasTraced] = useState(false);

  const drawGhost = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `bold ${canvas.width * 0.68}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colour;
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);
  }, [letter, colour]);

  useEffect(() => {
    drawGhost();
  }, [drawGhost]);

  function getPos(e: React.TouchEvent | React.MouseEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    // Scale mouse/touch coords to canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
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

  function startDraw(e: React.TouchEvent | React.MouseEvent) {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    if (!isDrawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function endDraw() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (!hasTraced) {
      setHasTraced(true);
      onTraced?.();
    }
  }

  function clearCanvas() {
    setHasTraced(false);
    drawGhost();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label above canvas */}
      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
        {label}
      </span>

      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`touch-none rounded-2xl border-2 bg-white ${
          hasTraced ? "border-green-400" : "border-amber-200"
        }`}
        aria-label={`Tracing canvas for ${label} letter ${letter}`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />

      {/* Done indicator + clear button */}
      <div className="flex items-center gap-2">
        {hasTraced && (
          <span className="text-green-500 text-xs font-semibold">✓ Done!</span>
        )}
        <button
          type="button"
          onClick={clearCanvas}
          className="rounded-xl border border-stone-200 px-3 py-1 text-xs text-stone-400 hover:bg-stone-50 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface TracingCanvasProps {
  letter: string;   // uppercase letter, e.g. "A"
  onTraced?: () => void;
}

export default function TracingCanvas({ letter, onTraced }: TracingCanvasProps) {
  const uppercase = letter.toUpperCase();
  const lowercase = letter.toLowerCase();

  // Ghost colour — amber for uppercase, green for lowercase
  const upperColour = "rgba(245, 158, 11, 0.18)";
  const lowerColour = "rgba(22, 163, 74, 0.18)";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-sm font-semibold text-stone-600">
        Trace both letters with your finger ✏️
      </p>

      {/* Two canvases side by side */}
      <div className="flex gap-4 justify-center flex-wrap">
        <SingleCanvas
          letter={uppercase}
          colour={upperColour}
          label="Capital"
          size={130}
          onTraced={onTraced}
        />
        <SingleCanvas
          letter={lowercase}
          colour={lowerColour}
          label="Small"
          size={130}
          onTraced={onTraced}
        />
      </div>
    </div>
  );
}
