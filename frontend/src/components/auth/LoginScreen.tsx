"use client";

import React, { useState } from "react";
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
  // Main mode: "login" or "register"
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // In Login: 2 options ("normal" for regular user | "institucion" for institution student)
  const [loginType, setLoginType] = useState<"normal" | "institucion">("normal");

  // Common Form Fields
  const [name, setName] = useState(defaultName || "Andrea Gómez");
  const [email, setEmail] = useState(defaultEmail || "andrea@universidad.edu");
  const [password, setPassword] = useState("Dalat2026*");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Institution specific fields
  const [selectedInstitution, setSelectedInstitution] = useState(INSTITUTIONS_LIST[0]);
  const [customInstitution, setCustomInstitution] = useState("");
  const [institutionalEmail, setInstitutionalEmail] = useState("estudiante@unal.edu.co");

  const { login, register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recovery modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(defaultEmail || "");
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        // Register is ONLY for normal user (no institution options)
        const newUser = await register({
          nombre: name.trim(),
          email: email.trim(),
          password: password,
        });
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        onLogin(newUser.name, newUser.email, newUser.career, newUser.university);
      } else {
        // Login mode
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
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        onLogin(loggedUser.name, loggedUser.email, loggedUser.career, loggedUser.university);
      }
    } catch (err: any) {
      console.error("[LoginScreen] Error en autenticación:", err);
      setErrorMsg(
        err?.message ||
          "Error al comunicarse con el servidor Dalat. Si no tienes el backend encendido, puedes usar el botón de 'Acceso Demo Rápido'."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    confetti({ particleCount: 35, spread: 65, origin: { y: 0.6 } });
    if (loginType === "institucion" && mode === "login") {
      onLogin(
        "Andrea Gómez (UNAL)",
        "andrea@unal.edu.co",
        "Ingeniería de Sistemas",
        "Universidad Nacional de Colombia"
      );
    } else {
      onLogin(defaultName, defaultEmail);
    }
  };

  const handleSocialLogin = (provider: string) => {
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
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
    <div className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-[#7c5dfa] selection:text-white">
      {/* Soft ambient backdrops */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#7c5dfa]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[420px] h-[420px] bg-[#22d3ee]/8 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Split-Card */}
      <div className="w-full max-w-[880px] rounded-[28px] bg-[#0c0f1f] border border-[#1c223d] shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ================================================================= */}
        {/* LEFT PANEL: MINIMAL GRAPHIC SHOWCASE                              */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#231a5e] via-[#352285] to-[#5a32c2] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden text-white select-none min-h-[260px] lg:min-h-[540px]">
          {/* Subtle dots pattern top-left */}
          <div className="absolute top-7 left-7 grid grid-cols-4 gap-2 opacity-20 pointer-events-none">
            {[...Array(16)].map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-white block" />
            ))}
          </div>

          {/* Abstract circles and glowing sphere in corner */}
          <div className="absolute -bottom-12 -right-12 w-56 h-56 pointer-events-none flex items-center justify-center">
            <div className="w-52 h-52 rounded-full border border-white/20 absolute" />
            <div className="w-36 h-36 rounded-full border border-white/25 absolute" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-[#7c5dfa] shadow-[0_0_35px_rgba(34,211,238,0.5)] flex items-center justify-center" />
            <div className="absolute -top-1 right-10 w-5 h-5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
          </div>

          {/* Top Back Link */}
          <div className="relative z-10">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition py-1 px-2.5 rounded-lg hover:bg-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver</span>
              </button>
            )}
          </div>

          {/* Clean Central Title */}
          <div className="relative z-10 my-auto py-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-editorial font-bold tracking-tight text-white leading-[1.15]">
              {mode === "register" ? (
                <>
                  Tu viaje <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-violet-200">
                    empieza aquí
                  </span>
                </>
              ) : loginType === "institucion" ? (
                <>
                  Acceso <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-cyan-200">
                    Institucional
                  </span>
                </>
              ) : (
                <>
                  Bienvenido <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-violet-200">
                    de nuevo
                  </span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-indigo-100/75 font-normal leading-relaxed max-w-[240px]">
              {mode === "register"
                ? "Crea tu cuenta de usuario y empieza a organizar tus materias en Dalat."
                : loginType === "institucion"
                ? "Inicia sesión con la institución educativa a la que perteneces."
                : "Ingresa a tu cuenta para continuar tus sesiones de estudio."}
            </p>
          </div>

          {/* Bottom subtle logo */}
          <div className="relative z-10 flex items-center gap-2 text-white/50 text-xs font-medium">
            <span className={`w-2 h-2 rounded-full ${loginType === "institucion" && mode === "login" ? "bg-emerald-400" : "bg-cyan-400"}`} />
            <span>Dalat</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT PANEL: CLEAN AUTH FORM                                      */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#0c0f1f] text-slate-100">
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-4 text-center">
            <div className="w-11 h-11 rounded-2xl bg-[#141933] border border-[#262f55] flex items-center justify-center shadow-lg shadow-[#7c5dfa]/15 mb-2">
              <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-[#7c5dfa] to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-sm">
                Σ
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {mode === "register" ? "Crear cuenta" : "Iniciar sesión"}
            </h2>
          </div>

          {/* IF LOGIN: Mostrar 2 OPCIONES (Usuario normal vs Estudiante de institución) */}
          {mode === "login" && (
            <div className="flex bg-[#070914] p-1 rounded-xl border border-[#1c223e] mb-4 max-w-sm mx-auto w-full">
              <button
                type="button"
                onClick={() => setLoginType("normal")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  loginType === "normal"
                    ? "bg-[#7c5dfa] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Usuario normal</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginType("institucion")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  loginType === "institucion"
                    ? "bg-[#7c5dfa] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Estudiante de institución</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 max-w-sm mx-auto w-full">
            
            {/* ============================================================= */}
            {/* 1. REGISTRO (SOLO USUARIO NORMAL - SIN OPCIONES NI SELECTORES) */}
            {/* ============================================================= */}
            {mode === "register" && (
              <>
                <div className="space-y-1">
                  <label className="block text-slate-400 text-xs font-medium">
                    Nombre completo
                  </label>
                  <div className="relative bg-[#070914] border border-[#1b223d] rounded-xl focus-within:border-[#7c5dfa] transition">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 text-xs font-medium">
                    Correo electrónico
                  </label>
                  <div className="relative bg-[#070914] border border-[#1b223d] rounded-xl focus-within:border-[#7c5dfa] transition">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 text-xs font-medium">
                    Contraseña
                  </label>
                  <div className="relative bg-[#070914] border border-[#1b223d] rounded-xl focus-within:border-[#7c5dfa] transition">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-500 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#7c5dfa]/20 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creando cuenta en Dalat...</span>
                    </>
                  ) : (
                    <>
                      <span>Crear cuenta</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}

            {/* ============================================================= */}
            {/* 2. LOGIN: USUARIO NORMAL                                      */}
            {/* ============================================================= */}
            {mode === "login" && loginType === "normal" && (
              <>
                <div className="space-y-1">
                  <label className="block text-slate-400 text-xs font-medium">
                    Correo electrónico
                  </label>
                  <div className="relative bg-[#070914] border border-[#1b223d] rounded-xl focus-within:border-[#7c5dfa] transition">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 text-xs font-medium">
                    Contraseña
                  </label>
                  <div className="relative bg-[#070914] border border-[#1b223d] rounded-xl focus-within:border-[#7c5dfa] transition">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-500 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#070914] border-[#1b223d] text-[#7c5dfa] focus:ring-0 accent-[#7c5dfa] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[12px]">Recordarme</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] text-[#a78bfa] hover:text-white transition font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#7c5dfa]/20 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}

            {/* ============================================================= */}
            {/* 3. LOGIN: ESTUDIANTE DE INSTITUCIÓN (CON SELECTOR DE INSTITUTO)*/}
            {/* ============================================================= */}
            {mode === "login" && loginType === "institucion" && (
              <>
                {/* SELECTOR DE INSTITUCIÓN OBLIGATORIO */}
                <div className="space-y-1">
                  <label className="block text-slate-400 text-xs font-medium">
                    Selecciona tu institución educativa
                  </label>
                  <div className="relative bg-[#070914] border border-[#1b223d] rounded-xl focus-within:border-[#7c5dfa] transition">
                    <School className="w-4 h-4 text-[#a78bfa] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedInstitution}
                      onChange={(e) => setSelectedInstitution(e.target.value)}
                      className="w-full bg-transparent pl-10 pr-8 py-2.5 text-xs sm:text-sm text-white focus:outline-none appearance-none cursor-pointer"
                    >
                      {INSTITUTIONS_LIST.map((inst) => (
                        <option key={inst} value={inst} className="bg-[#0c0f1f] text-white">
                          {inst}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Si selecciona "Otra institución...", escribir el nombre */}
                {selectedInstitution === "Otra institución..." && (
                  <div className="space-y-1 animate-in fade-in duration-150">
                    <label className="block text-slate-400 text-xs font-medium">
                      Nombre de tu universidad o colegio
                    </label>
                    <div className="relative bg-[#070914] border border-[#1b223d] rounded-xl focus-within:border-[#7c5dfa] transition">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customInstitution}
                        onChange={(e) => setCustomInstitution(e.target.value)}
                        className="w-full bg-transparent pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                        placeholder="Ej. Universidad de Cartagena"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-slate-400 text-xs font-medium">
                    Correo institucional
                  </label>
                  <div className="relative bg-[#070914] border border-[#1b223d] rounded-xl focus-within:border-[#7c5dfa] transition">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={institutionalEmail}
                      onChange={(e) => setInstitutionalEmail(e.target.value)}
                      className="w-full bg-transparent pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
                      placeholder="tu.correo@universidad.edu.co"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 text-xs font-medium">
                    Contraseña institucional
                  </label>
                  <div className="relative bg-[#070914] border border-[#1b223d] rounded-xl focus-within:border-[#7c5dfa] transition">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-500 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#070914] border-[#1b223d] text-[#7c5dfa] focus:ring-0 accent-[#7c5dfa] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[12px]">Recordarme</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] text-[#a78bfa] hover:text-white transition font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7c5dfa] to-[#5e38d6] hover:from-[#6c4ae8] hover:to-[#4e2bbd] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#7c5dfa]/20 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validando convenio institucional...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar sesión institucional</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>

          {/* Social or SSO Icons */}
          <div className="max-w-sm mx-auto w-full pt-4 space-y-3.5">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-[#171c33]" />
              <span className="flex-shrink mx-3 text-slate-500 text-[11px]">
                {mode === "login" && loginType === "institucion"
                  ? "o ingresar con SSO universitario"
                  : "o continuar con"}
              </span>
              <div className="flex-grow border-t border-[#171c33]" />
            </div>

            <div className="flex items-center justify-center gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="w-10 h-10 rounded-xl bg-[#12162a] hover:bg-[#1a203a] border border-[#202746] transition flex items-center justify-center active:scale-95"
                title="Google Workspace"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              {/* Microsoft / Outlook */}
              <button
                type="button"
                onClick={() => handleSocialLogin("Microsoft")}
                className="w-10 h-10 rounded-xl bg-[#12162a] hover:bg-[#1a203a] border border-[#202746] transition flex items-center justify-center active:scale-95"
                title="Microsoft 365"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
              </button>

              {/* Apple (Only for normal user or register) */}
              {(mode === "register" || loginType === "normal") && (
                <button
                  type="button"
                  onClick={() => handleSocialLogin("Apple")}
                  className="w-10 h-10 rounded-xl bg-[#12162a] hover:bg-[#1a203a] border border-[#202746] transition flex items-center justify-center active:scale-95"
                  title="Apple"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.65-14.01-6.19-9.57-11.06-20.44-14.61-32.61-3.55-12.18-5.33-23.77-5.33-34.78 0-14.8 3.58-27.18 10.74-37.14 7.17-9.97 16.32-15.06 27.46-15.28 4.58 0 9.8 1.25 15.66 3.76 5.86 2.51 9.8 3.86 11.82 4.07 1.85-.21 6.01-1.63 12.48-4.28 6.47-2.64 12.04-3.86 16.71-3.65 12.85.63 23.01 4.75 30.48 12.37-11.06 6.74-16.48 15.93-16.27 27.56.21 9.35 3.82 17.18 10.82 23.51 7 6.33 15.34 9.97 25.02 10.92-2.12 6.74-4.88 13.78-8.28 21.13zM119.22 31.84c0-7.39 2.65-14.19 7.95-20.39 5.3-6.2 11.82-10.15 19.57-11.85.21 1.06.32 2.12.32 3.18 0 7.39-2.75 14.39-8.26 20.98-5.51 6.59-12.18 10.36-20.02 11.31-.21-1.06-.32-2.12-.32-3.18z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Switchers & Demo */}
            <div className="text-center text-xs text-slate-400 pt-1 space-y-1.5">
              {mode === "login" ? (
                <p>
                  ¿No tienes una cuenta aún?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-[#a78bfa] font-semibold hover:underline transition"
                  >
                    Registrarse
                  </button>
                </p>
              ) : (
                <p>
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-[#a78bfa] font-semibold hover:underline transition"
                  >
                    Iniciar sesión
                  </button>
                </p>
              )}

              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition block mx-auto hover:underline"
              >
                {mode === "login" && loginType === "institucion"
                  ? "o probar con institución demo"
                  : "o entrar en modo demo"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#0e1122] border border-[#232948] shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#080a15] border border-[#1e2544] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#7c5dfa]"
                    placeholder="tu.correo@universidad.edu"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-semibold shadow-md transition"
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
