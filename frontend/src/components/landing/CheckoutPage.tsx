"use client";

import React, { useState, useMemo } from "react";
import {
  Lock,
  CheckCircle2,
  CreditCard,
  Building2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  User,
  Mail,
  KeyRound,
  Phone,
  Copy,
  QrCode,
  FileText
} from "lucide-react";
import confetti from "canvas-confetti";
import AmbientBackground from "@/components/ui/AmbientBackground";

export interface SelectedPlan {
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
}

export interface UserAccount {
  name: string;
  email: string;
}

interface CheckoutPageProps {
  plan: SelectedPlan;
  user: UserAccount | null;
  onUserLoginOrRegister: (name: string, email: string) => void;
  onBackToPricing: () => void;
  onPaymentSuccess: () => void;
}

type PaymentMethod = "tarjeta" | "pse" | "nequi";

const COLOMBIAN_BANKS = [
  "Bancolombia",
  "Davivienda",
  "Nu Colombia (Cuenta de Ahorros)",
  "Nequi (vía PSE)",
  "Banco de Bogotá",
  "BBVA Colombia",
  "Lulo Bank",
  "RappiPay",
  "Scotiabank Colpatria",
  "Banco Falabella",
  "Banco de Occidente",
  "Banco Popular",
  "Banco Agrario",
  "Daviplata (vía PSE)"
];

export default function CheckoutPage({
  plan,
  user,
  onUserLoginOrRegister,
  onBackToPricing,
  onPaymentSuccess
}: CheckoutPageProps) {
  // Step indicator state
  const [currentStep, setCurrentStep] = useState<number>(user ? 2 : 1);

  // Account Form State (if not logged in)
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Payment Method Selection
  const [method, setMethod] = useState<PaymentMethod>("tarjeta");

  // Card Inputs & Live Preview
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardInstallments, setCardInstallments] = useState("1");

  // PSE Inputs
  const [selectedBank, setSelectedBank] = useState("Bancolombia");
  const [personType, setPersonType] = useState<"natural" | "juridica">("natural");
  const [docType, setDocType] = useState("CC");
  const [docNumber, setDocNumber] = useState("");
  const [pseEmail, setPseEmail] = useState("");

  // Nequi Inputs
  const [nequiPhone, setNequiPhone] = useState("");

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [copiedTx, setCopiedTx] = useState(false);

  // Live Card Brand Detection
  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.startsWith("4")) return "visa";
    if (clean.startsWith("5") || clean.startsWith("2")) return "mastercard";
    if (clean.startsWith("3")) return "amex";
    return null;
  }, [cardNumber]);

  // Handle Account Authentication
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authEmail.includes("@")) {
      setAuthError("Por favor ingresa un correo universitario o personal válido.");
      return;
    }
    if (authMode === "register" && !authName.trim()) {
      setAuthError("Por favor ingresa tu nombre completo.");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    setAuthError("");
    const finalName = authMode === "register" ? authName.trim() : authEmail.split("@")[0];
    onUserLoginOrRegister(finalName, authEmail.trim());
    setCurrentStep(2);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
  };

  // Card Number Formatter
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
  };

  // Card Expiry Formatter
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Nequi Phone Formatter
  const handleNequiPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setNequiPhone(raw);
  };

  // Payment Submission
  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      const fallbackName = cardHolder.trim() || "Andrea Gómez (Estudiante)";
      const fallbackEmail = (pseEmail.trim() || authEmail.trim()) || "andrea.gomez@unal.edu.co";
      onUserLoginOrRegister(fallbackName, fallbackEmail);
    }

    setIsProcessing(true);
    const tx = `DLT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTransactionId(tx);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      confetti({
        particleCount: 110,
        spread: 100,
        origin: { y: 0.45 }
      });
    }, 2000);
  };

  const copyTransactionId = () => {
    if (!transactionId) return;
    navigator.clipboard.writeText(transactionId);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0e1e] via-[#090b17] to-[#070812] text-slate-100 flex flex-col font-sans selection:bg-[#7c5dfa] selection:text-white relative overflow-x-hidden">
      {/* Delicate Blueprint Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Floating Cosmic Particles */}
      <AmbientBackground isLightMode={false} />

      {/* Luminous Ambient Aurora Glow Orbs */}
      <div className="fixed top-0 left-1/6 w-[80vw] max-w-[750px] h-[450px] bg-gradient-to-br from-purple-600/25 via-indigo-600/20 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/4 right-0 w-[80vw] max-w-[650px] h-[550px] bg-gradient-to-bl from-indigo-500/20 via-sky-500/15 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/3 w-[65vw] max-w-[700px] h-[400px] bg-gradient-to-t from-fuchsia-600/18 via-purple-700/15 to-transparent rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Top Checkout Header */}
      <header className="border-b border-white/[0.08] bg-[#080b18]/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button
            onClick={onBackToPricing}
            className="justify-self-start flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition duration-200 group cursor-pointer p-1.5 -ml-1.5 rounded-lg"
            aria-label="Volver a Planes y Precios"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
            <span className="hidden md:inline">Volver a Planes y Precios</span>
            <span className="hidden sm:inline md:hidden">Volver</span>
          </button>

          {/* Logo Dalat */}
          <div className="flex items-center gap-2 select-none">
            <img
              src="/icono-dalat.png"
              alt="Dalat"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-md"
            />
            <span className="font-bold text-white text-sm sm:text-base tracking-tight whitespace-nowrap">Dalat Pay</span>
          </div>

          <div className="justify-self-end flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Conexión Cifrada</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Body */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 relative z-10">
        {!isCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: 2-STEP PAYMENT WORKFLOW */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 min-w-0">
              {/* Stepper Progress Bar */}
              <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#0b0e1e] border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    currentStep === 1
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                      : user
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    user ? "bg-emerald-400 text-[#090b14]" : "bg-white/20 text-white"
                  }`}>
                    {user ? "✓" : "1"}
                  </span>
                  <span>Identificación</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    currentStep === 2
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
                    2
                  </span>
                  <span className="sm:hidden">Pago</span>
                  <span className="hidden sm:inline">Pago y Confirmación</span>
                </button>
              </div>

              {/* STEP 1: USER ACCOUNT IDENTIFICATION */}
              {currentStep === 1 && (
                <div className="p-5 sm:p-8 rounded-3xl bg-[#0c0f22]/90 border border-white/[0.1] shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-base sm:text-lg">
                        Identificación de Estudiante
                      </h3>
                      <p className="text-xs text-slate-400">
                        Vincula tu compra a tu cuenta para activar las herramientas Pro de forma inmediata.
                      </p>
                    </div>
                    {user ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        <span>Identificado</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthName("Andrea Gómez");
                          setAuthEmail("andrea.gomez@unal.edu.co");
                          setAuthPassword("dalat2026pro");
                          onUserLoginOrRegister("Andrea Gómez", "andrea.gomez@unal.edu.co");
                          setCurrentStep(2);
                        }}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                        title="Autocompletar sesión de estudiante demo"
                      >
                        <span>Autocompletar Demo</span>
                      </button>
                    )}
                  </div>

                  {user ? (
                    <div className="p-5 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-md shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{user.name}</h4>
                          <p className="text-xs text-slate-300 font-mono mt-0.5 break-all">{user.email}</p>
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Cuenta verificada &bull; Acceso instantáneo listo</span>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        Continuar al Pago &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Register or Login Mode Switcher */}
                      <div className="grid grid-cols-2 p-1 rounded-xl bg-[#060812] border border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("register");
                            setAuthError("");
                          }}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            authMode === "register"
                              ? "bg-purple-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Crear cuenta nueva
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setAuthError("");
                          }}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            authMode === "login"
                              ? "bg-purple-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Ya tengo cuenta
                        </button>
                      </div>

                      {authError && (
                        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <form onSubmit={handleAuthSubmit} className="space-y-4">
                        {authMode === "register" && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300 block">
                              Nombre completo:
                            </label>
                            <div className="relative">
                              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                              <input
                                type="text"
                                required
                                placeholder="Ej: Andrea Gómez"
                                value={authName}
                                onChange={(e) => setAuthName(e.target.value)}
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-300 block">
                            Correo universitario o personal:
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                            <input
                              type="email"
                              required
                              placeholder="andrea@universidad.edu.co"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Te enviaremos el comprobante de pago oficial y las credenciales a este correo.
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-300 block">
                            Contraseña:
                          </label>
                          <div className="relative">
                            <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                            <input
                              type="password"
                              required
                              placeholder="Mínimo 6 caracteres"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
                        >
                          <span>{authMode === "register" ? "Crear cuenta y pasar al pago" : "Iniciar sesión y continuar"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: PAYMENT METHOD & INTERACTIVE PREVIEW */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* 3 Branded Colombian Payment Selector Tabs */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {/* 1. Tarjeta */}
                    <button
                      type="button"
                      onClick={() => setMethod("tarjeta")}
                      className={`p-3 sm:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer min-w-0 ${
                        method === "tarjeta"
                          ? "bg-purple-950/40 border-purple-400 shadow-xl shadow-purple-900/30 scale-[1.02]"
                          : "bg-[#0c0f20]/90 border-white/[0.08] hover:border-white/[0.18] text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[11px] sm:text-sm text-white leading-tight">Tarjetas</h4>
                        <p className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Visa &bull; Master &bull; Nu</p>
                      </div>
                    </button>

                    {/* 2. PSE */}
                    <button
                      type="button"
                      onClick={() => setMethod("pse")}
                      className={`p-3 sm:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer min-w-0 ${
                        method === "pse"
                          ? "bg-sky-950/40 border-sky-400 shadow-xl shadow-sky-900/30 scale-[1.02]"
                          : "bg-[#0c0f20]/90 border-white/[0.08] hover:border-white/[0.18] text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center mb-2">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[11px] sm:text-sm text-white leading-tight">PSE Bancario</h4>
                        <p className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Todos los bancos</p>
                      </div>
                    </button>

                    {/* 3. Nequi / Daviplata */}
                    <button
                      type="button"
                      onClick={() => setMethod("nequi")}
                      className={`p-3 sm:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer min-w-0 ${
                        method === "nequi"
                          ? "bg-pink-950/40 border-pink-400 shadow-xl shadow-pink-900/30 scale-[1.02]"
                          : "bg-[#0c0f20]/90 border-white/[0.08] hover:border-white/[0.18] text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center mb-2">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[11px] sm:text-sm text-white leading-tight">Nequi</h4>
                        <p className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Directo por celular</p>
                      </div>
                    </button>
                  </div>

                  {/* LIVE INTERACTIVE VISUAL CARD / PSE BANNER */}
                  {method === "tarjeta" && (
                    <div className="relative w-full max-w-[420px] mx-auto aspect-[1.586/1] rounded-2xl p-4 sm:p-6 text-white overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-tr from-[#130f2e] via-[#211648] to-[#12243d] flex flex-col justify-between transition-all duration-300 group">
                      {/* Glossy Reflection Wave */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent pointer-events-none" />

                      {/* Card Top: Chip & Brand */}
                      <div className="flex items-center justify-between relative z-10">
                        {/* Gold EMV Chip */}
                        <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200/50 flex flex-col justify-around p-1 shadow-inner">
                          <div className="h-0.5 bg-amber-800/40 rounded-full" />
                          <div className="h-0.5 bg-amber-800/40 rounded-full" />
                          <div className="h-0.5 bg-amber-800/40 rounded-full" />
                        </div>

                        {/* Brand Badge */}
                        {cardBrand ? (
                          <div className="font-mono font-black text-sm tracking-widest uppercase px-3 py-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-sm">
                            {cardBrand === "visa" && <span className="text-sky-300 font-serif italic text-base">VISA</span>}
                            {cardBrand === "mastercard" && (
                              <div className="flex items-center -space-x-1.5">
                                <span className="w-4 h-4 rounded-full bg-rose-500 block" />
                                <span className="w-4 h-4 rounded-full bg-amber-400 block opacity-90" />
                              </div>
                            )}
                            {cardBrand === "amex" && <span className="text-cyan-300 text-xs font-bold">AMEX</span>}
                          </div>
                        ) : (
                          <div className="w-14 h-6" />
                        )}
                      </div>

                      {/* Card Number: Formatted in 4 blocks */}
                      <div className="relative z-10 py-2">
                        <span className="font-mono text-sm min-[380px]:text-base sm:text-xl tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap text-slate-100 drop-shadow">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </span>
                      </div>

                      {/* Card Bottom: Holder & Expiry */}
                      <div className="flex items-end justify-between relative z-10 text-[11px] font-mono uppercase tracking-wider">
                        <div>
                          <span className="text-[9px] text-slate-400 block">Titular</span>
                          <span className="font-bold truncate max-w-[150px] sm:max-w-[200px] block text-white drop-shadow">
                            {cardHolder || (user?.name || "NOMBRE ESTUDIANTE")}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block">Expira</span>
                          <span className="font-bold text-white drop-shadow">{cardExpiry || "MM/AA"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {method === "pse" && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 to-[#0a1628]/60 border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
                          PSE
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Débito Seguro en Línea (PSE)</h4>
                          <p className="text-xs text-slate-300">
                            Autorización directa con {selectedBank || "tu entidad bancaria"} sin costos adicionales.
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-sky-300 bg-sky-900/50 px-2.5 py-1 rounded-md border border-sky-400/30 shrink-0">
                        ACH Colombia
                      </span>
                    </div>
                  )}

                  {method === "nequi" && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 to-[#1f0b20]/60 border border-pink-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-sm shrink-0">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Pago Directo con Nequi</h4>
                          <p className="text-xs text-slate-300">
                            Recibirás una notificación push en tu celular para autorizar en segundos.
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-pink-300 bg-pink-900/50 px-2.5 py-1 rounded-md border border-pink-400/30 shrink-0">
                        Inmediato
                      </span>
                    </div>
                  )}

                  {/* FORM FIELDS PER METHOD */}
                  <div className="p-5 sm:p-7 rounded-3xl bg-[#0c0f22]/90 border border-white/[0.1] shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handlePay} className="space-y-4">
                      {/* 1. Tarjetas Fields */}
                      {method === "tarjeta" && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300 block">
                              Número de Tarjeta:
                            </label>
                            <div className="relative">
                              <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                              <input
                                type="text"
                                required
                                placeholder="4000 1234 5678 9010"
                                maxLength={19}
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300 block">
                              Nombre del titular en la tarjeta:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Como aparece impreso en el plástico"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                            />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-300 block">
                                Expiración:
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="MM/AA"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={handleCardExpiryChange}
                                className="w-full px-3 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-300 block">
                                CVV:
                              </label>
                              <input
                                type="password"
                                required
                                placeholder="123"
                                maxLength={4}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                                className="w-full px-3 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                              />
                            </div>

                            <div className="space-y-1.5 col-span-2 sm:col-span-1">
                              <label className="text-xs font-medium text-slate-300 block">
                                Cuotas:
                              </label>
                              <select
                                value={cardInstallments}
                                onChange={(e) => setCardInstallments(e.target.value)}
                                className="w-full px-2.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-purple-400 transition"
                              >
                                <option value="1">1 cuota ($0 interés)</option>
                                <option value="2">2 cuotas</option>
                                <option value="3">3 cuotas</option>
                                <option value="6">6 cuotas</option>
                                <option value="12">12 cuotas</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. PSE Fields */}
                      {method === "pse" && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300 block">
                              Selecciona tu entidad financiera:
                            </label>
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-sky-400 transition"
                            >
                              {COLOMBIAN_BANKS.map((bank) => (
                                <option key={bank} value={bank} className="bg-[#070914] text-white">
                                  {bank}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-300 block">
                                Tipo de Persona:
                              </label>
                              <select
                                value={personType}
                                onChange={(e) => setPersonType(e.target.value as "natural" | "juridica")}
                                className="w-full px-3 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-sky-400 transition"
                              >
                                <option value="natural">Persona Natural</option>
                                <option value="juridica">Persona Jurídica</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-300 block">
                                Documento de Identidad:
                              </label>
                              <div className="flex gap-2">
                                <select
                                  value={docType}
                                  onChange={(e) => setDocType(e.target.value)}
                                  className="w-20 px-2 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-sky-400 transition shrink-0"
                                >
                                  <option value="CC">CC</option>
                                  <option value="TI">TI</option>
                                  <option value="CE">CE</option>
                                  <option value="NIT">NIT</option>
                                  <option value="PAS">PAS</option>
                                </select>
                                <input
                                  type="text"
                                  required
                                  placeholder="Número de cédula"
                                  value={docNumber}
                                  onChange={(e) => setDocNumber(e.target.value)}
                                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300 block">
                              Correo electrónico registrado en PSE:
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="andrea@ejemplo.com"
                              value={pseEmail}
                              onChange={(e) => setPseEmail(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition"
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. Nequi Fields */}
                      {method === "nequi" && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300 block">
                              Número de celular Nequi (10 dígitos):
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-pink-400">
                                +57
                              </span>
                              <input
                                type="tel"
                                required
                                placeholder="300 123 4567"
                                maxLength={10}
                                value={nequiPhone}
                                onChange={handleNequiPhoneChange}
                                className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-[#070914] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition"
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Te enviaremos una solicitud de débito en tu app de Nequi. Tienes 5 minutos para autorizar.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Submit Payment CTA */}
                      <div className="pt-2 space-y-3">
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] text-white font-bold text-sm tracking-wide shadow-xl shadow-purple-900/40 hover:shadow-purple-900/60 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer px-4 text-center"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Conectando con pasarela segura...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 shrink-0" />
                              <span>
                                Confirmar y Pagar {plan.price}
                                <span className="hidden sm:inline">
                                  {" "}
                                  {method === "tarjeta" ? "con Tarjeta" : method === "pse" ? "vía PSE" : "con Nequi"}
                                </span>
                              </span>
                              <ArrowRight className="w-4 h-4 shrink-0" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR & TRUST CARD */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5 min-w-0">
              <div className="p-5 sm:p-8 rounded-3xl bg-[#0c0f22]/90 border border-white/[0.1] shadow-2xl backdrop-blur-2xl space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-purple-300">
                      RESUMEN DE TU PLAN
                    </span>
                    <div className="flex items-center gap-2">
                      {plan.badge && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
                          {plan.badge}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={onBackToPricing}
                        className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline underline-offset-2 transition cursor-pointer"
                      >
                        Cambiar plan
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{plan.period}</p>

                  <button
                    type="button"
                    onClick={onBackToPricing}
                    className="w-full mt-3 py-2 px-3 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Explorar planes (Microsuscripciones, Mensual o Anual)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Features Included List */}
                <div className="space-y-2.5 pt-4 border-t border-white/[0.08]">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">Lo que desbloqueas:</span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-white/[0.08] text-xs">
                  <div className="flex justify-between gap-3 text-slate-400">
                    <span>Subtotal del plan:</span>
                    <span className="font-mono text-white font-semibold">{plan.price}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-slate-400">
                    <span>IVA (Exención Art. 476 E.T. Educación Virtual):</span>
                    <span className="font-mono text-emerald-400 font-bold">$0 COP</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pt-3 border-t border-white/[0.08]">
                    <div>
                      <span className="font-bold text-sm text-white block">Total a pagar:</span>
                      <span className="text-[10px] text-slate-400">Moneda legal colombiana (COP)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                        {plan.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PAYMENT SUCCESS SCREEN: MINIMALIST DIGITAL RECEIPT */
          <div className="max-w-md mx-auto py-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-emerald-400">
                Transacción Exitosa
              </span>
              <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white">
                ¡Bienvenido a Dalat Pro!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Tu suscripción ya está activa para <span className="text-slate-200 font-mono">{user?.email}</span>
              </p>
            </div>

            {/* Clean Minimalist Receipt Card */}
            <div className="rounded-2xl bg-[#0c0f24]/90 border border-white/[0.08] p-5 sm:p-6 text-left shadow-2xl backdrop-blur-xl space-y-4">
              {/* Receipt Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <img
                    src="/icono-dalat.png"
                    alt="Dalat"
                    className="w-5 h-5 object-contain"
                  />
                  <span className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
                    Recibo de Pago
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyTransactionId}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white font-mono text-[11px] transition bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-md border border-white/5 cursor-pointer"
                  title="Copiar ID de transacción"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedTx ? "Copiado" : transactionId}</span>
                </button>
              </div>

              {/* Receipt Details */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-semibold text-white">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Método de pago</span>
                  <span className="text-slate-200 capitalize">
                    {method === "tarjeta"
                      ? "Tarjeta Débito/Crédito"
                      : method === "pse"
                      ? `PSE (${selectedBank})`
                      : `Nequi (+57 ${nequiPhone || "Móvil"})`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estado</span>
                  <span className="text-emerald-400 font-medium">Aprobado</span>
                </div>
              </div>

              {/* Dashed divider & Total */}
              <div className="border-t border-dashed border-white/[0.12] pt-3 flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-wide text-slate-400 font-mono">
                  Total Pagado
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {plan.price}
                </span>
              </div>
            </div>

            {/* Action CTA to Enter the Dashboard */}
            <button
              onClick={onPaymentSuccess}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] text-white font-semibold text-sm shadow-xl shadow-purple-900/30 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Entrar al Tablero de Estudio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
