"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mic,
  FileText,
  AlertCircle,
  Award,
  Sparkles,
  CheckCircle2,
  Mail,
  UploadCloud,
  ChevronDown,
  Volume2,
  ArrowRight,
  Headphones,
  HelpCircle,
  Lightbulb,
  Check,
} from "lucide-react";

interface FeynmanModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

interface ReferenceDoc {
  id: string;
  name: string;
  course: string;
  pages: number;
  size: string;
  source: string;
}

export default function FeynmanModal({ isOpen, onClose, isLightMode = false }: FeynmanModalProps) {
  const referenceDocs: ReferenceDoc[] = [
    {
      id: "doc-1",
      name: "Bioquimica_RutasMetabolicas_Corte2.pdf",
      course: "Bioquímica Médica",
      pages: 28,
      size: "3.4 MB",
      source: "Recursos IA • Bóveda",
    },
    {
      id: "doc-2",
      name: "Derecho_Constitucional_Jurisprudencia.pdf",
      course: "Derecho Constitucional",
      pages: 42,
      size: "4.8 MB",
      source: "Recursos IA • Syllabus",
    },
    {
      id: "doc-3",
      name: "Syllabus_Calculo_Vectorial_Parcial3.pdf",
      course: "Cálculo III",
      pages: 19,
      size: "2.1 MB",
      source: "Recursos IA • Apuntes",
    },
  ];

  const [selectedDocId, setSelectedDocId] = useState<string>(referenceDocs[0].id);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showFakeDoor, setShowFakeDoor] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);

  const activeDoc = referenceDocs.find((d) => d.id === selectedDocId) || referenceDocs[0];

  // Disparo de la Puerta Falsa (Mide conversión real)
  const handleTriggerFakeDoor = () => {
    if (typeof window !== "undefined") {
      const current = parseInt(localStorage.getItem("dalat_feynman_clicks") || "0", 10);
      localStorage.setItem("dalat_feynman_clicks", (current + 1).toString());
    }
    setShowFakeDoor(true);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("dalat_feynman_waitlist") || "[]");
        stored.push({
          email: email.trim(),
          docChosen: activeDoc.name,
          date: new Date().toISOString(),
        });
        localStorage.setItem("dalat_feynman_waitlist", JSON.stringify(stored));
      } catch {
        // Fallback silencioso
      }
    }
    setEmailSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 animate-in zoom-in-95 duration-200 transition-colors ${
          isLightMode
            ? "bg-[#fffefc] border-amber-200/70 text-slate-900 shadow-amber-900/10"
            : "bg-[#0b0e1b] border-white/[0.1] text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
        }`}
      >
        {/* 1. Header con Auditoría con IA encima del título */}
        <div className="flex items-start justify-between gap-4 border-b pb-4 border-slate-200/70 dark:border-white/[0.08]">
          <div className="space-y-1.5">
            {/* Badge Auditoría con IA ENCIMA del título */}
            <div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 border ${
                  isLightMode
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Auditoría con IA</span>
              </span>
            </div>

            {/* Título Método Feynman y Botón ¿Cómo funciona? al lado */}
            <div className="flex flex-wrap items-center gap-3">
              <h2
                className={`text-xl sm:text-2xl font-editorial font-bold tracking-tight ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              >
                Método Feynman
              </h2>

              <button
                onClick={() => setShowExplanation(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  isLightMode
                    ? "bg-rose-100/70 hover:bg-rose-100 text-rose-900 border-rose-300"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border-white/[0.12]"
                }`}
                title="Ver cómo funciona el método"
              >
                <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>¿Cómo funciona?</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Explica en voz alta y la IA evalúa tu nivel de dominio contrastando tus archivos de Recursos IA.
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

        {/* 2. Selector de Documento de Recursos IA (Sin emoji en el título) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400">
              Documento de referencia para la auditoría
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                isLightMode ? "bg-slate-100 text-slate-600" : "bg-white/[0.06] text-slate-300"
              }`}
            >
              Archivos en Recursos IA
            </span>
          </div>

          {/* Selector interactivo con aspecto de tarjeta nativa */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-3 shadow-sm ${
                isLightMode
                  ? "bg-white hover:bg-slate-50/80 border-slate-200 text-slate-900"
                  : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.1] text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isLightMode
                      ? "bg-rose-50 text-rose-600 border-rose-200"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs sm:text-sm font-bold truncate">{activeDoc.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{activeDoc.course}</span>
                    <span>•</span>
                    <span>{activeDoc.pages} páginas</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-medium">{activeDoc.source}</span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menú desplegable */}
            {isDropdownOpen && (
              <div
                className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border p-1.5 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150 ${
                  isLightMode
                    ? "bg-white border-slate-200 text-slate-900"
                    : "bg-[#101426] border-white/[0.12] text-white"
                }`}
              >
                {referenceDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                      selectedDocId === doc.id
                        ? isLightMode
                          ? "bg-rose-50 text-rose-900 font-semibold"
                          : "bg-rose-500/15 text-rose-300 font-semibold"
                        : isLightMode
                        ? "hover:bg-slate-50 text-slate-700"
                        : "hover:bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">{doc.name}</div>
                      <div className="text-[10px] text-slate-400">{doc.course} • {doc.pages} págs</div>
                    </div>
                    {selectedDocId === doc.id && <Check className="w-4 h-4 text-rose-500 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Estudio de Grabación Principal (Limpio y Espacioso) */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border text-center space-y-6 transition-all shadow-sm ${
            isLightMode
              ? "bg-gradient-to-b from-white to-rose-50/40 border-rose-200/80"
              : "bg-gradient-to-b from-white/[0.03] to-rose-950/20 border-white/[0.08]"
          }`}
        >
          {/* Visualizador de ondas con estilo sonoro vibrante */}
          <div className="flex items-center justify-center gap-1.5 h-16 px-4">
            {[20, 36, 58, 30, 80, 95, 62, 85, 98, 48, 76, 88, 35, 65, 82, 44, 20].map((height, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-rose-500 to-purple-500 opacity-80"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          <div className="space-y-1.5">
            <h4
              className={`text-base sm:text-lg font-bold ${
                isLightMode ? "text-slate-900" : "text-white"
              }`}
            >
              Estudio de Grabación de Voz
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Presiona el botón para comenzar a exponer con tus propias palabras. La IA escuchará con atención y generará tu reporte de dominio.
            </p>
          </div>

          {/* BOTONES PRINCIPALES (Activadores de la Puerta Falsa) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleTriggerFakeDoor}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-rose-600/25 cursor-pointer active:scale-95 transition-all"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Grabar audio y evaluar con IA</span>
            </button>

            <button
              onClick={handleTriggerFakeDoor}
              className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${
                isLightMode
                  ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm"
                  : "bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/[0.1]"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Subir audio pregrabado (.mp3)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MODAL DE EXPLICACIÓN "¿CÓMO FUNCIONA?" (Igual que en Pomodoro) */}
      {showExplanation && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 transition-colors ${
              isLightMode
                ? "bg-[#fffdfa] border-rose-200/90 text-slate-900 shadow-rose-900/15"
                : "bg-[#0b0f1d] border-white/[0.12] text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
            }`}
          >
            {/* Header del modal de explicación */}
            <div className="flex items-start justify-between gap-4 border-b pb-4 border-slate-200/70 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isLightMode
                      ? "bg-rose-100 text-rose-700 border-rose-200"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
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
                    ¿Cómo funciona el Método Feynman con IA?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Aprende el doble enseñando en voz alta y dejando que la IA audite tus conceptos.
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

            {/* 3 Pasos de la Auditoría */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div
                className={`p-4 rounded-2xl border transition ${
                  isLightMode
                    ? "bg-slate-50 border-slate-200/90 shadow-sm"
                    : "bg-white/[0.04] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-500 font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    Paso 1: Selecciona tu material de Recursos IA
                  </b>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  Elige alguno de los archivos que subiste previamente a la sección de <b>Recursos IA</b> (apuntes, lecturas o diapositivas). Recuerda que la IA se basa exclusivamente en lo que está en ese documento.
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
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    Paso 2: Graba tu explicación en voz alta
                  </b>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  Expón el tema con palabras sencillas y cotidianas, como si le explicaras a un niño o a un compañero novato. La IA escucha todo el audio de principio a fin sin interrumpirte.
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
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <b className={`font-semibold text-sm ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    Paso 3: Auditoría conceptual y calificación (0.0 a 5.0)
                  </b>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  Si mencionas afirmaciones incorrectas o contrarias a tus apuntes, la IA te baja calificación y marca el minuto exacto del error con la corrección precisa para que refuerces ese punto débil.
                </p>
              </div>
            </div>

            {/* Consejo de Richard Feynman */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                isLightMode
                  ? "bg-rose-50/70 border-rose-200 text-rose-950"
                  : "bg-rose-500/[0.08] border-rose-500/20 text-rose-200"
              }`}
            >
              <Lightbulb className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-xs uppercase tracking-wide block">
                  Regla de oro de Richard Feynman:
                </span>
                <p className="opacity-90 leading-relaxed">
                  "Si no puedes explicarlo de forma sencilla con tus propias palabras, es porque todavía no lo has entendido lo suficiente."
                </p>
              </div>
            </div>

            {/* Botón de cierre */}
            <button
              onClick={() => setShowExplanation(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <span>¡Entendido, a practicar!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL DE PUERTA FALSA (Honesto, empático y con métrica de interés) */}
      {showFakeDoor && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 transition-colors ${
              isLightMode
                ? "bg-white border-rose-200 text-slate-900 shadow-2xl"
                : "bg-[#110e1e] border-rose-900/40 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
            }`}
          >
            {/* Header del Mensaje (Limpio, sin estrella ni botón MVP) */}
            <div className="flex items-center justify-between gap-3 border-b pb-3 border-slate-200/70 dark:border-white/[0.08]">
              <h3
                className={`text-xl font-bold font-editorial tracking-tight ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              >
                ¡Próximamente en Dalat!
              </h3>
              <button
                onClick={() => {
                  setShowFakeDoor(false);
                  setEmailSubmitted(false);
                }}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  isLightMode
                    ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido honesto */}
            {!emailSubmitted ? (
              <>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Estamos desarrollando la herramienta de <b>auditoría de voz con IA</b> para la Técnica Feynman, permitiendo contrastar tus explicaciones contra tus archivos de Recursos IA en tiempo real.
                </p>

                {/* Formulario de suscripción prioritaria */}
                <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Déjanos tu correo para ser el primero en probarla:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="tu-correo@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
                        isLightMode
                          ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                          : "bg-white/[0.05] border-white/[0.1] text-white placeholder:text-slate-500"
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/25 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Quiero ser el primero en probarla</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              /* Confirmación */
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4
                    className={`font-bold text-base ${
                      isLightMode ? "text-slate-900" : "text-white"
                    }`}
                  >
                    ¡Listo! Te avisaremos de primero
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Guardamos tu correo <b>{email}</b>. Recibirás tu invitación exclusiva apenas esté disponible la versión beta.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowFakeDoor(false);
                    setEmailSubmitted(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs transition cursor-pointer active:scale-95 mt-2"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
