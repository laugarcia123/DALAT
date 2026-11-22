"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckCircle2,
  ArrowRight,
  Brain,
  Sparkles,
  Calculator,
  Headphones,
  Calendar,
  Award,
  Folder,
  Users,
  Lock,
} from "lucide-react";

export interface ServiceItem {
  id: string;
  number: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  glowColor: string;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  ctaLabel: string;
  ctaBg: string;
  ctaTextColor: string;
  imgSrc: string;
  imgAlt: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "tutor-ia",
    number: "01",
    badge: "INTELIGENCIA ADAPTATIVA",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-300 border-emerald-500/20",
    accentColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.22)",
    title: "Tutor Socrático IA",
    subtitle: "Simulador de exámenes y resolución guiada paso a paso",
    desc: "Sube tus diapositivas, lecturas escaneadas o guías de estudio. Dalat identifica los conceptos clave para formularte preguntas tipo parcial con retroalimentación instantánea y cero alucinaciones.",
    features: [
      "0% Alucinaciones: estrictamente contextualizado a tus notas",
      "Explicaciones profundas de distractores y opciones erróneas",
    ],
    ctaLabel: "Explorar Simulador",
    ctaBg: "#D5FF37",
    ctaTextColor: "#0b101b",
    imgSrc: "/images/services/recursos.png?v=3",
    imgAlt: "Interfaz de Recursos de Estudio con IA - Dalat",
  },
  {
    id: "cortes-gpa",
    number: "02",
    badge: "ESTRATEGIA CUANTITATIVA",
    badgeBg: "bg-sky-500/10",
    badgeText: "text-sky-300 border-sky-500/20",
    accentColor: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.22)",
    title: "Cortes & GPA Predictivo",
    subtitle: "Algoritmo de cálculo inverso para asegurar tus asignaturas",
    desc: "Simula ponderaciones acumuladas y proyecta con exactitud matemática la nota mínima que necesitas en el examen final para asegurar tu semestre. Elimina la incertidumbre académica.",
    features: [
      "Cálculo inverso: determina la nota meta exacta del Corte 3",
      "Ponderación automática por créditos y syllabus universitario",
      "Alertas de riesgo temprano y proyección acumulada de GPA",
    ],
    ctaLabel: "Calcular mis Notas",
    ctaBg: "#7DD6FF",
    ctaTextColor: "#0b101b",
    imgSrc: "/images/services/asignaturas.png?v=3",
    imgAlt: "Interfaz de Asignaturas, Cortes y Notas - Dalat",
  },
  {
    id: "modo-zen",
    number: "03",
    badge: "ENFOQUE NEURAL",
    badgeBg: "bg-pink-500/10",
    badgeText: "text-pink-300 border-pink-500/20",
    accentColor: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.22)",
    title: "Modo Zen & Frecuencias",
    subtitle: "Concentración profunda sin fatiga cognitiva ni agotamiento",
    desc: "Temporizador Pomodoro adaptativo sincronizado con ondas binaurales alpha y theta. Calibrado científicamente para mantener estados de flujo prolongados y proteger tu salud mental.",
    features: [
      "Ondas acústicas calibradas (Alpha 10Hz y Theta 6Hz)",
      "Temporizador adaptativo según tu curva de fatiga diaria",
      "Métricas de tiempo en flujo sin distracciones",
    ],
    ctaLabel: "Activar Modo Zen",
    ctaBg: "#FFA0B0",
    ctaTextColor: "#0b101b",
    imgSrc: "/images/services/modo-zen.png?v=3",
    imgAlt: "Interfaz de Modo Zen y Temporizador de Enfoque - Dalat",
  },
  {
    id: "boveda-repositorio",
    number: "04",
    badge: "ALMACENAMIENTO INTELIGENTE",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-300 border-amber-500/20",
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.22)",
    title: "Bóveda & Repositorios",
    subtitle: "Almacenamiento personalizado individual y en grupos",
    desc: "Crea repositorios personalizados para guardar, clasificar y acceder a toda tu información académica. Organiza tus apuntes, lecturas y documentos por asignatura, o crea repositorios compartidos en equipo para colaborar en grupo con tus compañeros.",
    features: [
      "Repositorios personalizados para guardar y organizar toda tu información",
      "Espacios compartidos en grupos para proyectos y equipos de estudio",
      "Clasificación inteligente de lecturas, documentos, enlaces y apuntes",
    ],
    ctaLabel: "Abrir Bóveda",
    ctaBg: "#FFA17B",
    ctaTextColor: "#0b101b",
    imgSrc: "/images/services/repositorio.png?v=3",
    imgAlt: "Interfaz de Repositorio y Equipos de Estudio - Dalat",
  },
];

// ============================================================================
// NATIVE VECTOR-CRISP UI MOCKUPS (Calidad 4K / Retina Nativa en Código)
// ============================================================================

function TutorIaMockup() {
  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#0d1426] via-[#090e1c] to-[#070a14] text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-white tracking-tight">Simulador Tipo Parcial • Biología Molecular</div>
            <div className="text-[10px] text-slate-400">Contextualizado a tus diapositivas de clase</div>
          </div>
        </div>
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
          0% Alucinaciones
        </span>
      </div>

      {/* Question Card */}
      <div className="my-auto py-2.5 space-y-2.5">
        <div className="text-xs sm:text-sm text-slate-100 font-medium leading-snug bg-white/[0.03] p-3 rounded-xl border border-white/[0.07] shadow-sm">
          <span className="text-emerald-400 font-bold mr-1.5">P3/10:</span>
          ¿Cuál es la función del gradiente electroquímico de protones en la membrana mitocondrial interna?
        </div>

        {/* Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/35 text-emerald-200 text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-black font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
              <span className="font-medium">A) Impulsa la rotación del rotor F₀ para generar ATP</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline">Correcto (+1.0)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-400 text-xs opacity-75">
            <div className="flex items-center gap-2.5">
              <span className="w-4.5 h-4.5 rounded-full bg-white/[0.08] text-slate-400 text-[10px] flex items-center justify-center shrink-0">B</span>
              <span>B) Oxida directamente el NADH en el espacio intermembrana</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">Distractor</span>
          </div>
        </div>
      </div>

      {/* Socratic Feedback Footer */}
      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
        <span className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Explicación Socrática: La ATP sintasa convierte la fuerza protón-motriz en energía química.</span>
        </span>
        <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">98% Precisión</span>
      </div>
    </div>
  );
}

function CortesGpaMockup() {
  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#0d172c] via-[#091020] to-[#070a14] text-white select-none">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-3 gap-2 border-b border-white/[0.08] pb-3 shrink-0">
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[10px] text-slate-400">Promedio Acumulado</div>
          <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
            <span>4.32</span>
            <span className="text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">+0.25</span>
          </div>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[10px] text-slate-400">Créditos en Curso</div>
          <div className="text-sm sm:text-base font-bold text-sky-400 mt-0.5">18 / 18</div>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25">
          <div className="text-[10px] text-sky-300">Meta Semestre</div>
          <div className="text-sm sm:text-base font-bold text-sky-200 mt-0.5">Beca 100%</div>
        </div>
      </div>

      {/* Main Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-auto py-2">
        {/* Subject 1 */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-white">Química Orgánica</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">4.40</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono">
            <div className="bg-white/[0.04] p-1 rounded">C1: <b className="text-slate-200">4.5</b></div>
            <div className="bg-white/[0.04] p-1 rounded">C2: <b className="text-slate-200">4.3</b></div>
            <div className="bg-sky-500/15 text-sky-300 p-1 rounded border border-sky-500/25">C3: <b>2.8</b></div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Para pasar con 4.0:</span>
            <span className="text-sky-300 font-semibold">Necesitas 2.8</span>
          </div>
        </div>

        {/* Subject 2 */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-white">Cálculo Multivariable</span>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/15 px-1.5 py-0.5 rounded">4.15</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono">
            <div className="bg-white/[0.04] p-1 rounded">C1: <b className="text-slate-200">4.0</b></div>
            <div className="bg-white/[0.04] p-1 rounded">C2: <b className="text-slate-200">4.2</b></div>
            <div className="bg-emerald-500/15 text-emerald-300 p-1 rounded border border-emerald-500/25">C3: <b>3.1</b></div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Para pasar con 4.0:</span>
            <span className="text-emerald-300 font-semibold">Necesitas 3.1</span>
          </div>
        </div>
      </div>

      {/* Predictive Insight Bar */}
      <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/20 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
        <span className="flex items-center gap-1.5 truncate">
          <Calculator className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate">Cálculo inverso activo: Semestre matemáticamente asegurado.</span>
        </span>
        <span className="font-mono font-bold text-sky-400 shrink-0 ml-2">Cero Riesgo</span>
      </div>
    </div>
  );
}

function ModoZenMockup() {
  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#1c0c22] via-[#120817] to-[#070a14] text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-white tracking-tight">Frecuencia Binaural • Enfoque Profundo</div>
            <div className="text-[10px] text-slate-400">Ondas Theta 6Hz calibradas neuroacústicamente</div>
          </div>
        </div>
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 shrink-0">
          En Sesión
        </span>
      </div>

      {/* Big Circular / Radial Timer */}
      <div className="my-auto py-2.5 flex items-center justify-center gap-6 sm:gap-8">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-pink-500/30 flex flex-col items-center justify-center bg-pink-950/20 shadow-[0_0_35px_rgba(236,72,153,0.18)] shrink-0">
          <div className="text-2xl font-bold font-mono text-white tracking-wider">21:40</div>
          <div className="text-[10px] text-pink-300 font-medium">Bloque 3/4</div>
          <div className="absolute inset-0 rounded-full border-2 border-t-pink-400 border-r-pink-400 border-b-transparent border-l-transparent animate-spin [animation-duration:9s]" />
        </div>

        {/* Ambient Settings */}
        <div className="space-y-2 text-left">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] space-y-0.5">
            <div className="text-slate-400 text-[10px]">Paisaje Acústico:</div>
            <div className="text-white font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              Lluvia Suave en Ventana
            </div>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] space-y-0.5">
            <div className="text-slate-400 text-[10px]">Racha de Concentración:</div>
            <div className="text-pink-300 font-bold font-mono">5 Días Consecutivos (8h)</div>
          </div>
        </div>
      </div>

      {/* Footer Indicator */}
      <div className="p-2.5 rounded-xl bg-pink-950/30 border border-pink-500/20 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
        <span className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span className="truncate">Frecuencia anti-fatiga activa: Protege tu retención cognitiva.</span>
        </span>
        <span className="font-mono font-bold text-pink-400 shrink-0 ml-2">Alpha 10Hz</span>
      </div>
    </div>
  );
}

function BovedaHorarioMockup() {
  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#201509] via-[#140d06] to-[#070a14] text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-white tracking-tight">Bóveda de Repositorios Académicos</div>
            <div className="text-[10px] text-slate-400">Espacios personalizados individuales y en grupo</div>
          </div>
        </div>
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
          En la Nube
        </span>
      </div>

      {/* Repositories Cards */}
      <div className="space-y-2.5 my-auto py-2">
        {/* Repo 1: En Grupo */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-xs text-white">Proyecto Final: Arquitectura de Software</span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 shrink-0">
              Grupo (4 miembros)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>16 archivos compartidos • 4 resúmenes sincronizados</span>
            <span className="text-amber-400/90 font-medium hidden sm:inline">Colaborativo</span>
          </div>
        </div>

        {/* Repo 2: Personal */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-xs text-white">Apuntes & Lecturas: Química Orgánica</span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.1] shrink-0">
              Personal
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>28 documentos clasificados • Guías y parciales pasados</span>
            <span className="text-slate-400 font-medium hidden sm:inline">Privado</span>
          </div>
        </div>
      </div>

      {/* Team / Sync Footer */}
      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
        <span className="flex items-center gap-1.5 truncate">
          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Información siempre segura: Guarda, organiza y colabora con tu equipo.</span>
        </span>
        <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">Sincronizado</span>
      </div>
    </div>
  );
}

function NativeServiceMockup({ serviceId }: { serviceId: string }) {
  switch (serviceId) {
    case "tutor-ia":
      return <TutorIaMockup />;
    case "cortes-gpa":
      return <CortesGpaMockup />;
    case "modo-zen":
      return <ModoZenMockup />;
    case "boveda-repositorio":
    case "boveda-horario":
      return <BovedaHorarioMockup />;
    default:
      return <TutorIaMockup />;
  }
}

interface GsapPinnedServicesProps {
  onActionClick?: (serviceId: string) => void;
}

export default function GsapPinnedServices({ onActionClick }: GsapPinnedServicesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const pinnedRightRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const arch = archRef.current;
    const pinnedRight = pinnedRightRef.current;
    const glow = glowRef.current;
    if (!arch || !pinnedRight) return;

    // Use GSAP Context for clean lifecycle in Next.js
    const ctx = gsap.context(() => {
      const imgs = imagesRef.current.filter(Boolean) as HTMLDivElement[];
      if (!imgs.length) return;

      const mm = gsap.matchMedia();

      // DESKTOP: (min-width: 1024px) Pinned mask reveal on scroll
      mm.add("(min-width: 1024px)", () => {
        // Initial setup for clip-path
        gsap.set(imgs, {
          clipPath: "inset(0% 0% 0% 0%)",
          autoAlpha: 1,
        });

        const mainTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: arch,
            start: "top top+=80",
            end: "bottom bottom",
            pin: pinnedRight,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              const idx = Math.min(Math.floor(progress * SERVICES.length), SERVICES.length - 1);
              setActiveIdx(idx);
            },
          },
        });

        imgs.forEach((currentImage, index) => {
          const nextImage = imgs[index + 1];
          if (nextImage) {
            const sectionTimeline = gsap.timeline();

            // Animate glow color
            if (glow) {
              sectionTimeline.to(
                glow,
                {
                  backgroundColor: SERVICES[index + 1].glowColor,
                  duration: 1.5,
                  ease: "power2.inOut",
                },
                0
              );
            }

            // Wipe out current slide cleanly to reveal nextImage below
            sectionTimeline
              .to(
                currentImage,
                {
                  clipPath: "inset(0px 0px 100% 0px)",
                  duration: 1.5,
                  ease: "none",
                },
                0
              )
              .to(
                currentImage,
                {
                  autoAlpha: 0,
                  duration: 0.1,
                  ease: "none",
                },
                1.4
              )
              .fromTo(
                nextImage,
                { scale: 1.03, autoAlpha: 1 },
                {
                  scale: 1.0,
                  autoAlpha: 1,
                  duration: 1.5,
                  ease: "none",
                },
                0
              );

            mainTimeline.add(sectionTimeline);
          }
        });
      });

      // MOBILE: (max-width: 1023px)
      mm.add("(max-width: 1023px)", () => {
        // Mobile uses clean inline cards
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full text-slate-100">
      {/* Container Arch */}
      <div
        ref={archRef}
        className="relative flex flex-col lg:flex-row gap-8 lg:gap-14 justify-between max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Left Column: Scrollable Service Text Blocks */}
        <div className="w-full lg:w-1/2 flex flex-col z-10">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="min-h-[75vh] lg:min-h-[90vh] flex flex-col justify-center py-12 lg:py-20 space-y-6"
            >
              {/* Category Badge & Step */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-mono tracking-wider uppercase px-3 py-1 rounded-full border ${service.badgeBg} ${service.badgeText}`}
                >
                  {service.badge}
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  {service.number} / 04
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold text-white tracking-tight leading-tight">
                  {service.title}
                </h2>
                <p className="text-sm sm:text-base font-semibold text-slate-300">
                  {service.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal max-w-lg">
                {service.desc}
              </p>

              {/* Key Features Bullet List */}
              <div className="space-y-2.5 pt-2 text-xs sm:text-[13px] text-slate-300">
                {service.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: service.accentColor }}
                    />
                    <span className="leading-snug">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Mobile-only image preview beneath each item */}
              <div className="lg:hidden mt-6 rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl bg-[#0c0f1d] flex flex-col ring-1 ring-white/[0.06]">
                {/* Mobile Mockup Header */}
                <div className="h-9 px-3.5 bg-[#080b16] border-b border-white/[0.08] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-300">dalat.app/{service.id}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-200">MÓD {service.number}</span>
                </div>
                {/* Mobile Native Mockup Container (Retina / 4K Vector Crisp) */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#080b16] flex items-center justify-center">
                  <NativeServiceMockup serviceId={service.id} />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] pointer-events-none rounded-b-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Pinned Stack of Images (Desktop) */}
        <div
          ref={pinnedRightRef}
          className="hidden lg:flex w-full lg:w-1/2 h-screen sticky top-20 flex-col justify-center items-center pointer-events-none z-10"
        >
          {/* Ambient Spotlight Glow behind the pinned card */}
          <div
            ref={glowRef}
            className="absolute -inset-10 rounded-full blur-[140px] transition-colors duration-700 pointer-events-none opacity-80"
            style={{ backgroundColor: SERVICES[activeIdx]?.glowColor || "rgba(16, 185, 129, 0.2)" }}
          />

          {/* Browser / App Mockup Window Frame */}
          <div className="relative w-full max-w-[580px] xl:max-w-[640px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border border-white/[0.14] bg-[#0c0f1d] backdrop-blur-2xl flex flex-col ring-1 ring-white/[0.08]">
            {/* Window Title Bar */}
            <div className="h-11 px-4 bg-[#080b16]/95 border-b border-white/[0.08] flex items-center justify-between z-30 shrink-0">
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/50 shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]/50 shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]/50 shadow-sm" />
              </div>

              {/* URL Address Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono text-slate-300 shadow-inner">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-500"
                  style={{ backgroundColor: SERVICES[activeIdx]?.accentColor || "#10b981" }}
                />
                <span className="text-slate-300 font-medium tracking-wide">
                  dalat.app/{SERVICES[activeIdx]?.id}
                </span>
              </div>

              {/* Module Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono font-bold text-slate-200 tracking-wider">
                MÓDULO {SERVICES[activeIdx]?.number}
              </div>
            </div>

            {/* Content Area with Stacked Native Mockups (Retina / 4K Vector Crisp) */}
            <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#080b16] flex items-center justify-center">
              {SERVICES.map((service, index) => {
                const zIndex = SERVICES.length - index;
                return (
                  <div
                    ref={(el) => {
                      imagesRef.current[index] = el;
                    }}
                    key={service.id}
                    className="absolute inset-0 w-full h-full overflow-hidden will-change-[clip-path,transform,opacity] bg-[#080b16]"
                    style={{ zIndex }}
                  >
                    <NativeServiceMockup serviceId={service.id} />
                    {/* Crisp glass rim overlay */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] pointer-events-none rounded-b-2xl" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frame footer indicators */}
          <div className="mt-5 flex items-center gap-2">
            {SERVICES.map((s, idx) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIdx === idx ? "w-8 bg-white" : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
