"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Upload,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Brain,
  Zap,
  BookOpen,
  HelpCircle,
  Award,
  Layers,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  aiService,
  GenerarRecursoResponse,
  PreguntaExamen,
  FlashcardItem,
  ResumenGuiaItem,
} from "@/services/aiService";

interface MaterialFile {
  id: string;
  name: string;
  subject: string;
  size: string;
  type: "pdf" | "docx";
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

export default function AiResourcesTab() {
  const [files, setFiles] = useState<MaterialFile[]>(INITIAL_FILES);
  const [selectedFileId, setSelectedFileId] = useState("f1");
  const [resourceType, setResourceType] = useState<"Examen" | "Flashcards" | "Resumen" | "Guia">("Examen");
  const [difficulty, setDifficulty] = useState("Intermedio");
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recurso Activo Generado
  const [activeResource, setActiveResource] = useState<GenerarRecursoResponse | null>(null);

  // Estado del Simulador de Examen
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
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
  // DISPARADOR DE GENERACIÓN RESILIENTE
  // ==========================================
  const handleGenerate = async () => {
    setGenerating(true);
    setErrorMessage(null);

    try {
      const res = await aiService.generarRecurso({
        tipo_recurso: resourceType,
        materia: selectedFile.subject,
        tema: selectedFile.name.replace(/\.(pdf|docx)$/i, ""),
        dificultad: difficulty,
        cantidad: questionCount,
        archivo_nombre: selectedFile.name,
      });

      setActiveResource(res);

      // Reiniciar estados de los visores interactivos
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setRevealedQuestions({});
      setCorrectCount(0);
      setIsQuizFinished(false);

      setCurrentCardIndex(0);
      setIsFlipped(false);
      setMasteredCards(new Set());

      confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
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

    setSelectedAnswer(optionIdx);
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
      setSelectedAnswer(
        revealedQuestions[currentQuestionIndex + 1] !== undefined
          ? revealedQuestions[currentQuestionIndex + 1]
          : null
      );
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl sm:text-4xl font-editorial font-bold tracking-tight text-white">
              Recursos de estudio con IA
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Resiliente 100%</span>
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Transforma apuntes en exámenes prácticos, flashcards activas y guías paso a paso.
          </p>
        </div>

        <button
          onClick={() => {
            const newName = prompt("Escribe el nombre del nuevo apunte o tema a estudiar:");
            if (newName && newName.trim()) {
              const newFile: MaterialFile = {
                id: `f_${Date.now()}`,
                name: `${newName.trim()}.pdf`,
                subject: "Materia General",
                size: "1.2 MB",
                type: "pdf",
              };
              setFiles((prev) => [newFile, ...prev]);
              setSelectedFileId(newFile.id);
            }
          }}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-semibold shadow-lg shadow-[#7c5dfa]/20 transition active:scale-95 flex items-center gap-2"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Añadir material</span>
        </button>
      </div>

      {/* Main Studio Card */}
      <div className="rounded-2xl bg-[#0c0e18] border border-[#171c2f] p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Column: Lista de Materiales */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#171c30]">
              <h3 className="font-bold text-white text-sm">Material de Estudio</h3>
              <span className="text-xs text-slate-400 font-medium">
                {files.length} apuntes
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {files.map((file) => {
                const isSelected = selectedFileId === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      setSelectedFileId(file.id);
                      setActiveResource(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 relative overflow-hidden ${
                      isSelected
                        ? "bg-[#111425] border-[#222845] shadow-md shadow-[#7c5dfa]/5"
                        : "bg-[#090b14] border-[#161a2b] hover:bg-[#0e1120]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7c5dfa]"></div>
                    )}

                    <div className="w-9 h-9 rounded-lg bg-[#181d33] flex items-center justify-center text-slate-200 shrink-0">
                      <FileText className="w-4 h-4 text-indigo-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {file.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {file.subject} &bull; {file.size}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-[#090b14] border border-[#171c2e] text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
              <Brain className="w-4 h-4 text-[#a78bfa] shrink-0 mt-0.5" />
              <span>
                <strong>Modo Zero-Downtime:</strong> Dalat cuenta con caché inteligente y motor algorítmico local para generar material incluso si las APIs externas están colapsadas.
              </span>
            </div>
          </div>

          {/* Right Column: Panel de Configuración y Generación */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Crear recurso pedagógico</h3>
              <p className="text-xs text-slate-400">
                Selecciona el formato y dificultad deseada para {selectedFile.subject}.
              </p>
            </div>

            {/* Selector de Formato */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Examen", "Flashcards", "Resumen", "Guia"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    setResourceType(fmt);
                    setActiveResource(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    resourceType === fmt
                      ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                      : "bg-[#121626] border border-[#1f253d] text-slate-300 hover:text-white"
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

            {/* Dificultad & Cantidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-400 font-medium">
                  Dificultad Académica
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#080912] border border-[#1e2338] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                >
                  <option value="Básico">Básico (Conceptos fundamentales)</option>
                  <option value="Intermedio">Intermedio (Aplicación práctica)</option>
                  <option value="Avanzado">Avanzado (Problemas tipo parcial)</option>
                  <option value="Nivel Examen Final">Nivel Examen Final (Integrador)</option>
                </select>
              </div>

              {(resourceType === "Examen" || resourceType === "Flashcards") && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Cantidad de reactivos:</span>
                    <span className="font-bold text-white">{questionCount}</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={15}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-[#7c5dfa] h-1.5 bg-[#181d30] rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Botón de Generar */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#7c5dfa] to-[#6035db] hover:from-[#6d4be0] hover:to-[#502bb8] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#7c5dfa]/25 transition active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Generando {resourceType.toLowerCase()} con IA resiliente...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar {resourceType.toLowerCase()} al instante</span>
                  </>
                )}
              </button>
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
        <div className="rounded-3xl bg-[#0a0d1b] border border-[#1e2544] p-6 sm:p-9 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header del Recurso con Badge de Fuente */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a213d] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold text-[#7c5dfa] tracking-wider">
                  {activeResource.tipo_recurso}
                </span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-xs text-slate-300 font-semibold">{activeResource.materia}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
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
                        <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                          {q.pregunta}
                        </h4>

                        {/* Opciones A, B, C, D */}
                        <div className="space-y-2.5">
                          {q.opciones.map((opt, oIdx) => {
                            let btnStyle = "bg-[#0c0f20] border-[#1d243f] text-slate-200 hover:border-[#7c5dfa]/60";
                            if (isAnswered) {
                              if (oIdx === q.indice_correcto) {
                                btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40";
                              } else if (chosen === oIdx) {
                                btnStyle = "bg-rose-950/60 border-rose-500 text-rose-200";
                              } else {
                                btnStyle = "opacity-40 bg-[#0c0f20] border-[#1d243f]";
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
                          <div className="p-4 rounded-xl bg-[#11162a] border border-[#232c4f] text-xs text-slate-300 leading-relaxed animate-in fade-in space-y-1">
                            <span className="font-bold text-[#a78bfa] block">💡 Explicación:</span>
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

                  <div className="p-6 rounded-2xl bg-[#0e1224] border border-[#1e2544] space-y-2">
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
                      setSelectedAnswer(null);
                      setRevealedQuestions({});
                      setCorrectCount(0);
                      setIsQuizFinished(false);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#1b213b] hover:bg-[#252e50] text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 mx-auto transition"
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
                    className="min-h-[220px] p-8 rounded-3xl bg-gradient-to-br from-[#12162c] to-[#0c0e1e] border border-[#232c4f] hover:border-[#7c5dfa]/60 shadow-xl cursor-pointer flex flex-col justify-between transition-all select-none relative group"
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
                      <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
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
                  className="p-3 rounded-xl bg-[#111425] border border-[#1e233d] text-slate-300 hover:text-white disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const card = activeResource.contenido[currentCardIndex];
                    toggleMastered(card.id);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    masteredCards.has(activeResource.contenido[currentCardIndex]?.id)
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
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
                  className="p-3 rounded-xl bg-[#111425] border border-[#1e233d] text-slate-300 hover:text-white disabled:opacity-30 transition"
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
                  <h4 className="text-base font-bold text-white">
                    {activeResource.contenido.titulo}
                  </h4>
                  <button
                    onClick={() => handleCopyMarkdown(activeResource.contenido.resumen_markdown)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#111425] border border-[#1e233d] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
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
                <div className="p-6 rounded-2xl bg-[#090b14] border border-[#161a2b] font-sans text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
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
                          className="px-3 py-1 rounded-xl bg-[#111629] border border-[#212845] text-slate-200 text-xs font-medium"
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
      )}
    </div>
  );
}
