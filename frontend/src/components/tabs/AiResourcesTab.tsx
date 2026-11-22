"use client";

import React, { useState, useRef } from "react";
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
  Paperclip,
  Lock,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { flashcardStorage } from "@/services/flashcardStorage";
import {
  aiService,
  GenerarRecursoResponse,
  PreguntaExamen,
  FlashcardItem,
} from "@/services/aiService";

interface MaterialFile {
  id: string;
  name: string;
  subject: string;
  size: string;
  type: "pdf" | "docx" | "txt";
  isLocal?: boolean;
  previewText?: string;
}

const INITIAL_FILES: MaterialFile[] = [
  {
    id: "f1",
    name: "Unidad 3 — Integrales múltiples.pdf",
    subject: "Cálculo III",
    size: "2.7 MB",
    type: "pdf",
  },
  {
    id: "f2",
    name: "Notas de clase — Microeconomía.docx",
    subject: "Economía",
    size: "898 KB",
    type: "docx",
  },
  {
    id: "f3",
    name: "Guía 2 — Leyes de Newton y Energía.pdf",
    subject: "Física Mecánica",
    size: "1.4 MB",
    type: "pdf",
  },
];

interface AiResourcesTabProps {
  isLightMode?: boolean;
  isPro?: boolean;
  onGoToCheckout?: () => void;
  tokensBalance?: number;
  onDeductTokens?: (amount: number) => void;
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

export function calculateTokenCost(
  resourceType: "Examen" | "Flashcards" | "Resumen" | "Guia",
  engineOption: EngineOptionId
): number {
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

export default function AiResourcesTab({
  isLightMode = false,
  isPro = false,
  onGoToCheckout,
  tokensBalance = 0,
  onDeductTokens,
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

  const [files, setFiles] = useState<MaterialFile[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dalat_ai_materials");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_FILES;
  });

  // Persistir materiales para uso compartido con Método Psicópata
  React.useEffect(() => {
    try {
      localStorage.setItem("dalat_ai_materials", JSON.stringify(files));
    } catch {}
  }, [files]);
  const [selectedFileId, setSelectedFileId] = useState("f1");
  const [resourceType, setResourceType] = useState<"Examen" | "Flashcards" | "Resumen" | "Guia">("Examen");
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

  // La Guía paso a paso solo tiene disponibilidad con la Opción 2
  const effectiveEngineOption: EngineOptionId =
    resourceType === "Guia" ? "opcion_2" : engineOption;

  const currentTokenCost = calculateTokenCost(resourceType, effectiveEngineOption);
  const [questionCount, setQuestionCount] = useState(5);
  const maxQuestionCount = resourceType === "Examen" ? 8 : 15;
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subida de archivos reales desde el ordenador
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

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

  // Archivo seleccionado actualmente
  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];

  // ==========================================
  // PROCESAMIENTO DE ARCHIVO DEL ORDENADOR
  // ==========================================
  const handleFileProcess = async (file: File) => {
    setUploadingFile(true);
    setErrorMessage(null);

    try {
      const res = await aiService.subirMaterial(file);
      const newFileItem: MaterialFile = {
        id: res.id,
        name: res.name,
        subject: res.subject,
        size: res.size,
        type: (res.type as any) || "pdf",
        isLocal: true,
        previewText: res.preview_text,
      };

      setFiles((prev) => [newFileItem, ...prev]);
      setSelectedFileId(newFileItem.id);
      setActiveResource(null);
      setUploadSuccessToast(`"${file.name}" cargado exitosamente desde tu ordenador`);
      setTimeout(() => setUploadSuccessToast(null), 4000);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch (err: any) {
      console.warn("Subida a backend falló o sin red, procesando en navegador:", err);
      // Fallback en navegador para que nunca falle
      let preview = "";
      if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        try {
          preview = await file.text();
        } catch {}
      }

      const sizeStr =
        file.size >= 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const newFileItem: MaterialFile = {
        id: `f_local_${Date.now()}`,
        name: file.name,
        subject: "Materia General",
        size: sizeStr,
        type: ext === "docx" ? "docx" : ext === "txt" ? "txt" : "pdf",
        isLocal: true,
        previewText: preview.slice(0, 1000),
      };

      setFiles((prev) => [newFileItem, ...prev]);
      setSelectedFileId(newFileItem.id);
      setActiveResource(null);
      setUploadSuccessToast(`"${file.name}" cargado exitosamente`);
      setTimeout(() => setUploadSuccessToast(null), 4000);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } finally {
      setUploadingFile(false);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFileId === fileId) {
      const remaining = files.filter((f) => f.id !== fileId);
      if (remaining.length > 0) {
        setSelectedFileId(remaining[0].id);
      }
    }
  };

  // ==========================================
  // DISPARADOR DE GENERACIÓN RESILIENTE
  // ==========================================
  const handleGenerate = async () => {
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
      console.error("[AI Tab] Error:", err);
      setErrorMessage(
        "No se pudo completar la generación. Verifica que el servidor de Dalat esté encendido."
      );
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

        {/* Hidden File Input para abrir explorador de archivos desde la zona de arrastre */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.doc,.txt,.md,.pptx"
          className="hidden"
        />
      </div>

      {/* Main Studio Card */}
      <div className={`rounded-2xl p-6 sm:p-8 border transition-colors ${activeLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-[#0c0e18] border-[#171c2f]"}`}>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Column: Lista de Materiales y Zona de Carga */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`flex items-center justify-between pb-1 border-b ${activeLight ? "border-slate-100" : "border-[#171c30]"}`}>

              <h3 className={`font-bold text-sm ${activeLight ? "text-slate-900" : "text-white"}`}>Material de Estudio</h3>

              <span className={`text-xs font-medium ${activeLight ? "text-slate-500" : "text-slate-400"}`}>

                {files.length} apuntes
              </span>
            </div>

            {/* Zona Drag & Drop para subir archivos directamente */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border border-dashed rounded-xl p-3.5 text-center cursor-pointer transition select-none ${
                isDragging
                  ? "border-purple-400 bg-purple-500/10 scale-[1.01]"
                  : activeLight
                  ? "border-purple-200 bg-purple-50/40 hover:bg-purple-50/80 hover:border-purple-300"
                  : "border-[#222845] bg-[#090b14] hover:border-indigo-500/50 hover:bg-[#0e1122]"
              }`}
            >
              <div className={`flex items-center justify-center gap-2 text-xs font-semibold ${activeLight ? "text-purple-700" : "text-indigo-300"}`}>

                {uploadingFile ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <Paperclip className="w-4 h-4 text-indigo-400" />
                )}
                <span>
                  {uploadingFile
                    ? "Procesando archivo..."
                    : isDragging
                    ? "¡Suelta el archivo aquí!"
                    : "Haz clic o arrastra un archivo desde tu PC"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Soporta PDF, Word (DOCX), Texto (TXT, MD)
              </p>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {files.map((file) => {
                const isSelected = selectedFileId === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      setSelectedFileId(file.id);
                      setActiveResource(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden group ${
                      isSelected
                        ? activeLight
                          ? "bg-purple-50/80 border-purple-300 shadow-xs ring-1 ring-purple-200"
                          : "bg-[#111425] border-[#222845] shadow-md shadow-[#7c5dfa]/5"
                        : activeLight
                        ? "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80"
                        : "bg-[#090b14] border-[#161a2b] hover:bg-[#0e1120]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7c5dfa]"></div>
                    )}

                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${activeLight ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-[#181d33] text-indigo-300 border-transparent"}`}>
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs sm:text-sm font-bold truncate max-w-[180px] ${activeLight ? "text-slate-900" : "text-white"}`}>

                            {file.name}
                          </h4>
                          {file.isLocal && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 shrink-0">
                              Tu PC
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {file.subject} &bull; {file.size}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteFile(file.id, e)}
                      title="Eliminar este apunte de la lista"
                      className={`p-1.5 rounded-lg transition opacity-60 group-hover:opacity-100 shrink-0 cursor-pointer ${activeLight ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
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

            {/* Selector de Formato */}
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

            {/* Optimización & Cantidad */}
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
                    <span>Generando {resourceType.toLowerCase()} con IA resiliente...</span>
                  </>
                ) : (
                  <span>Generar {resourceType.toLowerCase()} al instante</span>
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
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* VISORES INTERACTIVOS DEL RECURSO GENERADO                     */}
      {/* ============================================================= */}

      {activeResource && (
        <div className={`rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-300 border ${activeLight ? "bg-white border-slate-200/90 shadow-xl" : "bg-[#0a0d1b] border-[#1e2544]"}`}>

          
          {/* Header del Recurso con Badge de Fuente */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${activeLight ? "border-slate-100" : "border-[#1a213d]"}`}>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold text-[#7c5dfa] tracking-wider">
                  {activeResource.tipo_recurso}
                </span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-xs text-slate-300 font-semibold">{activeResource.materia}</span>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold tracking-tight mt-0.5 ${activeLight ? "text-slate-900" : "text-white"}`}>

                {activeResource.tema}
              </h3>
            </div>

            <div className="flex items-center gap-2">
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
          {activeResource.tipo_recurso === "Examen" && Array.isArray(activeResource.contenido) && (
            <div>
              {!isQuizFinished ? (
                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Barra de progreso */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Pregunta {currentQuestionIndex + 1} de {activeResource.contenido.length}</span>
                      <span>Correctas: <strong className="text-emerald-400">{correctCount}</strong></span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#161a2b] overflow-hidden">
                      <div
                        className="h-full bg-[#7c5dfa] transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIndex + 1) / activeResource.contenido.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pregunta */}
                  {(() => {
                    const q: PreguntaExamen = activeResource.contenido[currentQuestionIndex];
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
                              onClick={() => handleNextQuestion(activeResource.contenido.length)}
                              className="px-6 py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#7c5dfa]/20 transition active:scale-95"
                            >
                              <span>
                                {currentQuestionIndex + 1 === activeResource.contenido.length
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
                      {((correctCount / activeResource.contenido.length) * 10).toFixed(1)}
                      <span className="text-xl text-slate-500 font-normal"> / 10.0</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold pt-1">
                      {correctCount} de {activeResource.contenido.length} respuestas correctas (
                      {Math.round((correctCount / activeResource.contenido.length) * 100)}%)
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setRevealedQuestions({});
                      setCorrectCount(0);
                      setIsQuizFinished(false);
                    }}
                    className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto transition cursor-pointer ${activeLight ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700" : "bg-[#1b213b] hover:bg-[#252e50] text-slate-200 hover:text-white"}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reintentar simulacro</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* CASO 2: MAZO INTERACTIVO DE FLASHCARDS                    */}
          {/* --------------------------------------------------------- */}
          {activeResource.tipo_recurso === "Flashcards" && Array.isArray(activeResource.contenido) && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Tarjeta {currentCardIndex + 1} de {activeResource.contenido.length}
                </span>
                <span className="text-emerald-400 font-semibold">
                  Dominadas: {masteredCards.size} / {activeResource.contenido.length}
                </span>
              </div>

              {/* Tarjeta Flip 3D */}
              {(() => {
                const card: FlashcardItem = activeResource.contenido[currentCardIndex];
                const isMastered = masteredCards.has(card.id);

                return (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`min-h-[220px] p-8 rounded-3xl shadow-xl cursor-pointer flex flex-col justify-between transition-all select-none relative group border ${activeLight ? "bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 border-purple-200 hover:border-purple-400" : "bg-gradient-to-br from-[#12162c] to-[#0c0e1e] border-[#232c4f] hover:border-[#7c5dfa]/60"}`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                        {card.categoria || "Concepto"}
                      </span>
                      <span className="text-[#a78bfa] text-xs font-medium flex items-center gap-1 group-hover:underline">
                        <span>{isFlipped ? "Ver pregunta" : "Toca para ver respuesta"}</span>
                        <RotateCcw className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="py-6 text-center">
                      <p className={`text-base sm:text-lg font-bold leading-relaxed ${activeLight ? "text-slate-900" : "text-white"}`}>

                        {isFlipped ? card.reverso : card.anverso}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Dificultad: {card.dificultad || activeResource.dificultad}</span>
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
                    const card = activeResource.contenido[currentCardIndex];
                    toggleMastered(card.id);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                    masteredCards.has(activeResource.contenido[currentCardIndex]?.id)
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
                    {masteredCards.has(activeResource.contenido[currentCardIndex]?.id)
                      ? "Tarjeta dominada"
                      : "Marcar como dominada"}
                  </span>
                </button>

                <button
                  disabled={currentCardIndex + 1 >= activeResource.contenido.length}
                  onClick={() => {
                    setCurrentCardIndex((prev) =>
                      Math.min(activeResource.contenido.length - 1, prev + 1)
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
          {/* CASO 3 & 4: RESUMEN / GUÍA DE ESTUDIO ESTRUCTURADA        */}
          {/* --------------------------------------------------------- */}
          {(activeResource.tipo_recurso === "Resumen" || activeResource.tipo_recurso === "Guia") &&
            activeResource.contenido?.resumen_markdown && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className={`text-base font-bold ${activeLight ? "text-slate-900" : "text-white"}`}>

                    {activeResource.contenido.titulo}
                  </h4>
                  <button
                    onClick={() => handleCopyMarkdown(activeResource.contenido.resumen_markdown)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${activeLight ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700" : "bg-[#111425] border-[#1e233d] text-slate-300 hover:text-white"}`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar material</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Contenido en caja de lectura */}
                <div className={`p-6 rounded-2xl font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap border ${activeLight ? "bg-slate-50/90 border-slate-200 text-slate-800 shadow-xs" : "bg-[#090b14] border-[#161a2b] text-slate-300"}`}>

                  {activeResource.contenido.resumen_markdown}
                </div>

                {/* Puntos clave */}
                {activeResource.contenido.puntos_clave && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Conceptos Clave para el Parcial:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeResource.contenido.puntos_clave.map((pt: string, idx: number) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-xl text-xs font-medium border ${activeLight ? "bg-purple-50 border-purple-200 text-purple-800 font-semibold" : "bg-[#111629] border-[#212845] text-slate-200"}`}
                        >
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
      )}

      {/* Notificación flotante al subir archivo */}
      {uploadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#101428] border border-emerald-500/50 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-white font-medium">{uploadSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
