"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, HelpCircle, Coffee, Flame, Trophy, FastForward, Target, Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import confetti from "canvas-confetti";
import { studySessionService } from "@/services/studySessionService";

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
  onSessionCompleted?: () => void;
}

// Sonido suave de campana con Web Audio API
function playGentleBell(type: "break" | "focus" | "victory") {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "victory") {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.8);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "break" ? 880 : 660, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    }
  } catch {
    // Si el navegador bloquea audio sin interacción previa, ignorar silenciosamente
  }
}

// Personaje de tomatito limpio (sin saltos ni textos distractores, camina con los pies en la línea)
function CuteTomatoCharacter({ mood = "focus" }: { mood?: "focus" | "break" | "victory" }) {
  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none drop-shadow-md">
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
        {/* Tallo y hojas verdes */}
        <path d="M24 6 C24 3, 27 2, 28 1" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 7 C21 5, 17 6, 16 8 C19 8, 22 7.5, 24 7 Z" fill="#22c55e" />
        <path d="M24 7 C27 5, 31 6, 32 8 C29 8, 26 7.5, 24 7 Z" fill="#16a34a" />
        <path d="M24 7 C23 9, 24 11, 24 11" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />

        {/* Cuerpo del Tomate */}
        <ellipse cx="24" cy="26" rx="18" ry="16" fill="#ef4444" />
        {/* Brillo de luz superior */}
        <ellipse cx="18" cy="20" rx="6" ry="4" fill="#fca5a5" opacity="0.6" transform="rotate(-15 18 20)" />

        {/* Carita sonriente */}
        {mood === "break" ? (
          <>
            <path d="M17 25 Q19 23 21 25" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M27 25 Q29 23 31 25" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="19" cy="25" r="2.2" fill="#1e1e1e" />
            <circle cx="29" cy="25" r="2.2" fill="#1e1e1e" />
            <circle cx="19.6" cy="24.4" r="0.8" fill="#ffffff" />
            <circle cx="29.6" cy="24.4" r="0.8" fill="#ffffff" />
          </>
        )}

        {/* Mejillas sonrojadas */}
        <circle cx="15.5" cy="27.5" r="2.2" fill="#f87171" opacity="0.85" />
        <circle cx="32.5" cy="27.5" r="2.2" fill="#f87171" opacity="0.85" />

        {/* Boca sonriente */}
        <path d="M21 28.5 Q24 32 27 28.5" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Piernitas que tocan el suelo */}
        <path d="M19 41 Q18 45 14 45" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M29 41 Q30 45 34 45" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Zapatitos marrones */}
        <ellipse cx="14" cy="45" rx="3" ry="1.5" fill="#7f1d1d" />
        <ellipse cx="34" cy="45" rx="3" ry="1.5" fill="#7f1d1d" />
      </svg>
    </div>
  );
}

export default function PomodoroModal({ isOpen, onClose, isLightMode = false, onSessionCompleted }: PomodoroModalProps) {
  const FOCUS_TIME = 25 * 60; // 25 min en segundos
  const BREAK_TIME = 5 * 60; // 5 min en segundos

  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const confettiFiredRef = useRef<boolean>(false);

  // Temporizador regresivo en tiempo real
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handlePhaseTransition();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  // Transición de fase
  const handlePhaseTransition = () => {
    if (!isBreak) {
      // Registrar sesión de estudio completada para sumar racha diaria
      studySessionService.logSession({
        duracion_segundos: FOCUS_TIME,
        materia: "Pomodoro",
        completada: true,
        tipo: "pomodoro",
        notas: `Bloque ${currentCycle} de Pomodoro completado`,
      }).then(() => {
        onSessionCompleted?.();
      }).catch((err) => {
        console.error("Error al registrar sesión Pomodoro:", err);
      });

      if (currentCycle < 4) {
        setIsBreak(true);
        setTimeLeft(BREAK_TIME);
        setIsRunning(true);
        playGentleBell("break");
      } else {
        setIsCompleted(true);
        setIsRunning(false);
        playGentleBell("victory");
        fireVictoryConfetti();
      }
    } else {
      setIsBreak(false);
      setCurrentCycle((prev) => prev + 1);
      setTimeLeft(FOCUS_TIME);
      setIsRunning(true);
      playGentleBell("focus");
    }
  };

  const fireVictoryConfetti = () => {
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ["#ef4444", "#22c55e", "#f59e0b", "#3b82f6", "#a855f7"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.4 },
      });
      confettiFiredRef.current = false;
    }, 400);
  };

  // Progreso global de 0% a 100%
  // 0% = Inicio
  // 25% = Bandera 1
  // 50% = Bandera 2
  // 75% = Bandera 3
  // 100% = Bandera 4 (Dorada / Meta Final)
  const computeProgress = () => {
    if (isCompleted) return 100;
    const currentDuration = isBreak ? BREAK_TIME : FOCUS_TIME;
    const elapsed = currentDuration - timeLeft;
    const cycleFraction = Math.min(1, Math.max(0, elapsed / currentDuration));

    if (isBreak) {
      // Durante el descanso se queda en la bandera alcanzada
      return currentCycle * 25;
    }
    // Durante el enfoque avanza desde el inicio del ciclo (0%, 25%, 50%, 75%)
    const startPercent = (currentCycle - 1) * 25;
    return startPercent + (cycleFraction * 25);
  };

  const progressPercent = computeProgress();

  // Controladores
  const toggleTimer = () => {
    if (isCompleted) return;
    setIsRunning(!isRunning);
  };

  const resetCurrentPhase = () => {
    if (isCompleted) return;
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_TIME : FOCUS_TIME);
  };

  const resetAll = () => {
    setIsRunning(false);
    setCurrentCycle(1);
    setIsBreak(false);
    setTimeLeft(FOCUS_TIME);
    setIsCompleted(false);
  };

  // Avance rápido de 1 minuto para ver el movimiento en vivo
  const advanceOneMinute = () => {
    if (isCompleted) return;
    setTimeLeft((prev) => Math.max(0, prev - 60));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl p-5 sm:p-8 flex flex-col justify-between space-y-6 animate-in zoom-in-95 duration-200 transition-colors ${
          isLightMode
            ? "bg-[#fffdfa] border-amber-200/80 text-slate-900 shadow-amber-900/10"
            : "bg-[#0b0f1d] border-white/[0.1] text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
        }`}
      >
        {/* 1. Header: Saludo y Botón de Explicación */}
        <div className="flex items-start justify-between gap-4 border-b pb-4 border-slate-200/60 dark:border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2
                className={`text-xl sm:text-2xl font-editorial font-bold tracking-tight ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              >
                Bienvenido al Método Pomodoro
              </h2>

              {/* Botón de Explicación del Método al lado del título */}
              <button
                onClick={() => setShowExplanation(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  isLightMode
                    ? "bg-amber-100/70 hover:bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border-white/[0.12]"
                }`}
                title="Ver cómo funciona el método"
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>¿Cómo funciona?</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              4 bloques de 25 min de enfoque • 3 descansos de 5 min • Gran meta final
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLightMode
                ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
            }`}
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Banner de Estado Actual */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 text-xs font-semibold">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <>
                <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
                <span className="text-amber-600 dark:text-amber-300">
                  ¡Felicitaciones! Has completado los 4 ciclos del Pomodoro.
                </span>
              </>
            ) : isBreak ? (
              <>
                <Coffee className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-emerald-700 dark:text-emerald-300">
                  Descanso {currentCycle} de 3 • Relájate y respira (5 min)
                </span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-rose-500" />
                <span className="text-rose-700 dark:text-rose-300">
                  Ciclo {currentCycle} de 4 • Bloque de concentración máxima (25 min)
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <span>Progreso:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>

        {/* 3. PISTA VISUAL DE RECORRIDO (Línea de Meta, Banderas Alineadas y Tomatito Encima) */}
        <div
          className={`relative w-full rounded-2xl p-4 sm:p-6 overflow-hidden border ${
            isLightMode
              ? "bg-[#faf6ef] border-amber-200/70"
              : "bg-[#070a14] border-white/[0.06]"
          }`}
        >
          {/* Contenedor relativo de la pista con margen horizontal para que nada se corte */}
          <div className="relative w-full h-36 select-none px-6 sm:px-8">
            <div className="relative w-full h-full">
              {/* LÍNEA BASE (top: 80px, h: 4px) de 0% a 100% */}
              <div className="absolute left-0 right-0 top-[80px] -translate-y-1/2 h-[4px] rounded-full z-0 overflow-hidden">
                <div
                  className={`absolute inset-0 ${
                    isLightMode ? "bg-[#bda897]" : "bg-white/[0.15]"
                  }`}
                />
                {/* Línea roja de progreso (comienza en 0% exacto) */}
                <div
                  className="absolute left-0 h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* PUNTO INICIAL (Círculo al inicio exacto en 0%) */}
              <div
                className="absolute pointer-events-none z-10"
                style={{ left: "0%", top: "80px" }}
              >
                <div
                  className={`w-6 h-6 rounded-full border-3 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-110 ${
                    isLightMode
                      ? "border-[#6b3524] bg-[#f5ebe0]"
                      : "border-amber-500/70 bg-[#141b2d]"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isLightMode ? "bg-[#6b3524]" : "bg-amber-400"
                    }`}
                  />
                </div>
              </div>

              {/* BANDERA 1 (Ciclo 1: exactamente en 25%) */}
              <div
                className="absolute pointer-events-none z-10"
                style={{ left: "25%", top: "80px" }}
              >
                {/* Punto circular (remache) sobre la línea */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#78350f] bg-emerald-500 z-10 shadow-sm transition-transform group-hover:scale-125" />

                {/* Asta y Bandera CENTRADAS exactamente sobre el punto (hacia arriba) */}
                <div className="absolute bottom-[-1px] left-0 -translate-x-1/2 pointer-events-none z-10 transition-transform group-hover:-translate-y-1">
                  <svg width="32" height="38" viewBox="0 0 32 38" fill="none" className="drop-shadow">
                    {/* Asta centrada en x = 16 */}
                    <line x1="16" y1="2" x2="16" y2="38" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
                    {/* Bandera ondeando hacia la derecha desde el asta */}
                    <path
                      d="M17 4 C22 1, 26 7, 31 4 C31 13, 26 16, 17 13 Z"
                      fill={currentCycle > 1 || (currentCycle === 1 && isBreak) ? "#16a34a" : "#22c55e"}
                    />
                  </svg>
                </div>

                {/* Texto "Descanso" DEBAJO de la línea, centrado con el punto */}
                <div className="absolute top-3 left-0 -translate-x-1/2 mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap border shadow-sm z-10 bg-[#e2f0d9] text-[#276a3c] border-[#b6d7a8] dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-500/30">
                  Descanso
                </div>
              </div>

              {/* BANDERA 2 (Ciclo 2: exactamente en 50%) */}
              <div
                className="absolute pointer-events-none z-10"
                style={{ left: "50%", top: "80px" }}
              >
                {/* Punto circular (remache) sobre la línea */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#78350f] bg-emerald-500 z-10 shadow-sm transition-transform group-hover:scale-125" />

                {/* Asta y Bandera CENTRADAS exactamente sobre el punto */}
                <div className="absolute bottom-[-1px] left-0 -translate-x-1/2 pointer-events-none z-10 transition-transform group-hover:-translate-y-1">
                  <svg width="32" height="38" viewBox="0 0 32 38" fill="none" className="drop-shadow">
                    <line x1="16" y1="2" x2="16" y2="38" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
                    <path
                      d="M17 4 C22 1, 26 7, 31 4 C31 13, 26 16, 17 13 Z"
                      fill={currentCycle > 2 || (currentCycle === 2 && isBreak) ? "#16a34a" : "#22c55e"}
                    />
                  </svg>
                </div>

                {/* Texto "Descanso" DEBAJO de la línea, centrado */}
                <div className="absolute top-3 left-0 -translate-x-1/2 mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap border shadow-sm z-10 bg-[#e2f0d9] text-[#276a3c] border-[#b6d7a8] dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-500/30">
                  Descanso
                </div>
              </div>

              {/* BANDERA 3 (Ciclo 3: exactamente en 75%) */}
              <div
                className="absolute pointer-events-none z-10"
                style={{ left: "75%", top: "80px" }}
              >
                {/* Punto circular (remache) sobre la línea */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#78350f] bg-rose-500 z-10 shadow-sm transition-transform group-hover:scale-125" />

                {/* Asta y Bandera CENTRADAS exactamente sobre el punto */}
                <div className="absolute bottom-[-1px] left-0 -translate-x-1/2 pointer-events-none z-10 transition-transform group-hover:-translate-y-1">
                  <svg width="32" height="38" viewBox="0 0 32 38" fill="none" className="drop-shadow">
                    <line x1="16" y1="2" x2="16" y2="38" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
                    <path
                      d="M17 4 C22 1, 26 7, 31 4 C31 13, 26 16, 17 13 Z"
                      fill={currentCycle > 3 || (currentCycle === 3 && isBreak) ? "#dc2626" : "#f87171"}
                    />
                  </svg>
                </div>

                {/* Texto "Descanso" DEBAJO de la línea, centrado */}
                <div className="absolute top-3 left-0 -translate-x-1/2 mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap border shadow-sm z-10 bg-[#fce5cd] text-[#984c0c] border-[#f9cb9c] dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-500/30">
                  Descanso
                </div>
              </div>

              {/* BANDERA 4 GIGANTE: META FINAL (Exactamente en 100%) */}
              <div
                className="absolute pointer-events-none z-10"
                style={{ left: "100%", top: "80px" }}
              >
                {/* Remache dorado sobre la línea */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-[#b45309] bg-amber-400 z-10 shadow transition-transform group-hover:scale-125" />

                {/* Gran Bandera Dorada CENTRADA exactamente sobre el punto (hacia arriba) */}
                <div className="absolute bottom-[-1px] left-0 -translate-x-1/2 pointer-events-none z-10 transition-transform group-hover:-translate-y-1">
                  <span className="absolute -top-3 -left-3 text-amber-400 text-xs animate-ping">★</span>
                  <span className="absolute -top-4 right-1 text-amber-500 text-sm">✨</span>
                  <span className="absolute bottom-4 -left-4 text-yellow-500 text-xs">★</span>

                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className="drop-shadow-lg">
                    {/* Asta centrada en x = 26 */}
                    <line x1="26" y1="2" x2="26" y2="52" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="26" cy="4" r="3.5" fill="#f59e0b" />
                    {/* Bandera ondulada hacia la derecha desde x = 28 */}
                    <path
                      d="M28 6 C36 3, 40 10, 50 7 L45 17 L50 26 C40 23, 36 29, 28 26 Z"
                      fill="url(#goldGradient)"
                    />
                    <polygon
                      points="38,12 40,15 44,15 41,18 42,21 38,19 34,21 35,18 32,15 36,15"
                      fill="#ffffff"
                      opacity="0.95"
                    />
                    <defs>
                      <linearGradient id="goldGradient" x1="28" y1="6" x2="50" y2="26" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f59e0b" />
                        <stop offset="0.5" stopColor="#fbbf24" />
                        <stop offset="1" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* TOMATITO DESLIZÁNDOSE ENCIMA DE LA LÍNEA (Comienza en 0%) */}
              <div
                className="absolute z-20 pointer-events-none transition-all duration-300 ease-linear"
                style={{
                  left: `${progressPercent}%`,
                  top: "80px",
                  transform: "translate(-50%, -100%)",
                }}
              >
                <CuteTomatoCharacter mood={isCompleted ? "victory" : isBreak ? "break" : "focus"} />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Temporizador Central y Controles */}
        <div
          className={`p-5 rounded-2xl border text-center space-y-4 ${
            isLightMode
              ? "bg-white border-slate-200 shadow-sm"
              : "bg-[#070a14] border-white/[0.08]"
          }`}
        >
          {/* Título de fase */}
          <div className="space-y-1">
            <span
              className={`text-[11px] font-bold tracking-widest uppercase ${
                isBreak ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {isCompleted
                ? "¡SESIÓN FINALIZADA!"
                : isBreak
                ? "TIEMPO DE DESCANSO"
                : `CICLO ${currentCycle} DE 4: TIEMPO DE ENFOQUE`}
            </span>

            {/* Dígitos Grandes */}
            <div
              className={`text-5xl sm:text-6xl font-mono font-bold tracking-tight ${
                isLightMode ? "text-slate-900" : "text-white"
              }`}
            >
              {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {/* Botones de Control */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {/* Play / Pause Principal (se deshabilita al llegar a la meta final) */}
            <button
              onClick={toggleTimer}
              disabled={isCompleted}
              className={`px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                isCompleted
                  ? isLightMode
                    ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none"
                    : "bg-white/[0.05] text-slate-500 border border-white/[0.08] cursor-not-allowed shadow-none"
                  : isBreak
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 cursor-pointer shadow-lg active:scale-95"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 cursor-pointer shadow-lg active:scale-95"
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? "Pausar" : "Iniciar"}</span>
            </button>

            {/* Reiniciar ciclo actual */}
            <button
              onClick={resetCurrentPhase}
              disabled={isCompleted}
              className={`p-3 rounded-2xl border transition ${
                isCompleted
                  ? "opacity-30 cursor-not-allowed"
                  : isLightMode
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 cursor-pointer active:scale-95"
                  : "bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/[0.1] cursor-pointer active:scale-95"
              }`}
              title={isCompleted ? "Sesión finalizada" : "Reiniciar este bloque de tiempo"}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Botón rápido de prueba de avance: Avanzar 1 min para ver el desplazamiento */}
            <button
              onClick={advanceOneMinute}
              disabled={isCompleted}
              className={`px-3.5 py-3 rounded-2xl border text-xs font-medium flex items-center gap-1.5 transition ${
                isCompleted
                  ? "opacity-30 cursor-not-allowed"
                  : isLightMode
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300 cursor-pointer active:scale-95"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border-white/[0.08] cursor-pointer active:scale-95"
              }`}
              title={isCompleted ? "Sesión completada" : "Avanzar 1 minuto para ver el tomate desplazarse"}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>+1 min</span>
            </button>
          </div>

          {/* Botón para reiniciar toda la sesión cuando se completa */}
          {isCompleted && (
            <div className="pt-2 animate-in fade-in">
              <button
                onClick={resetAll}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
              >
                Empezar nueva sesión de 4 ciclos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Ventana Explicativa Ampliada, Intuitiva y Ejemplificada */}
      {showExplanation && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border p-5 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 transition-colors ${
              isLightMode
                ? "bg-[#fffdfa] border-amber-200/90 text-slate-900 shadow-amber-900/15"
                : "bg-[#0b0f1d] border-white/[0.12] text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
            }`}
          >
            {/* Header del Modal */}
            <div className="flex items-start justify-between gap-4 border-b pb-4 border-slate-200/70 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isLightMode
                      ? "bg-purple-100 text-purple-700 border-purple-200"
                      : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`text-lg sm:text-xl font-editorial font-bold tracking-tight ${
                      isLightMode ? "text-slate-900" : "text-white"
                    }`}
                  >
                    ¿Cómo funciona el Método Pomodoro?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Estudia el doble en menos tiempo manteniendo tu cerebro fresco y concentrado.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isLightMode
                    ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
                aria-label="Cerrar explicación"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Bloques Explicativos en Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Tarjeta 1 */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLightMode
                    ? "bg-white border-slate-200/90 shadow-sm"
                    : "bg-white/[0.04] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-500 font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    Paso 1: Define 1 sola tarea
                  </b>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Elige qué vas a hacer antes de empezar (ej. resolver 10 ejercicios de Cálculo). Apaga notificaciones del celular y cierra redes.
                </p>
              </div>

              {/* Tarjeta 2 */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLightMode
                    ? "bg-white border-slate-200/90 shadow-sm"
                    : "bg-white/[0.04] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-500 font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    Paso 2: 25 min de Enfoque
                  </b>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Presiona <b>Iniciar</b>. El tomatito caminará por la pista hacia la primera bandera mientras tú estudias sin distracciones hasta la campana.
                </p>
              </div>

              {/* Tarjeta 3 */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLightMode
                    ? "bg-white border-slate-200/90 shadow-sm"
                    : "bg-white/[0.04] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    Paso 3: 5 min de Descanso
                  </b>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Al llegar a la bandera verde, ponte de pie, estírate, bebe un vaso de agua o respira. No mires pantallas; tu cerebro necesita consolidar la memoria.
                </p>
              </div>

              {/* Tarjeta 4 */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLightMode
                    ? "bg-amber-50/80 border-amber-300 shadow-sm"
                    : "bg-amber-500/[0.08] border-amber-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/30 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs">
                    4
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-amber-950" : "text-amber-300"}`}>
                    Paso 4: ¡Meta Dorada!
                  </b>
                </div>
                <p className={`${isLightMode ? "text-amber-900/90" : "text-amber-200/80"} leading-relaxed`}>
                  Tras 4 bloques (100 min de estudio real), el tomate llega a la bandera dorada. ¡Te has ganado un descanso largo de 15 a 30 minutos!
                </p>
              </div>
            </div>

            {/* Ejemplo Práctico Cotidiano */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                isLightMode
                  ? "bg-purple-50/80 border-purple-200 text-purple-950"
                  : "bg-purple-500/[0.08] border-purple-500/20 text-purple-200"
              }`}
            >
              <Lightbulb className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-xs uppercase tracking-wide block">
                  Ejemplo práctico de una tarde de estudio:
                </span>
                <p className="opacity-90 leading-relaxed">
                  • <b>Bloque 1 (25 min):</b> Leer y subrayar el capítulo de Química.<br />
                  • <b>Bloque 2 (25 min):</b> Crear 8 fichas resumen de fórmulas.<br />
                  • <b>Bloque 3 (25 min):</b> Resolver 3 problemas tipo parcial.<br />
                  • <b>Bloque 4 (25 min):</b> Corregir errores y repasar los puntos débiles.<br />
                  <b>Resultado:</b> Casi 2 horas de estudio de máximo nivel sin estrés ni sensación de quemazón.
                </p>
              </div>
            </div>

            {/* Botón de cierre */}
            <button
              onClick={() => setShowExplanation(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <span>¡Entendido, a concentrarse!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
