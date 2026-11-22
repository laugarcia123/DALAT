"use client";

import React, { useState } from "react";
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
  AlertCircle
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
  const [name, setName] = useState(defaultName || "Andrea Gómez");
  const [email, setEmail] = useState(defaultEmail || "andrea@universidad.edu");
  const [password, setPassword] = useState("Dalat2026*");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Institution specific inputs
  const [selectedInstitution, setSelectedInstitution] = useState(INSTITUTIONS_LIST[0]);
  const [customInstitution, setCustomInstitution] = useState("");
  const [institutionalEmail, setInstitutionalEmail] = useState("estudiante@unal.edu.co");

  const { login, register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        });
        confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
        onLogin(loggedUser.name, loggedUser.email, loggedUser.career, loggedUser.university);
      }
    } catch (err: unknown) {
      console.error("[LoginScreen] Error de autenticación:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg ||
          "Error al comunicarse con el servidor Dalat. Por favor verifica tus credenciales e intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    confetti({ particleCount: 35, spread: 65, origin: { y: 0.6 } });
    onLogin(defaultName, `${defaultName.toLowerCase().replace(/\s+/g, ".")}@${provider.toLowerCase()}.com`);
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

          {/* Social Icons row (Circular buttons: Gmail / Google, Facebook, GitHub, LinkedIn) */}
          <div className="space-y-2 pt-2 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">o ingresa con tu cuenta</span>
            <div className="flex items-center justify-center gap-3">
              {/* Google / Gmail */}
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
                title="Ingresar con Google / Gmail"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.8C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.8c2.2-2 3.7-5 3.7-8.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.4C.7 8.8 0 11.3 0 14s.7 5.2 1.9 7.6l3.7-2.8v-4z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.8c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.8 5.6 7 10.1 7z"
                  />
                </svg>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleSocialLogin("Facebook")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white"
                title="Ingresar con Facebook"
              >
                <span className="font-bold text-sm leading-none">f</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => handleSocialLogin("GitHub")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white"
                title="Ingresar con GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => handleSocialLogin("LinkedIn")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white"
                title="Ingresar con LinkedIn"
              >
                <span className="font-bold text-xs leading-none">in</span>
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

          {/* Social Icons row (Circular buttons: Gmail / Google, Facebook, GitHub, LinkedIn) */}
          <div className="space-y-2 pt-2 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">o regístrate con tu cuenta</span>
            <div className="flex items-center justify-center gap-3">
              {/* Google / Gmail */}
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
                title="Registrarse con Google / Gmail"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.8C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.8c2.2-2 3.7-5 3.7-8.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.4C.7 8.8 0 11.3 0 14s.7 5.2 1.9 7.6l3.7-2.8v-4z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.8c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.8 5.6 7 10.1 7z"
                  />
                </svg>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleSocialLogin("Facebook")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white"
                title="Registrarse con Facebook"
              >
                <span className="font-bold text-sm leading-none">f</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => handleSocialLogin("GitHub")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white"
                title="Registrarse con GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => handleSocialLogin("LinkedIn")}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer text-slate-300 hover:text-white"
                title="Registrarse con LinkedIn"
              >
                <span className="font-bold text-xs leading-none">in</span>
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
