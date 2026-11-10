"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Timer,
  CheckSquare2,
  Flame,
  GraduationCap,
  Plus,
  Tag,
  Calendar,
  Sparkles,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Globe
} from "lucide-react";

import ScheduleTab from "@/components/tabs/ScheduleTab";
import MethodsTab from "@/components/tabs/MethodsTab";
import NotesTab from "@/components/tabs/NotesTab";
import AiResourcesTab from "@/components/tabs/AiResourcesTab";
import RepositoryTab from "@/components/tabs/RepositoryTab";
import ProfileModal, { UserProfile } from "@/components/profile/ProfileModal";
import LoginScreen from "@/components/auth/LoginScreen";
import LandingPage from "@/components/landing/LandingPage";
import { useAuth } from "@/context/AuthContext";

type ColumnId = "urgente" | "en_progreso" | "para_despues";

interface TaskItem {
  id: string;
  title: string;
  subject: string;
  column: ColumnId;
  completed: boolean;
}

const INITIAL_TASKS: TaskItem[] = [
  // Urgente
  {
    id: "1",
    title: "Ensayo de Cálculo — integrales dobles",
    subject: "Cálculo III",
    column: "urgente",
    completed: false,
  },
  {
    id: "2",
    title: "Entregar práctica de Química",
    subject: "Química",
    column: "urgente",
    completed: false,
  },
  {
    id: "3",
    title: "Presentación de Arquitectura",
    subject: "Sistemas",
    column: "urgente",
    completed: false,
  },
  // En Progreso
  {
    id: "4",
    title: "Leer capítulos 7-9 de Economía",
    subject: "Economía",
    column: "en_progreso",
    completed: false,
  },
  {
    id: "5",
    title: "Completar ejercicios del parcial",
    subject: "Cálculo III",
    column: "en_progreso",
    completed: false,
  },
  {
    id: "6",
    title: "Revisar apuntes de Historia",
    subject: "Historia",
    column: "en_progreso",
    completed: false,
  },
  // Para después
  {
    id: "7",
    title: "Cuestionario de Historia Universal",
    subject: "Historia",
    column: "para_despues",
    completed: false,
  },
  {
    id: "8",
    title: "Investigar proyecto final",
    subject: "Arquitectura",
    column: "para_despues",
    completed: false,
  },
  {
    id: "9",
    title: "Leer artículo extra de Economía",
    subject: "Economía",
    column: "para_despues",
    completed: false,
  },
];

export default function StudyDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  // User Profile & Authentication State (Real Backend Sync)
  const { user: authUser, updateProfile: authUpdateProfile, logout: authLogout, isAuthenticated } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: "Andrea",
    email: "andrea.gomez@universidad.edu",
    career: "Ingeniería de Sistemas",
    university: "Universidad Central",
    semester: "6to Semestre",
    bio: "Estudiante enfocada en cálculo multivariable, algoritmos y diseño de sistemas.",
    avatarColor: "#5828c6",
    targetGpa: "4.7 / 5.0",
    studyStreakDays: 14,
    totalStudyHours: 52.4,
  });

  // Sincronizar automáticamente el perfil local cuando el usuario se autentica en backend
  React.useEffect(() => {
    if (authUser) {
      setProfile(authUser);
      setIsLoggedIn(true);
    }
  }, [authUser]);
  
  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<ColumnId>("urgente");
  const [selectedSubject, setSelectedSubject] = useState("General");
  const [showTagMenu, setShowTagMenu] = useState(false);

  // Mobile board column filter tab
  const [mobileColumnTab, setMobileColumnTab] = useState<"todos" | ColumnId>("todos");

  // Zen mode state
  const [zenMode, setZenMode] = useState(false);
  const [zenSeconds, setZenSeconds] = useState(25 * 60);
  const [zenRunning, setZenRunning] = useState(false);

  // Zen timer effect
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (zenMode && zenRunning && zenSeconds > 0) {
      timer = setInterval(() => {
        setZenSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [zenMode, zenRunning, zenSeconds]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 },
              colors: ["#7c5dfa", "#a78bfa", "#34d399", "#f43f5e"],
            });
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      subject: selectedSubject || "General",
      column: selectedColumn,
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const urgentTasks = tasks.filter((t) => t.column === "urgente");
  const inProgressTasks = tasks.filter((t) => t.column === "en_progreso");
  const laterTasks = tasks.filter((t) => t.column === "para_despues");

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const navItems = [
    "Dashboard",
    "Horario",
    "Métodos",
    "Notas",
    "Recursos IA",
    "Repositorio",
  ];

  if (!isLoggedIn) {
    if (showLoginModal) {
      return (
        <LoginScreen
          initialMode={authInitialMode}
          onLogin={(userName, userEmail, userCareer, userUni) => {
            setIsLoggedIn(true);
            setShowLoginModal(false);
            setProfile((prev) => ({
              ...prev,
              name: userName || prev.name,
              email: userEmail || prev.email,
              career: userCareer || prev.career,
              university: userUni || prev.university,
            }));
          }}
          onCancel={() => setShowLoginModal(false)}
          defaultName={profile.name}
          defaultEmail={profile.email}
        />
      );
    }

    return (
      <LandingPage
        onLoginClick={(mode?: "login" | "register") => {
          setAuthInitialMode(mode || "login");
          setShowLoginModal(true);
        }}
        onEnterApp={(userName, userEmail) => {
          if (userName) setProfile((prev) => ({ ...prev, name: userName }));
          if (userEmail) setProfile((prev) => ({ ...prev, email: userEmail }));
          setIsLoggedIn(true);
        }}
      />
    );
  }

  const userInitial = profile.name.trim() ? profile.name.trim().charAt(0).toUpperCase() : "A";

  return (
    <div className="min-h-screen bg-[#08090f] text-slate-100 flex flex-col font-sans selection:bg-[#7c5dfa] selection:text-white">
      {/* Zen Mode Modal / Overlay */}
      {zenMode && (
        <div className="fixed inset-0 z-50 bg-[#07080e]/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 sm:p-12 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#21183c] border border-[#3c2a6d] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#a78bfa]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Modo Zen Dalat</h3>
                <p className="text-xs text-slate-400">Concentración profunda sin distracciones</p>
              </div>
            </div>
            <button
              onClick={() => {
                setZenMode(false);
                setZenRunning(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="text-sm font-medium">Salir del modo zen</span>
            </button>
          </div>

          {/* Zen Center Timer */}
          <div className="text-center my-auto flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-2">
              BLOQUE DE ESTUDIO POMODORO
            </span>
            <div className="text-7xl sm:text-9xl font-mono font-bold tracking-tight text-white mb-6 select-none drop-shadow-[0_0_35px_rgba(124,93,250,0.3)]">
              {formatTimer(zenSeconds)}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setZenRunning(!zenRunning)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-semibold text-base shadow-lg shadow-[#7c5dfa]/30 transition active:scale-95"
              >
                {zenRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{zenRunning ? "Pausar" : "Iniciar enfoque"}</span>
              </button>
              <button
                onClick={() => {
                  setZenRunning(false);
                  setZenSeconds(25 * 60);
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                title="Reiniciar a 25 min"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-10 text-sm text-slate-400 max-w-md italic">
              &ldquo;La concentración es la clave para transformar el tiempo en verdadero aprendizaje.&rdquo;
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Dalat &bull; Modo Enfoque Silencioso
          </div>
        </div>
      )}

      {/* Main Top Navbar */}
      <header className="border-b border-[#141824] bg-[#090b13]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab("Dashboard")}
          >
            <div className="w-8 h-8 rounded-xl bg-[#231a44] border border-[#3b2b73] flex items-center justify-center shadow-md shadow-[#7c5dfa]/10">
              <span className="text-[#a78bfa] font-black text-base">Σ</span>
            </div>
            <span className="font-bold text-base text-white tracking-tight">Dalat</span>
          </div>

          {/* Desktop Center Navigation Pills */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0d101a] p-1 rounded-xl border border-[#1b2033]">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-[#271d49] text-[#c4b5fd] shadow-sm font-semibold border border-[#3e2e74]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#141829]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </nav>

          {/* Right Profile & Date */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
              Jueves, 5 De Noviembre
            </span>
            {/* Right Profile Avatar & Dropdown */}
            <div className="relative">
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center font-bold text-sm text-white shadow-inner cursor-pointer transition hover:scale-105 active:scale-95 select-none"
                style={{ backgroundColor: profile.avatarColor }}
                title="Mi Perfil"
              >
                {userInitial}
              </div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090b13] pointer-events-none"></span>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>

                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#0c0e18] border border-[#212744] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    {/* User summary */}
                    <div className="p-3 rounded-xl bg-[#111425] border border-[#1d233e] flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-white shrink-0 shadow"
                        style={{ backgroundColor: profile.avatarColor }}
                      >
                        {userInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {profile.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="py-1">
                      {/* Option 1: Ver perfil */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-[#15192c] transition"
                      >
                        <User className="w-4 h-4 text-[#a78bfa]" />
                        <span>Ver perfil</span>
                      </button>

                      {/* Option 2: Ir al sitio web / Instituciones */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowLoginModal(false);
                          setIsLoggedIn(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-[#15192c] transition"
                      >
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span>Sitio web / Precios & Campus</span>
                      </button>

                      {/* Option 3: Cerrar sesión */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowLoginModal(false);
                          authLogout();
                          setIsLoggedIn(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-[#111422] text-slate-300 border border-[#1f253d]"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#161a2b] bg-[#0c0e18] px-4 py-3 space-y-1 animate-in slide-in-from-top duration-200">
            <div className="text-xs text-slate-400 mb-2 px-2">
              Jueves, 5 De Noviembre
            </div>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveTab(item);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  activeTab === item
                    ? "bg-[#271d49] text-[#c4b5fd] font-semibold border border-[#3e2e74]"
                    : "text-slate-400 hover:text-white hover:bg-[#131728]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Render Tab 1: Dashboard */}
        {activeTab === "Dashboard" && (
          <div className="space-y-7 animate-in fade-in duration-150">
            {/* Welcome Greeting */}
            <section className="space-y-1.5">
              <h2 className="text-3xl sm:text-4xl font-editorial font-bold tracking-tight text-white flex items-center gap-2">
                Buenos días, {profile.name} <span>👋</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 font-normal">
                Tienes{" "}
                <span className="text-[#a78bfa] font-semibold">
                  {pendingCount} tareas pendientes
                </span>{" "}
                esta semana.
              </p>
            </section>

            {/* 4 Top KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Horas esta semana */}
              <div className="p-5 rounded-2xl bg-[#0c0e18] border border-[#1a1f33] hover:border-[#2f3860] transition-colors relative flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#818cf8]">
                    HORAS ESTA SEMANA
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#1b1f3b] flex items-center justify-center">
                    <Timer className="w-4 h-4 text-[#93c5fd]" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  31h
                </div>
                <div className="text-xs text-slate-400">
                  +3h vs semana pasada
                </div>
              </div>

              {/* Card 2: Tareas */}
              <div className="p-5 rounded-2xl bg-[#0c0e18] border border-[#133027] hover:border-[#1d473a] transition-colors relative flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    TAREAS
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckSquare2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  1/5
                </div>
                <div className="text-xs text-slate-400">
                  2 vencen hoy
                </div>
              </div>

              {/* Card 3: Racha activa */}
              <div className="p-5 rounded-2xl bg-[#0c0e18] border border-[#382715] hover:border-[#52391e] transition-colors relative flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    RACHA ACTIVA
                  </span>
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  12 días
                </div>
                <div className="text-xs text-slate-400">
                  Tu récord: 21 días
                </div>
              </div>

              {/* Card 4: Promedio GPA */}
              <div className="p-5 rounded-2xl bg-[#0c0e18] border border-[#2d1b3f] hover:border-[#462963] transition-colors relative flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c084fc]">
                    PROMEDIO GPA
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#2a173d] flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-[#d8b4fe]" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  8.3
                </div>
                <div className="text-xs text-slate-400">
                  &uarr; 0.3 este semestre
                </div>
              </div>
            </section>

            {/* Quick Add Task Bar */}
            <section className="relative">
              <form
                onSubmit={handleAddTask}
                className="rounded-2xl bg-[#0c0e18] border border-[#1b2033] p-2 sm:p-2.5 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 shadow-lg shadow-black/20"
              >
                <div className="flex items-center pl-3 gap-3 flex-1 min-w-[200px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#818cf8] shrink-0"></span>
                  <input
                    type="text"
                    placeholder="Escribe una nueva tarea aquí..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                {/* Quick selectors & Add button */}
                <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end px-2 sm:px-0">
                  {/* Tag selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTagMenu(!showTagMenu)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141829] border border-[#222842] text-xs font-medium text-slate-300 hover:text-white transition"
                    >
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="capitalize">
                        {selectedColumn === "urgente"
                          ? "Urgente"
                          : selectedColumn === "en_progreso"
                          ? "En Progreso"
                          : "Para después"}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {showTagMenu && (
                      <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-[#101322] border border-[#222842] shadow-2xl p-1.5 z-20 space-y-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedColumn("urgente");
                            setShowTagMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#1a1f38] text-rose-300"
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Urgente
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedColumn("en_progreso");
                            setShowTagMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#1a1f38] text-amber-300"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          En Progreso
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedColumn("para_despues");
                            setShowTagMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#1a1f38] text-emerald-300"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Para después
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subject selector */}
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-[#141829] border border-[#222842] text-xs font-medium text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="Cálculo III">Cálculo III</option>
                    <option value="Economía">Economía</option>
                    <option value="Química">Química</option>
                    <option value="Sistemas">Sistemas</option>
                    <option value="Historia">Historia</option>
                    <option value="Arquitectura">Arquitectura</option>
                    <option value="General">General</option>
                  </select>

                  {/* Calendar button */}
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-[#141829] border border-[#222842] text-slate-400 hover:text-slate-200 transition"
                    title="Fecha límite"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>

                  {/* Add Button */}
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-semibold shadow-md shadow-[#7c5dfa]/20 transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </form>
            </section>

            {/* 2-Column Main Workspace Layout: Kanban Board (Left 2/3) + Widgets (Right 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Tablero de tareas (Kanban) */}
              <section className="lg:col-span-8 rounded-2xl bg-[#0c0e18] border border-[#171c2f] p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white tracking-tight">
                    Tablero de tareas
                  </h3>
                  <span className="text-xs font-medium text-slate-400 bg-[#121627] border border-[#1d233c] px-3 py-1 rounded-full">
                    {pendingCount} pendientes
                  </span>
                </div>

                {/* Mobile Column Switcher (Visible on mobile screens) */}
                <div className="flex md:hidden gap-1.5 overflow-x-auto pb-2 border-b border-[#181d31]">
                  <button
                    onClick={() => setMobileColumnTab("todos")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition ${
                      mobileColumnTab === "todos"
                        ? "bg-[#251d45] text-indigo-300 font-semibold border border-[#3e2e74]"
                        : "text-slate-400 bg-[#121626]"
                    }`}
                  >
                    Todos ({tasks.length})
                  </button>
                  <button
                    onClick={() => setMobileColumnTab("urgente")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition ${
                      mobileColumnTab === "urgente"
                        ? "bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/50"
                        : "text-slate-400 bg-[#121626]"
                    }`}
                  >
                    Urgente ({urgentTasks.length})
                  </button>
                  <button
                    onClick={() => setMobileColumnTab("en_progreso")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition ${
                      mobileColumnTab === "en_progreso"
                        ? "bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/50"
                        : "text-slate-400 bg-[#121626]"
                    }`}
                  >
                    En Progreso ({inProgressTasks.length})
                  </button>
                  <button
                    onClick={() => setMobileColumnTab("para_despues")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition ${
                      mobileColumnTab === "para_despues"
                        ? "bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/50"
                        : "text-slate-400 bg-[#121626]"
                    }`}
                  >
                    Para después ({laterTasks.length})
                  </button>
                </div>

                {/* 3 Columns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1: Urgente */}
                  {(mobileColumnTab === "todos" || mobileColumnTab === "urgente") && (
                    <div className="rounded-xl bg-[#090b14] border border-[#2b1723] p-3 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#201520]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></span>
                          <span className="text-xs font-bold text-slate-200">Urgente</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#f43f5e] bg-[#f43f5e]/10 px-2 py-0.5 rounded-full border border-[#f43f5e]/20">
                          {urgentTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[220px]">
                        {urgentTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none group ${
                              task.completed
                                ? "bg-[#0f111d]/50 border-slate-800/40 opacity-50"
                                : "bg-[#101322] border-[#222842] hover:border-rose-500/40 hover:bg-[#14182b]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                className="mt-0.5 text-slate-400 group-hover:text-rose-400 transition shrink-0"
                              >
                                {task.completed ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-[#f43f5e]/70" />
                                )}
                              </button>
                              <div className="space-y-1">
                                <h4
                                  className={`text-xs sm:text-sm font-medium leading-snug transition ${
                                    task.completed
                                      ? "line-through text-slate-500"
                                      : "text-slate-100 group-hover:text-white"
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                <p className="text-[11px] text-slate-400">{task.subject}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Column 2: En Progreso */}
                  {(mobileColumnTab === "todos" || mobileColumnTab === "en_progreso") && (
                    <div className="rounded-xl bg-[#090b14] border border-[#2b2214] p-3 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#211a12]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                          <span className="text-xs font-bold text-slate-200">En Progreso</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded-full border border-[#f59e0b]/20">
                          {inProgressTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[220px]">
                        {inProgressTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none group ${
                              task.completed
                                ? "bg-[#0f111d]/50 border-slate-800/40 opacity-50"
                                : "bg-[#101322] border-[#222842] hover:border-amber-500/40 hover:bg-[#14182b]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                className="mt-0.5 text-slate-400 group-hover:text-amber-400 transition shrink-0"
                              >
                                {task.completed ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-[#f59e0b]/70" />
                                )}
                              </button>
                              <div className="space-y-1">
                                <h4
                                  className={`text-xs sm:text-sm font-medium leading-snug transition ${
                                    task.completed
                                      ? "line-through text-slate-500"
                                      : "text-slate-100 group-hover:text-white"
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                <p className="text-[11px] text-slate-400">{task.subject}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Column 3: Para después */}
                  {(mobileColumnTab === "todos" || mobileColumnTab === "para_despues") && (
                    <div className="rounded-xl bg-[#090b14] border border-[#112a23] p-3 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#0d211c]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                          <span className="text-xs font-bold text-slate-200">Para después</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/20">
                          {laterTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[220px]">
                        {laterTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none group ${
                              task.completed
                                ? "bg-[#0f111d]/50 border-slate-800/40 opacity-50"
                                : "bg-[#101322] border-[#222842] hover:border-emerald-500/40 hover:bg-[#14182b]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                className="mt-0.5 text-slate-400 group-hover:text-emerald-400 transition shrink-0"
                              >
                                {task.completed ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-[#10b981]/70" />
                                )}
                              </button>
                              <div className="space-y-1">
                                <h4
                                  className={`text-xs sm:text-sm font-medium leading-snug transition ${
                                    task.completed
                                      ? "line-through text-slate-500"
                                      : "text-slate-100 group-hover:text-white"
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                <p className="text-[11px] text-slate-400">{task.subject}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Right: Sidebar Widgets (Meta Semanal + Modo Zen) */}
              <aside className="lg:col-span-4 space-y-6">
                {/* Widget 1: META SEMANAL (Semicircle Gauge) */}
                <div className="rounded-2xl bg-[#0c0e18] border border-[#171c2f] p-6 space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    META SEMANAL
                  </span>

                  {/* Semicircle SVG Gauge */}
                  <div className="flex flex-col items-center justify-center pt-2">
                    <div className="relative w-56 h-32 flex items-end justify-center">
                      <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7c5dfa" />
                            <stop offset="100%" stopColor="#a78bfa" />
                          </linearGradient>
                        </defs>

                        {/* Background track (semi circle arc) */}
                        <path
                          d="M 25 100 A 75 75 0 0 1 175 100"
                          fill="none"
                          stroke="#1a1e31"
                          strokeWidth="16"
                          strokeLinecap="round"
                        />

                        {/* Progress arc: 31h out of 40h = 77.5% */}
                        <path
                          d="M 25 100 A 75 75 0 0 1 175 100"
                          fill="none"
                          stroke="url(#gaugeGradient)"
                          strokeWidth="16"
                          strokeLinecap="round"
                          strokeDasharray="235.6"
                          strokeDashoffset={235.6 * (1 - 0.775)}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>

                      {/* Centered Stats inside the arch */}
                      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                          31h
                        </span>
                        <span className="text-[11px] text-slate-400">de 40h meta</span>
                      </div>
                    </div>

                    {/* Gauge Min and Max Labels */}
                    <div className="w-56 flex justify-between text-xs text-slate-500 font-medium px-2 mt-1">
                      <span>0h</span>
                      <span>40h</span>
                    </div>
                  </div>

                  {/* Progress Summary Footer */}
                  <div className="text-center text-xs pt-1">
                    <span className="font-semibold text-[#818cf8]">78% completado</span>
                    <span className="text-slate-400"> &bull; faltan 9h</span>
                  </div>
                </div>

                {/* Widget 2: Modo Zen Card */}
                <div className="rounded-2xl bg-[#0c0e18] border border-[#171c2f] p-6 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1b1735] border border-[#2f2257] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#a78bfa]" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-white text-base">Modo zen</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Crea un espacio más tranquilo para concentrarte en lo importante.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setZenMode(true);
                      setZenRunning(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-semibold text-xs tracking-wide shadow-lg shadow-[#7c5dfa]/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Activar modo zen</span>
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* Render Tab 2: Horario */}
        {activeTab === "Horario" && (
          <div className="animate-in fade-in duration-150">
            <ScheduleTab />
          </div>
        )}

        {/* Render Tab 3: Métodos */}
        {activeTab === "Métodos" && (
          <div className="animate-in fade-in duration-150">
            <MethodsTab />
          </div>
        )}

        {/* Render Tab 4: Notas */}
        {activeTab === "Notas" && (
          <div className="animate-in fade-in duration-150">
            <NotesTab />
          </div>
        )}

        {/* Render Tab 5: Recursos IA */}
        {activeTab === "Recursos IA" && (
          <div className="animate-in fade-in duration-150">
            <AiResourcesTab />
          </div>
        )}

        {/* Render Tab 6: Repositorio */}
        {activeTab === "Repositorio" && (
          <div className="animate-in fade-in duration-150">
            <RepositoryTab />
          </div>
        )}
      </main>

      {/* Floating Bottom-Right Help Button (?) */}
      <button
        onClick={() => alert("Centro de ayuda y atajos de Dalat")}
        className="fixed bottom-6 right-6 w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center shadow-xl shadow-black/40 transition active:scale-90 z-40"
        title="Ayuda"
        aria-label="Ayuda"
      >
        ?
      </button>

      {/* User Profile Edit Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={profile}
        onSave={async (updated) => {
          setProfile(updated);
          try {
            await authUpdateProfile(updated);
          } catch (err) {
            console.warn("[Profile] Error al sincronizar con backend:", err);
          }
        }}
      />
    </div>
  );
}
