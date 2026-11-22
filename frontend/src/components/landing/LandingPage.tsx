"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Users,
  Timer,
  Zap,
  School,
  Star,
  Compass,
  Award,
  TrendingUp,
  ShieldCheck,
  Lock,
  Globe,
  MessageSquare,
  Terminal,
  ExternalLink,
  X,
  Menu,
  ChevronUp,
  BookOpen,
  Heart
} from "lucide-react";
import CheckoutPage, { SelectedPlan, UserAccount } from "./CheckoutPage";
import GhostTypeText from "./GhostTypeText";
import ThreeBackground from "./ThreeBackground";
import GsapDashboardWindow from "./GsapDashboardWindow";
import GsapWordScroller from "./GsapWordScroller";
import GsapTestimonialMarquee from "./GsapTestimonialMarquee";
import StaggeredText from "./StaggeredText";
import dynamic from "next/dynamic";
const GsapPinnedServices = dynamic(() => import("./GsapPinnedServices"), {
  ssr: false,
  loading: () => (
    <div className="w-full py-24 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  ),
});
import PricingSection from "./PricingSection";
import InstitutionalPage from "./InstitutionalPage";
import gsap from "gsap";

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
    const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SelectedPlan | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(propUser || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [legalModal, setLegalModal] = useState<null | {
    title: string;
    category: string;
    content: string[];
  }>(null);

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleChoosePlan = (plan: SelectedPlan) => {
    setSelectedPlanForCheckout(plan);
    setCurrentPage("checkout");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // GSAP Ref & Timeline for Hero entrance
  const heroRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentPage === "inicio") {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.children,
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: "power3.out" }
        );
      }
      if (dashboardRef.current) {
        gsap.fromTo(
          dashboardRef.current,
          { y: 45, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.95, delay: 0.25, ease: "power3.out" }
        );
      }
    }
  }, [currentPage]);

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
    <div className="min-h-screen bg-[#080911] text-slate-100 flex flex-col font-sans selection:bg-[#7c3aed] selection:text-white relative overflow-x-clip">
      {/* Iluminaciones sutiles en zonas estratégicas */}
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-purple-600/[0.12] rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div className="fixed top-[22%] right-[-140px] w-[650px] h-[650px] bg-indigo-600/[0.08] rounded-full blur-[170px] pointer-events-none z-0"></div>
      <div className="fixed top-[58%] left-[-140px] w-[600px] h-[600px] bg-violet-600/[0.07] rounded-full blur-[170px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-100px] right-1/4 w-[750px] h-[450px] bg-fuchsia-900/[0.07] rounded-full blur-[180px] pointer-events-none z-0"></div>

      {/* Partículas 3D interactivas exclusivas para la Landing Page principal */}
      {currentPage === "inicio" && (
        <ThreeBackground className="fixed inset-0 z-0 opacity-80 pointer-events-none" />
      )}

      {/* Top Navbar - Minimalista, Elegante y Limpio */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.08] bg-[#080b16]/90 backdrop-blur-xl shadow-sm"
            : "border-b border-white/[0.05] bg-[#080b16]/70 backdrop-blur-md"
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
          {/* Logo Brand */}
          <div
            onClick={() => navigateTo("inicio")}
            className="flex items-center gap-1.5 cursor-pointer group py-1 select-none shrink-0"
          >
            <img
              src="/icono-dalat.png"
              alt="Dalat Robot"
              className="h-9 sm:h-10 w-9 sm:w-10 object-contain -mr-0.5 transition-transform duration-200 group-hover:scale-105"
            />
            <img
              src="/dalat-logo-v2.png"
              alt="Dalat"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          {/* Desktop Navigation - Enlaces limpios con toque de color en el activo */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* Inicio */}
            <button
              onClick={() => navigateTo("inicio")}
              className={`text-sm transition-colors duration-200 cursor-pointer ${
                currentPage === "inicio"
                  ? "text-purple-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              Inicio
            </button>

            {/* Quiénes Somos */}
            <button
              onClick={() => navigateTo("quienes-somos")}
              className={`text-sm transition-colors duration-200 cursor-pointer ${
                currentPage === "quienes-somos"
                  ? "text-purple-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              Quiénes Somos
            </button>

            {/* Servicios */}
            <button
              onClick={() => navigateTo("servicios")}
              className={`text-sm transition-colors duration-200 cursor-pointer ${
                currentPage === "servicios"
                  ? "text-purple-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              Servicios
            </button>

            {/* Precios */}
            <button
              onClick={() => navigateTo("precios")}
              className={`text-sm transition-colors duration-200 cursor-pointer ${
                currentPage === "precios"
                  ? "text-purple-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              Precios
            </button>

            {/* Para Instituciones */}
            <button
              onClick={() => navigateTo("instituciones")}
              className={`text-sm transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${
                currentPage === "instituciones"
                  ? "text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-emerald-400 font-medium"
              }`}
            >
              <School className={`w-4 h-4 ${currentPage === "instituciones" ? "text-emerald-400" : "opacity-80"}`} />
              <span>Para Instituciones</span>
            </button>
          </nav>

          {/* Action CTAs (Desktop): Minimalista y Elegante */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={() => onLoginClick("login")}
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => onLoginClick("register")}
              className="px-4.5 py-2 rounded-full bg-white hover:bg-slate-200 text-[#080b16] text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              Registrarse
            </button>
          </div>

          {/* Mobile Hamburger Toggle (Sin botón duplicado arriba) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-purple-300" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.06] bg-[#080b16]/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl">
            <div className="space-y-1">
              {[
                { id: "inicio", label: "Inicio", icon: Sparkles },
                { id: "quienes-somos", label: "Quiénes Somos", icon: Compass },
                { id: "servicios", label: "Servicios", icon: Zap },
                { id: "precios", label: "Precios", icon: Award },
                { id: "instituciones", label: "Para Instituciones", icon: School, isEmerald: true },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTo(item.id as PageView);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? item.isEmerald
                          ? "text-emerald-400 font-semibold bg-emerald-500/[0.08]"
                          : "text-purple-400 font-semibold bg-purple-500/[0.08]"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? (item.isEmerald ? "text-emerald-400" : "text-purple-400") : "opacity-70"}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Actions */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
              <button
                onClick={() => {
                  onLoginClick("login");
                  setMobileMenuOpen(false);
                }}
                className="w-1/2 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white text-xs font-medium border border-white/[0.08] transition text-center"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => {
                  onLoginClick("register");
                  setMobileMenuOpen(false);
                }}
                className="w-1/2 py-2 rounded-lg bg-white hover:bg-slate-200 text-[#080b16] text-xs font-semibold transition text-center"
              >
                Registrarse
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Multi-Page Switcher */}
      <main className="flex-1 relative z-10">
        {/* ========================================================= */}
        {/* PÁGINA 1: INICIO (HERO, SHOWCASE, STATS, CARRUSEL)        */}
        {/* ========================================================= */}
        {currentPage === "inicio" && (
          <div className="pb-24">
            {/* Centered Hero Section con Mockup de Dashboard abajo (Estilo Sentinel / Linear) */}
            <section className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 text-center mb-24">
              {/* Contenido Centrado animado con GSAP Timeline */}
              <div ref={heroRef} className="max-w-4xl mx-auto space-y-7 flex flex-col items-center">
                {/* Pill Badge */}
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-medium text-purple-300 shadow-lg shadow-purple-900/20">
                  <span>Asistente impulsado por IA</span>
                </div>

                {/* Main Headline con animación Ghost Type */}
                <div className="space-y-4 max-w-3xl">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12]">
                    DALAT: <br />
                    <GhostTypeText
                      text="Tu asistente de estudio personalizado"
                      typingSpeed={125}
                      deleteSpeed={55}
                      pauseDelay={4500}
                      gradientClass="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent"
                    />
                  </h1>
                  <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
                    Diseñado para universitarios: genera repasos automáticos desde tus PDFs, gestiona tus cortes y calificaciones en tiempo real, y mantén tu racha con modos de concentración sin distracciones.
                  </p>
                </div>

                {/* Action Buttons Centered */}
                <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                  <button
                    onClick={() => navigateTo("servicios")}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-slate-200 hover:text-white font-semibold text-sm sm:text-base transition hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>Ver cómo funciona</span>
                  </button>
                </div>

                {/* Micro Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Sin tarjeta de crédito</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>Exámenes con IA en segundos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-pink-400" />
                    <span>Control de cortes y notas</span>
                  </div>
                </div>
              </div>

              {/* Showcase del Dashboard abajo con GSAP 3D Tilt y Flotación */}
              <div ref={dashboardRef} className="pt-12 sm:pt-16 max-w-5xl mx-auto w-full">
                <GsapDashboardWindow
                  imageSrc="/foto-dashboard-dalat.png"
                  alt="Dalat - Dashboard Universitario"
                />
              </div>

              {/* Live KPI Metric Badges in Premium Bento Glass Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto pt-16 px-4">
                {/* Stat 1: Tasa de Aprobación */}
                <div className="group relative p-6 sm:p-7 rounded-3xl bg-[#0c0f1c]/85 border border-white/[0.08] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-950/40 cursor-pointer overflow-hidden flex flex-col justify-between text-left">
                  {/* Radial spotlight on hover */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Top Bar: Icon + Micro-badge */}
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-violet-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300 shadow-inner">
                      <Award className="w-5 h-5 text-violet-300" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-950/60 border border-violet-500/25 text-[11px] font-semibold text-violet-300">
                      <TrendingUp className="w-3 h-3 text-violet-400" />
                      <span>+24% vs prom.</span>
                    </span>
                  </div>

                  {/* Number */}
                  <div className="relative z-10 space-y-1">
                    <span className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-white block group-hover:text-violet-100 transition-colors">
                      98.4%
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 block">
                      Tasa de aprobación
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      En parciales y exámenes finales
                    </p>
                  </div>
                </div>

                {/* Stat 2: Horas Ahorradas */}
                <div className="group relative p-6 sm:p-7 rounded-3xl bg-[#0c0f1c]/85 border border-white/[0.08] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/40 cursor-pointer overflow-hidden flex flex-col justify-between text-left">
                  {/* Radial spotlight on hover */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Top Bar: Icon + Micro-badge */}
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300 shadow-inner">
                      <Timer className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/25 text-[11px] font-semibold text-purple-300">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Recuerdo Activo</span>
                    </span>
                  </div>

                  {/* Number */}
                  <div className="relative z-10 space-y-1">
                    <span className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-fuchsia-300 to-pink-300 block">
                      +14 hrs
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 block">
                      Tiempo recuperado
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ahorradas de estudio por semana
                    </p>
                  </div>
                </div>

                {/* Stat 3: Estudiantes Universitarios */}
                <div className="group relative p-6 sm:p-7 rounded-3xl bg-[#0c0f1c]/85 border border-white/[0.08] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/40 cursor-pointer overflow-hidden flex flex-col justify-between text-left">
                  {/* Radial spotlight on hover */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Top Bar: Icon + Micro-badge */}
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 shadow-inner">
                      <Users className="w-5 h-5 text-emerald-300" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/25 text-[11px] font-semibold text-emerald-300">
                      <span>28 facultades</span>
                    </span>
                  </div>

                  {/* Number */}
                  <div className="relative z-10 space-y-1">
                    <span className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-300 to-cyan-300 block">
                      +15,000
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 block">
                      Estudiantes activos
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      En universidades de toda LATAM
                    </p>
                  </div>
                </div>

                {/* Stat 4: Calificación Promedio */}
                <div className="group relative p-6 sm:p-7 rounded-3xl bg-[#0c0f1c]/85 border border-white/[0.08] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-950/40 cursor-pointer overflow-hidden flex flex-col justify-between text-left">
                  {/* Radial spotlight on hover */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Top Bar: Icon + Micro-badge */}
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300 shadow-inner">
                      <Star className="w-5 h-5 text-amber-300 fill-amber-400/40" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/25 text-[11px] font-semibold text-amber-300">
                      <span>4,200+ votos</span>
                    </span>
                  </div>

                  {/* Number */}
                  <div className="relative z-10 space-y-1">
                    <span className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-300 block">
                      4.9 / 5
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 block">
                      Calificación promedio
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Satisfacción académica verificada
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección Interactiva GSAP ScrollTrigger: Con Dalat: palabras en scroll */}
            <GsapWordScroller />

            {/* Carrusel infinito de Comentarios (GSAP) */}
            <section className="pt-24 pb-16 space-y-10">
              <div className="text-center space-y-2 px-4">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#a855f7]">
                  HISTORIAS REALES DE ÉXITO
                </span>
                <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-white tracking-tight">
                  Lo que dicen quienes ya estudian con Dalat
                </h2>
              </div>

              <GsapTestimonialMarquee testimonials={TESTIMONIALS} />
            </section>

            {/* Quick Explore Section Pill Grid */}
            <section className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-4 pb-12">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase text-purple-300 bg-purple-500/10 border border-purple-500/20">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Ecosistema Dalat
                </span>
                <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
                  Explora Dalat en detalle
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Conoce cada dimensión de la plataforma diseñada para transformar tu método de estudio universitario.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* 1. Quiénes Somos */}
                <button
                  onClick={() => navigateTo("quienes-somos")}
                  className="relative overflow-hidden p-6 rounded-3xl bg-[#0c0f1c]/80 border border-white/[0.08] backdrop-blur-xl hover:border-violet-500/40 hover:bg-[#12162a]/90 transition-all duration-300 text-left flex flex-col justify-between group shadow-xl shadow-black/40 min-h-[220px]"
                >
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-violet-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-600/25 transition-all duration-300" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 group-hover:border-violet-500/40 group-hover:bg-violet-500/20 transition-all duration-300">
                        <Compass className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        Misión
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-violet-300 transition-colors">
                        Quiénes Somos
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                        Conoce nuestra visión de neuroaprendizaje y el equipo detrás de Dalat.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors relative z-10">
                    <span>Conocer equipo</span>
                    <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* 2. Nuestros Servicios */}
                <button
                  onClick={() => navigateTo("servicios")}
                  className="relative overflow-hidden p-6 rounded-3xl bg-[#0c0f1c]/80 border border-white/[0.08] backdrop-blur-xl hover:border-sky-500/40 hover:bg-[#12162a]/90 transition-all duration-300 text-left flex flex-col justify-between group shadow-xl shadow-black/40 min-h-[220px]"
                >
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-600/25 transition-all duration-300" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 group-hover:border-sky-500/40 group-hover:bg-sky-500/20 transition-all duration-300">
                        <Zap className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        Módulos
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                        Nuestros Servicios
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                        Tutor IA 24/7, mapas de estudio, modo zen y horarios inteligentes.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors relative z-10">
                    <span>Ver funciones</span>
                    <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* 3. Planes y Precios */}
                <button
                  onClick={() => navigateTo("precios")}
                  className="relative overflow-hidden p-6 rounded-3xl bg-[#0c0f1c]/80 border border-white/[0.08] backdrop-blur-xl hover:border-fuchsia-500/40 hover:bg-[#12162a]/90 transition-all duration-300 text-left flex flex-col justify-between group shadow-xl shadow-black/40 min-h-[220px]"
                >
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-fuchsia-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-fuchsia-600/25 transition-all duration-300" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 group-hover:scale-105 group-hover:border-fuchsia-500/40 group-hover:bg-fuchsia-500/20 transition-all duration-300">
                        <Award className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20">
                        Precios
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-fuchsia-300 transition-colors">
                        Planes y Precios
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                        Comienza gratis o desbloquea el potencial Pro ilimitado para exámenes.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors relative z-10">
                    <span>Comparar planes</span>
                    <ArrowRight className="w-4 h-4 text-fuchsia-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* 4. Dalat Campus */}
                <button
                  onClick={() => navigateTo("instituciones")}
                  className="relative overflow-hidden p-6 rounded-3xl bg-[#0c0f1c]/80 border border-emerald-500/20 backdrop-blur-xl hover:border-emerald-500/50 hover:bg-[#0c181f]/90 transition-all duration-300 text-left flex flex-col justify-between group shadow-xl shadow-black/40 min-h-[220px]"
                >
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-600/25 transition-all duration-300" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 transition-all duration-300">
                        <School className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Campus
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-emerald-300 text-base group-hover:text-emerald-200 transition-colors">
                        Dalat Campus
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                        Licencias institucionales, convenios y analítica de retención docente.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors relative z-10">
                    <span className="text-emerald-300">Portal convenios</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
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
            <div className="text-center max-w-4xl mx-auto py-8">
              <StaggeredText
                text="Desafiando las reglas de la educación"
                as="h1"
                segmentBy="words"
                staggerDirection="forward"
                delay={90}
                duration={0.8}
                blur={true}
                direction="bottom"
                className="text-4xl sm:text-6xl md:text-7xl font-editorial font-bold text-white tracking-tight leading-tight justify-center"
              />
            </div>

            {/* Story & Foundation Section (Dave Style - Block 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              {/* Image 1: img1.jpg */}
              <div className="lg:col-span-5 relative group overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0c0f1c]/80 shadow-2xl">
                <img
                  src="/images/img1.jpg"
                  alt="Estudiante agobiado por métodos de memorización tradicionales"
                  loading="lazy"
                  className="w-full h-[360px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060814]/70 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Text 1: Dalat nació de una frustración real */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-[11px] font-mono tracking-wider uppercase text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block">
                  Propósito Fundacional
                </span>
                <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight leading-snug">
                  Nuestra Historia
                </h2>
                <p className="font-editorial text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
                  “Dalat nació de una frustración real: ver cómo estudiantes brillantes se frustran y reprueban materias complejas no por falta de capacidad, sino por utilizar métodos obsoletos de estudio como la memorización pasiva.”
                </p>
              </div>
            </div>

            {/* Pillars & Method Section (Dave Style - Block 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              {/* Text 2: Lista de los 3 textos sin emojis */}
              <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
                <div className="space-y-2">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block">
                    Metodología
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight leading-snug">
                    Ciencia del Aprendizaje
                  </h2>
                </div>

                <div className="space-y-5 pt-2">
                  {/* Item 1 */}
                  <div className="space-y-1 pb-4 border-b border-white/[0.06]">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Neurociencia Cognitiva
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Recuperación activa y práctica intercalada comprobada por estudios en retención de memoria a largo plazo.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-1 pb-4 border-b border-white/[0.06]">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Inteligencia Artificial Ética
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Tutor socrático guiado que desafía tu comprensión profunda y te ayuda a entender los porqués de cada fórmula y concepto.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Salud Mental Estudiantil
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Modo Zen y control del estrés académico diseñados para brindarte certidumbre, calma y un plan de acción claro.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image 2: img2.jpg */}
              <div className="lg:col-span-5 relative group overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0c0f1c]/80 shadow-2xl order-1 lg:order-2">
                <img
                  src="/images/img2.jpg"
                  alt="Estudiante concentrada en estudio analítico"
                  loading="lazy"
                  className="w-full h-[360px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060814]/70 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Team Showcase */}
            <div className="space-y-10 max-w-4xl mx-auto pt-6">
              <div className="text-center space-y-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase text-purple-300 bg-purple-500/10 border border-purple-500/20">
                  Liderazgo & Desarrollo
                </span>
                <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
                  El Equipo Detrás de Dalat
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Ingeniería, arquitectura de datos y diseño de interacción enfocados en transformar tu estudio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Laura Gómez */}
                <div className="p-7 sm:p-8 rounded-3xl bg-[#0c0f1c]/80 border border-white/[0.08] backdrop-blur-xl hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl shadow-black/30 group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono tracking-wider uppercase text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                        Cofundadora
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Backend & Producto
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-purple-200 transition-colors">
                        Laura Gómez
                      </h4>
                      <p className="text-xs font-semibold text-purple-400/90 mt-1">
                        Arquitectura Backend & Diseño de Producto
                      </p>
                    </div>

                    <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
                      Lidera la infraestructura de datos y el diseño centrado en el usuario, garantizando escalabilidad, seguridad y una experiencia fluida para estudiantes universitarios.
                    </p>
                  </div>

                  <div className="pt-5 border-t border-white/[0.06] flex flex-wrap gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300">
                      Escalabilidad
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300">
                      UX Systems
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300">
                      Seguridad de Datos
                    </span>
                  </div>
                </div>

                {/* Daniel Granados */}
                <div className="p-7 sm:p-8 rounded-3xl bg-[#0c0f1c]/80 border border-white/[0.08] backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl shadow-black/30 group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono tracking-wider uppercase text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        Cofundador
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Frontend & UI
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors">
                        Daniel Granados
                      </h4>
                      <p className="text-xs font-semibold text-indigo-400/90 mt-1">
                        Desarrollo Frontend & Experiencia Interactiva
                      </p>
                    </div>

                    <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
                      Dirige la arquitectura del cliente con Next.js y Tailwind CSS, creando componentes reactivos, micro-interacciones de alto rendimiento y accesibilidad integral.
                    </p>
                  </div>

                  <div className="pt-5 border-t border-white/[0.06] flex flex-wrap gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300">
                      Next.js Core
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300">
                      Interactividad
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300">
                      Rendimiento Web
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PÁGINA 3: SERVICIOS (DESGLOSE COMPLETO DE HERRAMIENTAS)    */}
        {/* ========================================================= */}
        {currentPage === "servicios" && (
          <div className="animate-in fade-in duration-300 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
            {/* Header Section */}
            <div className="text-center space-y-5 max-w-3xl mx-auto pt-16 sm:pt-28 pb-8 sm:pb-12">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-white tracking-tight leading-[1.15]">
                Herramientas de alto impacto para cada reto universitario
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Diseñadas con neurociencia cognitiva aplicada, impulsadas por modelos de IA contextuales y calibradas para que alcances tu máximo rendimiento sin fatiga ni agotamiento.
              </p>
            </div>

            {/* GSAP Pinned Image Mask Reveal on Scroll */}
            <GsapPinnedServices onActionClick={() => onEnterApp()} />

            {/* Bottom Call to Action - Elevated Bento Glass Design */}
            <div className="relative max-w-4xl mx-auto my-12 group">
              {/* Ambient Background Glow Effect */}
              <div className="absolute -inset-1.5 rounded-[36px] bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-pink-600/25 blur-2xl opacity-75 group-hover:opacity-95 transition-opacity duration-700 -z-10" />

              {/* Main Card Container */}
              <div className="relative rounded-[30px] bg-gradient-to-b from-[#15122b]/95 via-[#0d1020]/95 to-[#080a14]/98 border border-white/[0.12] p-8 sm:p-14 text-center space-y-8 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
                {/* Subtle Decorative Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.035] pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px"
                  }}
                />

                {/* Top Glowing Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/25 text-[11px] sm:text-xs font-semibold text-purple-300 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="tracking-wide uppercase font-mono">Acceso Inmediato &bull; Sin Tarjeta</span>
                </div>

                {/* Heading & Subtitle */}
                <div className="space-y-3 max-w-2xl mx-auto relative z-10">
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold text-white tracking-tight leading-tight">
                    ¿Listo para transformar tu{" "}
                    <span className="bg-gradient-to-r from-purple-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent">
                      método de estudio?
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl mx-auto">
                    Únete a miles de estudiantes universitarios que ya eliminaron la incertidumbre académica y aprueban sus materias con confianza y calma.
                  </p>
                </div>

                {/* CTA Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
                  <button
                    onClick={() => onEnterApp()}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] text-white font-bold text-xs sm:text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_25px_-5px_rgba(124,58,237,0.5)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_32px_-5px_rgba(124,58,237,0.7)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group/btn cursor-pointer"
                  >
                    <span>Probar todos los servicios gratis</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigateTo("precios")}
                    className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-purple-400/30 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-sm"
                  >
                    <span>Ver comparativa de planes</span>
                  </button>
                </div>

                {/* Trust Badges & Micro-Perks */}
                <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Plan gratuito para siempre</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sin tarjeta de crédito requerida</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Listo en menos de 1 minuto</span>
                  </div>
                </div>

                {/* Social Proof Rating */}
                <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400 relative z-10">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <div className="inline-flex h-5 w-5 rounded-full ring-2 ring-[#0d1020] bg-gradient-to-br from-purple-500 to-indigo-600 text-[9px] font-bold text-white items-center justify-center">A</div>
                    <div className="inline-flex h-5 w-5 rounded-full ring-2 ring-[#0d1020] bg-gradient-to-br from-pink-500 to-rose-600 text-[9px] font-bold text-white items-center justify-center">M</div>
                    <div className="inline-flex h-5 w-5 rounded-full ring-2 ring-[#0d1020] bg-gradient-to-br from-emerald-500 to-teal-600 text-[9px] font-bold text-white items-center justify-center">S</div>
                    <div className="inline-flex h-5 w-5 rounded-full ring-2 ring-[#0d1020] bg-gradient-to-br from-sky-500 to-blue-600 text-[9px] font-bold text-white items-center justify-center">D</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="font-semibold text-slate-300">4.9/5</span>
                  </div>
                  <span className="text-slate-400">&bull;</span>
                  <span>Calificado por +3,800 universitarios</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PÁGINA 4: PRECIOS (PLANES, MICROSUSCRIPCIONES, EN COP)    */}
        {/* ========================================================= */}
        {currentPage === "precios" && (
          <PricingSection
            onChoosePlan={handleChoosePlan}
            onEnterApp={() => onEnterApp()}
            onGoToInstitutions={() => setCurrentPage("instituciones")}
          />
        )}

        {/* ========================================================= */}
        {currentPage === "instituciones" && (
          <InstitutionalPage
            onEnterApp={() => onEnterApp()}
            onGoToPricing={() => navigateTo("precios")}
          />
        )}
      </main>

      {/* ========================================================= */}
      {/* FOOTER REDISEÑADO - ALTO IMPACTO & ARQUITECTURA MODERNA    */}
      {/* ========================================================= */}
      <footer className="relative z-10 border-t border-[#15192c] bg-[#04060c] text-slate-400 text-xs overflow-hidden">
        {/* Glow de fondo superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/[0.07] rounded-full blur-[140px] pointer-events-none" />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10 space-y-12">
          {/* Grilla Principal de Enlaces y Marca */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Columna 1: Marca y Propuesta (Span 2 columnas en LG) */}
            <div className="lg:col-span-2 space-y-5">
              <div
                onClick={() => navigateTo("inicio")}
                className="flex items-center gap-1 cursor-pointer group py-1"
              >
                <img
                  src="/icono-dalat.png"
                  alt="Dalat Robot"
                  className="h-8 sm:h-9 w-8 sm:w-9 object-contain opacity-95 group-hover:opacity-100 transition-opacity drop-shadow-md -mr-0.5"
                />
                <img
                  src="/dalat-logo-v2.png"
                  alt="Dalat"
                  className="h-9 sm:h-10 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                El copiloto inteligente para estudiantes de educación superior. Simulador socrático sin alucinaciones, cálculo inverso de GPA y bóveda colaborativa.
              </p>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Dalat AI v2.4 • Red Operativa 99.98%</span>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Cifrado TLS 1.3
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  Cumplimiento FERPA
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  0% Alucinaciones
                </span>
              </div>
            </div>

            {/* Columna 2: Módulos & Herramientas */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-white/90 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Módulos Dalat
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => navigateTo("servicios")}
                    className="hover:text-purple-300 transition text-left cursor-pointer"
                  >
                    Tutor Socrático IA
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("servicios")}
                    className="hover:text-purple-300 transition text-left cursor-pointer"
                  >
                    Cortes & GPA Predictivo
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("servicios")}
                    className="hover:text-purple-300 transition text-left cursor-pointer"
                  >
                    Modo Zen & Frecuencias
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("servicios")}
                    className="hover:text-purple-300 transition text-left cursor-pointer"
                  >
                    Bóveda & Repositorio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("servicios")}
                    className="hover:text-purple-300 transition text-left cursor-pointer"
                  >
                    Flashcards de Repetición
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("servicios")}
                    className="hover:text-purple-300 transition text-left cursor-pointer"
                  >
                    Método Feynman & Cornell
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 3: Explorar & Ecosistema */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-white/90 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Explorar
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => navigateTo("inicio")}
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("quienes-somos")}
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    Quiénes Somos & Misión
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("precios")}
                    className="hover:text-white transition text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Planes & Suscripciones</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">COP</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("instituciones")}
                    className="hover:text-emerald-300 font-medium transition text-left cursor-pointer"
                  >
                    Para Universidades
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLoginClick("login")}
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onLoginClick("register")}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition text-left cursor-pointer"
                  >
                    Crear Cuenta Gratuita →
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 4: Seguridad, Legal & Soporte */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-white/90 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                Seguridad & Ética
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() =>
                      setLegalModal({
                        title: "Privacidad Académica Estricta",
                        category: "Protección de Datos del Estudiante",
                        content: [
                          "Tus notas, apuntes escaneados y lecturas subidas son de tu exclusiva propiedad académica. Dalat nunca vende tu información ni comparte tu perfil con terceros.",
                          "Cero entrenamiento público: el material pedagógico que cargas en tu bóveda no se utiliza para alimentar ni entrenar modelos de IA públicos.",
                          "Cifrado de extremo a extremo: toda transferencia cuenta con protocolo TLS 1.3 y los datos en reposo están protegidos bajo estándar militar AES-256.",
                          "Derecho de supresión: puedes descargar o eliminar definitivamente cualquiera de tus archivos, preguntas generadas o sesiones de estudio en cualquier momento.",
                        ],
                      })
                    }
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    Privacidad Académica
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      setLegalModal({
                        title: "Términos del Servicio",
                        category: "Condiciones de Uso de Dalat",
                        content: [
                          "Dalat Technologies es una plataforma diseñada para potenciar el aprendizaje autónomo, la organización semestral y la evaluación formativa.",
                          "Uso ético y formativo: las herramientas socráticas buscan guiar el razonamiento crítico del alumno y no suplantar la autoría intelectual del estudiante.",
                          "Microsuscripciones transparentes: los planes en Pesos Colombianos (COP) no tienen cláusulas de permanencia y pueden cancelarse en cualquier ciclo con 1 solo clic.",
                          "Disponibilidad de servicio: contamos con infraestructura en la nube redundante con un objetivo de disponibilidad del 99.9% durante periodos de parciales críticos.",
                        ],
                      })
                    }
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    Términos de Servicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      setLegalModal({
                        title: "Cumplimiento FERPA / GDPR",
                        category: "Estándares Internacionales de Educación",
                        content: [
                          "Alineación con la Ley FERPA (Family Educational Rights and Privacy Act) en el resguardo estricto de registros de calificaciones y ponderaciones.",
                          "Reglamento General de Protección de Datos (GDPR) y Ley de Habeas Data (Ley 1581 en Colombia) plenamente garantizados.",
                          "Aislamiento de sesiones: los equipos de estudio y bóvedas compartidas solo son accesibles mediante códigos de invitación cifrados generados por el creador.",
                          "Cero retención bancaria: los pagos y microtransacciones son procesados directamente por pasarelas certificadas PCI-DSS Nivel 1 sin almacenar tarjetas en Dalat.",
                        ],
                      })
                    }
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    Seguridad FERPA / GDPR
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      setLegalModal({
                        title: "Política de Cero Alucinaciones",
                        category: "Rigor Pedagógico & Fórmulas Exactas",
                        content: [
                          "Nuestro motor RAG contextual acota estrictamente la formulación de preguntas a los documentos y temarios provistos por el estudiante.",
                          "Soporte KaTeX nativo: las fórmulas matemáticas, físicas y químicas se renderizan con precisión simbólica absoluta.",
                          "Desglose de distractores: cada opción errónea en un simulador explica el error conceptual exacto para reforzar el aprendizaje sin confusiones.",
                        ],
                      })
                    }
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    Cero Alucinaciones
                  </button>
                </li>
                <li className="pt-2">
                  <a
                    href="mailto:soporte@dalat.app"
                    className="text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span>soporte@dalat.app</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Sub-Footer inferior */}
          <div className="pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-5 text-[11px] text-slate-400">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
              <p>&copy; {new Date().getFullYear()} Dalat Technologies Inc. Todos los derechos reservados.</p>
              <span className="hidden sm:inline text-slate-700">&bull;</span>
              <p className="text-slate-400 flex items-center gap-1">
                Diseñado con <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> para estudiantes universitarios
              </p>
            </div>

            <div className="flex items-center gap-5">
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                <span>🇨🇴</span>
                <span>Colombia • COP</span>
              </span>

              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="hover:text-white transition flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Volver arriba</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Legal & Informativo */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c1020] border border-white/10 p-6 sm:p-8 shadow-2xl text-slate-200 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold">
                  {legalModal.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">{legalModal.title}</h3>
              </div>
              <button
                onClick={() => setLegalModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {legalModal.content.map((paragraph, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>{paragraph}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
