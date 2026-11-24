"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Calendar,
  Trash2,
  Calculator,
  Loader2,
  BookOpen,
  Award,
  RefreshCw,
  Check,
  Pencil,
  FileCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { subjectService, CalculadoraItem, Asignatura } from "@/services/subjectService";
import { useAuth } from "@/context/AuthContext";
import { getStoredToken } from "@/lib/api";

interface Evaluation {
  id: string;
  backendId?: number;
  name: string;
  date: string;
  type: "Tarea" | "Examen" | "Taller" | "Proyecto";
  grade: number;
  maxGrade: number;
  weight: number;
}

interface Corte {
  id: string;
  corteNum?: number;
  name: string;
  weight: number; // percentage, e.g. 30
  evaluations: Evaluation[];
}

interface SubjectItem {
  id: string;
  backendId?: number;
  name: string;
  code?: string;
  professor?: string;
  credits?: number;
  color?: string;
  maxScale?: number;
  passingGrade?: number;
  evaluationsText: string;
  cortes: Corte[];
}

const INITIAL_SUBJECTS: SubjectItem[] = [];

interface CalcRow {
  id: string;
  name: string;
  grade: string;
  weight: string;
}

function mapBackendSubjectToItem(b: Asignatura): SubjectItem {
  let cortes: Corte[] = [];
  if (b.cortes && b.cortes.length > 0) {
    cortes = b.cortes.map((c) => ({
      id: `c_${c.corte}`,
      corteNum: c.corte,
      name: `${c.corte}${c.corte === 1 ? "er" : c.corte === 2 ? "do" : c.corte === 3 ? "er" : "to"} Corte`,
      weight: c.porcentaje_total || (c.corte === 1 ? 30 : 35),
      evaluations: (c.evaluaciones || []).map((ev) => ({
        id: ev.id_evaluacion ? `eval_${ev.id_evaluacion}` : `eval_${Date.now()}_${Math.random()}`,
        backendId: ev.id_evaluacion,
        name: ev.nombre,
        date: ev.fecha || "Semestre actual",
        type: (ev.tipo as any) || "Parcial",
        grade: typeof ev.nota === "number" ? ev.nota : 0,
        maxGrade: ev.max_nota || b.escala_maxima || 5.0,
        weight: ev.peso_porcentaje,
      })),
    }));
  } else {
    cortes = [
      { id: "c1", corteNum: 1, name: "1er Corte", weight: 30, evaluations: [] },
      { id: "c2", corteNum: 2, name: "2do Corte", weight: 35, evaluations: [] },
      { id: "c3", corteNum: 3, name: "3er Corte", weight: 35, evaluations: [] },
    ];
  }

  const totalEvals = cortes.reduce((acc, c) => acc + c.evaluations.length, 0);

  return {
    id: `subj_${b.id_asignatura}`,
    backendId: b.id_asignatura,
    name: b.nombre,
    code: b.codigo || undefined,
    professor: b.profesor || undefined,
    credits: b.creditos || 3,
    color: b.color || "#7c5dfa",
    maxScale: b.escala_maxima || 5.0,
    passingGrade: b.nota_aprobatoria || 3.0,
    evaluationsText: `${cortes.length} cortes · ${totalEvals} evaluaciones`,
    cortes,
  };
}


const EVAL_TYPES = [
  { id: "Examen", label: "Examen", icon: FileCheck },
  { id: "Tarea", label: "Tarea", icon: BookOpen },
  { id: "Taller", label: "Taller", icon: Calculator },
  { id: "Proyecto", label: "Proyecto", icon: Award },
] as const;

interface NotesTabProps {
  isLightMode?: boolean;
}

export default function NotesTab({ isLightMode = false }: NotesTabProps) {
  const { user, isAuthenticated } = useAuth();

  // Detección reactiva y robusta del modo claro (prop, clase .theme-light en DOM o localStorage)
  const [domIsLight, setDomIsLight] = useState<boolean>(() => {
    if (typeof window === "undefined") return Boolean(isLightMode);
    return (
      Boolean(isLightMode) ||
      document.documentElement.classList.contains("theme-light") ||
      document.body.classList.contains("theme-light") ||
      document.querySelector(".theme-light") !== null ||
      localStorage.getItem("dalat_theme") === "light"
    );
  });

  useEffect(() => {
    const updateTheme = () => {
      const isL =
        Boolean(isLightMode) ||
        document.documentElement.classList.contains("theme-light") ||
        document.body.classList.contains("theme-light") ||
        document.querySelector(".theme-light") !== null ||
        localStorage.getItem("dalat_theme") === "light";
      setDomIsLight(isL);
    };

    updateTheme();

    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(updateTheme);
      observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });
      window.addEventListener("storage", updateTheme);
      return () => {
        observer.disconnect();
        window.removeEventListener("storage", updateTheme);
      };
    }
  }, [isLightMode]);

  const activeLight = Boolean(isLightMode || domIsLight);

  // Escala global de calificación: 5.0 o 10.0 (persistida en localStorage)
  const [globalScale, setGlobalScale] = useState<5.0 | 10.0>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dalat_grade_scale");
      if (saved === "10" || saved === "10.0") return 10.0;
      if (saved === "5" || saved === "5.0") return 5.0;
    }
    return 5.0; // Por defecto 0 a 5.0 (estándar preferido)
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    const scale = typeof window !== "undefined" && localStorage.getItem("dalat_grade_scale") === "10" ? 10.0 : 5.0;
    if (scale === 5.0) {
      return INITIAL_SUBJECTS.map((s) => ({
        ...s,
        maxScale: 5.0,
        passingGrade: 3.0,
        cortes: s.cortes.map((c) => ({
          ...c,
          evaluations: c.evaluations.map((ev) => ({
            ...ev,
            grade: parseFloat((ev.grade / 2).toFixed(2)),
            maxGrade: 5.0,
          })),
        })),
      }));
    }
    return INITIAL_SUBJECTS;
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [activeCorteIndex, setActiveCorteIndex] = useState<number>(0);
  const [showAddEvalForm, setShowAddEvalForm] = useState<boolean>(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(false);

  // New subject modal state
  const [showAddSubjectModal, setShowAddSubjectModal] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>("");
  const [newSubjectCredits, setNewSubjectCredits] = useState<number>(3);
  const newSubjectColor = "#7c5dfa";
  const [newSubjectScale, setNewSubjectScale] = useState<number>(10.0);
  const [newSubjectPassing, setNewSubjectPassing] = useState<number>(6.0);
  const [isSavingSubject, setIsSavingSubject] = useState<boolean>(false);
  const [isSavingEval, setIsSavingEval] = useState<boolean>(false);

  // Estado para modificar porcentaje del corte activo
  const [isEditingWeight, setIsEditingWeight] = useState<boolean>(false);
  const [tempWeight, setTempWeight] = useState<string>("");

  // New evaluation form state
  const [evalName, setEvalName] = useState("");
  const [evalType, setEvalType] = useState<"Tarea" | "Examen" | "Taller" | "Proyecto">("Examen");
  const [evalDate, setEvalDate] = useState("11/06/2026");
  const [evalGrade, setEvalGrade] = useState("8.5");
  const [evalMaxGrade, setEvalMaxGrade] = useState("10");
  const [evalWeight, setEvalWeight] = useState("40");

  // Carga inicial y sincronización con el backend
  const loadSubjectsFromBackend = async () => {
    if (!getStoredToken()) {
      setSubjects([]);
      return;
    }
    setIsLoadingSubjects(true);
    try {
      const list = await subjectService.getSubjects();
      if (list && Array.isArray(list)) {
        const mapped = list.map(mapBackendSubjectToItem);
        setSubjects(mapped);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.warn("[NotesTab] Error al cargar asignaturas del backend:", err);
      setSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  useEffect(() => {
    setSubjects([]);
    loadSubjectsFromBackend();
  }, [user?.email, user?.id]);

  // Quick calculator state
  const [calcRows, setCalcRows] = useState<CalcRow[]>([
    { id: "1", name: "Parcial 1", grade: "", weight: "" },
    { id: "2", name: "Parcial 2", grade: "", weight: "" },
    { id: "3", name: "Trabajo", grade: "", weight: "" },
  ]);
  const [calcResult, setCalcResult] = useState<{
    average: number;
    totalWeight: number;
    status: "aprobado" | "reprobado" | "neutral";
    message?: string;
    accumulated?: number;
    neededToPass?: number | null;
    diagnostic?: string;
    isAchievable?: boolean;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Cambiar escala global (0 a 5.0 o 0 a 10.0) y convertir proporcionalmente
  const handleSwitchGlobalScale = (newScale: 5.0 | 10.0) => {
    if (newScale === globalScale) return;
    try {
      localStorage.setItem("dalat_grade_scale", newScale.toString());
    } catch {
      // ignore
    }
    setGlobalScale(newScale);

    const factor = newScale === 5.0 ? 0.5 : 2.0;
    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        maxScale: newScale,
        passingGrade: newScale === 5.0 ? 3.0 : 6.0,
        cortes: s.cortes.map((c) => ({
          ...c,
          evaluations: c.evaluations.map((ev) => {
            const currentMax = ev.maxGrade || (newScale === 5.0 ? 10 : 5);
            if (currentMax === newScale) return ev;
            const newGrade = Math.min(newScale, Math.max(0, parseFloat((ev.grade * factor).toFixed(2))));
            return {
              ...ev,
              grade: newGrade,
              maxGrade: newScale,
            };
          }),
        })),
      }))
    );

    setNewSubjectScale(newScale);
    setNewSubjectPassing(newScale === 5.0 ? 3.0 : 6.0);
    setEvalMaxGrade(newScale.toString());
    setEvalGrade(newScale === 5.0 ? "4.2" : "8.5");
  };

  // Calculations helper functions
  const calculateCorteAverage = (corte: Corte): number | null => {
    if (corte.evaluations.length === 0) return null;
    let totalWeight = 0;
    let weightedSum = 0;
    corte.evaluations.forEach((ev) => {
      const max = ev.maxGrade || globalScale;
      const normalizedGrade = max > 0 ? (ev.grade / max) * globalScale : 0;
      weightedSum += normalizedGrade * ev.weight;
      totalWeight += ev.weight;
    });
    if (totalWeight === 0) return null;
    return parseFloat((weightedSum / totalWeight).toFixed(2));
  };

  const calculateFinalGrade = (subject: SubjectItem): string => {
    let finalSum = 0;
    let totalCorteWeight = 0;
    subject.cortes.forEach((corte) => {
      const avg = calculateCorteAverage(corte);
      if (avg !== null) {
        finalSum += avg * (corte.weight / 100);
        totalCorteWeight += corte.weight;
      }
    });
    if (totalCorteWeight === 0) return "0.00";
    return (finalSum).toFixed(2);
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const activeCorte = selectedSubject ? selectedSubject.cortes[activeCorteIndex] || selectedSubject.cortes[0] : null;

  // Actualizar porcentaje del corte activo
  const handleUpdateActiveCorteWeight = (newWeightVal: number) => {
    if (!selectedSubject || !activeCorte) return;
    const clamped = Math.max(1, Math.min(100, isNaN(newWeightVal) ? 0 : Math.round(newWeightVal)));
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== selectedSubject.id) return s;
        const updatedCortes = s.cortes.map((c, idx) => {
          if (idx !== activeCorteIndex) return c;
          return { ...c, weight: clamped };
        });
        return { ...s, cortes: updatedCortes };
      })
    );
    setIsEditingWeight(false);
  };

  // Add Corte to current subject
  const handleAddCorte = () => {
    if (!selectedSubject) return;
    const nextNumber = selectedSubject.cortes.length + 1;
    const name = `${nextNumber}${nextNumber === 1 ? "er" : nextNumber === 2 ? "do" : nextNumber === 3 ? "er" : "to"} Corte`;
    const newCorte: Corte = {
      id: `c_${Date.now()}`,
      corteNum: nextNumber,
      name,
      weight: 25,
      evaluations: [],
    };
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === selectedSubject.id
          ? { ...s, cortes: [...s.cortes, newCorte] }
          : s
      )
    );
  };

  // Remove last Corte
  const handleRemoveCorte = () => {
    if (!selectedSubject || selectedSubject.cortes.length <= 1) return;
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === selectedSubject.id) {
          const nextCortes = [...s.cortes];
          nextCortes.pop();
          return { ...s, cortes: nextCortes };
        }
        return s;
      })
    );
    if (activeCorteIndex >= selectedSubject.cortes.length - 1) {
      setActiveCorteIndex(Math.max(0, selectedSubject.cortes.length - 2));
    }
  };

  // Crear Asignatura
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setIsSavingSubject(true);
    try {
      let createdItem: SubjectItem;

      if (getStoredToken()) {
        const backendSubj = await subjectService.createSubject({
          nombre: newSubjectName.trim(),
          codigo: undefined,
          profesor: undefined,
          creditos: newSubjectCredits || 3,
          color: newSubjectColor,
          escala_maxima: newSubjectScale,
          nota_aprobatoria: newSubjectPassing,
          periodo: "2026-1",
        });
        createdItem = mapBackendSubjectToItem(backendSubj);
      } else {
        createdItem = {
          id: `local_${Date.now()}`,
          name: newSubjectName.trim(),
          code: undefined,
          professor: undefined,
          credits: newSubjectCredits || 3,
          color: newSubjectColor,
          maxScale: newSubjectScale,
          passingGrade: newSubjectPassing,
          evaluationsText: "3 cortes · 0 evaluaciones",
          cortes: [
            { id: "c1", corteNum: 1, name: "1er Corte", weight: 30, evaluations: [] },
            { id: "c2", corteNum: 2, name: "2do Corte", weight: 35, evaluations: [] },
            { id: "c3", corteNum: 3, name: "3er Corte", weight: 35, evaluations: [] },
          ],
        };
      }

      setSubjects((prev) => [createdItem, ...prev]);
      setShowAddSubjectModal(false);
      setNewSubjectName("");
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err?.message || "Error al crear la asignatura.");
    } finally {
      setIsSavingSubject(false);
    }
  };

  // Eliminar Asignatura
  const handleDeleteSubject = async (subjId: string, backendId?: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta asignatura y todas sus evaluaciones?")) return;
    if (backendId && getStoredToken()) {
      try {
        await subjectService.deleteSubject(backendId);
      } catch (err) {
        console.warn("[Asignatura] Error al eliminar en backend:", err);
      }
    }

    setSubjects((prev) => prev.filter((s) => s.id !== subjId));
    setSelectedSubjectId(null);
    setShowAddEvalForm(false);
  };

  // Add evaluation to active corte
  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !activeCorte || !evalName.trim()) return;

    setIsSavingEval(true);
    try {
      const corteNum = activeCorte.corteNum || activeCorteIndex + 1;
      const gradeNum = parseFloat(evalGrade) || 0;
      const maxGradeNum = parseFloat(evalMaxGrade) || (selectedSubject.maxScale || 10);
      const weightNum = parseFloat(evalWeight) || 0;

      let evalBackendId: number | undefined;

      if (selectedSubject.backendId && getStoredToken()) {
        try {
          const createdEval = await subjectService.addEvaluation(selectedSubject.backendId, {
            nombre: evalName.trim(),
            tipo: evalType,
            corte: corteNum,
            nota: gradeNum,
            max_nota: maxGradeNum,
            peso_porcentaje: weightNum,
            fecha: evalDate || "Hoy",
          });
          evalBackendId = createdEval.id_evaluacion;
        } catch (apiErr: any) {
          console.warn("[Evaluacion] Error en endpoint:", apiErr);
        }
      }

      const newEval: Evaluation = {
        id: evalBackendId ? `eval_${evalBackendId}` : `eval_${Date.now()}`,
        backendId: evalBackendId,
        name: evalName.trim(),
        type: evalType,
        date: evalDate || "Hoy",
        grade: gradeNum,
        maxGrade: maxGradeNum,
        weight: weightNum,
      };

      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id === selectedSubject.id) {
            const updatedCortes = s.cortes.map((c, idx) => {
              if (idx === activeCorteIndex) {
                return { ...c, evaluations: [...c.evaluations, newEval] };
              }
              return c;
            });
            const totalEvals = updatedCortes.reduce((acc, c) => acc + c.evaluations.length, 0);
            return {
              ...s,
              cortes: updatedCortes,
              evaluationsText: `${updatedCortes.length} cortes · ${totalEvals} evaluaciones`,
            };
          }
          return s;
        })
      );

      setEvalName("");
      setShowAddEvalForm(false);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    } finally {
      setIsSavingEval(false);
    }
  };

  // Delete evaluation
  const handleDeleteEvaluation = async (evalId: string, backendId?: number) => {
    if (!selectedSubject) return;
    if (backendId && getStoredToken()) {
      try {
        await subjectService.deleteEvaluation(backendId);
      } catch (err) {
        console.warn("[Evaluacion] Error al eliminar en backend:", err);
      }
    }

    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === selectedSubject.id) {
          const updatedCortes = s.cortes.map((c, idx) => {
            if (idx === activeCorteIndex) {
              return {
                ...c,
                evaluations: c.evaluations.filter((ev) => ev.id !== evalId),
              };
            }
            return c;
          });
          const totalEvals = updatedCortes.reduce((acc, c) => acc + c.evaluations.length, 0);
          return {
            ...s,
            cortes: updatedCortes,
            evaluationsText: `${updatedCortes.length} cortes · ${totalEvals} evaluaciones`,
          };
        }
        return s;
      })
    );
  };

  // Quick calculator helpers
  const addCalcRow = () => {
    setCalcRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Evaluación ${prev.length + 1}`,
        grade: "",
        weight: "",
      },
    ]);
  };

  const removeCalcRow = (id: string) => {
    setCalcRows((prev) => prev.filter((r) => r.id !== id));
    setCalcResult(null);
  };

  const handleCalculate = async () => {
    // 1. Filtrar filas válidas
    const validItems: CalculadoraItem[] = [];
    calcRows.forEach((row) => {
      const cleanGrade = row.grade.trim().replace(",", ".");
      const cleanWeight = row.weight.trim().replace(",", ".").replace("%", "");

      const gradeNum = cleanGrade !== "" ? parseFloat(cleanGrade) : null;
      const weightNum = parseFloat(cleanWeight);

      if (!isNaN(weightNum) && weightNum > 0) {
        validItems.push({
          nombre: row.name || "Evaluación",
          nota: gradeNum !== null && !isNaN(gradeNum) ? gradeNum : null,
          peso_porcentaje: weightNum,
        });
      }
    });

    if (validItems.length === 0) {
      setCalcResult({
        average: 0,
        totalWeight: 0,
        status: "neutral",
        message: "Ingresa al menos una evaluación con su porcentaje de peso (%) para calcular",
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Llamar al endpoint del backend /api/asignaturas/calculadora usando la escala global
      const res = await subjectService.calculateQuickGrades({
        escala_maxima: globalScale,
        nota_aprobatoria: globalScale === 5.0 ? 3.0 : 6.0,
        evaluaciones: validItems,
      });

      const avg = res.promedio_ponderado || 0;
      const isApproved =
        res.estado === "aprobada asegurada" ||
        res.estado === "aprobando" ||
        res.estado === "aprobada";

      setCalcResult({
        average: avg,
        totalWeight: res.porcentaje_evaluado,
        status: isApproved ? "aprobado" : "reprobado",
        accumulated: res.nota_acumulada,
        neededToPass: res.nota_necesaria_para_aprobar,
        diagnostic: res.mensaje_diagnostico,
        isAchievable: res.es_alcanzable,
      });

      if (avg >= 7.0) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.warn("[Calculadora] Usando cálculo local por fallback offline:", err);
      // Fallback local robusto
      let weightedSum = 0;
      let totalWeight = 0;
      let count = 0;

      validItems.forEach((it) => {
        if (typeof it.nota === "number") {
          weightedSum += it.nota * it.peso_porcentaje;
          totalWeight += it.peso_porcentaje;
          count++;
        }
      });

      if (count === 0 || totalWeight === 0) {
        setCalcResult({
          average: 0,
          totalWeight: 0,
          status: "neutral",
          message: "Ingresa notas numéricas para promediar.",
        });
        return;
      }

      const avg = parseFloat((weightedSum / totalWeight).toFixed(2));
      const passing = globalScale === 5.0 ? 3.0 : 6.0;
      const status = avg >= passing ? "aprobado" : "reprobado";

      setCalcResult({
        average: avg,
        totalWeight: Math.round(totalWeight * 100) / 100,
        status,
        diagnostic: `Promedio calculado localmente (${status === "aprobado" ? "Aprobando" : "Requiere refuerzo"}).`,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleResetCalc = () => {
    setCalcRows([
      { id: "1", name: "Parcial 1", grade: "", weight: "" },
      { id: "2", name: "Parcial 2", grade: "", weight: "" },
      { id: "3", name: "Trabajo", grade: "", weight: "" },
    ]);
    setCalcResult(null);
  };

  // ==========================================
  // VIEW 2: Subject Detail Screen (Images 2, 3 & 4)
  // ==========================================
  if (selectedSubject && activeCorte) {
    const corteAvg = calculateCorteAverage(activeCorte);
    const finalGrade = calculateFinalGrade(selectedSubject);
    const totalEvalsCount = selectedSubject.cortes.reduce(
      (acc, c) => acc + c.evaluations.length,
      0
    );

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Back Link & Global Scale Selector */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => {
              setSelectedSubjectId(null);
              setShowAddEvalForm(false);
            }}
            className={`flex items-center gap-1.5 text-xs font-semibold transition ${activeLight ? "text-purple-600 hover:text-purple-800" : "text-[#818cf8] hover:text-indigo-300"}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Todas las materias</span>
          </button>

          <div className={`flex items-center p-1 rounded-xl border text-xs ${
            activeLight ? "bg-slate-100 border-slate-200" : "bg-[#101322] border-[#1e2338]"
          }`}>
            <span className={`text-[11px] font-semibold px-2 hidden sm:inline ${
              activeLight ? "text-slate-500" : "text-slate-400"
            }`}>
              Escala:
            </span>
            <button
              type="button"
              onClick={() => handleSwitchGlobalScale(5.0)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                globalScale === 5.0
                  ? activeLight
                    ? "bg-white text-purple-700 shadow-xs border border-purple-200"
                    : "bg-purple-600 text-white shadow-xs"
                  : activeLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              0 a 5.0
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGlobalScale(10.0)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                globalScale === 10.0
                  ? activeLight
                    ? "bg-white text-purple-700 shadow-xs border border-purple-200"
                    : "bg-purple-600 text-white shadow-xs"
                  : activeLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              0 a 10.0
            </button>
          </div>
        </div>

        {/* Subject Header Card */}
        <div className={`rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-colors ${activeLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0c0e18] border-[#171c2f]"}`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h2 className={`text-2xl sm:text-3xl font-editorial font-bold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
                {selectedSubject.name}
              </h2>
              {selectedSubject.code && (
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${activeLight ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white/10 border-transparent text-slate-300"}`}>
                  {selectedSubject.code}
                </span>
              )}
            </div>
            <p className={`text-xs ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
              {selectedSubject.professor ? `${selectedSubject.professor} • ` : ""}
              {selectedSubject.credits ? `${selectedSubject.credits} créditos • ` : ""}
              {selectedSubject.cortes.length} cortes &bull; {totalEvalsCount} evaluaciones registradas
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-left sm:text-right">
              <div className="text-4xl sm:text-5xl font-extrabold text-[#f43f8e] tracking-tight">
                {finalGrade}
              </div>
              <span className="text-xs text-slate-400 font-medium block mt-0.5">
                nota final ({selectedSubject.maxScale ? `/${selectedSubject.maxScale}` : "/10"})
              </span>
            </div>
            <button
              onClick={() => handleDeleteSubject(selectedSubject.id, selectedSubject.backendId)}
              className="p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40 transition shrink-0"
              title="Eliminar materia"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cortes Pills Switcher & Management (Images 2 & 4) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {selectedSubject.cortes.map((corte, idx) => {
            const isActive = activeCorteIndex === idx;
            return (
              <button
                key={corte.id}
                onClick={() => {
                  setActiveCorteIndex(idx);
                  setShowAddEvalForm(false);
                  setIsEditingWeight(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20 font-bold"
                    : activeLight
                    ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                    : "bg-[#101324] border border-[#1e243d] text-slate-300 hover:text-white hover:bg-[#14182d]"
                }`}
              >
                <span>{corte.name}</span>
                <span className="font-mono font-bold">{corte.weight}</span>
                <span className="text-[11px] opacity-75">%</span>
              </button>
            );
          })}

          {/* + Corte button */}
          <button
            onClick={handleAddCorte}
            className={`flex items-center gap-1 px-4 py-2 rounded-2xl border border-dashed text-xs font-semibold transition ${activeLight ? "border-purple-300 text-purple-700 hover:bg-purple-50 bg-purple-50/40" : "border-[#47347a] hover:border-[#7c5dfa] text-[#a78bfa] hover:text-white bg-[#100e24]/60"}`}
          >
            <span>+ Corte</span>
          </button>

          {/* - Quitar corte button */}
          {selectedSubject.cortes.length > 1 && (
            <button
              onClick={handleRemoveCorte}
              className={`flex items-center gap-1 px-4 py-2 rounded-2xl border border-dashed text-xs font-semibold transition ${activeLight ? "border-rose-300 text-rose-700 hover:bg-rose-50 bg-rose-50/40" : "border-[#541e2a] hover:border-rose-500 text-rose-400 hover:text-rose-300 bg-[#1e0e15]/60"}`}
            >
              <span>- Quitar corte</span>
            </button>
          )}
        </div>

        {/* Active Corte Summary Header con edición de porcentaje */}
        <div className="flex items-center justify-between pt-1 flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className={`text-xl font-bold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
                {activeCorte.name}
              </h3>

              {/* Botón / Modo edición de Ponderación (porcentaje) */}
              {isEditingWeight ? (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition animate-in zoom-in-95 duration-150 ${
                  activeLight
                    ? "bg-white border-purple-400 ring-2 ring-purple-100"
                    : "bg-[#101326] border-purple-500/80 ring-2 ring-purple-900/30"
                }`}>
                  <span className={`text-xs font-semibold ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                    Peso:
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      autoFocus
                      value={tempWeight}
                      onChange={(e) => setTempWeight(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateActiveCorteWeight(parseFloat(tempWeight));
                        if (e.key === "Escape") setIsEditingWeight(false);
                      }}
                      className={`w-16 px-2 py-0.5 text-xs font-bold rounded-lg border text-center focus:outline-none ${
                        activeLight
                          ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-500"
                          : "bg-[#090b14] border-[#1e233d] text-white focus:border-purple-400"
                      }`}
                    />
                    <span className="ml-1 text-xs font-bold text-purple-600">%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveCorteWeight(parseFloat(tempWeight))}
                    className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition shadow-xs cursor-pointer flex items-center justify-center"
                    title="Guardar porcentaje"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingWeight(false)}
                    className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                      activeLight ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                    }`}
                    title="Cancelar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempWeight(activeCorte.weight.toString());
                    setIsEditingWeight(true);
                  }}
                  className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                    activeLight
                      ? "bg-purple-50/80 hover:bg-purple-100 border-purple-200 text-purple-900 hover:border-purple-300"
                      : "bg-[#131026] hover:bg-[#1a1636] border-purple-800/50 text-purple-200 hover:border-purple-600"
                  }`}
                  title="Haz clic para modificar el porcentaje de este corte"
                >
                  <span className="text-[11px] font-medium opacity-70">Ponderación:</span>
                  <span className="font-mono font-extrabold text-sm text-purple-600">
                    {activeCorte.weight}%
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md transition ${
                    activeLight
                      ? "bg-purple-200/70 text-purple-800 group-hover:bg-purple-200"
                      : "bg-purple-900/60 text-purple-300 group-hover:bg-purple-800/80"
                  }`}>
                    <Pencil className="w-2.5 h-2.5" />
                    <span>Editar</span>
                  </span>
                </button>
              )}
            </div>

            <div className={`text-xs flex items-center gap-2 ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
              <span>{activeCorte.evaluations.length} {activeCorte.evaluations.length === 1 ? "nota registrada" : "notas registradas"}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-[#fbbf24] tracking-tight">
              {corteAvg !== null ? corteAvg.toFixed(2) : "—"}
            </div>
            <span className={`text-xs block ${activeLight ? "text-slate-500" : "text-slate-400"}`}>promedio corte</span>
          </div>
        </div>

        {/* Evaluations Table */}
        <div className={`rounded-2xl border overflow-hidden ${activeLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0c0e18] border-[#171c2f]"}`}>
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              {/* Table Header: 4 + 2 + 3 + 2 + 1 = 12 cols con espacio holgado */}
              <div className={`grid grid-cols-12 gap-4 px-6 py-3.5 border-b text-[10px] uppercase font-bold tracking-wider ${activeLight ? "bg-slate-50/80 border-slate-200 text-slate-600" : "border-[#15192c] text-slate-400"}`}>
                <div className="col-span-4">EVALUACIÓN</div>
                <div className="col-span-2 text-center">TIPO</div>
                <div className="col-span-3 text-center">CALIFICACIÓN</div>
                <div className="col-span-2 text-center">PESO</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {/* Rows */}
              {activeCorte.evaluations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  No hay notas registradas en este corte. Pulsa el botón inferior para añadir una.
                </div>
              ) : (
                <div className={activeLight ? "divide-y divide-slate-100" : "divide-y divide-[#15192c]"}>
                  {activeCorte.evaluations.map((ev) => (
                    <div
                      key={ev.id}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition group ${activeLight ? "hover:bg-slate-50/90" : "hover:bg-[#0f1324]/50"}`}
                    >
                      {/* Evaluation Name & Date (4 cols) */}
                      <div className="col-span-4">
                        <h4 className={`text-sm font-semibold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
                          {ev.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {ev.date}
                        </span>
                      </div>

                      {/* Type Badge (2 cols) */}
                      <div className="col-span-2 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            ev.type === "Tarea"
                              ? activeLight
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-emerald-950/70 border-emerald-800/40 text-emerald-300"
                              : ev.type === "Examen"
                              ? activeLight
                                ? "bg-purple-50 border-purple-200 text-purple-700"
                                : "bg-purple-950/70 border-purple-800/40 text-purple-300"
                              : activeLight
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-blue-950/70 border-blue-800/40 text-blue-300"
                          }`}
                        >
                          {ev.type}
                        </span>
                      </div>

                      {/* Grade (3 cols - centrado con espacio generoso y sin recortes) */}
                      <div className="col-span-3 flex items-center justify-center gap-0.5 whitespace-nowrap">
                        <span className={`font-mono font-bold text-sm ${activeLight ? "text-sky-600" : "text-[#38bdf8]"}`}>
                          {ev.grade}
                        </span>
                        <span className={`font-mono text-xs font-medium ${activeLight ? "text-slate-400" : "text-slate-500"}`}>
                          /{ev.maxGrade}
                        </span>
                      </div>

                      {/* Weight (2 cols) */}
                      <div className={`col-span-2 text-center text-xs font-semibold ${activeLight ? "text-slate-600" : "text-slate-300"}`}>
                        {ev.weight}%
                      </div>

                      {/* Delete action (1 col, aligned right with modern Trash2 button) */}
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteEvaluation(ev.id, ev.backendId)}
                          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                            activeLight
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 shadow-2xs"
                              : "text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50"
                          }`}
                          title="Eliminar esta nota"
                        >
                          <Trash2 className="w-4 h-4 transition-transform hover:scale-110" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Promedio del corte footer row */}
          <div className={`px-6 py-4 border-t flex items-center justify-between ${activeLight ? "bg-purple-50/60 border-purple-100" : "bg-[#090b14] border-[#171c2f]"}`}>
            <span className={`text-xs sm:text-sm font-bold ${activeLight ? "text-slate-900" : "text-white"}`}>
              Promedio del corte
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[#fbbf24]">
              {corteAvg !== null ? corteAvg.toFixed(2) : "—"}
            </span>
          </div>
        </div>

        {/* Button to open Add Evaluation Form (Ahora dice Agregar nota) */}
        {!showAddEvalForm && (
          <button
            type="button"
            onClick={() => setShowAddEvalForm(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-purple-900/15 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white shrink-0" />
            <span className="text-white">Agregar nota a {activeCorte.name}</span>
          </button>
        )}

        {/* Nueva evaluación Form (Image 3) */}
        {showAddEvalForm && (
          <div className={`rounded-2xl border p-6 space-y-5 animate-in slide-in-from-top-3 duration-200 ${activeLight ? "bg-white border-slate-200/90 shadow-xl" : "bg-[#0c0e18] border-[#171c2f]"}`}>
            <h3 className={`font-bold text-sm ${activeLight ? "text-slate-900" : "text-white"}`}>
              Nueva nota — {activeCorte.name}
            </h3>

            <form onSubmit={handleCreateEvaluation} className="space-y-4 text-xs">
              {/* Field: Nombre */}
              <div className="space-y-1.5">
                <label className={`block font-medium ${activeLight ? "text-slate-700" : "text-slate-400"}`}>
Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Parcial del corte"
                  value={evalName}
                  onChange={(e) => setEvalName(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-xs transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-400" : "bg-[#080912] border border-[#1e2338] text-white placeholder:text-slate-500 focus:border-indigo-500"}`}
                />
              </div>

              {/* Grid: Tipo & Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className={`block font-semibold ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
                    Tipo de nota
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EVAL_TYPES.map((t) => {
                      const isSelected = evalType === t.id;
                      const IconComp = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setEvalType(t.id)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer select-none ${
                            isSelected
                              ? activeLight
                                ? "bg-purple-100 text-purple-900 border-purple-400 shadow-xs ring-1 ring-purple-300 font-bold"
                                : "bg-purple-900/60 text-purple-200 border-purple-500 shadow-md ring-1 ring-purple-500/50 font-bold"
                              : activeLight
                              ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              : "bg-[#080912] border-[#1e2338] text-slate-400 hover:bg-[#12162a] hover:text-white"
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5 shrink-0" />
                          <span>{t.label}</span>
                          {isSelected && (
                            <Check className="w-3 h-3 ml-0.5 text-purple-600" strokeWidth={2.5} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`block font-medium ${activeLight ? "text-slate-700" : "text-slate-400"}`}>
Fecha</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={evalDate}
                      onChange={(e) => setEvalDate(e.target.value)}
                      className={`w-full rounded-xl px-4 py-2.5 text-xs transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-purple-400" : "bg-[#080912] border border-[#1e2338] text-white focus:border-indigo-500"}`}
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Grid: Calificación & Calificación máx */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`block font-medium ${activeLight ? "text-slate-700" : "text-slate-400"}`}>

                    Calificación
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={globalScale}
                    required
                    value={evalGrade}
                    onChange={(e) => setEvalGrade(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-purple-400" : "bg-[#080912] border border-[#1e2338] text-white focus:border-indigo-500"}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`block font-medium ${activeLight ? "text-slate-700" : "text-slate-400"}`}>

                    Calificación máx.
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={evalMaxGrade}
                    onChange={(e) => setEvalMaxGrade(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-purple-400" : "bg-[#080912] border border-[#1e2338] text-white focus:border-indigo-500"}`}
                  />
                </div>
              </div>

              {/* Field: Peso en el corte (%) */}
              <div className="space-y-1.5">
                <label className={`block font-medium ${activeLight ? "text-slate-700" : "text-slate-400"}`}>

                  Peso en el corte (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={evalWeight}
                  onChange={(e) => setEvalWeight(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-xs transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-purple-400" : "bg-[#080912] border border-[#1e2338] text-white focus:border-indigo-500"}`}
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSavingEval}
                  className="py-3 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-purple-900/15 transition active:scale-95 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingEval && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar nota</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEvalForm(false)}
                  className={`py-3 px-4 text-xs font-medium transition cursor-pointer ${activeLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"}`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 1: Overview Screen (Image 1)
  // ==========================================
  // Cálculo dinámico de métricas KPI
  const allComputed = subjects.map((s) => ({
    name: s.name,
    grade: parseFloat(calculateFinalGrade(s)),
    credits: s.credits || 3,
  }));
  const validSubjects = allComputed.filter((it) => !isNaN(it.grade) && it.grade > 0);
  const totalCredits = validSubjects.reduce((acc, it) => acc + it.credits, 0);
  const promedioGlobal =
    totalCredits > 0
      ? (validSubjects.reduce((acc, it) => acc + it.grade * it.credits, 0) / totalCredits).toFixed(2)
      : "0.00";
  const mejorMateria =
    validSubjects.length > 0
      ? [...validSubjects].sort((a, b) => b.grade - a.grade)[0]
      : { name: "Sin datos", grade: 0 };
  const aReforzar =
    validSubjects.length > 0
      ? [...validSubjects].sort((a, b) => a.grade - b.grade)[0]
      : { name: "Sin datos", grade: 0 };

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Header con Título & Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
            Asignaturas & Notas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Registro por cortes académicos y proyecciones de aprobación — semestre actual.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector Global de Escala: 0 a 5 o 0 a 10 */}
          <div className={`flex items-center p-1 rounded-xl border text-xs ${
            activeLight ? "bg-slate-100 border-slate-200" : "bg-[#101322] border-[#1e2338]"
          }`}>
            <span className={`text-[11px] font-semibold px-2 hidden sm:inline ${
              activeLight ? "text-slate-500" : "text-slate-400"
            }`}>
              Escala:
            </span>
            <button
              type="button"
              onClick={() => handleSwitchGlobalScale(5.0)}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                globalScale === 5.0
                  ? activeLight
                    ? "bg-white text-purple-700 shadow-xs border border-purple-200"
                    : "bg-purple-600 text-white shadow-xs"
                  : activeLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              0 a 5.0
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGlobalScale(10.0)}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                globalScale === 10.0
                  ? activeLight
                    ? "bg-white text-purple-700 shadow-xs border border-purple-200"
                    : "bg-purple-600 text-white shadow-xs"
                  : activeLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              0 a 10.0
            </button>
          </div>

          {isAuthenticated && (
            <button
              onClick={loadSubjectsFromBackend}
              disabled={isLoadingSubjects}
              className={`px-3 py-2.5 rounded-xl border transition text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer ${activeLight ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-[#101322] border-[#1e2338] text-slate-300 hover:text-white"}`}
              title="Sincronizar materias con base de datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubjects ? "animate-spin text-[#7c5dfa]" : ""}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          )}

          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-purple-900/15 transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva asignatura</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Cards Dinámicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Promedio Global */}
        <div className={`p-6 rounded-2xl border space-y-2 transition-all ${activeLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0c0e18] border-[#1a1f33]"}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${activeLight ? "text-purple-600" : "text-[#818cf8]"}`}>
            PROMEDIO GLOBAL
          </span>
          <div className={`text-4xl font-extrabold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
            {promedioGlobal}
          </div>
          <span className="text-xs text-slate-400 block">{subjects.length} materias inscritas</span>
        </div>

        {/* Card 2: Mejor Materia */}
        <div className={`p-6 rounded-2xl border space-y-2 transition-all ${activeLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0c0e18] border-[#11322d]"}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
            MEJOR MATERIA
          </span>
          <div className={`text-4xl font-extrabold tracking-tight truncate ${activeLight ? "text-slate-900" : "text-white"}`}>
            {mejorMateria.name}
          </div>
          <span className="text-xs text-slate-400 block">
            {mejorMateria.grade > 0 ? `${mejorMateria.grade.toFixed(2)} promedio` : "Pendiente"}
          </span>
        </div>

        {/* Card 3: A Reforzar */}
        <div className={`p-6 rounded-2xl border space-y-2 transition-all ${activeLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0c0e18] border-[#301625]"}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
            A REFORZAR
          </span>
          <div className={`text-4xl font-extrabold tracking-tight truncate ${activeLight ? "text-slate-900" : "text-white"}`}>
            {aReforzar.name}
          </div>
          <span className="text-xs text-slate-400 block">
            {aReforzar.grade > 0 ? `${aReforzar.grade.toFixed(2)} promedio` : "Sin materias en riesgo"}
          </span>
        </div>
      </div>

      {/* 6 Cards Grid (subjects + quick calculator) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.length === 0 && (
          <div className={`p-8 rounded-2xl border text-center flex flex-col items-center justify-center space-y-3 col-span-1 md:col-span-2 ${activeLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0c0e18] border-[#171c2f]"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${activeLight ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-purple-900/30 text-purple-300 border-purple-700/40"}`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className={`text-base font-bold ${activeLight ? "text-slate-900" : "text-white"}`}>
              No tienes asignaturas registradas
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Agrega tus materias del semestre para llevar el control de notas, cortes y calcular tu promedio ponderado automáticamente.
            </p>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir primera materia</span>
            </button>
          </div>
        )}
        {subjects.map((subj) => {
          const corte1Avg = subj.cortes[0] ? calculateCorteAverage(subj.cortes[0]) : null;
          const corte2Avg = subj.cortes[1] ? calculateCorteAverage(subj.cortes[1]) : null;
          const corte3Avg = subj.cortes[2] ? calculateCorteAverage(subj.cortes[2]) : null;
          const finalG = calculateFinalGrade(subj);

          return (
            <div
              key={subj.id}
              onClick={() => {
                setSelectedSubjectId(subj.id);
                setActiveCorteIndex(0);
              }}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-5 group ${activeLight ? "bg-white border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-md" : "bg-[#0c0e18] border-[#171c2f] hover:border-[#2b3558]"}`}
            >
              {/* Subject Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`text-base font-bold tracking-tight transition ${activeLight ? "text-slate-900 group-hover:text-purple-700" : "text-white group-hover:text-indigo-300"}`}>
                    {subj.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{subj.evaluationsText}</p>
                </div>
                <span className="text-2xl font-extrabold text-[#f43f8e]">
                  {finalG}
                </span>
              </div>

              {/* 3 Corte Pills */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`rounded-xl py-2 px-1 border transition-colors ${
                  activeLight
                    ? "bg-purple-50/60 border-purple-100/90 text-purple-950"
                    : "bg-[#080911] border-[#161a2b] text-white"
                }`}>
                  <span className={`text-[10px] font-bold block mb-0.5 ${
                    activeLight ? "text-purple-700" : "text-[#818cf8]"
                  }`}>
                    1er
                  </span>
                  <span className={`text-xs font-extrabold ${
                    activeLight ? "text-slate-900" : "text-white"
                  }`}>
                    {corte1Avg !== null ? corte1Avg.toFixed(1) : "—"}
                  </span>
                </div>
                <div className={`rounded-xl py-2 px-1 border transition-colors ${
                  activeLight
                    ? "bg-purple-50/60 border-purple-100/90 text-purple-950"
                    : "bg-[#080911] border-[#161a2b] text-white"
                }`}>
                  <span className={`text-[10px] font-bold block mb-0.5 ${
                    activeLight ? "text-purple-700" : "text-[#818cf8]"
                  }`}>
                    2do
                  </span>
                  <span className={`text-xs font-extrabold ${
                    activeLight ? "text-slate-900" : "text-white"
                  }`}>
                    {corte2Avg !== null ? corte2Avg.toFixed(1) : "—"}
                  </span>
                </div>
                <div className={`rounded-xl py-2 px-1 border transition-colors ${
                  activeLight
                    ? "bg-slate-50 border-slate-200/90 text-slate-600"
                    : "bg-[#080911] border-[#161a2b] text-slate-500"
                }`}>
                  <span className={`text-[10px] font-bold block mb-0.5 ${
                    activeLight ? "text-slate-500" : "text-slate-500"
                  }`}>
                    3er
                  </span>
                  <span className={`text-xs font-bold ${
                    activeLight
                      ? corte3Avg !== null ? "text-slate-900 font-extrabold" : "text-slate-400"
                      : "text-slate-500"
                  }`}>
                    {corte3Avg !== null ? corte3Avg.toFixed(1) : "—"}
                  </span>
                </div>
              </div>

              {/* Pink Progress Line */}
              <div className={`w-full h-1 rounded-full overflow-hidden ${activeLight ? "bg-slate-100" : "bg-[#1a1f33]"}`}>
                <div className="w-3/4 h-full bg-[#f43f8e] rounded-full"></div>
              </div>

              {/* Ver Detalle Link */}
              <div className={`flex items-center gap-1.5 text-xs font-semibold transition ${activeLight ? "text-purple-600 group-hover:text-purple-800" : "text-[#818cf8] group-hover:text-indigo-300"}`}>
                <span>Ver detalle</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}

        {/* Card 6: Calculadora Rápida */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${activeLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0c0e18] border-[#171c2f]"}`}>
          <div>
            <h4 className={`text-base font-bold tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
              Calculadora rápida
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Promedio ponderado al instante
            </p>
          </div>

          {/* Table Header */}
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-500 px-1">
              <span className="col-span-6">EVALUACIÓN</span>
              <span className="col-span-3 text-center">NOTA /{globalScale === 5.0 ? "5" : "10"}</span>
              <span className="col-span-3 text-center">PESO %</span>
            </div>

            {/* Table Rows */}
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {calcRows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCalcRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, name: val } : r))
                        );
                      }}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-400" : "bg-[#101322] border border-[#1e2338] text-white"}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="—"
                      value={row.grade}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCalcRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, grade: val } : r))
                        );
                      }}
                      className={`w-full text-center rounded-lg px-1 py-1.5 text-xs transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-400" : "bg-[#101322] border border-[#1e2338] text-white placeholder:text-slate-500"}`}
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="%"
                      value={row.weight}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCalcRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, weight: val } : r))
                        );
                      }}
                      className={`w-full text-center rounded-lg px-1 py-1.5 text-xs transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-400" : "bg-[#101322] border border-[#1e2338] text-white placeholder:text-slate-500"}`}
                    />
                    {calcRows.length > 1 && (
                      <button
                        onClick={() => removeCalcRow(row.id)}
                        className="text-slate-500 hover:text-rose-400 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculation Result Box */}
          {calcResult && (
            <div
              className={`p-3.5 rounded-xl border flex flex-col space-y-2 text-xs animate-in fade-in zoom-in-95 duration-150 ${
                calcResult.status === "neutral"
                  ? activeLight
                    ? "bg-amber-50 border-amber-200 text-amber-900 shadow-xs"
                    : "bg-amber-950/30 border-amber-800/40 text-amber-200"
                  : calcResult.status === "aprobado"
                  ? activeLight
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xs"
                    : "bg-emerald-950/40 border-emerald-700/50 text-emerald-200 shadow-lg shadow-emerald-950/30"
                  : activeLight
                  ? "bg-rose-50 border-rose-200 text-rose-900 shadow-xs"
                  : "bg-rose-950/40 border-rose-800/50 text-rose-200 shadow-lg shadow-rose-950/30"
              }`}
            >
              {calcResult.status === "neutral" ? (
                <p className="text-[11px] text-amber-300 mx-auto text-center font-medium">
                  {calcResult.message}
                </p>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Promedio Ponderado
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className={`text-2xl font-black tracking-tight ${activeLight ? "text-slate-900" : "text-white"}`}>
                        {calcResult.average}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {calcResult.average <= 5.0 ? "/ 5.0" : "/ 10.0"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          calcResult.status === "aprobado"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {calcResult.status === "aprobado" ? "Aprobado" : "Reprobado"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons: Añadir fila & Calcular */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={addCalcRow}
              className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.99] border cursor-pointer ${activeLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/90 shadow-xs" : "bg-[#1a1f33] hover:bg-[#232a45] text-slate-300 hover:text-white border-[#262f4e]"}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir fila</span>
            </button>

            <button
              type="button"
              disabled={isCalculating}
              onClick={handleCalculate}
              className="py-2.5 rounded-xl bg-gradient-to-r from-[#7c5dfa] to-[#6035db] hover:from-[#6d4be0] hover:to-[#502bb8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#7c5dfa]/25 transition active:scale-[0.99] disabled:opacity-60"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculando...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calcular promedio</span>
                </>
              )}
            </button>
          </div>

          {/* Reset link */}
          {(calcResult || calcRows.some((r) => r.grade || r.weight)) && (
            <button
              type="button"
              onClick={handleResetCalc}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition text-center block w-full hover:underline pt-0.5"
            >
              Restablecer calculadora
            </button>
          )}
        </div>
      </div>

      {/* Modal: Crear Nueva Asignatura (Sincronizado con BD) */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 border ${activeLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0c0e1a] border-[#1e233d] text-white"}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${activeLight ? "border-slate-100" : "border-[#181c30]"}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${activeLight ? "text-slate-900" : "text-white"}`}>
                <BookOpen className="w-4 h-4 text-[#7c5dfa]" />
                <span>Nueva Asignatura</span>
              </h3>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              {/* Nombre de la asignatura */}
              <div className="space-y-1.5">
                <label className={`font-semibold block ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
                  Nombre de la asignatura *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cálculo III, Física Cuántica"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-400" : "bg-[#111425] border border-[#1e233d] text-white focus:border-[#7c5dfa]"}`}
                />
              </div>

              {/* Escala de Calificación - Botones interactivos modernos */}
              <div className="space-y-1.5">
                <label className={`font-semibold block ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
                  Escala de Calificación
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { value: 5.0, label: "0 a 5.0", defaultPassing: 3.0 },
                    { value: 10.0, label: "0 a 10.0", defaultPassing: 6.0 },
                  ].map((scaleOpt) => {
                    const isSelected = newSubjectScale === scaleOpt.value;
                    return (
                      <button
                        key={scaleOpt.value}
                        type="button"
                        onClick={() => {
                          setNewSubjectScale(scaleOpt.value);
                          setNewSubjectPassing(scaleOpt.defaultPassing);
                        }}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer select-none ${
                          isSelected
                            ? activeLight
                              ? "bg-purple-100 text-purple-900 border-purple-400 shadow-xs ring-1 ring-purple-300 font-bold"
                              : "bg-purple-900/60 text-purple-200 border-purple-500 shadow-md ring-1 ring-purple-500/50 font-bold"
                            : activeLight
                            ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            : "bg-[#111425] border-[#1e233d] text-slate-400 hover:bg-[#181d33] hover:text-white"
                        }`}
                      >
                        <span>{scaleOpt.label}</span>
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 ${activeLight ? "text-purple-700" : "text-purple-300"}`} strokeWidth={2.5} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Créditos y Nota Aprobatoria */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`font-semibold block ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
                    Créditos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={newSubjectCredits}
                    onChange={(e) => setNewSubjectCredits(parseInt(e.target.value) || 3)}
                    className={`w-full rounded-xl px-3.5 py-2.5 transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-400" : "bg-[#111425] border border-[#1e233d] text-white focus:border-[#7c5dfa]"}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`font-semibold block ${activeLight ? "text-slate-700" : "text-slate-300"}`}>
                    Nota aprobatoria
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={newSubjectScale}
                    value={newSubjectPassing}
                    onChange={(e) => setNewSubjectPassing(parseFloat(e.target.value) || (newSubjectScale === 5.0 ? 3.0 : 6.0))}
                    className={`w-full rounded-xl px-3.5 py-2.5 transition focus:outline-none ${activeLight ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-400" : "bg-[#111425] border border-[#1e233d] text-white focus:border-[#7c5dfa]"}`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${activeLight ? "border-slate-100" : "border-[#181c30]"}`}>
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer ${activeLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-white"}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingSubject}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-purple-900/15 disabled:opacity-60 cursor-pointer"
                >
                  {isSavingSubject && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Crear Asignatura</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
