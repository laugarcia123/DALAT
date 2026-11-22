"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Minus
} from "lucide-react";
import { SelectedPlan } from "./CheckoutPage";

export type PricingMode = "micros" | "mensual-anual";

interface PricingSectionProps {
  onChoosePlan: (plan: SelectedPlan) => void;
  onEnterApp: () => void;
  onGoToInstitutions?: () => void;
}

interface ComparisonRow {
  name: string;
  basic: string | boolean;
  pro: string | boolean;
  annual: string | boolean;
}

interface ComparisonCategory {
  title: string;
  rows: ComparisonRow[];
}

const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    title: "Inteligencia Artificial Socrática & Parciales",
    rows: [
      {
        name: "Generación de exámenes tipo parcial desde PDFs",
        basic: "3 pruebas",
        pro: "Ilimitado",
        annual: "Ilimitado",
      },
      {
        name: "Soporte para fórmulas científicas y KaTeX",
        basic: true,
        pro: true,
        annual: true,
      },
      {
        name: "Cero alucinaciones: citado exacto a tus notas",
        basic: false,
        pro: true,
        annual: true,
      },
      {
        name: "Flashcards automáticas con Spaced Repetition",
        basic: false,
        pro: true,
        annual: true,
      },
    ],
  },
  {
    title: "Seguimiento de Cortes & GPA Predictivo",
    rows: [
      {
        name: "Cálculo inverso de nota meta para Corte 3",
        basic: false,
        pro: true,
        annual: true,
      },
      {
        name: "Ponderación de créditos y syllabus universitario",
        basic: "Básica",
        pro: "Avanzada",
        annual: "Avanzada",
      },
      {
        name: "Materias y asignaturas activas",
        basic: "Hasta 3",
        pro: "Ilimitadas",
        annual: "Ilimitadas",
      },
      {
        name: "Alertas tempranas de riesgo de reprobación",
        basic: false,
        pro: true,
        annual: true,
      },
    ],
  },
  {
    title: "Modo Zen & Concentración",
    rows: [
      {
        name: "Temporizador Pomodoro adaptativo a fatiga",
        basic: true,
        pro: true,
        annual: true,
      },
      {
        name: "Ondas binaurales calibradas (Alpha 10Hz & Theta 6Hz)",
        basic: "1 pista",
        pro: "Biblioteca completa",
        annual: "Biblioteca completa",
      },
      {
        name: "Bóvedas compartidas para grupos de estudio",
        basic: false,
        pro: "Hasta 3 bóvedas",
        annual: "Ilimitadas",
      },
    ],
  },
  {
    title: "Condiciones y Medios de Pago",
    rows: [
      {
        name: "Sin renovación forzada (vence solo)",
        basic: true,
        pro: "En Pases Micro",
        annual: "Cancela en 1 clic",
      },
      {
        name: "Medios de pago colombianos (PSE, Nequi, Daviplata)",
        basic: "—",
        pro: true,
        annual: true,
      },
      {
        name: "Descuento por anticipo",
        basic: false,
        pro: false,
        annual: "28% de Ahorro",
      },
    ],
  },
];

interface PricingCardProps {
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

// Minimalist Dark SaaS Card with soft purple aurora on hover
function PricingCard({
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
}: PricingCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl p-6 sm:px-7 sm:pt-7 sm:pb-6 flex flex-col justify-between border border-white/[0.12] bg-[#0c0f22] hover:border-purple-400/80 hover:shadow-[0_0_40px_rgba(168,85,247,0.30)] transition-all duration-300">
      {/* Full-bleed luminous hover background that seamlessly covers 100% of the card to the bottom edge */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl overflow-hidden bg-gradient-to-b from-[#241148] via-[#160c30] to-[#25104a]">
        {/* Luminous radial ambient glows (top, center and bottom) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.45), transparent 65%), radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.50), transparent 65%), radial-gradient(circle at 85% 45%, rgba(217, 70, 239, 0.30), transparent 55%), radial-gradient(circle at 15% 55%, rgba(124, 58, 237, 0.30), transparent 55%)",
          }}
        />

        {/* Blueprint grid that runs uniformly across 100% of height and width */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.055) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 space-y-5">
        {/* Header: Title + Badge */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h3>
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

        {/* Price Row: Clean inline typography without bulky boxes */}
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

      {/* Action Button: Dark outline by default, turns solid white on hover */}
      <div className="relative z-10 pt-4">
        <button
          type="button"
          onClick={onAction}
          className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 border border-white/15 bg-white/[0.04] text-white group-hover:bg-white group-hover:text-zinc-950 group-hover:font-bold group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-purple-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

export default function PricingSection({
  onChoosePlan,
  onEnterApp,
  onGoToInstitutions,
}: PricingSectionProps) {
  void onGoToInstitutions;
  const [pricingMode, setPricingMode] = useState<PricingMode>("micros");

  return (
    <div className="animate-in fade-in duration-300 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* 1. Header & Switcher */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-editorial font-bold text-white tracking-tight leading-tight">
          Planes flexibles a la medida de tu semestre
        </h2>

        {/* Minimalist Switcher: Microsuscripciones vs Mensual / Anual */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex p-1 rounded-xl bg-zinc-900/80 border border-white/[0.08] shadow-inner gap-1">
            <button
              type="button"
              onClick={() => setPricingMode("micros")}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                pricingMode === "micros"
                  ? "bg-white/[0.1] text-white shadow-sm border border-white/[0.1]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Microsuscripciones</span>
            </button>

            <button
              type="button"
              onClick={() => setPricingMode("mensual-anual")}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                pricingMode === "mensual-anual"
                  ? "bg-white/[0.1] text-white shadow-sm border border-white/[0.1]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Mensual / Anual</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 font-extrabold uppercase tracking-wide">
                -28%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three Clean Cards matching the user's reference design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pb-3">
        {/* ===================== MODE: MICROSUSCRIPCIONES ===================== */}
        {pricingMode === "micros" && (
          <>
            {/* Card 1: Básico */}
            <PricingCard
              title="Básico"
              desc="Organización esencial para estudiantes que dan sus primeros pasos en Dalat."
              price="$0"
              period="COP / gratis"
              subnote="Sin tarjeta • Activo para siempre"
              features={[
                "Tablero de tareas Kanban ilimitado",
                "Horario dinámico de materias",
                "Temporizador Pomodoro y método Feynman",
                "Hasta 3 materias activas simultáneas",
                "3 simulacros de examen con IA",
              ]}
              buttonText="Comenzar gratis"
              onAction={onEnterApp}
            />

            {/* Card 2: Pase Sprint (1 Semana) */}
            <PricingCard
              title="Pase Sprint"
              desc="Ideal para salvar la semana de parciales y exámenes intensivos sin ataduras."
              strikethroughPrice="$14.900"
              price="$8.900"
              period="COP / pago único (7 días)"
              subnote="Sin renovación forzada: vence automáticamente"
              features={[
                "7 días de acceso Pro total a todas las funciones",
                "40 créditos de IA para exámenes, flashcards y resúmenes",
                "Opción 1 y Opción 2 de optimización pedagógica",
                "Acceso completo al Método Psicópata (Muerte Súbita)",
                "Cero alucinaciones con cita directa de tus notas",
              ]}
              buttonText="Elegir Pase 1 Semana"
              onAction={() =>
                onChoosePlan({
                  name: "Pase Sprint • 1 Semana",
                  price: "$8.900",
                  period: "COP / 7 días (Pago único)",
                  badge: "Semana de Parciales",
                  features: [
                    "7 días de acceso Pro total a todas las funciones",
                    "40 créditos de IA para exámenes, flashcards y resúmenes",
                    "Opción 1 y Opción 2 de optimización pedagógica",
                    "Acceso completo al Método Psicópata (Muerte Súbita)",
                    "Sin renovación forzada: vence automáticamente",
                  ],
                })
              }
            />

            {/* Card 3 (Featured): Pase Corte (2 Semanas) */}
            <PricingCard
              title="Pase Corte"
              badge="Más popular"
              desc="Para asegurar dos materias consecutivas o cerrar el semestre con calma."
              strikethroughPrice="$24.900"
              price="$15.900"
              period="COP / pago único (14 días)"
              subnote="Equivale a solo $1.135 COP al día • 14 días corridos"
              features={[
                "14 días continuos de preparación intensiva Pro",
                "80 créditos de IA para exámenes, flashcards y guías",
                "Opción 1 y Opción 2 de optimización pedagógica",
                "Acceso total al Método Psicópata (Muerte Súbita)",
                "2 GB de almacenamiento en tus repositorios",
              ]}
              buttonText="Elegir Pase 2 Semanas"
              onAction={() =>
                onChoosePlan({
                  name: "Pase Corte • 2 Semanas",
                  price: "$15.900",
                  period: "COP / 14 días (Pago único)",
                  badge: "Corte Académico",
                  features: [
                    "14 días continuos de preparación intensiva Pro",
                    "80 créditos de IA para exámenes, flashcards y guías",
                    "Opción 1 y Opción 2 de optimización pedagógica",
                    "Acceso total al Método Psicópata (Muerte Súbita)",
                    "2 GB de almacenamiento en tus repositorios",
                  ],
                })
              }
            />
          </>
        )}

        {/* ===================== MODE: MENSUAL / ANUAL ===================== */}
        {pricingMode === "mensual-anual" && (
          <>
            {/* Card 1: Básico */}
            <PricingCard
              title="Básico"
              desc="Organización esencial para estudiantes que dan sus primeros pasos en Dalat."
              price="$0"
              period="COP / gratis"
              subnote="Sin tarjeta • Activo para siempre"
              features={[
                "Tablero de tareas Kanban ilimitado",
                "Horario dinámico de materias",
                "Temporizador Pomodoro y método Feynman",
                "Hasta 3 materias activas simultáneas",
                "Acceso a repositorios básicos",
              ]}
              buttonText="Tu Plan Actual"
              onAction={onEnterApp}
            />

            {/* Card 2: Pro Mensual */}
            <PricingCard
              title="Dalat PRO Mensual"
              badge="Más elegido"
              desc="Potencia total de IA y predictibilidad académica mes a mes con 150 créditos."
              strikethroughPrice="$29.900"
              price="$19.900"
              period="COP / mes"
              subnote="Cancela en cualquier momento en 1 clic"
              features={[
                "150 créditos al mes para exámenes, flashcards, resúmenes y guías",
                "Opción 1 y Opción 2 de optimización pedagógica",
                "Acceso total al Método Psicópata (Muerte Súbita)",
                "2 GB de almacenamiento en tus repositorios",
                "Soporte de pagos con Nequi, PSE y Tarjeta de Crédito",
              ]}
              buttonText="Elegir Plan Mensual"
              onAction={() =>
                onChoosePlan({
                  name: "Dalat PRO Mensual",
                  price: "$19.900",
                  period: "COP / mes",
                  badge: "Acceso Total",
                  features: [
                    "150 créditos al mes para exámenes, flashcards, resúmenes y guías",
                    "Opción 1 optimizada para cualquier materia (1 token / recurso)",
                    "Opción 2 especializada en trabajos matemáticos y física",
                    "Acceso total al Método Psicópata (Muerte Súbita)",
                    "2 GB de almacenamiento en tus repositorios",
                    "Soporte de pagos con Nequi, PSE y Tarjeta de Crédito",
                  ],
                })
              }
            />

            {/* Card 3 (Featured): Pro Anual */}
            <PricingCard
              title="Dalat PRO Anual"
              badge="Ahorra 28% • 3 Meses Gratis"
              desc="El plan definitivo con 3 meses gratis para asegurar todo tu año académico."
              strikethroughPrice="$298.800"
              price="$17.900"
              period="COP / mes"
              subnote="Facturado $214.800 COP al año (Ahorras $84.000 COP)"
              features={[
                "12 meses completos de acceso Pro total (3 meses gratis)",
                "150 créditos al mes renovables",
                "Opción 1 y Opción 2 de optimización pedagógica",
                "Acceso total al Método Psicópata y simuladores de exámenes",
                "2 GB de almacenamiento en repositorios",
                "Soporte prioritario 24/7 y acceso anticipado",
              ]}
              buttonText="Elegir Plan Anual"
              onAction={() =>
                onChoosePlan({
                  name: "Dalat PRO Anual",
                  price: "$214.800",
                  period: "COP / año ($17.900 / mes)",
                  badge: "Ahorra 28% • 3 Meses Gratis",
                  features: [
                    "12 meses completos de acceso Pro total (3 meses gratis)",
                    "150 créditos al mes renovables",
                    "Opción 1 y Opción 2 de optimización pedagógica",
                    "Acceso total al Método Psicópata (Muerte Súbita)",
                    "2 GB de almacenamiento en repositorios",
                    "Soporte prioritario 24/7",
                  ],
                })
              }
            />
          </>
        )}
      </div>

      {/* Footer bar matching reference image */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>Pagos 100% seguros en Colombia: PSE, Nequi, Daviplata, Tarjetas Débito y Crédito.</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
          Sin cláusula de permanencia &bull; Cancela en 1 clic
        </div>
      </div>

      {/* 3. Feature Comparison Matrix / Tabla Comparativa */}
      <div className="pt-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 inline-block font-semibold">
            DESGLOSE DETALLADO
          </span>
          <h3 className="text-2xl sm:text-4xl font-editorial font-bold text-white tracking-tight">
            Comparativa completa de características
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Revisa exactamente qué incluye cada plan y escoge el que mejor se ajuste a tus materias y exámenes.
          </p>
        </div>

        {/* Responsive Table Container */}
        <div
          className="relative z-20 overflow-x-auto rounded-2xl border border-white/[0.12] shadow-2xl -mx-2 sm:mx-0"
          style={{ backgroundColor: "#0c0f22" }}
        >
          <table className="w-full text-left border-collapse min-w-[620px]" style={{ backgroundColor: "#0c0f22" }}>
            {/* Table Header */}
            <thead>
              <tr className="border-b border-white/[0.1] bg-[#111630]" style={{ backgroundColor: "#111630" }}>
                <th className="py-5 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 w-2/5">
                  Módulos y Capacidades
                </th>
                <th className="py-5 px-4 text-center w-1/5">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                    Básico
                  </span>
                  <span className="text-sm font-bold text-white block mt-0.5">$0 COP</span>
                </th>
                <th className="py-5 px-4 text-center w-1/5 bg-[#171438] border-x border-purple-500/25" style={{ backgroundColor: "#171438" }}>
                  <span className="text-xs font-mono uppercase tracking-wider text-purple-400 block font-bold">
                    Pro (Micro / Mensual)
                  </span>
                  <span className="text-sm font-bold text-white block mt-0.5">Desde $8.900</span>
                </th>
                <th className="py-5 px-4 text-center w-1/5">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                    Pro Anual
                  </span>
                  <span className="text-sm font-bold text-white block mt-0.5">$17.900 / mes</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06] text-xs">
              {COMPARISON_CATEGORIES.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  <tr className="bg-[#141938]" style={{ backgroundColor: "#141938" }}>
                    <td
                      colSpan={4}
                      className="py-3 px-6 text-[11px] font-mono uppercase tracking-widest text-indigo-300 font-bold bg-[#141938]"
                    >
                      {cat.title}
                    </td>
                  </tr>
                  {cat.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-[#131835] transition-colors bg-[#0c0f22]"
                      style={{ backgroundColor: "#0c0f22" }}
                    >
                      <td className="py-3.5 px-6 text-zinc-200">
                        {row.name}
                      </td>

                      {/* Col 1: Básico */}
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.basic === "boolean" ? (
                          row.basic ? (
                            <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-400" />
                          ) : (
                            <Minus className="w-4 h-4 mx-auto text-zinc-600" />
                          )
                        ) : (
                          <span className={row.basic === "Básica" ? "text-zinc-300" : "text-zinc-400"}>
                            {row.basic}
                          </span>
                        )}
                      </td>

                      {/* Col 2: Pro */}
                      <td className="py-3.5 px-4 text-center bg-[#151330] border-x border-purple-500/25" style={{ backgroundColor: "#151330" }}>
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-400" />
                          ) : (
                            <Minus className="w-4 h-4 mx-auto text-zinc-600" />
                          )
                        ) : (
                          <span
                            className={
                              row.pro === "Ilimitado" || row.pro === "Ilimitadas" || row.pro === "Biblioteca completa"
                                ? "text-emerald-400 font-bold"
                                : row.pro === "En Pases Micro"
                                ? "text-emerald-400 font-medium"
                                : "text-emerald-400 font-semibold"
                            }
                          >
                            {row.pro}
                          </span>
                        )}
                      </td>

                      {/* Col 3: Pro Anual */}
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.annual === "boolean" ? (
                          row.annual ? (
                            <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-400" />
                          ) : (
                            <Minus className="w-4 h-4 mx-auto text-zinc-600" />
                          )
                        ) : (
                          <span
                            className={
                              row.annual === "Ilimitado" ||
                              row.annual === "Ilimitadas" ||
                              row.annual === "Biblioteca completa" ||
                              row.annual === "28% de Ahorro"
                                ? "text-emerald-400 font-bold"
                                : row.annual === "Avanzada"
                                ? "text-emerald-400 font-semibold"
                                : "text-zinc-300"
                            }
                          >
                            {row.annual}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
