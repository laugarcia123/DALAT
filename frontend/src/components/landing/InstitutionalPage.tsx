"use client";

import React, { useState, useId } from "react";
import {
  GraduationCap,
  CheckCircle2,
  Send,
  Sparkles,
  BookOpen,
  Brain,
  Timer,
  Calculator,
  FolderGit2,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";

interface InstitutionalPageProps {
  onEnterApp?: () => void;
  onGoToPricing?: () => void;
}

export default function InstitutionalPage({
  onEnterApp,
  onGoToPricing,
}: InstitutionalPageProps) {
  void onEnterApp;
  void onGoToPricing;

  const formId = useId();

  // Form State
  const [institutionName, setInstitutionName] = useState("");
  const [contactName, setContactName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [studentsCount, setStudentsCount] = useState("500 - 2,500 estudiantes");
  const [notes, setNotes] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }, 600);
  };

  const scrollToQuote = (prefilledCount?: string) => {
    if (prefilledCount) {
      setStudentsCount(prefilledCount);
    }
    const el = document.getElementById("cotizacion");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-4 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold tracking-wide">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>CONVENIOS UNIVERSITARIOS &bull; LICENCIAS PARA ESTUDIANTES</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-editorial font-bold text-white tracking-tight leading-tight">
          Dalat Campus para tu comunidad de estudiantes
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Brinda a los estudiantes de tu facultad o institución acceso ilimitado a todas las herramientas Pro de Dalat:
          simuladores de parciales con IA desde sus PDFs, cálculo de notas por corte y métodos de estudio con neurociencia.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => scrollToQuote()}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all duration-150 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Solicitar cotización de licencias</span>
          </button>
          <a
            href="#que-incluye"
            className="px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white font-bold text-xs sm:text-sm tracking-wide border border-white/[0.1] transition-all duration-150"
          >
            Ver qué incluye el plan
          </a>
        </div>
      </section>

      {/* 2. QUÉ INCLUYE EL PLAN PARA LOS ESTUDIANTES */}
      <section id="que-incluye" className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 inline-block font-bold">
            HERRAMIENTAS REALES DE DALAT
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
            ¿Qué incluye el plan para cada estudiante?
          </h2>
          <p className="text-xs text-slate-400">
            Cada estudiante recibe una cuenta Pro completa con todas las herramientas de estudio activas sin restricciones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-[#0c0f1c] border border-white/[0.08] space-y-3 hover:border-purple-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Simulador de Parciales desde PDFs</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              El estudiante sube diapositivas o lecturas y genera exámenes tipo parcial con preguntas de opción múltiple, desarrollo y retroalimentación explicada paso a paso.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-[#0c0f1c] border border-white/[0.08] space-y-3 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Cálculo de Notas por Cortes & GPA</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calcula con exactitud matemática qué nota necesita sacar en Corte 3 y en el examen final para aprobar la materia según los porcentajes del syllabus.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-[#0c0f1c] border border-white/[0.08] space-y-3 hover:border-teal-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Flashcards con Repetición Espaciada</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Algoritmo de neurociencia (Spaced Repetition) que programa repasos justo antes de que el estudiante olvide los conceptos y fórmulas clave.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-[#0c0f1c] border border-white/[0.08] space-y-3 hover:border-amber-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Modo Zen & Frecuencias Alpha</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Temporizador Pomodoro y paisajes sonoros binaurales (Alpha 10Hz y Theta 6Hz) diseñados para mantener la concentración profunda sin fatiga.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-[#0c0f1c] border border-white/[0.08] space-y-3 hover:border-indigo-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Bóvedas de Estudio Colaborativas</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Espacio donde los estudiantes pueden compartir resúmenes, fichas de estudio y preguntas de examen con su grupo de trabajo o compañeros de semestre.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-[#0c0f1c] border border-white/[0.08] space-y-3 hover:border-rose-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Cero Alucinaciones con Fórmulas KaTeX</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Soporte nativo para matemáticas, física, química y código de programación. La IA responde citando directamente los apuntes cargados por el alumno.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CÓMO VA A BENEFICIAR A LOS ESTUDIANTES */}
      <section className="rounded-3xl bg-[#0c0f1c] border border-white/[0.08] p-7 sm:p-9 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 inline-block font-bold">
            IMPACTO REAL EN EL SEMESTRE
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
            ¿Cómo beneficia este plan a tus estudiantes?
          </h2>
          <p className="text-xs text-slate-400">
            Beneficios tangibles en el día a día académico del estudiante universitario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Menos estrés y cero trasnochadas de pánico</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              El estudiante practica con simulacros de parciales antes de la prueba real, detectando qué temas no domina con tiempo de sobra en lugar de memorizar a la fuerza la noche anterior.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Control exacto de su promedio y notas por corte</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              Saben en todo momento cuánto llevan acumulado en la materia y exactamente qué nota necesitan sacar en el examen final para no perderla, eliminando la incertidumbre.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tutor interactivo para entender temas difíciles</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              Cuando un concepto de clase o una fórmula científica no queda clara, la IA socrática se lo explica paso a paso usando sus propias lecturas sin juzgar ni apresurarlo.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Igualdad de oportunidades para toda la cohorte</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              Todos los alumnos de la facultad cuentan con las mismas herramientas avanzadas de estudio sin tener que pagar suscripciones individuales de su propio bolsillo.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FORMULARIO DE COTIZACIÓN */}
      <section id="cotizacion" className="rounded-3xl bg-[#0d1122] border border-white/[0.1] p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 inline-block font-bold">
            SOLICITUD DE COTIZACIÓN
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
            Cotiza licencias de Dalat para tus estudiantes
          </h2>
          <p className="text-xs text-slate-400">
            Completa los datos y te enviaremos una propuesta formal en pesos colombianos (COP) adaptada al número de alumnos.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {formSubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-white text-lg">¡Solicitud recibida!</h3>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Hemos recibido tu solicitud para <strong>{institutionName || "tu institución"}</strong>. Te enviaremos la cotización detallada en COP a <strong>{workEmail}</strong> en menos de 24 horas hábiles.
              </p>
              <button
                type="button"
                onClick={() => setFormSubmitted(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold transition cursor-pointer"
              >
                Enviar otra cotización
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor={`${formId}-institution-name`} className="block text-slate-300 font-semibold">Institución o Universidad:</label>
                  <input
                    id={`${formId}-institution-name`}
                    type="text"
                    required
                    placeholder="Ej. Universidad Nacional / Javeriana / Andes"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full bg-[#080a14] border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`${formId}-contact-name`} className="block text-slate-300 font-semibold">Nombre del Solicitante:</label>
                  <input
                    id={`${formId}-contact-name`}
                    type="text"
                    required
                    placeholder="Nombre completo"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-[#080a14] border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor={`${formId}-work-email`} className="block text-slate-300 font-semibold">Correo Institucional (.edu):</label>
                  <input
                    id={`${formId}-work-email`}
                    type="email"
                    required
                    placeholder="contacto@universidad.edu.co"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="w-full bg-[#080a14] border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`${formId}-students-count`} className="block text-slate-300 font-semibold">Número de Estudiantes a Licenciar:</label>
                  <select
                    id={`${formId}-students-count`}
                    value={studentsCount}
                    onChange={(e) => setStudentsCount(e.target.value)}
                    className="w-full bg-[#080a14] border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="100 - 500 estudiantes">100 - 500 estudiantes (Plan Cohorte)</option>
                    <option value="500 - 2,500 estudiantes">500 - 2,500 estudiantes (Plan Facultad)</option>
                    <option value="Más de 2,500 estudiantes">Más de 2,500 estudiantes (Plan Campus)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${formId}-notes`} className="block text-slate-300 font-semibold">Comentarios o materias prioritarias (opcional):</label>
                <textarea
                  id={`${formId}-notes`}
                  rows={3}
                  placeholder="Ej: Licencias para estudiantes de primer y segundo semestre de Ingeniería..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#080a14] border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Enviando solicitud...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Solicitar cotización de licencias</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
