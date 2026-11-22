"use client";

import React from "react";

const WORDS = [
  "organizar.",
  "priorizar.",
  "calcular.",
  "enfocarte.",
  "memorizar.",
  "APROBAR.",
];

export default function GsapWordScroller() {
  return (
    <section className="dalat-word-section relative w-full text-white select-none overflow-visible pt-12 pb-16">
      {/* Luces ambientales moradas, azules y rosadas (difuminadas en los bordes con máscara) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      >
        {/* Morado */}
        <div className="absolute top-[18%] left-[8%] w-[520px] h-[520px] rounded-full bg-purple-600/25 blur-[140px]" />
        {/* Azul */}
        <div className="absolute top-[42%] right-[6%] w-[560px] h-[560px] rounded-full bg-blue-600/20 blur-[150px]" />
        {/* Rosado */}
        <div className="absolute top-[62%] left-[22%] w-[480px] h-[480px] rounded-full bg-pink-500/20 blur-[140px]" />
        {/* Morado secundario */}
        <div className="absolute top-[78%] right-[25%] w-[420px] h-[420px] rounded-full bg-violet-500/20 blur-[130px]" />
        {/* Azul secundario arriba */}
        <div className="absolute top-[5%] right-[30%] w-[380px] h-[380px] rounded-full bg-indigo-500/15 blur-[130px]" />
      </div>

      {/* 1. Título aparte arriba: "Con Dalat:" */}
      <div className="relative z-10 text-center space-y-2 px-4">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
          Con Dalat:
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto">
          Todo lo que necesitas para tu semestre en una sola plataforma.
        </p>
      </div>

      {/* 2. Sección Interactiva: "puedes" sticky + palabras en scroll */}
      <div className="dalat-word-scroll-inner relative z-10 flex items-start justify-center gap-3 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
        {/* Lado izquierdo: "puedes" fijo a la mitad de la pantalla (50vh) */}
        <h3 className="dalat-word-prefix">
          <span>puedes&nbsp;</span>
        </h3>

        {/* Lado derecho: Lista de palabras deslizándose hacia arriba */}
        <ul className="dalat-word-list">
          {WORDS.map((word, idx) => (
            <li
              key={word}
              style={{ "--i": idx } as React.CSSProperties}
              className={idx === WORDS.length - 1 ? "is-last" : ""}
            >
              {word}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
