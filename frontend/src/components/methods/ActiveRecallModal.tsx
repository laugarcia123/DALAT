"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Coffee,
  Brain,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Trophy,
  Sparkles,
  Clock,
  HelpCircle,
  Check,
  Layers,
  AlertTriangle,
  Lightbulb,
  FileText,
  ChevronRight,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ActiveRecallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  mastered?: boolean;
}

// Reproducción de sonido suave con Web Audio API
function playRecallSound(type: "bell" | "step" | "victory") {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    } else if (type === "bell") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Si el navegador bloquea audio sin interacción previa, continuar silencioso
  }
}

// Personaje mascota tipo Duolingo (Cerebrito en zapatillas para la línea de meta)
function LittleBrainRunner({ step = 1 }: { step: number }) {
  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none drop-shadow-md">
      <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
        {/* Sombra */}
        <ellipse cx="24" cy="45" rx="12" ry="2.5" fill="#000000" opacity="0.25" />

        {/* Lóbulo izquierdo */}
        <path
          d="M17 12 C11 12 8 18 8 24 C8 30 12 36 21 37 C23 37 24 35 24 32 C24 28 23 26 23 24 C23 21 24 17 22 14 C20 12 18 12 17 12 Z"
          fill="#c084fc"
        />
        {/* Lóbulo derecho */}
        <path
          d="M31 12 C37 12 40 18 40 24 C40 30 36 36 27 37 C25 37 24 35 24 32 C24 28 25 26 25 24 C25 21 24 17 26 14 C28 12 30 12 31 12 Z"
          fill="#a855f7"
        />

        {/* Circunvoluciones del cerebro */}
        <path
          d="M14 20 Q18 20 19 24 Q20 28 16 30"
          stroke="#7e22ce"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M34 20 Q30 20 29 24 Q28 28 32 30"
          stroke="#581c87"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M21 16 Q24 14 27 16"
          stroke="#581c87"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Ojos curiosos */}
        <circle cx="19" cy="24" r="2.6" fill="#1e1b4b" />
        <circle cx="29" cy="24" r="2.6" fill="#1e1b4b" />
        <circle cx="19.8" cy="23.2" r="0.9" fill="#ffffff" />
        <circle cx="29.8" cy="23.2" r="0.9" fill="#ffffff" />

        {/* Sonrisa motivada */}
        <path
          d="M21 28 Q24 31 27 28"
          stroke="#1e1b4b"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Mejillas sonrojadas */}
        <circle cx="15" cy="26.5" r="1.8" fill="#f472b6" opacity="0.8" />
        <circle cx="33" cy="26.5" r="1.8" fill="#f472b6" opacity="0.8" />

        {/* Piernitas de corredor con zapatillas */}
        <path d="M19 37 L17 43" stroke="#6b21a8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M29 37 L31 43" stroke="#6b21a8" strokeWidth="2.5" strokeLinecap="round" />
        {/* Zapatitos deportivos naranjas */}
        <ellipse cx="15.5" cy="43.5" rx="3.5" ry="1.8" fill="#f97316" />
        <ellipse cx="32.5" cy="43.5" rx="3.5" ry="1.8" fill="#f97316" />
      </svg>
    </div>
  );
}

// Pasos de la Línea de Meta estilo Duolingo
const STEPS = [
  {
    number: 1,
    title: "Leer Apuntes",
    shortTitle: "1. Lectura",
    icon: BookOpen,
    description: "Revisa tus notas con atención plena",
  },
  {
    number: 2,
    title: "Descanso Breve",
    shortTitle: "2. Descanso",
    icon: Coffee,
    description: "5 min para enfriar la memoria inmediata",
  },
  {
    number: 3,
    title: "Volcado Mental",
    shortTitle: "3. Volcado",
    icon: Brain,
    description: "Escribe todo lo que recuerdas sin mirar",
  },
  {
    number: 4,
    title: "Corregir Errores",
    shortTitle: "4. Auditoría",
    icon: CheckCircle2,
    description: "Compara con tus apuntes y detecta lagunas",
  },
  {
    number: 5,
    title: "Tarjetas Flash",
    shortTitle: "5. Tarjetas",
    icon: Layers,
    description: "Formula preguntas en tarjetas y respóndelas",
  },
];

export default function ActiveRecallModal({
  isOpen,
  onClose,
  isLightMode = false,
}: ActiveRecallModalProps) {
  // Paso actual de la línea de meta (1 a 5, o 6 si ya completó)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Paso 1: Lectura de apuntes
  const [subjectTopic, setSubjectTopic] = useState<string>("");
  const [readingSeconds, setReadingSeconds] = useState<number>(0);
  const [isReadingRunning, setIsReadingRunning] = useState<boolean>(true);

  // Paso 2: Descanso breve de 5 min (300 segundos)
  const BREAK_SECONDS = 5 * 60;
  const [breakSecondsLeft, setBreakSecondsLeft] = useState<number>(BREAK_SECONDS);
  const [isBreakRunning, setIsBreakRunning] = useState<boolean>(false);
  const [breakFinished, setBreakFinished] = useState<boolean>(false);

  // Paso 3: Volcado mental (Escribe todo lo que recuerdas)
  const [brainDumpText, setBrainDumpText] = useState<string>("");

  // Paso 4: Revisar apuntes y corregir errores
  const [missedConcepts, setMissedConcepts] = useState<string[]>([]);
  const [newMissedInput, setNewMissedInput] = useState<string>("");
  const [retentionRating, setRetentionRating] = useState<number>(75); // porcentaje percibido

  // Paso 5: Formular preguntas en tarjetas y responderlas
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: "card-1",
      question: "¿Cuál es el concepto principal que acabas de estudiar?",
      answer: "Explica con tus propias palabras la idea central aprendida.",
      mastered: false,
    },
  ]);
  const [newCardQuestion, setNewCardQuestion] = useState<string>("");
  const [newCardAnswer, setNewCardAnswer] = useState<string>("");
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  // Modal explicativo
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Efecto: Cronómetro de lectura en Paso 1
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && currentStep === 1 && isReadingRunning) {
      interval = setInterval(() => {
        setReadingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, currentStep, isReadingRunning]);

  // Efecto: Temporizador de 5 minutos en Paso 2
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && currentStep === 2 && isBreakRunning && breakSecondsLeft > 0) {
      interval = setInterval(() => {
        setBreakSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsBreakRunning(false);
            setBreakFinished(true);
            playRecallSound("bell");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, currentStep, isBreakRunning, breakSecondsLeft]);

  if (!isOpen) return null;

  // Formato mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Avanzar al siguiente paso de la meta
  const advanceToStep = (nextStep: number) => {
    playRecallSound("step");
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    setCurrentStep(nextStep);

    // Si entra al descanso, arrancar el contador automáticamente
    if (nextStep === 2 && breakSecondsLeft === BREAK_SECONDS) {
      setIsBreakRunning(true);
    }
  };

  // Agregar concepto olvidado en Paso 4
  const handleAddMissedConcept = () => {
    const val = newMissedInput.trim();
    if (!val) return;
    setMissedConcepts((prev) => [...prev, val]);
    setNewMissedInput("");
  };

  const handleRemoveMissedConcept = (index: number) => {
    setMissedConcepts((prev) => prev.filter((_, i) => i !== index));
  };

  // Generar tarjeta a partir de un concepto olvidado
  const handleTurnConceptIntoCard = (concept: string) => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}-${Math.random()}`,
      question: `¿Qué es o cómo funciona "${concept}"?`,
      answer: "Escribe la respuesta correcta basándote en tus apuntes corregidos.",
      mastered: false,
    };
    setFlashcards((prev) => [...prev, newCard]);
  };

  // Agregar tarjeta manual en Paso 5
  const handleAddCard = () => {
    const q = newCardQuestion.trim();
    const a = newCardAnswer.trim();
    if (!q || !a) return;

    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      question: q,
      answer: a,
      mastered: false,
    };
    setFlashcards((prev) => [...prev, newCard]);
    setNewCardQuestion("");
    setNewCardAnswer("");
  };

  const handleRemoveCard = (id: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== id));
    if (activeCardIndex >= flashcards.length - 1) {
      setActiveCardIndex(Math.max(0, flashcards.length - 2));
    }
    setIsCardFlipped(false);
  };

  const handleToggleMastered = (id: string) => {
    setFlashcards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mastered: !c.mastered } : c))
    );
  };

  // Finalizar sesión con victoria y confeti
  const handleFinishVictory = () => {
    playRecallSound("victory");
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (!completedSteps.includes(5)) {
      setCompletedSteps((prev) => [...prev, 5]);
    }
    setCurrentStep(6); // Pantalla de victoria final
  };

  // Reset total para estudiar otro tema
  const handleResetSession = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setSubjectTopic("");
    setReadingSeconds(0);
    setIsReadingRunning(true);
    setBreakSecondsLeft(BREAK_SECONDS);
    setIsBreakRunning(false);
    setBreakFinished(false);
    setBrainDumpText("");
    setMissedConcepts([]);
    setRetentionRating(75);
    setActiveCardIndex(0);
    setIsCardFlipped(false);
  };

  // Conteo de palabras en volcado mental
  const brainDumpWords = brainDumpText.trim()
    ? brainDumpText.trim().split(/\s+/).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-5 sm:p-7 flex flex-col space-y-5 animate-in zoom-in-95 duration-200 transition-colors ${
          isLightMode
            ? "bg-[#fffdfa] border-violet-200/80 text-slate-900 shadow-violet-950/10"
            : "bg-[#100c1e] border-violet-600/30 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
        }`}
      >
        {/* 1. CABECERA CON TÍTULO Y BOTÓN DE CIERRE */}
        <div
          className={`flex items-start justify-between gap-4 border-b pb-4 shrink-0 ${
            isLightMode ? "border-violet-200/70" : "border-white/[0.08]"
          }`}
        >
          <div className="space-y-1.5">
            <div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 border transition-all ${
                  isLightMode
                    ? "bg-violet-100 text-violet-900 border-violet-300"
                    : "bg-violet-500/10 text-violet-300 border-violet-500/25 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-violet-500" />
                <span>Ruta de Aprendizaje Profundo • Recuerdo Activo</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h2
                className={`text-xl sm:text-2xl font-editorial font-bold tracking-tight ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              >
                Método de Recuerdo Activo
              </h2>

              <button
                type="button"
                onClick={() => setShowExplanation(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  isLightMode
                    ? "bg-violet-100/70 hover:bg-violet-100 text-violet-900 border-violet-300"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border-white/[0.12]"
                }`}
                title="¿Por qué el recuerdo activo es 4x más efectivo que releer?"
              >
                <HelpCircle className="w-3.5 h-3.5 text-violet-500" />
                <span>¿Cómo funciona?</span>
              </button>
            </div>

            <p className={`text-xs sm:text-sm ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
              Testéate en lugar de releer: lee, descansa 5m, vuelca tu mente, audita errores y crea tarjetas.
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
              isLightMode
                ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
            }`}
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. LÍNEA DE META GAMIFICADA TIPO DUOLINGO / POMODORO */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-colors shrink-0 ${
            isLightMode
              ? "bg-slate-50/80 border-slate-200"
              : "bg-white/[0.02] border-white/[0.08]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isLightMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Línea de Meta de Recuerdo Activo
            </span>
            <span className="text-xs font-bold text-violet-500 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>
                {currentStep <= 5 ? `Hito ${currentStep} de 5` : "¡Meta Completada!"}
              </span>
            </span>
          </div>

          {/* Ruta de checkpoints con personaje Duolingo */}
          <div className="relative pt-8 pb-3">
            {/* Barra conectora de progreso */}
            <div
              className={`absolute top-[48px] left-6 right-6 h-2 rounded-full -translate-y-1/2 z-0 ${
                isLightMode ? "bg-slate-200" : "bg-white/[0.08]"
              }`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 transition-all duration-500"
                style={{
                  width: `${
                    currentStep === 1
                      ? "10%"
                      : currentStep === 2
                      ? "32%"
                      : currentStep === 3
                      ? "55%"
                      : currentStep === 4
                      ? "78%"
                      : "100%"
                  }`,
                }}
              />
            </div>

            {/* Checkpoints interactivos */}
            <div className="relative z-10 flex items-center justify-between">
              {STEPS.map((step) => {
                const isCurrent = currentStep === step.number;
                const isDone = completedSteps.includes(step.number);
                const IconComponent = step.icon;

                return (
                  <div key={step.number} className="flex flex-col items-center group relative">
                    {/* Mascota en el hito activo */}
                    {isCurrent && (
                      <div className="absolute -top-9 transition-all duration-300 animate-bounce">
                        <LittleBrainRunner step={step.number} />
                      </div>
                    )}

                    {/* Botón de círculo de hito */}
                    <button
                      type="button"
                      onClick={() => {
                        // Puede volver a hitos ya completados para revisar
                        if (isDone || isCurrent) {
                          setCurrentStep(step.number);
                        }
                      }}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer shadow-md border ${
                        isDone
                          ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20 scale-95"
                          : isCurrent
                          ? "bg-gradient-to-br from-violet-500 to-purple-600 border-violet-400 text-white shadow-lg shadow-violet-500/30 scale-110 ring-4 ring-violet-500/20"
                          : isLightMode
                          ? "bg-white border-slate-300 text-slate-400 hover:border-slate-400"
                          : "bg-[#181329] border-white/[0.1] text-slate-500 hover:border-white/[0.2]"
                      }`}
                      title={step.description}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </button>

                    {/* Texto del hito */}
                    <span
                      className={`text-[10px] sm:text-xs font-bold mt-2 text-center transition-colors hidden sm:block ${
                        isCurrent
                          ? "text-violet-500 font-extrabold"
                          : isDone
                          ? isLightMode
                            ? "text-emerald-700"
                            : "text-emerald-400"
                          : isLightMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {step.shortTitle}
                    </span>
                  </div>
                );
              })}

              {/* Banderín de Meta Final */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-md border ${
                    currentStep === 6
                      ? "bg-gradient-to-br from-orange-500 to-amber-500 border-amber-300 text-white shadow-orange-500/30 scale-110 ring-4 ring-orange-500/20"
                      : isLightMode
                      ? "bg-slate-100 border-slate-300 text-slate-400"
                      : "bg-[#181329] border-white/[0.1] text-slate-500"
                  }`}
                  title="Meta final de retención"
                >
                  <Trophy className="w-5 h-5 text-amber-300" />
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold mt-2 hidden sm:block ${
                    currentStep === 6 ? "text-amber-500" : "text-slate-400"
                  }`}
                >
                  🏁 Meta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CONTENIDO PRINCIPAL SEGÚN EL HITO ACTIVO */}
        <div className="min-h-[380px]">
          {/* HITO 1: INICIAR SESIÓN DE LEER APUNTES */}
          {currentStep === 1 && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
                isLightMode
                  ? "bg-white border-violet-200/80 shadow-violet-950/5"
                  : "bg-white/[0.02] border-white/[0.08]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3
                      className={`text-lg sm:text-xl font-bold tracking-tight ${
                        isLightMode ? "text-slate-900" : "text-white"
                      }`}
                    >
                      Iniciar sesión de lectura de apuntes
                    </h3>
                  </div>
                  <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-300"}`}>
                    Lee tus notas con atención consciente. No intentes memorizar mecánicamente; comprende la idea principal.
                  </p>
                </div>

                {/* Contador de lectura en vivo */}
                <div
                  className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 self-start sm:self-auto ${
                    isLightMode
                      ? "bg-violet-50 border-violet-200 text-violet-900"
                      : "bg-violet-950/40 border-violet-500/30 text-violet-300"
                  }`}
                >
                  <Clock className="w-4 h-4 text-violet-500" />
                  <span className="font-mono text-base font-extrabold">
                    {formatTime(readingSeconds)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsReadingRunning(!isReadingRunning)}
                    className="p-1 rounded-lg hover:bg-violet-500/20 transition cursor-pointer"
                    title={isReadingRunning ? "Pausar cronómetro" : "Reanudar cronómetro"}
                  >
                    {isReadingRunning ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tema o materia a estudiar */}
              <div className="space-y-2">
                <label
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    isLightMode ? "text-slate-700" : "text-slate-200"
                  }`}
                >
                  ¿Qué tema estás estudiando hoy? (Opcional):
                </label>
                <input
                  type="text"
                  value={subjectTopic}
                  onChange={(e) => setSubjectTopic(e.target.value)}
                  placeholder="Ej: Fisiología Renal, Ley de Ampère, Estructuras de Datos..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                    isLightMode
                      ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      : "bg-[#0b0816] border-white/[0.1] text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  }`}
                />
              </div>

              {/* Caja de instrucciones de lectura activa */}
              <div
                className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  isLightMode
                    ? "bg-slate-50 border-slate-200 text-slate-700"
                    : "bg-white/[0.03] border-white/[0.08] text-slate-300"
                }`}
              >
                <b className={`font-bold block ${isLightMode ? "text-slate-900" : "text-white"}`}>
                  💡 Instrucciones de este primer paso:
                </b>
                <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
                  <li>Abre tus apuntes, libro o diapositivas.</li>
                  <li>Léelos a tu ritmo hasta que sientas que comprendes los conceptos clave.</li>
                  <li>
                    Cuando termines de leer, haz clic en el botón de abajo para avanzar al descanso breve.
                  </li>
                </ul>
              </div>

              {/* Botón de acción: Terminé mi repaso */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => advanceToStep(2)}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Terminé mi repaso</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* HITO 2: 5 MIN CON UN CONTADOR PARA UN DESCANSO BREVE */}
          {currentStep === 2 && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm text-center ${
                isLightMode
                  ? "bg-white border-violet-200/80 shadow-violet-950/5"
                  : "bg-white/[0.02] border-white/[0.08]"
              }`}
            >
              <div className="max-w-xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Descanso Breve de 5 Minutos</span>
                </div>
                <h3
                  className={`text-xl sm:text-2xl font-bold tracking-tight ${
                    isLightMode ? "text-slate-900" : "text-white"
                  }`}
                >
                  {breakFinished
                    ? "¡Tiempo cumplido! Tu memoria inmediata se disipó"
                    : "Aléjate de tus apuntes durante 5 minutos"}
                </h3>
                <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-300"}`}>
                  Este descanso de 5 min es el secreto neurocientífico: al dejar que se enfríe la memoria de corto plazo, obligarás a tu cerebro a reconstruir de verdad los recuerdos en el siguiente paso.
                </p>
              </div>

              {/* Display gigante del contador de 5 minutos */}
              <div className="py-4 flex flex-col items-center justify-center">
                <div
                  className={`font-mono text-6xl sm:text-7xl font-black tracking-tight select-none ${
                    breakFinished
                      ? "text-emerald-500"
                      : isBreakRunning
                      ? "text-orange-500 animate-pulse"
                      : isLightMode
                      ? "text-slate-800"
                      : "text-white"
                  }`}
                >
                  {formatTime(breakSecondsLeft)}
                </div>
                <p className={`text-xs mt-2 ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                  {breakFinished
                    ? "✓ Descanso completado. Ahora viene el esfuerzo real."
                    : isBreakRunning
                    ? "Respira, toma agua o camina • No mires las notas"
                    : "Pausa en el descanso"}
                </p>
              </div>

              {/* Controles del descanso */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {!breakFinished && (
                  <button
                    type="button"
                    onClick={() => setIsBreakRunning(!isBreakRunning)}
                    className="px-5 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition cursor-pointer"
                  >
                    {isBreakRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pausar descanso</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-emerald-500" />
                        <span>Reanudar descanso</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => advanceToStep(3)}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 cursor-pointer active:scale-95 transition-all"
                >
                  <span>
                    {breakFinished
                      ? "Continuar a Volcado Mental"
                      : "Saltar descanso y empezar a escribir"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* HITO 3: ESCRIBE TODO LO QUE RECUERDAS (VOLCADO MENTAL) */}
          {currentStep === 3 && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
                isLightMode
                  ? "bg-white border-violet-200/80 shadow-violet-950/5"
                  : "bg-white/[0.02] border-white/[0.08]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3
                      className={`text-lg sm:text-xl font-bold tracking-tight ${
                        isLightMode ? "text-slate-900" : "text-white"
                      }`}
                    >
                      Escribe todo lo que recuerdas
                    </h3>
                  </div>
                  <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-300"}`}>
                    ¡Mantén los apuntes cerrados! Vuelca aquí conceptos, definiciones, fórmulas, listas o diagramas tal como los recuerdes.
                  </p>
                </div>

                <div
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-2 self-start sm:self-auto ${
                    isLightMode
                      ? "bg-slate-100 border-slate-200 text-slate-700"
                      : "bg-white/[0.04] border-white/[0.08] text-slate-300"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-violet-500" />
                  <span>{brainDumpWords} palabras escritas</span>
                </div>
              </div>

              {/* Área de texto de volcado mental */}
              <div className="space-y-2">
                <textarea
                  rows={8}
                  value={brainDumpText}
                  onChange={(e) => setBrainDumpText(e.target.value)}
                  placeholder="Comienza a escribir aquí sin juzgar ni preocuparte por la ortografía...&#10;• Idea 1: ...&#10;• Concepto clave: ...&#10;• Fórmulas o ejemplos que recuerdo: ..."
                  className={`w-full p-4 rounded-2xl border text-sm leading-relaxed outline-none transition font-sans ${
                    isLightMode
                      ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      : "bg-[#0b0816] border-white/[0.1] text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  }`}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setBrainDumpText((prev) => (prev ? prev + "\n• " : "• "))
                      }
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                        isLightMode
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                          : "bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/[0.1]"
                      }`}
                    >
                      + Insertar viñeta (•)
                    </button>
                  </div>
                  <span className={`text-[11px] ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                    No te preocupes por el orden: lo importante es forzar a la mente a recuperar.
                  </span>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => advanceToStep(2)}
                  className={`text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer ${
                    isLightMode ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  ← Volver al descanso
                </button>

                <button
                  type="button"
                  onClick={() => advanceToStep(4)}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Terminé de escribir, revisar con mis apuntes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* HITO 4: REVISAR APUNTES Y CORREGIR ERRORES */}
          {currentStep === 4 && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
                isLightMode
                  ? "bg-white border-violet-200/80 shadow-violet-950/5"
                  : "bg-white/[0.02] border-white/[0.08]"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 font-black text-xs flex items-center justify-center">
                    4
                  </span>
                  <h3
                    className={`text-lg sm:text-xl font-bold tracking-tight ${
                      isLightMode ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Revisar apuntes y corregir errores
                  </h3>
                </div>
                <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-300"}`}>
                  Abre ahora tus notas originales. Compara lo que escribiste en el volcado mental con la realidad y registra qué olvidaste o en qué te equivocaste.
                </p>
              </div>

              {/* Grid 2 columnas: Tu volcado a la izquierda vs Auditoría a la derecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Columna Izquierda: Lo que escribiste */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 flex flex-col justify-between ${
                    isLightMode
                      ? "bg-slate-50 border-slate-200"
                      : "bg-[#0c0919] border-white/[0.08]"
                  }`}
                >
                  <div className="space-y-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block ${
                        isLightMode ? "text-slate-700" : "text-slate-300"
                      }`}
                    >
                      Lo que tu cerebro recordó:
                    </span>
                    <div
                      className={`p-3 rounded-xl border text-xs max-h-56 overflow-y-auto whitespace-pre-wrap ${
                        isLightMode
                          ? "bg-white border-slate-200 text-slate-800"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-200"
                      }`}
                    >
                      {brainDumpText || "(No escribiste nada en el volcado)"}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 pt-1">
                    Compara cada línea con tus apuntes originales.
                  </span>
                </div>

                {/* Columna Derecha: Auditoría de lagunas y conceptos olvidados */}
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isLightMode
                      ? "bg-violet-50/70 border-violet-200"
                      : "bg-violet-950/20 border-violet-500/20"
                  }`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block text-violet-500`}
                  >
                    Registrar conceptos que olvidaste o corregiste:
                  </span>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMissedInput}
                      onChange={(e) => setNewMissedInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMissedConcept();
                        }
                      }}
                      placeholder="Ej: Olvidé la fórmula X, confundí el concepto Y..."
                      className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none transition ${
                        isLightMode
                          ? "bg-white border-slate-300 text-slate-900 focus:border-violet-500"
                          : "bg-[#0b0816] border-white/[0.1] text-white focus:border-violet-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddMissedConcept}
                      className="px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs transition cursor-pointer"
                    >
                      + Añadir
                    </button>
                  </div>

                  {/* Lista de lagunas detectadas */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {missedConcepts.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2">
                        No has registrado lagunas aún. Anota aquí lo que tus notas tenían pero tú no recordaste.
                      </p>
                    ) : (
                      missedConcepts.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                            isLightMode
                              ? "bg-white border-rose-200 text-rose-950"
                              : "bg-rose-950/30 border-rose-500/30 text-rose-200"
                          }`}
                        >
                          <span className="flex-1 text-[11px] leading-tight">
                            • {item}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleTurnConceptIntoCard(item)}
                              className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 cursor-pointer"
                              title="Crear tarjeta flashcard de esta laguna"
                            >
                              + Crear Tarjeta
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveMissedConcept(idx)}
                              className="text-slate-400 hover:text-red-500 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de acción: Formular preguntas en tarjetas */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => advanceToStep(3)}
                  className={`text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer ${
                    isLightMode ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  ← Editar mi volcado
                </button>

                <button
                  type="button"
                  onClick={() => advanceToStep(5)}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Formular preguntas en tarjetas y responderlas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* HITO 5: FORMULAR PREGUNTAS EN TARJETAS Y RESPONDERLAS (FLASHCARDS) */}
          {currentStep === 5 && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
                isLightMode
                  ? "bg-white border-violet-200/80 shadow-violet-950/5"
                  : "bg-white/[0.02] border-white/[0.08]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 font-black text-xs flex items-center justify-center">
                      5
                    </span>
                    <h3
                      className={`text-lg sm:text-xl font-bold tracking-tight ${
                        isLightMode ? "text-slate-900" : "text-white"
                      }`}
                    >
                      Formular preguntas en tarjetas y responderlas
                    </h3>
                  </div>
                  <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-300"}`}>
                    Crea tus flashcards de autoevaluación: una pregunta clave por el frente y la respuesta por detrás. Haz clic en la tarjeta para voltearla.
                  </p>
                </div>

                <div
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-2 self-start sm:self-auto ${
                    isLightMode
                      ? "bg-violet-50 border-violet-200 text-violet-900"
                      : "bg-violet-950/40 border-violet-500/30 text-violet-300"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-violet-500" />
                  <span>
                    {flashcards.filter((c) => c.mastered).length} de {flashcards.length} dominadas
                  </span>
                </div>
              </div>

              {/* Formulario rápido para añadir tarjetas */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isLightMode ? "bg-slate-50 border-slate-200" : "bg-white/[0.03] border-white/[0.08]"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider block text-violet-500">
                  + Crear nueva tarjeta de autoevaluación:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newCardQuestion}
                    onChange={(e) => setNewCardQuestion(e.target.value)}
                    placeholder="Pregunta en el frente: Ej: ¿Cuál es la función de la mitocondria?"
                    className={`px-3 py-2 rounded-xl border text-xs outline-none transition ${
                      isLightMode
                        ? "bg-white border-slate-300 text-slate-900 focus:border-violet-500"
                        : "bg-[#0b0816] border-white/[0.1] text-white focus:border-violet-500"
                    }`}
                  />
                  <input
                    type="text"
                    value={newCardAnswer}
                    onChange={(e) => setNewCardAnswer(e.target.value)}
                    placeholder="Respuesta al reverso: Ej: Generar energía celular en forma de ATP."
                    className={`px-3 py-2 rounded-xl border text-xs outline-none transition ${
                      isLightMode
                        ? "bg-white border-slate-300 text-slate-900 focus:border-violet-500"
                        : "bg-[#0b0816] border-white/[0.1] text-white focus:border-violet-500"
                    }`}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddCard}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Guardar Tarjeta</span>
                  </button>
                </div>
              </div>

              {/* VISUALIZADOR INTERACTIVO DE FLASHCARD CON GIRO 3D */}
              {flashcards.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold px-1">
                    <span>
                      Tarjeta {activeCardIndex + 1} de {flashcards.length}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (Haz clic sobre la tarjeta para darle la vuelta)
                    </span>
                  </div>

                  {(() => {
                    const currentCard = flashcards[activeCardIndex] || flashcards[0];
                    return (
                      <div
                        onClick={() => setIsCardFlipped(!isCardFlipped)}
                        className={`min-h-[180px] p-6 rounded-3xl border transition-all cursor-pointer select-none flex flex-col justify-between shadow-lg relative group ${
                          isCardFlipped
                            ? isLightMode
                              ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950"
                              : "bg-gradient-to-br from-[#0a2318] to-[#04140e] border-emerald-500/40 text-emerald-200"
                            : isLightMode
                            ? "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-300 text-violet-950"
                            : "bg-gradient-to-br from-[#1a1233] to-[#0d071d] border-violet-500/40 text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              isCardFlipped
                                ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                                : "bg-violet-500/20 text-violet-400 border-violet-500/30"
                            }`}
                          >
                            {isCardFlipped ? "Reverso (Respuesta)" : "Frente (Pregunta)"}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCard(currentCard.id);
                            }}
                            className="text-slate-400 hover:text-red-500 transition p-1"
                            title="Eliminar tarjeta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="py-4 text-center">
                          <p className="text-base sm:text-lg font-bold leading-snug">
                            {isCardFlipped ? currentCard.answer : currentCard.question}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                          <span className="text-[10px] opacity-75">
                            {isCardFlipped
                              ? "✓ Comprueba si respondiste bien antes de voltear"
                              : "Piensa tu respuesta mentalmente y luego voltea"}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMastered(currentCard.id);
                            }}
                            className={`text-[11px] font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 border ${
                              currentCard.mastered
                                ? "bg-emerald-500 text-white border-emerald-600"
                                : isLightMode
                                ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                                : "bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border-white/[0.1]"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{currentCard.mastered ? "¡Dominada!" : "Marcar como Dominada"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navegación entre tarjetas */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={activeCardIndex === 0}
                      onClick={() => {
                        setActiveCardIndex((prev) => Math.max(0, prev - 1));
                        setIsCardFlipped(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border disabled:opacity-40 transition cursor-pointer"
                    >
                      ← Tarjeta Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {flashcards.map((c, idx) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setActiveCardIndex(idx);
                            setIsCardFlipped(false);
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            idx === activeCardIndex
                              ? "bg-violet-500 scale-125"
                              : c.mastered
                              ? "bg-emerald-500"
                              : "bg-slate-400 opacity-40"
                          }`}
                          title={`Tarjeta ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={activeCardIndex >= flashcards.length - 1}
                      onClick={() => {
                        setActiveCardIndex((prev) =>
                          Math.min(flashcards.length - 1, prev + 1)
                        );
                        setIsCardFlipped(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border disabled:opacity-40 transition cursor-pointer"
                    >
                      Siguiente Tarjeta →
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de Victoria y Finalización de la Ruta */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => advanceToStep(4)}
                  className={`text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer ${
                    isLightMode ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  ← Volver a auditoría
                </button>

                <button
                  type="button"
                  onClick={handleFinishVictory}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 cursor-pointer active:scale-95 transition-all"
                >
                  <Trophy className="w-4 h-4 text-amber-200" />
                  <span>¡Cruzar la Meta y Finalizar Sesión!</span>
                </button>
              </div>
            </div>
          )}

          {/* HITO 6: PANTALLA DE VICTORIA FINAL Y RESUMEN */}
          {currentStep === 6 && (
            <div
              className={`p-8 sm:p-10 rounded-3xl border space-y-6 shadow-xl text-center ${
                isLightMode
                  ? "bg-gradient-to-b from-white to-violet-50/50 border-violet-200"
                  : "bg-gradient-to-b from-[#170e28] to-[#0e071a] border-violet-500/40"
              }`}
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30 animate-bounce">
                  <Trophy className="w-8 h-8 text-black" />
                </div>

                <h3
                  className={`text-2xl sm:text-3xl font-editorial font-bold tracking-tight ${
                    isLightMode ? "text-slate-900" : "text-white"
                  }`}
                >
                  ¡Meta Completada!
                </h3>
                <p className={`text-xs sm:text-sm ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
                  Has completado el ciclo neurocientífico de <b>Recuerdo Activo</b>. Al forzar a tu cerebro a recuperar información, has creado conexiones neuronales indestructibles para tu examen.
                </p>
              </div>

              {/* Estadísticas de la sesión */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                <div
                  className={`p-3.5 rounded-2xl border text-center ${
                    isLightMode
                      ? "bg-white border-slate-200"
                      : "bg-white/[0.04] border-white/[0.08]"
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Tiempo Lectura
                  </span>
                  <b className="text-base font-mono font-black text-violet-500">
                    {formatTime(readingSeconds)}
                  </b>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-center ${
                    isLightMode
                      ? "bg-white border-slate-200"
                      : "bg-white/[0.04] border-white/[0.08]"
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Descanso
                  </span>
                  <b className="text-base font-mono font-black text-amber-500">
                    5:00 min
                  </b>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-center ${
                    isLightMode
                      ? "bg-white border-slate-200"
                      : "bg-white/[0.04] border-white/[0.08]"
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Tarjetas Flash
                  </span>
                  <b className="text-base font-mono font-black text-orange-500">
                    {flashcards.length}
                  </b>
                </div>
              </div>

              {/* Botón para nueva sesión o cerrar */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleResetSession}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    isLightMode
                      ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                      : "bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border-white/[0.1]"
                  }`}
                >
                  Estudiar otro tema desde cero
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 cursor-pointer transition active:scale-95"
                >
                  Cerrar y volver a Métodos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL EXPLICATIVO "¿CÓMO FUNCIONA EL RECUERDO ACTIVO?" */}
      {showExplanation && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 ${
              isLightMode
                ? "bg-[#fffdfa] border-violet-300 text-slate-900"
                : "bg-[#140e24] border-violet-600/50 text-white"
            }`}
          >
            <div
              className={`flex items-start justify-between gap-4 border-b pb-4 ${
                isLightMode ? "border-violet-200" : "border-violet-500/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500 text-white flex items-center justify-center font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold tracking-tight">
                    ¿Por qué funciona el Recuerdo Activo?
                  </h3>
                  <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-violet-200/80"}`}>
                    La diferencia entre reconocer y dominar de verdad.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className={`p-1.5 rounded-lg transition ${
                  isLightMode
                    ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isLightMode ? "text-slate-700" : "text-slate-200"
                }`}
              >
                Releer tus apuntes crea una <b>falsa ilusión de aprendizaje</b>: crees que lo sabes porque lo ves enfrente, pero en el examen te bloqueas.
              </p>

              {/* 3 claves breves */}
              <div className="space-y-2 text-xs">
                <div
                  className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                    isLightMode
                      ? "bg-violet-50 border-violet-200 text-violet-950"
                      : "bg-violet-500/10 border-violet-500/25 text-violet-200"
                  }`}
                >
                  <span className="font-bold text-violet-500">1.</span>
                  <p className="text-[11px] leading-relaxed">
                    <b>Forzar a la mente a recordar:</b> Cerrar las notas y escribir desde cero construye conexiones neuronales 400% más sólidas.
                  </p>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                    isLightMode
                      ? "bg-amber-50 border-amber-200 text-amber-950"
                      : "bg-amber-500/10 border-amber-500/25 text-amber-200"
                  }`}
                >
                  <span className="font-bold text-amber-500">2.</span>
                  <p className="text-[11px] leading-relaxed">
                    <b>Los 5 min de descanso:</b> Enfrían la memoria de trabajo inmediata para no hacer trampa y medir tu retención real.
                  </p>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                    isLightMode
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : "bg-emerald-500/10 border-emerald-500/25 text-emerald-200"
                  }`}
                >
                  <span className="font-bold text-emerald-500">3.</span>
                  <p className="text-[11px] leading-relaxed">
                    <b>Flashcards inmediatas:</b> Conviertes cada error en una pregunta y respuesta para repasar justo antes del examen.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowExplanation(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md shadow-orange-500/25"
            >
              ¡Entendido, a practicar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
