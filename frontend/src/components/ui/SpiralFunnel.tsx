"use client";

import React, { useEffect, useRef } from "react";

interface SpiralFunnelProps {
  className?: string;
  speed?: number;
  threadCount?: number;
}

export default function SpiralFunnel({
  className = "",
  speed = 1.0,
  threadCount = 72,
}: SpiralFunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    // Threads definition matching reference image: glowing magenta/purple filaments
    const threadColors = [
      "#d946ef", // Neon fuchsia
      "#c084fc", // Bright lavender
      "#a855f7", // Electric purple
      "#b066fe", // Deep magenta violet
      "#e879f9", // Light orchid
      "#818cf8", // Indigo spark
    ];

    const threads = Array.from({ length: threadCount }, (_, i) => ({
      phase: (i / threadCount) * Math.PI * 2,
      speedMult: 0.95 + (i % 7) * 0.04,
      color: threadColors[i % threadColors.length],
      width: i % 4 === 0 ? 1.4 : 0.85,
      alpha: 0.55 + (i % 5) * 0.1,
    }));

    // Floating embers/particles spiraling along the tornado
    const embers = Array.from({ length: 65 }, () => ({
      heightNorm: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.005,
      radiusOffset: (Math.random() - 0.5) * 16,
      size: 0.8 + Math.random() * 2.0,
      color: threadColors[Math.floor(Math.random() * threadColors.length)],
      alpha: 0.3 + Math.random() * 0.7,
    }));

    const render = () => {
      time += 0.012 * speed;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const floorY = height * 0.74; // Floor positioned near lower third
      const funnelHeight = height * 0.62;
      const waistRadius = Math.min(width, height) * 0.09;
      const topRadius = Math.min(width, height) * 0.38;
      const floorRadius = Math.min(width, height) * 0.44;

      // 3D camera projection parameters
      const cameraPitch = 0.28; // Tilted downward view ~16 degrees
      const cosPitch = Math.cos(cameraPitch);
      const sinPitch = Math.sin(cameraPitch);
      const cameraDist = 800;

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // 1. Draw glowing base ground reflection / elliptical rings on the floor
      const baseGradient = ctx.createRadialGradient(cx, floorY, 5, cx, floorY, floorRadius);
      baseGradient.addColorStop(0, "rgba(217, 70, 239, 0.5)");
      baseGradient.addColorStop(0.25, "rgba(168, 85, 247, 0.28)");
      baseGradient.addColorStop(0.65, "rgba(124, 58, 237, 0.08)");
      baseGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.save();
      ctx.scale(1, 0.32); // Flatten into 3D floor perspective
      ctx.fillStyle = baseGradient;
      ctx.beginPath();
      ctx.arc(cx, floorY / 0.32, floorRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Floor Spiral Threads (Expanding concentric ripples on the floor)
      const floorRings = 24;
      for (let r = 0; r < floorRings; r++) {
        const normR = r / floorRings;
        const currentRadius = waistRadius * 1.1 + normR * (floorRadius - waistRadius * 1.1);

        ctx.beginPath();
        const steps = 40;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2 + time * 0.4 - normR * 3.5;
          const x3d = Math.cos(theta) * currentRadius;
          const z3d = Math.sin(theta) * currentRadius;
          const y3d = 0;

          // Camera transform
          const rotatedY = -y3d * cosPitch + z3d * sinPitch;
          const depth = y3d * sinPitch + z3d * cosPitch;
          const k = cameraDist / (cameraDist + depth);

          const px = cx + x3d * k;
          const py = floorY + rotatedY * k;

          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = threadColors[r % threadColors.length];
        ctx.lineWidth = 0.75;
        ctx.globalAlpha = (1 - normR) * 0.45;
        ctx.stroke();
      }

      // 3. Upright Tornado / Funnel Vortex Threads
      const verticalSteps = 56;
      threads.forEach((t) => {
        ctx.beginPath();
        let started = false;

        for (let s = 0; s <= verticalSteps; s++) {
          const u = s / verticalSteps; // 0 (bottom floor) to 1 (top flared rim)
          const y3d = u * funnelHeight;

          // Funnel profile: flares at base (0..0.12), narrow waist (0.12..0.35), trumpet flare upward (0.35..1.0)
          let radius: number;
          if (u < 0.12) {
            const v = (0.12 - u) / 0.12;
            radius = waistRadius * (1 + v * 0.85);
          } else {
            const v = (u - 0.12) / 0.88;
            radius = waistRadius + Math.pow(v, 2.1) * (topRadius - waistRadius);
          }

          // Dynamic spiral twist along vertical axis
          const twist = u * 7.5 + (1 - u) * 2.2;
          const theta = t.phase + time * t.speedMult + twist;

          const x3d = Math.cos(theta) * radius;
          const z3d = Math.sin(theta) * radius;

          const rotatedY = -y3d * cosPitch + z3d * sinPitch;
          const depth = y3d * sinPitch + z3d * cosPitch;
          const k = cameraDist / (cameraDist + depth);

          const px = cx + x3d * k;
          const py = floorY + rotatedY * k;

          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }

        ctx.strokeStyle = t.color;
        ctx.lineWidth = t.width;
        ctx.globalAlpha = t.alpha * 0.75;
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 6;
        ctx.stroke();
      });

      // 4. Floating glowing embers spiraling up the tornado
      embers.forEach((e) => {
        e.heightNorm += e.speed * speed;
        if (e.heightNorm > 1) e.heightNorm = 0;

        const u = e.heightNorm;
        const y3d = u * funnelHeight;

        let radius: number;
        if (u < 0.12) {
          const v = (0.12 - u) / 0.12;
          radius = waistRadius * (1 + v * 0.85) + e.radiusOffset;
        } else {
          const v = (u - 0.12) / 0.88;
          radius = waistRadius + Math.pow(v, 2.1) * (topRadius - waistRadius) + e.radiusOffset;
        }

        const twist = u * 7.5;
        const theta = e.phase + time * 1.4 + twist;

        const x3d = Math.cos(theta) * radius;
        const z3d = Math.sin(theta) * radius;

        const rotatedY = -y3d * cosPitch + z3d * sinPitch;
        const depth = y3d * sinPitch + z3d * cosPitch;
        const k = cameraDist / (cameraDist + depth);

        const px = cx + x3d * k;
        const py = floorY + rotatedY * k;

        ctx.beginPath();
        ctx.arc(px, py, e.size * k, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.globalAlpha = e.alpha * Math.sin(u * Math.PI) * 0.9;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      // 5. Intensely glowing base vortex ring (just at waist floor)
      ctx.beginPath();
      ctx.ellipse(cx, floorY - waistRadius * 0.25, waistRadius * 1.2, waistRadius * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "#e879f9";
      ctx.shadowBlur = 14;
      ctx.globalAlpha = 0.8;
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [speed, threadCount]);

  return (
    <div className={`relative w-full h-full overflow-hidden pointer-events-none select-none bg-[#05060f] ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
