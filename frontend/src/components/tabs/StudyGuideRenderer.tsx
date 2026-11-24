"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Compass,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Brain,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Layers,
  GraduationCap,
  Target,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { exportStudyGuideToPDF } from "@/lib/pdfExport";

interface StudyGuideRendererProps {
  markdown: string;
  title?: string;
  keyConcepts?: string[];
  activeLight?: boolean;
}

interface ParsedPhase {
  phaseNumber: number | string;
  title: string;
  subtitle?: string;
  content: string;
}

const PHASE_COLORS = [
  {
    badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    badgeLight: "bg-purple-100 text-purple-700 border-purple-200",
    accentBorder: "border-purple-500/30 hover:border-purple-500/50",
    accentLightBorder: "border-purple-200 hover:border-purple-300",
    glow: "from-purple-500/10 to-transparent",
    numberColor: "text-purple-400",
  },
  {
    badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    badgeLight: "bg-cyan-100 text-cyan-700 border-cyan-200",
    accentBorder: "border-cyan-500/30 hover:border-cyan-500/50",
    accentLightBorder: "border-cyan-200 hover:border-cyan-300",
    glow: "from-cyan-500/10 to-transparent",
    numberColor: "text-cyan-400",
  },
  {
    badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    badgeLight: "bg-emerald-100 text-emerald-700 border-emerald-200",
    accentBorder: "border-emerald-500/30 hover:border-emerald-500/50",
    accentLightBorder: "border-emerald-200 hover:border-emerald-300",
    glow: "from-emerald-500/10 to-transparent",
    numberColor: "text-emerald-400",
  },
  {
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    badgeLight: "bg-amber-100 text-amber-700 border-amber-200",
    accentBorder: "border-amber-500/30 hover:border-amber-500/50",
    accentLightBorder: "border-amber-200 hover:border-amber-300",
    glow: "from-amber-500/10 to-transparent",
    numberColor: "text-amber-400",
  },
];

export default function StudyGuideRenderer({
  markdown,
  title,
  keyConcepts,
  activeLight = false,
}: StudyGuideRendererProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [completedPhases, setCompletedPhases] = useState<Record<number, boolean>>({});

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePhaseComplete = (idx: number) => {
    setCompletedPhases((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      if (next[idx]) {
        confetti({ particleCount: 30, spread: 55, origin: { y: 0.7 } });
      }
      return next;
    });
  };

  // Extraer Título Principal si viene con #
  const lines = markdown.split("\n");
  let mainTitle = title || "";
  let introText = "";
  const rawPhases: ParsedPhase[] = [];

  let currentPhase: ParsedPhase | null = null;
  let phaseIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Main header (# ...)
    if (line.startsWith("# ") && !mainTitle) {
      mainTitle = line.replace(/^#\s+/, "").trim();
      continue;
    }

    // Phase / Section Header (### Fase X:... o ### Paso X:... o ## ...)
    const phaseMatch = line.match(/^#{2,3}\s+(?:Fase|Paso|Etapa)\s*(\d+|[A-Za-z]+)\s*[:\-–]?\s*(.*)$/i);
    if (phaseMatch) {
      if (currentPhase) {
        rawPhases.push(currentPhase);
      }
      phaseIndex++;
      const pNum = phaseMatch[1];
      const rawTitle = phaseMatch[2] || `Fase ${pNum}`;
      // Subtitle if parentheses exist: "Simplificación (El Niño de 10 Años)"
      const subMatch = rawTitle.match(/^(.*?)\s*\((.*?)\)$/);
      currentPhase = {
        phaseNumber: pNum,
        title: subMatch ? subMatch[1].trim() : rawTitle.trim(),
        subtitle: subMatch ? subMatch[2].trim() : undefined,
        content: "",
      };
      continue;
    }

    if (currentPhase) {
      currentPhase.content += line + "\n";
    } else {
      // Intro paragraph before first phase
      if (line.trim() && !line.startsWith("#")) {
        introText += line + "\n";
      }
    }
  }

  if (currentPhase) {
    rawPhases.push(currentPhase);
  }

  const isStructuredPhases = rawPhases.length >= 2;

  // Descargar PDF de forma directa a la computadora (sin ventana de impresión)
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.75 } });

    try {
      await exportStudyGuideToPDF({
        title: mainTitle || "Guía de Estudio Especializada",
        introText,
        phases: rawPhases,
        keyConcepts,
        markdownFallback: markdown,
      });
    } catch (err) {
      console.error("Error al exportar PDF de la guía:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Custom Markdown Components for clean rendering
  const customMarkdownComponents = {
    p: ({ children }: any) => (
      <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
        {children}
      </p>
    ),
    strong: ({ children }: any) => (
      <strong className={`font-semibold ${activeLight ? "text-purple-900 bg-purple-50 px-1 rounded" : "text-purple-200 bg-purple-500/10 px-1 py-0.5 rounded border border-purple-500/20"}`}>
        {children}
      </strong>
    ),
    ol: ({ children }: any) => (
      <ol className="space-y-2.5 my-3 pl-1">
        {children}
      </ol>
    ),
    ul: ({ children }: any) => (
      <ul className="space-y-2 my-3 pl-1">
        {children}
      </ul>
    ),
    li: ({ children }: any) => (
      <li className={`flex items-start gap-2 text-xs sm:text-sm leading-relaxed ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
        <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${activeLight ? "bg-purple-600" : "bg-purple-400"}`} />
        <span className="flex-1">{children}</span>
      </li>
    ),
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* ========================================================================= */}
      {/* 1. HEADER HERO BANNER                                                     */}
      {/* ========================================================================= */}
      <div
        className={`p-6 sm:p-7 rounded-3xl border relative overflow-hidden transition-all shadow-sm ${
          activeLight
            ? "bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/70 border-purple-200/90 text-slate-900"
            : "bg-gradient-to-br from-[#121630] via-[#0d1024] to-[#080a18] border-purple-500/25 text-white"
        }`}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 border ${
                activeLight
                  ? "bg-purple-100 text-purple-700 border-purple-200"
                  : "bg-purple-500/20 text-purple-300 border-purple-500/30"
              }`}>
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>Ruta de Aprendizaje Activo</span>
              </span>
              <span className={`text-xs ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                • Paso a Paso
              </span>
            </div>

            <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
              {mainTitle || "Guía de Estudio Especializada"}
            </h3>

            {introText.trim() && (
              <div className={`text-xs sm:text-sm leading-relaxed max-w-3xl pt-1 ${
                activeLight ? "text-slate-600" : "text-slate-300"
              }`}>
                <ReactMarkdown components={customMarkdownComponents}>
                  {introText}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action Download / Copy Buttons */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border shadow-sm ${
                activeLight
                  ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-purple-600/20"
                  : "bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-purple-900/30"
              }`}
              title="Descargar guía completa en PDF con formato y diseño"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>

            {/* Botón secundario para copiar al portapapeles si lo necesita */}
            <button
              type="button"
              onClick={handleCopy}
              className={`p-2.5 rounded-2xl text-xs font-medium transition cursor-pointer border ${
                activeLight
                  ? "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                  : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border-white/10"
              }`}
              title={copied ? "¡Guía copiada!" : "Copiar texto"}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-purple-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STRUCTURED ROADMAP / PHASES (Paso a Paso)                              */}
      {/* ========================================================================= */}
      {isStructuredPhases ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Etapas de Dominio Conceptual ({rawPhases.length} fases)</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Marca las fases completadas al estudiar
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rawPhases.map((phase, idx) => {
              const colorTheme = PHASE_COLORS[idx % PHASE_COLORS.length];
              const isDone = Boolean(completedPhases[idx]);

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 relative overflow-hidden group ${
                    isDone
                      ? activeLight
                        ? "bg-emerald-50/60 border-emerald-200/80 opacity-90"
                        : "bg-emerald-950/20 border-emerald-500/30 opacity-90"
                      : activeLight
                      ? `bg-white ${colorTheme.accentLightBorder} shadow-sm shadow-slate-100`
                      : `bg-[#0a0d1e] ${colorTheme.accentBorder} shadow-md shadow-black/40`
                  }`}
                >
                  {/* Subtle Glow Header */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorTheme.glow} pointer-events-none`} />

                  {/* Phase Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wide uppercase border flex items-center gap-1.5 ${
                          activeLight ? colorTheme.badgeLight : colorTheme.badgeBg
                        }`}
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Fase {phase.phaseNumber}</span>
                      </span>

                      <div>
                        <h4 className={`text-sm sm:text-base font-bold ${
                          activeLight ? "text-slate-900" : "text-white"
                        }`}>
                          {phase.title}
                        </h4>
                        {phase.subtitle && (
                          <span className={`text-[11px] font-medium block ${
                            activeLight ? "text-purple-700" : "text-purple-300"
                          }`}>
                            {phase.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      onClick={() => togglePhaseComplete(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                        isDone
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                          : activeLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]"
                      }`}
                      title={isDone ? "Completado" : "Marcar como estudiado"}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? "text-white" : "text-slate-400"}`} />
                      <span className="hidden sm:inline">{isDone ? "Dominado" : "Marcar hecho"}</span>
                    </button>
                  </div>

                  {/* Phase Body Markdown */}
                  <div className={`pl-1 pt-1 ${isDone ? "line-through opacity-75" : ""}`}>
                    <ReactMarkdown components={customMarkdownComponents}>
                      {phase.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Fallback for regular summaries without phases */
        <div
          className={`p-6 sm:p-7 rounded-2xl border font-sans leading-relaxed ${
            activeLight
              ? "bg-white border-slate-200 text-slate-800 shadow-xs"
              : "bg-[#090b16] border-[#161a2e] text-slate-200 shadow-lg"
          }`}
        >
          <ReactMarkdown components={customMarkdownComponents}>
            {markdown}
          </ReactMarkdown>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONCEPTOS CLAVE PARA EL PARCIAL (Pills con diseño premium)             */}
      {/* ========================================================================= */}
      {keyConcepts && keyConcepts.length > 0 && (
        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            activeLight
              ? "bg-purple-50/50 border-purple-100"
              : "bg-[#0b0e22] border-purple-500/20"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${
              activeLight ? "text-slate-800" : "text-white"
            }`}>
              Conceptos Clave para el Parcial
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {keyConcepts.map((concept, idx) => (
              <span
                key={idx}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5 select-none ${
                  activeLight
                    ? "bg-white hover:bg-purple-100 text-purple-900 border-purple-200 shadow-xs"
                    : "bg-[#131733] hover:bg-[#1a2048] text-purple-200 border-purple-500/30 shadow-sm"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>{concept}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
