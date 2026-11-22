"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Star } from "lucide-react";

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  university: string;
  avatar: string;
  avatarBg: string;
  rating: number;
  quote: string;
  tag: string;
}

interface Props {
  testimonials: Testimonial[];
  /** Segundos que tarda en recorrer una vuelta completa */
  duration?: number;
}

export default function GsapTestimonialMarquee({ testimonials, duration = 50 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // El track contiene la lista cuatriplicada: moverlo -50% y repetir en bucle continuo y suave
    const tween = gsap.to(track, {
      xPercent: -50,
      duration,
      ease: "none",
      repeat: -1,
    });
    tweenRef.current = tween;

    return () => {
      tween.kill();
      tweenRef.current = null;
    };
  }, [duration, testimonials.length]);

  // Frena suavemente al pasar el mouse (hover para leer) y reanuda al salir
  const slowDown = () => {
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 0.15, duration: 0.8, ease: "power2.out" });
  };
  const speedUp = () => {
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 1, duration: 0.8, ease: "power2.in" });
  };

  // Cuatriplicado para garantizar bucle infinito sin huecos en cualquier resolución (incluso ultrawide)
  const items = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={slowDown}
      onMouseLeave={speedUp}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {items.map((t, idx) => (
          <article
            key={`${t.id}-${idx}`}
            aria-hidden={idx >= testimonials.length}
            className="mr-6 w-[320px] sm:w-[400px] shrink-0 rounded-3xl bg-[#0c0f1c]/90 backdrop-blur-xl border border-white/[0.08] p-6 sm:p-7 shadow-xl shadow-purple-950/30 flex flex-col justify-between gap-5 transition-colors hover:border-purple-500/40"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            <div className="space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                {t.tag}
              </span>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0 ${t.avatarBg}`}
                >
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {t.role} &bull; {t.university}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
