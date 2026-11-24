"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, X, Play, Pause, RotateCcw, Clock, Sparkles } from "lucide-react";
import PomodoroModal from "@/components/methods/PomodoroModal";
import FeynmanModal from "@/components/methods/FeynmanModal";
import CornellModal from "@/components/methods/CornellModal";
import PsicopataModal, { TacticalKnifeIcon, BloodDripSvg } from "@/components/methods/PsicopataModal";
import SpacedRepetitionModal from "@/components/methods/SpacedRepetitionModal";
import ActiveRecallModal from "@/components/methods/ActiveRecallModal";
import { Flame } from "lucide-react";

interface MethodCard {
  id: string;
  time?: string;
  title: string;
  subtitle: string;
  subtitleColorDark: string;
  subtitleColorLight: string;
  description: string;
  focus: string;
  linkColorDark: string;
  linkColorLight: string;
  bgDark: string;
  bgLight: string;
  borderDark: string;
  borderLight: string;
  timeColorDark: string;
  timeColorLight: string;
}

const METHODS: MethodCard[] = [
  {
    id: "pomodoro",
    time: "25 min",
    title: "Pomodoro",
    subtitle: "Estudia por bloques de tiempo",
    subtitleColorDark: "text-indigo-300",
    subtitleColorLight: "text-indigo-600",
    description:
      "Divide tu sesión en bloques de 25 minutos de enfoque total seguidos de 5 minutos de descanso. Recomendado para tareas largas, proyectos y evitar la fatiga mental.",
    focus:
      "Enfocado en tareas largas, proyectos, lecturas extensas y trabajos escritos. Ideal si te cuesta concentrarte, procrastinas o sientes fatiga mental tras varias horas de estudio.",
    linkColorDark: "text-indigo-400 hover:text-indigo-300",
    linkColorLight: "text-indigo-600 hover:text-indigo-700",
    bgDark: "bg-[#0d1022]",
    bgLight: "bg-white hover:bg-slate-50/80 shadow-sm hover:shadow-md",
    borderDark: "border-[#1e2348] hover:border-indigo-500/40",
    borderLight: "border-slate-200 hover:border-indigo-300",
    timeColorDark: "text-indigo-400 bg-indigo-950/50 border-indigo-800/40",
    timeColorLight: "text-indigo-700 bg-indigo-50 border-indigo-200",
  },
  {
    id: "feynman",
    time: "Audio IA",
    title: "Técnica Feynman",
    subtitle: "Auditoría de voz con base en tus archivos",
    subtitleColorDark: "text-rose-300",
    subtitleColorLight: "text-rose-600",
    description:
      "Graba un audio explicando el tema con base en los archivos que subiste a Recursos IA. La IA escuchará toda tu exposición, detectará afirmaciones erróneas, descontará calificación y te mostrará correcciones detalladas.",
    focus:
      "Enfocado en comprender a fondo conceptos complejos y prepararte para exposiciones, sustentaciones y exámenes orales. Ideal para detectar los vacíos en lo que crees que ya sabes.",
    linkColorDark: "text-rose-400 hover:text-rose-300",
    linkColorLight: "text-rose-600 hover:text-rose-700",
    bgDark: "bg-[#180e1b]",
    bgLight: "bg-white hover:bg-slate-50/80 shadow-sm hover:shadow-md",
    borderDark: "border-[#381a38] hover:border-rose-500/40",
    borderLight: "border-slate-200 hover:border-rose-300",
    timeColorDark: "text-rose-400 bg-rose-950/50 border-rose-800/40",
    timeColorLight: "text-rose-700 bg-rose-50 border-rose-200",
  },
  {
    id: "cornell",
    time: "4 Diseños PDF",
    title: "Método Cornell",
    subtitle: "Plantillas descargables e imprimibles",
    subtitleColorDark: "text-emerald-300",
    subtitleColorLight: "text-emerald-600",
    description:
      "Divide tus apuntes en tres zonas estratégicas: notas a la derecha, ideas/preguntas a la izquierda y resumen abajo. Elige entre 4 diseños en PDF listos para imprimir o rellenar en digital.",
    focus:
      "Enfocado en tomar apuntes organizados en clases, conferencias y lecturas. Ideal para materias teóricas con mucho contenido que necesitas repasar rápido antes del parcial.",
    linkColorDark: "text-emerald-400 hover:text-emerald-300",
    linkColorLight: "text-emerald-600 hover:text-emerald-700",
    bgDark: "bg-[#091719]",
    bgLight: "bg-white hover:bg-slate-50/80 shadow-sm hover:shadow-md",
    borderDark: "border-[#123637] hover:border-emerald-500/40",
    borderLight: "border-slate-200 hover:border-emerald-300",
    timeColorDark: "text-emerald-400 bg-emerald-950/50 border-emerald-800/40",
    timeColorLight: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: "spaced_repetition",
    time: "60-75 min",
    title: "Repetición Espaciada",
    subtitle: "1h base el Día 1 y 75 min los demás días",
    subtitleColorDark: "text-amber-300",
    subtitleColorLight: "text-amber-600",
    description:
      "Distribuye tu estudio en bloques antes del examen o quizz. Estudias 1 hora base el Día 1 y en todos los demás días dedicas 75 min (1 hora de estudio nuevo + 15 min de repaso) para no olvidar nada.",
    focus:
      "Enfocado en preparar exámenes y quizzes con varios días de anticipación. Ideal para retener información a largo plazo en materias acumulativas y evitar estudiar todo la noche anterior.",
    linkColorDark: "text-amber-400 hover:text-amber-300",
    linkColorLight: "text-amber-600 hover:text-amber-700",
    bgDark: "bg-[#18140c]",
    bgLight: "bg-white hover:bg-slate-50/80 shadow-sm hover:shadow-md",
    borderDark: "border-[#362914] hover:border-amber-500/40",
    borderLight: "border-slate-200 hover:border-amber-300",
    timeColorDark: "text-amber-400 bg-amber-950/50 border-amber-800/40",
    timeColorLight: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    id: "recuerdo_activo",
    title: "Método de Recuerdo Activo",
    subtitle: "Testéate en lugar de releer",
    subtitleColorDark: "text-violet-300",
    subtitleColorLight: "text-violet-600",
    description:
      "Releer da falsa sensación de aprendizaje. Cerrar el libro y forzar a tu mente a recordar y estructurar activamente lo que estudiaste genera conexiones neuronales duraderas.",
    focus:
      "Enfocado en fijar definiciones, fechas, procesos y conceptos clave en la memoria. Ideal para repasar antes de un examen y comprobar qué tanto dominas realmente un tema.",
    linkColorDark: "text-violet-400 hover:text-violet-300",
    linkColorLight: "text-violet-600 hover:text-violet-700",
    bgDark: "bg-[#120f24]",
    bgLight: "bg-white hover:bg-slate-50/80 shadow-sm hover:shadow-md",
    borderDark: "border-[#261f4d] hover:border-violet-500/40",
    borderLight: "border-slate-200 hover:border-violet-300",
    timeColorDark: "text-violet-400 bg-violet-950/50 border-violet-800/40",
    timeColorLight: "text-violet-700 bg-violet-50 border-violet-200",
  },
  {
    id: "metodo_psicopata",
    title: "Método Psicópata",
    subtitle: "Enfoque implacable hasta el límite cognitivo",
    subtitleColorDark: "text-red-400 font-bold",
    subtitleColorLight: "text-red-700 font-bold",
    description:
      "Sesión de hiperconcentración ininterrumpida sin descansos predefinidos. Trabajas con enfoque absoluto y cero distracciones hasta que tu energía mental llegue a su límite natural.",
    focus:
      "Enfocado en la memorización intensiva de conceptos teóricos, definiciones, medicina, derecho e historia. Ideal para la recta final antes de un parcial. No recomendado para matemáticas ni física.",
    linkColorDark: "text-red-400 hover:text-red-300 font-bold",
    linkColorLight: "text-red-700 hover:text-red-800 font-bold",
    bgDark: "bg-gradient-to-br from-[#1c080b] via-[#120406] to-[#090203]",
    bgLight: "bg-gradient-to-br from-rose-50/80 via-white to-red-50/50 shadow-sm hover:shadow-lg hover:shadow-red-500/15",
    borderDark: "border-red-600/50 hover:border-red-500 hover:shadow-[0_0_35px_-5px_rgba(220,38,38,0.4)] ring-1 ring-red-500/20",
    borderLight: "border-red-300 hover:border-red-500 ring-1 ring-red-500/20",
    timeColorDark: "text-red-300 bg-red-950/80 border-red-700/60 shadow-sm shadow-red-950/50",
    timeColorLight: "text-red-800 bg-red-100 border-red-300",
  },
];

interface MethodsTabProps {
  isLightMode?: boolean;
  isPro?: boolean;
  onGoToCheckout?: () => void;
  tokensBalance?: number;
  onDeductTokens?: (amount: number) => Promise<number> | void;
  onSessionCompleted?: () => void;
}

export default function MethodsTab({
  isLightMode = false,
  isPro = false,
  onGoToCheckout,
  tokensBalance = 0,
  onDeductTokens,
  onSessionCompleted,
}: MethodsTabProps) {
  // Detección reactiva y robusta de modo claro (prop, clase .theme-light en DOM o localStorage)
  const [domIsLight, setDomIsLight] = useState<boolean>(() => {
    if (typeof window === "undefined") return Boolean(isLightMode);
    return (
      Boolean(isLightMode) ||
      document.documentElement.classList.contains("theme-light") ||
      document.body.classList.contains("theme-light") ||
      document.querySelector(".theme-light") !== null ||
      localStorage.getItem("dalat_theme") === "light"
    );
  });

  useEffect(() => {
    const updateTheme = () => {
      const isL =
        Boolean(isLightMode) ||
        document.documentElement.classList.contains("theme-light") ||
        document.body.classList.contains("theme-light") ||
        document.querySelector(".theme-light") !== null ||
        localStorage.getItem("dalat_theme") === "light";
      setDomIsLight(isL);
    };

    updateTheme();

    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(updateTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    }
  }, [isLightMode]);

  const [selectedMethod, setSelectedMethod] = useState<MethodCard | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  // Contador de temporizador activo
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (secondsLeft === 0) {
      setTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, secondsLeft]);

  const openMethod = (method: MethodCard) => {
    setSelectedMethod(method);
    const mins = method.time ? parseInt(method.time) : 25;
    setSecondsLeft(mins * 60);
    setTimerActive(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="space-y-1">
        <h2
          className={`text-3xl sm:text-4xl font-editorial font-bold tracking-tight transition-colors duration-200 ${
            domIsLight ? "text-slate-900" : "text-white"
          }`}
        >
          Métodos de estudio
        </h2>
        <p
          className={`text-sm transition-colors duration-200 ${
            domIsLight ? "text-slate-600 font-medium" : "text-slate-400"
          }`}
        >
          Elige una técnica y haz clic para explorarla con pasos y temporizador.
        </p>
      </div>

      {/* 3x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {METHODS.map((method) => {
          const isPsicopata = method.id === "metodo_psicopata";

          return (
            <div
              key={method.id}
              className={`rounded-2xl p-6 border transition-all duration-300 group relative flex flex-col justify-between ${
                isPsicopata ? "overflow-visible ring-1 ring-red-500/20" : "overflow-hidden"
              } ${
                domIsLight
                  ? `${method.bgLight} ${method.borderLight}`
                  : `${method.bgDark} ${method.borderDark}`
              }`}
            >
              {/* Elemento característico UI/UX: Cuchillo fijado en el borde derecho para el Método Psicópata */}
              {isPsicopata && (
                <div className="absolute -right-3.5 sm:-right-4 top-3 sm:top-5 w-12 sm:w-14 h-28 sm:h-32 pointer-events-none select-none opacity-85 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 drop-shadow-[0_0_18px_rgba(239,68,68,0.7)] z-20">
                  <TacticalKnifeIcon className="w-full h-full" />
                </div>
              )}

              {/* Header: Title + Time Badge */}
              <div className="space-y-2 mb-6 flex-1 relative z-10">
                {/* Badge de Método Estrella si es Método Psicópata */}
                {isPsicopata && (
                  <div className="mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 border transition-all duration-300 ${
                        domIsLight
                          ? "bg-red-50 text-red-700 border-red-200/90 shadow-sm"
                          : "bg-red-500/10 text-red-300 border-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                      }`}
                    >
                      <Flame className="w-3 h-3 text-red-500 fill-red-500/20" />
                      <span>Método Estrella</span>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-lg font-bold tracking-tight transition-colors duration-200 ${
                      domIsLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {method.title}
                  </h3>
                  {!isPsicopata && method.time && (
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0 ${
                        domIsLight ? method.timeColorLight : method.timeColorDark
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{method.time}</span>
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs font-semibold ${
                    domIsLight ? method.subtitleColorLight : method.subtitleColorDark
                  }`}
                >
                  {method.subtitle}
                </p>

                <p
                  className={`text-xs leading-relaxed transition-colors duration-200 ${
                    domIsLight ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {method.focus}
                </p>
              </div>

              {/* Link button */}
              <div className="relative z-10 pt-1">
                <button
                  onClick={() => openMethod(method)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
                    domIsLight ? method.linkColorLight : method.linkColorDark
                  }`}
                >
                  <span>
                    {method.id === "feynman"
                      ? "Grabar y evaluar con IA"
                      : method.id === "cornell"
                      ? "Ver plantillas y descargar"
                      : isPsicopata
                      ? "Activar Modo Psicópata"
                      : method.id === "spaced_repetition"
                      ? "Crear plan de estudio"
                      : "Explorar técnica"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Elemento característico UI/UX: Sangre derramando directamente en el borde inferior de la caja */}
              {isPsicopata && (
                <>
                  {/* Línea incandescente roja en el borde inferior de la caja */}
                  <div className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.9)] z-20" />
                  {/* Gotas de sangre goteando hacia abajo del borde de la caja */}
                  <div className="absolute -bottom-4 sm:-bottom-5 left-1 right-1 pointer-events-none z-20">
                    <BloodDripSvg className="w-full h-5 sm:h-6" />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Ventana interactiva y hermosa para Método Pomodoro (con Tomatito, Banderas y Meta Final) */}
      <PomodoroModal
        isOpen={selectedMethod?.id === "pomodoro"}
        onClose={() => setSelectedMethod(null)}
        isLightMode={domIsLight}
        onSessionCompleted={onSessionCompleted}
      />

      {/* Ventana interactiva y Puerta Falsa para Método Feynman con IA */}
      <FeynmanModal
        isOpen={selectedMethod?.id === "feynman"}
        onClose={() => setSelectedMethod(null)}
        isLightMode={domIsLight}
      />

      {/* Ventana interactiva para Método Cornell (Plantillas PDF y previsualización) */}
      <CornellModal
        isOpen={selectedMethod?.id === "cornell"}
        onClose={() => setSelectedMethod(null)}
        isLightMode={domIsLight}
      />

      {/* Ventana interactiva para Método Psicópata (Modo Berserk, Temporizador Implacable y Cero Distracciones) */}
      <PsicopataModal
        isOpen={selectedMethod?.id === "metodo_psicopata"}
        onClose={() => setSelectedMethod(null)}
        isLightMode={domIsLight}
        isPro={isPro}
        onGoToCheckout={onGoToCheckout}
        tokensBalance={tokensBalance}
        onDeductTokens={onDeductTokens}
        onSessionCompleted={onSessionCompleted}
      />

      {/* Ventana interactiva para Repetición Espaciada (Bloques progresivos 1h + 15m y Calendario de Tachado) */}
      <SpacedRepetitionModal
        isOpen={selectedMethod?.id === "spaced_repetition"}
        onClose={() => setSelectedMethod(null)}
        isLightMode={domIsLight}
        onSessionCompleted={onSessionCompleted}
      />

      {/* Ventana interactiva para Recuerdo Activo (Línea de meta Duolingo, 5m descanso, volcado mental y flashcards) */}
      <ActiveRecallModal
        isOpen={selectedMethod?.id === "recuerdo_activo"}
        onClose={() => setSelectedMethod(null)}
        isLightMode={domIsLight}
        onSessionCompleted={onSessionCompleted}
      />

      {/* Modal para las demás técnicas de estudio */}
      {selectedMethod &&
        selectedMethod.id !== "pomodoro" &&
        selectedMethod.id !== "feynman" &&
        selectedMethod.id !== "cornell" &&
        selectedMethod.id !== "metodo_psicopata" &&
        selectedMethod.id !== "spaced_repetition" &&
        selectedMethod.id !== "recuerdo_activo" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-5 animate-in zoom-in-95 duration-150 transition-colors duration-200 ${
              domIsLight
                ? "bg-white border-slate-200 text-slate-900 shadow-2xl"
                : "bg-[#0c0f1c] border-[#212744] text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3
                    className={`font-bold text-lg ${
                      domIsLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {selectedMethod.title}
                  </h3>
                  <p
                    className={`text-xs font-semibold ${
                      domIsLight
                        ? selectedMethod.subtitleColorLight
                        : selectedMethod.subtitleColorDark
                    }`}
                  >
                    {selectedMethod.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMethod(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  domIsLight
                    ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p
              className={`text-xs leading-relaxed ${
                domIsLight ? "text-slate-600" : "text-slate-300"
              }`}
            >
              {selectedMethod.description}
            </p>

            {/* Live timer inside modal */}
            <div
              className={`p-5 rounded-xl border text-center space-y-3 transition-colors duration-200 ${
                domIsLight
                  ? "bg-slate-50 border-slate-200 text-slate-900"
                  : "bg-[#080a14] border-[#1b213b] text-white"
              }`}
            >
              <span
                className={`text-[11px] uppercase font-bold tracking-widest ${
                  domIsLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                TEMPORIZADOR DE ENFOQUE
              </span>
              <div
                className={`text-4xl font-mono font-bold ${
                  domIsLight ? "text-slate-900" : "text-white"
                }`}
              >
                {Math.floor(secondsLeft / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(secondsLeft % 60).toString().padStart(2, "0")}
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="px-5 py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerActive ? "Pausar" : "Iniciar"}</span>
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    const mins = selectedMethod.time ? parseInt(selectedMethod.time) : 25;
                    setSecondsLeft(mins * 60);
                  }}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer border ${
                    domIsLight
                      ? "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
                      : "bg-[#141829] border-[#1b213b] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                  }`}
                  title="Reiniciar temporizador"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
