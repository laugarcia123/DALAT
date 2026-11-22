"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Home, Sparkles, BookOpen, Clock, Layers } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090b14] via-[#070810] to-[#05060b] text-slate-100 flex flex-col font-sans selection:bg-[#7c5dfa] selection:text-white relative overflow-hidden">
      {/* Blueprint grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Ambient glowing orbs */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[300px] bg-gradient-to-tl from-violet-600/15 via-fuchsia-600/10 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-white/[0.06] bg-[#070912]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group select-none">
          <img
            src="/icono-dalat.png"
            alt="Dalat Robot"
            className="h-8 w-8 object-contain transition-transform group-hover:scale-105 drop-shadow-md"
          />
          <span className="font-editorial text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
            Dalat
          </span>
        </Link>

        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 transition flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5 text-purple-400" />
          <span>Ir al Inicio</span>
        </Link>
      </header>

      {/* Main 404 Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center max-w-2xl mx-auto space-y-7 animate-in fade-in zoom-in-95 duration-500">
        {/* Floating Dalat Robot with cosmic halo */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl scale-125 animate-pulse pointer-events-none" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#0f1328]/90 border border-purple-500/30 flex items-center justify-center shadow-2xl shadow-purple-900/40 p-4 transition-transform duration-500 group-hover:scale-105">
            <img
              src="/icono-dalat.png"
              alt="Dalat Robot"
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(168,85,247,0.35)] animate-[bounce_4s_infinite]"
            />
          </div>
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#141933] border border-purple-500/40 text-purple-300 shadow-md uppercase tracking-wider whitespace-nowrap">
            Error 404
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-purple-300">
            <Compass className="w-3.5 h-3.5 text-purple-400 animate-spin duration-3000" />
            <span>COORDENADA FUERA DE ÓRBITA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-editorial font-bold text-white tracking-tight leading-tight">
            Esta página no está en tu plan de estudio
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Parece que el recurso que buscas fue movido, renombrado o se desvió de la trayectoria académica. Pero no te preocupes: tus tareas, apuntes y materias siguen intactos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-purple-900/30 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Aplicación</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Abrir Dashboard Kanban</span>
          </Link>
        </div>

        {/* Quick Route Shortcuts Card */}
        <div className="w-full pt-6">
          <div className="rounded-2xl bg-[#0d1021]/80 border border-white/[0.06] p-4 text-left">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-3 text-center sm:text-left">
              O navega directamente a tus módulos principales:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Link
                href="/"
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-purple-500/30 transition group flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500/20 transition">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block group-hover:text-purple-300 transition">
                    Recursos IA
                  </span>
                  <span className="text-[10px] text-slate-400 block">Exámenes y resúmenes</span>
                </div>
              </Link>

              <Link
                href="/"
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-purple-500/30 transition group flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500/20 transition">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block group-hover:text-indigo-300 transition">
                    6 Métodos
                  </span>
                  <span className="text-[10px] text-slate-400 block">Feynman, Cornell, etc.</span>
                </div>
              </Link>

              <Link
                href="/"
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-purple-500/30 transition group flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block group-hover:text-emerald-300 transition">
                    Horario Dinámico
                  </span>
                  <span className="text-[10px] text-slate-400 block">Materias de la semana</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-4 text-center text-xs text-slate-400 font-mono">
        &copy; {new Date().getFullYear()} Dalat Technologies S.A.S. &bull; Sistema de Estudio Autónomo
      </footer>
    </div>
  );
}
