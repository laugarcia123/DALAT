"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
  GraduationCap,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Check,
  Award,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { studySessionService } from "@/services/studySessionService";

interface SpacedRepetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
  onSessionCompleted?: () => void;
}

export interface DayBlock {
  dayNumber: number;
  minutes: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface SubjectPlan {
  id: string;
  subjectName: string;
  examType?: string;
  totalDays: number;
  createdAt: string;
  days: DayBlock[];
}

const DEFAULT_SUBJECT_PRESETS = [
  "Cálculo Integral",
  "Bioquímica Médica",
  "Derecho Constitucional",
  "Física Mecánica",
  "Programación & Algoritmos",
  "Psicología Cognitiva",
];

const PRESET_DAYS = [3, 5, 7, 10, 14, 21];

// Sonido con Web Audio API para finalización de bloque
function playSuccessBell() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.9);
    });
  } catch {
    // Si el navegador bloquea audio, continuar silencioso
  }
}

export default function SpacedRepetitionModal({
  isOpen,
  onClose,
  isLightMode = false,
  onSessionCompleted,
}: SpacedRepetitionModalProps) {
  // Lista de planes por materia guardados en localStorage
  const [plans, setPlans] = useState<SubjectPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // Modo creación de nuevo bloque
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>("");
  const [newDaysCount, setNewDaysCount] = useState<number>(7);

  // Día actualmente seleccionado para estudiar en el plan activo
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // Temporizador
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(60 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerInitialMinutes, setTimerInitialMinutes] = useState<number>(60);

  // Modal explicativo
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Cargar planes guardados en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dalat_spaced_repetition_plans");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Normalizar para que los días > 1 sean exactamente 75 min (1h base + 15 min de repaso fijos)
            const sanitized = parsed.map((p: SubjectPlan) => ({
              ...p,
              days: p.days.map((d: DayBlock) => ({
                ...d,
                minutes: d.dayNumber === 1 ? 60 : 75,
              })),
            }));
            setPlans(sanitized);
            setActivePlanId(sanitized[0].id);
            return;
          }
        }
      } catch {
        // Fallback
      }
      // Si no hay planes creados, iniciar en modo creación
      setIsCreatingNew(true);
    }
  }, [isOpen]);

  // Guardar planes en localStorage
  const savePlans = (updatedPlans: SubjectPlan[]) => {
    setPlans(updatedPlans);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("dalat_spaced_repetition_plans", JSON.stringify(updatedPlans));
      } catch {
        // ignore
      }
    }
  };

  const activePlan = plans.find((p) => p.id === activePlanId) || null;

  // Sincronizar el temporizador cuando cambia el día seleccionado o el plan activo
  useEffect(() => {
    if (!activePlan) return;
    const day = activePlan.days.find((d) => d.dayNumber === selectedDayNumber);
    if (day) {
      setTimerInitialMinutes(day.minutes);
      setTimerSecondsLeft(day.minutes * 60);
      setTimerRunning(false);
    }
  }, [activePlanId, selectedDayNumber]);

  // Manejo del contador del temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            handleCompleteDay(selectedDayNumber);
            playSuccessBell();
            try {
              confetti({
                particleCount: 75,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // ignore
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSecondsLeft, selectedDayNumber]);

  // Marcar día como completado y tachado
  const handleCompleteDay = (dayNum: number) => {
    if (!activePlan) return;
    setTimerRunning(false);
    const updatedDays = activePlan.days.map((d) => {
      if (d.dayNumber === dayNum) {
        return { ...d, isCompleted: true, completedAt: new Date().toISOString() };
      }
      return d;
    });

    const updatedPlan = { ...activePlan, days: updatedDays };
    const updatedPlans = plans.map((p) => (p.id === activePlan.id ? updatedPlan : p));
    savePlans(updatedPlans);

    // Registrar sesión de estudio para sumar a la racha diaria
    const targetDay = activePlan.days.find((d) => d.dayNumber === dayNum);
    const durationMins = targetDay?.minutes || 60;
    studySessionService.logSession({
      duracion_segundos: durationMins * 60,
      materia: activePlan.subjectName || "Repetición Espaciada",
      completada: true,
      tipo: "spaced_repetition",
      notas: `Día ${dayNum} completado en plan ${activePlan.subjectName}`,
    }).then(() => {
      onSessionCompleted?.();
    }).catch((err) => {
      console.error("Error al registrar sesión de Repetición Espaciada:", err);
    });

    // Avanzar automáticamente al siguiente día no completado
    const nextIncomplete = updatedDays.find((d) => !d.isCompleted && d.dayNumber > dayNum);
    if (nextIncomplete) {
      setSelectedDayNumber(nextIncomplete.dayNumber);
    }
  };

  // Desmarcar / Reactivar día
  const handleToggleDay = (dayNum: number, currentCompleted: boolean) => {
    if (!activePlan) return;
    setTimerRunning(false);
    if (currentCompleted) {
      // Desmarcar
      const updatedDays = activePlan.days.map((d) => {
        if (d.dayNumber === dayNum) {
          return { ...d, isCompleted: false, completedAt: undefined };
        }
        return d;
      });
      const updatedPlan = { ...activePlan, days: updatedDays };
      savePlans(plans.map((p) => (p.id === activePlan.id ? updatedPlan : p)));
    } else {
      // Marcar
      handleCompleteDay(dayNum);
      playSuccessBell();
    }
  };

  // Comprueba si una fecha es el mismo día calendario que hoy
  const isCompletedToday = (completedAt?: string) => {
    if (!completedAt) return false;
    const date = new Date(completedAt);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Comprueba si un día específico está bloqueado
  // Regla: No puedes hacer los demás días hasta que pase 1 día si ya hiciste una sesión hoy
  const getDayStatus = (dayNum: number) => {
    if (!activePlan) return { isLocked: false, reason: "", isWaitUntilTomorrow: false };

    const day = activePlan.days.find((d) => d.dayNumber === dayNum);
    if (!day) return { isLocked: false, reason: "", isWaitUntilTomorrow: false };
    if (day.isCompleted) return { isLocked: false, reason: "completed", isWaitUntilTomorrow: false };

    // 1. Debe completar los días anteriores primero
    const previousIncomplete = activePlan.days.find(
      (d) => d.dayNumber < dayNum && !d.isCompleted
    );
    if (previousIncomplete) {
      return {
        isLocked: true,
        reason: `Debes completar primero el Día ${previousIncomplete.dayNumber}.`,
        isWaitUntilTomorrow: false,
      };
    }

    // 2. Si ya completó alguna sesión hoy para esta materia, no puede hacer la siguiente hasta mañana
    const completedToday = activePlan.days.find(
      (d) => d.isCompleted && isCompletedToday(d.completedAt)
    );
    if (completedToday) {
      return {
        isLocked: true,
        reason: `Ya completaste la sesión del Día ${completedToday.dayNumber} hoy. Para consolidar la memoria a largo plazo, la repetición espaciada requiere esperar hasta mañana.`,
        isWaitUntilTomorrow: true,
      };
    }

    return { isLocked: false, reason: "available", isWaitUntilTomorrow: false };
  };

  // Desbloqueo rápido para modo prueba (simula que la sesión se hizo ayer)
  const handleForceUnlock = () => {
    if (!activePlan) return;
    const yesterday = new Date(Date.now() - 25 * 3600 * 1000).toISOString();
    const updatedDays = activePlan.days.map((d) => {
      if (d.isCompleted && isCompletedToday(d.completedAt)) {
        return { ...d, completedAt: yesterday };
      }
      return d;
    });
    const updatedPlan = { ...activePlan, days: updatedDays };
    savePlans(plans.map((p) => (p.id === activePlan.id ? updatedPlan : p)));
  };

  // Crear un nuevo plan para una materia
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = newSubject.trim();
    if (!subject) return;

    // Fórmula del usuario:
    // Día 1 = 60 min (1 hora base de estudio)
    // Todos los demás días = 75 min (1 hora base + 15 min de repaso fijos)
    const days: DayBlock[] = [];
    for (let i = 1; i <= newDaysCount; i++) {
      const minutes = i === 1 ? 60 : 75;
      days.push({
        dayNumber: i,
        minutes,
        isCompleted: false,
      });
    }

    const newPlan: SubjectPlan = {
      id: `plan-${Date.now()}`,
      subjectName: subject,
      totalDays: newDaysCount,
      createdAt: new Date().toISOString(),
      days,
    };

    const updated = [newPlan, ...plans];
    savePlans(updated);
    setActivePlanId(newPlan.id);
    setSelectedDayNumber(1);
    setIsCreatingNew(false);
    setNewSubject("");
  };

  // Eliminar un plan
  const handleDeletePlan = (id: string) => {
    const filtered = plans.filter((p) => p.id !== id);
    savePlans(filtered);
    if (activePlanId === id) {
      if (filtered.length > 0) {
        setActivePlanId(filtered[0].id);
        setSelectedDayNumber(1);
      } else {
        setActivePlanId(null);
        setIsCreatingNew(true);
      }
    }
  };

  if (!isOpen) return null;

  // Formato MM:SS del temporizador
  const mins = Math.floor(timerSecondsLeft / 60);
  const secs = timerSecondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const totalCompletedInPlan = activePlan ? activePlan.days.filter((d) => d.isCompleted).length : 0;
  const progressPercent = activePlan
    ? Math.round((totalCompletedInPlan / activePlan.totalDays) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-5 sm:p-7 flex flex-col space-y-5 animate-in zoom-in-95 duration-200 transition-colors ${
          isLightMode
            ? "bg-[#fffdfa] border-amber-200/80 text-slate-900 shadow-amber-950/10"
            : "bg-[#140f09] border-amber-600/30 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
        }`}
      >
        {/* 1. HEADER */}
        <div
          className={`flex items-start justify-between gap-4 border-b pb-4 shrink-0 ${
            isLightMode ? "border-amber-200/70" : "border-white/[0.08]"
          }`}
        >
          <div className="space-y-1.5">
            {/* Badge superior */}
            <div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 border transition-all ${
                  isLightMode
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Bloques Progresivos • Repetición Espaciada</span>
              </span>
            </div>

            {/* Título y botón ¿Cómo funciona? */}
            <div className="flex flex-wrap items-center gap-3">
              <h2
                className={`text-xl sm:text-2xl font-editorial font-bold tracking-tight ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              >
                Repetición Espaciada
              </h2>

              <button
                onClick={() => setShowExplanation(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  isLightMode
                    ? "bg-amber-100/70 hover:bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border-white/[0.12]"
                }`}
                title="Ver regla de 1 hora + 15 min diarios"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>¿Cómo funciona?</span>
              </button>
            </div>

            <p className={`text-xs sm:text-sm ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
              1 hora base el Día 1 y 75 min los demás días (1h base + 15 min de repaso).
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

        {/* 2. Pestañas de cambio si hay más de 1 materia creada */}
        {plans.length > 1 && !isCreatingNew && (
          <div className="flex items-center gap-2 overflow-x-auto py-1.5 shrink-0 scrollbar-none">
            {plans.map((p) => {
              const isActive = p.id === activePlanId;
              const completed = p.days.filter((d) => d.isCompleted).length;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePlanId(p.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? isLightMode
                        ? "bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md ring-2 ring-amber-500/20"
                      : isLightMode
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{p.subjectName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? "bg-black/20 text-white"
                        : isLightMode
                        ? "bg-slate-200 text-slate-600"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {completed}/{p.totalDays}d
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(true);
                setNewSubject("");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-dashed shrink-0 ${
                isLightMode
                  ? "border-amber-400 text-amber-700 hover:bg-amber-50"
                  : "border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
              }`}
              title="Añadir bloque para otra materia"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva materia</span>
            </button>
          </div>
        )}

        {/* 3. CONTENIDO: PANTALLA DE CONFIGURACIÓN Ó INTERFAZ DE CALENDARIO */}
        {isCreatingNew ? (
          /* FORMULARIO DE CREACIÓN DE NUEVO BLOQUE */
          <form
            onSubmit={handleCreatePlan}
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
              isLightMode
                ? "bg-white border-amber-200/80 shadow-amber-950/5"
                : "bg-white/[0.02] border-white/[0.08]"
            }`}
          >
            <div className="space-y-1">
              <h3
                className={`text-lg font-bold tracking-tight ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              >
                Configurar nuevo bloque de Repetición Espaciada
              </h3>
              <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-300"}`}>
                Define la materia y los días que faltan para tu evaluación. Dalat calculará los bloques de 1h base y 75 min para los días siguientes.
              </p>
            </div>

            {/* Campo Materia */}
            <div className="space-y-2">
              <label
                className={`text-xs font-bold uppercase tracking-wider block ${
                  isLightMode ? "text-slate-700" : "text-slate-200"
                }`}
              >
                Nombre de la Materia:
              </label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Ej: Bioquímica, Cálculo, Derecho..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                  isLightMode
                    ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    : "bg-[#0b0b0f] border-white/[0.1] text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                }`}
              />

              {/* Presets rápidos de materias */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {DEFAULT_SUBJECT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewSubject(preset)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                      isLightMode
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/[0.08]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad de días antes del examen */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    isLightMode ? "text-slate-700" : "text-slate-200"
                  }`}
                >
                  Cantidad de días a estudiar antes del examen:
                </label>
                <span className="font-mono text-sm font-bold text-amber-500">
                  {newDaysCount} días programados
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESET_DAYS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setNewDaysCount(days)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      newDaysCount === days
                        ? isLightMode
                          ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                          : "bg-amber-500 text-black border-amber-400 font-extrabold shadow-md"
                        : isLightMode
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/[0.08]"
                    }`}
                  >
                    {days} Días
                  </button>
                ))}
              </div>
            </div>

            {/* Vista previa de cómo se distribuirá el tiempo */}
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                isLightMode
                  ? "bg-amber-50/80 border-amber-200 text-amber-950"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-100"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span className={isLightMode ? "text-amber-950" : "text-amber-300"}>
                  Estructura de tiempo calculada:
                </span>
              </div>
              <p className={`leading-relaxed text-[11px] ${isLightMode ? "text-amber-900" : "text-amber-200"}`}>
                • <b>Día 1:</b> 60 min (1 hora base de estudio del tema).
                <br />• <b>Todos los demás días:</b> 75 min (1 hora de estudio nuevo + 15 min de repaso de lo visto anteriormente).
              </p>
            </div>

            {/* Botones de acción del formulario */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {plans.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isLightMode
                      ? "text-slate-600 hover:bg-slate-100"
                      : "text-slate-300 hover:bg-white/[0.06]"
                  }`}
                >
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 cursor-pointer active:scale-95 transition-all"
              >
                <span>Continuar y Crear Calendario</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : activePlan ? (
          /* INTERFAZ DE CALENDARIO Y TEMPORIZADOR PARA LA MATERIA ACTIVA */
          <div className="space-y-6">
            {/* Header del plan activo */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${
                isLightMode ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/[0.08]"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-bold text-base sm:text-lg ${
                      isLightMode ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {activePlan.subjectName}
                  </h3>
                </div>
                <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-300"}`}>
                  Progreso: {totalCompletedInPlan} de {activePlan.totalDays} días completados ({progressPercent}%)
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(true);
                    setNewSubject("");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                    isLightMode
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-amber-500 hover:bg-amber-400 text-black font-extrabold"
                  }`}
                  title="Crear un nuevo bloque para otra materia"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear bloque para otra materia</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeletePlan(activePlan.id)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition text-red-400 hover:bg-red-500/10 border border-red-500/20 cursor-pointer`}
                  title="Eliminar este bloque"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Eliminar bloque</span>
                </button>
              </div>
            </div>

            {/* SECCIÓN 2 COLUMNAS: Izquierda Calendario con cajas tachadas, Derecha Temporizador */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* COLUMNA IZQUIERDA: Cajas estilo Calendario (Día 1, Día 2, etc.) que se tachan */}
              <div className="lg:col-span-7 space-y-3">
                <div
                  className={`flex items-center justify-between text-xs font-bold tracking-wide uppercase ${
                    isLightMode ? "text-slate-500" : "text-slate-300"
                  }`}
                >
                  <span>Calendario de Repetición Espaciada</span>
                  <span className="text-[11px] font-normal lowercase">
                    Haz clic en un día para seleccionarlo o tacharlo
                  </span>
                </div>

                {/* Grid de cajas de calendario */}
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 ${
                    activePlan.totalDays > 8
                      ? "max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin"
                      : ""
                  }`}
                >
                  {activePlan.days.map((day) => {
                    const isSelected = day.dayNumber === selectedDayNumber;
                    const isDone = day.isCompleted;
                    const status = getDayStatus(day.dayNumber);

                    return (
                      <div
                        key={day.dayNumber}
                        onClick={() => setSelectedDayNumber(day.dayNumber)}
                        className={`${
                          activePlan.totalDays > 8 ? "p-3" : "p-3.5"
                        } rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                          isDone
                            ? isLightMode
                              ? "bg-slate-100/90 border-slate-300 opacity-80"
                              : "bg-white/[0.03] border-white/[0.1] opacity-65"
                            : status.isLocked
                            ? isLightMode
                              ? "bg-slate-50 border-slate-200 opacity-70"
                              : "bg-white/[0.02] border-white/[0.06] opacity-60"
                            : isSelected
                            ? isLightMode
                              ? "bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                              : "bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20"
                            : isLightMode
                            ? "bg-white hover:bg-slate-50 border-slate-200"
                            : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08]"
                        }`}
                      >
                        {/* Cabecera del día */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`text-xs font-black tracking-tight flex items-center gap-1 ${
                              isDone
                                ? isLightMode
                                  ? "line-through text-slate-400"
                                  : "line-through text-slate-500"
                                : isLightMode
                                ? "text-slate-900"
                                : "text-white"
                            }`}
                          >
                            <span>DÍA {day.dayNumber}</span>
                            {status.isLocked && !isDone && (
                              <Lock className="w-3 h-3 text-amber-500/80 inline" />
                            )}
                          </span>

                          {/* Checkbox de tachado */}
                          <button
                            type="button"
                            disabled={status.isLocked && !isDone}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!status.isLocked || isDone) {
                                handleToggleDay(day.dayNumber, isDone);
                              }
                            }}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              isDone
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : isLightMode
                                ? "border-slate-300 hover:border-amber-500"
                                : "border-white/[0.2] hover:border-amber-400"
                            }`}
                            title={
                              isDone
                                ? "Desmarcar día"
                                : status.isLocked
                                ? status.reason
                                : "Tachar y marcar completado"
                            }
                          >
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        </div>

                        {/* Minutos asignados */}
                        <div className="space-y-0.5">
                          <div
                            className={`text-sm font-extrabold font-mono flex items-center gap-1 ${
                              isDone
                                ? isLightMode
                                  ? "line-through text-slate-400"
                                  : "line-through text-slate-500"
                                : status.isLocked
                                ? "text-slate-400"
                                : "text-amber-500"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{day.minutes} min</span>
                          </div>

                          <div
                            className={`text-[10px] ${
                              isDone
                                ? isLightMode
                                  ? "line-through text-slate-400"
                                  : "line-through text-slate-600"
                                : status.isLocked
                                ? isLightMode
                                  ? "text-amber-700 font-semibold"
                                  : "text-amber-300 font-semibold"
                                : isLightMode
                                ? "text-slate-500"
                                : "text-slate-300"
                            }`}
                          >
                            {status.isLocked
                              ? status.isWaitUntilTomorrow
                                ? "🔒 Espera a mañana"
                                : "🔒 Bloqueado"
                              : day.dayNumber === 1
                              ? "1h estudio base"
                              : "+15m de repaso"}
                          </div>
                        </div>

                        {/* Sello de tachado / completado */}
                        {isDone && (
                          <div
                            className={`mt-2 pt-1 border-t border-dashed flex items-center gap-1 text-[10px] font-bold ${
                              isLightMode
                                ? "border-slate-300 text-emerald-700"
                                : "border-white/[0.1] text-emerald-400"
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Tachado</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COLUMNA DERECHA: Temporizador del día seleccionado */}
              <div
                className={`lg:col-span-5 lg:sticky lg:top-2 p-5 sm:p-6 rounded-3xl border flex flex-col space-y-4 shadow-sm ${
                  isLightMode
                    ? "bg-gradient-to-b from-white to-amber-50/50 border-amber-200/80"
                    : "bg-gradient-to-b from-[#1c140a] to-[#120b05] border-amber-600/30"
                }`}
              >
                <div className="space-y-1 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                    Estudiando Día {selectedDayNumber} de {activePlan.totalDays}
                  </span>
                  <h4 className="font-bold text-base sm:text-lg">
                    {selectedDayNumber === 1
                      ? "1 Hora de Estudio Base (60 min)"
                      : "Sesión de 75 min (1h base + 15 min repaso)"}
                  </h4>
                </div>

                {/* Estado del día seleccionado */}
                {(() => {
                  const selectedDay = activePlan.days.find((d) => d.dayNumber === selectedDayNumber);
                  const isDayCompleted = Boolean(selectedDay?.isCompleted);
                  const currentStatus = getDayStatus(selectedDayNumber);
                  const isDayLocked = currentStatus.isLocked && !isDayCompleted;

                  if (isDayCompleted) {
                    return (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                          isLightMode
                            ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                            : "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                        }`}
                      >
                        <div
                          className={`font-bold flex items-center gap-1.5 ${
                            isLightMode ? "text-emerald-700" : "text-emerald-400"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>¡Día {selectedDayNumber} Completado y Tachado!</span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-90">
                          Esta sesión ya fue completada con éxito. No se puede volver a iniciar el conteo para este día.
                        </p>
                      </div>
                    );
                  }

                  if (isDayLocked) {
                    return (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                          isLightMode
                            ? "bg-amber-50/90 border-amber-300 text-amber-950"
                            : "bg-amber-950/40 border-amber-500/30 text-amber-200"
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5 text-amber-500">
                          <Lock className="w-4 h-4" />
                          <span>
                            {currentStatus.isWaitUntilTomorrow
                              ? "Sesión bloqueada hasta mañana"
                              : "Día Bloqueado"}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-90">
                          {currentStatus.reason}
                        </p>
                        {currentStatus.isWaitUntilTomorrow && (
                          <div className="pt-1.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-1">
                            <span className="text-[10px] opacity-75">
                              Regla: 1 sesión por día para consolidar la memoria.
                            </span>
                            <button
                              type="button"
                              onClick={handleForceUnlock}
                              className="text-[10px] underline font-bold text-amber-500 hover:text-amber-400 cursor-pointer"
                              title="Simular que ya pasaron 24h para probar el siguiente día"
                            >
                              (Modo Prueba: Desbloquear hoy)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Display numérico gigante */}
                {(() => {
                  const selectedDay = activePlan.days.find((d) => d.dayNumber === selectedDayNumber);
                  const isDayCompleted = Boolean(selectedDay?.isCompleted);
                  const currentStatus = getDayStatus(selectedDayNumber);
                  const isDayLocked = currentStatus.isLocked && !isDayCompleted;

                  return (
                    <>
                      <div className="flex flex-col items-center justify-center py-4">
                        <div
                          className={`font-mono text-5xl sm:text-6xl font-black tracking-tight select-none ${
                            isDayCompleted
                              ? "text-emerald-500"
                              : timerRunning
                              ? "text-amber-500 animate-pulse"
                              : isLightMode
                              ? "text-slate-900"
                              : "text-white"
                          }`}
                        >
                          {isDayCompleted ? "00:00" : timeFormatted}
                        </div>
                        {(() => {
                          const statusLabel = isDayCompleted
                            ? "✓ Sesión cumplida y tachada"
                            : isDayLocked
                            ? null
                            : timerRunning
                            ? "Sesión activa • Concéntrate"
                            : "Listo para arrancar el bloque";
                          if (!statusLabel) return null;
                          return (
                            <p className={`text-xs mt-1 ${isLightMode ? "text-slate-500" : "text-slate-300"}`}>
                              {statusLabel}
                            </p>
                          );
                        })()}
                      </div>

                      {/* Controles del temporizador */}
                      <div className="space-y-2">
                        {isDayCompleted ? (
                          <div className="space-y-2">
                            <div
                              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border select-none ${
                                isLightMode
                                  ? "bg-emerald-100/80 border-emerald-300 text-emerald-900"
                                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>Sesión Finalizada con Éxito</span>
                            </div>

                            <button
                              onClick={() => handleToggleDay(selectedDayNumber, true)}
                              className={`w-full py-2 rounded-xl text-[11px] font-medium transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                                isLightMode
                                  ? "text-slate-500 hover:text-red-700 hover:bg-red-50 border-slate-200"
                                  : "text-slate-400 hover:text-red-400 hover:bg-red-500/10 border-white/[0.08]"
                              }`}
                              title="Reiniciar este día para volver a estudiarlo"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Desmarcar día (reiniciar sesión)</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                disabled={isDayLocked}
                                onClick={() => setTimerRunning(!timerRunning)}
                                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition shadow-lg shadow-amber-500/20"
                              >
                                {timerRunning ? (
                                  <>
                                    <Pause className="w-4 h-4 fill-current" />
                                    <span>Pausar</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 fill-current" />
                                    <span>Iniciar Hora de Estudio</span>
                                  </>
                                )}
                              </button>

                              <button
                                disabled={isDayLocked}
                                onClick={() => {
                                  setTimerRunning(false);
                                  setTimerSecondsLeft(timerInitialMinutes * 60);
                                }}
                                className={`p-3 rounded-xl border transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isLightMode
                                    ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                                    : "bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/[0.1]"
                                }`}
                                title="Reiniciar tiempo"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Botón manual para tachar de una vez */}
                            <button
                              disabled={isDayLocked}
                              onClick={() => handleToggleDay(selectedDayNumber, false)}
                              className={`w-full py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed ${
                                isLightMode
                                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                                  : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]"
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Tachar y marcar Día {selectedDayNumber} como completado</span>
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* MODAL DE EXPLICACIÓN "¿CÓMO FUNCIONA LA REPETICIÓN ESPACIADA?" */}
      {showExplanation && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 ${
              isLightMode
                ? "bg-[#fffdfa] border-amber-300 text-slate-900"
                : "bg-[#140e08] border-amber-600/50 text-white"
            }`}
          >
            <div className={`flex items-start justify-between gap-4 border-b pb-4 ${
              isLightMode ? "border-amber-200" : "border-amber-500/20"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold tracking-tight">
                    El Método de Repetición Espaciada
                  </h3>
                  <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-amber-200/80"}`}>
                    La regla científica de 1 hora base + 15 min diarios.
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
              <p className={`text-xs sm:text-sm font-medium ${isLightMode ? "text-slate-700" : "text-slate-200"}`}>
                En lugar de trasnochar estudiando todo a última hora, divides tu preparación en sesiones cortas para que tu memoria nunca olvide nada:
              </p>

              {/* Tarjetas de pasos breves */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Paso 1 */}
                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isLightMode
                      ? "bg-amber-50/80 border-amber-300 text-amber-950"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-100"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[11px] font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className={isLightMode ? "text-amber-950 font-extrabold" : "text-amber-300 font-extrabold"}>
                      Día 1: 60 minutos
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isLightMode ? "text-amber-900" : "text-amber-100/90"}`}>
                    1 hora de enfoque total aprendiendo el tema inicial base.
                  </p>
                </div>

                {/* Paso 2 */}
                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isLightMode
                      ? "bg-orange-50/80 border-orange-300 text-orange-950"
                      : "bg-orange-500/10 border-orange-500/30 text-orange-100"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className={isLightMode ? "text-orange-950 font-extrabold" : "text-orange-300 font-extrabold"}>
                      Día 2 en adelante: 75 min
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isLightMode ? "text-orange-900" : "text-orange-100/90"}`}>
                    <b>15 min</b> de repaso activo de lo visto ayer + <b>60 min</b> de contenido nuevo.
                  </p>
                </div>
              </div>

              {/* Regla de oro */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
                  isLightMode
                    ? "bg-slate-100/80 border-slate-200 text-slate-700"
                    : "bg-white/[0.04] border-white/[0.08] text-slate-300"
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </div>
                <p className="text-[11px] leading-relaxed">
                  <b>Solo 1 sesión al día:</b> Tu cerebro afianza el conocimiento mientras duermes. Tachas la caja y quedas libre hasta mañana.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowExplanation(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md shadow-orange-500/25"
            >
              Comenzar a estudiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
