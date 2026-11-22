"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Plus,
  Tag,
  Calendar,
  Sparkles,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  Globe,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCheck,
  Flame,
  Sun,
  Moon,
  BookOpen,
  Check
} from "lucide-react";

import ScheduleTab from "@/components/tabs/ScheduleTab";
import MethodsTab from "@/components/tabs/MethodsTab";
import NotesTab from "@/components/tabs/NotesTab";
import AiResourcesTab from "@/components/tabs/AiResourcesTab";
import RepositoryTab from "@/components/tabs/RepositoryTab";
import DailyMicroReview from "@/components/dashboard/DailyMicroReview";
import AmbientAudioPlayer from "@/components/dashboard/AmbientAudioPlayer";
import ProfileModal, { UserProfile } from "@/components/profile/ProfileModal";
import LoginScreen from "@/components/auth/LoginScreen";
import LandingPage from "@/components/landing/LandingPage";
import CheckoutPage, { SelectedPlan } from "@/components/landing/CheckoutPage";
import PricingSection from "@/components/landing/PricingSection";
import AmbientBackground from "@/components/ui/AmbientBackground";
import { useAuth } from "@/context/AuthContext";
import { taskService } from "@/services/taskService";
import { studySessionService, StudySessionStats } from "@/services/studySessionService";

type ColumnId = "urgente" | "en_progreso" | "para_despues";

interface TaskItem {
  id: string;
  backendId?: number;
  title: string;
  subject: string;
  column: ColumnId;
  completed: boolean;
  dueDate?: string | null;
}

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getHeaderDateFormatted(dateObj: Date = new Date()): string {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayName = days[dateObj.getDay()];
  const dayNum = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  return `${dayName}, ${dayNum} de ${monthName}`;
}

function getOffsetDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toLocalDateString(d);
}

function formatTaskDateLabel(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    if (!dateStr.includes("-")) return dateStr;
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const targetDate = new Date(year, month, day);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Hoy";
      if (diffDays === 1) return "Mañana";
      if (diffDays === -1) return "Ayer";

      const months = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];
      return `${day} ${months[month]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

const ZEN_SUBJECTS = [
  { id: "General", label: "General", desc: "Estudio libre o variado", color: "bg-indigo-500" },
  { id: "Cálculo III", label: "Cálculo III", desc: "Matemáticas avanzadas", color: "bg-purple-500" },
  { id: "Economía", label: "Economía", desc: "Micro y Macroeconomía", color: "bg-emerald-500" },
  { id: "Química", label: "Química", desc: "Química y laboratorios", color: "bg-rose-500" },
  { id: "Sistemas", label: "Sistemas", desc: "Software y algoritmos", color: "bg-amber-500" },
  { id: "Arquitectura", label: "Arquitectura", desc: "Diseño y estructuras", color: "bg-sky-500" },
];

const INITIAL_TASKS: TaskItem[] = [
  // Urgente
  {
    id: "1",
    title: "Ensayo de Cálculo — integrales dobles",
    subject: "Cálculo III",
    column: "urgente",
    completed: false,
    dueDate: getOffsetDate(1),
  },
  {
    id: "2",
    title: "Entregar práctica de Química",
    subject: "Química",
    column: "urgente",
    completed: false,
    dueDate: getOffsetDate(2),
  },
  {
    id: "3",
    title: "Presentación de Arquitectura",
    subject: "Sistemas",
    column: "urgente",
    completed: false,
    dueDate: getOffsetDate(3),
  },
  // En Progreso
  {
    id: "4",
    title: "Leer capítulos 7-9 de Economía",
    subject: "Economía",
    column: "en_progreso",
    completed: false,
    dueDate: getOffsetDate(4),
  },
  {
    id: "5",
    title: "Completar ejercicios del parcial",
    subject: "Cálculo III",
    column: "en_progreso",
    completed: false,
    dueDate: getOffsetDate(5),
  },
  {
    id: "6",
    title: "Revisar apuntes de Historia",
    subject: "Historia",
    column: "en_progreso",
    completed: false,
    dueDate: getOffsetDate(7),
  },
  // Para después
  {
    id: "7",
    title: "Cuestionario de Historia Universal",
    subject: "Historia",
    column: "para_despues",
    completed: false,
    dueDate: getOffsetDate(9),
  },
  {
    id: "8",
    title: "Investigar proyecto final",
    subject: "Arquitectura",
    column: "para_despues",
    completed: false,
    dueDate: getOffsetDate(11),
  },
  {
    id: "9",
    title: "Leer artículo extra de Economía",
    subject: "Economía",
    column: "para_despues",
    completed: false,
    dueDate: getOffsetDate(13),
  },
];

export default function StudyDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [headerDate, setHeaderDate] = useState<string>("");

  React.useEffect(() => {
    setHeaderDate(getHeaderDateFormatted(new Date()));
    const timer = setInterval(() => {
      setHeaderDate(getHeaderDateFormatted(new Date()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  // User Profile & Authentication State (Real Backend Sync)
  const { user: authUser, updateProfile: authUpdateProfile, logout: authLogout, isAuthenticated } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Theme state: dark / light mode
  const [isLightMode, setIsLightMode] = useState<boolean>(false);

  React.useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("dalat_theme");
      if (savedTheme === "light") {
        queueMicrotask(() => {
          setIsLightMode(true);
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    setIsLightMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dalat_theme", next ? "light" : "dark");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const DEFAULT_PRO_PLAN: SelectedPlan = {
    name: "Dalat PRO Mensual",
    price: "$19.900",
    period: "COP / mes",
    badge: "Acceso Total",
    features: [
      "150 créditos al mes para exámenes, flashcards, resúmenes y guías",
      "Opción 1 optimizada para cualquier materia (1 token / recurso)",
      "Opción 2 especializada en trabajos matemáticos y física",
      "Acceso total al Método Psicópata (Muerte Súbita)",
      "2 GB de almacenamiento en tus repositorios",
      "Soporte de pagos con Nequi, PSE y Tarjeta de Crédito",
    ],
  };

  const [checkoutPlan, setCheckoutPlan] = useState<SelectedPlan | null>(null);
  const [showPricing, setShowPricing] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile>(() => {
    let initialPlan = "basico";
    if (typeof window !== "undefined") {
      try {
        const savedPlan = localStorage.getItem("dalat_user_plan");
        if (savedPlan) initialPlan = savedPlan;
      } catch {}
    }
    return {
      name: "Andrea",
      email: "andrea.gomez@universidad.edu",
      career: "Ingeniería de Sistemas",
      university: "Universidad Central",
      semester: "6to Semestre",
      bio: "Estudiante enfocada en cálculo multivariable, algoritmos y diseño de sistemas.",
      avatarColor: "#5828c6",
      plan: initialPlan,
      targetGpa: "4.7 / 5.0",
      studyStreakDays: 14,
      totalStudyHours: 52.4,
    };
  });

  const [tokensBalance, setTokensBalance] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dalat_user_tokens");
        if (saved !== null) return parseInt(saved, 10);
      } catch {}
    }
    return 150;
  });

  const handleDeductTokens = (amount: number) => {
    setTokensBalance((prev) => {
      const next = Math.max(0, prev - amount);
      try {
        localStorage.setItem("dalat_user_tokens", next.toString());
      } catch {}
      return next;
    });
  };

  const handleGoToCheckout = (plan?: SelectedPlan) => {
    if (plan) {
      setCheckoutPlan(plan);
      setShowPricing(false);
    } else {
      setShowPricing(true);
    }
  };

  // Sincronizar automáticamente el perfil local cuando el usuario se autentica en backend
  React.useEffect(() => {
    if (authUser) {
      queueMicrotask(() => {
        setProfile(authUser);
        setIsLoggedIn(true);
      });
    }
  }, [authUser]);
  
  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<ColumnId>("urgente");
  const [selectedSubject, setSelectedSubject] = useState("General");
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [newTaskDueDate, setNewTaskDueDate] = useState<string | null>(null);
  const [showDateMenu, setShowDateMenu] = useState(false);

  const AVAILABLE_SUBJECTS = [
    "Cálculo III",
    "Economía",
    "Química",
    "Sistemas",
    "Historia",
    "Arquitectura",
    "General",
  ];

  const SUBJECT_COLORS: Record<string, string> = {
    "Cálculo III": "bg-violet-500",
    "Economía": "bg-emerald-500",
    "Química": "bg-amber-500",
    "Sistemas": "bg-sky-500",
    "Historia": "bg-orange-500",
    "Arquitectura": "bg-rose-500",
    "General": "bg-indigo-500",
  };

  // Mobile board column filter tab
  const [mobileColumnTab, setMobileColumnTab] = useState<"todos" | ColumnId>("todos");

  // Collapsed columns state (Enfoque B) with localStorage persistence
  const [collapsedColumns, setCollapsedColumns] = useState<Record<ColumnId, boolean>>({
    urgente: false,
    en_progreso: false,
    para_despues: false,
  });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("dalat_collapsed_columns");
      if (saved) {
        const parsed = JSON.parse(saved);
        queueMicrotask(() => {
          setCollapsedColumns((prev) => ({ ...prev, ...parsed }));
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleColumnCollapse = (colId: ColumnId) => {
    setCollapsedColumns((prev) => {
      const next = { ...prev, [colId]: !prev[colId] };
      try {
        localStorage.setItem("dalat_collapsed_columns", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const allColumnsCollapsed = Object.values(collapsedColumns).every(Boolean);

  const toggleAllColumns = () => {
    const nextState = !allColumnsCollapsed;
    const next: Record<ColumnId, boolean> = {
      urgente: nextState,
      en_progreso: nextState,
      para_despues: nextState,
    };
    setCollapsedColumns(next);
    try {
      localStorage.setItem("dalat_collapsed_columns", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Zen mode & Study Sessions state
  const [zenMode, setZenMode] = useState(false);
  const [zenInitialSeconds, setZenInitialSeconds] = useState(25 * 60);
  const [zenSeconds, setZenSeconds] = useState(25 * 60);
  const [zenRunning, setZenRunning] = useState(false);
  const [zenSubject, setZenSubject] = useState("General");
  const [zenSubjectDropdownOpen, setZenSubjectDropdownOpen] = useState(false);
  const zenSubjectDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        zenSubjectDropdownRef.current &&
        !zenSubjectDropdownRef.current.contains(event.target as Node)
      ) {
        setZenSubjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [zenSavedToast, setZenSavedToast] = useState(false);
  const [studyStats, setStudyStats] = useState<StudySessionStats | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Cargar estadísticas de estudio (racha, horas de la semana, meta)
  const loadStudyStats = React.useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const stats = await studySessionService.getStats();
      if (stats) {
        setStudyStats(stats);
        setProfile((prev) => ({
          ...prev,
          studyStreakDays: stats.racha_dias_actual,
          totalStudyHours: stats.total_horas_historicas,
        }));
      }
    } catch (err) {
      console.warn("No se pudieron cargar las estadísticas de estudio:", err);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    void (async () => {
      await loadStudyStats();
    })();
  }, [loadStudyStats]);

  // Completar o registrar sesión de estudio en backend
  const handleCompleteZenSession = async (completed: boolean = true) => {
    const elapsedSeconds = zenInitialSeconds - zenSeconds;
    const durationToSave = completed ? zenInitialSeconds : elapsedSeconds;

    setZenRunning(false);

    if (durationToSave >= 30) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7c5dfa", "#a78bfa", "#34d399", "#f59e0b"],
      });

      if (isAuthenticated) {
        try {
          await studySessionService.logSession({
            duracion_segundos: durationToSave,
            materia: zenSubject || "General",
            completada: completed,
            tipo: "zen",
          });
          await loadStudyStats();
        } catch (err) {
          console.error("Error al registrar sesión en backend:", err);
        }
      }
      setZenSavedToast(true);
      setTimeout(() => setZenSavedToast(false), 3500);
    }

    setZenMode(false);
    setZenSeconds(zenInitialSeconds);
  };

  // Cargar tareas reales desde el backend cuando el usuario inicia sesión
  const loadTasks = React.useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingTasks(true);
      const backendTasks = await taskService.getTasks();
      if (backendTasks && backendTasks.length > 0) {
        setTasks(
          backendTasks.map((t) => ({
            id: String(t.id_tarea),
            backendId: t.id_tarea,
            title: t.titulo,
            subject: t.materia || "General",
            column: (t.columna as ColumnId) || "urgente",
            completed: !!t.completada,
            dueDate: t.fecha_limite || undefined,
          }))
        );
      }
    } catch (err) {
      console.warn("No se pudieron cargar las tareas desde el backend, usando locales:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    void (async () => {
      await loadTasks();
    })();
  }, [loadTasks]);

  // Zen timer effect
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (zenMode && zenRunning && zenSeconds > 0) {
      timer = setInterval(() => {
        setZenSeconds((prev) => prev - 1);
      }, 1000);
    } else if (zenMode && zenRunning && zenSeconds === 0) {
      setZenRunning(false);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#7c5dfa", "#f59e0b"],
      });
    }
    return () => clearInterval(timer);
  }, [zenMode, zenRunning, zenSeconds]);

  const toggleTask = async (id: string) => {
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;
    const nextCompleted = !targetTask.completed;

    if (nextCompleted) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#7c5dfa", "#a78bfa", "#34d399", "#f43f5e"],
      });
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );

    if (targetTask.backendId) {
      try {
        await taskService.updateTask(targetTask.backendId, { completada: nextCompleted });
      } catch (err) {
        console.error("Error al actualizar tarea en backend:", err);
      }
    }
  };

  const moveTask = async (id: string, newColumn: ColumnId, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, column: newColumn } : t))
    );

    if (targetTask.backendId) {
      try {
        await taskService.updateTask(targetTask.backendId, { columna: newColumn });
      } catch (err) {
        console.error("Error al mover tarea en backend:", err);
      }
    }
  };

  const deleteTask = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetTask = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (targetTask?.backendId) {
      try {
        await taskService.deleteTask(targetTask.backendId);
      } catch (err) {
        console.error("Error al eliminar tarea en backend:", err);
      }
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const tempId = Date.now().toString();
    const title = newTaskTitle.trim();
    const subject = selectedSubject || "General";
    const column = selectedColumn;

    const localTask: TaskItem = {
      id: tempId,
      title,
      subject,
      column,
      completed: false,
      dueDate: newTaskDueDate || undefined,
    };

    setTasks((prev) => [localTask, ...prev]);
    setNewTaskTitle("");
    setNewTaskDueDate(null);

    if (isAuthenticated) {
      try {
        const created = await taskService.createTask({
          titulo: title,
          materia: subject,
          columna: column,
          completada: false,
          fecha_limite: newTaskDueDate || null,
        });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === tempId ? { ...t, id: String(created.id_tarea), backendId: created.id_tarea } : t
          )
        );
      } catch (err) {
        console.error("Error al guardar tarea en backend:", err);
      }
    }
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

  // Renderizar Vista de Planes y Precios (Microsuscripciones vs Mensual / Anual)
  if (showPricing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c0e1e] via-[#090b17] to-[#070812] text-slate-100 flex flex-col font-sans selection:bg-[#7c5dfa] selection:text-white relative overflow-x-hidden">
        {/* Delicate Blueprint Grid Pattern */}
        <div
          className="fixed inset-0 pointer-events-none opacity-40 z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Floating Cosmic Particles */}
        <AmbientBackground isLightMode={false} />

        {/* Luminous Ambient Aurora Glow Orbs */}
        <div className="fixed top-0 left-1/4 w-[750px] h-[450px] bg-gradient-to-br from-purple-600/25 via-indigo-600/20 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="fixed top-1/3 right-0 w-[650px] h-[550px] bg-gradient-to-bl from-indigo-500/20 via-sky-500/15 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="fixed bottom-0 left-1/3 w-[700px] h-[400px] bg-gradient-to-t from-fuchsia-600/18 via-purple-700/15 to-transparent rounded-full blur-[160px] pointer-events-none z-0" />

        {/* Header con botón para volver al Dashboard */}
        <header className="border-b border-white/[0.08] bg-[#090b13]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div
              className="flex items-center gap-1.5 cursor-pointer group py-1 select-none"
              onClick={() => {
                setShowPricing(false);
              }}
            >
              <img
                src="/icono-dalat.png"
                alt="Dalat Robot"
                className="h-9 sm:h-10 w-9 sm:w-10 object-contain transition-transform group-hover:scale-105 drop-shadow-md -mr-0.5"
              />
              <img
                src="/dalat-logo-v2.png"
                alt="Dalat"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>

            <button
              onClick={() => {
                setShowPricing(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la aplicación</span>
            </button>
          </div>
        </header>

        <main className="flex-1 py-8">
          <PricingSection
            onChoosePlan={(chosenPlan) => {
              setCheckoutPlan(chosenPlan);
              setShowPricing(false);
            }}
            onEnterApp={() => {
              setShowPricing(false);
            }}
          />
        </main>
      </div>
    );
  }

  // Renderizar la Pasarela de Pago dedicada (Checkout) si se solicitó comprar un plan
  if (checkoutPlan) {
    return (
      <CheckoutPage
        plan={checkoutPlan}
        user={{ name: profile.name, email: profile.email }}
        onUserLoginOrRegister={(name, email) => {
          setProfile((prev) => ({ ...prev, name, email }));
        }}
        onBackToPricing={() => {
          setShowPricing(true);
        }}
        onPaymentSuccess={() => {
          setProfile((prev) => ({ ...prev, plan: "pro" }));
          const creditsToAdd = checkoutPlan.name.includes("Sprint")
            ? 40
            : checkoutPlan.name.includes("Corte")
            ? 80
            : 150;
          setTokensBalance(creditsToAdd);
          try {
            localStorage.setItem("dalat_user_plan", "pro");
            localStorage.setItem("dalat_user_tokens", String(creditsToAdd));
          } catch {}
          setCheckoutPlan(null);
          setShowPricing(false);
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }}
      />
    );
  }

  const userInitial = profile.name.trim() ? profile.name.trim().charAt(0).toUpperCase() : "A";

  return (
    <div
      className={`min-h-screen ${
        isLightMode ? "theme-light bg-[#f8fafc] text-slate-800" : "bg-[#08090f] text-slate-100"
      } flex flex-col font-sans selection:bg-[#7c5dfa] selection:text-white transition-colors duration-200 relative overflow-x-hidden`}
    >
            {/* Zen Mode Modal / Overlay */}
      {zenMode && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 animate-in fade-in duration-300 ${
            isLightMode
              ? "bg-gradient-to-b from-white/98 via-slate-50/98 to-indigo-50/50 backdrop-blur-2xl text-slate-800"
              : "bg-[#07080e]/95 backdrop-blur-xl text-white"
          }`}
        >
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isLightMode
                    ? "bg-indigo-100 border border-indigo-200 text-indigo-600"
                    : "bg-[#21183c] border border-[#3c2a6d] text-[#a78bfa]"
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className={`font-semibold ${
                    isLightMode ? "text-slate-900" : "text-white"
                  }`}
                >
                  Modo Zen Dalat
                </h3>
                <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                  Concentración profunda y registro de estudio
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCompleteZenSession(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 ${
                isLightMode
                  ? "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm"
                  : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Minimize2 className="w-4 h-4" />
              <span className="text-sm font-medium">Salir del modo zen</span>
            </button>
          </div>

          {/* Zen Center Timer & Controls */}
          <div className="text-center my-auto flex flex-col items-center max-w-xl w-full">
            {/* Presets & Subject */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {/* Preset Durations */}
              <div
                className={`flex rounded-xl p-1 ${
                  isLightMode
                    ? "bg-white border border-slate-200 shadow-sm"
                    : "bg-[#121528] border border-[#222846]"
                }`}
              >
                {[
                  { label: "15 min", seconds: 15 * 60 },
                  { label: "25 min", seconds: 25 * 60 },
                  { label: "45 min", seconds: 45 * 60 },
                  { label: "60 min", seconds: 60 * 60 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setZenInitialSeconds(preset.seconds);
                      setZenSeconds(preset.seconds);
                      setZenRunning(false);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      zenInitialSeconds === preset.seconds
                        ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                        : isLightMode
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Subject Selector Dropdown */}
              <div className="relative" ref={zenSubjectDropdownRef}>
                <button
                  type="button"
                  onClick={() => setZenSubjectDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer ${
                    isLightMode
                      ? "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-sm"
                      : "bg-[#121528] hover:bg-[#1a1f3a] border border-[#222846] text-slate-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ZEN_SUBJECTS.find((s) => s.id === zenSubject)?.color || "bg-indigo-500"
                    }`}
                  />
                  <span>Materia: {zenSubject}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      zenSubjectDropdownOpen ? "rotate-180" : ""
                    } ${isLightMode ? "text-slate-500" : "text-slate-400"}`}
                  />
                </button>

                {zenSubjectDropdownOpen && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-64 rounded-2xl border p-1.5 z-50 shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
                      isLightMode
                        ? "bg-white/95 backdrop-blur-md border-slate-200 shadow-slate-200/50 text-slate-800"
                        : "bg-[#111428]/95 backdrop-blur-xl border-[#222a50] shadow-black/50 text-white"
                    }`}
                  >
                    <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-[#1d2240] text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Seleccionar Asignatura
                    </div>
                    <div className="space-y-0.5">
                      {ZEN_SUBJECTS.map((sub) => {
                        const isSelected = zenSubject === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setZenSubject(sub.id);
                              setZenSubjectDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                              isSelected
                                ? isLightMode
                                  ? "bg-indigo-50 text-indigo-900 font-bold"
                                  : "bg-indigo-600/20 text-indigo-300 font-bold"
                                : isLightMode
                                ? "hover:bg-slate-50 text-slate-700"
                                : "hover:bg-[#181d38] text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${sub.color}`} />
                              <div className="truncate">
                                <p className="text-xs font-semibold leading-tight">{sub.label}</p>
                                <p className="text-[10px] text-slate-400 leading-tight truncate">
                                  {sub.desc}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <span
              className={`text-xs uppercase tracking-widest font-semibold mb-2 ${
                isLightMode ? "text-indigo-600" : "text-indigo-400"
              }`}
            >
              BLOQUE DE ENFOQUE {zenSubject !== "General" ? `— ${zenSubject.toUpperCase()}` : ""}
            </span>

            <div
              className={`text-7xl sm:text-9xl font-mono font-bold tracking-tight mb-8 select-none ${
                isLightMode
                  ? "text-slate-900 drop-shadow-[0_10px_35px_rgba(99,102,241,0.12)]"
                  : "text-white drop-shadow-[0_0_35px_rgba(124,93,250,0.3)]"
              }`}
            >
              {formatTimer(zenSeconds)}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setZenRunning(!zenRunning)}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-base shadow-xl shadow-indigo-500/25 transition active:scale-95 cursor-pointer"
              >
                {zenRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{zenRunning ? "Pausar" : "Iniciar enfoque"}</span>
              </button>

              <button
                onClick={() => {
                  setZenRunning(false);
                  setZenSeconds(zenInitialSeconds);
                }}
                className={`p-3.5 rounded-2xl transition cursor-pointer active:scale-95 ${
                  isLightMode
                    ? "bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
                    : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                }`}
                title="Reiniciar temporizador"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Botón Guardar sesión: INACTIVO mientras no se acabe el conteo */}
              <button
                type="button"
                disabled={zenSeconds > 0}
                onClick={() => handleCompleteZenSession(true)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm transition ${
                  zenSeconds > 0
                    ? isLightMode
                      ? "bg-slate-100 border border-slate-200 text-slate-400 opacity-50 cursor-not-allowed shadow-none"
                      : "bg-slate-900/60 border border-slate-800 text-slate-600 opacity-40 cursor-not-allowed shadow-none"
                    : isLightMode
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer ring-2 ring-emerald-500 ring-offset-2 ring-offset-white animate-pulse"
                    : "bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer ring-2 ring-emerald-500/50 animate-pulse"
                }`}
                title={
                  zenSeconds > 0
                    ? `Completa los ${Math.round(zenInitialSeconds / 60)} min para guardar la sesión`
                    : "¡Conteo finalizado! Guardar sesión y sumar a tu racha"
                }
              >
                <CheckCheck
                  className={`w-4 h-4 ${
                    zenSeconds === 0
                      ? isLightMode
                        ? "text-white"
                        : "text-emerald-400"
                      : "text-slate-400"
                  }`}
                />
                <span>
                  {zenSeconds === 0 ? "¡Guardar sesión de estudio!" : "Guardar sesión"}
                </span>
              </button>
            </div>

            {/* Mensaje de guía dinámico */}
            {zenSeconds > 0 ? (
              <p className={`text-xs mt-3 ${isLightMode ? "text-slate-400" : "text-slate-500"}`}>
                El botón de guardar se activará cuando finalice el conteo regresivo.
              </p>
            ) : (
              <p className="text-xs mt-3 text-emerald-600 font-semibold animate-pulse">
                🎉 ¡Conteo finalizado! Haz clic en guardar sesión para registrar tus horas y racha.
              </p>
            )}

            <p
              className={`mt-6 text-sm italic ${
                isLightMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              &ldquo;La concentración es la clave para transformar el tiempo en verdadero aprendizaje.&rdquo;
            </p>
          </div>

          <div
            className={`text-xs flex items-center gap-2 ${
              isLightMode ? "text-slate-500" : "text-slate-500"
            }`}
          >
            <span>Dalat &bull; Modo Enfoque Silencioso</span>
            {studyStats && (
              <span className="text-amber-500 font-medium">
                &bull; Racha actual: {studyStats.racha_dias_actual} días 🔥
              </span>
            )}
          </div>
        </div>
      )}

      {/* Floating Toast Notification when study session is saved */}
      {zenSavedToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#101428] border border-emerald-500/50 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">¡Sesión de estudio registrada!</h5>
            <p className="text-[11px] text-slate-400">Tus horas y racha se han actualizado en Dalat.</p>
          </div>
        </div>
      )}

      {/* Main Top Navbar */}
      <header className="border-b border-[#141824] bg-[#090b13]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand */}
          <div
            className="flex items-center gap-1.5 cursor-pointer group py-1 select-none"
            onClick={() => setActiveTab("Dashboard")}
          >
            <img
              src="/icono-dalat.png"
              alt="Dalat Robot"
              className="h-9 sm:h-10 w-9 sm:w-10 object-contain transition-transform group-hover:scale-105 drop-shadow-md -mr-0.5"
            />
            <img
              src="/dalat-logo-v2.png"
              alt="Dalat"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            {/* Etiqueta a un lado de Dalat */}
            <span
              className={`ml-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold tracking-tight font-badge select-none border transition-all shadow-2xs ${
                profile.plan === "pro"
                  ? "bg-amber-400/15 border-amber-400/40 text-amber-500 dark:text-amber-400"
                  : isLightMode
                  ? "bg-purple-100/90 text-purple-700 border-purple-200"
                  : "bg-[#18152c] text-purple-300 border-purple-500/30"
              }`}
            >
              {profile.plan === "pro" ? "Plan PRO" : "Plan Básico"}
            </span>
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

          {/* Right Profile, Theme Toggle & Date */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              suppressHydrationWarning
              className={`hidden sm:inline-block text-xs font-medium ${
                isLightMode ? "text-slate-600 font-semibold" : "text-slate-400"
              }`}
            >
              {headerDate || getHeaderDateFormatted()}
            </span>

            {/* Indicador de Racha de Estudio (solo fuego y número, sin contorno) */}
            <div
              className="inline-flex items-center gap-1.5 select-none transition-transform hover:scale-105"
              title="Racha de estudio"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 drop-shadow-xs" />
              <span className="font-extrabold text-xs sm:text-sm font-mono text-amber-600 dark:text-amber-400">
                {profile.studyStreakDays || 14}
              </span>
            </div>

            {/* Theme Toggle Button (Dark / Light Mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm ${
                isLightMode
                  ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600 shadow-amber-900/10"
                  : "bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.10] text-amber-400 hover:text-amber-300"
              }`}
              title={isLightMode ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
              aria-label="Cambiar tema de la página"
            >
              {isLightMode ? (
                <Moon className="w-4 h-4 text-purple-600 transition-transform hover:-rotate-12 duration-200" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45 duration-200" />
              )}
            </button>
            {/* Right Profile Avatar & Dropdown */}
            <div className="relative">
              <div
                data-avatar="true"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center font-bold text-sm !text-white text-white shadow-inner cursor-pointer transition hover:scale-105 active:scale-95 select-none"
                style={{ backgroundColor: profile.avatarColor, color: "#ffffff" }}
                title="Mi Perfil"
              >
                <span className="!text-white avatar-text" style={{ color: "#ffffff" }}>
                  {userInitial}
                </span>
              </div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090b13] pointer-events-none"></span>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>

                  <div
                    className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 ${
                      isLightMode
                        ? "bg-white border-slate-200 shadow-xl shadow-slate-900/10"
                        : "bg-[#0c0e18] border-[#212744] shadow-2xl"
                    }`}
                  >
                    {/* User summary */}
                    <div
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        isLightMode
                          ? "bg-purple-50/90 border-purple-200/80 shadow-xs"
                          : "bg-[#111425] border-[#1d233e]"
                      }`}
                    >
                      <div
                        data-avatar="true"
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base !text-white text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: profile.avatarColor, color: "#ffffff" }}
                      >
                        <span className="!text-white avatar-text" style={{ color: "#ffffff" }}>
                          {userInitial}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`text-xs font-bold truncate ${
                            isLightMode ? "text-slate-900" : "text-white"
                          }`}
                        >
                          {profile.name}
                        </h4>
                        <p
                          className={`text-[10px] truncate ${
                            isLightMode ? "text-purple-700/80 font-medium" : "text-slate-400"
                          }`}
                        >
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="py-1 space-y-1">
                      {/* Option: Mejorar a PRO (solo para usuarios del plan básico) */}
                      {profile.plan !== "pro" && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleGoToCheckout();
                          }}
                          className={`w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isLightMode
                              ? "bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 border border-purple-200/90 shadow-2xs"
                              : "bg-gradient-to-r from-purple-950/50 to-indigo-950/50 hover:from-purple-900/60 hover:to-indigo-900/60 text-purple-200 border border-purple-500/30"
                          }`}
                        >
                          <span>Mejorar a PRO</span>
                        </button>
                      )}

                      {/* Option 1: Editar perfil */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                          isLightMode
                            ? "text-slate-700 hover:text-purple-700 hover:bg-purple-50/70"
                            : "text-slate-200 hover:text-white hover:bg-[#15192c]"
                        }`}
                      >
                        <User className={`w-4 h-4 ${isLightMode ? "text-purple-600" : "text-[#a78bfa]"}`} />
                        <span>Editar perfil</span>
                      </button>

                      {/* Option 2: Cerrar sesión */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowLoginModal(false);
                          authLogout();
                          setIsLoggedIn(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                          isLightMode
                            ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            : "text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                        }`}
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
              className={`lg:hidden p-2 rounded-lg border transition active:scale-95 cursor-pointer ${
                isLightMode
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  : "bg-[#111422] hover:bg-[#1a2035] text-slate-300 border-[#1f253d]"
              }`}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden border-t px-4 py-3 space-y-1 animate-in slide-in-from-top duration-200 ${
              isLightMode
                ? "border-slate-200 bg-white/95 backdrop-blur-md shadow-lg"
                : "border-[#161a2b] bg-[#0c0e18]"
            }`}
          >
            <div
              suppressHydrationWarning
              className={`text-xs mb-2 px-2 font-medium ${
                isLightMode ? "text-slate-600 font-semibold" : "text-slate-400"
              }`}
            >
              {headerDate || getHeaderDateFormatted()}
            </div>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveTab(item);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition cursor-pointer ${
                  activeTab === item
                    ? isLightMode
                      ? "bg-purple-50 text-purple-700 font-semibold border border-purple-200 shadow-xs"
                      : "bg-[#271d49] text-[#c4b5fd] font-semibold border border-[#3e2e74]"
                    : isLightMode
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                    : "text-slate-400 hover:text-white hover:bg-[#131728] border border-transparent"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-7 min-w-0">
        {/* Render Tab 1: Dashboard */}
        {activeTab === "Dashboard" && (
          <div className="space-y-7 animate-in fade-in duration-150">
            {/* Header Banner con Tutor Dalat & dalat-saludo-header.png */}
            <section className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-r from-[#140e34] via-[#1a1244] to-[#261559] p-6 sm:p-7 lg:p-8 shadow-2xl shadow-purple-950/30 min-h-[160px] sm:min-h-[175px] md:min-h-[190px] lg:min-h-[205px] flex flex-col md:flex-row items-center md:items-center justify-between">
              {/* Cosmic glowing auras in background */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 75% 30%, rgba(168, 85, 247, 0.4), transparent 60%), linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
                  backgroundSize: "100% 100%, 28px 28px, 28px 28px",
                }}
              />

              {/* Left content */}
              <div className="relative z-10 space-y-2.5 text-center md:text-left max-w-xl md:max-w-lg lg:max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] text-[11px] font-medium text-purple-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Tutor IA Activo &bull; Sesión de estudio</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-white tracking-tight leading-tight">
                  ¡Hola, {profile.name}!
                </h1>
                <p className="text-xs sm:text-sm text-purple-200/90 font-normal leading-relaxed">
                  Tu tutor de IA de Dalat está listo para ayudarte con tus{" "}
                  <span className="text-white font-semibold">
                    {pendingCount} tareas pendientes
                  </span>{" "}
                  y maximizar tu concentración.
                </p>
                {/* Student Streak Badge: Clean, subtle & elegant */}
                <div className="pt-1 flex justify-center md:justify-start">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.10] text-xs text-purple-200">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      <strong className="text-white font-semibold">{profile.studyStreakDays || 14} días</strong> de racha
                    </span>
                  </div>
                </div>
              </div>

              {/* Right mascot image pinned flush to bottom to hide cut torso */}
              <div className="relative md:absolute md:right-12 lg:right-20 xl:right-28 bottom-0 shrink-0 flex items-end justify-center pointer-events-none z-10 -mb-6 md:mb-0">
                <div className="absolute w-44 h-44 sm:w-52 sm:h-52 lg:w-60 lg:h-60 bg-purple-500/20 rounded-full blur-2xl pointer-events-none -bottom-6" />
                <img
                  src="/dalat-saludo-header.png"
                  alt="Dalat Tutor IA"
                  className="w-auto h-[125px] sm:h-[140px] md:h-[155px] lg:h-[170px] xl:h-[180px] max-w-[75vw] md:max-w-[260px] object-contain object-bottom drop-shadow-[0_14px_28px_rgba(124,58,237,0.4)] select-none block"
                />
              </div>
            </section>

            {/* Quick Add Task Bar */}
            <section className="relative">
              <form
                onSubmit={handleAddTask}
                className="rounded-2xl bg-[#0c0e18] border border-white/[0.08] p-2.5 sm:p-3 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 shadow-lg shadow-black/20 focus-within:border-purple-500/40 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all duration-200"
              >
                <div className="flex items-center pl-2 sm:pl-3 gap-3 flex-1 min-w-[200px]">
                  <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0 animate-pulse"></span>
                  <input
                    type="text"
                    placeholder="Escribe una nueva tarea aquí..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                {/* Quick selectors & Add button */}
                <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end px-1 sm:px-0">
                  {/* Tag selector */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTagMenu(!showTagMenu);
                        setShowSubjectMenu(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap shrink-0 transition cursor-pointer select-none ${
                        isLightMode
                          ? "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700"
                          : "bg-[#111424] hover:bg-[#181d33] border-white/[0.08] text-slate-200"
                      }`}
                    >
                      <Tag className={`w-3.5 h-3.5 shrink-0 ${isLightMode ? "text-purple-600" : "text-purple-400"}`} />
                      <span className="capitalize whitespace-nowrap">
                        {selectedColumn === "urgente"
                          ? "Urgente"
                          : selectedColumn === "en_progreso"
                          ? "En Progreso"
                          : "Para después"}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${showTagMenu ? "rotate-180" : ""}`} />
                    </button>

                    {showTagMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setShowTagMenu(false)}
                        />
                        <div
                          role="menu"
                          className={`absolute right-0 top-full mt-2 w-48 rounded-2xl border shadow-2xl p-1.5 z-30 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
                            isLightMode
                              ? "bg-white/95 border-slate-200/90 shadow-slate-900/15"
                              : "bg-[#101322]/95 border-white/[0.12] shadow-black/80"
                          }`}
                        >
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                            Prioridad de tarea
                          </div>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setSelectedColumn("urgente");
                              setShowTagMenu(false);
                            }}
                            className={`dropdown-item w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs font-medium cursor-pointer transition-colors duration-150 select-none border-0 border-transparent shadow-none ${
                              selectedColumn === "urgente"
                                ? isLightMode
                                  ? "is-active bg-rose-50 text-rose-700 font-semibold"
                                  : "is-active bg-rose-950/50 text-rose-300 font-semibold"
                                : isLightMode
                                ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                              Urgente
                            </span>
                            {selectedColumn === "urgente" && <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" strokeWidth={2.5} />}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setSelectedColumn("en_progreso");
                              setShowTagMenu(false);
                            }}
                            className={`dropdown-item w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs font-medium cursor-pointer transition-colors duration-150 select-none border-0 border-transparent shadow-none ${
                              selectedColumn === "en_progreso"
                                ? isLightMode
                                  ? "is-active bg-amber-50 text-amber-700 font-semibold"
                                  : "is-active bg-amber-950/50 text-amber-300 font-semibold"
                                : isLightMode
                                ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                              En Progreso
                            </span>
                            {selectedColumn === "en_progreso" && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={2.5} />}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setSelectedColumn("para_despues");
                              setShowTagMenu(false);
                            }}
                            className={`dropdown-item w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs font-medium cursor-pointer transition-colors duration-150 select-none border-0 border-transparent shadow-none ${
                              selectedColumn === "para_despues"
                                ? isLightMode
                                  ? "is-active bg-emerald-50 text-emerald-700 font-semibold"
                                  : "is-active bg-emerald-950/50 text-emerald-300 font-semibold"
                                : isLightMode
                                ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                              Para después
                            </span>
                            {selectedColumn === "para_despues" && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2.5} />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Custom Subject selector */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubjectMenu(!showSubjectMenu);
                        setShowTagMenu(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap shrink-0 transition cursor-pointer select-none ${
                        isLightMode
                          ? "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700"
                          : "bg-[#111424] hover:bg-[#181d33] border-white/[0.08] text-slate-200"
                      }`}
                    >
                      <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isLightMode ? "text-purple-600" : "text-purple-400"}`} />
                      <span className="whitespace-nowrap">{selectedSubject}</span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${showSubjectMenu ? "rotate-180" : ""}`} />
                    </button>

                    {showSubjectMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setShowSubjectMenu(false)}
                        />
                        <div
                          role="menu"
                          className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-2xl p-1.5 z-30 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
                            isLightMode
                              ? "bg-white/95 border-slate-200/90 shadow-slate-900/15"
                              : "bg-[#101322]/95 border-white/[0.12] shadow-black/80"
                          }`}
                        >
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                            Materia de estudio
                          </div>
                          {AVAILABLE_SUBJECTS.map((subj) => {
                            const isSelected = selectedSubject === subj;
                            return (
                              <button
                                key={subj}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setSelectedSubject(subj);
                                  setShowSubjectMenu(false);
                                }}
                                className={`dropdown-item w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs font-medium cursor-pointer transition-colors duration-150 select-none border-0 border-transparent shadow-none ${
                                  isSelected
                                    ? isLightMode
                                      ? "is-active bg-purple-100/70 text-purple-900 font-semibold"
                                      : "is-active bg-purple-900/40 text-purple-200 font-semibold"
                                    : isLightMode
                                    ? "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                                    : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${SUBJECT_COLORS[subj] || "bg-violet-400"}`} />
                                  <span className="truncate">{subj}</span>
                                </span>
                                {isSelected && (
                                  <Check className={`w-3.5 h-3.5 shrink-0 ${isLightMode ? "text-purple-600" : "text-purple-400"}`} strokeWidth={2.5} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Calendar / Due date button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDateMenu(!showDateMenu);
                        setShowTagMenu(false);
                        setShowSubjectMenu(false);
                      }}
                      className={`flex items-center gap-1.5 p-2 rounded-xl border transition cursor-pointer select-none shrink-0 ${
                        newTaskDueDate
                          ? isLightMode
                            ? "bg-purple-100 border-purple-300 text-purple-900 font-semibold"
                            : "bg-purple-950/60 border-purple-500/50 text-purple-200 font-semibold"
                          : isLightMode
                          ? "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-600 hover:text-slate-900"
                          : "bg-[#111424] border-white/[0.08] hover:border-white/[0.16] text-slate-400 hover:text-slate-200"
                      }`}
                      title={newTaskDueDate ? `Fecha límite: ${newTaskDueDate}` : "Asignar fecha límite"}
                    >
                      <Calendar className={`w-3.5 h-3.5 shrink-0 ${newTaskDueDate ? (isLightMode ? "text-purple-700" : "text-purple-300") : ""}`} />
                      {newTaskDueDate && (
                        <>
                          <span className="text-[11px] whitespace-nowrap hidden sm:inline">
                            {formatTaskDateLabel(newTaskDueDate)}
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewTaskDueDate(null);
                            }}
                            className="hover:text-red-400 p-0.5 rounded transition"
                            title="Quitar fecha"
                          >
                            <X className="w-3 h-3" />
                          </span>
                        </>
                      )}
                    </button>

                    {showDateMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setShowDateMenu(false)}
                        />
                        <div
                          role="menu"
                          className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl p-3 z-30 space-y-2.5 text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
                            isLightMode
                              ? "bg-white/95 border-slate-200/90 shadow-slate-900/15"
                              : "bg-[#101322]/95 border-white/[0.12] shadow-black/80"
                          }`}
                        >
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                              Fecha de entrega
                            </span>
                            {newTaskDueDate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setNewTaskDueDate(null);
                                  setShowDateMenu(false);
                                }}
                                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer"
                              >
                                Quitar fecha
                              </button>
                            )}
                          </div>

                          <div>
                            <input
                              type="date"
                              autoFocus
                              value={newTaskDueDate || ""}
                              onChange={(e) => {
                                setNewTaskDueDate(e.target.value || null);
                                if (e.target.value) setShowDateMenu(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition cursor-pointer ${
                                isLightMode
                                  ? "bg-slate-50 hover:bg-white border-slate-300 text-slate-900 focus:border-purple-500 focus:bg-white"
                                  : "bg-[#0b0e1a] hover:bg-[#121628] border-white/[0.14] text-white focus:border-purple-400"
                              }`}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Add Button */}
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 shrink-0 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="text-white whitespace-nowrap">Añadir</span>
                  </button>
                </div>
              </form>
            </section>

            {/* 2-Column Main Workspace Layout: Main Column (Left 2/3) + Widgets (Right 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols): Tablero de tareas + Secciones de Estudio debajo */}
              <div className="lg:col-span-8 space-y-6">
                {/* Tablero de tareas (Kanban) */}
                <section className="rounded-2xl bg-[#0c0e18] border border-white/[0.08] p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-lg text-white tracking-tight">
                      Tablero de tareas
                    </h3>
                    {loadingTasks && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Sincronizando...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleAllColumns}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 select-none ${
                        isLightMode
                          ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700"
                          : "bg-[#121627] hover:bg-[#1a2035] border border-[#1d233c] hover:border-indigo-500/40 text-slate-400 hover:text-white"
                      }`}
                      title={allColumnsCollapsed ? "Desplegar todas las columnas" : "Plegar todas las columnas"}
                    >
                      {allColumnsCollapsed ? (
                        <>
                          <span>Desplegar todas</span>
                          <ChevronDown className={`w-3 h-3 ${isLightMode ? "text-indigo-600" : "text-indigo-400"}`} />
                        </>
                      ) : (
                        <>
                          <span>Plegar todas</span>
                          <ChevronRight className={`w-3 h-3 ${isLightMode ? "text-slate-500" : "text-slate-400"}`} />
                        </>
                      )}
                    </button>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                      isLightMode
                        ? "bg-slate-100 border-slate-200 text-slate-700"
                        : "bg-[#121627] border-[#1d233c] text-slate-400"
                    }`}>
                      {pendingCount} pendientes
                    </span>
                  </div>
                </div>

                {/* Mobile Column Switcher (Visible on mobile screens) */}
                <div
                  className={`flex md:hidden gap-1.5 overflow-x-auto pb-2 border-b ${
                    isLightMode ? "border-slate-200" : "border-[#181d31]"
                  }`}
                >
                  <button
                    onClick={() => setMobileColumnTab("todos")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                      mobileColumnTab === "todos"
                        ? isLightMode
                          ? "bg-violet-100 text-violet-700 font-semibold border border-violet-300"
                          : "bg-[#251d45] text-indigo-300 font-semibold border border-[#3e2e74]"
                        : isLightMode
                        ? "text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        : "text-slate-400 bg-[#121626] border border-transparent hover:text-white"
                    }`}
                  >
                    Todos ({tasks.length})
                  </button>
                  <button
                    onClick={() => setMobileColumnTab("urgente")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                      mobileColumnTab === "urgente"
                        ? isLightMode
                          ? "bg-rose-50 text-rose-700 font-semibold border border-rose-300"
                          : "bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/50"
                        : isLightMode
                        ? "text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        : "text-slate-400 bg-[#121626] border border-transparent hover:text-white"
                    }`}
                  >
                    Urgente ({urgentTasks.length})
                  </button>
                  <button
                    onClick={() => setMobileColumnTab("en_progreso")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                      mobileColumnTab === "en_progreso"
                        ? isLightMode
                          ? "bg-amber-50 text-amber-700 font-semibold border border-amber-300"
                          : "bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/50"
                        : isLightMode
                        ? "text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        : "text-slate-400 bg-[#121626] border border-transparent hover:text-white"
                    }`}
                  >
                    En Progreso ({inProgressTasks.length})
                  </button>
                  <button
                    onClick={() => setMobileColumnTab("para_despues")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                      mobileColumnTab === "para_despues"
                        ? isLightMode
                          ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-300"
                          : "bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/50"
                        : isLightMode
                        ? "text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        : "text-slate-400 bg-[#121626] border border-transparent hover:text-white"
                    }`}
                  >
                    Para después ({laterTasks.length})
                  </button>
                </div>

                {/* 3 Columns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  {/* Column 1: Urgente */}
                  {(mobileColumnTab === "todos" || mobileColumnTab === "urgente") && (
                    <div
                      className={`rounded-xl ${
                        isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-[#0a0d18] border-white/[0.08]"
                      } border p-3.5 transition-all duration-200 ${
                        collapsedColumns.urgente ? "space-y-0" : "space-y-3"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleColumnCollapse("urgente")}
                        className={`w-full flex items-center justify-between pb-2 border-b ${
                          isLightMode ? "border-slate-100 hover:bg-slate-50" : "border-white/[0.06] hover:bg-white/[0.02]"
                        } -mx-1 px-1 rounded transition cursor-pointer select-none group text-left`}
                        title={collapsedColumns.urgente ? "Clic para desplegar tareas urgentes" : "Clic para plegar tareas urgentes"}
                      >
                        {/* Left: Dot + Title (No wrap) */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shrink-0"></span>
                          <span className={`text-xs font-bold ${
                            isLightMode ? "text-slate-800 group-hover:text-rose-600" : "text-slate-200 group-hover:text-white"
                          } transition whitespace-nowrap`}>
                            Urgente
                          </span>
                        </div>

                        {/* Right: Badge count + Chevron */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-bold text-[#f43f5e] bg-[#f43f5e]/10 px-2 py-0.5 rounded-full border border-[#f43f5e]/20 min-w-[22px] text-center">
                            {urgentTasks.length}
                          </span>
                          {collapsedColumns.urgente ? (
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition" />
                          )}
                        </div>
                      </button>

                      {!collapsedColumns.urgente && (
                        <div className="space-y-2.5 min-h-[160px] animate-in fade-in duration-150">
                          {urgentTasks.length === 0 ? (
                            <div className="h-28 flex flex-col items-center justify-center text-center p-3 text-slate-500 text-xs gap-1">
                              <CheckCircle className="w-5 h-5 text-slate-600 mb-0.5" />
                              <span>Sin tareas urgentes pendientes</span>
                            </div>
                          ) : (
                            urgentTasks.map((task) => (
                              <div
                                key={task.id}
                                onClick={() => toggleTask(task.id)}
                                className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none group relative ${
                                  task.completed
                                    ? "bg-[#0f111d]/50 border-white/[0.04] opacity-55"
                                    : "bg-[#101322] border-white/[0.08] hover:border-white/[0.18] hover:bg-[#14182b] shadow-sm hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTask(task.id);
                                      }}
                                      className="mt-0.5 text-slate-400 group-hover:text-rose-400 transition shrink-0"
                                      title={task.completed ? "Marcar pendiente" : "Marcar completada"}
                                    >
                                      {task.completed ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-[#f43f5e]/70" />
                                      )}
                                    </button>
                                    <div className="space-y-1 min-w-0 flex-1">
                                      <h4
                                        className={`text-xs sm:text-sm font-medium leading-snug transition break-normal hyphens-auto ${
                                          task.completed
                                            ? "line-through text-slate-500"
                                            : isLightMode
                                            ? "text-slate-800 group-hover:text-slate-950"
                                            : "text-slate-100 group-hover:text-white"
                                        }`}
                                      >
                                        {task.title}
                                      </h4>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-purple-300/80 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">
                                          {task.subject}
                                        </span>
                                        {task.dueDate && (
                                          <span
                                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                              isLightMode
                                                ? "bg-slate-100 border-slate-200 text-slate-600"
                                                : "bg-white/[0.03] border-white/[0.06] text-slate-400"
                                            }`}
                                          >
                                            <Calendar className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                                            <span>{formatTaskDateLabel(task.dueDate)}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => moveTask(task.id, "en_progreso", e)}
                                      title="Mover a 'En Progreso'"
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] text-slate-400 hover:text-amber-400 transition cursor-pointer"
                                    >
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => deleteTask(task.id, e)}
                                      title="Eliminar tarea"
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Column 2: En Progreso */}
                  {(mobileColumnTab === "todos" || mobileColumnTab === "en_progreso") && (
                    <div
                      className={`rounded-xl ${
                        isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-[#0a0d18] border-white/[0.08]"
                      } border p-3.5 transition-all duration-200 ${
                        collapsedColumns.en_progreso ? "space-y-0" : "space-y-3"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleColumnCollapse("en_progreso")}
                        className={`w-full flex items-center justify-between pb-2 border-b ${
                          isLightMode ? "border-slate-100 hover:bg-slate-50" : "border-white/[0.06] hover:bg-white/[0.02]"
                        } -mx-1 px-1 rounded transition cursor-pointer select-none group text-left`}
                        title={collapsedColumns.en_progreso ? "Clic para desplegar tareas en progreso" : "Clic para plegar tareas en progreso"}
                      >
                        {/* Left: Dot + Title (No wrap) */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0"></span>
                          <span className={`text-xs font-bold ${
                            isLightMode ? "text-slate-800 group-hover:text-amber-600" : "text-slate-200 group-hover:text-white"
                          } transition whitespace-nowrap`}>
                            En Progreso
                          </span>
                        </div>

                        {/* Right: Badge count + Chevron */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[11px] font-bold ${
                            isLightMode ? "text-[#d97706]" : "text-[#f59e0b]"
                          } bg-[#f59e0b]/10 px-2 py-0.5 rounded-full border border-[#f59e0b]/20 min-w-[22px] text-center`}>
                            {inProgressTasks.length}
                          </span>
                          {collapsedColumns.en_progreso ? (
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
                          )}
                        </div>
                      </button>

                      {!collapsedColumns.en_progreso && (
                        <div className="space-y-2.5 min-h-[160px] animate-in fade-in duration-150">
                          {inProgressTasks.length === 0 ? (
                            <div className="h-28 flex flex-col items-center justify-center text-center p-3 text-slate-500 text-xs gap-1">
                              <CheckCircle className="w-5 h-5 text-slate-600 mb-0.5" />
                              <span>Sin tareas en progreso</span>
                            </div>
                          ) : (
                            inProgressTasks.map((task) => (
                              <div
                                key={task.id}
                                onClick={() => toggleTask(task.id)}
                                className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none group relative ${
                                  task.completed
                                    ? "bg-[#0f111d]/50 border-white/[0.04] opacity-55"
                                    : "bg-[#101322] border-white/[0.08] hover:border-white/[0.18] hover:bg-[#14182b] shadow-sm hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTask(task.id);
                                      }}
                                      className="mt-0.5 text-slate-400 group-hover:text-amber-400 transition shrink-0"
                                      title={task.completed ? "Marcar pendiente" : "Marcar completada"}
                                    >
                                      {task.completed ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-[#f59e0b]/70" />
                                      )}
                                    </button>
                                    <div className="space-y-1 min-w-0 flex-1">
                                      <h4
                                        className={`text-xs sm:text-sm font-medium leading-snug transition break-normal hyphens-auto ${
                                          task.completed
                                            ? "line-through text-slate-500"
                                            : isLightMode
                                            ? "text-slate-800 group-hover:text-slate-950"
                                            : "text-slate-100 group-hover:text-white"
                                        }`}
                                      >
                                        {task.title}
                                      </h4>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-purple-300/80 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">
                                          {task.subject}
                                        </span>
                                        {task.dueDate && (
                                          <span
                                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                              isLightMode
                                                ? "bg-slate-100 border-slate-200 text-slate-600"
                                                : "bg-white/[0.03] border-white/[0.06] text-slate-400"
                                            }`}
                                          >
                                            <Calendar className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                                            <span>{formatTaskDateLabel(task.dueDate)}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => moveTask(task.id, "urgente", e)}
                                      title="Mover a 'Urgente'"
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                    >
                                      <ArrowLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => moveTask(task.id, "para_despues", e)}
                                      title="Mover a 'Para después'"
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                                    >
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => deleteTask(task.id, e)}
                                      title="Eliminar tarea"
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Column 3: Para después */}
                  {(mobileColumnTab === "todos" || mobileColumnTab === "para_despues") && (
                    <div
                      className={`rounded-xl ${
                        isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-[#0a0d18] border-white/[0.08]"
                      } border p-3.5 transition-all duration-200 ${
                        collapsedColumns.para_despues ? "space-y-0" : "space-y-3"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleColumnCollapse("para_despues")}
                        className={`w-full flex items-center justify-between pb-2 border-b ${
                          isLightMode ? "border-slate-100 hover:bg-slate-50" : "border-white/[0.06] hover:bg-white/[0.02]"
                        } -mx-1 px-1 rounded transition cursor-pointer select-none group text-left`}
                        title={collapsedColumns.para_despues ? "Clic para desplegar tareas para después" : "Clic para plegar tareas para después"}
                      >
                        {/* Left: Dot + Title (No wrap) */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0"></span>
                          <span className={`text-xs font-bold ${
                            isLightMode ? "text-slate-800 group-hover:text-emerald-600" : "text-slate-200 group-hover:text-white"
                          } transition whitespace-nowrap`}>
                            Para después
                          </span>
                        </div>

                        {/* Right: Badge count + Chevron */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[11px] font-bold ${
                            isLightMode ? "text-[#059669]" : "text-[#10b981]"
                          } bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/20 min-w-[22px] text-center`}>
                            {laterTasks.length}
                          </span>
                          {collapsedColumns.para_despues ? (
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
                          )}
                        </div>
                      </button>

                      {!collapsedColumns.para_despues && (
                        <div className="space-y-2.5 min-h-[160px] animate-in fade-in duration-150">
                          {laterTasks.length === 0 ? (
                            <div className="h-28 flex flex-col items-center justify-center text-center p-3 text-slate-500 text-xs gap-1">
                              <CheckCircle className="w-5 h-5 text-slate-600 mb-0.5" />
                              <span>Sin tareas para después</span>
                            </div>
                          ) : (
                            laterTasks.map((task) => (
                              <div
                                key={task.id}
                                onClick={() => toggleTask(task.id)}
                                className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none group relative ${
                                  task.completed
                                    ? "bg-[#0f111d]/50 border-white/[0.04] opacity-55"
                                    : "bg-[#101322] border-white/[0.08] hover:border-white/[0.18] hover:bg-[#14182b] shadow-sm hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTask(task.id);
                                      }}
                                      className="mt-0.5 text-slate-400 group-hover:text-emerald-400 transition shrink-0"
                                      title={task.completed ? "Marcar pendiente" : "Marcar completada"}
                                    >
                                      {task.completed ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-[#10b981]/70" />
                                      )}
                                    </button>
                                    <div className="space-y-1 min-w-0 flex-1">
                                      <h4
                                        className={`text-xs sm:text-sm font-medium leading-snug transition break-normal hyphens-auto ${
                                          task.completed
                                            ? "line-through text-slate-500"
                                            : isLightMode
                                            ? "text-slate-800 group-hover:text-slate-950"
                                            : "text-slate-100 group-hover:text-white"
                                        }`}
                                      >
                                        {task.title}
                                      </h4>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-purple-300/80 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">
                                          {task.subject}
                                        </span>
                                        {task.dueDate && (
                                          <span
                                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                              isLightMode
                                                ? "bg-slate-100 border-slate-200 text-slate-600"
                                                : "bg-white/[0.03] border-white/[0.06] text-slate-400"
                                            }`}
                                          >
                                            <Calendar className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                                            <span>{formatTaskDateLabel(task.dueDate)}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => moveTask(task.id, "en_progreso", e)}
                                      title="Mover a 'En Progreso'"
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] text-slate-400 hover:text-amber-400 transition cursor-pointer"
                                    >
                                      <ArrowLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => deleteTask(task.id, e)}
                                      title="Eliminar tarea"
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Paisaje Acústico de Concentración: Ocupa el ancho completo de los 2 bloques */}
              <AmbientAudioPlayer isLightMode={isLightMode} />
            </div>

            {/* Right: Sidebar Widgets (Limpio y despejado) */}
            <aside className="lg:col-span-4 space-y-5">
              {/* Widget 1: META SEMANAL (Semicircle Gauge) */}
              <div className="rounded-2xl bg-[#0c0e18] border border-white/[0.08] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      META SEMANAL DE ESTUDIO
                    </span>
                    <span className="text-xs font-semibold text-purple-300">
                      {studyStats ? `${studyStats.porcentaje_meta_semanal}%` : "78%"}
                    </span>
                  </div>

                  {/* Semicircle SVG Gauge */}
                  <div className="flex flex-col items-center justify-center pt-1">
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

                        {/* Progress arc: calculated from studyStats */}
                        <path
                          d="M 25 100 A 75 75 0 0 1 175 100"
                          fill="none"
                          stroke="url(#gaugeGradient)"
                          strokeWidth="16"
                          strokeLinecap="round"
                          strokeDasharray="235.6"
                          strokeDashoffset={
                            235.6 *
                            (1 -
                              (studyStats
                                ? Math.min(1, studyStats.porcentaje_meta_semanal / 100)
                                : 0.775))
                          }
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>

                      {/* Centered Stats inside the arch */}
                      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                          {studyStats ? `${studyStats.horas_esta_semana}h` : "31h"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          de {studyStats ? `${studyStats.meta_semanal_horas}h` : "40h"} meta
                        </span>
                      </div>
                    </div>

                    {/* Gauge Min and Max Labels */}
                    <div className="w-56 flex justify-between text-xs text-slate-500 font-medium px-2 mt-1">
                      <span>0h</span>
                      <span>{studyStats ? `${studyStats.meta_semanal_horas}h` : "40h"}</span>
                    </div>
                  </div>

                  {/* Progress Summary Footer */}
                  <div className="text-center text-xs pt-1">
                    <span className="font-semibold text-[#818cf8]">
                      {studyStats ? `${studyStats.porcentaje_meta_semanal}% completado` : "78% completado"}
                    </span>
                    <span className="text-slate-400">
                      {" "}
                      &bull; faltan {studyStats ? `${studyStats.horas_faltantes_meta}h` : "9h"}
                    </span>
                  </div>
                </div>

                {/* Widget 2: Modo Zen Card */}
                <div className="rounded-2xl bg-[#0c0e18] border border-white/[0.08] p-6 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-white text-base">Modo zen</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Crea un espacio más tranquilo para concentrarte en lo importante.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setZenMode(true);
                      setZenRunning(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-purple-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white">Activar modo zen</span>
                  </button>
                </div>

                {/* Widget 3: Micro-repaso del Día (debajo de Modo Zen) */}
                <DailyMicroReview isLightMode={isLightMode} />
              </aside>
            </div>
          </div>
        )}

        {/* Render Tab 2: Horario */}
        {activeTab === "Horario" && (
          <div className="animate-in fade-in duration-150">
            <ScheduleTab isLightMode={isLightMode} />
          </div>
        )}

        {/* Render Tab 3: Métodos */}
        {activeTab === "Métodos" && (
          <div className="animate-in fade-in duration-150">
            <MethodsTab
              isLightMode={isLightMode}
              isPro={profile.plan === "pro"}
              onGoToCheckout={() => handleGoToCheckout()}
              tokensBalance={profile.plan === "pro" ? tokensBalance : 0}
              onDeductTokens={handleDeductTokens}
            />
          </div>
        )}

        {/* Render Tab 4: Notas */}
        {activeTab === "Notas" && (
          <div className="animate-in fade-in duration-150">
            <NotesTab isLightMode={isLightMode} />
          </div>
        )}

        {/* Render Tab 5: Recursos IA */}
        {activeTab === "Recursos IA" && (
          <div className="animate-in fade-in duration-150">
            <AiResourcesTab
              isLightMode={isLightMode}
              isPro={profile.plan === "pro"}
              onGoToCheckout={() => handleGoToCheckout()}
              tokensBalance={profile.plan === "pro" ? tokensBalance : 0}
              onDeductTokens={handleDeductTokens}
            />
          </div>
        )}

        {/* Render Tab 6: Repositorio */}
        {activeTab === "Repositorio" && (
          <div className="animate-in fade-in duration-150">
            <RepositoryTab isLightMode={isLightMode} />
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
        isLightMode={isLightMode}
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
