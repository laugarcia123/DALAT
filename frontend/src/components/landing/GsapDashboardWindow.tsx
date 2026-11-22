"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface GsapDashboardWindowProps {
  imageSrc?: string;
  alt?: string;
  className?: string;
}

export default function GsapDashboardWindow({
  imageSrc = "/foto-dashboard-dalat.png",
  alt = "Dalat Dashboard Universitario",
  className = "",
}: GsapDashboardWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const windowEl = windowRef.current;
    const glowEl = glowRef.current;
    if (!windowEl) return;

    // 1. GSAP: Subtle organic idle floating
    const floatAnim = gsap.to(windowEl, {
      y: -8,
      duration: 3.8,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // 2. GSAP: Breathing glow pulse
    let glowAnim: gsap.core.Tween | null = null;
    if (glowEl) {
      glowAnim = gsap.to(glowEl, {
        scale: 1.05,
        opacity: 0.9,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    return () => {
      floatAnim.kill();
      if (glowAnim) glowAnim.kill();
    };
  }, []);

  // 3. GSAP: 3D Perspective Tilt on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const windowEl = windowRef.current;
    const glare = glareRef.current;
    if (!container || !windowEl) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    // Subtle 3D tilt for wide window (Max 6 degrees for stability)
    const rotateX = -deltaY * 6;
    const rotateY = deltaX * 6;

    gsap.to(windowEl, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1200,
      transformOrigin: "center center",
      duration: 0.35,
      ease: "power2.out",
    });

    // Move specular glare over glass
    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      gsap.to(glare, {
        opacity: 0.2,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35) 0%, transparent 65%)`,
        duration: 0.2,
      });
    }
  };

  const handleMouseLeave = () => {
    const windowEl = windowRef.current;
    const glare = glareRef.current;
    if (!windowEl) return;

    // Elastic reset to center
    gsap.to(windowEl, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)",
    });

    if (glare) {
      gsap.to(glare, {
        opacity: 0,
        duration: 0.4,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none cursor-pointer w-full ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* Ambient Glow in Purple & Indigo (Behind Dashboard) */}
      <div
        ref={glowRef}
        className="absolute -inset-6 bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-pink-600/25 rounded-[36px] blur-3xl opacity-75 pointer-events-none transition-opacity"
      />

      {/* 3D Dashboard Mockup Window */}
      <div
        ref={windowRef}
        className="relative rounded-2xl sm:rounded-3xl bg-[#0c0f1c]/90 border border-white/[0.14] shadow-2xl overflow-hidden backdrop-blur-xl transform-gpu will-change-transform transition-colors hover:border-purple-500/40"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Specular glare reflection */}
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl z-20 opacity-0 transition-opacity"
        />

        {/* macOS Style Window Titlebar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#090b14]/90 border-b border-white/[0.08] relative z-10">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm" />
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 ml-3">
              dalat.app &bull; tablero universitario
            </span>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-300">
              En vivo
            </span>
          </div>
        </div>

        {/* Dashboard Image Viewport */}
        <div className="relative z-10 w-full overflow-hidden bg-[#07080e]">
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-auto object-cover object-top block"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
