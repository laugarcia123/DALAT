"use client";

import React, { useEffect, useRef } from "react";

interface BinaryOrbitsProps {
  className?: string;
  speed?: number;
  stars?: number;
}

export default function BinaryOrbits({
  className = "",
  speed = 1.0,
  stars = 950,
}: BinaryOrbitsProps) {
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

    const galaxyColors = [
      "#ffffff",
      "#f5d0fe", // Light fuchsia
      "#d946ef", // Vibrant fuchsia
      "#c084fc", // Lavender
      "#818cf8", // Indigo
      "#38bdf8", // Sky cyan
    ];

    // Dual-arm spiral galaxy particles
    const starList = Array.from({ length: stars }, (_, i) => {
      const isCore = i < stars * 0.28;
      const arm = i % 2; // 2 main spiral arms
      const armAngle = arm * Math.PI;
      const normRadius = isCore
        ? Math.pow(Math.random(), 2.0) * 0.32
        : 0.16 + Math.pow(Math.random(), 1.3) * 0.84;

      const angleJitter = (Math.random() - 0.5) * (isCore ? 1.4 : 0.32);
      const dispersion = (Math.random() - 0.5) * (0.06 + normRadius * 0.15);

      const colorIdx = isCore
        ? Math.floor(Math.random() * 2)
        : 2 + Math.floor(Math.random() * (galaxyColors.length - 2));

      return {
        normRadius,
        armAngle: armAngle + angleJitter,
        dispersion,
        speedMult: 0.85 + Math.random() * 0.3,
        size: isCore ? 1.2 + Math.random() * 1.8 : 0.7 + Math.random() * 1.5,
        color: galaxyColors[colorIdx],
        alpha: 0.45 + Math.random() * 0.55,
        orbitSpeed: 1.0 / Math.sqrt(Math.max(normRadius, 0.08)),
      };
    });

    const render = () => {
      time += 0.007 * speed;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.52;
      const maxGalaxyRadius = Math.min(width, height) * 0.54;
      const tilt = 0.42; // Elliptical 3D tilt
      const rotationAngle = -0.35; // Slight diagonal orientation
      const cosRot = Math.cos(rotationAngle);
      const sinRot = Math.sin(rotationAngle);

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // 1. Central Core Nebular Glow
      const coreGradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, maxGalaxyRadius * 0.4);
      coreGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      coreGradient.addColorStop(0.2, "rgba(217, 70, 239, 0.45)");
      coreGradient.addColorStop(0.5, "rgba(129, 140, 248, 0.2)");
      coreGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = coreGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Render all orbiting stars
      const twist = 3.6;
      starList.forEach((star) => {
        const currentRadius = star.normRadius * maxGalaxyRadius;
        const currentAngle =
          star.armAngle +
          twist * Math.log(Math.max(star.normRadius, 0.04)) +
          time * star.orbitSpeed * star.speedMult;

        const lx = Math.cos(currentAngle) * currentRadius * (1 + star.dispersion);
        const ly = Math.sin(currentAngle) * currentRadius * (1 + star.dispersion);

        const tiltedY = ly * tilt;
        const px = cx + (lx * cosRot - tiltedY * sinRot);
        const py = cy + (lx * sinRot + tiltedY * cosRot);

        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = star.normRadius < 0.35 ? 7 : 3;
        ctx.fill();
      });

      // 3. Central binary star core
      ctx.beginPath();
      ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#f5d0fe";
      ctx.shadowBlur = 18;
      ctx.globalAlpha = 0.95;
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [speed, stars]);

  return (
    <div className={`relative w-full h-full overflow-hidden pointer-events-none select-none bg-[#05060f] ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
