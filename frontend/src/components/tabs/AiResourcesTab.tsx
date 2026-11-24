"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Copy,
  Check,
  Brain,
  Zap,
  BookOpen,
  HelpCircle,
  Award,
  Layers,
  Trash2,
  Loader2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Folder,
  Users,
  Search,
  X,
  Link2,
  FileArchive,
  Package,
  Download,
} from "lucide-react";
import confetti from "canvas-confetti";
import { exportExamToPDF, exportFlashcardsToPDF } from "@/lib/pdfExport";
import StudyGuideRenderer from "./StudyGuideRenderer";
import { useAuth } from "@/context/AuthContext";
import { flashcardStorage } from "@/services/flashcardStorage";
import {
  repositoryService,
  DocumentoItem,
  EquipoItem,
} from "@/services/repositoryService";
import {
  aiService,
  GenerarRecursoResponse,
  PreguntaExamen,
  FlashcardItem,
} from "@/services/aiService";

interface MaterialFile {
  id: string;
  backendDocId?: number;
  name: string;
  subject: string;
  size: string;
  type: "pdf" | "docx" | "txt" | "ppt" | "link" | "zip";
  isLink?: boolean;
  isArchive?: boolean;
  isLocal?: boolean;
  previewText?: string;
}

interface AiResourcesTabProps {
  isLightMode?: boolean;
  isPro?: boolean;
  onGoToCheckout?: () => void;
  tokensBalance?: number;
  onDeductTokens?: (amount: number) => void;
  onNavigateToRepository?: () => void;
}

export type EngineOptionId = "opcion_1" | "opcion_2";

export interface OptimizationOption {
  id: EngineOptionId;
  title: string;
  badge: string;
  description: string;
  bgDot: string;
}

const OPTIMIZATION_OPTIONS: OptimizationOption[] = [
  {
    id: "opcion_1",
    title: "Opción 1",
    badge: "General",
    description: "Optimizada para cualquier materia, muy buena y balanceada",
    bgDot: "bg-emerald-500",
  },
  {
    id: "opcion_2",
    title: "Opción 2",
    badge: "Matemáticas & Física",
    description: "Exclusiva para trabajos matemáticos, física, fórmulas y ciencias",
    bgDot: "bg-purple-500",
  },
];

export type ResourceType =
  | "Examen"
  | "Flashcards"
  | "Resumen"
  | "Guia"
  | "Pack_General"
  | "Pack_Matematicas";

export function calculateTokenCost(
  resourceType: ResourceType,
  engineOption: EngineOptionId
): number {
  if (resourceType === "Pack_General") return 2; // Pack 1 (Examen + Flashcards + Resumen): 2 tokens (Ahorras 1 token)
  if (resourceType === "Pack_Matematicas") return 7; // Pack 2 (Guía + Resumen + Examen Opción 2): 7 tokens (Ahorras 3 tokens)

  if (engineOption === "opcion_1") {
    // Opción 1: Exámenes (1), Flashcards (1), Resúmenes (1), Guía solo en Opción 2
    if (resourceType === "Examen") return 1;
    if (resourceType === "Flashcards") return 1;
    if (resourceType === "Resumen") return 1;
    return 4;
  } else {
    // Opción 2: Exámenes (3), Resúmenes (3), Flashcards (2), Guía (4)
    if (resourceType === "Examen") return 3;
    if (resourceType === "Resumen") return 3;
    if (resourceType === "Flashcards") return 2;
    if (resourceType === "Guia") return 4;
    return 3;
  }
}

const getDemoPreviewContent = (type: string): any => {
  if (type === "Examen") {
    return [
      {
        id: 1,
        pregunta: "¿Qué condición garantiza el Teorema de Fubini para intercambiar el orden de integración en una integral doble?",
        opciones: [
          "Que la función integrando f(x,y) sea continua en la región rectangular de integración.",
          "Que la región sea un círculo unitario centrado en el origen.",
          "Que las derivadas parciales de segundo orden sean idénticamente nulas.",
          "Que la función no dependa de la variable x."
        ],
        indice_correcto: 0,
        explicacion: "El Teorema de Fubini afirma que si f(x,y) es continua en el rectángulo R = [a,b] x [c,d], la integral doble puede evaluarse mediante integrales iteradas en cualquiera de los dos órdenes."
      }
    ];
  }
  if (type === "Flashcards") {
    return [
      {
        id: 1,
        anverso: "¿Qué es y cómo se aplica el Teorema de Fubini?",
        reverso: "Permite calcular integrales dobles mediante integrales iteradas en cualquier orden si f(x,y) es continua.",
        categoria: "Cálculo Multivariable",
        dificultad: "Intermedio"
      }
    ];
  }
  if (type === "Pack_General") {
    return {
      examen: getDemoPreviewContent("Examen"),
      flashcards: getDemoPreviewContent("Flashcards"),
      resumen: getDemoPreviewContent("Resumen"),
    };
  }
  if (type === "Pack_Matematicas") {
    return {
      guia: {
        titulo: "Guía de Estudio Paso a Paso: Análisis Matemático & Físico",
        resumen_markdown: "# Ruta de Aprendizaje Feynman\n\n### Fase 1: Selección y Estudio Inicial\nIdentifica los conceptos cuantitativos fundamentales y las fórmulas base.\n\n### Fase 2: Explicación Simplificada\nExplica las ecuaciones con analogías físicas simples sin tecnicismos innecesarios.\n\n### Fase 3: Identificación de Brechas\nVerifica inconsistencias dimensionales y casos límite en los problemas.\n\n### Fase 4: Refinamiento y Analogía\nConecta los teoremas con aplicaciones prácticas de ingeniería y física.",
        puntos_clave: ["Optimización cuantitativa", "Análisis dimensional", "Teoremas fundamentales"],
        formulas_o_conceptos: ["Ecuación diferencial ordinaria", "Transformada de Laplace"]
      },
      resumen: {
        titulo: "Resumen Académico con Fórmulas y Teoremas",
        resumen_markdown: "# Resumen Teórico-Práctico Especializado\n\n## 1. Fundamentos Matemáticos\nEl estudio cuantitativo requiere rigor en la definición de límites y operadores.\n\n## 2. Ecuaciones Principales\nEcuación de balance y conservación.",
        puntos_clave: ["Rigor matemático", "Demostraciones clave"],
        formulas_o_conceptos: ["Ley de conservación", "Operador gradiente"]
      },
      examen: getDemoPreviewContent("Examen"),
    };
  }
  return {
    titulo: "Resumen Académico de Muestra PRO",
    resumen_markdown: "# Resumen Académico PRO\n\nContenido exclusivo generado con modelos avanzados de inteligencia artificial.",
    puntos_clave: ["Análisis multivariable", "Integración iterada"],
    formulas_o_conceptos: ["Teorema de Fubini", "Jacobiano"]
  };
};

export default function AiResourcesTab({
  isLightMode = false,
  isPro = false,
  onGoToCheckout,
  tokensBalance = 0,
  onDeductTokens,
  onNavigateToRepository,
}: AiResourcesTabProps) {
  // Sincronización reactiva del tema claro
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

  React.useEffect(() => {
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
      observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });
      window.addEventListener("storage", updateTheme);
      return () => {
        observer.disconnect();
        window.removeEventListener("storage", updateTheme);
      };
    }
  }, [isLightMode]);

  const activeLight = Boolean(isLightMode || domIsLight);

  const { user, isAuthenticated } = useAuth();
  const [files, setFiles] = useState<MaterialFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [equipos, setEquipos] = useState<EquipoItem[]>([]);

  // Estados del Explorador de Repositorios (Nivel 1 y Nivel 2)
  const [isRepoExplorerOpen, setIsRepoExplorerOpen] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const [repoFilterTab, setRepoFilterTab] = useState<"equipos" | "personal">("equipos");
  const [explorerSearch, setExplorerSearch] = useState("");

  // Sincronizar materiales directamente con los repositorios en PostgreSQL
  const loadRepositoryDocuments = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [docs, eqData] = await Promise.all([
        repositoryService.getAllDocumentos(),
        repositoryService.getEquipos(),
      ]);

      if (Array.isArray(eqData)) {
        setEquipos(eqData);
      }

      if (docs && Array.isArray(docs)) {
        const mapped: MaterialFile[] = docs.map((doc: DocumentoItem) => {
          const fmt = (doc.formato || "").toUpperCase();
          const docNameLower = doc.nombre.toLowerCase();
          const isDocx =
            fmt.includes("DOC") ||
            fmt.includes("WORD") ||
            docNameLower.endsWith(".docx") ||
            docNameLower.endsWith(".doc");

          const isPpt =
            fmt.includes("PPT") ||
            docNameLower.endsWith(".pptx") ||
            docNameLower.endsWith(".ppt");

          const isTxt =
            fmt.includes("TXT") ||
            fmt.includes("MD") ||
            docNameLower.endsWith(".txt") ||
            docNameLower.endsWith(".md");

          const isPdf =
            fmt.includes("PDF") ||
            docNameLower.endsWith(".pdf");

          const isRealDoc = isDocx || isPpt || isTxt || isPdf;

          const isArchive =
            !isRealDoc &&
            (fmt === "ZIP" ||
              fmt === "RAR" ||
              fmt === "7Z" ||
              fmt === "TAR" ||
              fmt === "GZ" ||
              fmt.includes("ZIP") ||
              fmt.includes("RAR") ||
              docNameLower.endsWith(".zip") ||
              docNameLower.endsWith(".rar") ||
              docNameLower.endsWith(".7z") ||
              docNameLower.endsWith(".tar") ||
              docNameLower.endsWith(".gz") ||
              docNameLower.endsWith(".tgz"));

          const isLink =
            !isRealDoc &&
            !isArchive &&
            (fmt === "LINK" ||
              fmt === "NOTION" ||
              doc.tamano === "Enlace" ||
              docNameLower.startsWith("http://") ||
              docNameLower.startsWith("https://"));

          const ext: "pdf" | "docx" | "txt" | "ppt" | "link" | "zip" = isLink
            ? "link"
            : isArchive
            ? "zip"
            : isDocx
            ? "docx"
            : isTxt
            ? "txt"
            : isPpt
            ? "ppt"
            : "pdf";

          return {
            id: `doc_${doc.id_documento}`,
            backendDocId: doc.id_documento,
            name: doc.nombre,
            subject: doc.descripcion || "Repositorio Académico",
            size: doc.tamano || "1.0 MB",
            type: ext,
            isLink,
            isArchive,
            isLocal: false,
            previewText: doc.descripcion || doc.nombre,
          };
        });

        setFiles(mapped);
        const playable = mapped.filter((m) => !m.isLink && !m.isArchive);
        if (playable.length > 0) {
          setSelectedFileId((prev) => (prev && playable.some((m) => m.id === prev) ? prev : playable[0].id));
        }
      }
    } catch (err) {
      console.warn("[AiResourcesTab] Error al sincronizar con repositorio:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadRepositoryDocuments();
  }, [loadRepositoryDocuments]);

  const [resourceType, setResourceType] = useState<ResourceType>("Examen");
  const [packActiveTab, setPackActiveTab] = useState<"examen" | "flashcards" | "resumen" | "guia">("examen");
  const [engineOption, setEngineOption] = useState<EngineOptionId>("opcion_1");
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);
  const engineDropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        engineDropdownRef.current &&
        !engineDropdownRef.current.contains(event.target as Node)
      ) {
        setEngineDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // La Guía paso a paso y el Pack 2 siempre usan Opción 2; el Pack 1 siempre usa Opción 1
  const effectiveEngineOption: EngineOptionId =
    resourceType === "Pack_General"
      ? "opcion_1"
      : resourceType === "Pack_Matematicas" || resourceType === "Guia"
      ? "opcion_2"
      : engineOption;

  const currentTokenCost = calculateTokenCost(resourceType, effectiveEngineOption);
  const [questionCount, setQuestionCount] = useState(5);
  const maxQuestionCount = resourceType === "Examen" ? 8 : 15;
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recurso Activo Generado
  const [activeResource, setActiveResource] = useState<GenerarRecursoResponse | null>(null);

  // Estado del Simulador de Examen
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, number>>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Estado del Mazo de Flashcards
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  // Estado del Visor de Resumen / Guía
  const [copied, setCopied] = useState(false);

  // Archivo seleccionado actualmente (con fallback seguro)
  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0] || {
    id: "empty",
    name: "Sin archivo seleccionado",
    subject: "General",
    size: "0 KB",
    type: "pdf" as const,
  };

  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = files.find((f) => f.id === fileId);
    if (target?.backendDocId && isAuthenticated) {
      try {
        await repositoryService.deleteDocumento(target.backendDocId);
        await loadRepositoryDocuments();
      } catch (err) {
        console.warn("Error al eliminar del repositorio:", err);
      }
    }
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFileId === fileId) {
      const remaining = files.filter((f) => f.id !== fileId);
      if (remaining.length > 0) {
        setSelectedFileId(remaining[0].id);
      } else {
        setSelectedFileId("");
      }
    }
  };

  // ==========================================
  // DISPARADOR DE GENERACIÓN RESILIENTE
  // ==========================================
  const handleGenerate = async () => {
    // Si el usuario es de la capa gratuita, mostrar la vista previa demo de fondo con el banner PRO
    if (!isPro) {
      setGenerating(true);
      setErrorMessage(null);
      setTimeout(() => {
        setActiveResource({
          id_recurso: "demo_preview_pro",
          tipo_recurso: resourceType,
          materia: selectedFile.subject || "Cálculo Multivariable",
          tema: selectedFile.name ? selectedFile.name.replace(/\.(pdf|docx|txt|md|pptx)$/i, "") : "Simulacro de Examen PRO",
          dificultad: "Intermedio",
          fuente: "gemini",
          tiempo_generacion_ms: 0,
          contenido: getDemoPreviewContent(resourceType),
        });
        setGenerating(false);
      }, 350);
      return;
    }

    if (isPro && tokensBalance < currentTokenCost) {
      setErrorMessage(
        `Tokens insuficientes. Esta generación requiere ${currentTokenCost} ${
          currentTokenCost === 1 ? "token" : "tokens"
        } y dispones de ${tokensBalance}.`
      );
      return;
    }

    setGenerating(true);
    setErrorMessage(null);

    try {
      const res = await aiService.generarRecurso({
        tipo_recurso: resourceType,
        materia: selectedFile.subject,
        tema: selectedFile.name.replace(/\.(pdf|docx|txt|md|pptx)$/i, ""),
        dificultad:
          effectiveEngineOption === "opcion_1"
            ? "Opción 1 — General"
            : "Opción 2 — Matemáticas y Física",
        cantidad: Math.min(questionCount, maxQuestionCount),
        archivo_nombre: selectedFile.name,
        texto_adicional: selectedFile.previewText || undefined,
      });

      setActiveResource(res);
      if (res.tipo_recurso === "Pack_Matematicas") {
        setPackActiveTab("guia");
      } else if (res.tipo_recurso === "Pack_General") {
        setPackActiveTab("examen");
      }

      if (isPro && onDeductTokens) {
        onDeductTokens(currentTokenCost);
      }

      if (resourceType === "Flashcards" && Array.isArray(res.contenido)) {
        flashcardStorage.saveDeck({
          id: `deck-${selectedFile.id}`,
          fileName: selectedFile.name,
          subject: selectedFile.subject,
          cardCount: res.contenido.length,
          cards: res.contenido,
          generatedAt: new Date().toISOString(),
        });
      }

      // Reiniciar estados de los visores interactivos
      setCurrentQuestionIndex(0);
      setRevealedQuestions({});
      setCorrectCount(0);
      setIsQuizFinished(false);

      setCurrentCardIndex(0);
      setIsFlipped(false);
      setMasteredCards(new Set());
    } catch (err: any) {
      const rawMsg = err?.message || String(err || "");
      if (
        rawMsg.includes("503") ||
        rawMsg.includes("502") ||
        rawMsg.includes("UNAVAILABLE") ||
        rawMsg.toLowerCase().includes("high demand") ||
        rawMsg.toLowerCase().includes("demandados") ||
        rawMsg.toLowerCase().includes("alta demanda")
      ) {
        setErrorMessage(
          "Nuestros recursos PRO están altamente demandados en este momento. Por favor, intenta más tarde."
        );
      } else {
        setErrorMessage(
          rawMsg || "No se pudo completar la generación. Verifica que la API Key de Gemini esté configurada en backend/.env."
        );
      }
    } finally {
      setGenerating(false);
    }
  };

  // Manejador del Examen: responder pregunta
  const handleSelectAnswer = (optionIdx: number, correctIdx: number) => {
    if (revealedQuestions[currentQuestionIndex] !== undefined) return;

    setRevealedQuestions((prev) => ({ ...prev, [currentQuestionIndex]: optionIdx }));

    if (optionIdx === correctIdx) {
      setCorrectCount((prev) => prev + 1);
      confetti({ particleCount: 20, spread: 45, origin: { y: 0.7 } });
    }
  };

  // Avanzar a la siguiente pregunta del examen
  const handleNextQuestion = (totalQuestions: number) => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizFinished(true);
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });
    }
  };

  // Manejador de Flashcard: alternar dominio
  const toggleMastered = (cardId: number) => {
    setMasteredCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // Copiar resumen al portapapeles
  const handleCopyMarkdown = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="space-y-1">
        <h2 className={`text-2xl sm:text-3xl font-editorial font-bold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
          Recursos de estudio con IA
        </h2>
        <p className={`text-xs sm:text-sm font-medium ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
          Transforma apuntes en exámenes prácticos, flashcards activas y guías paso a paso.
        </p>
      </div>

      {/* Main Studio Card */}
      <div className={`rounded-2xl p-6 sm:p-8 border transition-colors ${activeLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-[#0c0e18] border-[#171c2f]"}`}>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Column: Selección de Documentos desde el Repositorio */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`pb-2 border-b ${activeLight ? "border-slate-100" : "border-[#171c30]"}`}>
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-sm ${activeLight ? "text-slate-900" : "text-white"}`}>Documentos del Repositorio</h3>
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  Recientes
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Mostrando los 3 documentos más recientes de tus repositorios</p>
            </div>

            {/* Contenedor con las 3 tarjetas de documentos recientes */}
            <div className="space-y-2.5">
              {(() => {
                const playableDocs = files.filter((f) => !f.isLink && !f.isArchive);
                let displayedRecentFiles = playableDocs.slice(0, 3);
                if (selectedFileId && !displayedRecentFiles.some((f) => f.id === selectedFileId)) {
                  const chosen = playableDocs.find((f) => f.id === selectedFileId);
                  if (chosen) {
                    displayedRecentFiles = [chosen, ...displayedRecentFiles.slice(0, 2)];
                  }
                }

                if (playableDocs.length === 0) {
                  return (
                    <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center space-y-3 text-slate-500 text-xs">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                        <Folder className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-200 text-sm">No tienes documentos en tu Repositorio aún</p>
                        <p className="text-[11px] text-slate-400 max-w-[280px] mx-auto">
                          Sube tus guías o apuntes en la pestaña Repositorio para poder utilizarlos con el generador de IA.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRepoExplorerOpen(true)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl transition shadow-md shadow-purple-600/20 cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Explorar Repositorios</span>
                      </button>
                    </div>
                  );
                }

                return displayedRecentFiles.map((file) => {
                  const isSelected = selectedFileId === file.id;

                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSelectedFileId(file.id);
                        setActiveResource(null);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden group select-none ${
                        isSelected
                          ? activeLight
                            ? "bg-purple-50/80 border-purple-400 ring-2 ring-purple-400/30 shadow-sm"
                            : "bg-[#111425] border-purple-500 ring-2 ring-purple-500/30 shadow-md shadow-[#7c5dfa]/5"
                          : activeLight
                          ? "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300 shadow-sm"
                          : "bg-[#090b14] border-[#161a2b] hover:bg-[#0e1120] text-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7c5dfa]"></div>
                      )}

                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0 ${
                            file.type === "pdf"
                              ? "bg-rose-500/15 text-rose-600 border border-rose-500/25"
                              : file.type === "docx"
                              ? "bg-blue-500/15 text-blue-600 border border-blue-500/25"
                              : file.type === "ppt"
                              ? "bg-amber-500/15 text-amber-600 border border-amber-500/25"
                              : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/25"
                          }`}
                        >
                          {file.type.toUpperCase()}
                        </span>

                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs sm:text-sm font-bold truncate ${activeLight ? "text-slate-900" : "text-white"}`} title={file.name}>
                            {file.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {file.subject} &bull; {file.size}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div
                            className={`w-4 h-4 rounded-full border shrink-0 ${
                              activeLight ? "border-slate-300" : "border-slate-700"
                            }`}
                          />
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDeleteFile(file.id, e)}
                          title="Eliminar este apunte de la lista"
                          className={`p-1.5 rounded-lg transition opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer ${
                            activeLight
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Detalle del archivo seleccionado y botón para abrir todos (mismo que en método psicópata) */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-400 pt-1">
              <span className="truncate max-w-[190px] sm:max-w-[240px]">
                Seleccionado:{" "}
                <span className={`font-semibold ${activeLight ? "text-slate-800" : "text-slate-200"}`}>
                  {selectedFile?.name || "Ninguno"}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setIsRepoExplorerOpen(true)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-semibold text-xs inline-flex items-center gap-1 hover:underline cursor-pointer shrink-0"
              >
                <span>Explorar repositorios ({equipos.reduce((acc, eq) => acc + (eq.documentos?.length || eq.documentos_count || 0), 0) || files.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Panel de Configuración y Generación */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
              <div className="space-y-0.5">
                <h3 className={`font-bold text-base ${activeLight ? "text-slate-900" : "text-white"}`}>
                  Crear recurso pedagógico
                </h3>
                <p className="text-xs text-slate-400">
                  Selecciona el formato y optimización para {selectedFile.subject}.
                </p>
              </div>

              {/* Saldo de tokens solo si es PRO (sin emojis, números resaltados) */}
              {isPro && (
                <div
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 select-none ${
                    activeLight
                      ? "bg-slate-50 border-slate-200 text-slate-800"
                      : "bg-[#0b0e1b] border-[#1d233e] text-slate-200"
                  }`}
                >
                  <span className="font-extrabold text-sm sm:text-base text-purple-600 dark:text-purple-400 font-mono">
                    {tokensBalance}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    tokens disponibles
                  </span>
                </div>
              )}
            </div>

            {/* Selector de Formato Individual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span>Formatos Individuales</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["Examen", "Flashcards", "Resumen", "Guia"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      setResourceType(fmt);
                      setActiveResource(null);
                      if (fmt === "Guia") {
                        setEngineOption("opcion_2");
                      }
                      if (fmt === "Examen" && questionCount > 8) {
                        setQuestionCount(8);
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      resourceType === fmt
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20 font-bold ring-1 ring-purple-400/50"
                        : activeLight
                        ? "bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 hover:text-slate-900 shadow-2xs"
                        : "bg-[#101324] border border-[#1e243d] text-slate-300 hover:text-white hover:bg-[#14182d]"
                    }`}
                  >
                    {fmt === "Examen" && <HelpCircle className="w-3.5 h-3.5" />}
                    {fmt === "Flashcards" && <Layers className="w-3.5 h-3.5" />}
                    {fmt === "Resumen" && <FileText className="w-3.5 h-3.5" />}
                    {fmt === "Guia" && <BookOpen className="w-3.5 h-3.5" />}
                    <span>{fmt === "Guia" ? "Guía" : fmt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Packs con Ahorro de Tokens */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                <span className={`flex items-center gap-1.5 ${activeLight ? "text-purple-800" : "text-purple-400"}`}>
                  <Package className="w-3.5 h-3.5" />
                  <span>Packs de Estudio con Ahorro de Tokens</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Pack 1: General */}
                <button
                  type="button"
                  onClick={() => {
                    setResourceType("Pack_General");
                    setEngineOption("opcion_1");
                    setActiveResource(null);
                    setPackActiveTab("examen");
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden select-none ${
                    resourceType === "Pack_General"
                      ? activeLight
                        ? "bg-purple-50/90 border-purple-600 ring-2 ring-purple-500/40 shadow-md shadow-purple-900/10"
                        : "bg-gradient-to-br from-purple-600/20 via-indigo-600/15 to-transparent border-purple-500 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/30"
                      : activeLight
                      ? "bg-white hover:bg-purple-50/50 border-slate-200 hover:border-purple-300 text-slate-800 shadow-2xs"
                      : "bg-[#0c0f20] hover:bg-[#131732] border-[#1f2647] text-slate-200"
                  }`}
                >
                  <div className="mb-1.5">
                    <span
                      className={`text-xs font-bold ${
                        activeLight ? "text-purple-800 font-extrabold" : "text-purple-400"
                      }`}
                    >
                      Pack 1 — General
                    </span>
                  </div>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      activeLight ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    Examen + Flashcards + Resumen con <strong>Opción 1 (General)</strong>
                  </p>
                </button>

                {/* Pack 2: Matemáticas & Física */}
                <button
                  type="button"
                  onClick={() => {
                    setResourceType("Pack_Matematicas");
                    setEngineOption("opcion_2");
                    setActiveResource(null);
                    setPackActiveTab("guia");
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden select-none ${
                    resourceType === "Pack_Matematicas"
                      ? activeLight
                        ? "bg-cyan-50/90 border-cyan-600 ring-2 ring-cyan-500/40 shadow-md shadow-cyan-900/10"
                        : "bg-gradient-to-br from-cyan-600/20 via-indigo-600/15 to-transparent border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/30"
                      : activeLight
                      ? "bg-white hover:bg-cyan-50/50 border-slate-200 hover:border-cyan-300 text-slate-800 shadow-2xs"
                      : "bg-[#0c0f20] hover:bg-[#131732] border-[#1f2647] text-slate-200"
                  }`}
                >
                  <div className="mb-1.5">
                    <span
                      className={`text-xs font-bold ${
                        activeLight ? "text-cyan-900 font-extrabold" : "text-cyan-400"
                      }`}
                    >
                      Pack 2 — Matemáticas & Física
                    </span>
                  </div>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      activeLight ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    Guía Feynman + Resumen con Fórmulas + Examen con <strong>Opción 2</strong>
                  </p>
                </button>
              </div>
            </div>

            {/* Optimización & Cantidad (Solo visible para formatos individuales: Examen, Flashcards, Resumen, Guía) */}
            {resourceType !== "Pack_General" && resourceType !== "Pack_Matematicas" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-1">
                <div className="space-y-1.5 relative" ref={engineDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className={`block text-xs font-semibold ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
                      Modelo de Optimización
                    </label>
                    {resourceType === "Guia" && (
                      <span className="text-[10px] text-amber-500 font-medium">
                        Exclusivo Opción 2
                      </span>
                    )}
                  </div>

                  {/* Custom Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setEngineDropdownOpen((prev) => !prev)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium transition flex items-center justify-between gap-2 border cursor-pointer select-none ${
                      activeLight
                        ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900 shadow-xs focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                        : "bg-[#080912] hover:bg-[#0f1222] border-[#1e2338] text-white focus:border-[#7c5dfa]"
                    }`}
                  >
                    {(() => {
                      const currentOpt =
                        OPTIMIZATION_OPTIONS.find((d) => d.id === effectiveEngineOption) ||
                        OPTIMIZATION_OPTIONS[0];
                      return (
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${currentOpt.bgDot}`} />
                          <span className="font-bold">{currentOpt.title}</span>
                          <span className={`text-[11px] truncate hidden sm:inline ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                            — {currentOpt.badge}
                          </span>
                        </div>
                      );
                    })()}
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        engineDropdownOpen ? "rotate-180 text-purple-600 dark:text-purple-400" : "text-slate-400"
                      }`}
                    />
                  </button>

                  {/* Custom Floating Popover Menu */}
                  {engineDropdownOpen && (
                    <div
                      className={`absolute left-0 right-0 top-full mt-1.5 z-40 p-1.5 rounded-2xl border shadow-xl animate-in fade-in-50 zoom-in-95 duration-150 space-y-1 ${
                        activeLight
                          ? "bg-white/95 backdrop-blur-md border-slate-200/90 shadow-slate-200/60"
                          : "bg-[#0d1020]/95 backdrop-blur-md border-[#222946] shadow-black/60"
                      }`}
                    >
                      {OPTIMIZATION_OPTIONS.map((opt) => {
                        const isSelected = effectiveEngineOption === opt.id;
                        const isGuiaDisabled = resourceType === "Guia" && opt.id === "opcion_1";

                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              if (isGuiaDisabled) return;
                              setEngineOption(opt.id);
                              setEngineDropdownOpen(false);
                            }}
                            className={`px-3 py-2.5 rounded-xl text-xs transition flex items-center justify-between gap-3 ${
                              isGuiaDisabled
                                ? "opacity-40 cursor-not-allowed bg-transparent"
                                : "cursor-pointer"
                            } ${
                              isSelected
                                ? activeLight
                                  ? "bg-purple-50 text-purple-900 font-bold"
                                  : "bg-purple-950/50 text-purple-200 font-bold"
                                : activeLight
                                ? "hover:bg-slate-100 text-slate-700"
                                : "hover:bg-[#151930] text-slate-300 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${opt.bgDot}`} />
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{opt.title}</span>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                                    activeLight ? "bg-slate-200 text-slate-700 font-medium" : "bg-white/[0.06] text-slate-300"
                                  }`}>
                                    {opt.badge}
                                  </span>
                                </div>
                                <span className={`text-[10px] block truncate ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                                  {isGuiaDisabled ? "No disponible para Guía paso a paso" : opt.description}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" strokeWidth={2.5} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {(resourceType === "Examen" || resourceType === "Flashcards") && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className={activeLight ? "text-slate-600 font-medium" : "text-slate-400"}>Cantidad de preguntas:</span>
                      <span className={`font-extrabold ${activeLight ? "text-purple-700" : "text-white"}`}>
                        {Math.min(questionCount, maxQuestionCount)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={maxQuestionCount}
                      value={Math.min(questionCount, maxQuestionCount)}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className={`w-full accent-purple-600 h-1.5 rounded-lg cursor-pointer ${activeLight ? "bg-slate-200" : "bg-[#181d30]"}`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Botón de Generar y Cálculo Dinámico de Tokens */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#7c5dfa] to-[#6035db] hover:from-[#6d4be0] hover:to-[#502bb8] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#7c5dfa]/25 transition active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {resourceType === "Pack_General"
                        ? "Generando Pack General (Examen, Flashcards, Resumen)..."
                        : resourceType === "Pack_Matematicas"
                        ? "Generando Pack Matemáticas & Física (Guía, Resumen, Examen)..."
                        : `Generando ${resourceType.toLowerCase()} con IA resiliente...`}
                    </span>
                  </>
                ) : (
                  <span>
                    {resourceType === "Pack_General"
                      ? "Generar Pack General"
                      : resourceType === "Pack_Matematicas"
                      ? "Generar Pack Matemáticas & Física"
                      : `Generar ${resourceType.toLowerCase()} al instante`}
                  </span>
                )}
              </button>

              {/* Indicador de costo en tokens antes de generar */}
              <div
                className={`px-3.5 py-2 rounded-xl border text-xs flex items-center gap-2 select-none self-start sm:self-auto ${
                  activeLight
                    ? "bg-slate-50 border-slate-200 text-slate-700"
                    : "bg-[#090b14] border-[#1c223a] text-slate-300"
                }`}
              >
                <span className="text-slate-400">Costo:</span>
                <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400 font-mono">
                  {currentTokenCost} {currentTokenCost === 1 ? "token" : "tokens"}
                </span>
                {resourceType === "Pack_General" && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      activeLight
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    }`}
                  >
                    ¡Ahorras 1 token!
                  </span>
                )}
                {resourceType === "Pack_Matematicas" && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      activeLight
                        ? "bg-cyan-100 text-cyan-950 border-cyan-300"
                        : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                    }`}
                  >
                    ¡Ahorras 3 tokens!
                  </span>
                )}
                {isPro && (
                  <span className="text-slate-500 text-[11px] border-l pl-2 border-slate-200 dark:border-slate-800">
                    Te quedarán:{" "}
                    <strong
                      className={
                        tokensBalance >= currentTokenCost
                          ? "text-slate-700 dark:text-slate-200 font-mono"
                          : "text-rose-500 font-bold font-mono"
                      }
                    >
                      {Math.max(0, tokensBalance - currentTokenCost)}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all animate-in fade-in duration-200 ${
                errorMessage.includes("demandados") || errorMessage.includes("demanda")
                  ? activeLight
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : activeLight
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}>
                {errorMessage.includes("demandados") || errorMessage.includes("demanda") ? (
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* VISORES INTERACTIVOS DEL RECURSO GENERADO                     */}
      {/* ============================================================= */}

      {activeResource && (() => {
        const isPack =
          activeResource.tipo_recurso === "Pack_General" ||
          activeResource.tipo_recurso === "Pack_Matematicas";

        const resolvedExamenData: PreguntaExamen[] = isPack
          ? activeResource.contenido?.examen || []
          : Array.isArray(activeResource.contenido)
          ? activeResource.contenido
          : [];

        const resolvedFlashcardsData: FlashcardItem[] = isPack
          ? activeResource.contenido?.flashcards || []
          : Array.isArray(activeResource.contenido)
          ? activeResource.contenido
          : [];

        const resolvedGuiaData = isPack
          ? activeResource.contenido?.guia
          : activeResource.tipo_recurso === "Guia"
          ? activeResource.contenido
          : null;

        const resolvedResumenData = isPack
          ? activeResource.contenido?.resumen
          : activeResource.tipo_recurso === "Resumen"
          ? activeResource.contenido
          : null;

        const showExamenView =
          (activeResource.tipo_recurso === "Examen" && resolvedExamenData.length > 0) ||
          (isPack && packActiveTab === "examen" && resolvedExamenData.length > 0);

        const showFlashcardsView =
          (activeResource.tipo_recurso === "Flashcards" && resolvedFlashcardsData.length > 0) ||
          (isPack && packActiveTab === "flashcards" && resolvedFlashcardsData.length > 0);

        const showGuiaView =
          (activeResource.tipo_recurso === "Guia" && Boolean(resolvedGuiaData?.resumen_markdown)) ||
          (isPack && packActiveTab === "guia" && Boolean(resolvedGuiaData?.resumen_markdown));

        const showResumenView =
          (activeResource.tipo_recurso === "Resumen" && Boolean(resolvedResumenData?.resumen_markdown)) ||
          (isPack && packActiveTab === "resumen" && Boolean(resolvedResumenData?.resumen_markdown));

        return (
          <div className={`rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-300 border ${activeLight ? "bg-white border-slate-200/90 shadow-xl" : "bg-[#0a0d1b] border-[#1e2544]"}`}>
            {/* Header del Recurso con Badge de Fuente */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${activeLight ? "border-slate-100" : "border-[#1a213d]"}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold text-[#7c5dfa] tracking-wider">
                    {activeResource.tipo_recurso === "Pack_General"
                      ? "Pack 1 — General (3 Recursos)"
                      : activeResource.tipo_recurso === "Pack_Matematicas"
                      ? "Pack 2 — Matemáticas & Física (3 Recursos)"
                      : activeResource.tipo_recurso}
                  </span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-xs text-slate-300 font-semibold">{activeResource.materia}</span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold tracking-tight mt-0.5 ${activeLight ? "text-slate-900" : "text-white"}`}>
                  {activeResource.tema}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {showExamenView && (
                  <button
                    type="button"
                    onClick={() =>
                      exportExamToPDF({
                        tema: activeResource.tema,
                        materia: activeResource.materia,
                        dificultad: activeResource.dificultad,
                        preguntas: resolvedExamenData,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border shadow-xs ${
                      activeLight
                        ? "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200"
                        : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/40"
                    }`}
                    title="Descargar examen en PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Examen (PDF)</span>
                  </button>
                )}

                {showFlashcardsView && (
                  <button
                    type="button"
                    onClick={() =>
                      exportFlashcardsToPDF({
                        tema: activeResource.tema,
                        materia: activeResource.materia,
                        dificultad: activeResource.dificultad,
                        flashcards: resolvedFlashcardsData,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border shadow-xs ${
                      activeLight
                        ? "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200"
                        : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/40"
                    }`}
                    title="Descargar tarjetas de estudio en PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Flashcards (PDF)</span>
                  </button>
                )}

                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>
                    {activeResource.fuente === "cache"
                      ? "Caché Instantánea (0ms)"
                      : "Motor Resiliente Dalat"}
                  </span>
                </span>
              </div>
            </div>

            {/* Si es un Pack, mostramos el conmutador de pestañas del Pack */}
            {isPack && (
              <div
                className={`flex flex-wrap items-center gap-2 p-1.5 rounded-2xl select-none border ${
                  activeLight ? "bg-slate-100/90 border-slate-200" : "bg-black/20 border-white/10"
                }`}
              >
                <span className={`text-[11px] font-bold px-2 uppercase tracking-wider flex items-center gap-1.5 ${activeLight ? "text-slate-700" : "text-slate-400"}`}>
                  <Package className={`w-3.5 h-3.5 ${activeLight ? "text-purple-700" : "text-purple-400"}`} />
                  <span>Recursos del Pack:</span>
                </span>
                {activeResource.tipo_recurso === "Pack_General" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setPackActiveTab("examen");
                        setCurrentQuestionIndex(0);
                        setIsQuizFinished(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        packActiveTab === "examen"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-900/30 ring-1 ring-purple-400"
                          : activeLight
                          ? "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300"
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Examen (5 preguntas)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPackActiveTab("flashcards");
                        setCurrentCardIndex(0);
                        setIsFlipped(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        packActiveTab === "flashcards"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-900/30 ring-1 ring-purple-400"
                          : activeLight
                          ? "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Flashcards (6 tarjetas)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPackActiveTab("resumen")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        packActiveTab === "resumen"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-900/30 ring-1 ring-purple-400"
                          : activeLight
                          ? "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resumen Estructurado</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setPackActiveTab("guia")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        packActiveTab === "guia"
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30 ring-1 ring-cyan-400"
                          : activeLight
                          ? "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Guía Feynman (con Descargar PDF)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPackActiveTab("resumen")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        packActiveTab === "resumen"
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30 ring-1 ring-cyan-400"
                          : activeLight
                          ? "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resumen con Fórmulas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPackActiveTab("examen");
                        setCurrentQuestionIndex(0);
                        setIsQuizFinished(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        packActiveTab === "examen"
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30 ring-1 ring-cyan-400"
                          : activeLight
                          ? "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300"
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Examen Cuantitativo</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Contenedor relativo para el Recurso y el Overlay Paywall Teaser */}
          <div className="relative pt-3">
            <div
              className={
                !isPro
                  ? "filter blur-md select-none pointer-events-none opacity-30 transition-all min-h-[580px] sm:min-h-[630px] max-h-[660px] overflow-hidden py-4 px-2"
                  : ""
              }
            >
              {/* --------------------------------------------------------- */}
              {/* CASO 1: SIMULADOR DE EXAMEN INTERACTIVO                   */}
              {/* --------------------------------------------------------- */}
          {showExamenView && resolvedExamenData.length > 0 && (
            <div>
              {!isQuizFinished ? (
                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Barra de progreso */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Pregunta {currentQuestionIndex + 1} de {resolvedExamenData.length}</span>
                      <span>Correctas: <strong className="text-emerald-400">{correctCount}</strong></span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#161a2b] overflow-hidden">
                      <div
                        className="h-full bg-[#7c5dfa] transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIndex + 1) / resolvedExamenData.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pregunta */}
                  {(() => {
                    const q: PreguntaExamen = resolvedExamenData[currentQuestionIndex] || resolvedExamenData[0];
                    const chosen = revealedQuestions[currentQuestionIndex];
                    const isAnswered = chosen !== undefined;

                    return (
                      <div className="space-y-4">
                        <h4 className={`text-base sm:text-lg font-bold leading-relaxed ${activeLight ? "text-slate-900" : "text-white"}`}>

                          {q.pregunta}
                        </h4>

                        {/* Opciones A, B, C, D */}
                        <div className="space-y-2.5">
                          {q.opciones.map((opt, oIdx) => {
                            let btnStyle = activeLight
                              ? "bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-purple-50/60 hover:border-purple-300"
                              : "bg-[#0c0f20] border-[#1d243f] text-slate-200 hover:border-[#7c5dfa]/60";
                            if (isAnswered) {
                              if (oIdx === q.indice_correcto) {
                                btnStyle = activeLight
                                  ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold shadow-xs"
                                  : "bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40";
                              } else if (chosen === oIdx) {
                                btnStyle = activeLight
                                  ? "bg-rose-50 border-rose-400 text-rose-950 font-semibold"
                                  : "bg-rose-950/60 border-rose-500 text-rose-200";
                              } else {
                                btnStyle = activeLight
                                  ? "opacity-40 bg-slate-50 border-slate-200 text-slate-400"
                                  : "opacity-40 bg-[#0c0f20] border-[#1d243f]";
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={isAnswered}
                                onClick={() => handleSelectAnswer(oIdx, q.indice_correcto)}
                                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between gap-3 ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && oIdx === q.indice_correcto && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                                {isAnswered && chosen === oIdx && oIdx !== q.indice_correcto && (
                                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explicación pedagógica */}
                        {isAnswered && (
                          <div className={`p-4 rounded-xl text-xs leading-relaxed animate-in fade-in space-y-1 border ${activeLight ? "bg-purple-50/70 border-purple-200 text-purple-950" : "bg-[#11162a] border-[#232c4f] text-slate-300"}`}>

                            <span className="font-bold text-[#a78bfa] block">Explicación:</span>
                            <p>{q.explicacion}</p>
                          </div>
                        )}

                        {/* Botón Siguiente */}
                        {isAnswered && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleNextQuestion(resolvedExamenData.length)}
                              className="px-6 py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#7c5dfa]/20 transition active:scale-95"
                            >
                              <span>
                                {currentQuestionIndex + 1 === resolvedExamenData.length
                                  ? "Ver resultado final"
                                  : "Siguiente pregunta"}
                              </span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Resultado del Examen */
                <div className="max-w-md mx-auto text-center space-y-5 py-4">
                  <Award className="w-16 h-16 text-[#fbbf24] mx-auto animate-bounce" />
                  <div>
                    <h4 className="text-2xl font-bold text-white">¡Examen Completado!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Has finalizado el simulacro de {activeResource.materia}
                    </p>
                  </div>

                  <div className={`p-6 rounded-2xl border space-y-2 ${activeLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-[#0e1224] border-[#1e2544]"}`}>

                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Calificación Obtenida
                    </span>
                    <div className="text-5xl font-black text-white tracking-tight">
                      {((correctCount / resolvedExamenData.length) * 10).toFixed(1)}
                      <span className="text-xl text-slate-500 font-normal"> / 10.0</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold pt-1">
                      {correctCount} de {resolvedExamenData.length} respuestas correctas (
                      {Math.round((correctCount / resolvedExamenData.length) * 100)}%)
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() =>
                        exportExamToPDF({
                          tema: activeResource.tema,
                          materia: activeResource.materia,
                          dificultad: activeResource.dificultad,
                          preguntas: resolvedExamenData,
                        })
                      }
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Examen en PDF</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentQuestionIndex(0);
                        setRevealedQuestions({});
                        setCorrectCount(0);
                        setIsQuizFinished(false);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                        activeLight
                          ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700"
                          : "bg-[#1b213b] hover:bg-[#252e50] text-slate-200 hover:text-white"
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reintentar simulacro</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* CASO 2: MAZO INTERACTIVO DE FLASHCARDS                    */}
          {/* --------------------------------------------------------- */}
          {showFlashcardsView && resolvedFlashcardsData.length > 0 && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>
                    Tarjeta {currentCardIndex + 1} de {resolvedFlashcardsData.length}
                  </span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-emerald-400 font-semibold">
                    Dominadas: {masteredCards.size} / {resolvedFlashcardsData.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    exportFlashcardsToPDF({
                      tema: activeResource.tema,
                      materia: activeResource.materia,
                      dificultad: activeResource.dificultad,
                      flashcards: resolvedFlashcardsData,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border shadow-xs ${
                    activeLight
                      ? "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200"
                      : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/40"
                  }`}
                  title="Descargar tarjetas de estudio en PDF listo para imprimir o recortar"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </button>
              </div>

              {/* Tarjeta Flip 3D */}
              {(() => {
                const card: FlashcardItem = resolvedFlashcardsData[currentCardIndex] || resolvedFlashcardsData[0];
                const isMastered = card?.id ? masteredCards.has(card.id) : false;

                return (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`min-h-[220px] p-8 rounded-3xl shadow-xl cursor-pointer flex flex-col justify-between transition-all select-none relative group border ${activeLight ? "bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 border-purple-200 hover:border-purple-400" : "bg-gradient-to-br from-[#12162c] to-[#0c0e1e] border-[#232c4f] hover:border-[#7c5dfa]/60"}`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                        {card?.categoria || "Concepto"}
                      </span>
                      <span className="text-[#a78bfa] text-xs font-medium flex items-center gap-1 group-hover:underline">
                        <span>{isFlipped ? "Ver pregunta" : "Toca para ver respuesta"}</span>
                        <RotateCcw className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="py-6 text-center">
                      <p className={`text-base sm:text-lg font-bold leading-relaxed ${activeLight ? "text-slate-900" : "text-white"}`}>

                        {isFlipped ? card?.reverso : card?.anverso}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Dificultad: {card?.dificultad || activeResource.dificultad}</span>
                      {isMastered && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Dominada
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Controles de Navegación y Dominio */}
              <div className="flex items-center justify-between gap-3">
                <button
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  className={`p-3 rounded-xl transition cursor-pointer disabled:opacity-30 border ${activeLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" : "bg-[#111425] border-[#1e233d] text-slate-300 hover:text-white"}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const card = resolvedFlashcardsData[currentCardIndex] || resolvedFlashcardsData[0];
                    if (card?.id) toggleMastered(card.id);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                    masteredCards.has((resolvedFlashcardsData[currentCardIndex] || resolvedFlashcardsData[0])?.id)
                      ? activeLight
                        ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold"
                        : "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                      : activeLight
                      ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                      : "bg-[#111425] border-[#1e233d] text-slate-300 hover:text-white"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {masteredCards.has((resolvedFlashcardsData[currentCardIndex] || resolvedFlashcardsData[0])?.id)
                      ? "Tarjeta dominada"
                      : "Marcar como dominada"}
                  </span>
                </button>

                <button
                  disabled={currentCardIndex + 1 >= resolvedFlashcardsData.length}
                  onClick={() => {
                    setCurrentCardIndex((prev) =>
                      Math.min(resolvedFlashcardsData.length - 1, prev + 1)
                    );
                    setIsFlipped(false);
                  }}
                  className={`p-3 rounded-xl transition cursor-pointer disabled:opacity-30 border ${activeLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" : "bg-[#111425] border-[#1e233d] text-slate-300 hover:text-white"}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* CASO 3: GUÍA DE ESTUDIO PASO A PASO (FEYNMAN)             */}
          {/* --------------------------------------------------------- */}
          {showGuiaView && resolvedGuiaData?.resumen_markdown && (
            <StudyGuideRenderer
              markdown={resolvedGuiaData.resumen_markdown}
              title={resolvedGuiaData.titulo || "Guía de Estudio Paso a Paso"}
              keyConcepts={resolvedGuiaData.puntos_clave}
              activeLight={activeLight}
            />
          )}

          {/* --------------------------------------------------------- */}
          {/* CASO 4: RESUMEN ACADÉMICO ESTRUCTURADO                    */}
          {/* --------------------------------------------------------- */}
          {showResumenView && resolvedResumenData?.resumen_markdown && (
            <StudyGuideRenderer
              markdown={resolvedResumenData.resumen_markdown}
              title={resolvedResumenData.titulo || "Resumen Académico"}
              keyConcepts={resolvedResumenData.puntos_clave}
              activeLight={activeLight}
            />
          )}
            </div>

            {/* Overlay Paywall PRO cuando el usuario es gratuito */}
            {!isPro && (
              <div className="absolute inset-0 z-30 flex items-center justify-center p-6 sm:p-10">
                <div
                  className={`max-w-md w-full p-6 sm:p-7 rounded-3xl border shadow-2xl backdrop-blur-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200 my-auto ${
                    activeLight
                      ? "bg-white/95 border-purple-200/90 shadow-2xl shadow-purple-900/10 text-slate-800"
                      : "bg-[#0b0d1c]/95 border-purple-500/40 shadow-2xl shadow-black/80 text-white"
                  }`}
                >
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold tracking-wide">
                    <span>Dalat PRO • Contenido Exclusivo</span>
                  </div>

                  <div className="pb-1.5 pt-0.5">
                    <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
                      {activeResource.tipo_recurso === "Examen"
                        ? "Desbloquea las preguntas del examen con Dalat PRO"
                        : activeResource.tipo_recurso === "Flashcards"
                        ? "Desbloquea el mazo de flashcards con Dalat PRO"
                        : "Desbloquea el contenido completo con Dalat PRO"}
                    </h3>
                  </div>

                  <div
                    className={`border rounded-2xl p-4 text-left space-y-2.5 text-xs mt-3 ${
                      activeLight
                        ? "bg-purple-50/50 border-purple-100 text-slate-700"
                        : "bg-white/[0.03] border-white/[0.07] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Exámenes, flashcards y resúmenes para tus trabajos o parciales.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Explicaciones exactas sin informacion inventada.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Acceso a metodos Feyman y psicopata.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>2 GB de almacenamiento en tus repositorios</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onGoToCheckout}
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#7c5dfa] via-[#6366f1] to-[#7c5dfa] hover:from-[#6d4be0] hover:to-[#502bb8] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Comprar Plan PRO para ver la respuesta</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    })()}

      {/* MODAL EXPLORADOR DE REPOSITORIOS (NIVEL 1 Y NIVEL 2) */}
      {isRepoExplorerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
              activeLight
                ? "bg-white border-slate-200 text-slate-900 shadow-slate-900/10"
                : "bg-[#0b0d17] border-white/10 text-white shadow-black/80"
            }`}
          >
            {/* Header */}
            <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 ${activeLight ? "border-slate-100" : "border-white/[0.08]"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-500 flex items-center justify-center shrink-0">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${activeLight ? "text-slate-900" : "text-white"}`}>
                    {selectedRepoId === null
                      ? "Explorador de Repositorios"
                      : (equipos.find((e) => e.id_equipo === selectedRepoId)?.nombre || "Documentos del Repositorio")}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedRepoId === null
                      ? "Selecciona un repositorio para ver y elegir tus documentos compatibles con IA"
                      : "Elige un archivo de este repositorio para generar recursos de estudio"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedRepoId !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedRepoId(null)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        : "bg-white/10 hover:bg-white/15 text-slate-200"
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a repositorios</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsRepoExplorerOpen(false);
                    setSelectedRepoId(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* VISTA 1: LISTADO DE REPOSITORIOS (NIVEL 1) */}
            {selectedRepoId === null ? (
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[520px] space-y-5">
                {/* Píldoras de Filtro: Equipos de Estudio vs Apuntes Personales */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRepoFilterTab("equipos")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      repoFilterTab === "equipos"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : activeLight
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-white/[0.05] text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Equipos de Estudio</span>
                    <span className="w-4 h-4 rounded-full text-[10px] bg-white/20 flex items-center justify-center font-bold">
                      {equipos.filter((e) => !e.es_personal).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepoFilterTab("personal")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      repoFilterTab === "personal"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : activeLight
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-white/[0.05] text-slate-400 hover:text-white"
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Apuntes Personales</span>
                    <span className="w-4 h-4 rounded-full text-[10px] bg-white/20 flex items-center justify-center font-bold">
                      {equipos.filter((e) => e.es_personal).length}
                    </span>
                  </button>
                </div>

                {/* Cuadros de Repositorios en Grilla */}
                {equipos.filter((e) => (repoFilterTab === "personal" ? e.es_personal : !e.es_personal)).length === 0 ? (
                  <div
                    className={`rounded-2xl border p-10 text-center space-y-3 ${
                      activeLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/[0.06]"
                    }`}
                  >
                    <Folder className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                    <p className="text-xs font-semibold text-slate-400">
                      No tienes repositorios en esta sección aún.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {equipos
                      .filter((e) => (repoFilterTab === "personal" ? e.es_personal : !e.es_personal))
                      .map((team) => {
                        const totalDocs = team.documentos?.length || team.documentos_count || 0;
                        return (
                          <div
                            key={team.id_equipo}
                            onClick={() => setSelectedRepoId(team.id_equipo)}
                            className={`group rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
                              activeLight
                                ? "bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300"
                                : "bg-[#0c0e18] border-[#171c2f] hover:border-[#2f385c] hover:bg-[#0f1220]"
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm"
                                  style={{ backgroundColor: team.color || "#7c5dfa" }}
                                >
                                  {team.icono_iniciales || "EQ"}
                                </div>
                                <div className="min-w-0">
                                  <span
                                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                    style={{
                                      backgroundColor: `${team.color || "#7c5dfa"}15`,
                                      color: team.color || "#7c5dfa",
                                      border: `1px solid ${team.color || "#7c5dfa"}35`,
                                    }}
                                  >
                                    {team.materia || "GENERAL"}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <h4
                                  className={`text-base font-bold tracking-tight truncate ${
                                    activeLight ? "text-slate-900 group-hover:text-purple-600" : "text-white group-hover:text-purple-400"
                                  }`}
                                >
                                  {team.nombre}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                  {team.descripcion || (team.es_personal ? "Notas personales privadas" : `Equipo de estudio colaborativo para ${team.materia}`)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>
                                    {team.miembros_count || 1} {(team.miembros_count || 1) === 1 ? "miembro" : "miembros"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>
                                    {totalDocs} {totalDocs === 1 ? "material" : "materiales"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                              <span>Ver y elegir materiales</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ) : (
              /* VISTA 2: DOCUMENTOS DENTRO DEL REPOSITORIO SELECCIONADO (NIVEL 2) */
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[520px] space-y-4">
                {/* Buscador dentro del repositorio */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={explorerSearch}
                    onChange={(e) => setExplorerSearch(e.target.value)}
                    placeholder="Buscar archivo en este repositorio..."
                    className={`w-full text-xs pl-10 pr-8 py-2.5 rounded-xl border transition-colors outline-none ${
                      activeLight
                        ? "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-purple-400"
                        : "bg-[#090b16] border-[#1f2644] text-white placeholder-slate-500 focus:border-purple-500/60"
                    }`}
                  />
                  {explorerSearch && (
                    <button
                      type="button"
                      onClick={() => setExplorerSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Lista de Documentos del Repositorio */}
                {(() => {
                  const currentRepo = equipos.find((e) => e.id_equipo === selectedRepoId);
                  const docs = currentRepo?.documentos || [];
                  const filteredDocs = docs.filter((d) =>
                    !explorerSearch.trim() || d.nombre.toLowerCase().includes(explorerSearch.toLowerCase())
                  );

                  if (filteredDocs.length === 0) {
                    return (
                      <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                        <FileText className="w-8 h-8 mx-auto opacity-40 text-purple-400" />
                        <p className="font-semibold text-slate-300">No hay documentos en este repositorio</p>
                        <p className="text-[11px] text-slate-500">
                          Sube guías o apuntes en la pestaña Repositorio para poder utilizarlos con el generador de IA.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5">
                      {filteredDocs.map((doc) => {
                        const fmt = (doc.formato || "").toUpperCase();
                        const docNameLower = doc.nombre.toLowerCase();
                        const isDocx =
                          fmt.includes("DOC") ||
                          fmt.includes("WORD") ||
                          docNameLower.endsWith(".docx") ||
                          docNameLower.endsWith(".doc");

                        const isPpt =
                          fmt.includes("PPT") ||
                          docNameLower.endsWith(".pptx") ||
                          docNameLower.endsWith(".ppt");

                        const isTxt =
                          fmt.includes("TXT") ||
                          fmt.includes("MD") ||
                          docNameLower.endsWith(".txt") ||
                          docNameLower.endsWith(".md");

                        const isPdf =
                          fmt.includes("PDF") ||
                          docNameLower.endsWith(".pdf");

                        const isRealDoc = isDocx || isPpt || isTxt || isPdf;

                        const isArchive =
                          !isRealDoc &&
                          (fmt === "ZIP" ||
                            fmt === "RAR" ||
                            fmt === "7Z" ||
                            fmt === "TAR" ||
                            fmt === "GZ" ||
                            fmt.includes("ZIP") ||
                            fmt.includes("RAR") ||
                            docNameLower.endsWith(".zip") ||
                            docNameLower.endsWith(".rar") ||
                            docNameLower.endsWith(".7z") ||
                            docNameLower.endsWith(".tar") ||
                            docNameLower.endsWith(".gz") ||
                            docNameLower.endsWith(".tgz"));

                        const isLink =
                          !isRealDoc &&
                          !isArchive &&
                          (fmt === "LINK" ||
                            fmt === "NOTION" ||
                            doc.tamano === "Enlace" ||
                            docNameLower.startsWith("http://") ||
                            docNameLower.startsWith("https://"));

                        const isSelected = selectedFileId === `doc_${doc.id_documento}` || selectedFile?.name === doc.nombre;

                        // Caso 1: ENLACES WEB Y ARCHIVOS COMPRIMIDOS (NO disponibles para IA)
                        if (isLink || isArchive) {
                          return (
                            <div
                              key={doc.id_documento}
                              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 opacity-50 cursor-not-allowed select-none ${
                                activeLight
                                  ? "bg-slate-100/70 border-slate-200 text-slate-500"
                                  : "bg-white/[0.02] border-white/[0.06] text-slate-400"
                              }`}
                              title={
                                isArchive
                                  ? "Los archivos comprimidos (.zip, .rar) no están disponibles para generar recursos con IA."
                                  : "Los enlaces web no están disponibles para generar recursos con IA."
                              }
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0 flex items-center gap-1 ${
                                    isArchive
                                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  }`}
                                >
                                  {isArchive ? <FileArchive className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                                  <span>{isArchive ? "ZIP" : "ENLACE"}</span>
                                </span>
                                <div className="min-w-0">
                                  <h5 className="text-xs sm:text-sm font-semibold truncate line-through">
                                    {doc.nombre}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {isArchive
                                      ? "Archivo comprimido (ZIP/RAR) • No ejecutable"
                                      : "Enlace web o Google Drive • Solo lectura"}
                                  </p>
                                </div>
                              </div>

                              <span className="text-[10px] font-semibold text-amber-500/90 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg shrink-0">
                                No disponible para IA
                              </span>
                            </div>
                          );
                        }

                        // Caso 2: DOCUMENTOS REALES (PDF, DOCX, TXT, PPT) -> Elegibles
                        const docType: "pdf" | "docx" | "txt" | "ppt" =
                          fmt.includes("DOC") ||
                          fmt.includes("WORD") ||
                          doc.nombre.toLowerCase().endsWith(".docx") ||
                          doc.nombre.toLowerCase().endsWith(".doc")
                            ? "docx"
                            : fmt.includes("TXT") ||
                              fmt.includes("MD") ||
                              doc.nombre.toLowerCase().endsWith(".txt") ||
                              doc.nombre.toLowerCase().endsWith(".md")
                            ? "txt"
                            : fmt.includes("PPT") ||
                              doc.nombre.toLowerCase().endsWith(".pptx") ||
                              doc.nombre.toLowerCase().endsWith(".ppt")
                            ? "ppt"
                            : "pdf";

                        return (
                          <div
                            key={doc.id_documento}
                            onClick={() => {
                              const chosen: MaterialFile = {
                                id: `doc_${doc.id_documento}`,
                                backendDocId: doc.id_documento,
                                name: doc.nombre,
                                subject: currentRepo?.nombre || "Repositorio Académico",
                                size: doc.tamano || "1.0 MB",
                                type: docType,
                                isLink: false,
                                isArchive: false,
                                isLocal: false,
                                previewText: doc.descripcion || doc.nombre,
                              };
                              setFiles((prev) => [chosen, ...prev.filter((m) => m.id !== chosen.id)]);
                              setSelectedFileId(chosen.id);
                              setActiveResource(null);
                              setIsRepoExplorerOpen(false);
                              setSelectedRepoId(null);
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? activeLight
                                  ? "bg-purple-50/80 border-purple-500 ring-2 ring-purple-400/30 shadow-sm"
                                  : "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30 shadow-sm"
                                : activeLight
                                ? "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 hover:border-slate-300"
                                : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-200 hover:border-white/[0.15]"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0 ${
                                  docType === "pdf"
                                    ? "bg-rose-500/15 text-rose-600 border border-rose-500/25"
                                    : docType === "docx"
                                    ? "bg-blue-500/15 text-blue-600 border border-blue-500/25"
                                    : docType === "ppt"
                                    ? "bg-amber-500/15 text-amber-600 border border-amber-500/25"
                                    : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/25"
                                }`}
                              >
                                {docType.toUpperCase()}
                              </span>

                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold truncate">{doc.nombre}</h4>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {currentRepo?.nombre} &bull; {doc.tamano || "1.0 MB"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-xl">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Seleccionado</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                                    activeLight
                                      ? "text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200"
                                      : "text-purple-300 hover:text-white bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30"
                                  }`}
                                >
                                  Elegir
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Footer Modal */}
            <div className={`p-4 sm:p-5 border-t flex items-center justify-between text-xs text-slate-400 ${activeLight ? "border-slate-100 bg-slate-50/50" : "border-white/[0.08] bg-white/[0.02]"}`}>
              <span>
                {selectedRepoId === null
                  ? `${equipos.length} repositorios disponibles`
                  : `Mostrando materiales de ${equipos.find((e) => e.id_equipo === selectedRepoId)?.nombre || "este repositorio"}`}
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsRepoExplorerOpen(false);
                  setSelectedRepoId(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  activeLight
                    ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                    : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
