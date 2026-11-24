"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";

interface DatePickerPopoverProps {
  value: string | null;
  onChange: (dateStr: string | null) => void;
  onClose: () => void;
  isLightMode: boolean;
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function formatDateToIso(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function DatePickerPopover({
  value,
  onChange,
  onClose,
  isLightMode,
}: DatePickerPopoverProps) {
  // Determine initial month/year from current value or today
  const initialDate = React.useMemo(() => {
    if (value && value.includes("-")) {
      const parts = value.split("T")[0].split("-");
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
      }
    }
    return new Date();
  }, [value]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  const today = new Date();
  const todayIso = formatDateToIso(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // Quick preset helper
  const handleSelectQuickPreset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const iso = formatDateToIso(d.getFullYear(), d.getMonth(), d.getDate());
    onChange(iso);
    onClose();
  };

  const handleSelectNextMonday = () => {
    const d = new Date();
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
    const daysUntilNextMonday = ((8 - dayOfWeek) % 7) || 7;
    d.setDate(d.getDate() + daysUntilNextMonday);
    const iso = formatDateToIso(d.getFullYear(), d.getMonth(), d.getDate());
    onChange(iso);
    onClose();
  };

  // Month navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Calendar grid calculations
  // First day of month (0 = Sun, 1 = Mon ... 6 = Sat)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday is 0 and Sunday is 6
  const startOffset = (firstDayOfMonth + 6) % 7;

  const daysInCurrentMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const handleSelectDay = (day: number) => {
    const iso = formatDateToIso(currentYear, currentMonth, day);
    onChange(iso);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Selector de fecha"
        className={`absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl select-none ${
          isLightMode
            ? "bg-white/95 border-slate-200/90 shadow-slate-900/15 text-slate-800"
            : "bg-[#0f1222]/95 border-white/[0.12] shadow-black/80 text-white"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Fecha de entrega
          </span>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                onClose();
              }}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Quitar</span>
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-3 gap-1.5 py-3 border-b border-slate-100 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={() => handleSelectQuickPreset(0)}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium text-center transition cursor-pointer ${
              isLightMode
                ? "bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700"
                : "bg-white/[0.05] hover:bg-purple-600/20 hover:text-purple-300 text-slate-300"
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => handleSelectQuickPreset(1)}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium text-center transition cursor-pointer ${
              isLightMode
                ? "bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700"
                : "bg-white/[0.05] hover:bg-purple-600/20 hover:text-purple-300 text-slate-300"
            }`}
          >
            Mañana
          </button>
          <button
            type="button"
            onClick={handleSelectNextMonday}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium text-center transition cursor-pointer ${
              isLightMode
                ? "bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700"
                : "bg-white/[0.05] hover:bg-purple-600/20 hover:text-purple-300 text-slate-300"
            }`}
          >
            Próx. lunes
          </button>
        </div>

        {/* Month / Year Navigator */}
        <div className="flex items-center justify-between pt-3 pb-2 px-1">
          <span className="font-bold text-xs">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Mes anterior"
              className={`p-1 rounded-lg transition cursor-pointer ${
                isLightMode
                  ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                  : "hover:bg-white/[0.08] text-slate-400 hover:text-white"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Mes siguiente"
              className={`p-1 rounded-lg transition cursor-pointer ${
                isLightMode
                  ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                  : "hover:bg-white/[0.08] text-slate-400 hover:text-white"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="text-[10px] font-semibold text-slate-400 uppercase"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Previous month trailing days */}
          {Array.from({ length: startOffset }).map((_, i) => {
            const prevDay = daysInPrevMonth - startOffset + i + 1;
            return (
              <span
                key={`prev_${i}`}
                className="h-7 w-7 mx-auto flex items-center justify-center text-[11px] text-slate-400/40 select-none"
              >
                {prevDay}
              </span>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayIso = formatDateToIso(currentYear, currentMonth, dayNum);
            const isSelected = value === dayIso;
            const isToday = todayIso === dayIso;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleSelectDay(dayNum)}
                className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-150 cursor-pointer relative ${
                  isSelected
                    ? "bg-purple-600 text-white font-bold shadow-sm shadow-purple-600/40 ring-1 ring-purple-400"
                    : isToday
                    ? isLightMode
                      ? "bg-purple-50 text-purple-700 font-bold border border-purple-200 hover:bg-purple-100"
                      : "bg-purple-950/40 text-purple-300 font-bold border border-purple-500/40 hover:bg-purple-900/50"
                    : isLightMode
                    ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {dayNum}
                {isToday && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-purple-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
