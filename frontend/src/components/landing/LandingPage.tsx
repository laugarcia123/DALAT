"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Brain,
  BookOpen,
  Building2,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Users,
  Timer,
  Layers,
  FileCheck,
  Send,
  Zap,
  LogIn,
  ChevronRight,
  ChevronLeft,
  School,
  Star,
  Quote,
  Compass,
  Heart,
  TrendingUp,
  Cpu,
  Target,
  HelpCircle,
  Award,
  Lock,
  Globe,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Copy,
  Check,
  Calendar,
  Clock,
  FileText,
  Share2,
  Sliders,
  Headphones,
  Download,
  Laptop,
  CreditCard,
  User
} from "lucide-react";
import confetti from "canvas-confetti";
import CheckoutPage, { SelectedPlan, UserAccount } from "./CheckoutPage";

interface LandingPageProps {
  onLoginClick: (mode?: "login" | "register") => void;
  onEnterApp: (userName?: string, userEmail?: string) => void;
  currentUser?: UserAccount | null;
}

type PageView = "inicio" | "quienes-somos" | "servicios" | "precios" | "instituciones" | "checkout";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Camila Restrepo",
    role: "Estudiante de Ingeniería Mecatrónica",
    university: "Universidad Nacional",
    avatar: "CR",
    avatarBg: "bg-gradient-to-tr from-indigo-500 to-purple-600",
    rating: 5,
    quote:
      "Cálculo III y Ecuaciones Diferenciales eran mi pesadilla. El generador de exámenes con IA a partir de mis PDFs y el laboratorio de Active Recall cambiaron totalmente mi forma de estudiar. Pasé de 6.2 a 9.1 de promedio en un solo semestre.",
    tag: "Subió su GPA +2.9",
  },
  {
    id: 2,
    name: "Alejandro Valenzuela",
    role: "Estudiante de Medicina (4to año)",
    university: "Facultad de Ciencias de la Salud",
    avatar: "AV",
    avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-600",
    rating: 5,
    quote:
      "La repetición espaciada automática y el desglose Feynman son indispensables para Farmacología. Retengo miles de dosis y mecanismos de acción sin trasnochar antes del examen. Es el mejor software que he probado.",
    tag: "Ahorra 14h de estudio/sem",
  },
  {
    id: 3,
    name: "Dra. Mariana Sotomayor",
    role: "Decana de Innovación Curricular",
    university: "Universidad Tecnológica",
    avatar: "MS",
    avatarBg: "bg-gradient-to-tr from-rose-500 to-pink-600",
    rating: 5,
    quote:
      "Implementamos la licencia institucional de Dalat Campus para 3,800 alumnos de primer año. La tasa de reprobación en asignaturas filtro de ciencias básicas cayó un 28% y las quejas por sobrecarga mental disminuyeron notablemente.",
    tag: "Alianza Dalat Campus",
  },
  {
    id: 4,
    name: "Mateo Benítez",
    role: "Estudiante de Economía y Finanzas",
    university: "Universidad Central",
    avatar: "MB",
    avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-600",
    rating: 5,
    quote:
      "El gestor por cortes académicos me salvó la vida. Sabía con precisión matemática cuántos puntos necesitaba en cada evaluación para mantener mi beca de honor. El modo Zen con música binaural es otro nivel.",
    tag: "Mantuvo Beca de Excelencia",
  },
];

export default function LandingPage({
  onLoginClick,
  onEnterApp,
  currentUser: propUser
}: LandingPageProps) {
  const [currentPage, setCurrentPage] = useState<PageView>("inicio");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [pricingMode, setPricingMode] = useState<"micros" | "mensual" | "anual">("micros");
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SelectedPlan | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(propUser || null);

  const handleChoosePlan = (plan: SelectedPlan) => {
    setSelectedPlanForCheckout(plan);
    setCurrentPage("checkout");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Institutional Contact Form State
  const [institutionName, setInstitutionName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("Director / Decano");
  const [workEmail, setWorkEmail] = useState("");
  const [studentsCount, setStudentsCount] = useState("1,000 - 5,000 estudiantes");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Auto advance testimonial carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleInstitutionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
    setTimeout(() => {
      setInstitutionName("");
      setContactName("");
      setWorkEmail("");
      setInquiryMessage("");
    }, 3000);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  // Interactive Services States
  const [activeServiceFilter, setActiveServiceFilter] = useState<
    "todos" | "ia" | "notas" | "zen" | "equipos" | "horario"
  >("todos");
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizDifficulty, setQuizDifficulty] = useState<"Básico" | "Intermedio" | "Avanzado">("Avanzado");
  const [simulatedCorte3, setSimulatedCorte3] = useState<number>(8.5);
  const [zenTimerRunning, setZenTimerRunning] = useState<boolean>(false);
  const [zenTimerSeconds, setZenTimerSeconds] = useState<number>(25 * 60);
  const [zenAmbientSound, setZenAmbientSound] = useState<"lluvia" | "cafe" | "ondas" | "silencio">("lluvia");
  const [repoLinkCopied, setRepoLinkCopied] = useState<boolean>(false);

  // Zen timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (zenTimerRunning && zenTimerSeconds > 0) {
      interval = setInterval(() => {
        setZenTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [zenTimerRunning, zenTimerSeconds]);

  const formatZenTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyRepoLink = () => {
    setRepoLinkCopied(true);
    setTimeout(() => setRepoLinkCopied(false), 2200);
  };

  // If on checkout page, render dedicated full checkout view
  if (currentPage === "checkout" && selectedPlanForCheckout) {
    return (
      <CheckoutPage
        plan={selectedPlanForCheckout}
        user={userAccount}
        onUserLoginOrRegister={(name, email) => {
          setUserAccount({ name, email });
        }}
        onBackToPricing={() => setCurrentPage("precios")}
        onPaymentSuccess={() => {
          if (userAccount) {
            onEnterApp(userAccount.name, userAccount.email);
          } else {
            onEnterApp();
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#06070d] text-slate-100 flex flex-col font-sans selection:bg-[#7c5dfa] selection:text-white relative overflow-x-hidden">
      {/* Background visual neon orbs */}
      <div className="fixed top-[-150px] left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#7c5dfa]/20 to-transparent rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-[160px] pointer-events-none z-0"></div>

      {/* Top Navbar */}
      <header className="border-b border-[#15192c]/80 bg-[#070913]/90 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo Brand */}
          <div
            onClick={() => setCurrentPage("inicio")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2a1d59] to-[#4c359e] border border-[#583eb5] flex items-center justify-center shadow-lg shadow-[#7c5dfa]/25 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">Σ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-white tracking-tight">Dalat</span>
            </div>
          </div>

          {/* Navigation Tabs (Sub-pages) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0b0e1b] p-1.5 rounded-2xl border border-[#1a2038] shadow-inner">
            <button
              onClick={() => setCurrentPage("inicio")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentPage === "inicio"
                  ? "bg-[#271d49] text-white shadow-md border border-[#3e2e74]"
                  : "text-slate-400 hover:text-white hover:bg-[#12162a]"
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setCurrentPage("quienes-somos")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentPage === "quienes-somos"
                  ? "bg-[#271d49] text-white shadow-md border border-[#3e2e74]"
                  : "text-slate-400 hover:text-white hover:bg-[#12162a]"
              }`}
            >
              Quiénes Somos
            </button>
            <button
              onClick={() => setCurrentPage("servicios")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentPage === "servicios"
                  ? "bg-[#271d49] text-white shadow-md border border-[#3e2e74]"
                  : "text-slate-400 hover:text-white hover:bg-[#12162a]"
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => setCurrentPage("precios")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentPage === "precios"
                  ? "bg-[#271d49] text-white shadow-md border border-[#3e2e74]"
                  : "text-slate-400 hover:text-white hover:bg-[#12162a]"
              }`}
            >
              Precios
            </button>
            <button
              onClick={() => setCurrentPage("instituciones")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentPage === "instituciones"
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-md"
                  : "text-emerald-400 hover:bg-emerald-950/40"
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Para Instituciones</span>
            </button>
          </nav>

          {/* Action CTAs: Iniciar sesión & Registrarse */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onLoginClick("login")}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#15192c] transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar sesión</span>
            </button>
            <button
              onClick={() => onLoginClick("register")}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-semibold shadow-lg shadow-[#7c5dfa]/25 transition active:scale-95"
            >
              <span>Registrarse</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Page Navigator Pills */}
        <div className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto border-t border-[#15192c] bg-[#080a14]">
          {(["inicio", "quienes-somos", "servicios", "precios", "instituciones"] as PageView[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentPage(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition ${
                currentPage === tab
                  ? "bg-[#7c5dfa] text-white font-semibold"
                  : "text-slate-400 bg-[#101322]"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>
      </header>

      {/* Main Multi-Page Switcher */}
      <main className="flex-1 relative z-10">
        {/* ========================================================= */}
        {/* PÁGINA 1: INICIO (HERO, SHOWCASE, STATS, CARRUSEL)        */}
        {/* ========================================================= */}
        {currentPage === "inicio" && (
          <div className="animate-in fade-in duration-300 space-y-24 pb-24">
            {/* Hero Section */}
            <section className="pt-20 sm:pt-28 text-center max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              {/* Animated Glowing Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1b1535] border border-[#4d3696] text-xs font-medium text-[#d8b4fe] shadow-lg shadow-[#7c5dfa]/15 animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>La plataforma de estudio asistido por IA número 1 para universitarios</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-5 max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-editorial font-extrabold tracking-tight text-white leading-[1.12]">
                  Estudia menos horas. <br />
                  <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-fuchsia-400 bg-clip-text text-transparent">
                    Aprende el doble con IA.
                  </span>
                </h1>
                <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                  Dalat es tu asistente personal: genera exámenes de práctica a partir de tus PDFs,
                  automatiza tus cortes y promedios, y aplica técnicas cognitivas para que domines cualquier materia.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => onEnterApp()}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-bold text-sm sm:text-base shadow-2xl shadow-[#7c5dfa]/40 transition active:scale-95 flex items-center justify-center gap-2.5 group"
                >
                  <span>Probar Dalat gratis</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setCurrentPage("quienes-somos")}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#121628] hover:bg-[#1a2038] border border-[#232a48] text-indigo-300 hover:text-white font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span>Conoce nuestra historia</span>
                </button>
              </div>

              {/* Live KPI Metric Badges with Interactive Hover Animations */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
                {/* Stat 1 */}
                <div className="group relative p-6 rounded-2xl bg-[#0c0f1c]/90 border border-[#1b213b] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-2.5 hover:scale-[1.04] hover:bg-[#12162e] hover:border-violet-500/80 hover:shadow-2xl hover:shadow-violet-500/30 cursor-pointer overflow-hidden text-center">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-violet-600/10 rounded-full blur-xl group-hover:bg-violet-600/35 group-hover:scale-125 transition-all duration-500 pointer-events-none" />
                  <div className="w-8 h-8 rounded-xl bg-violet-500/15 text-violet-300 mx-auto mb-2.5 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-500/25 transition-all duration-300 shadow-sm">
                    <Award className="w-4 h-4 text-violet-300" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white block group-hover:text-violet-100 group-hover:scale-105 transition-all duration-300">
                    98.4%
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 font-medium block mt-1.5 transition-colors">
                    Tasa de aprobación en exámenes
                  </span>
                </div>

                {/* Stat 2 */}
                <div className="group relative p-6 rounded-2xl bg-[#0c0f1c]/90 border border-[#1b213b] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-2.5 hover:scale-[1.04] hover:bg-[#15122e] hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-500/30 cursor-pointer overflow-hidden text-center">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-600/10 rounded-full blur-xl group-hover:bg-purple-600/35 group-hover:scale-125 transition-all duration-500 pointer-events-none" />
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-300 mx-auto mb-2.5 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/25 transition-all duration-300 shadow-sm">
                    <Timer className="w-4 h-4 text-purple-300" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#a78bfa] block group-hover:text-purple-100 group-hover:scale-105 transition-all duration-300">
                    +14 hrs
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 font-medium block mt-1.5 transition-colors">
                    Ahorradas de estudio semanal
                  </span>
                </div>

                {/* Stat 3 */}
                <div className="group relative p-6 rounded-2xl bg-[#0c0f1c]/90 border border-[#1b213b] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-2.5 hover:scale-[1.04] hover:bg-[#0c1a1e] hover:border-emerald-500/80 hover:shadow-2xl hover:shadow-emerald-500/30 cursor-pointer overflow-hidden text-center">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-600/10 rounded-full blur-xl group-hover:bg-emerald-600/35 group-hover:scale-125 transition-all duration-500 pointer-events-none" />
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-300 mx-auto mb-2.5 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/25 transition-all duration-300 shadow-sm">
                    <Users className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 block group-hover:text-emerald-100 group-hover:scale-105 transition-all duration-300">
                    +15,000
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 font-medium block mt-1.5 transition-colors">
                    Estudiantes universitarios
                  </span>
                </div>

                {/* Stat 4 */}
                <div className="group relative p-6 rounded-2xl bg-[#0c0f1c]/90 border border-[#1b213b] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-2.5 hover:scale-[1.04] hover:bg-[#1c1810] hover:border-amber-500/80 hover:shadow-2xl hover:shadow-amber-500/30 cursor-pointer overflow-hidden text-center">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-600/10 rounded-full blur-xl group-hover:bg-amber-600/35 group-hover:scale-125 transition-all duration-500 pointer-events-none" />
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-300 mx-auto mb-2.5 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/25 transition-all duration-300 shadow-sm">
                    <Star className="w-4 h-4 text-amber-300 fill-amber-400/40" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 block group-hover:text-amber-100 group-hover:scale-105 transition-all duration-300">
                    4.9 / 5
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 font-medium block mt-1.5 transition-colors">
                    Calificación promedio
                  </span>
                </div>
              </div>
            </section>

            {/* Carrusel de Comentarios Positivos */}
            <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#a78bfa]">
                  HISTORIAS REALES DE ÉXITO
                </span>
                <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-white tracking-tight">
                  Lo que dicen quienes ya estudian con Dalat
                </h2>
              </div>

              {/* Interactive Carousel Card */}
              <div className="relative rounded-3xl bg-[#0d1020] border border-[#212745] p-8 sm:p-12 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="space-y-6 flex-1 text-left">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      {[...Array(TESTIMONIALS[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-lg sm:text-2xl font-serif-display font-medium text-slate-100 italic leading-relaxed">
                      &ldquo;{TESTIMONIALS[currentTestimonial].quote}&rdquo;
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-md ${TESTIMONIALS[currentTestimonial].avatarBg}`}
                      >
                        {TESTIMONIALS[currentTestimonial].avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">
                          {TESTIMONIALS[currentTestimonial].name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {TESTIMONIALS[currentTestimonial].role} &bull; {TESTIMONIALS[currentTestimonial].university}
                        </p>
                      </div>
                      <span className="hidden sm:inline-block ml-auto px-3 py-1 rounded-full bg-[#1b1535] text-indigo-300 text-xs font-semibold border border-[#3e2e74]">
                        {TESTIMONIALS[currentTestimonial].tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center justify-between pt-8 mt-6 border-t border-[#181e35]">
                  <div className="flex items-center gap-2">
                    {TESTIMONIALS.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => setCurrentTestimonial(idx)}
                        className={`h-2 rounded-full transition-all ${
                          currentTestimonial === idx
                            ? "w-8 bg-[#7c5dfa]"
                            : "w-2 bg-[#1f2744] hover:bg-slate-600"
                        }`}
                        aria-label={`Testimonio ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevTestimonial}
                      className="p-2.5 rounded-xl bg-[#14182a] border border-[#222946] text-slate-300 hover:text-white hover:bg-[#1a2038] transition active:scale-95"
                      aria-label="Anterior testimonio"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="p-2.5 rounded-xl bg-[#14182a] border border-[#222946] text-slate-300 hover:text-white hover:bg-[#1a2038] transition active:scale-95"
                      aria-label="Siguiente testimonio"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Explore Section Pill Grid */}
            <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
              <h3 className="text-xl font-bold text-white">Explora Dalat en detalle</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <button
                  onClick={() => setCurrentPage("quienes-somos")}
                  className="p-5 rounded-2xl bg-[#0c0e18] border border-[#1b2038] hover:border-indigo-500/50 transition-all text-left space-y-2 group"
                >
                  <Compass className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Quiénes Somos</h4>
                  <p className="text-xs text-slate-400 leading-snug">Conoce nuestra misión pedagógica y equipo.</p>
                </button>
                <button
                  onClick={() => setCurrentPage("servicios")}
                  className="p-5 rounded-2xl bg-[#0c0e18] border border-[#1b2038] hover:border-indigo-500/50 transition-all text-left space-y-2 group"
                >
                  <Zap className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Nuestros Servicios</h4>
                  <p className="text-xs text-slate-400 leading-snug">Tutor IA, notas, modo zen y horarios.</p>
                </button>
                <button
                  onClick={() => setCurrentPage("precios")}
                  className="p-5 rounded-2xl bg-[#0c0e18] border border-[#1b2038] hover:border-indigo-500/50 transition-all text-left space-y-2 group"
                >
                  <Award className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Planes y Precios</h4>
                  <p className="text-xs text-slate-400 leading-snug">Gratis para empezar o Pro para exámenes.</p>
                </button>
                <button
                  onClick={() => setCurrentPage("instituciones")}
                  className="p-5 rounded-2xl bg-[#0c0e18] border border-emerald-800/40 hover:border-emerald-500 transition-all text-left space-y-2 group bg-emerald-950/10"
                >
                  <School className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-emerald-300 text-sm">Dalat Campus</h4>
                  <p className="text-xs text-slate-400 leading-snug">Licencias institucionales y convenios.</p>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* PÁGINA 2: QUIÉNES SOMOS (MISIÓN, EQUIPO, NEUROAPRENDIZAJE)*/}
        {/* ========================================================= */}
        {currentPage === "quienes-somos" && (
          <div className="animate-in fade-in duration-300 max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            {/* Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#a78bfa]">
                NUESTRA MISIÓN
              </span>
              <h2 className="text-4xl sm:text-5xl font-editorial font-bold text-white tracking-tight">
                Revolucionar la educación superior a través de la ciencia del aprendizaje
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Dalat nació de una frustración real: ver cómo estudiantes brillantes se frustran y reprueban materias complejas no por falta de capacidad, sino por utilizar métodos obsoletos de estudio como la memorización pasiva.
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-7 rounded-2xl bg-[#0c0e18] border border-[#1b2038] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-[#a78bfa] flex items-center justify-center font-bold">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg">Neurociencia Cognitiva</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No usamos trucos de productividad vacíos. Cada funcionalidad de Dalat está respaldada por estudios en retención de memoria (curva del olvido de Ebbinghaus, recuperación activa y práctica intercalada).
                </p>
              </div>

              <div className="p-7 rounded-2xl bg-[#0c0e18] border border-[#1b2038] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg">Inteligencia Artificial Ética</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  La IA no debe hacer la tarea por ti; debe ser tu tutor socrático que te desafía, te hace preguntas trampa y te ayuda a entender los porqués detrás de cada fórmula y concepto.
                </p>
              </div>

              <div className="p-7 rounded-2xl bg-[#0c0e18] border border-[#1b2038] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg">Salud Mental Estudiantil</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El estrés y la sobrecarga son los mayores enemigos del intelecto. Diseñamos el Modo Zen y el gestor de notas para brindarte certidumbre, calma y un plan de acción claro.
                </p>
              </div>
            </div>

            {/* Team Showcase */}
            <div className="space-y-8 rounded-3xl bg-[#0c0e18] border border-[#1b2038] p-8 sm:p-12">
              <div className="text-center space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">El Equipo Detrás de Dalat</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Los creadores e ingenieros detrás de la arquitectura, diseño e interactividad de la plataforma.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-2">
                {/* Laura Gómez */}
                <div className="p-7 rounded-2xl bg-[#090b14] border border-[#1b2038] hover:border-indigo-500/50 transition-all text-center space-y-3 group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 mx-auto flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-purple-600/25 group-hover:scale-105 transition-transform">
                    LG
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Laura Gómez</h4>
                    <p className="text-xs text-[#a78bfa] font-semibold mt-0.5">
                      Arquitectura Backend & Diseño de Producto
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Diseñó la identidad visual, experiencia de usuario y la infraestructura backend de Dalat, encargada de la lógica de datos, seguridad y rendimiento del servidor para brindar una plataforma robusta y centrada en el estudiante.
                  </p>
                </div>

                {/* Daniel Granados */}
                <div className="p-7 rounded-2xl bg-[#090b14] border border-[#1b2038] hover:border-cyan-500/50 transition-all text-center space-y-3 group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 mx-auto flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                    DG
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Daniel Granados</h4>
                    <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                      Desarrollo Frontend & Experiencia Interactiva
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Desarrolló la interfaz de usuario reactiva, la interactividad de los módulos de estudio y la optimización en el cliente con Next.js y Tailwind CSS, logrando una navegación fluida, ágil y visualmente atractiva en todo dispositivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PÁGINA 3: SERVICIOS (DESGLOSE COMPLETO DE HERRAMIENTAS)    */}
        {/* ========================================================= */}
        {currentPage === "servicios" && (
          <div className="animate-in fade-in duration-300 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
            {/* Header Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e153b] border border-[#53399b] text-xs font-semibold text-[#c4b5fd] shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>ECOSISTEMA INTEGRAL DE APRENDIZAJE ACADÉMICO</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-editorial font-bold text-white tracking-tight leading-tight">
                Herramientas de alto impacto para cada reto universitario
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Diseñadas con neurociencia aplicada, impulsadas por inteligencia artificial y optimizadas para que apruebes con las mejores calificaciones sin agotamiento.
              </p>

              {/* Service Filter Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                {[
                  { id: "todos", label: "Todos los servicios (5)", icon: Layers },
                  { id: "ia", label: "Simulador IA 🧠", icon: Brain },
                  { id: "notas", label: "Cortes & GPA 📊", icon: BarChart3 },
                  { id: "zen", label: "Modo Zen ⏱️", icon: Timer },
                  { id: "equipos", label: "Bóveda & Equipos 📁", icon: Users },
                  { id: "horario", label: "Horario Dinámico 📅", icon: Calendar },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveServiceFilter(item.id as typeof activeServiceFilter)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                      activeServiceFilter === item.id
                        ? "bg-[#7c5dfa] text-white shadow-lg shadow-[#7c5dfa]/30 scale-105"
                        : "bg-[#0d1020] border border-[#1e2540] text-slate-400 hover:text-white hover:bg-[#14182e]"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deep dive services with interactive live mockups */}
            <div className="space-y-14">
              {/* SERVICE 1: GENERADOR DE EXÁMENES Y QUIZZES CON IA */}
              {(activeServiceFilter === "todos" || activeServiceFilter === "ia") && (
                <div className="p-8 sm:p-10 rounded-3xl bg-[#0b0e1b] border border-[#1e2440] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    {/* Left Description */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
                        <Brain className="w-4 h-4 text-indigo-400" />
                        <span>MOTOR IA DALAT &bull; TUTOR SOCRÁTICO</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
                        Generador de Exámenes y Quizzes a partir de tus PDFs
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        Sube tus diapositivas, lecturas escaneadas o guías de estudio. Dalat identifica los axiomas, fórmulas y casos de estudio clave para formularte preguntas tipo parcial con retroalimentación explicativa inmediata.
                      </p>

                      <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>0% Alucinaciones: estrictamente contextualizado a los apuntes de tu profesor.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Soporte KaTeX para fórmulas avanzadas de Cálculo, Física y Química.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Explicaciones paso a paso de cada distractor y respuesta errónea.</span>
                        </div>
                      </div>

                      {/* Interactive Difficulty Selector */}
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Nivel de dificultad:</span>
                        {(["Básico", "Intermedio", "Avanzado"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setQuizDifficulty(lvl)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              quizDifficulty === lvl
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-[#14182a] border border-[#232a48] text-slate-400 hover:text-white"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right Interactive Mockup */}
                    <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl bg-[#070914] border border-[#202848] shadow-inner space-y-4">
                      {/* Mockup Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#181f38] text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span className="font-semibold text-slate-200">Unidad 3 — Integrales Triples.pdf</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 font-mono text-[11px]">
                          {quizDifficulty} &bull; Q4/10
                        </span>
                      </div>

                      {/* Question */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                          PREGUNTA DE SIMULACRO INTERACTIVA
                        </span>
                        <p className="text-sm font-semibold text-white leading-snug">
                          ¿Cuál es el jacobiano (factor de escala volumétrico) al transformar una integral a coordenadas esféricas?
                        </p>
                      </div>

                      {/* Interactive Options */}
                      <div className="space-y-2 pt-1">
                        {[
                          { id: 0, text: "J = ρ² · sen(φ)", isCorrect: true, note: "¡Correcto! En coordenadas esféricas dV = ρ² sen(φ) dρ dφ dθ. El determinante jacobiano es exactamente ρ² sen(φ)." },
                          { id: 1, text: "J = ρ · sen²(φ) · cos(θ)", isCorrect: false, note: "Incorrecto. Este término omite la escala de radio cuadrática ρ² requerida por la curvatura espacial." },
                          { id: 2, text: "J = r · cos(θ)", isCorrect: false, note: "Incorrecto. Este corresponde únicamente a una componente de coordenadas polares planas." },
                          { id: 3, text: "J = ρ³ · sen(θ)", isCorrect: false, note: "Incorrecto. La potencia cúbica excede la dimensión geométrica diferencial." },
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setQuizSelectedOption(option.id)}
                            className={`w-full p-3 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between border ${
                              quizSelectedOption === option.id
                                ? option.isCorrect
                                  ? "bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-md shadow-emerald-500/20"
                                  : "bg-rose-950/70 border-rose-500/80 text-rose-200 shadow-md shadow-rose-500/20"
                                : "bg-[#0e1222] border-[#1d2442] text-slate-300 hover:border-indigo-500/40 hover:bg-[#12172c]"
                            }`}
                          >
                            <span>{option.text}</span>
                            {quizSelectedOption === option.id && (
                              <span className="text-[11px] font-bold">
                                {option.isCorrect ? "✓ Correcta" : "✕ Incorrecta"}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Feedback box */}
                      {quizSelectedOption !== null && (
                        <div
                          className={`p-3 rounded-xl text-xs leading-relaxed border animate-in fade-in ${
                            quizSelectedOption === 0
                              ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-300"
                              : "bg-rose-950/40 border-rose-700/60 text-rose-300"
                          }`}
                        >
                          <p className="font-semibold mb-0.5">
                            {quizSelectedOption === 0 ? "Explicación conceptual Dalat:" : "Retroalimentación:"}
                          </p>
                          <p>
                            {quizSelectedOption === 0
                              ? "¡Excelente análisis! Al cambiar de variables en ℝ³, el determinante jacobiano cuantifica la distorsión del elemento infinitesimal de volumen. ¡Sigue así!"
                              : "Intenta de nuevo o haz clic en la opción 1 para comprobar la solución formal."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SERVICE 2: CORTES ACADÉMICOS Y SIMULADOR GPA */}
              {(activeServiceFilter === "todos" || activeServiceFilter === "notas") && (
                <div className="p-8 sm:p-10 rounded-3xl bg-[#0b0e1b] border border-[#1e2440] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    {/* Left Interactive Mockup */}
                    <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl bg-[#070914] border border-[#202848] shadow-inner space-y-5 order-last lg:order-first">
                      <div className="flex items-center justify-between pb-3 border-b border-[#181f38]">
                        <div>
                          <h4 className="font-bold text-white text-base">Cálculo III</h4>
                          <span className="text-xs text-slate-400">3 Cortes oficiales &bull; Ponderado 30% - 35% - 35%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-medium">Nota proyectada</span>
                          <span className="text-2xl font-black text-emerald-400">
                            {(5.545 + simulatedCorte3 * 0.35).toFixed(2)}
                            <span className="text-xs font-normal text-slate-400"> / 10</span>
                          </span>
                        </div>
                      </div>

                      {/* Cortes list */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl bg-[#0e1224] border border-[#1c2340] text-center">
                          <span className="text-[10px] text-slate-400 block font-semibold">1er Corte (30%)</span>
                          <span className="text-lg font-black text-white">8.8</span>
                          <span className="text-[10px] text-emerald-400 block font-medium">Aprobado</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0e1224] border border-[#1c2340] text-center">
                          <span className="text-[10px] text-slate-400 block font-semibold">2do Corte (35%)</span>
                          <span className="text-lg font-black text-white">8.3</span>
                          <span className="text-[10px] text-emerald-400 block font-medium">Aprobado</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#1b1536] border border-[#503b9b] text-center shadow-lg shadow-[#7c5dfa]/20">
                          <span className="text-[10px] text-[#c4b5fd] block font-semibold">3er Corte (35%)</span>
                          <span className="text-lg font-black text-[#a78bfa]">{simulatedCorte3.toFixed(1)}</span>
                          <span className="text-[10px] text-indigo-300 block font-medium">Simulado</span>
                        </div>
                      </div>

                      {/* Interactive Slider */}
                      <div className="space-y-2 p-4 rounded-xl bg-[#0c0f1e] border border-[#192038]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">Simula tu nota del 3er corte:</span>
                          <span className="font-bold text-white bg-[#1a2038] px-2 py-0.5 rounded-md">
                            {simulatedCorte3.toFixed(1)} / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.1"
                          value={simulatedCorte3}
                          onChange={(e) => setSimulatedCorte3(parseFloat(e.target.value))}
                          className="w-full accent-[#7c5dfa] cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Mínimo (1.0)</span>
                          <span>Requerido para aprobar: 4.8</span>
                          <span>Máximo (10.0)</span>
                        </div>
                      </div>

                      {/* Verdict Banner */}
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/50 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div className="text-xs text-emerald-200">
                          <span className="font-bold block">
                            {simulatedCorte3 >= 8.0
                              ? "¡Calificación sobresaliente asegurada!"
                              : simulatedCorte3 >= 6.0
                              ? "Aprobado sin problemas."
                              : "Riesgo de corte. Se recomienda sesión de refuerzo con IA."}
                          </span>
                          <span className="text-[11px] text-emerald-300/80">
                            Con esta nota cumples holgadamente los requisitos de acreditación académica.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Description */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        <span>GESTIÓN ACADÉMICA OFICIAL</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
                        Cálculo de Cortes Académicos y Simulador Predictivo de GPA
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        Dile adiós a las hojas de cálculo confusas y al estrés de fin de semestre. Dalat calcula tus calificaciones con la ponderación exacta de tu facultad y te dice matemáticamente qué nota necesitas para salvar o asegurar tu beca.
                      </p>

                      <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Ponderación dinámica de cortes personalizable (30/35/35 o libre).</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Desglose por tipo de evaluación: Parciales, Quizzes, Trabajos y Talleres.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Alertas tempranas automáticas para asignaturas que necesitan refuerzo.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SERVICE 3: MODO ZEN Y NEUROAPRENDIZAJE */}
              {(activeServiceFilter === "todos" || activeServiceFilter === "zen") && (
                <div className="p-8 sm:p-10 rounded-3xl bg-[#0b0e1b] border border-[#1e2440] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    {/* Left Description */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide">
                        <Timer className="w-4 h-4 text-purple-400" />
                        <span>CONCENTRACIÓN INMERSIVA &bull; NEUROCIENCIA</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
                        Laboratorio de Métodos de Estudio y Modo Zen
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        La sobrecarga cognitiva y las distracciones del teléfono son el principal enemigo del aprendizaje. Dalat integra temporizadores científicos y paisajes sonoros binaurales que reducen la fatiga mental y maximizan tu retención a largo plazo.
                      </p>

                      <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>6 Métodos guiados: Pomodoro, Técnica Feynman, Cornell, Spaced Repetition, Active Recall y Flowtime.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>Paisajes sonoros generativos: lluvia, biblioteca, café y ondas alfa a 432 Hz.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>Contador de rachas y registro de horas de concentración profunda.</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Interactive Mockup */}
                    <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl bg-[#070914] border border-[#202848] shadow-inner space-y-5">
                      {/* Timer Display */}
                      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#131128] to-[#0a0d1c] border border-[#2b2452] text-center space-y-3 relative overflow-hidden">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-700/50 text-purple-300 text-[11px] font-semibold">
                          <span className={`w-2 h-2 rounded-full ${zenTimerRunning ? "bg-emerald-400 animate-ping" : "bg-purple-400"}`}></span>
                          <span>{zenTimerRunning ? "Bloque de Foco Activo" : "Pausa / Listo"}</span>
                        </div>

                        <div className="text-5xl sm:text-6xl font-mono font-black text-white tracking-wider">
                          {formatZenTime(zenTimerSeconds)}
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            onClick={() => setZenTimerRunning(!zenTimerRunning)}
                            className="px-5 py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-bold shadow-lg shadow-[#7c5dfa]/40 transition active:scale-95 flex items-center gap-2"
                          >
                            {zenTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span>{zenTimerRunning ? "Pausar" : "Iniciar Sesión"}</span>
                          </button>
                          <button
                            onClick={() => {
                              setZenTimerRunning(false);
                              setZenTimerSeconds(25 * 60);
                            }}
                            className="p-2.5 rounded-xl bg-[#14182a] border border-[#232a48] text-slate-300 hover:text-white hover:bg-[#1a2038] transition active:scale-95"
                            title="Reiniciar a 25 min"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Ambient Sound Selector */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                            <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Paisaje sonoro de fondo:</span>
                          </span>
                          <span className="text-[11px] text-indigo-400 font-medium">Binaural 432 Hz</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "lluvia", label: "Lluvia Suave 🌧️" },
                            { id: "cafe", label: "Café Calmo ☕" },
                            { id: "ondas", label: "Ondas Alfa 🎧" },
                            { id: "silencio", label: "Silencio Zen 🔕" },
                          ].map((sound) => (
                            <button
                              key={sound.id}
                              onClick={() => setZenAmbientSound(sound.id as typeof zenAmbientSound)}
                              className={`p-2.5 rounded-xl text-[11px] font-semibold transition border text-center ${
                                zenAmbientSound === sound.id
                                  ? "bg-purple-950/80 border-purple-500/80 text-purple-200 shadow-md shadow-purple-500/20"
                                  : "bg-[#0e1222] border-[#1d2442] text-slate-400 hover:text-white hover:bg-[#12172c]"
                              }`}
                            >
                              {sound.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SERVICE 4: BÓVEDA ACADÉMICA Y TRABAJO EN EQUIPO */}
              {(activeServiceFilter === "todos" || activeServiceFilter === "equipos") && (
                <div className="p-8 sm:p-10 rounded-3xl bg-[#0b0e1b] border border-[#1e2440] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    {/* Left Interactive Mockup */}
                    <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl bg-[#070914] border border-[#202848] shadow-inner space-y-4 order-last lg:order-first">
                      <div className="flex items-center justify-between pb-3 border-b border-[#181f38]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                            CS
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">Equipo: Cálculo Sin Drama</h4>
                            <span className="text-xs text-slate-400">4 miembros activos &bull; Semestre Actual</span>
                          </div>
                        </div>
                        <button
                          onClick={handleCopyRepoLink}
                          className="px-3 py-1.5 rounded-xl bg-[#14182a] border border-[#232a48] hover:border-indigo-500/50 text-indigo-300 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          {repoLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{repoLinkCopied ? "¡Enlace copiado!" : "Invitar"}</span>
                        </button>
                      </div>

                      {/* Shared Vault Files */}
                      <div className="space-y-2">
                        {[
                          { name: "Resumen_Integrales_Triples_Definitivo.pdf", size: "3.8 MB", downloads: 28, date: "Ayer" },
                          { name: "Banco_Examenes_Años_Anteriores.zip", size: "8.4 MB", downloads: 42, date: "Hace 3 días" },
                          { name: "Formulario_LaTeX_Oficial.pdf", size: "1.2 MB", downloads: 35, date: "Hace 1 semana" },
                        ].map((file, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-[#0e1224] border border-[#1d2442] hover:border-indigo-500/40 transition flex items-center justify-between group/file"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-semibold text-xs text-white block group-hover/file:text-indigo-300 transition">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {file.size} &bull; {file.downloads} descargas &bull; {file.date}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => confetti({ particleCount: 20, spread: 40 })}
                              className="p-2 rounded-lg bg-[#14182a] text-slate-400 hover:text-white hover:bg-indigo-600 transition"
                              title="Descargar archivo"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Description */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold tracking-wide">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>COLABORACIÓN Y SINERGIA ESTUDIANTIL</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
                        Repositorio Compartido y Bóveda de Apuntes por Materia
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        Centraliza los materiales de tu grupo de estudio en un solo punto accesible y seguro. Olvídate de los enlaces caídos de Drive o los archivos perdidos en chats de mensajería.
                      </p>

                      <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Descargas instantáneas sin publicidad ni límites de ancho de banda.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Enlaces de invitación directos para sincronizar a todos tus compañeros.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Clasificación limpia por materia, corte semestral y fecha de examen.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SERVICE 5: HORARIO DINÁMICO Y AGENDA */}
              {(activeServiceFilter === "todos" || activeServiceFilter === "horario") && (
                <div className="p-8 sm:p-10 rounded-3xl bg-[#0b0e1b] border border-[#1e2440] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    {/* Left Description */}
                    <div className="lg:col-span-6 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span>GESTIÓN DEL TIEMPO Y RUTINA UNIVERSITARIA</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
                        Horario Dinámico y Agenda Inteligente de Clases
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        Ten control absoluto de tu semana universitaria. Visualiza tus clases presenciales, enlaces a salones virtuales y bloques de estudio con una línea de tiempo limpia y alertas en tiempo real.
                      </p>

                      <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Vistas adaptables por Día y por Semana para que nunca te satures.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Código cromático automático por asignatura para reconocimiento instantáneo.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Recordatorios inteligentes con conteo regresivo a tu siguiente clase.</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Interactive Mockup */}
                    <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl bg-[#070914] border border-[#202848] shadow-inner space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#181f38] text-xs">
                        <span className="font-bold text-white">Miércoles, 4 de Noviembre</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 font-semibold text-[11px]">
                          Próxima clase en 45 min
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="p-3.5 rounded-xl bg-[#0e1224] border-l-4 border-l-indigo-500 border border-[#1c2340] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">07:30 - 09:00</span>
                            <span className="font-bold text-xs text-white">Cálculo III</span>
                            <span className="text-[10px] text-slate-400 block">Aula 204 &bull; Presencial</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            Finalizada ✓
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#14122e] border-l-4 border-l-[#7c5dfa] border border-[#3b2e70] flex items-center justify-between shadow-lg shadow-[#7c5dfa]/15">
                          <div>
                            <span className="text-[10px] text-[#c4b5fd] font-semibold block">10:00 - 11:30</span>
                            <span className="font-bold text-xs text-white">Arquitectura de Software</span>
                            <span className="text-[10px] text-indigo-300 block">Sala Virtual (Teams)</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 font-semibold animate-pulse">
                            En 45 min ⏱️
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#0e1224] border-l-4 border-l-amber-500 border border-[#1c2340] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">13:00 - 14:00</span>
                            <span className="font-bold text-xs text-white">Almuerzo + Descanso activo</span>
                            <span className="text-[10px] text-slate-400 block">Cafetería &bull; Libre</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">60 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security & Tech Guarantee Strip */}
            <div className="p-6 rounded-2xl bg-[#080a14] border border-[#181d34] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto" />
                <h5 className="font-bold text-white text-xs">Cifrado de Extremo a Extremo</h5>
                <p className="text-[11px] text-slate-400">Tus apuntes y notas están 100% protegidos.</p>
              </div>
              <div className="space-y-1">
                <Cpu className="w-5 h-5 text-indigo-400 mx-auto" />
                <h5 className="font-bold text-white text-xs">Modelos LLM Especializados</h5>
                <p className="text-[11px] text-slate-400">Entrenados para rigor científico y matemático.</p>
              </div>
              <div className="space-y-1">
                <Zap className="w-5 h-5 text-amber-400 mx-auto" />
                <h5 className="font-bold text-white text-xs">Latencia Ultrabaja</h5>
                <p className="text-[11px] text-slate-400">Generación de reactivos en menos de 3 segundos.</p>
              </div>
              <div className="space-y-1">
                <Globe className="w-5 h-5 text-cyan-400 mx-auto" />
                <h5 className="font-bold text-white text-xs">Sincronización en la Nube</h5>
                <p className="text-[11px] text-slate-400">Accede desde tu laptop, tableta o smartphone.</p>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#171133] via-[#0f1228] to-[#121c38] border border-[#302860] text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-2 max-w-2xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
                  ¿Listo para experimentar el estudio universitario inteligente?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Comienza hoy gratis y descubre por qué miles de estudiantes aprueban sus exámenes con Dalat.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => onEnterApp()}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#7c5dfa]/40 transition active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Probar todos los servicios gratis</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setCurrentPage("precios")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#14182a] hover:bg-[#1a2038] border border-[#232a48] text-indigo-300 hover:text-white font-semibold text-xs transition"
                >
                  <span>Ver comparativa de planes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PÁGINA 4: PRECIOS (PLANES, MICROSUSCRIPCIONES, EN COP)    */}
        {/* ========================================================= */}
        {currentPage === "precios" && (
          <div className="animate-in fade-in duration-300 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
            {/* Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e153b] border border-[#53399b] text-xs font-semibold text-[#c4b5fd] shadow-md">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>PRECIOS EN PESOS COLOMBIANOS (COP) &bull; FLEXIBILIDAD TOTAL</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-editorial font-bold text-white tracking-tight leading-tight">
                Planes y Microsuscripciones a la medida de tu semestre
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                ¿Solo necesitas preparar los parciales de esta semana o buscas acompañamiento para todo el ciclo? Elige la duración exacta sin renovaciones obligatorias.
              </p>

              {/* 3-Way Pricing Mode Switcher */}
              <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-[#0f1222] border border-[#202744] gap-1 shadow-xl">
                <button
                  onClick={() => setPricingMode("micros")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    pricingMode === "micros"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]"
                      : "text-amber-400 hover:text-amber-300 hover:bg-[#161a30]"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Microsuscripciones (1 y 2 Semanas)</span>
                </button>
                <button
                  onClick={() => setPricingMode("mensual")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    pricingMode === "mensual"
                      ? "bg-[#7c5dfa] text-white shadow-lg shadow-[#7c5dfa]/30 scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-[#161a30]"
                  }`}
                >
                  <span>Mensual ($24.900 COP)</span>
                </button>
                <button
                  onClick={() => setPricingMode("anual")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    pricingMode === "anual"
                      ? "bg-[#7c5dfa] text-white shadow-lg shadow-[#7c5dfa]/30 scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-[#161a30]"
                  }`}
                >
                  <span>Anual ($17.900 COP/mes)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    Ahorra 28%
                  </span>
                </button>
              </div>
            </div>

            {/* OPTION A: MICROSUSCRIPCIONES (1 Y 2 SEMANAS) */}
            {pricingMode === "micros" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Informational Callout */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1536]/80 border border-[#4a3594] text-xs sm:text-sm text-indigo-200 flex items-center gap-3 max-w-3xl mx-auto shadow-md">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="leading-relaxed">
                    <strong>¿Tienes parciales esta semana?</strong> Con las Microsuscripciones de Dalat pagas únicamente por los días que requieres (7 o 14 días). Acceso Pro completo, sin cargos recurrentes sorpresa y vence automáticamente.
                  </p>
                </div>

                {/* 2 Micro-subscription Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                  {/* Micro 1: Pase Sprint 1 Semana */}
                  <div className="group relative p-8 sm:p-9 rounded-3xl bg-[#0c0f20] border-2 border-[#2b3560] hover:border-amber-500/80 transition-all duration-300 flex flex-col justify-between space-y-7 shadow-2xl hover:shadow-amber-500/15">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold tracking-wide uppercase">
                          SEMANA DE PARCIALES ⚡
                        </span>
                        <span className="text-xs text-slate-400 font-mono">7 Días corridos</span>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-white">Pase Sprint &bull; 1 Semana</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Ideal para preparar y salvar el parcial o examen de esta semana.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#070914] border border-[#1a213e] space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-black text-white">$8.900</span>
                          <span className="text-xs font-bold text-amber-400">COP</span>
                          <span className="text-xs text-slate-400">/ pago único</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">
                          Sin tarjetas requeridas &bull; Vence solo sin cobros sorpresa
                        </span>
                      </div>

                      <ul className="space-y-3 text-xs text-slate-200 pt-2">
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span><strong>7 días de acceso total</strong> a todas las funciones Pro</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Generador ilimitado de quizzes tipo parcial desde tus PDFs</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Flashcards automáticas y repaso activo con IA</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Modo Zen con música de concentración y paisajes binaurales</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Acceso en computadora, tableta y teléfono celular</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleChoosePlan({
                          name: "Pase Sprint • 1 Semana",
                          price: "$8.900 COP",
                          period: "7 días de acceso Pro (Pago único)",
                          badge: "Semana de Parciales ⚡",
                          features: [
                            "7 días de acceso Pro total",
                            "Quizzes ilimitados desde tus PDFs",
                            "Flashcards automáticas con IA",
                            "Modo Zen y paisajes binaurales",
                            "Sin renovación forzada"
                          ]
                        })
                      }
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-orange-500/25 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Adquirir Pase 1 Semana ($8.900 COP)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Micro 2: Pase Corte 2 Semanas */}
                  <div className="group relative p-8 sm:p-9 rounded-3xl bg-gradient-to-b from-[#161230] to-[#0d0f22] border-2 border-[#7c5dfa] hover:border-purple-400 transition-all duration-300 flex flex-col justify-between space-y-7 shadow-2xl shadow-[#7c5dfa]/20">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#7c5dfa] to-purple-600 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>MÁS RECOMENDADO &bull; AHORRA $1.900 COP</span>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-[11px] font-bold tracking-wide uppercase">
                          CORTE ACADÉMICO O FINALES 🎯
                        </span>
                        <span className="text-xs text-indigo-300 font-mono">14 Días corridos</span>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-white">Pase Corte &bull; 2 Semanas</h3>
                        <p className="text-xs text-slate-300 mt-1">
                          Para preparar dos materias consecutivas o el cierre completo de notas del corte.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#090b18] border border-[#262050] space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-black text-white">$15.900</span>
                          <span className="text-xs font-bold text-purple-400">COP</span>
                          <span className="text-xs text-slate-400">/ pago único</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-medium block">
                          Equivale a solo $1.135 COP al día &bull; Sin ataduras
                        </span>
                      </div>

                      <ul className="space-y-3 text-xs text-slate-200 pt-2">
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span><strong>Todo lo del Pase de 1 Semana incluido</strong></span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span><strong>14 días continuos</strong> de preparación intensiva</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span>Simulador predictivo de cortes y cálculo de notas GPA</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span>Bóveda colaborativa para compartir archivos con tu grupo de estudio</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span>Procesamiento prioritario en la cola del motor de IA</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleChoosePlan({
                          name: "Pase Corte • 2 Semanas",
                          price: "$15.900 COP",
                          period: "14 días de acceso Pro (Pago único)",
                          badge: "Corte Académico o Finales 🎯",
                          features: [
                            "Todo lo del Pase de 1 Semana",
                            "14 días continuos de estudio intensivo",
                            "Simulador predictivo de cortes y GPA",
                            "Bóveda colaborativa para trabajo en equipo",
                            "Prioridad en procesamiento de IA"
                          ]
                        })
                      }
                      className="w-full py-4 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-bold text-xs tracking-wide shadow-xl shadow-[#7c5dfa]/40 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Adquirir Pase 2 Semanas ($15.900 COP)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Switch to Annual Banner */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setPricingMode("anual")}
                    className="text-xs text-indigo-300 hover:text-white underline font-medium transition"
                  >
                    ¿Buscas acompañamiento para todo el año académico? Ver planes anuales con 28% de descuento (3 meses gratis) →
                  </button>
                </div>
              </div>
            )}

            {/* OPTION B: PLANES CONTINUOS (MENSUAL / ANUAL) */}
            {(pricingMode === "mensual" || pricingMode === "anual") && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Regular Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                  {/* Free */}
                  <div className="rounded-3xl bg-[#0c0e18] border border-[#1b2038] p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Estudiante Básico</h3>
                      <p className="text-xs text-slate-400">Organización esencial para estudiantes que inician.</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-white">$0</span>
                        <span className="text-xs font-bold text-slate-400">COP</span>
                        <span className="text-xs text-slate-500">/ gratis para siempre</span>
                      </div>
                      <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-[#181d30]">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Tablero de tareas Kanban ilimitado</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Horario dinámico de clases</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Técnicas Pomodoro y Feynman</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Gestor de hasta 5 asignaturas</span>
                        </li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterApp()}
                      className="w-full py-3.5 rounded-xl bg-[#141829] hover:bg-[#1b2138] border border-[#232a48] text-indigo-300 hover:text-white font-semibold text-xs transition"
                    >
                      Comenzar gratis
                    </button>
                  </div>

                  {/* Pro */}
                  <div className="rounded-3xl bg-[#110f27] border-2 border-[#7c5dfa] p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-[#7c5dfa]/20">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#7c5dfa] text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md">
                      MÁS POPULAR CONTINUO
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Estudiante Pro</h3>
                      <p className="text-xs text-slate-400">Poder total de IA para semestres de alta exigencia.</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-white">
                          {pricingMode === "mensual" ? "$24.900" : "$17.900"}
                        </span>
                        <span className="text-xs font-bold text-indigo-300">COP</span>
                        <span className="text-xs text-slate-400">
                          {pricingMode === "mensual" ? "/ mes" : "/ mes facturado anual"}
                        </span>
                      </div>
                      {pricingMode === "anual" && (
                        <span className="text-[11px] text-emerald-400 font-medium block">
                          Total anual: $214.800 COP (Ahorras $84.000 COP &bull; 3 meses gratis)
                        </span>
                      )}
                      <ul className="space-y-3 text-xs text-slate-200 pt-4 border-t border-[#292254]">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span><strong>Todo lo del plan Básico</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span>Generador ilimitado de quizzes a partir de PDFs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span>Flashcards automáticas con Spaced Repetition</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span>Materias, cortes y notas ilimitadas</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span>Modo Zen con música de concentración</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#a78bfa] shrink-0" />
                          <span>Bóvedas de repositorio colaborativo ilimitadas</span>
                        </li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleChoosePlan(
                          pricingMode === "mensual"
                            ? {
                                name: "Estudiante Pro Mensual",
                                price: "$24.900 COP",
                                period: "Facturación mensual (cancela en cualquier momento)",
                                badge: "Plan Continuo Pro",
                                features: [
                                  "Generador ilimitado de quizzes a partir de PDFs",
                                  "Flashcards automáticas con Spaced Repetition",
                                  "Materias y cortes ponderados ilimitados",
                                  "Modo Zen y paisajes binaurales",
                                  "Bóvedas compartidas para tu equipo"
                                ]
                              }
                            : {
                                name: "Estudiante Pro Anual",
                                price: "$214.800 COP",
                                period: "Facturación anual ($17.900 COP/mes • Ahorras 28%)",
                                badge: "Ahorra 28% • 3 Meses Gratis ⭐",
                                features: [
                                  "12 meses completos de acceso Pro total",
                                  "Generador ilimitado de quizzes con IA",
                                  "Flashcards y simulador de cortes GPA",
                                  "Modo Zen y paisajes binaurales",
                                  "Bóvedas colaborativas ilimitadas",
                                  "Soporte prioritario 24/7"
                                ]
                              }
                        )
                      }
                      className="w-full py-4 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#7c5dfa]/35 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {pricingMode === "mensual"
                          ? "Adquirir Plan Pro Mensual ($24.900 COP)"
                          : "Adquirir Plan Pro Anual ($214.800 COP)"}
                      </span>
                    </button>
                  </div>

                  {/* Campus */}
                  <div className="rounded-3xl bg-[#0c0e18] border border-[#1b2038] p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Licencia Campus</h3>
                      <p className="text-xs text-slate-400">Para universidades, facultades y colegios en Colombia.</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-white">Convenio COP</span>
                      </div>
                      <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-[#181d30]">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Licencias masivas para todo el alumnado</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Integración Canvas, Moodle, Blackboard</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Panel directivo de alertas de deserción</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Soporte dedicado y capacitación docente</span>
                        </li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage("instituciones")}
                      className="w-full py-3.5 rounded-xl bg-[#20173e] hover:bg-[#2b1f54] border border-[#3e2e74] text-[#c4b5fd] font-semibold text-xs transition"
                    >
                      Solicitar cotización
                    </button>
                  </div>
                </div>

                {/* Switch to Micros Banner */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setPricingMode("micros")}
                    className="text-xs text-amber-300 hover:text-amber-200 underline font-medium transition"
                  >
                    ¿Solo necesitas preparar el parcial de esta semana? Conoce nuestras Microsuscripciones desde $8.900 COP →
                  </button>
                </div>
              </div>
            )}

            {/* Payment Methods and Security Strip */}
            <div className="p-6 rounded-2xl bg-[#080a14] border border-[#181d34] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Medios de pago disponibles en Colombia:</strong> PSE, Nequi, Daviplata, Tarjetas Débito y Crédito (Visa, Mastercard).
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-medium text-[11px]">
                <span>✓ Sin cláusula de permanencia</span>
                <span>✓ Cancelación en 1 clic</span>
                <span>✓ Cifrado SSL 256-bit</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PÁGINA 5: INSTITUCIONES (B2B UNIVERSIDADES & LICENCIAS)   */}
        {/* ========================================================= */}
        {currentPage === "instituciones" && (
          <div className="animate-in fade-in duration-300 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs font-bold">
                <School className="w-4 h-4" />
                <span>SOLUCIÓN DALAT CAMPUS &bull; CONVENIOS INSTITUCIONALES</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-editorial font-bold text-white tracking-tight leading-tight">
                Eleva la retención y el éxito académico de tu institución
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Brinda a toda tu comunidad universitaria una herramienta oficial de estudio que reduce la reprobación en asignaturas críticas y detecta a tiempo a los estudiantes en riesgo de abandono.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Institutional Value Cards */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-6 rounded-2xl bg-[#0c0e18] border border-[#1b2038] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">Seguridad y Privacidad Académica</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cumplimiento total con FERPA, GDPR y leyes locales de protección de datos estudiantiles. La propiedad intelectual de las clases y materiales institucionales se resguarda bajo cifrado bancario.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0c0e18] border border-[#1b2038] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">Alertas Tempranas para Decanaturas</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Panel analítico anónimo para identificar qué grupos o materias tienen más del 30% de reprobación en el primer corte, permitiendo tutorías dirigidas preventivas.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0c0e18] border border-[#1b2038] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    <School className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">Single Sign-On & LMS</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Los alumnos acceden con su correo institucional (@universidad.edu) vía Google Workspace, Microsoft 365, Canvas o Moodle sin contraseñas adicionales.
                  </p>
                </div>
              </div>

              {/* Request Form */}
              <div className="lg:col-span-7 rounded-3xl bg-[#0c0e18] border border-[#1f253d] p-8 sm:p-10 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Solicitar Demostración Institucional</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Diseñaremos un plan piloto sin costo para una facultad o cohorte de tu institución.
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="p-8 rounded-2xl bg-emerald-950/70 border border-emerald-800/60 text-center space-y-3 animate-in fade-in">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-white text-lg">¡Solicitud recibida correctamente!</h4>
                    <p className="text-xs text-emerald-300 max-w-md mx-auto leading-relaxed">
                      Un asesor del equipo de Alianzas Institucionales de Dalat se pondrá en contacto al correo proporcionado en menos de 24 horas hábiles.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInstitutionalSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-semibold">Institución Educativa</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Universidad Iberoamericana"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          className="w-full bg-[#121626] border border-[#202742] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-semibold">Nombre del Solicitante</label>
                        <input
                          type="text"
                          required
                          placeholder="Tu nombre completo"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-[#121626] border border-[#202742] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-semibold">Correo Institucional</label>
                        <input
                          type="email"
                          required
                          placeholder="nombre@universidad.edu"
                          value={workEmail}
                          onChange={(e) => setWorkEmail(e.target.value)}
                          className="w-full bg-[#121626] border border-[#202742] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-semibold">Cargo Institucional</label>
                        <select
                          value={contactRole}
                          onChange={(e) => setContactRole(e.target.value)}
                          className="w-full bg-[#121626] border border-[#202742] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Rector / Vicerrector">Rector / Vicerrector</option>
                          <option value="Director / Decano">Director / Decano</option>
                          <option value="Coordinador de Innovación Educativa">Coordinador de Innovación Educativa</option>
                          <option value="Docente / Director de Cátedra">Docente / Director de Cátedra</option>
                          <option value="Líder de TI / Campus Virtual">Líder de TI / Campus Virtual</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-300 font-semibold">Población Estudiantil Aproximada</label>
                      <select
                        value={studentsCount}
                        onChange={(e) => setStudentsCount(e.target.value)}
                        className="w-full bg-[#121626] border border-[#202742] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="500 - 1,000 estudiantes">500 - 1,000 estudiantes</option>
                        <option value="1,000 - 5,000 estudiantes">1,000 - 5,000 estudiantes</option>
                        <option value="5,000 - 15,000 estudiantes">5,000 - 15,000 estudiantes</option>
                        <option value="Más de 15,000 estudiantes">Más de 15,000 estudiantes</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-300 font-semibold">Mensaje o necesidad específica</label>
                      <textarea
                        rows={3}
                        placeholder="Nos interesa evaluar Dalat para el programa de tutorías de primer año..."
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        className="w-full bg-[#121626] border border-[#202742] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-bold text-xs tracking-wide shadow-xl shadow-[#7c5dfa]/30 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Solicitar demo y propuesta de convenio</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#141829] py-12 bg-[#05060b] text-xs text-slate-500 relative z-10">
        <div className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#121524]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#231a44] border border-[#3e2e74] flex items-center justify-center text-[#a78bfa] font-black text-sm">
                Σ
              </div>
              <span className="font-bold text-base text-white">Dalat</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <button onClick={() => setCurrentPage("inicio")} className="hover:text-white transition">
                Inicio
              </button>
              <button onClick={() => setCurrentPage("quienes-somos")} className="hover:text-white transition">
                Quiénes Somos
              </button>
              <button onClick={() => setCurrentPage("servicios")} className="hover:text-white transition">
                Servicios
              </button>
              <button onClick={() => setCurrentPage("precios")} className="hover:text-white transition">
                Precios
              </button>
              <button onClick={() => setCurrentPage("instituciones")} className="hover:text-emerald-300 font-semibold transition">
                Instituciones
              </button>
              <button onClick={() => onLoginClick("login")} className="hover:text-white transition">
                Iniciar sesión
              </button>
              <button onClick={() => onLoginClick("register")} className="text-[#a78bfa] hover:text-white font-semibold transition">
                Registrarse
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600">
            <p>&copy; {new Date().getFullYear()} Dalat Technologies. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Privacidad Académica</span>
              <span>&bull;</span>
              <span className="hover:text-slate-400 cursor-pointer">Términos de Servicio</span>
              <span>&bull;</span>
              <span className="hover:text-slate-400 cursor-pointer">Seguridad FERPA / GDPR</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
