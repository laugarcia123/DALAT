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

  // Descargar PDF con el formato y diseño idéntico de la página
  const handleDownloadPDF = () => {
    setIsDownloading(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.75 } });

    const cleanTitle = (mainTitle || "Guia_de_Estudio_Dalat")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");

    const pdfDocumentTitle = `Guia_Estudio_${cleanTitle}`;

    const PHASE_PRINT_THEMES = [
      {
        badgeBg: "#f3e8ff",
        badgeColor: "#7e22ce",
        borderColor: "#d8b4fe",
        topBorder: "#9333ea",
        subColor: "#6b21a8",
      },
      {
        badgeBg: "#cffafe",
        badgeColor: "#0e7490",
        borderColor: "#67e8f9",
        topBorder: "#06b6d4",
        subColor: "#0891b2",
      },
      {
        badgeBg: "#d1fae5",
        badgeColor: "#047857",
        borderColor: "#6ee7b7",
        topBorder: "#10b981",
        subColor: "#059669",
      },
      {
        badgeBg: "#fef3c7",
        badgeColor: "#b45309",
        borderColor: "#fde68a",
        topBorder: "#f59e0b",
        subColor: "#d97706",
      },
    ];

    const formatPrintMarkdown = (txt: string) => {
      if (!txt) return "";
      let html = txt
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="highlight-pill">$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

      const rawLines = html.split("\n");
      let inList = false;
      let result = "";

      for (const l of rawLines) {
        const trimmed = l.trim();
        if (!trimmed) {
          if (inList) {
            result += "</ul>";
            inList = false;
          }
          continue;
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
          if (!inList) {
            result += "<ul class='print-list'>";
            inList = true;
          }
          const itemText = trimmed.replace(/^(?:[-*]|\d+\.)\s+/, "");
          result += `<li><span class='bullet-dot'></span><span>${itemText}</span></li>`;
        } else {
          if (inList) {
            result += "</ul>";
            inList = false;
          }
          result += `<p class='print-p'>${trimmed}</p>`;
        }
      }

      if (inList) {
        result += "</ul>";
      }

      return result;
    };

    const phasesHtml = rawPhases.map((phase, idx) => {
      const theme = PHASE_PRINT_THEMES[idx % PHASE_PRINT_THEMES.length];
      const isDone = Boolean(completedPhases[idx]);

      return `
        <div class="phase-card" style="border-top: 3.5px solid ${theme.topBorder}; border-color: ${theme.borderColor};">
          <div class="phase-header">
            <div class="phase-badge-title">
              <span class="phase-badge" style="background: ${theme.badgeBg}; color: ${theme.badgeColor}; border: 1px solid ${theme.borderColor};">
                FASE ${phase.phaseNumber}
              </span>
              <div>
                <h3 class="phase-title">${phase.title}</h3>
                ${phase.subtitle ? `<span class="phase-subtitle" style="color: ${theme.subColor};">${phase.subtitle}</span>` : ""}
              </div>
            </div>
            <div class="phase-status">
              <span class="status-pill ${isDone ? "status-done" : "status-pending"}">
                ${isDone ? "✓ Dominado" : "○ Por estudiar"}
              </span>
            </div>
          </div>
          <div class="phase-body">
            ${formatPrintMarkdown(phase.content)}
          </div>
        </div>
      `;
    }).join("");

    const conceptsHtml = keyConcepts && keyConcepts.length > 0 ? `
      <div class="concepts-box">
        <div class="concepts-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
          <span>CONCEPTOS CLAVE PARA EL PARCIAL</span>
        </div>
        <div class="concepts-grid">
          ${keyConcepts.map(c => `<span class="concept-pill"><span class="concept-dot"></span>${c}</span>`).join("")}
        </div>
      </div>
    ` : "";

    const dateStr = new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());

    const printableHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${pdfDocumentTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    @page {
      size: A4;
      margin: 14mm 16mm 14mm 16mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
    }

    .doc-container {
      max-width: 100%;
      margin: 0 auto;
    }

    /* BRAND TOP BAR */
    .brand-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 16px;
      border-bottom: 1.5px solid #f1f5f9;
    }
    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-logo-icon {
      width: 26px;
      height: 26px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 14px;
    }
    .brand-title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-left: 6px;
      padding-left: 6px;
      border-left: 1px solid #cbd5e1;
    }
    .brand-date {
      font-size: 11px;
      color: #64748b;
      text-transform: capitalize;
    }

    /* HERO BANNER */
    .hero-banner {
      background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 50%, #eef2ff 100%);
      border: 1.5px solid #e9d5ff;
      border-radius: 20px;
      padding: 22px 24px;
      margin-bottom: 24px;
      position: relative;
    }
    .badge-route {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f3e8ff;
      color: #6b21a8;
      border: 1px solid #d8b4fe;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .hero-title {
      font-size: 21px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
      margin: 0 0 10px 0;
      letter-spacing: -0.4px;
    }
    .hero-desc {
      font-size: 13.5px;
      line-height: 1.55;
      color: #334155;
      margin: 0;
    }

    /* SECTION TITLE */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 0 14px 2px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* PHASE CARDS */
    .phases-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 22px;
    }
    .phase-card {
      background: #ffffff;
      border-width: 1.5px;
      border-style: solid;
      border-radius: 16px;
      padding: 18px 22px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .phase-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 12px;
    }
    .phase-badge-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .phase-badge {
      display: inline-block;
      padding: 4px 11px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .phase-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.2px;
    }
    .phase-subtitle {
      font-size: 11px;
      font-weight: 600;
      display: block;
      margin-top: 1px;
    }
    .status-pill {
      font-size: 10.5px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #64748b;
      white-space: nowrap;
    }
    .status-done {
      background: #ecfdf5;
      color: #047857;
      border-color: #a7f3d0;
    }
    .phase-body {
      font-size: 13.5px;
      line-height: 1.6;
      color: #334155;
    }
    .print-p {
      margin: 0 0 10px 0;
    }
    .print-p:last-child {
      margin-bottom: 0;
    }
    .print-list {
      margin: 6px 0 10px 0;
      padding-left: 4px;
      list-style: none;
    }
    .print-list li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 13px;
      line-height: 1.55;
      color: #334155;
    }
    .bullet-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #8b5cf6;
      margin-top: 7px;
      flex-shrink: 0;
    }

    /* HIGHLIGHT PILLS FOR BOLD CONCEPTS */
    .highlight-pill {
      font-weight: 600;
      color: #6b21a8;
      background: #f3e8ff;
      border: 1px solid #e9d5ff;
      padding: 1px 6px;
      border-radius: 5px;
      font-size: 0.95em;
    }

    /* KEY CONCEPTS */
    .concepts-box {
      background: #faf5ff;
      border: 1.5px solid #e9d5ff;
      border-radius: 16px;
      padding: 16px 20px;
      margin-top: 18px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .concepts-title {
      font-size: 11.5px;
      font-weight: 800;
      color: #6b21a8;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
    }
    .concepts-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .concept-pill {
      background: #ffffff;
      border: 1px solid #d8b4fe;
      color: #581c87;
      font-size: 11.5px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .concept-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #a855f7;
    }

    /* FOOTER */
    .doc-footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="doc-container">
    <div class="brand-bar">
      <div class="brand-logo-wrap">
        <div class="brand-logo-icon">D</div>
        <span class="brand-title">Dalat</span>
        <span class="brand-subtitle">Tutor Inteligente de Estudio</span>
      </div>
      <div class="brand-date">${dateStr}</div>
    </div>

    <div class="hero-banner">
      <div class="badge-route">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <span>Ruta de Aprendizaje Activo · Paso a Paso</span>
      </div>
      <h1 class="hero-title">${mainTitle || "Guía de Estudio Especializada"}</h1>
      ${introText ? `<div class="hero-desc">${formatPrintMarkdown(introText)}</div>` : ""}
    </div>

    ${isStructuredPhases ? `
      <div class="section-header">
        <div class="section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
          </svg>
          <span>ETAPAS DE DOMINIO CONCEPTUAL (${rawPhases.length} FASES)</span>
        </div>
      </div>
      <div class="phases-list">
        ${phasesHtml}
      </div>
    ` : `
      <div class="phase-card" style="border: 1.5px solid #e2e8f0;">
        ${formatPrintMarkdown(markdown)}
      </div>
    `}

    ${conceptsHtml}

    <div class="doc-footer">
      <span>Dalat AI • Tutor Personalizado de Estudio Activo</span>
      <span>Generado con Técnica Feynman • dalat.app</span>
    </div>
  </div>
</body>
</html>`;

    // Trigger Print / Save as PDF through a hidden iframe
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.id = "print-pdf-iframe";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(printableHtml);
        doc.close();

        setTimeout(() => {
          setIsDownloading(false);
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }, 500);
      } else {
        setIsDownloading(false);
      }
    } catch (e) {
      console.error("Error al preparar descarga de PDF:", e);
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
