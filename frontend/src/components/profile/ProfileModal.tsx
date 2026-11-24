"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Save,
  CheckCircle2,
  Check,
  Target,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface UserProfile {
  name: string;
  email: string;
  career: string;
  university: string;
  semester: string;
  bio: string;
  avatarColor: string;
  isInstitutional?: boolean;
  tokensBalance?: number;
  plan?: string;
  targetGpa?: string;
  studyStreakDays?: number;
  totalStudyHours?: number;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  isLightMode?: boolean;
}

const AVATAR_COLOR_SWATCHES = [
  { label: "Púrpura Dalat", value: "#5828c6" },
  { label: "Índigo", value: "#4f46e5" },
  { label: "Azul Royal", value: "#2563eb" },
  { label: "Cian", value: "#0284c7" },
  { label: "Esmeralda", value: "#059669" },
  { label: "Ámbar", value: "#d97706" },
  { label: "Rosa Carmesí", value: "#e11d48" },
  { label: "Violeta", value: "#7c3aed" },
];

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  isLightMode = false,
}: ProfileModalProps) {
  // Sincronización reactiva con clase theme-light del DOM
  const [domIsLight, setDomIsLight] = useState<boolean>(() => {
    if (typeof window === "undefined") return Boolean(isLightMode);
    return document.documentElement.classList.contains("theme-light") || Boolean(isLightMode);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkTheme = () => {
      setDomIsLight(document.documentElement.classList.contains("theme-light") || Boolean(isLightMode));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [isLightMode]);

  const activeLight = domIsLight || isLightMode;

  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    targetGpa: profile.targetGpa || "4.7 / 5.0",
    studyStreakDays: profile.studyStreakDays || 14,
    totalStudyHours: profile.totalStudyHours || 52.4,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData({
      ...profile,
      targetGpa: profile.targetGpa || "4.7 / 5.0",
      studyStreakDays: profile.studyStreakDays || 14,
      totalStudyHours: profile.totalStudyHours || 52.4,
    });
    setSavedSuccess(false);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 850);
  };

  const initial = formData.name.trim() ? formData.name.trim().charAt(0).toUpperCase() : "A";

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150 transition-colors ${
          activeLight
            ? "bg-white border-slate-200/90 text-slate-900 shadow-slate-900/15"
            : "bg-[#0b0e1b] border-[#1e2544] text-white shadow-black/80"
        }`}
      >
        {/* ============================================================= */}
        {/* ENCABEZADO DEL MODAL                                          */}
        {/* ============================================================= */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between gap-3 ${
            activeLight ? "border-slate-100 bg-slate-50/50" : "border-[#19203b] bg-[#0e1224]/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeLight ? "bg-purple-100 text-purple-700" : "bg-purple-500/15 text-purple-400"
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
                Editar Perfil
              </h2>
              <p className={`text-xs ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                Personaliza tu nombre, color de avatar y meta académica
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className={`p-2 rounded-xl transition cursor-pointer ${
              activeLight
                ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
            }`}
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================= */}
        {/* CONTENIDO Y FORMULARIO                                        */}
        {/* ============================================================= */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* SECCIÓN AVATAR & SELECTOR DE COLOR VISIBLE */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 ${
              activeLight
                ? "bg-slate-50/80 border-slate-200"
                : "bg-[#0e1224] border-[#1b223f]"
            }`}
          >
            {/* Avatar Preview */}
            <div
              data-avatar="true"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-bold text-2xl !text-white text-white shadow-md border-2 border-white/20 shrink-0 select-none"
              style={{ backgroundColor: formData.avatarColor || "#5828c6", color: "#ffffff" }}
            >
              <span className="!text-white avatar-text" style={{ color: "#ffffff" }}>
                {initial}
              </span>
            </div>

            {/* Selector de Color de Avatar con swatches vibrantes y visibles */}
            <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
              <label className={`text-xs font-semibold block ${activeLight ? "text-slate-700" : "text-slate-200"}`}>
                Color del avatar
              </label>
              <p className={`text-[11px] ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                Elige el tono que te identificará en Dalat
              </p>
              
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                {AVATAR_COLOR_SWATCHES.map((swatch) => {
                  const isSelected = (formData.avatarColor || "#5828c6") === swatch.value;
                  return (
                    <button
                      key={swatch.value}
                      type="button"
                      data-swatch="true"
                      style={{
                        backgroundColor: swatch.value,
                        ["--swatch-color" as string]: swatch.value,
                      }}
                      onClick={() => setFormData({ ...formData, avatarColor: swatch.value })}
                      title={swatch.label}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform cursor-pointer relative flex items-center justify-center active:scale-95 ${
                        isSelected
                          ? "scale-110 ring-2 ring-offset-2 ring-purple-600 shadow-md"
                          : "hover:scale-105 opacity-90 hover:opacity-100"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CAMPOS SIMPLIFICADOS: NOMBRE Y META DE PROMEDIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
                <User className="w-3.5 h-3.5 text-purple-500" />
                <span>Nombre completo</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                  activeLight
                    ? "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-600"
                    : "bg-[#12162a] border border-[#232c4e] text-white placeholder:text-slate-500 focus:border-purple-500"
                }`}
                placeholder="Tu nombre completo"
              />
            </div>

            {/* Meta de GPA Target */}
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
                <Target className="w-3.5 h-3.5 text-purple-500" />
                <span>Meta de Promedio (GPA Target)</span>
              </label>
              <input
                type="text"
                value={formData.targetGpa || ""}
                onChange={(e) => setFormData({ ...formData, targetGpa: e.target.value })}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                  activeLight
                    ? "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-600"
                    : "bg-[#12162a] border border-[#232c4e] text-white placeholder:text-slate-500 focus:border-purple-500"
                }`}
                placeholder="Ej. 4.7 / 5.0"
              />
            </div>
          </div>

          {/* ACCIONES DEL FORMULARIO */}
          <div
            className={`flex items-center justify-end gap-3 pt-4 border-t ${
              activeLight ? "border-slate-100" : "border-[#19203b]"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>¡Cambios Guardados!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
