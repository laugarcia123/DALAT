"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Printer,
  HelpCircle,
  Sparkles,
  FileText,
  Check,
  Lightbulb,
  ArrowRight,
  Maximize2,
  Layout,
} from "lucide-react";

interface CornellModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

interface CornellTemplate {
  id: string;
  name: string;
  whenToUse: string;
  pdfPath: string;
  fileName: string;
}

export default function CornellModal({ isOpen, onClose, isLightMode = false }: CornellModalProps) {
  const templates: CornellTemplate[] = [
    {
      id: "cornell-1",
      name: "Plantilla Cornell (Opción 1)",
      whenToUse:
        "Ideal para clases teóricas y materias como Biología, Psicología o Administración donde necesites un balance amplio entre apuntes a la derecha y formulación de preguntas clave a la izquierda.",
      pdfPath: "/cornell/plantilla-cornell-1.pdf",
      fileName: "Plantilla-Cornell-Opcion-1.pdf",
    },
    {
      id: "cornell-2",
      name: "Plantilla Cornell (Opción 2)",
      whenToUse:
        "Ideal para clases magistrales, conferencias y materias con mucha teoría donde el docente dicte a ritmo fluido y necesites renglones claros para mantener la prolijidad de la escritura.",
      pdfPath: "/cornell/plantilla-cornell-2.pdf",
      fileName: "Plantilla-Cornell-Opcion-2.pdf",
    },
    {
      id: "cornell-3",
      name: "Plantilla Cornell (Opción 3)",
      whenToUse:
        "Ideal para Ciencias, Matemáticas, Física, Medicina o Ingeniería. Úsala cuando debas trazar esquemas anatómicos, gráficas, fórmulas complejas o tablas comparativas gracias a su cuadrícula punteada.",
      pdfPath: "/cornell/plantilla-cornell-3.pdf",
      fileName: "Plantilla-Cornell-Opcion-3.pdf",
    },
    {
      id: "cornell-4",
      name: "Plantilla Cornell (Opción 4)",
      whenToUse:
        "Ideal para Humanidades, Derecho, Historia y Filosofía. Úsala para resumir lecturas densas, artículos de investigación o jurisprudencia donde predomine el análisis exhaustivo.",
      pdfPath: "/cornell/plantilla-cornell-4.pdf",
      fileName: "Plantilla-Cornell-Opcion-4.pdf",
    },
  ];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0].id);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Función para imprimir directamente el PDF seleccionado
  const handlePrint = (pdfUrl: string) => {
    try {
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 800);
      }
    } catch {
      window.open(pdfUrl, "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-5 sm:p-7 flex flex-col justify-between space-y-6 animate-in zoom-in-95 duration-200 transition-colors ${
          isLightMode
            ? "bg-[#fffefc] border-emerald-200/80 text-slate-900 shadow-emerald-950/10"
            : "bg-[#09121a] border-white/[0.1] text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
        }`}
      >
        {/* 1. Header con Badge encima del título */}
        <div
          className={`flex items-start justify-between gap-4 border-b pb-4 ${
            isLightMode ? "border-slate-200/70" : "border-white/[0.08]"
          }`}
        >
          <div className="space-y-1.5">
            {/* Badge encima del título */}
            <div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 border ${
                  isLightMode
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Plantillas PDF Imprimibles</span>
              </span>
            </div>

            {/* Título y Botón ¿Cómo funciona? al lado */}
            <div className="flex flex-wrap items-center gap-3">
              <h2
                className={`text-xl sm:text-2xl font-editorial font-bold tracking-tight ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              >
                Método Cornell
              </h2>

              <button
                onClick={() => setShowExplanation(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  isLightMode
                    ? "bg-emerald-100/70 hover:bg-emerald-100 text-emerald-900 border-emerald-300"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border-white/[0.12]"
                }`}
                title="Ver cómo funciona el método"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>¿Cómo funciona?</span>
              </button>
            </div>

            <p className={`text-xs sm:text-sm ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
              Elige el formato adecuado según tu tipo de estudio para descargar en PDF o imprimir.
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

        {/* 2. Distribución en 2 columnas: Izquierda opciones, Derecha visualizador de formato */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* COLUMNA IZQUIERDA: Lista de opciones explicadas */}
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs pb-1">
              <span
                className={`font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                  isLightMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <Layout className="w-3.5 h-3.5 text-emerald-500" />
                Opciones disponibles
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  isLightMode ? "bg-slate-100 text-slate-600" : "bg-white/[0.06] text-slate-300"
                }`}
              >
                4 formatos
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {templates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? isLightMode
                          ? "bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                          : "bg-emerald-950/25 border-emerald-400/80 shadow-md ring-2 ring-emerald-400/20"
                        : isLightMode
                        ? "bg-white hover:bg-slate-50 border-slate-200"
                        : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : isLightMode
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-white/[0.06] text-slate-300 border-white/[0.08]"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div
                          className={`font-bold text-xs sm:text-sm tracking-tight ${
                            isSelected
                              ? isLightMode
                                ? "text-emerald-950"
                                : "text-emerald-300"
                              : isLightMode
                              ? "text-slate-900"
                              : "text-white"
                          }`}
                        >
                          {tpl.name}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : isLightMode
                            ? "border-slate-300"
                            : "border-slate-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Explicación de cuándo usarla: alta legibilidad y visibilidad en modo oscuro */}
                    <p
                      className={`text-[11px] sm:text-xs leading-relaxed pl-9 transition-colors ${
                        isSelected
                          ? isLightMode
                            ? "text-emerald-950 font-medium"
                            : "text-emerald-100 font-medium"
                          : isLightMode
                          ? "text-slate-600"
                          : "text-slate-200"
                      }`}
                    >
                      {tpl.whenToUse}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMNA DERECHA: Visualizador del formato y botones de descarga/impresión */}
          <div
            className={`lg:col-span-7 p-4 sm:p-5 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm ${
              isLightMode
                ? "bg-gradient-to-b from-white to-emerald-50/40 border-emerald-200/80"
                : "bg-gradient-to-b from-white/[0.02] to-emerald-950/20 border-white/[0.08]"
            }`}
          >
            {/* Header del documento seleccionado (Sin texto del formato) */}
            <div
              className={`flex items-center justify-between gap-3 border-b pb-3 ${
                isLightMode ? "border-slate-200/70" : "border-white/[0.08]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span
                  className={`text-xs sm:text-sm font-bold block ${
                    isLightMode ? "text-slate-900" : "text-white"
                  }`}
                >
                  {selectedTemplate.name}
                </span>
              </div>

              {/* Botón para ver en pantalla completa */}
              <a
                href={selectedTemplate.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  isLightMode
                    ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm"
                    : "bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/[0.08]"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Ver pantalla completa</span>
              </a>
            </div>

            {/* Visor interactivo del PDF seleccionado */}
            <div
              className={`w-full h-80 sm:h-96 lg:h-[460px] rounded-2xl border overflow-hidden relative shadow-inner ${
                isLightMode
                  ? "bg-slate-100 border-slate-200"
                  : "bg-[#050b12] border-white/[0.08]"
              }`}
            >
              <iframe
                key={selectedTemplate.pdfPath}
                src={`${selectedTemplate.pdfPath}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border-none"
                title={`Vista previa ${selectedTemplate.name}`}
              />
            </div>

            {/* BOTONES DE ACCIÓN: Guardar en PDF e Imprimir */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <a
                href={selectedTemplate.pdfPath}
                download={selectedTemplate.fileName}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Guardar en PDF (Descargar)</span>
              </a>

              <button
                onClick={() => handlePrint(selectedTemplate.pdfPath)}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shadow-sm ${
                  isLightMode
                    ? "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-white border-white/[0.12]"
                }`}
              >
                <Printer className="w-4 h-4 text-emerald-500" />
                <span>Imprimir Plantilla</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODAL DE EXPLICACIÓN "¿CÓMO FUNCIONA EL MÉTODO CORNELL?" */}
      {showExplanation && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 transition-colors ${
              isLightMode
                ? "bg-[#fffdfa] border-emerald-200/90 text-slate-900 shadow-emerald-950/15"
                : "bg-[#09121a] border-white/[0.12] text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
            }`}
          >
            {/* Header del modal de explicación */}
            <div className="flex items-start justify-between gap-4 border-b pb-4 border-slate-200/70 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isLightMode
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`text-lg sm:text-xl font-editorial font-bold tracking-tight ${
                      isLightMode ? "text-slate-900" : "text-white"
                    }`}
                  >
                    ¿Cómo funciona el Método Cornell?
                  </h3>
                  <p className={`text-xs sm:text-sm ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                    El sistema de toma de notas más premiado del mundo universitario.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isLightMode
                    ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
                aria-label="Cerrar explicación"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Las 3 Zonas Clave del Método Cornell */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div
                className={`p-4 rounded-2xl border transition ${
                  isLightMode
                    ? "bg-slate-50 border-slate-200/90 shadow-sm"
                    : "bg-white/[0.04] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
                      isLightMode
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    1
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    Durante la clase: Columna de Notas Principales (Derecha)
                  </b>
                </div>
                <p
                  className={`leading-relaxed text-xs ${
                    isLightMode ? "text-slate-600" : "text-slate-200"
                  }`}
                >
                  Anota ideas centrales, fórmulas, definiciones y ejemplos que expone el profesor. Usa viñetas breves y abreviaciones sin intentar copiar todo palabra por palabra.
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border transition ${
                  isLightMode
                    ? "bg-slate-50 border-slate-200/90 shadow-sm"
                    : "bg-white/[0.04] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
                      isLightMode
                        ? "bg-teal-100 text-teal-800"
                        : "bg-teal-500/20 text-teal-300"
                    }`}
                  >
                    2
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    Después de la clase: Columna de Preguntas & Claves (Izquierda)
                  </b>
                </div>
                <p
                  className={`leading-relaxed text-xs ${
                    isLightMode ? "text-slate-600" : "text-slate-200"
                  }`}
                >
                  En las primeras 24 horas, repasa tus notas y formula en el margen izquierdo preguntas tipo parcial que se respondan con la información de la derecha (o palabras clave).
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border transition ${
                  isLightMode
                    ? "bg-slate-50 border-slate-200/90 shadow-sm"
                    : "bg-white/[0.04] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
                      isLightMode
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-indigo-500/20 text-indigo-300"
                    }`}
                  >
                    3
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    Al finalizar el tema: Zona de Resumen (Abajo)
                  </b>
                </div>
                <p
                  className={`leading-relaxed text-xs ${
                    isLightMode ? "text-slate-600" : "text-slate-200"
                  }`}
                >
                  Sintetiza la página entera en 2 o 3 líneas al fondo. Obligar a tu mente a condensar el tema consolida el aprendizaje en tu memoria de largo plazo.
                </p>
              </div>
            </div>

            {/* Regla de oro para estudiar con Cornell */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                isLightMode
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  : "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-200"
              }`}
            >
              <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-xs uppercase tracking-wide block">
                  Técnica de Auto-evaluación Cornell:
                </span>
                <p className="opacity-90 leading-relaxed">
                  Para estudiar antes de un parcial: tapa con una hoja la columna derecha (notas) y responde en voz alta solo mirando las preguntas de la izquierda. Si puedes responderlas, ¡el tema ya es tuyo!
                </p>
              </div>
            </div>

            {/* Botón de cierre */}
            <button
              onClick={() => setShowExplanation(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <span>¡Entendido, a descargar plantillas!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
