"use client";

import React, { useState } from "react";
import { Clock, ArrowRight, X, Play, Pause, RotateCcw } from "lucide-react";

interface MethodCard {
  id: string;
  time?: string;
  timeColor?: string;
  title: string;
  subtitle: string;
  subtitleColor: string;
  description: string;
  linkColor: string;
  bgClass: string;
  borderClass: string;
}

const METHODS: MethodCard[] = [
  {
    id: "pomodoro",
    time: "25 min",
    timeColor: "text-indigo-400 bg-indigo-950/50 border-indigo-800/40",
    title: "Pomodoro",
    subtitle: "Estudia por bloques de tiempo",
    subtitleColor: "text-indigo-300",
    description:
      "Recomendado: Proyectos, asignaturas practicas, tareas largas. ",
    linkColor: "text-indigo-400 hover:text-indigo-300",
    bgClass: "bg-[#0d1022]",
    borderClass: "border-[#1e2348] hover:border-indigo-500/40",
  },
  {
    id: "feynman",
    time: "20 min",
    timeColor: "text-rose-400 bg-rose-950/50 border-rose-800/40",
    title: "Técnica Feynman",
    subtitle: "Aprende enseñando en voz alta",
    subtitleColor: "text-rose-300",
    description:
      "Explicar un concepto con palabras simples revela exactamente qué no entiendes. Si te trabas, vuelves al material. Ciclo: estudia → explica →...",
    linkColor: "text-rose-400 hover:text-rose-300",
    bgClass: "bg-[#180e1b]",
    borderClass: "border-[#381a38] hover:border-rose-500/40",
  },
  {
    id: "cornell",
    title: "Método Cornell",
    subtitle: "Recomendado para mayor retencion",
    subtitleColor: "text-emerald-300",
    description:
      "Divide tu hoja en tres zonas: notas principales (derecha), preguntas clave (izquierda) y resumen al fondo. Al repasar, cubre las notas y responde tus...",
    linkColor: "text-emerald-400 hover:text-emerald-300",
    bgClass: "bg-[#091719]",
    borderClass: "border-[#123637] hover:border-emerald-500/40",
  },
  {
    id: "spaced_repetition",
    title: "Repetición Espaciada",
    subtitle: "Repasa justo antes de olvidar",
    subtitleColor: "text-amber-300",
    description:
      "El cerebro retiene mejor lo que repasa en intervalos crecientes. En lugar de estudiar todo el día antes del examen, distribuye repasos en días 1, 3, 7, 14 y...",
    linkColor: "text-amber-400 hover:text-amber-300",
    bgClass: "bg-[#18140c]",
    borderClass: "border-[#362914] hover:border-amber-500/40",
  },
  {
    id: "active_recall",
    time: "30 min",
    timeColor: "text-indigo-400 bg-indigo-950/50 border-indigo-800/40",
    title: "Active Recall",
    subtitle: "Testéate en lugar de releer",
    subtitleColor: "text-indigo-300",
    description:
      "Releer da falsa sensación de aprendizaje. Cerrar el libro y tratar de recordar activamente lo que estudiaste genera conexiones neuronales más...",
    linkColor: "text-indigo-400 hover:text-indigo-300",
    bgClass: "bg-[#0d1022]",
    borderClass: "border-[#1e2348] hover:border-indigo-500/40",
  },
  {
    id: "flowtime",
    time: "45 min",
    timeColor: "text-cyan-400 bg-cyan-950/50 border-cyan-800/40",
    title: "Técnica Flowtime",
    subtitle: "Trabaja hasta que el foco se agote naturalmente",
    subtitleColor: "text-cyan-300",
    description:
      "A diferencia del Pomodoro, no interrumpe tu estado de flujo con un timer fijo. Empiezas a trabajar y anotas cuándo naturalmente sientes...",
    linkColor: "text-cyan-400 hover:text-cyan-300",
    bgClass: "bg-[#09171b]",
    borderClass: "border-[#12373f] hover:border-cyan-500/40",
  },
];

export default function MethodsTab() {
  const [selectedMethod, setSelectedMethod] = useState<MethodCard | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

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
        <h2 className="text-3xl sm:text-4xl font-editorial font-bold tracking-tight text-white">
          Métodos de estudio
        </h2>
        <p className="text-sm text-slate-400">
          Elige una técnica y haz clic para explorarla con pasos y temporizador.
        </p>
      </div>

      {/* 3x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {METHODS.map((method) => (
          <div
            key={method.id}
            className={`rounded-2xl p-6 border ${method.borderClass} ${method.bgClass} flex flex-col justify-between transition-all duration-200 group relative`}
          >
            

            {/* Content */}
            <div className="space-y-2 mb-6 flex-1">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {method.title}
              </h3>
              <p className={`text-xs font-semibold ${method.subtitleColor}`}>
                {method.subtitle}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {method.description}
              </p>
            </div>

            {/* Link button */}
            <button
              onClick={() => openMethod(method)}
              className={`flex items-center gap-1.5 text-xs font-semibold transition ${method.linkColor}`}
            >
              <span>Explorar técnica</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal for exploring technique */}
      {selectedMethod && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c0f1c] border border-[#212744] p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{selectedMethod.title}</h3>
                  <p className={`text-xs font-semibold ${selectedMethod.subtitleColor}`}>
                    {selectedMethod.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMethod(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedMethod.description}
            </p>

            {/* Live timer inside modal */}
            <div className="p-5 rounded-xl bg-[#080a14] border border-[#1b213b] text-center space-y-3">
              <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
                TEMPORIZADOR DE ENFOQUE
              </span>
              <div className="text-4xl font-mono font-bold text-white">
                {Math.floor(secondsLeft / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(secondsLeft % 60).toString().padStart(2, "0")}
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="px-5 py-2 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-semibold flex items-center gap-2"
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
                  className="p-2 rounded-xl bg-[#141829] text-slate-400 hover:text-white"
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
