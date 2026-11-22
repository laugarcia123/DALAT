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

interface InstitutionalPricingCardProps {
  title: string;
  badge?: string;
  desc: string;
  strikethroughPrice?: string;
  price: string;
  period: string;
  subnote?: string;
  features: string[];
  buttonText: string;
  onAction: () => void;
}

function InstitutionalPricingCard({
  title,
  badge,
  desc,
  strikethroughPrice,
  price,
  period,
  subnote,
  features,
  buttonText,
  onAction,
}: InstitutionalPricingCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-7 sm:p-8 flex flex-col justify-between space-y-7 border border-white/[0.08] bg-[#090a0f] hover:border-purple-500/60 hover:bg-[#0c0d18] hover:shadow-2xl hover:shadow-purple-950/30 transition-all duration-300">
      {/* Background blueprint grid + soft purple aurora glow on hover */}
      <div
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 15%, rgba(168, 85, 247, 0.32), transparent 55%), radial-gradient(circle at 15% 45%, rgba(139, 92, 246, 0.28), transparent 50%), radial-gradient(circle at 60% 85%, rgba(217, 70, 239, 0.20), transparent 55%), radial-gradient(circle at 30% 90%, rgba(99, 102, 241, 0.22), transparent 50%), linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%, 24px 24px, 24px 24px",
        }}
      >
        {/* Luminous soft aurora light sheets (no lines, pure organic glow) */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl opacity-80" />
        <div className="absolute top-1/4 -left-20 w-80 h-56 bg-fuchsia-600/20 rounded-[100%] blur-3xl opacity-75 rotate-12" />
        <div className="absolute -bottom-16 right-10 w-64 h-64 bg-violet-500/25 rounded-full blur-3xl opacity-80" />
        <div className="absolute bottom-10 -left-10 w-60 h-60 bg-indigo-600/25 rounded-full blur-3xl opacity-70" />
      </div>

      {/* Soft wave auras that smoothly fade in without oversaturating */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-600/25 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

      {/* Foreground Content */}
      <div className="relative z-10 space-y-6">
        {/* Header: Title + Badge */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white border border-white/10 tracking-wide">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mt-2 min-h-[38px]">
            {desc}
          </p>
        </div>

        {/* Price Row */}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            {strikethroughPrice && (
              <span className="text-sm font-semibold text-zinc-500 line-through">
                {strikethroughPrice}
              </span>
            )}
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {price}
            </span>
            <span className="text-xs text-zinc-400 font-normal">{period}</span>
          </div>
          {subnote && (
            <p className="text-[11px] text-zinc-400 mt-1 font-medium">{subnote}</p>
          )}
        </div>

        {/* Minimalist Checklist with clean subtle checkmarks */}
        <ul className="space-y-3 pt-2 text-xs sm:text-[13px] text-zinc-300">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <svg
                className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="leading-tight">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button: Dark outline by default, solid white button on hover */}
      <div className="relative z-10 pt-2">
        <button
          type="button"
          onClick={onAction}
          className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 border border-white/15 bg-white/[0.03] text-white group-hover:bg-white group-hover:text-zinc-950 group-hover:font-bold group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-white/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

export default function InstitutionalPage({
  onEnterApp,
  onGoToPricing,
}: InstitutionalPageProps) {
  void onEnterApp;
  void onGoToPricing;

  const formId = useId();
  const [billingPeriod, setBillingPeriod] = useState<"semestre" | "anual">("semestre");

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

      {/* 2. PRECIOS POR VOLUMEN DE ESTUDIANTES (COP) */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-white/[0.05] text-slate-400 border border-white/[0.06] inline-block font-bold">
            TARIFAS INSTITUCIONALES EN PESOS COLOMBIANOS
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
            Precios por volumen de estudiantes
          </h2>
          <p className="text-xs text-slate-400">
            Tarifas preferenciales en COP para otorgar licencias masivas a cohortes, facultades o al campus completo.
          </p>

          {/* Billing Switcher with "Más comprada" highlight */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex p-1 rounded-xl bg-[#0c0f1c] border border-white/[0.08] text-xs font-semibold gap-1">
              <button
                type="button"
                onClick={() => setBillingPeriod("semestre")}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  billingPeriod === "semestre"
                    ? "bg-[#7c3aed] text-white font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Por Semestre (6 meses)
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod("anual")}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  billingPeriod === "anual"
                    ? "bg-[#7c3aed] text-white font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Por Año Académico</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                  Más comprada • Ahorra 25%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid - Dark SaaS style, uniform resting appearance, soft purple waves on hover */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Plan Cohorte (100 - 500 alumnos) */}
          <InstitutionalPricingCard
            title="Plan Cohorte"
            badge="100 a 500 alumnos"
            desc="Para programas académicos específicos o materias filtro con alta exigencia."
            strikethroughPrice={billingPeriod === "semestre" ? "$24.900" : "$39.900"}
            price={billingPeriod === "semestre" ? "$9.900" : "$14.900"}
            period={billingPeriod === "semestre" ? "COP / alumno / sem" : "COP / alumno / año"}
            subnote={
              billingPeriod === "semestre"
                ? "Ahorro del 60% vs plan individual"
                : "Ahorro del 62% • Opción anual más comprada"
            }
            features={[
              "Acceso Pro total para cada estudiante",
              "Simulador de parciales ilimitado desde PDFs",
              "Activación masiva por lista de correos",
              "Soporte prioritario a estudiantes",
              "Cero renovaciones forzadas automáticas",
            ]}
            buttonText="Cotizar Plan Cohorte"
            onAction={() => scrollToQuote("100 - 500 estudiantes")}
          />

          {/* Card 2: Plan Facultad (500 - 2.500 alumnos) */}
          <InstitutionalPricingCard
            title="Plan Facultad"
            badge={billingPeriod === "anual" ? "Más comprada" : "500 a 2.500 alumnos"}
            desc="Cobertura completa para facultades enteras (Ingeniería, Salud, Ciencias, Derecho)."
            strikethroughPrice={billingPeriod === "semestre" ? "$24.900" : "$29.900"}
            price={billingPeriod === "semestre" ? "$6.900" : "$10.900"}
            period={billingPeriod === "semestre" ? "COP / alumno / sem" : "COP / alumno / año"}
            subnote={
              billingPeriod === "semestre"
                ? "Ahorro del 72% vs plan individual"
                : "Opción más comprada por facultades • Ahorro 73%"
            }
            features={[
              "Todo lo del Plan Cohorte incluido",
              "Activación automática con correo @universidad.edu",
              "Bóvedas compartidas para grupos de estudio",
              "Procesamiento prioritario en el motor de IA",
              "Onboarding guiado para representantes",
            ]}
            buttonText="Cotizar Plan Facultad"
            onAction={() => scrollToQuote("500 - 2,500 estudiantes")}
          />

          {/* Card 3: Plan Campus Global (+2.500 alumnos) */}
          <InstitutionalPricingCard
            title="Plan Campus Global"
            badge="Más de 2.500 alumnos"
            desc="Licenciamiento universal para toda la universidad con tarifa plana preferencial."
            price="Convenio COP"
            period="/ campus completo"
            subnote="Tarifa personalizada según el tamaño total de la matrícula"
            features={[
              "Licencias ilimitadas para todo el estudiantado",
              "Integración de acceso único (Google / Microsoft SSO)",
              "Facturación institucional con orden de compra",
              "Gestor de cuenta institucional dedicado",
              "Activación instantánea para nuevos ingresos",
            ]}
            buttonText="Cotizar Plan Campus"
            onAction={() => scrollToQuote("Más de 2,500 estudiantes")}
          />
        </div>
      </section>

      {/* 3. QUÉ INCLUYE EL PLAN PARA LOS ESTUDIANTES */}
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
