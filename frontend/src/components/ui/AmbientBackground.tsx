"use client";

import React, { useEffect, useRef } from "react";

interface AmbientBackgroundProps {
  isLightMode?: boolean;
}

export default function AmbientBackground({ isLightMode = false }: AmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas con partículas cósmicas sutiles (polvo estelar) idénticas al landing page
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Micro-partículas estelares (110 puntos orgánicos suaves)
    const particleCount = 110;
    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      alpha: number;
      speedX: number;
      speedY: number;
      pulseSpeed: number;
      baseAlpha: number;
    }[] = [];

    // Colores inspirados en el word-scroller: morado, lila, azul cielo, rosa y blanco puro
    const darkColors = ["#c084fc", "#9333ea", "#818cf8", "#ec4899", "#ffffff", "#38bdf8"];
    const lightColors = ["#a855f7", "#6366f1", "#0284c7", "#ec4899", "#8b5cf6"];

    for (let i = 0; i < particleCount; i++) {
      const colors = isLightMode ? lightColors : darkColors;
      const baseAlpha = isLightMode ? Math.random() * 0.18 + 0.05 : Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: baseAlpha,
        baseAlpha,
        speedX: (Math.random() - 0.5) * 0.18,
        speedY: (Math.random() - 0.5) * 0.18,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick += 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Suave parpadeo de respiración estelar
        const currentAlpha = Math.max(
          0.02,
          p.baseAlpha + Math.sin(tick * p.pulseSpeed + i) * (p.baseAlpha * 0.4)
        );

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = isLightMode ? currentAlpha * 0.6 : currentAlpha;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLightMode]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-700"
    >
      {/* 1. LUCES AMBIENTALES DE COLORES (Morado, Azul Índigo, Rosa y Cian) */}
      {isLightMode ? (
        /* Modo Claro: Auras pasteles luminosas y serenas que no saturan */
        <div className="absolute inset-0">
          {/* Lila Pastel Superior Izquierda */}
          <div className="absolute -top-[8%] -left-[5%] w-[620px] h-[620px] rounded-full bg-purple-200/35 blur-[140px] transform-gpu animate-pulse duration-[8000ms]" />
          {/* Azul Cielo Pastel Superior Derecha */}
          <div className="absolute top-[12%] -right-[8%] w-[680px] h-[680px] rounded-full bg-sky-200/40 blur-[150px] transform-gpu" />
          {/* Rosa Pastel Central */}
          <div className="absolute top-[45%] left-[12%] w-[540px] h-[540px] rounded-full bg-pink-100/45 blur-[140px] transform-gpu" />
          {/* Lavanda Índigo Inferior Derecha */}
          <div className="absolute -bottom-[10%] right-[10%] w-[650px] h-[650px] rounded-full bg-indigo-100/40 blur-[160px] transform-gpu" />
          {/* Menta / Turquesa Pastel Suave */}
          <div className="absolute bottom-[25%] left-[30%] w-[480px] h-[480px] rounded-full bg-teal-100/30 blur-[140px] transform-gpu" />
        </div>
      ) : (
        /* Modo Oscuro: Luces atmosféricas espaciales idénticas a la sección Hero / WordScroller */
        <div className="absolute inset-0">
          {/* Morado Cósmico Superior Izquierda */}
          <div className="absolute -top-[10%] -left-[6%] w-[640px] h-[640px] rounded-full bg-purple-600/[0.22] blur-[150px] transform-gpu" />
          {/* Azul Índigo Profundo Superior Derecha */}
          <div className="absolute top-[15%] -right-[8%] w-[680px] h-[680px] rounded-full bg-blue-600/[0.18] blur-[160px] transform-gpu" />
          {/* Rosa Magenta Suave Central */}
          <div className="absolute top-[48%] left-[15%] w-[520px] h-[520px] rounded-full bg-pink-500/[0.15] blur-[140px] transform-gpu" />
          {/* Violeta Secundario Inferior Derecha */}
          <div className="absolute -bottom-[8%] right-[15%] w-[600px] h-[600px] rounded-full bg-violet-600/[0.18] blur-[150px] transform-gpu" />
          {/* Azul Eléctrico / Índigo Superior Central */}
          <div className="absolute -top-[5%] left-[35%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.14] blur-[140px] transform-gpu" />
          {/* Cian / Turquesa Sutil Inferior Izquierda */}
          <div className="absolute bottom-[10%] -left-[5%] w-[460px] h-[460px] rounded-full bg-cyan-500/[0.10] blur-[150px] transform-gpu" />
        </div>
      )}

      {/* 2. CAPA DE PARTÍCULAS / POLVO ESTELAR SUTIL (Canvas interactivo suave) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* 3. Malla sutil de gradiente para suavizar la transición en los bordes */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.2) 100%)",
        }}
      />
    </div>
  );
}
