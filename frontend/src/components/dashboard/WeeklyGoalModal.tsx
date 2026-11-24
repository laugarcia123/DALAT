"use client";

import React, { useState, useEffect } from "react";
import { X, Target, Check, Clock, Flame, Zap, Trophy, Feather, Compass } from "lucide-react";

interface WeeklyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: number;
  onSave: (newGoal: number) => void;
  isLightMode?: boolean;
}

interface PresetGoal {
  hours: number;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRESET_GOALS: PresetGoal[] = [
  { hours: 10, label: "Ligero", subtitle: "~1.5h al día", icon: Feather },
  { hours: 20, label: "Moderado", subtitle: "~3h al día", icon: Zap },
  { hours: 30, label: "Enfocado", subtitle: "~4.5h al día", icon: Compass },
  { hours: 40, label: "Intensivo", subtitle: "~6h al día", icon: Flame },
  { hours: 50, label: "Avanzado", subtitle: "~7h al día", icon: Trophy },
];

export default function WeeklyGoalModal({
  isOpen,
  onClose,
  currentGoal,
  onSave,
  isLightMode = false,
}: WeeklyGoalModalProps) {
  const [selectedHours, setSelectedHours] = useState<number>(currentGoal || 40);

  useEffect(() => {
    if (isOpen) {
      setSelectedHours(currentGoal || 40);
    }
  }, [isOpen, currentGoal]);

  if (!isOpen) return null;

  const handleSave = () => {
    const valid = Math.max(1, Math.min(100, Math.round(selectedHours)));
    onSave(valid);
    onClose();
  };

  const dailyAverage7d = (selectedHours / 7).toFixed(1);
  const dailyAverage5d = (selectedHours / 5).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-200 z-10 ${
          isLightMode
            ? "bg-white border-slate-200 text-slate-900 shadow-purple-900/10"
            : "bg-[#0d1020] border-white/10 text-white shadow-black/60"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] dark:border-white/[0.08] border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Elige tu Meta Semanal</h3>
              <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                Define cuántas horas deseas dedicar al estudio cada semana
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isLightMode
                ? "hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                : "hover:bg-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Number & Pace Preview */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-600">
              {selectedHours}
            </span>
            <span className="text-2xl font-bold text-slate-400">horas</span>
          </div>

          <p className={`text-xs font-medium ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
            Equivale a <strong className="text-purple-500">~{dailyAverage7d}h</strong> diarias (7 días) o <strong className="text-purple-500">~{dailyAverage5d}h</strong> de lunes a viernes
          </p>
        </div>

        {/* Stepper + Range Slider */}
        <div className="space-y-4 px-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedHours((prev) => Math.max(1, prev - 1))}
              className={`w-10 h-10 rounded-xl font-bold text-lg flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 border ${
                isLightMode
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                  : "bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.10] text-white"
              }`}
            >
              -
            </button>

            <input
              type="range"
              min={1}
              max={80}
              step={1}
              value={selectedHours}
              onChange={(e) => setSelectedHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />

            <button
              type="button"
              onClick={() => setSelectedHours((prev) => Math.min(100, prev + 1))}
              className={`w-10 h-10 rounded-xl font-bold text-lg flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 border ${
                isLightMode
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                  : "bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.10] text-white"
              }`}
            >
              +
            </button>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono px-1">
            <span>1 hora</span>
            <span>40 horas (estándar)</span>
            <span>80 horas</span>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="pt-6 space-y-2">
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
            isLightMode ? "text-slate-500" : "text-slate-400"
          }`}>
            Metas sugeridas
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_GOALS.map((preset) => {
              const isSelected = selectedHours === preset.hours;
              const Icon = preset.icon;
              return (
                <button
                  key={preset.hours}
                  type="button"
                  onClick={() => setSelectedHours(preset.hours)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30 scale-[1.02]"
                      : isLightMode
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200/90 text-slate-700"
                      : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : isLightMode
                          ? "bg-purple-50 text-purple-600 border border-purple-100"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold font-mono">{preset.hours}h</span>
                  </div>
                  <span className={`text-xs font-semibold ${isSelected ? "text-white" : ""}`}>
                    {preset.label}
                  </span>
                  <span className={`text-[10px] ${isSelected ? "text-purple-100" : "text-slate-400"}`}>
                    {preset.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 pt-4 border-t border-white/[0.08] dark:border-white/[0.08] border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isLightMode
                ? "hover:bg-slate-100 text-slate-600"
                : "hover:bg-white/10 text-slate-300"
            }`}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Guardar meta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
