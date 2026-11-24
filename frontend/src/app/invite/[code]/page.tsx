"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Users,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  ShieldCheck,
  Sparkles,
  Loader2,
  FolderOpen
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { repositoryService, EquipoItem } from "@/services/repositoryService";
import LoginScreen from "@/components/auth/LoginScreen";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = params?.code ? (Array.isArray(params.code) ? params.code[0] : params.code) : "";
  const code = decodeURIComponent(rawCode);

  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auth modal overlay state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Repository preview details from backend
  const [previewData, setPreviewData] = useState<EquipoItem | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  const fallbackRepoName =
    code
      .replace(/^dalat-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()) || "Repositorio de Estudio";

  const repoTitle = previewData?.nombre || fallbackRepoName;
  const repoSubject = previewData?.materia || "General";
  const repoMembers = previewData?.miembros_count ?? 1;
  const repoDocs = previewData?.documentos_count ?? 0;
  const repoColor = previewData?.color || "#7c5dfa";
  const repoInitials =
    previewData?.icono_iniciales ||
    code.replace(/^dalat-/, "").slice(0, 2).toUpperCase() ||
    "RE";

  // Identificar si el usuario actual es creador o ya es miembro
  const isCreator = Boolean(
    previewData?.es_creador ||
    (user?.id && previewData?.id_usuario === user.id)
  );

  const isAlreadyMember = Boolean(
    isCreator ||
    previewData?.es_miembro
  );

  // Cargar previsualización del repositorio desde el backend
  useEffect(() => {
    let isMounted = true;
    if (code) {
      setPreviewLoading(true);
      repositoryService
        .previewEquipo(code)
        .then((data) => {
          if (isMounted && data) {
            setPreviewData(data);
          }
        })
        .catch(() => {
          // Si el código no existe aún en backend, usamos fallback dinámico
        })
        .finally(() => {
          if (isMounted) setPreviewLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [code, user?.id]);

  // Manejar unión al repositorio cuando ya está autenticado
  const handleJoin = async () => {
    if (!isAuthenticated) {
      setAuthMode("login");
      setShowAuthModal(true);
      return;
    }

    setJoining(true);
    setErrorMsg(null);

    try {
      // 1. Unirse en el backend para persistir la membresía
      try {
        await repositoryService.unirseEquipo(code);
      } catch (err: any) {
        console.warn("Aviso al unirse en backend:", err);
      }

      // 2. Guardar en almacenamiento para sincronización inmediata en la pestaña de Repositorio
      try {
        localStorage.setItem("dalat_pending_invite", code);
      } catch {}

      setJoined(true);

      // 3. Redirigir al panel del estudiante con recarga limpia
      setTimeout(() => {
        window.location.href = `/?join_repo=${encodeURIComponent(code)}`;
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al unirse al repositorio. Inténtalo de nuevo.");
      setJoining(false);
    }
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

        {/* Heading adaptativo */}
        <div className="space-y-1">
          {isCreator ? (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Eres el creador de este equipo</span>
            </span>
          ) : isAlreadyMember ? (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Ya formas parte de este equipo</span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block mb-1">
              Invitación a Equipo
            </span>
          )}

          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isCreator
              ? "Tu repositorio de estudio"
              : isAlreadyMember
              ? "¡Ya tienes acceso a este equipo!"
              : "Te han invitado a colaborar"}
          </h1>
          <p className="text-xs text-slate-400">
            {isCreator
              ? "Este repositorio fue creado por ti. Puedes consultar y administrar sus materiales."
              : isAlreadyMember
              ? "Tu cuenta ya está sincronizada como miembro activo con acceso a todos los materiales."
              : "Únete para compartir apuntes, guías y recursos de estudio en equipo"}
          </p>
        </div>

        {/* Repository Card Preview */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-left space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0"
              style={{
                background: repoColor
                  ? `linear-gradient(135deg, ${repoColor}, #7c5dfa)`
                  : "linear-gradient(135deg, #7c5dfa, #06b6d4)",
              }}
            >
              {repoInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-sm truncate">
                {repoTitle}
              </h3>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                <span>{repoSubject}</span>
                <span>•</span>
                <span className="font-mono text-purple-300">{code}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-white/[0.06] pt-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {previewLoading ? "Equipo activo" : `${repoMembers} ${repoMembers === 1 ? "miembro" : "miembros"}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {previewLoading
                  ? "Materiales compartidos"
                  : `${repoDocs} ${repoDocs === 1 ? "documento" : "documentos"}`}
              </span>
            </div>
          </div>
        </div>

        {/* Estado de Verificación de Autenticación */}
        {authLoading ? (
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>Verificando tu cuenta de Dalat...</span>
          </div>
        ) : isAuthenticated && user ? (
          /* CASO 1: YA ESTÁ AUTENTICADO */
          <div className="space-y-3 text-left">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#7c5dfa] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow">
                  {user.name?.slice(0, 2).toUpperCase() || "US"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      {isCreator
                        ? "Propietario / Creador"
                        : isAlreadyMember
                        ? "Colaborador Activo"
                        : "Sesión activa"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setAuthMode("login");
                  setShowAuthModal(true);
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 shrink-0 cursor-pointer"
              >
                Cambiar
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 text-center font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {errorMsg}
              </p>
            )}

            {/* Si ya es miembro o creador, abrir directo; si no, botón de unirse */}
            {isAlreadyMember ? (
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/?join_repo=${encodeURIComponent(code)}`;
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7c5dfa] to-[#6344e6] hover:from-[#6c4ae8] hover:to-[#5536d4] text-white font-semibold text-sm shadow-xl shadow-purple-950/50 transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <FolderOpen className="w-4 h-4 text-purple-200" />
                <span>Abrir Repositorio y Ver Materiales</span>
                <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                disabled={joined || joining}
                onClick={handleJoin}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7c5dfa] to-[#6344e6] hover:from-[#6c4ae8] hover:to-[#5536d4] text-white font-semibold text-sm shadow-xl shadow-purple-950/50 transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-75"
              >
                {joined ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>¡Te has unido! Abriendo repositorio...</span>
                  </>
                ) : joining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Uniendo a tu panel...</span>
                  </>
                ) : (
                  <>
                    <span>Unirme al Repositorio</span>
                    <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          /* CASO 2: NO ESTÁ AUTENTICADO */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Identificación requerida para colaborar</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Para sincronizar los materiales con tu biblioteca y participar en este equipo, debes tener una sesión activa en Dalat.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setShowAuthModal(true);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7c5dfa] to-[#6344e6] hover:from-[#6c4ae8] hover:to-[#5536d4] text-white font-semibold text-xs shadow-xl shadow-purple-950/50 transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-purple-200" />
                <span>Iniciar Sesión para Unirme</span>
                <ArrowRight className="w-4 h-4 text-purple-200" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setShowAuthModal(true);
                }}
                className="w-full py-3 px-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-white font-semibold text-xs transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>¿No tienes cuenta? Regístrate gratis</span>
              </button>
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-500">
          {isAlreadyMember
            ? "Acceso directo garantizado a todos los apuntes y documentos compartidos."
            : "Al unirte, este repositorio y sus materiales se añadirán automáticamente a tu cuenta en Dalat."}
        </p>
      </div>

      {/* MODAL DE INICIO DE SESIÓN / REGISTRO INTEGRADO */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-4xl relative my-auto">
            <LoginScreen
              initialMode={authMode}
              defaultName=""
              defaultEmail=""
              onCancel={() => setShowAuthModal(false)}
              onLogin={async () => {
                setShowAuthModal(false);
                setJoining(true);
                try {
                  await repositoryService.unirseEquipo(code);
                } catch (err: any) {
                  console.warn("Aviso al unirse en backend tras login:", err);
                }
                try {
                  localStorage.setItem("dalat_pending_invite", code);
                } catch {}
                setJoined(true);
                setTimeout(() => {
                  window.location.href = `/?join_repo=${encodeURIComponent(code)}`;
                }, 700);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
