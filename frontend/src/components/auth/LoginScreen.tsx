"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  KeyRound,
  School,
  Building2,
  ChevronDown,
  Loader2,
  AlertCircle,
  X
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";

interface LoginScreenProps {
  onLogin: (userName?: string, userEmail?: string, userCareer?: string, userUni?: string) => void;
  defaultName: string;
  defaultEmail: string;
  onCancel?: () => void;
  initialMode?: "login" | "register";
}

const INSTITUTIONS_LIST = [
  "Universidad Nacional de Colombia (UNAL)",
  "Universidad de los Andes",
  "Pontificia Universidad Javeriana",
  "Universidad de Antioquia (UdeA)",
  "Universidad del Valle (Univalle)",
  "Universidad del Rosario",
  "Universidad de La Sabana",
  "Universidad EAFIT",
  "Universidad Industrial de Santander (UIS)",
  "Universidad del Norte (Uninorte)",
  "Universidad Central",
  "Universidad Distrital Francisco José de Caldas",
  "SENA",
  "Colegio / Educación Media",
  "Otra institución..."
];

export default function LoginScreen({
  onLogin,
  defaultName,
  defaultEmail,
  onCancel,
  initialMode = "login",
}: LoginScreenProps) {
  // Mode: "login" or "register"
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // In Login mode: "normal" | "institucion"
  const [loginType, setLoginType] = useState<"normal" | "institucion">("normal");

  // Inputs
  const [name, setName] = useState(defaultName || "Daniel Granados");
  const [email, setEmail] = useState(defaultEmail || "danielgaber@gmail.com");
  const [password, setPassword] = useState("123456hola");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Institution specific inputs
  const [selectedInstitution, setSelectedInstitution] = useState(INSTITUTIONS_LIST[0]);
  const [customInstitution, setCustomInstitution] = useState("");
  const [institutionalEmail, setInstitutionalEmail] = useState("estudiante@unal.edu.co");

  const { login, register, socialLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectingSocial, setConnectingSocial] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Social Account Chooser Modal (Google, Facebook, GitHub)
  const [socialModal, setSocialModal] = useState<"Google" | "Facebook" | "GitHub" | null>(null);
  const [customSocialEmail, setCustomSocialEmail] = useState("");
  const [useCustomSocialEmail, setUseCustomSocialEmail] = useState(false);

  // Password Recovery modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(defaultEmail || "");
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const newUser = await register({
          nombre: name.trim(),
          email: email.trim(),
          password: password,
        });
        confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
        onLogin(newUser.name, newUser.email, newUser.career, newUser.university);
      } else {
        const isInst = loginType === "institucion";
        const targetEmail = isInst ? institutionalEmail.trim() : email.trim();
        const finalUni = isInst
          ? (selectedInstitution === "Otra institución..." && customInstitution.trim()
              ? customInstitution.trim()
              : selectedInstitution)
          : undefined;

        const loggedUser = await login({
          email: targetEmail,
          password: password,
          institucion: finalUni,
          tipo_login: loginType,
        });
        confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
        onLogin(loggedUser.name, loggedUser.email, loggedUser.career, loggedUser.university);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg ||
          "Error al comunicarse con el servidor Dalat. Por favor verifica tus credenciales e intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Escuchar respuesta de la ventana emergente oficial (popup OAuth)
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_LOGIN_SUCCESS") {
        const { provider, email, name } = event.data;
        await handleExecuteSocialLogin(provider, email, name);
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  const handleOpenSocialModal = (provider: "Google" | "Facebook" | "GitHub") => {
    setErrorMsg(null);
    setUseCustomSocialEmail(false);
    setCustomSocialEmail("");

    // Intentar abrir la ventana emergente centrada idéntica a Google en otros sitios web
    if (typeof window !== "undefined") {
      const width = 500;
      const height = 620;
      const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
      const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
      const popup = window.open(
        `/auth/oauth-popup?provider=${provider.toLowerCase()}`,
        `dalat_oauth_${provider.toLowerCase()}`,
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes`
      );

      // Si el navegador tiene bloqueador de popups, se despliega el modal idéntico en pantalla
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        setSocialModal(provider);
      } else {
        popup.focus();
      }
    } else {
      setSocialModal(provider);
    }
  };

  const handleExecuteSocialLogin = async (
    provider: "Google" | "Facebook" | "GitHub",
    email?: string,
    nombre?: string
  ) => {
    try {
      setConnectingSocial(provider);
      setErrorMsg(null);
      const loggedUser = await socialLogin(provider, email);
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
      setSocialModal(null);
      onLogin(loggedUser.name, loggedUser.email, loggedUser.career, loggedUser.university);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || `No se pudo iniciar sesión con ${provider}.`);
    } finally {
      setConnectingSocial(null);
    }
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySent(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setRecoverySent(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-[#7c5dfa] selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#7c5dfa]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#d946ef]/8 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Back to Home button */}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#0f1328]/80 hover:bg-[#161c3c] border border-white/[0.08] px-3.5 py-2 rounded-xl backdrop-blur-md shadow-lg transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio</span>
        </button>
      )}

      {/* ========================================================================= */}
      {/* MAIN DOUBLE-SLIDER CONTAINER (Inspired by classic Double Slider Layout)   */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1020px] min-h-[640px] rounded-[32px] bg-[#0c0f22]/95 border border-white/[0.1] shadow-2xl shadow-black/90 overflow-hidden relative z-10 flex flex-col lg:flex-row backdrop-blur-2xl">
        
        {/* ===================================================================== */}
        {/* FORM 1: INICIAR SESIÓN (Left 50% in Desktop)                          */}
        {/* ===================================================================== */}
        <div
          className={`w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            mode === "login"
              ? "opacity-100 translate-x-0 pointer-events-auto z-10"
              : "opacity-0 -translate-x-12 pointer-events-none absolute lg:static"
          }`}
        >
          {/* Logo Dalat Oficial con imagen */}
          <div className="text-center space-y-2">
            <Image
              src="/dalat-logo-v2.png"
              alt="Dalat"
              width={140}
              height={44}
              className="h-10 sm:h-11 w-auto object-contain mx-auto"
              priority
            />
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
              Iniciar Sesión
            </h2>

            {/* Mobile Switcher */}
            <div className="lg:hidden pt-1">
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-xs font-bold text-purple-400 hover:text-purple-300"
              >
                ¿No tienes cuenta? Regístrate aquí &rarr;
              </button>
            </div>

            {/* Toggle Tipo de Usuario (Usuario Regular vs Estudiante de Institución) */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#070914] border border-white/[0.08] text-[11px] font-semibold max-w-sm mx-auto mt-2 gap-1">
              <button
                type="button"
                onClick={() => setLoginType("normal")}
                className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginType === "normal"
                    ? "bg-[#7c5dfa] text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Usuario Regular</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginType("institucion")}
                className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginType === "institucion"
                    ? "bg-[#7c5dfa] text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <School className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Estudiante de Institución</span>
              </button>
            </div>
          </div>

          {/* Error alert */}
          {errorMsg && (
            <div className="my-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3 my-auto py-2">
            {loginType === "institucion" ? (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Institución:</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={selectedInstitution}
                      onChange={(e) => setSelectedInstitution(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-purple-400 appearance-none cursor-pointer"
                    >
                      {INSTITUTIONS_LIST.map((u) => (
                        <option key={u} value={u} className="bg-[#0b0e20] text-white">
                          {u}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {selectedInstitution === "Otra institución..." && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300 block">Nombre de tu institución:</label>
                    <input
                      type="text"
                      required
                      value={customInstitution}
                      onChange={(e) => setCustomInstitution(e.target.value)}
                      placeholder="Ej: Universidad de Caldas"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 block">Correo institucional (.edu.co):</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={institutionalEmail}
                      onChange={(e) => setInstitutionalEmail(e.target.value)}
                      placeholder="estudiante@unal.edu.co"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">Correo electrónico:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="andrea@universidad.edu.co"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-300">Contraseña:</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition cursor-pointer"
                >
                  ¿La olvidaste?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#070914] border-white/20 text-purple-600 focus:ring-0 focus:ring-offset-0"
                />
                <span>Recordarme</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-900/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Icons row (Circular buttons: Google, Facebook, GitHub) */}
          <div className="space-y-2 pt-2 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">o ingresa con tu cuenta</span>
            <div className="flex items-center justify-center gap-3">
              {/* Google */}
              <button
                type="button"
                disabled={Boolean(connectingSocial)}
                onClick={() => handleOpenSocialModal("Google")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer disabled:opacity-50"
                title="Ingresar con Google"
              >
                {connectingSocial === "Google" ? (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
              </button>

              {/* Facebook */}
              <button
                type="button"
                disabled={Boolean(connectingSocial)}
                onClick={() => handleOpenSocialModal("Facebook")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white disabled:opacity-50"
                title="Ingresar con Facebook"
              >
                {connectingSocial === "Facebook" ? (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <span className="font-bold text-sm leading-none">f</span>
                )}
              </button>

              {/* GitHub */}
              <button
                type="button"
                disabled={Boolean(connectingSocial)}
                onClick={() => handleOpenSocialModal("GitHub")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white disabled:opacity-50"
                title="Ingresar con GitHub"
              >
                {connectingSocial === "GitHub" ? (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* FORM 2: REGISTRO (Right 50% in Desktop)                               */}
        {/* ===================================================================== */}
        <div
          className={`w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            mode === "register"
              ? "opacity-100 translate-x-0 pointer-events-auto z-10"
              : "opacity-0 translate-x-12 pointer-events-none absolute lg:static"
          }`}
        >
          {/* Logo Dalat Oficial con imagen */}
          <div className="text-center space-y-2">
            <Image
              src="/dalat-logo-v2.png"
              alt="Dalat"
              width={140}
              height={44}
              className="h-10 sm:h-11 w-auto object-contain mx-auto"
              priority
            />
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
              Crear tu Cuenta
            </h2>

            {/* Mobile Switcher */}
            <div className="lg:hidden pt-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
              >
                &larr; ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          </div>

          {/* Error alert */}
          {errorMsg && (
            <div className="my-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3 my-auto py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300 block">Nombre completo:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Andrea Gómez"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300 block">Correo universitario o personal:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="andrea@universidad.edu.co"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300 block">Contraseña:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-[#7c5dfa] hover:from-cyan-600 hover:to-[#6c4ae8] text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-900/30 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando tu cuenta...</span>
                </>
              ) : (
                <>
                  <span>Registrarme y Comenzar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Icons row (Circular buttons: Google, Facebook, GitHub) */}
          <div className="space-y-2 pt-2 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">o regístrate con tu cuenta</span>
            <div className="flex items-center justify-center gap-3">
              {/* Google */}
              <button
                type="button"
                disabled={Boolean(connectingSocial)}
                onClick={() => handleOpenSocialModal("Google")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer disabled:opacity-50"
                title="Registrarse con Google"
              >
                {connectingSocial === "Google" ? (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
              </button>

              {/* Facebook */}
              <button
                type="button"
                disabled={Boolean(connectingSocial)}
                onClick={() => handleOpenSocialModal("Facebook")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white disabled:opacity-50"
                title="Registrarse con Facebook"
              >
                {connectingSocial === "Facebook" ? (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <span className="font-bold text-sm leading-none">f</span>
                )}
              </button>

              {/* GitHub */}
              <button
                type="button"
                disabled={Boolean(connectingSocial)}
                onClick={() => handleOpenSocialModal("GitHub")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white disabled:opacity-50"
                title="Registrarse con GitHub"
              >
                {connectingSocial === "GitHub" ? (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* THE SLIDING OVERLAY PANEL (DESKTOP DOUBLE SLIDER)                     */}
        {/* ===================================================================== */}
        <div
          className={`hidden lg:block absolute top-0 left-0 w-1/2 h-full z-20 pointer-events-auto transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            mode === "login" ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div
            className={`relative w-full h-full border-l border-white/[0.08] overflow-hidden flex flex-col justify-center items-center p-8 sm:p-12 text-white select-none transition-all duration-700 ${
              mode === "login"
                ? "bg-gradient-to-br from-[#1e144a] via-[#351b75] to-[#5a25b2]"
                : "bg-gradient-to-br from-[#0e1d44] via-[#1a3274] to-[#264b9e]"
            }`}
          >
            {/* Subtle decorative glowing ambient shapes (CSS only, no heavy animations) */}
            <div className="absolute top-10 right-10 w-44 h-44 rounded-full bg-white/[0.05] blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-black/20 blur-2xl pointer-events-none" />

            {/* Floating Clean Typography & Ghost Action Button */}
            <div className="relative z-10 text-center max-w-sm mx-auto space-y-6">
              {mode === "login" ? (
                <>
                  <div className="space-y-3">
                    <h3 className="text-3xl sm:text-4xl font-editorial font-bold text-white tracking-tight leading-tight">
                      Comienza tu <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 via-purple-100 to-cyan-200">
                        viaje ahora.
                      </span>
                    </h3>
                    <p className="text-xs sm:text-[13px] text-indigo-100/80 leading-relaxed max-w-xs mx-auto font-medium">
                      Si aún no tienes una cuenta, únete a Dalat y transforma tu rendimiento académico con neurociencia e IA.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setMode("register");
                    }}
                    className="py-3 px-10 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#0b0e20] font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-purple-950/40 active:scale-95 cursor-pointer"
                  >
                    Registrarme
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <h3 className="text-3xl sm:text-4xl font-editorial font-bold text-white tracking-tight leading-tight">
                      ¡Bienvenido <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-indigo-100 to-fuchsia-200">
                        de nuevo!
                      </span>
                    </h3>
                    <p className="text-xs sm:text-[13px] text-indigo-100/80 leading-relaxed max-w-xs mx-auto font-medium">
                      Para mantenerte conectado con tus materias, horarios y cortes de notas, inicia sesión aquí.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setMode("login");
                    }}
                    className="py-3 px-10 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#0b0e20] font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-indigo-950/40 active:scale-95 cursor-pointer"
                  >
                    Iniciar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Social Account Chooser Modal (Google, Facebook, GitHub) */}
      {socialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          {socialModal === "Google" ? (
            /* ========================================================================= */
            /* DISEÑO OFICIAL 1:1 DE GOOGLE SIGN-IN (Material Design Blanco y Limpio)   */
            /* ========================================================================= */
            <div className="w-full max-w-[450px] bg-white rounded-2xl border border-[#dadce0] p-7 sm:p-9 shadow-2xl text-left text-[#202124] relative animate-in zoom-in-95 duration-150 font-sans">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSocialModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] flex items-center justify-center transition cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Official Google 4-Color Logo */}
              <div className="flex justify-center mb-3">
                <svg className="w-9 h-9" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>

              {/* Heading */}
              <div className="text-center mb-5">
                <h2 className="text-[22px] font-normal text-[#202124] mb-1 font-sans">
                  Acceder con Google
                </h2>
                <p className="text-sm text-[#5f6368]">
                  Elegir una cuenta para ir a{" "}
                  <span className="font-semibold text-[#202124]">Dalat</span>
                </p>
              </div>

              {/* Accounts list */}
              <div className="border-t border-[#dadce0] divide-y divide-[#dadce0] -mx-4 sm:-mx-6">
                {/* Account 1: Daniel Granados */}
                <button
                  type="button"
                  disabled={Boolean(connectingSocial)}
                  onClick={() =>
                    handleExecuteSocialLogin(
                      "Google",
                      "danielgaber@gmail.com",
                      "Daniel Granados"
                    )
                  }
                  className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-[#f8f9fa] active:bg-[#f1f3f4] transition text-left cursor-pointer group disabled:opacity-60"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm shrink-0 shadow-xs">
                    D
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#202124] group-hover:text-[#1a73e8] transition truncate">
                      Daniel Granados
                    </div>
                    <div className="text-xs text-[#5f6368] truncate">
                      danielgaber@gmail.com
                    </div>
                  </div>
                  {connectingSocial === "Google" && (
                    <Loader2 className="w-4 h-4 text-[#1a73e8] animate-spin" />
                  )}
                </button>

                {/* Account 2: Usar otra cuenta */}
                {!useCustomSocialEmail ? (
                  <button
                    type="button"
                    onClick={() => setUseCustomSocialEmail(true)}
                    className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-[#f8f9fa] active:bg-[#f1f3f4] transition text-left cursor-pointer text-[#202124] text-sm font-medium"
                  >
                    <div className="w-9 h-9 rounded-full border border-[#dadce0] flex items-center justify-center text-[#5f6368] shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <span>Usar otra cuenta</span>
                  </button>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customSocialEmail.trim()) {
                        handleExecuteSocialLogin(
                          "Google",
                          customSocialEmail.trim()
                        );
                      }
                    }}
                    className="p-4 bg-[#f8f9fa] space-y-3"
                  >
                    <label className="text-xs text-[#5f6368] font-medium block">
                      Correo electrónico o teléfono
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={customSocialEmail}
                      onChange={(e) => setCustomSocialEmail(e.target.value)}
                      placeholder="ejemplo@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#dadce0] bg-white text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setUseCustomSocialEmail(false)}
                        className="px-3 py-1.5 text-xs text-[#1a73e8] hover:bg-[#f1f3f4] rounded font-medium cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={Boolean(connectingSocial)}
                        className="px-4 py-1.5 text-xs bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded font-medium shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        {connectingSocial ? "Conectando..." : "Siguiente"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Disclaimer */}
              <div className="mt-7 text-[12px] text-[#5f6368] leading-relaxed border-t border-[#dadce0] pt-4">
                Para continuar, Google compartirá tu nombre, dirección de correo electrónico, preferencia de idioma y foto de perfil con{" "}
                <strong className="text-[#202124]">Dalat</strong>. Antes de usar esta app, puedes consultar la{" "}
                <span className="text-[#1a73e8] hover:underline cursor-pointer">
                  Política de Privacidad
                </span>{" "}
                y las{" "}
                <span className="text-[#1a73e8] hover:underline cursor-pointer">
                  Condiciones del Servicio
                </span>{" "}
                de Dalat.
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-[#5f6368] pt-2">
                <span>Español (Latinoamérica)</span>
                <div className="flex items-center gap-3">
                  <span className="hover:underline cursor-pointer">Ayuda</span>
                  <span className="hover:underline cursor-pointer">Privacidad</span>
                  <span className="hover:underline cursor-pointer">Condiciones</span>
                </div>
              </div>
            </div>
          ) : (
            /* Modal para Facebook / GitHub */
            <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#0c0f22] border border-[#232948] shadow-2xl text-left relative overflow-hidden">
              <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  {socialModal === "Facebook" && (
                    <div className="w-10 h-10 rounded-2xl bg-[#1877F2]/20 text-[#1877F2] flex items-center justify-center font-bold text-lg border border-[#1877F2]/30">
                      f
                    </div>
                  )}
                  {socialModal === "GitHub" && (
                    <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
                      <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-white text-base">
                      Continuar con {socialModal}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Selecciona una cuenta para ir a <span className="text-white font-semibold">Dalat</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSocialModal(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  disabled={Boolean(connectingSocial)}
                  onClick={() =>
                    handleExecuteSocialLogin(
                      socialModal,
                      "danielgaber@gmail.com",
                      "Daniel Granados"
                    )
                  }
                  className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-purple-600/15 border border-white/[0.08] hover:border-purple-500/50 flex items-center justify-between transition-all duration-200 group cursor-pointer text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7c5dfa] to-cyan-400 text-white font-bold flex items-center justify-center text-sm shadow-md">
                      DG
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        Daniel Granados
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        danielgaber@gmail.com
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-300 transition-all" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#0e1124] border border-[#232948] shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Recuperar contraseña</h3>
                <p className="text-xs text-slate-400">Enviaremos un enlace a tu correo</p>
              </div>
            </div>

            {!recoverySent ? (
              <form onSubmit={handleSendRecovery} className="space-y-3 pt-1">
                <div>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080a15] border border-white/[0.1] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                    placeholder="tu.correo@universidad.edu.co"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-semibold shadow-md transition cursor-pointer"
                  >
                    Enviar enlace
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-600/40 text-xs text-emerald-200 space-y-1 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="font-bold">¡Enlace enviado!</p>
                <p className="text-[11px] text-emerald-300/80">
                  Revisa tu bandeja en <strong>{recoveryEmail}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
