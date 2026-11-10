"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  GraduationCap,
  Building2,
  BookOpen,
  Save,
  CheckCircle2,
  Sparkles,
  Trophy,
  Flame,
  Clock,
  Target,
  Brain,
  BarChart2,
  TrendingUp,
  Star
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
  targetGpa?: string;
  studyStreakDays?: number;
  totalStudyHours?: number;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

const BADGES = [
  {
    id: "streak7",
    title: "Racha Imparable",
    desc: "14 días consecutivos estudiando en Dalat",
    icon: Flame,
    color: "from-amber-500 to-red-500",
    unlocked: true,
  },
  {
    id: "zenMaster",
    title: "Maestro Zen",
    desc: "+20 horas con audio binaural 432 Hz",
    icon: Brain,
    color: "from-purple-500 to-indigo-600",
    unlocked: true,
  },
  {
    id: "gpaTop",
    title: "Excelencia GPA",
    desc: "Promedio simulado proyectado > 4.5",
    icon: Trophy,
    color: "from-emerald-400 to-teal-600",
    unlocked: true,
  },
  {
    id: "earlyBird",
    title: "Enfoque Socrático",
    desc: "50 sesiones completadas con el Tutor IA",
    icon: Sparkles,
    color: "from-cyan-400 to-blue-600",
    unlocked: true,
  },
  {
    id: "repoMaster",
    title: "Colaborador Campus",
    desc: "12 apuntes y resúmenes compartidos",
    icon: BookOpen,
    color: "from-pink-500 to-rose-600",
    unlocked: false,
  },
  {
    id: "nightOwl",
    title: "Búho Nocturno",
    desc: "Sesión de estudio productiva después de las 11 PM",
    icon: Star,
    color: "from-violet-400 to-purple-700",
    unlocked: true,
  },
];

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"academico" | "stats" | "logros">("academico");
  
  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    targetGpa: profile.targetGpa || "4.7 / 5.0",
    studyStreakDays: profile.studyStreakDays || 14,
    totalStudyHours: profile.totalStudyHours || 52.4,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
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
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1100);
  };

  const initial = formData.name.trim() ? formData.name.trim().charAt(0).toUpperCase() : "A";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 selection:bg-[#7c5dfa] selection:text-white">
      <div className="w-full max-w-3xl rounded-3xl bg-[#0a0d1b] border border-[#1e2544] shadow-2xl overflow-hidden my-6 relative animate-in zoom-in-95 duration-150 text-slate-100">
        
        {/* ============================================================= */}
        {/* TOP HERO BANNER: CLEAN COSMIC GRADIENT                         */}
        {/* ============================================================= */}
        <div className="h-28 sm:h-32 w-full bg-gradient-to-r from-[#1c1545] via-[#2f1c6a] to-[#4c27a2] relative overflow-hidden p-4 sm:p-6 flex items-start justify-end">
          {/* Subtle star matrix */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 left-1/3 w-40 h-40 rounded-full bg-[#7c5dfa]/30 blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            type="button"
            className="relative z-10 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition active:scale-95"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================= */}
        {/* AVATAR & QUICK STATS BAR                                      */}
        {/* ============================================================= */}
        <div className="px-6 sm:px-8 pb-4 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            
            {/* Clean Avatar */}
            <div className="flex items-end gap-4">
              <div
                className="w-22 h-22 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-2xl border-4 border-[#0a0d1b] relative shrink-0"
                style={{ backgroundColor: formData.avatarColor || "#5828c6" }}
              >
                <span>{initial}</span>
              </div>

              {/* Identity & Career */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {formData.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-[#7c5dfa]/20 border border-[#7c5dfa]/40 text-[#c4b5fd] text-[10px] font-bold tracking-wide uppercase">
                    Estudiante Dalat
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {formData.career || "Carrera universitaria"} • {formData.university || "Institución"}
                </p>
              </div>
            </div>

            {/* Quick Metrics (Streak, Hours, Target GPA) */}
            <div className="flex items-center gap-2 sm:gap-3 bg-[#0e1224] p-2 sm:p-2.5 rounded-2xl border border-[#1b223f] shrink-0">
              <div className="text-center px-2 sm:px-3 border-r border-[#1e2646]">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-sm sm:text-base">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{formData.studyStreakDays}d</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Racha</div>
              </div>

              <div className="text-center px-2 sm:px-3 border-r border-[#1e2646]">
                <div className="flex items-center justify-center gap-1 text-cyan-300 font-extrabold text-sm sm:text-base">
                  <Clock className="w-4 h-4" />
                  <span>{formData.totalStudyHours}h</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Estudio</div>
              </div>

              <div className="text-center px-2 sm:px-3">
                <div className="flex items-center justify-center gap-1 text-emerald-400 font-extrabold text-sm sm:text-base">
                  <Target className="w-4 h-4" />
                  <span>{formData.targetGpa?.split("/")[0] || "4.7"}</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Meta GPA</div>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* TABS SELECTOR (SOLO 3 PESTAÑAS CLAVE)                         */}
          {/* ============================================================= */}
          <div className="flex items-center gap-1 border-b border-[#181f38] pb-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("academico")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
                activeTab === "academico"
                  ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Información Académica</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
                activeTab === "stats"
                  ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Rendimiento & Horas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("logros")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
                activeTab === "logros"
                  ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Logros & Insignias</span>
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* TAB CONTENTS                                                  */}
        {/* ============================================================= */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: INFORMACIÓN ACADÉMICA */}
          {activeTab === "academico" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Nombre completo</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0e1224] border border-[#1e2646] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                    placeholder="Tu nombre"
                  />
                </div>

                {/* Correo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Correo electrónico o institucional</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0e1224] border border-[#1e2646] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                    placeholder="correo@universidad.edu"
                  />
                </div>

                {/* Carrera */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Carrera / Especialidad</span>
                  </label>
                  <input
                    type="text"
                    value={formData.career}
                    onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                    className="w-full bg-[#0e1224] border border-[#1e2646] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                    placeholder="Ej. Ingeniería de Sistemas"
                  />
                </div>

                {/* Semestre */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Semestre / Período actual</span>
                  </label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full bg-[#0e1224] border border-[#1e2646] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                    placeholder="Ej. 6to Semestre"
                  />
                </div>

                {/* Universidad */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Universidad o Institución</span>
                  </label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full bg-[#0e1224] border border-[#1e2646] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                    placeholder="Ej. Universidad Central"
                  />
                </div>

                {/* Meta de GPA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Meta de Promedio (GPA Target)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.targetGpa}
                    onChange={(e) => setFormData({ ...formData, targetGpa: e.target.value })}
                    className="w-full bg-[#0e1224] border border-[#1e2646] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7c5dfa]"
                    placeholder="Ej. 4.7 / 5.0"
                  />
                </div>
              </div>

              {/* Biografía / Meta de Estudio */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Biografía y Meta Académica</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-[#0e1224] border border-[#1e2646] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#7c5dfa] resize-none leading-relaxed"
                  placeholder="Escribe tus objetivos académicos, materias de interés o metas semestrales..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: RENDIMIENTO & HORAS */}
          {activeTab === "stats" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Resumen Superior */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#0e1224] border border-[#1e2646] space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Concentración Pomodoro</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>94.2%</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-emerald-400 font-medium">+8% que el semestre anterior</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e1224] border border-[#1e2646] space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Sesiones de Estudio</div>
                  <div className="text-2xl font-bold text-cyan-300">42 sesiones</div>
                  <p className="text-[10px] text-slate-400">Promedio de 1.25 hrs por bloque</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e1224] border border-[#1e2646] space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Tasa de Aprobación</div>
                  <div className="text-2xl font-bold text-[#a78bfa]">100%</div>
                  <p className="text-[10px] text-slate-400">Cero materias en riesgo</p>
                </div>
              </div>

              {/* Gráfico Semanal de Horas */}
              <div className="p-5 rounded-2xl bg-[#0e1224] border border-[#1e2646] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-300" />
                    <span>Dedicación Semanal (Últimos 7 días)</span>
                  </h4>
                  <span className="text-[11px] text-indigo-300 font-semibold">Total: 18.5 hrs</span>
                </div>

                <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
                  {[
                    { day: "Lun", hrs: 3.2, h: "70%" },
                    { day: "Mar", hrs: 2.5, h: "55%" },
                    { day: "Mié", hrs: 4.1, h: "90%" },
                    { day: "Jue", hrs: 1.8, h: "40%" },
                    { day: "Vie", hrs: 3.5, h: "78%" },
                    { day: "Sáb", hrs: 2.0, h: "45%" },
                    { day: "Dom", hrs: 1.4, h: "30%" },
                  ].map((bar) => (
                    <div key={bar.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                        {bar.hrs}h
                      </span>
                      <div
                        style={{ height: bar.h }}
                        className="w-full max-w-[28px] rounded-lg bg-gradient-to-t from-[#5828c6] to-cyan-400 transition-all group-hover:brightness-125"
                      />
                      <span className="text-[10px] font-semibold text-slate-400">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materias más estudiadas */}
              <div className="p-5 rounded-2xl bg-[#0e1224] border border-[#1e2646] space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#a78bfa]" />
                  <span>Distribución por Asignatura</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-slate-200">Cálculo Multivariable</span>
                      <span className="text-cyan-300">22.4 hrs (43%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#1b223d] overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: "43%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-slate-200">Estructuras de Datos & Algoritmos</span>
                      <span className="text-[#a78bfa]">18.0 hrs (34%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#1b223d] overflow-hidden">
                      <div className="h-full bg-[#7c5dfa] rounded-full" style={{ width: "34%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-slate-200">Arquitectura de Software</span>
                      <span className="text-emerald-400">12.0 hrs (23%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#1b223d] overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: "23%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGROS & INSIGNIAS */}
          {activeTab === "logros" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#20184c] to-[#121630] border border-[#2b2562]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">5 de 6 Insignias Desbloqueadas</h4>
                    <p className="text-[11px] text-slate-400">Reconocimientos por consistencia y estudio activo</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BADGES.map((b) => {
                  const BIcon = b.icon;
                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                        b.unlocked
                          ? "bg-[#0e1224] border-[#1e2646] hover:border-slate-500"
                          : "bg-[#090b14] border-[#151a2e] opacity-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${b.color} text-white flex items-center justify-center shrink-0 shadow-md`}
                      >
                        <BIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-white truncate">{b.title}</h5>
                          {b.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alert Success */}
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">¡Perfil académico actualizado exitosamente!</span>
            </div>
          )}
        </div>

        {/* ============================================================= */}
        {/* FOOTER ACTIONS                                                */}
        {/* ============================================================= */}
        <div className="p-4 sm:p-6 bg-[#080a14] border-t border-[#181d33] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            Cancelar
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7c5dfa] to-[#6035db] hover:from-[#6d4be0] hover:to-[#502bb8] text-white text-xs font-bold shadow-lg shadow-[#7c5dfa]/25 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
}
