/**
 * Confetti helper — fires a celebration burst using canvas-confetti.
 * Call fireConfetti() when a certificate is earned or a milestone is reached.
 */
import confetti from "canvas-confetti";

export function fireConfetti() {
  // Burst from centre
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: ["#F59E0B", "#FCD34D", "#F43F5E", "#166534", "#FEFCE8"],
    zIndex: 9999,
  });

  // Side cannons
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, zIndex: 9999 });
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, zIndex: 9999 });
  }, 200);
}

export function fireStreakConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors: ["#F59E0B", "#FCD34D", "#F97316"],
    zIndex: 9999,
  });
}
