import React, { useEffect, useRef } from "react";

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

interface CometItem {
  x: number;
  y: number;
  angle: number;
  tailLen: number;
  speed: number;
  opacity: number;
  width: number;
}

export const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let animFrameId = 0;
    const comets: CometItem[] = [];
    const timers: (NodeJS.Timeout | number)[] = [];

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function spawnComet() {
      if (document.hidden || comets.length >= 2) {
        timers.push(setTimeout(spawnComet, randomBetween(6000, 14000)));
        return;
      }

      const fromLeft = Math.random() < 0.5;
      const angleRad = (randomBetween(18, 38) * Math.PI) / 180;
      const tailLen = randomBetween(140, 260);

      comets.push({
        x: fromLeft ? randomBetween(-tailLen, -20) : randomBetween(width + 20, width + tailLen),
        y: randomBetween(0.05 * height, 0.88 * height),
        angle: fromLeft ? angleRad : Math.PI - angleRad,
        tailLen: tailLen,
        speed: randomBetween(0.18, 0.32), // Exact original speed (px per millisecond)
        opacity: randomBetween(0.65, 0.95), // White brightness
        width: randomBetween(1.2, 2.0),
      });

      timers.push(setTimeout(spawnComet, randomBetween(6000, 14000)));
    }

    resize();
    window.addEventListener("resize", resize);

    // Initial spawns: first comet after 500ms, second after 4s
    timers.push(setTimeout(spawnComet, 500));
    timers.push(setTimeout(spawnComet, 4000));

    let lastTime = performance.now();

    const render = (time: number) => {
      if (document.hidden) {
        lastTime = time;
        animFrameId = requestAnimationFrame(render);
        return;
      }

      const delta = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];

        // 1. Advance position with delta time (exact original physics)
        c.x += Math.cos(c.angle) * c.speed * delta;
        c.y += Math.sin(c.angle) * c.speed * delta;

        // 2. Fade calculation near boundary
        const sBoundary = c.angle < Math.PI / 2 ? -c.tailLen : width + c.tailLen;
        const fadeOpacity = c.opacity * Math.min(Math.abs(c.x - sBoundary) / 80, 1);

        // 3. Tail coordinates
        const tailX = c.x - Math.cos(c.angle) * c.tailLen;
        const tailY = c.y - Math.sin(c.angle) * c.tailLen;

        // 4. Exact original linear gradient (White with subtle lavender tip)
        const gradient = ctx.createLinearGradient(tailX, tailY, c.x, c.y);
        gradient.addColorStop(0, "rgba(200,180,255,0)");
        gradient.addColorStop(0.6, `rgba(210,200,255,${(0.4 * fadeOpacity).toFixed(3)})`);
        gradient.addColorStop(1, `rgba(255,255,255,${fadeOpacity.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = c.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // 5. Exact original glowing white head halo
        const radialGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 5);
        radialGrad.addColorStop(0, `rgba(255,255,255,${(0.7 * fadeOpacity).toFixed(3)})`);
        radialGrad.addColorStop(1, "rgba(200,180,255,0)");

        ctx.beginPath();
        ctx.arc(c.x, c.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = radialGrad;
        ctx.fill();

        // 6. Boundary removal
        if (c.x < -c.tailLen - 50 || c.x > width + c.tailLen + 50 || c.y > height + 100) {
          comets.splice(i, 1);
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", resize);
      timers.forEach(t => clearTimeout(t as any));
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
};

export default CosmicBackground;
