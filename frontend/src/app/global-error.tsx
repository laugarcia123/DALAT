"use client";

import React, { useEffect } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dalat Global Crash Intercepted:", error);
  }, [error]);

  return (
    <html lang="es" className="dark h-full">
      <body className="min-h-full bg-[#080a11] text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-[#7c5dfa]">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-[#0d1021] border border-white/10 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-amber-400">
              Recuperación Global
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Interrupción del Sistema
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dalat detectó una falla a nivel de arranque. Pulsa abajo para reiniciar la plataforma de forma segura.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-900/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar inicio</span>
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-white/5"
            >
              <Home className="w-4 h-4 text-purple-400" />
              <span>Recargar desde cero</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
