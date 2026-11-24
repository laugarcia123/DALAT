"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Home, AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Registra el error en la consola para depuración
    console.error("Dalat Runtime Exception Intercepted:", error);
  }, [error]);

  const copyDiagnostic = () => {
    const diagnosticText = `Error: ${error.message}\nDigest: ${error.digest || "N/A"}\nTimestamp: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(diagnosticText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-amber-500/15 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[300px] bg-gradient-to-tl from-purple-600/15 via-indigo-600/10 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-white/[0.06] bg-[#070912]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group select-none">
          <img
            src="/icono-dalat.png"
            alt="Dalat Robot"
            className="h-8 w-8 object-contain transition-transform group-hover:scale-105 drop-shadow-md"
          />
          <span className="font-editorial text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
            Dalat
          </span>
        </a>

        <button
          onClick={() => (window.location.href = "/")}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-purple-400" />
          <span>Ir al Inicio</span>
        </button>
      </header>

      {/* Main Error Recovery Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center max-w-xl mx-auto space-y-7 animate-in fade-in zoom-in-95 duration-500">
        {/* Dalat Robot with diagnostic amber/purple halo */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl scale-125 animate-pulse pointer-events-none" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#0f1328]/90 border border-amber-500/30 flex items-center justify-center shadow-2xl shadow-amber-900/30 p-4 transition-transform duration-500 group-hover:scale-105">
            <img
              src="/icono-dalat.png"
              alt="Dalat Robot"
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(245,158,11,0.25)]"
            />
          </div>
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#141933] border border-amber-500/40 text-amber-300 shadow-md uppercase tracking-wider whitespace-nowrap">
            Falla Temporal
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>DIAGNÓSTICO AUTOMÁTICO ACTIVADO</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-white tracking-tight leading-tight">
            Algo no funcionó como esperábamos
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Dalat interceptó una turbulencia en la sesión. Tus notas, materias y progreso académico están seguros. Pulsa el botón abajo para reiniciar el módulo.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-purple-900/30 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar operación</span>
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-purple-400" />
            <span>Recargar Aplicación</span>
          </button>
        </div>

        {/* Collapsible Technical Details for Support */}
        <div className="w-full pt-4">
          <div className="rounded-2xl bg-[#0d1021]/80 border border-white/[0.06] overflow-hidden text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-3.5 flex items-center justify-between text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Detalles técnicos para soporte
              </span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showDetails && (
              <div className="p-4 pt-1 border-t border-white/[0.05] space-y-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] text-[11px] font-mono text-rose-300 break-all leading-relaxed">
                  {error.message || "Error desconocido en el hilo de ejecución"}
                  {error.digest && (
                    <div className="text-slate-400 text-[10px] mt-1 pt-1 border-t border-white/5">
                      Digest ID: {error.digest}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={copyDiagnostic}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado al portapapeles</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar diagnóstico</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-4 text-center text-xs text-slate-400 font-mono">
        &copy; {new Date().getFullYear()} Dalat Technologies S.A.S. &bull; Sistema Autónomo de Recuperación
      </footer>
    </div>
  );
}
