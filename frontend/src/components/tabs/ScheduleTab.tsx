"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  User,
  X,
  BookOpen,
  Check,
  GraduationCap,
  FileCheck,
} from "lucide-react";
import { scheduleService, ScheduleBackendItem } from "@/services/scheduleService";
import { useAuth } from "@/context/AuthContext";

const DAYS_OF_WEEK = [
  { id: 1, name: "Lunes", short: "Lun" },
  { id: 2, name: "Martes", short: "Mar" },
  { id: 3, name: "Miércoles", short: "Mié" },
  { id: 4, name: "Jueves", short: "Jue" },
  { id: 5, name: "Viernes", short: "Vie" },
  { id: 6, name: "Sábado", short: "Sáb" },
  { id: 7, name: "Domingo", short: "Dom" },
];

const COLOR_PALETTE = [
  {
    label: "Púrpura",
    value: "#7c3aed",
    bg: "bg-[#160d28]",
    border: "border-[#361a62]",
    lightBg: "bg-purple-50/90",
    lightBorder: "border-purple-200/90",
    lightText: "text-purple-950",
  },
  {
    label: "Azul Índigo",
    value: "#3b82f6",
    bg: "bg-[#0b172a]",
    border: "border-[#1e3a6a]",
    lightBg: "bg-blue-50/90",
    lightBorder: "border-blue-200/90",
    lightText: "text-blue-950",
  },
  {
    label: "Esmeralda",
    value: "#10b981",
    bg: "bg-[#071915]",
    border: "border-[#134237]",
    lightBg: "bg-emerald-50/90",
    lightBorder: "border-emerald-200/90",
    lightText: "text-emerald-950",
  },
  {
    label: "Ámbar",
    value: "#f59e0b",
    bg: "bg-[#1c1407]",
    border: "border-[#4a320b]",
    lightBg: "bg-amber-50/90",
    lightBorder: "border-amber-200/90",
    lightText: "text-amber-950",
  },
  {
    label: "Rojo Rubí",
    value: "#ef4444",
    bg: "bg-[#1c0b0b]",
    border: "border-[#4a1818]",
    lightBg: "bg-red-50/90",
    lightBorder: "border-red-200/90",
    lightText: "text-red-950",
  },
  {
    label: "Rosa",
    value: "#ec4899",
    bg: "bg-[#1f0b18]",
    border: "border-[#4a1336]",
    lightBg: "bg-pink-50/90",
    lightBorder: "border-pink-200/90",
    lightText: "text-pink-950",
  },
  {
    label: "Cian",
    value: "#06b6d4",
    bg: "bg-[#07171d]",
    border: "border-[#113f4e]",
    lightBg: "bg-cyan-50/90",
    lightBorder: "border-cyan-200/90",
    lightText: "text-cyan-950",
  },
  {
    label: "Naranja",
    value: "#f97316",
    bg: "bg-[#1c1006]",
    border: "border-[#4d280c]",
    lightBg: "bg-orange-50/90",
    lightBorder: "border-orange-200/90",
    lightText: "text-orange-950",
  },
];

const SESSION_TYPES = [
  { id: "clase", label: "Clase", icon: GraduationCap },
  { id: "laboratorio", label: "Laboratorio", icon: BookOpen },
  { id: "examen", label: "Examen", icon: FileCheck },
  { id: "tutoria", label: "Tutoría", icon: User },
];

const DEFAULT_LOCAL_SCHEDULE: ScheduleBackendItem[] = [];

interface ScheduleTabProps {
  isLightMode?: boolean;
}

export default function ScheduleTab({ isLightMode = false }: ScheduleTabProps) {
  const { isAuthenticated, user } = useAuth();
  const [viewMode, setViewMode] = useState<"dia" | "semana">("dia");

  // Determinar el día de hoy (1 = Lunes, ..., 7 = Domingo)
  const currentDayOfWeek = (() => {
    const jsDay = new Date().getDay(); // 0 es Domingo, 1 es Lunes
    return jsDay === 0 ? 7 : jsDay;
  })();

  const [selectedDay, setSelectedDay] = useState<number>(currentDayOfWeek);

  const [scheduleItems, setScheduleItems] = useState<ScheduleBackendItem[]>(
    DEFAULT_LOCAL_SCHEDULE
  );
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State para nueva clase con soporte de selección múltiple de días y tipos
  const [formTitulo, setFormTitulo] = useState("");
  const [formDias, setFormDias] = useState<number[]>([selectedDay]);
  const [formHoraInicio, setFormHoraInicio] = useState("08:00");
  const [formHoraFin, setFormHoraFin] = useState("09:30");
  const [formDuracion, setFormDuracion] = useState(90);
  const [formLugar, setFormLugar] = useState("Aula 201");
  const [formColor, setFormColor] = useState("#7c3aed");
  const [formTipos, setFormTipos] = useState<string[]>(["clase"]);
  const [submitting, setSubmitting] = useState(false);

  // Toggle para selección múltiple de días
  const toggleFormDay = (dayId: number) => {
    setFormDias((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev; // Mantener al menos 1 día seleccionado
        return prev.filter((d) => d !== dayId);
      }
      return [...prev, dayId].sort((a, b) => a - b);
    });
  };

  // Toggle para selección múltiple de tipos de sesión
  const toggleSessionType = (tipoId: string) => {
    setFormTipos((prev) => {
      if (prev.includes(tipoId)) {
        if (prev.length === 1) return prev; // Mantener al menos 1 tipo
        return prev.filter((t) => t !== tipoId);
      }
      return [...prev, tipoId];
    });
  };

  // Auto-calcular duración al cambiar hora inicio o fin
  const handleTimeChange = (type: "inicio" | "fin", val: string) => {
    const nextInicio = type === "inicio" ? val : formHoraInicio;
    const nextFin = type === "fin" ? val : formHoraFin;

    if (type === "inicio") setFormHoraInicio(val);
    if (type === "fin") setFormHoraFin(val);

    if (nextInicio && nextFin) {
      const [sh, sm] = nextInicio.split(":").map(Number);
      const [eh, em] = nextFin.split(":").map(Number);
      const diff = eh * 60 + em - (sh * 60 + sm);
      if (diff > 0) setFormDuracion(diff);
    }
  };

  // Cargar horario real desde el backend
  const loadSchedule = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setScheduleItems([]);
      return;
    }
    try {
      setLoading(true);
      const data = await scheduleService.getSchedule();
      if (data && Array.isArray(data)) {
        setScheduleItems(data);
      } else {
        setScheduleItems([]);
      }
    } catch (err) {
      console.warn("No se pudo cargar el horario del backend:", err);
      setScheduleItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    setScheduleItems([]);
    loadSchedule();
  }, [user, isAuthenticated, loadSchedule]);

  // Manejar creación de clase con soporte de múltiples días
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || formDias.length === 0) return;

    setSubmitting(true);
    const tipoLabel = formTipos.join(", ");

    const newItems: ScheduleBackendItem[] = formDias.map((dia, idx) => ({
      id_horario: Date.now() + idx,
      id_usuario: 1,
      titulo: formTitulo.trim(),
      dia_semana: dia,
      hora_inicio: formHoraInicio,
      hora_fin: formHoraFin || undefined,
      duracion_minutos: formDuracion || 90,
      lugar: formLugar.trim() || "Aula",
      color: formColor,
      tipo: tipoLabel,
    }));

    if (isAuthenticated) {
      try {
        const createdItems = await Promise.all(
          newItems.map((item) =>
            scheduleService.createScheduleItem({
              titulo: item.titulo,
              dia_semana: item.dia_semana,
              hora_inicio: item.hora_inicio,
              hora_fin: item.hora_fin,
              duracion_minutos: item.duracion_minutos,
              lugar: item.lugar,
              color: item.color,
              tipo: item.tipo,
            })
          )
        );
        setScheduleItems((prev) => [...prev, ...createdItems]);
      } catch (err) {
        console.error("Error al registrar clases en backend:", err);
        setScheduleItems((prev) => [...prev, ...newItems]);
      }
    } else {
      setScheduleItems((prev) => [...prev, ...newItems]);
    }

    setSubmitting(false);
    setIsModalOpen(false);
    setFormTitulo("");
  };

  // Manejar eliminación de clase
  const handleDeleteClass = async (id_horario: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setScheduleItems((prev) => prev.filter((item) => item.id_horario !== id_horario));

    if (isAuthenticated) {
      try {
        await scheduleService.deleteScheduleItem(id_horario);
      } catch (err) {
        console.error("Error al eliminar clase en backend:", err);
      }
    }
  };

  // Filtrar clases del día seleccionado y ordenar cronológicamente
  const dayClasses = scheduleItems
    .filter((item) => item.dia_semana === selectedDay)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const currentSelectedDayObj = DAYS_OF_WEEK.find((d) => d.id === selectedDay) || DAYS_OF_WEEK[0];

  // Obtener estilo de color visual para cada tarjeta
  const getColorStyle = (hexColor?: string) => {
    const match = COLOR_PALETTE.find((c) => c.value === hexColor);
    if (match) return match;
    return COLOR_PALETTE[0];
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Overview */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLightMode
                  ? "bg-purple-50 text-purple-700 border-purple-200 shadow-xs"
                  : "bg-purple-500/20 text-purple-300 border-white/[0.12]"
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-2xl sm:text-3xl font-editorial font-bold tracking-tight ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              >
                Horario Académico
              </h2>
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isLightMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Cronograma semanal de clases, laboratorios y bloques de estudio
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-600 dark:text-violet-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Sincronizando...</span>
              </div>
            )}
          </div>
        </div>

        {/* View Switcher & Action CTA - Responsivo para pantallas móviles */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
          {/* Día / Semana Pill Switcher */}
          <div
            className={`flex rounded-xl border p-1 transition-colors shrink-0 ${
              isLightMode
                ? "bg-slate-100/90 border-slate-200 shadow-xs"
                : "bg-[#141829] border-[#212744]"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode("dia")}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
                viewMode === "dia"
                  ? isLightMode
                    ? "bg-white text-purple-950 shadow-xs border border-purple-200/80 font-bold"
                    : "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                  : isLightMode
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Día
            </button>
            <button
              type="button"
              onClick={() => setViewMode("semana")}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
                viewMode === "semana"
                  ? isLightMode
                    ? "bg-white text-purple-950 shadow-xs border border-purple-200/80 font-bold"
                    : "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                  : isLightMode
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semana
            </button>
          </div>

          {/* Botón Nueva Clase */}
          <button
            type="button"
            onClick={() => {
              setFormDias([selectedDay]);
              setIsModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
              isLightMode
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/15"
                : "bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white shadow-[#7c5dfa]/20"
            }`}
          >
            <Plus className="w-4 h-4 text-white shrink-0" />
            <span className="text-white">Nueva Clase</span>
          </button>
        </div>
      </div>

      {/* Selector de Días de la Semana: Lunes a Domingo (Diseño 100% responsivo para iPhone y móviles) */}
      {viewMode === "dia" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isLightMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Días de la semana
            </span>
            <span className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
              {dayClasses.length} {dayClasses.length === 1 ? "sesión para" : "sesiones para"}{" "}
              <strong className={isLightMode ? "text-slate-900" : "text-white"}>
                {currentSelectedDayObj.name}
              </strong>
            </span>
          </div>

          {/* Grid de 7 días: compacto en móvil (1 sola fila limpia), expandido en desktop */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isToday = currentDayOfWeek === day.id;
              const isSelected = selectedDay === day.id;
              const classesCount = scheduleItems.filter(
                (i) => i.dia_semana === day.id
              ).length;

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDay(day.id)}
                  className={`flex flex-col items-center justify-center py-2 sm:py-3 px-0.5 sm:px-2 rounded-xl sm:rounded-2xl text-xs font-semibold transition-all border cursor-pointer select-none group relative ${
                    isSelected
                      ? isLightMode
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 border-purple-400 text-white shadow-sm ring-2 ring-purple-300/40 ring-offset-1 ring-offset-white font-bold"
                        : "bg-[#1c2242] border-indigo-500/60 text-white shadow-md shadow-indigo-500/15 ring-1 ring-indigo-500/30 font-bold"
                      : isLightMode
                      ? "bg-white border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50/90 shadow-xs"
                      : "bg-[#0c0e18] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.16] hover:bg-[#121526]"
                  }`}
                  title={`${day.name} (${classesCount} clases)`}
                >
                  <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                    {/* Nombre corto en móvil (Lun, Mar, etc.) y completo en pantalla grande */}
                    <span className="font-bold text-[11px] sm:hidden">{day.short}</span>
                    <span className="font-bold text-xs hidden sm:inline">{day.name}</span>
                    {isToday && (
                      <span
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                          isSelected
                            ? "bg-emerald-300 ring-2 ring-emerald-200"
                            : "bg-emerald-400 ring-2 ring-emerald-500/30"
                        }`}
                        title="Hoy"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className={`text-[9px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-full font-bold transition ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : isLightMode
                          ? classesCount > 0
                            ? "bg-purple-50 text-purple-700 font-semibold border border-purple-200/80"
                            : "bg-slate-100 text-slate-400"
                          : classesCount > 0
                          ? "bg-purple-950/40 text-purple-300 font-semibold border border-purple-500/20"
                          : "bg-slate-800/80 text-slate-400"
                      }`}
                    >
                      {/* En móvil sólo el número, en desktop número + clases */}
                      <span className="sm:hidden">{classesCount > 0 ? classesCount : "-"}</span>
                      <span className="hidden sm:inline">
                        {classesCount} {classesCount === 1 ? "clase" : "clases"}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista Día: Timeline Vertical Dinámica */}
      {viewMode === "dia" ? (
        <div className="relative pl-0 sm:pl-2 max-w-4xl space-y-4">
          {dayClasses.length === 0 ? (
            <div
              className={`rounded-2xl border p-10 text-center space-y-4 ${
                isLightMode
                  ? "bg-white border-slate-200/90 shadow-xs"
                  : "bg-[#0c0e18] border-[#171c2f]"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
                  isLightMode
                    ? "bg-purple-50 border-purple-200 text-purple-600"
                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                }`}
              >
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className={`text-base font-bold ${isLightMode ? "text-slate-900" : "text-white"}`}>
                  Sin clases programadas para el {currentSelectedDayObj.name}
                </h3>
                <p className={`text-xs leading-relaxed ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                  {currentSelectedDayObj.id === 7
                    ? "¡Los domingos son perfectos para recargar energía, organizar pendientes semanales o tener un repaso ligero sin presiones!"
                    : "Aprovecha este bloque para avanzar con tus apuntes, repasar conceptos o relajarte."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormDias([selectedDay]);
                  setIsModalOpen(true);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border shadow-xs ${
                  isLightMode
                    ? "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                    : "bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar clase para el {currentSelectedDayObj.name}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {dayClasses.map((item, idx) => {
                const style = getColorStyle(item.color);
                return (
                  <div key={item.id_horario} className="flex items-center gap-2 sm:gap-5 group min-w-0">
                    {/* Indicador de Hora y Nodo de la Línea de Tiempo (Adaptado para pantallas móviles) */}
                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 w-14 sm:w-24 justify-end relative">
                      <div className="text-right">
                        <span
                          className={`font-mono text-[11px] sm:text-sm font-bold block ${
                            isLightMode ? "text-slate-800" : "text-slate-300"
                          }`}
                        >
                          {item.hora_inicio}
                        </span>
                        {item.hora_fin && (
                          <span
                            className={`font-mono text-[9px] sm:text-[10px] block leading-tight ${
                              isLightMode ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {item.hora_fin}
                          </span>
                        )}
                      </div>

                      {/* Círculo en la línea de tiempo vertical */}
                      <div className="relative flex items-center justify-center">
                        <div
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 shrink-0 z-10 transition-transform group-hover:scale-125 ${
                            isLightMode ? "bg-white shadow-xs" : "bg-[#08090f]"
                          }`}
                          style={{ borderColor: item.color || "#7c3aed" }}
                        />
                        {/* Línea conectora vertical */}
                        {idx < dayClasses.length - 1 && (
                          <div
                            className={`absolute top-3 left-1/2 -translate-x-1/2 w-[1px] h-24 ${
                              isLightMode ? "bg-slate-200" : "bg-[#1e2338]"
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Tarjeta de la Clase (100% responsiva, sin desbordamiento en iPhone) */}
                    <div
                      className={`flex-1 min-w-0 rounded-2xl p-3 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 transition hover:shadow-lg ${
                        isLightMode
                          ? `${style.lightBorder} ${style.lightBg} shadow-xs`
                          : `${style.border} ${style.bg}`
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <h4
                            className={`text-xs sm:text-base font-bold tracking-tight truncate max-w-[170px] sm:max-w-none ${
                              isLightMode ? "text-slate-900" : "text-white"
                            }`}
                          >
                            {item.titulo}
                          </h4>
                          <span
                            className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md capitalize shrink-0"
                            style={{
                              backgroundColor: isLightMode
                                ? `${item.color || "#7c3aed"}18`
                                : `${item.color || "#7c3aed"}20`,
                              color: isLightMode
                                ? item.color === "#f59e0b"
                                  ? "#b45309"
                                  : item.color || "#6366f1"
                                : item.color || "#7c3aed",
                              border: `1px solid ${item.color || "#7c3aed"}40`,
                            }}
                          >
                            {item.tipo === "clase"
                              ? "Clase"
                              : item.tipo === "examen"
                              ? "Examen"
                              : item.tipo || "Clase"}
                          </span>
                        </div>

                        {item.lugar && (
                          <div
                            className={`flex items-center gap-1 text-[11px] sm:text-xs truncate ${
                              isLightMode ? "text-slate-600" : "text-slate-400"
                            }`}
                          >
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{item.lugar}</span>
                          </div>
                        )}
                      </div>

                      {/* Duración y Acciones: en móvil se acomoda armónicamente sin empujar la tarjeta fuera de pantalla */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                        <span
                          className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border ${
                            isLightMode
                              ? "bg-white/95 border-slate-200 text-slate-700 shadow-xs"
                              : "bg-[#141829] border-[#212740] text-slate-400"
                          }`}
                        >
                          {item.duracion_minutos || 90} min
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteClass(item.id_horario, e)}
                          title="Eliminar clase del horario"
                          className={`p-1.5 rounded-lg transition opacity-60 hover:opacity-100 cursor-pointer ${
                            isLightMode
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Vista Semana: Cuadrícula Completa de Lunes a Domingo (Sin "7 días") */
        <div
          className={`rounded-2xl border p-4 sm:p-6 space-y-4 ${
            isLightMode
              ? "bg-white border-slate-200/90 shadow-sm"
              : "bg-[#0c0e18] border-[#171c2f]"
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3
                className={`font-bold text-sm sm:text-base ${
                  isLightMode ? "text-slate-900" : "text-white"
                }`}
              >
                Semana Completa
              </h3>
              <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                Distribución semanal (Lunes a Domingo) con {scheduleItems.length} sesiones en total
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 items-stretch">
            {DAYS_OF_WEEK.map((day) => {
              const isToday = currentDayOfWeek === day.id;
              const classesForDay = scheduleItems
                .filter((item) => item.dia_semana === day.id)
                .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

              return (
                <div
                  key={day.id}
                  className={`rounded-2xl border p-3 flex flex-col justify-between space-y-3 transition-all ${
                    isToday
                      ? isLightMode
                        ? "bg-purple-50/70 border-purple-300 shadow-xs ring-2 ring-purple-200/50"
                        : "bg-[#0e1224] border-indigo-500/50 shadow-md shadow-indigo-500/10"
                      : isLightMode
                      ? "bg-slate-50/70 border-slate-200/80 shadow-xs"
                      : "bg-[#090b14] border-[#181d30]"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between pb-2 border-b ${
                      isLightMode ? "border-slate-200/80" : "border-[#181d30]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold ${
                          isLightMode ? "text-slate-800" : "text-slate-200"
                        }`}
                      >
                        {day.name}
                      </span>
                      {isToday && (
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            isLightMode
                              ? "text-purple-700 bg-purple-100 border-purple-200"
                              : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          }`}
                        >
                          Hoy
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        classesForDay.length > 0
                          ? isLightMode
                            ? "bg-purple-100 text-purple-800"
                            : "bg-purple-950/60 text-purple-300"
                          : isLightMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {classesForDay.length}
                    </span>
                  </div>

                  <div className="space-y-2 min-h-[140px] flex-1">
                    {classesForDay.length === 0 ? (
                      <p
                        className={`text-[11px] italic py-8 text-center ${
                          isLightMode ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Sin clases
                      </p>
                    ) : (
                      classesForDay.map((clase) => {
                        return (
                          <div
                            key={clase.id_horario}
                            className={`p-2.5 rounded-xl border text-left transition group relative shadow-2xs ${
                              isLightMode ? "hover:border-violet-300" : "hover:border-slate-600"
                            }`}
                            style={{
                              backgroundColor: isLightMode
                                ? `${clase.color || "#7c3aed"}14`
                                : `${clase.color || "#7c3aed"}12`,
                              borderColor: isLightMode
                                ? `${clase.color || "#7c3aed"}40`
                                : `${clase.color || "#7c3aed"}35`,
                            }}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[10px] font-mono font-bold ${
                                  isLightMode ? "text-slate-700" : "text-slate-300"
                                }`}
                              >
                                {clase.hora_inicio}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteClass(clase.id_horario, e)}
                                title="Eliminar"
                                className={`opacity-0 group-hover:opacity-100 transition cursor-pointer ${
                                  isLightMode
                                    ? "text-slate-400 hover:text-rose-600"
                                    : "text-slate-400 hover:text-rose-400"
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <h5
                              className={`text-xs font-bold line-clamp-2 leading-tight ${
                                isLightMode ? "text-slate-900" : "text-white"
                              }`}
                            >
                              {clase.titulo}
                            </h5>
                            {clase.lugar && (
                              <p
                                className={`text-[10px] truncate mt-1 ${
                                  isLightMode ? "text-slate-600" : "text-slate-400"
                                }`}
                              >
                                {clase.lugar}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormDias([day.id]);
                      setIsModalOpen(true);
                    }}
                    className={`w-full py-1.5 text-[11px] font-semibold rounded-xl border border-dashed transition flex items-center justify-center gap-1 cursor-pointer select-none ${
                      isLightMode
                        ? "text-slate-600 hover:text-violet-700 hover:bg-violet-50/80 border-slate-300 hover:border-violet-300"
                        : "text-slate-400 hover:text-indigo-300 hover:bg-[#141829] border-[#222842]"
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Registrar Clase en Horario (Limpio y optimizado según peticiones) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            className={`w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150 ${
              isLightMode
                ? "bg-white border-slate-200 text-slate-800 shadow-2xl"
                : "bg-[#0c0e18] border-[#212744] text-white shadow-2xl"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3.5 ${
                isLightMode ? "border-slate-100" : "border-[#1b2034]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isLightMode
                      ? "bg-violet-50 border-violet-200 text-violet-600"
                      : "bg-purple-500/20 border-white/[0.12] text-purple-300"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    className={`font-bold text-base sm:text-lg ${
                      isLightMode ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Registrar Clase en Horario
                  </h3>
                  <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                    Configura la materia, sesión y salón de clase
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isLightMode
                    ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              {/* Título de la Materia */}
              <div className="space-y-1.5">
                <label className={`font-semibold block ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>
                  Nombre de la Materia / Actividad
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cálculo Multivariable, Redes, Laboratorio..."
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none ${
                    isLightMode
                      ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      : "bg-[#121526] border border-[#232948] text-white placeholder:text-slate-500 focus:border-indigo-500"
                  }`}
                />
              </div>

              {/* Tipo de sesión: Selección múltiple (Clase, Laboratorio, Examen, Tutoría) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`font-semibold block ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>
                    Tipo de sesión
                  </label>
                  <span className={`text-[11px] font-medium ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                    {formTipos.length > 1 ? `${formTipos.length} seleccionados` : "Selección múltiple"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {SESSION_TYPES.map((tipo) => {
                    const isTypeSelected = formTipos.includes(tipo.id);
                    const IconComp = tipo.icon;
                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() => toggleSessionType(tipo.id)}
                        className={`session-type-btn p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer select-none ${
                          isTypeSelected
                            ? isLightMode
                              ? "bg-purple-100 text-purple-900 border-purple-400 shadow-xs ring-1 ring-purple-300 font-bold"
                              : "bg-purple-900/60 text-purple-200 border-purple-500 shadow-md ring-1 ring-purple-500/50 font-bold"
                            : isLightMode
                            ? "bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            : "bg-[#121526] border-[#232948] text-slate-400 hover:bg-[#181d34] hover:text-slate-200"
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tipo.label}</span>
                        {isTypeSelected && (
                          <Check className="w-3 h-3 text-purple-600 dark:text-purple-300 shrink-0 ml-0.5" strokeWidth={2.5} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Día de la semana (Selección múltiple con estilo mejorado) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`font-semibold block ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>
                    Días de la semana
                  </label>
                  <span className={`text-[11px] font-medium ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                    Toca para agregar o quitar días
                  </span>
                </div>

                {/* Grid de días Lunes a Domingo sin emojis ni duplicados */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {DAYS_OF_WEEK.map((d) => {
                    const isDaySelected = formDias.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleFormDay(d.id)}
                        className={`day-chip-btn py-2 sm:py-2.5 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer select-none ${
                          isDaySelected
                            ? isLightMode
                              ? "bg-gradient-to-r from-purple-500 to-indigo-500 border-purple-500 text-white font-bold shadow-sm ring-2 ring-purple-300/40"
                              : "bg-[#7c5dfa] border-[#906dfa] text-white font-bold shadow-md shadow-[#7c5dfa]/25 ring-1 ring-indigo-400/40"
                            : isLightMode
                            ? "bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            : "bg-[#121526] border-[#232948] text-slate-400 hover:bg-[#181d34] hover:text-white"
                        }`}
                        title={d.name}
                      >
                        <span className="text-[11px] font-bold">{d.short}</span>
                        {isDaySelected && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isLightMode ? "bg-white" : "bg-purple-200"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Resumen de días seleccionados */}
                <div
                  className={`text-xs flex items-center justify-between px-3 py-2 rounded-xl border transition-colors mt-1.5 ${
                    isLightMode
                      ? "bg-purple-50/70 border-purple-200/80 text-purple-900"
                      : "bg-purple-950/30 border-purple-800/40 text-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="font-semibold text-[11px] shrink-0">
                      {formDias.length === 1 ? "Programada para:" : `${formDias.length} días seleccionados:`}
                    </span>
                    <span className="text-[11px] truncate">
                      {formDias
                        .map((id) => DAYS_OF_WEEK.find((d) => d.id === id)?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                  {formDias.length > 1 && (
                    <span className="text-[10px] opacity-75 shrink-0 hidden sm:inline ml-2">
                      (se creará en cada día)
                    </span>
                  )}
                </div>
              </div>

              {/* Horas (Sin campo de duración, duración calculada automáticamente en el fondo) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`font-semibold block ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={formHoraInicio}
                    onChange={(e) => handleTimeChange("inicio", e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 transition focus:outline-none ${
                      isLightMode
                        ? "bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-purple-400"
                        : "bg-[#121526] border border-[#232948] text-slate-200 focus:border-indigo-500"
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`font-semibold block ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={formHoraFin}
                    onChange={(e) => handleTimeChange("fin", e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 transition focus:outline-none ${
                      isLightMode
                        ? "bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-purple-400"
                        : "bg-[#121526] border border-[#232948] text-slate-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
              </div>

              {/* Salón o Aula (Sin campo de profesor) */}
              <div className="space-y-1.5">
                <label className={`font-semibold block ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>
                  Salón o Aula
                </label>
                <input
                  type="text"
                  placeholder="Ej: Aula 204 / Virtual"
                  value={formLugar}
                  onChange={(e) => setFormLugar(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 transition focus:outline-none ${
                    isLightMode
                      ? "bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-purple-400"
                      : "bg-[#121526] border border-[#232948] text-slate-200 placeholder:text-slate-500 focus:border-indigo-500"
                  }`}
                />
              </div>

              {/* Color distintivo con colores vibrantes y vivos */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`font-semibold block ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>
                    Color distintivo
                  </label>
                  <span className={`text-[11px] font-semibold ${isLightMode ? "text-purple-700" : "text-purple-300"}`}>
                    {COLOR_PALETTE.find((p) => p.value === formColor)?.label || "Personalizado"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                  {COLOR_PALETTE.map((pal) => {
                    const isColorSelected = formColor === pal.value;
                    return (
                      <button
                        key={pal.value}
                        type="button"
                        onClick={() => setFormColor(pal.value)}
                        className={`color-swatch-btn relative w-9 h-9 rounded-full transition-all cursor-pointer border flex items-center justify-center p-0 overflow-hidden shadow-xs ${
                          isLightMode ? "border-slate-300" : "border-white/20"
                        } ${
                          isColorSelected
                            ? isLightMode
                              ? "ring-2 ring-purple-600 ring-offset-2 ring-offset-white scale-110 shadow-md"
                              : "ring-2 ring-white ring-offset-2 ring-offset-[#0c0e18] scale-110 shadow-md"
                            : "hover:scale-105 opacity-90 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: pal.value }}
                        title={pal.label}
                      >
                        {/* Círculo interior para garantizar visibilidad total del color en cualquier navegador */}
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: pal.value }}
                          aria-hidden="true"
                        />
                        {isColorSelected && (
                          <Check className="w-4 h-4 text-white drop-shadow-md relative z-10" strokeWidth={3} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div
                className={`flex items-center justify-end gap-3 pt-4 border-t ${
                  isLightMode ? "border-slate-100" : "border-[#1b2034]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl transition font-medium cursor-pointer ${
                    isLightMode
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-white font-semibold shadow-md transition flex items-center gap-2 cursor-pointer ${
                    isLightMode
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/15"
                      : "bg-[#7c5dfa] hover:bg-[#6c4ae8] shadow-[#7c5dfa]/20"
                  }`}
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
                  <span className="text-white">Guardar Clase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
