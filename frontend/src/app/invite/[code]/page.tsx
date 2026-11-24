"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Folder, Users, FileText, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = params?.code ? (Array.isArray(params.code) ? params.code[0] : params.code) : "";
  const code = decodeURIComponent(rawCode);

  const [joined, setJoined] = useState(false);

  const repoName = code
    .replace(/^dalat-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase()) || "Repositorio de Estudio";

  const handleJoin = () => {
    setJoined(true);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    try {
      localStorage.setItem("dalat_pending_invite", code);
    } catch {}
    setTimeout(() => {
      router.push(`/?join_repo=${encodeURIComponent(code)}`);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-[#0c0f24] border border-[#23294c] rounded-3xl p-7 sm:p-9 shadow-2xl relative z-10 text-center space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/dalat-logo-v2.png"
            alt="Dalat"
            width={120}
            height={38}
            className="h-9 w-auto object-contain"
            priority
          />
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block mb-1">
            Invitación a Equipo
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Te han invitado a colaborar
          </h1>
          <p className="text-xs text-slate-400">
            Únete para compartir apuntes, guías y recursos de estudio
          </p>
        </div>

        {/* Repository Card Preview */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c5dfa] to-cyan-400 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
              {code.slice(0, 2).toUpperCase() || "RE"}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-sm truncate">
                {repoName}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                Código: <span className="font-mono text-purple-300">{code}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-white/[0.06] pt-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Equipo activo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Materiales compartidos</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            disabled={joined}
            onClick={handleJoin}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7c5dfa] to-[#6344e6] hover:from-[#6c4ae8] hover:to-[#5536d4] text-white font-semibold text-sm shadow-xl shadow-purple-950/50 transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-75"
          >
            {joined ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>¡Uniéndote al repositorio...!</span>
              </>
            ) : (
              <>
                <span>Unirme al Repositorio</span>
                <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Al unirte, este repositorio aparecerá inmediatamente en tu panel de Dalat.
        </p>
      </div>
    </div>
  );
}
