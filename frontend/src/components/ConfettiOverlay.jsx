import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiOverlay() {
  useEffect(() => {
    // Multi-burst confetti effect
    const duration = 3000;
    const end = Date.now() + duration;

    function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#7c3aed', '#3b82f6', '#10b981', '#f97316', '#fbbf24'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7c3aed', '#3b82f6', '#10b981', '#f97316', '#fbbf24'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }

    frame();

    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#7c3aed', '#8b5cf6', '#10b981', '#fbbf24', '#f97316'],
      });
    }, 300);
  }, []);

  return null;
}
