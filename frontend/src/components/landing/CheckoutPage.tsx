"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  CreditCard,
  Building2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Check,
  AlertCircle,
  User,
  Mail,
  KeyRound,
  Shield
} from "lucide-react";
import confetti from "canvas-confetti";

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

type PaymentMethod = "tarjeta" | "pse";

const COLOMBIAN_BANKS = [
  "Bancolombia",
  "Davivienda",
  "Banco de Bogotá",
  "BBVA Colombia",
  "Nu Colombia",
  "Nequi (vía PSE)",
  "Lulo Bank",
  "Banco de Occidente",
  "Banco Popular",
  "Scotiabank Colpatria",
  "Banco Falabella",
  "RappiPay",
  "Banco Agrario"
];

export default function CheckoutPage({
  plan,
  user,
  onUserLoginOrRegister,
  onBackToPricing,
  onPaymentSuccess
}: CheckoutPageProps) {
  // Account Form State (if user is not logged in yet)
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Payment Form State
  const [method, setMethod] = useState<PaymentMethod>("tarjeta");

  // Card Inputs
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

  // Processing & Completion State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // Handle Account Creation / Login
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authEmail.includes("@")) {
      setAuthError("Ingresa un correo electrónico válido");
      return;
    }
    if (authMode === "register" && !authName.trim()) {
      setAuthError("Por favor ingresa tu nombre completo");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    setAuthError("");
    const finalName = authMode === "register" ? authName.trim() : authEmail.split("@")[0];
    onUserLoginOrRegister(finalName, authEmail.trim());
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
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

  // Payment Submission
  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthError("Debes iniciar sesión o registrar tu cuenta antes de realizar el pago");
      return;
    }

    setIsProcessing(true);
    const tx = `DLT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTransactionId(tx);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.5 }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#06070d] text-slate-100 flex flex-col font-sans selection:bg-[#7c5dfa] selection:text-white">
      {/* Top Checkout Header */}
      <header className="border-b border-[#181d38] bg-[#080b18]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <button
            onClick={onBackToPricing}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a Planes y Precios</span>
          </button>

          {/* Logo and Secure Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2a1d59] to-[#4c359e] border border-[#583eb5] flex items-center justify-center shadow-lg shadow-[#7c5dfa]/25">
              <span className="text-white font-black text-sm">Σ</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm">Dalat Pay</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  Checkout Seguro
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block font-mono">
                Pasarela Oficial Colombia &bull; Cifrado SSL 256-Bit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Conexión Cifrada</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Body */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {!isCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT COLUMN: STEPS (ACCOUNT VERIFICATION & PAYMENT) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Breadcrumb Indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Dalat</span>
                <span>/</span>
                <span>Planes en Colombia</span>
                <span>/</span>
                <span className="text-white font-semibold">Pasarela de Pago Segura</span>
              </div>

              {/* STEP 1: ACCOUNT REQUIREMENT */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0a0d1d] border border-[#1d2345] shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#181f3c]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#7c5dfa] text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-bold text-white text-base">Cuenta de Estudiante Dalat</h3>
                  </div>
                  {user && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Cuenta Activa</span>
                    </span>
                  )}
                </div>

                {user ? (
                  /* User is logged in: show verified badge */
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-600/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{user.name}</h4>
                        <p className="text-xs text-slate-300 font-mono">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-300 font-medium bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-700/50">
                      ✓ Vinculada a tu compra
                    </span>
                  </div>
                ) : (
                  /* User NOT logged in: required login/register form */
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-xs text-amber-200 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Se requiere una cuenta para adquirir este plan</span>
                        <span>
                          Para vincular tu acceso a las herramientas Pro y enviarte el comprobante oficial de pago, debes iniciar sesión o crear tu cuenta gratuita primero.
                        </span>
                      </div>
                    </div>

                    {/* Mode Toggle: Register / Login */}
                    <div className="flex rounded-xl bg-[#060812] border border-[#1b213e] p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("register");
                          setAuthError("");
                        }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                          authMode === "register" ? "bg-[#7c5dfa] text-white" : "text-slate-400 hover:text-white"
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
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                          authMode === "login" ? "bg-[#7c5dfa] text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Ya tengo cuenta &bull; Iniciar sesión
                      </button>
                    </div>

                    {authError && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/50 text-xs text-rose-300">
                        {authError}
                      </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-3 pt-1">
                      {authMode === "register" && (
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Nombre completo:</label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                            <input
                              type="text"
                              required
                              placeholder="Ej: Andrea Gómez"
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#060812] border border-[#1f2648] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7c5dfa]"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Correo universitario o personal:</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            required
                            placeholder="andrea@universidad.edu.co"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#060812] border border-[#1f2648] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7c5dfa]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Contraseña:</label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type="password"
                            required
                            placeholder="Mínimo 6 caracteres"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#060812] border border-[#1f2648] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7c5dfa]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-bold shadow-lg shadow-[#7c5dfa]/30 transition active:scale-95 flex items-center justify-center gap-2 mt-2"
                      >
                        <span>
                          {authMode === "register" ? "Crear cuenta y continuar al pago" : "Iniciar sesión y continuar"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* STEP 2: PAYMENT METHOD (TARJETA O PSE) */}
              <div
                className={`p-6 sm:p-7 rounded-3xl bg-[#0a0d1d] border border-[#1d2345] shadow-xl space-y-6 transition-all ${
                  !user ? "opacity-40 pointer-events-none select-none filter grayscale-[30%]" : ""
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#181f3c]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#7c5dfa] text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-bold text-white text-base">Medio de Pago en Colombia</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span>Sin almacenamiento de datos sensibles</span>
                  </span>
                </div>

                {/* 2 Payment Methods Only: Tarjetas o PSE */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Tarjeta */}
                  <button
                    type="button"
                    onClick={() => setMethod("tarjeta")}
                    className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-3.5 ${
                      method === "tarjeta"
                        ? "bg-[#1f1947] border-[#818cf8] text-white shadow-xl shadow-indigo-500/25 scale-[1.02]"
                        : "bg-[#0c0f20] border-[#1f2648] text-slate-400 hover:text-white hover:bg-[#121730]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">Tarjeta Débito / Crédito</h4>
                      <p className="text-[10px] text-slate-400">Visa &bull; Mastercard &bull; Amex</p>
                    </div>
                  </button>

                  {/* PSE */}
                  <button
                    type="button"
                    onClick={() => setMethod("pse")}
                    className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-3.5 ${
                      method === "pse"
                        ? "bg-[#0f2438] border-[#38bdf8] text-white shadow-xl shadow-sky-500/25 scale-[1.02]"
                        : "bg-[#0c0f20] border-[#1f2648] text-slate-400 hover:text-white hover:bg-[#121730]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">PSE / Débito Bancario</h4>
                      <p className="text-[10px] text-slate-400">Cualquier banco de Colombia</p>
                    </div>
                  </button>
                </div>

                {/* Payment Form Fields */}
                <form onSubmit={handlePay} className="space-y-4">
                  {/* Tarjeta Fields */}
                  {method === "tarjeta" && (
                    <div className="p-5 rounded-2xl bg-[#060812] border border-[#1b213f] space-y-3.5">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Número de Tarjeta:</label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            placeholder="4000 1234 5678 9010"
                            maxLength={19}
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#7c5dfa]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Nombre del titular en la tarjeta:</label>
                        <input
                          type="text"
                          required
                          placeholder="Como aparece impreso en la tarjeta"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7c5dfa]"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Expiración:</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/AA"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#7c5dfa]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">CVV:</label>
                          <input
                            type="password"
                            required
                            placeholder="123"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#7c5dfa]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Cuotas:</label>
                          <select
                            value={cardInstallments}
                            onChange={(e) => setCardInstallments(e.target.value)}
                            className="w-full px-2.5 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                          >
                            <option value="1">1 cuota</option>
                            <option value="2">2 cuotas</option>
                            <option value="3">3 cuotas</option>
                            <option value="6">6 cuotas</option>
                            <option value="12">12 cuotas</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PSE Fields */}
                  {method === "pse" && (
                    <div className="p-5 rounded-2xl bg-[#060812] border border-[#1b213f] space-y-3.5">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Selecciona tu Banco:</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                        >
                          {COLOMBIAN_BANKS.map((b) => (
                            <option key={b} value={b} className="bg-[#090c1e] text-white">
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Tipo de Persona:</label>
                          <select
                            value={personType}
                            onChange={(e) => setPersonType(e.target.value as "natural" | "juridica")}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                          >
                            <option value="natural">Persona Natural</option>
                            <option value="juridica">Persona Jurídica</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Documento:</label>
                          <div className="flex gap-2">
                            <select
                              value={docType}
                              onChange={(e) => setDocType(e.target.value)}
                              className="w-20 px-2 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                            >
                              <option value="CC">CC</option>
                              <option value="TI">TI</option>
                              <option value="CE">CE</option>
                              <option value="NIT">NIT</option>
                            </select>
                            <input
                              type="text"
                              required
                              placeholder="Número"
                              value={docNumber}
                              onChange={(e) => setDocNumber(e.target.value)}
                              className="flex-1 px-3 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7c5dfa]"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Correo registrado en PSE:</label>
                        <input
                          type="email"
                          required
                          placeholder="correo@ejemplo.com"
                          value={pseEmail}
                          onChange={(e) => setPseEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090c1e] border border-[#1f2648] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7c5dfa]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Main Payment CTA */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing || !user}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7c5dfa] to-[#6366f1] hover:from-[#6c4ae8] hover:to-[#4f46e5] text-white font-bold text-sm tracking-wide shadow-2xl shadow-[#7c5dfa]/40 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Procesando pago seguro en pasarela bancaria...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>
                            Pagar {plan.price} con {method === "tarjeta" ? "Tarjeta" : "PSE"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>✓ Cumplimiento PCI-DSS Nivel 1</span>
                      <span>&bull;</span>
                      <span>✓ Cifrado bancario TLS 1.3</span>
                      <span>&bull;</span>
                      <span>✓ Factura electrónica con validez DIAN</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
            <div className="lg:col-span-5 sticky top-28 space-y-5">
              <div className="p-7 sm:p-8 rounded-3xl bg-[#0c0f22] border border-[#232b52] shadow-2xl space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#a78bfa] block">
                    RESUMEN DE TU PLAN
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{plan.name}</h3>
                    {plan.badge && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#7c5dfa]/20 text-[#c4b5fd] border border-[#7c5dfa]/40">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{plan.period}</p>
                </div>

                {/* Features Included List */}
                <div className="space-y-2.5 pt-4 border-t border-[#181f3c]">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">Lo que obtienes:</span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-[#181f3c] text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-white">{plan.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IVA (Exención servicios educativos):</span>
                    <span className="font-mono text-emerald-400 font-semibold">$0 COP</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#1c2448]">
                    <span className="font-bold text-sm text-white">Total a pagar:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400">{plan.price}</span>
                      <span className="text-[10px] text-slate-400 block">Pesos Colombianos</span>
                    </div>
                  </div>
                </div>

                {/* Student Guarantee Box */}
                <div className="p-4 rounded-2xl bg-[#070914] border border-[#1b2244] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Garantía de Satisfacción de 7 Días</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Si no estás 100% conforme o no te sirve para tus parciales, te reembolsamos tu dinero sin preguntas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PAYMENT SUCCESS SCREEN */
          <div className="max-w-xl mx-auto py-12 text-center space-y-7 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/25">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                ¡TRANSACCIÓN EXITOSA Y VERIFICADA!
              </span>
              <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-white">
                Bienvenido a Dalat Pro
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tu pago de <strong>{plan.price}</strong> ha sido confirmado correctamente por la pasarela bancaria.
                Tu suscripción a <strong>{plan.name}</strong> ya se encuentra activa para el usuario{" "}
                <span className="text-white font-semibold">{user?.email}</span>.
              </p>
            </div>

            {/* Official Receipt Card */}
            <div className="p-6 rounded-3xl bg-[#0c0f22] border border-[#21294e] text-left text-xs space-y-3 shadow-xl">
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-[#181f3c]">
                <span>Referencia de pago:</span>
                <span className="font-mono text-white font-bold">{transactionId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-[#181f3c]">
                <span>Método de pago:</span>
                <span className="text-white font-medium capitalize">
                  {method === "tarjeta" ? "Tarjeta Débito / Crédito" : `PSE (${selectedBank})`}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-[#181f3c]">
                <span>Titular de la cuenta:</span>
                <span className="text-white font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Estado de activación:</span>
                <span className="text-emerald-400 font-bold">Activo Inmediato ✓</span>
              </div>
            </div>

            <button
              onClick={onPaymentSuccess}
              className="px-9 py-4 rounded-2xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-bold text-sm shadow-2xl shadow-[#7c5dfa]/40 transition active:scale-95 flex items-center justify-center gap-2 mx-auto group"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Entrar a Dalat y comenzar a estudiar ahora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
