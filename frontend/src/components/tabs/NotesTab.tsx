"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  X,
  Calendar,
  CheckCircle2,
  Trash2,
  Calculator,
  Sparkles,
  Loader2,
  BookOpen,
  GraduationCap,
  Award,
  AlertCircle,
  RefreshCw
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

const INITIAL_SUBJECTS: SubjectItem[] = [
  {
    id: "calculo-3",
    name: "Cálculo III",
    evaluationsText: "3 cortes · 5 evaluaciones registradas",
    cortes: [
      {
        id: "c1",
        name: "1er Corte",
        weight: 30,
        evaluations: [
          {
            id: "e1",
            name: "Tarea 1 — Límites",
            date: "28 feb",
            type: "Tarea",
            grade: 9.5,
            maxGrade: 10,
            weight: 30,
          },
          {
            id: "e2",
            name: "Tarea 2 — Derivadas",
            date: "10 mar",
            type: "Tarea",
            grade: 8.8,
            maxGrade: 10,
            weight: 30,
          },
          {
            id: "e3",
            name: "Primer parcial",
            date: "15 mar",
            type: "Examen",
            grade: 8.2,
            maxGrade: 10,
            weight: 40,
          },
        ],
      },
      {
        id: "c2",
        name: "2do Corte",
        weight: 35,
        evaluations: [
          {
            id: "e4",
            name: "Taller de Integrales",
            date: "4 abr",
            type: "Tarea",
            grade: 8.5,
            maxGrade: 10,
            weight: 40,
          },
          {
            id: "e5",
            name: "Segundo parcial",
            date: "22 abr",
            type: "Examen",
            grade: 8.1,
            maxGrade: 10,
            weight: 60,
          },
        ],
      },
      {
        id: "c3",
        name: "3er Corte",
        weight: 35,
        evaluations: [],
      },
    ],
  },
  {
    id: "economia",
    name: "Economía",
    evaluationsText: "3 cortes · 3 evaluaciones",
    cortes: [
      {
        id: "ec1",
        name: "1er Corte",
        weight: 30,
        evaluations: [
          {
            id: "ee1",
            name: "Control de Lectura Cap 1-3",
            date: "5 mar",
            type: "Tarea",
            grade: 7.5,
            maxGrade: 10,
            weight: 100,
          },
        ],
      },
      {
        id: "ec2",
        name: "2do Corte",
        weight: 35,
        evaluations: [
          {
            id: "ee2",
            name: "Parcial Microeconomía",
            date: "12 abr",
            type: "Examen",
            grade: 8.3,
            maxGrade: 10,
            weight: 100,
          },
        ],
      },
      {
        id: "ec3",
        name: "3er Corte",
        weight: 35,
        evaluations: [],
      },
    ],
  },
  {
    id: "quimica",
    name: "Química Orgánica",
    evaluationsText: "3 cortes · 4 evaluaciones",
    cortes: [
      {
        id: "qc1",
        name: "1er Corte",
        weight: 30,
        evaluations: [
          {
            id: "qe1",
            name: "Práctica de Laboratorio 1",
            date: "2 mar",
            type: "Tarea",
            grade: 9.1,
            maxGrade: 10,
            weight: 100,
          },
        ],
      },
      {
        id: "qc2",
        name: "2do Corte",
        weight: 35,
        evaluations: [
          {
            id: "qe2",
            name: "Parcial Reacciones",
            date: "18 abr",
            type: "Examen",
            grade: 8.9,
            maxGrade: 10,
            weight: 100,
          },
        ],
      },
      {
        id: "qc3",
        name: "3er Corte",
        weight: 35,
        evaluations: [],
      },
    ],
  },
  {
    id: "arquitectura",
    name: "Arquitectura de Software",
    evaluationsText: "3 cortes · 3 evaluaciones",
    cortes: [
      {
        id: "ac1",
        name: "1er Corte",
        weight: 30,
        evaluations: [
          {
            id: "ae1",
            name: "Diagrama C4 y Patrones",
            date: "10 mar",
            type: "Tarea",
            grade: 8.8,
            maxGrade: 10,
            weight: 100,
          },
        ],
      },
      {
        id: "ac2",
        name: "2do Corte",
        weight: 35,
        evaluations: [
          {
            id: "ae2",
            name: "Parcial Arquitectura",
            date: "24 abr",
            type: "Examen",
            grade: 8.7,
            maxGrade: 10,
            weight: 100,
          },
        ],
      },
      {
        id: "ac3",
        name: "3er Corte",
        weight: 35,
        evaluations: [],
      },
    ],
  },
  {
    id: "historia",
    name: "Historia Universal",
    evaluationsText: "3 cortes · 3 evaluaciones",
    cortes: [
      {
        id: "hc1",
        name: "1er Corte",
        weight: 30,
        evaluations: [
          {
            id: "he1",
            name: "Ensayo Guerra Fría",
            date: "8 mar",
            type: "Tarea",
            grade: 6.9,
            maxGrade: 10,
            weight: 100,
          },
        ],
      },
      {
        id: "hc2",
        name: "2do Corte",
        weight: 35,
        evaluations: [
          {
            id: "he2",
            name: "Examen Parcial Siglo XX",
            date: "19 abr",
            type: "Examen",
            grade: 7.5,
            maxGrade: 10,
            weight: 100,
          },
        ],
      },
      {
        id: "hc3",
        name: "3er Corte",
        weight: 35,
        evaluations: [],
      },
    ],
  },
];

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

export default function NotesTab() {
  const { user, isAuthenticated } = useAuth();
  const [subjects, setSubjects] = useState<SubjectItem[]>(INITIAL_SUBJECTS);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [activeCorteIndex, setActiveCorteIndex] = useState<number>(0);
  const [showAddEvalForm, setShowAddEvalForm] = useState<boolean>(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(false);
  const [isBackendSynced, setIsBackendSynced] = useState<boolean>(false);

  // New subject modal state
  const [showAddSubjectModal, setShowAddSubjectModal] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>("");
  const [newSubjectCode, setNewSubjectCode] = useState<string>("");
  const [newSubjectProfessor, setNewSubjectProfessor] = useState<string>("");
  const [newSubjectCredits, setNewSubjectCredits] = useState<number>(3);
  const [newSubjectColor, setNewSubjectColor] = useState<string>("#7c5dfa");
  const [newSubjectScale, setNewSubjectScale] = useState<number>(10.0);
  const [newSubjectPassing, setNewSubjectPassing] = useState<number>(6.0);
  const [isSavingSubject, setIsSavingSubject] = useState<boolean>(false);
  const [isSavingEval, setIsSavingEval] = useState<boolean>(false);

  // New evaluation form state
  const [evalName, setEvalName] = useState("");
  const [evalType, setEvalType] = useState<"Tarea" | "Examen" | "Taller" | "Proyecto">("Examen");
  const [evalDate, setEvalDate] = useState("11/06/2026");
  const [evalGrade, setEvalGrade] = useState("8.5");
  const [evalMaxGrade, setEvalMaxGrade] = useState("10");
  const [evalWeight, setEvalWeight] = useState("40");

  // Carga inicial y sincronización con el backend
  const loadSubjectsFromBackend = async () => {
    if (!getStoredToken()) return;
    setIsLoadingSubjects(true);
    try {
      const list = await subjectService.getSubjects();
      if (list && list.length > 0) {
        const mapped = list.map(mapBackendSubjectToItem);
        setSubjects(mapped);
        setIsBackendSynced(true);
      }
    } catch (err) {
      console.warn("[NotesTab] Error al cargar asignaturas del backend:", err);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  useEffect(() => {
    loadSubjectsFromBackend();
  }, [user]);

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

  // Calculations helper functions
  const calculateCorteAverage = (corte: Corte): number | null => {
    if (corte.evaluations.length === 0) return null;
    let totalWeight = 0;
    let weightedSum = 0;
    corte.evaluations.forEach((ev) => {
      weightedSum += (ev.grade / ev.maxGrade) * 10 * ev.weight;
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
          codigo: newSubjectCode.trim() || undefined,
          profesor: newSubjectProfessor.trim() || undefined,
          creditos: newSubjectCredits || 3,
          color: newSubjectColor,
          escala_maxima: newSubjectScale,
          nota_aprobatoria: newSubjectPassing,
          periodo: "2026-1",
        });
        createdItem = mapBackendSubjectToItem(backendSubj);
        setIsBackendSynced(true);
      } else {
        createdItem = {
          id: `local_${Date.now()}`,
          name: newSubjectName.trim(),
          code: newSubjectCode.trim() || undefined,
          professor: newSubjectProfessor.trim() || undefined,
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
      setNewSubjectCode("");
      setNewSubjectProfessor("");
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
      // Llamar al endpoint del backend /api/asignaturas/calculadora
      const res = await subjectService.calculateQuickGrades({
        escala_maxima: 10.0,
        nota_aprobatoria: 6.0,
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
      const status = avg >= 6.0 ? "aprobado" : "reprobado";

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
        {/* Back Link */}
        <div>
          <button
            onClick={() => {
              setSelectedSubjectId(null);
              setShowAddEvalForm(false);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#818cf8] hover:text-indigo-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Todas las materias</span>
          </button>
        </div>

        {/* Subject Header Card */}
        <div className="rounded-2xl bg-[#0c0e18] border border-[#171c2f] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-tight">
                {selectedSubject.name}
              </h2>
              {selectedSubject.code && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  {selectedSubject.code}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
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
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#7c5dfa] text-white shadow-lg shadow-[#7c5dfa]/20"
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
            className="flex items-center gap-1 px-4 py-2 rounded-2xl border border-dashed border-[#47347a] hover:border-[#7c5dfa] text-[#a78bfa] hover:text-white bg-[#100e24]/60 text-xs font-semibold transition"
          >
            <span>+ Corte</span>
          </button>

          {/* - Quitar corte button */}
          {selectedSubject.cortes.length > 1 && (
            <button
              onClick={handleRemoveCorte}
              className="flex items-center gap-1 px-4 py-2 rounded-2xl border border-dashed border-[#541e2a] hover:border-rose-500 text-rose-400 hover:text-rose-300 bg-[#1e0e15]/60 text-xs font-semibold transition"
            >
              <span>- Quitar corte</span>
            </button>
          )}
        </div>

        {/* Active Corte Summary Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {activeCorte.name}
            </h3>
            <p className="text-xs text-slate-400">
              Peso en nota final:{" "}
              <strong className="text-slate-300">{activeCorte.weight}%</strong> &bull;{" "}
              {activeCorte.evaluations.length} evaluaciones
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-[#fbbf24] tracking-tight">
              {corteAvg !== null ? corteAvg.toFixed(2) : "—"}
            </div>
            <span className="text-xs text-slate-400 block">promedio corte</span>
          </div>
        </div>

        {/* Evaluations Table (Image 2) */}
        <div className="rounded-2xl bg-[#0c0e18] border border-[#171c2f] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-[#15192c] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <div className="col-span-5 sm:col-span-6">EVALUACIÓN</div>
            <div className="col-span-2 text-center">TIPO</div>
            <div className="col-span-2 text-right">CALIFICACIÓN</div>
            <div className="col-span-2 text-right">PESO</div>
            <div className="col-span-1 text-right"></div>
          </div>

          {/* Rows */}
          {activeCorte.evaluations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 italic">
              No hay evaluaciones registradas en este corte. Pulsa el botón inferior para añadir una.
            </div>
          ) : (
            <div className="divide-y divide-[#15192c]">
              {activeCorte.evaluations.map((ev) => (
                <div
                  key={ev.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#0f1324]/50 transition group"
                >
                  {/* Evaluation Name & Date */}
                  <div className="col-span-5 sm:col-span-6">
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      {ev.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {ev.date}
                    </span>
                  </div>

                  {/* Type Badge */}
                  <div className="col-span-2 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        ev.type === "Tarea"
                          ? "bg-emerald-950/70 border-emerald-800/40 text-emerald-300"
                          : ev.type === "Examen"
                          ? "bg-purple-950/70 border-purple-800/40 text-purple-300"
                          : "bg-blue-950/70 border-blue-800/40 text-blue-300"
                      }`}
                    >
                      {ev.type}
                    </span>
                  </div>

                  {/* Grade */}
                  <div className="col-span-2 text-right font-bold text-sm text-[#38bdf8]">
                    {ev.grade}/{ev.maxGrade}
                  </div>

                  {/* Weight */}
                  <div className="col-span-2 text-right text-xs font-medium text-slate-300">
                    {ev.weight}%
                  </div>

                  {/* Delete action */}
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => handleDeleteEvaluation(ev.id, ev.backendId)}
                      className="text-slate-600 hover:text-rose-400 p-1 transition"
                      title="Eliminar evaluación"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Promedio del corte footer row */}
          <div className="px-6 py-4 bg-[#090b14] border-t border-[#171c2f] flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-white">
              Promedio del corte
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[#fbbf24]">
              {corteAvg !== null ? corteAvg.toFixed(2) : "—"}
            </span>
          </div>
        </div>

        {/* Button to open Add Evaluation Form */}
        {!showAddEvalForm && (
          <button
            onClick={() => setShowAddEvalForm(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-semibold text-xs tracking-wide shadow-lg shadow-[#7c5dfa]/20 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar evaluación a {activeCorte.name}</span>
          </button>
        )}

        {/* Nueva evaluación Form (Image 3) */}
        {showAddEvalForm && (
          <div className="rounded-2xl bg-[#0c0e18] border border-[#171c2f] p-6 space-y-5 animate-in slide-in-from-top-3 duration-200">
            <h3 className="font-bold text-white text-sm">
              Nueva evaluación — {activeCorte.name}
            </h3>

            <form onSubmit={handleCreateEvaluation} className="space-y-4 text-xs">
              {/* Field: Nombre */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 font-medium">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Parcial del corte"
                  value={evalName}
                  onChange={(e) => setEvalName(e.target.value)}
                  className="w-full bg-[#080912] border border-[#1e2338] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Grid: Tipo & Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-medium">Tipo</label>
                  <select
                    value={evalType}
                    onChange={(e) => setEvalType(e.target.value as any)}
                    className="w-full bg-[#080912] border border-[#1e2338] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Examen">Examen</option>
                    <option value="Tarea">Tarea</option>
                    <option value="Taller">Taller</option>
                    <option value="Proyecto">Proyecto</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-medium">Fecha</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={evalDate}
                      onChange={(e) => setEvalDate(e.target.value)}
                      className="w-full bg-[#080912] border border-[#1e2338] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Grid: Calificación & Calificación máx */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-medium">
                    Calificación
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={evalGrade}
                    onChange={(e) => setEvalGrade(e.target.value)}
                    className="w-full bg-[#080912] border border-[#1e2338] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-medium">
                    Calificación máx.
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={evalMaxGrade}
                    onChange={(e) => setEvalMaxGrade(e.target.value)}
                    className="w-full bg-[#080912] border border-[#1e2338] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Field: Peso en el corte (%) */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 font-medium">
                  Peso en el corte (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={evalWeight}
                  onChange={(e) => setEvalWeight(e.target.value)}
                  className="w-full bg-[#080912] border border-[#1e2338] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSavingEval}
                  className="py-3 px-8 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-semibold text-xs tracking-wide shadow-md shadow-[#7c5dfa]/20 transition active:scale-95 disabled:opacity-60 flex items-center gap-2"
                >
                  {isSavingEval && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar evaluación</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEvalForm(false)}
                  className="py-3 px-4 text-xs font-medium text-slate-400 hover:text-white transition"
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
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Asignaturas & Notas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Registro por cortes académicos y proyecciones de aprobación — semestre actual.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={loadSubjectsFromBackend}
              disabled={isLoadingSubjects}
              className="px-3 py-2.5 rounded-xl bg-[#101322] border border-[#1e2338] text-slate-300 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              title="Sincronizar materias con base de datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubjects ? "animate-spin text-[#7c5dfa]" : ""}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          )}

          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#7c5dfa]/20 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva asignatura</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Cards Dinámicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Promedio Global */}
        <div className="p-6 rounded-2xl bg-[#0c0e18] border border-[#1a1f33] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#818cf8] block">
            PROMEDIO GLOBAL
          </span>
          <div className="text-4xl font-extrabold text-white tracking-tight">
            {promedioGlobal}
          </div>
          <span className="text-xs text-slate-400 block">{subjects.length} materias inscritas</span>
        </div>

        {/* Card 2: Mejor Materia */}
        <div className="p-6 rounded-2xl bg-[#0c0e18] border border-[#11322d] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
            MEJOR MATERIA
          </span>
          <div className="text-4xl font-extrabold text-white tracking-tight truncate">
            {mejorMateria.name}
          </div>
          <span className="text-xs text-slate-400 block">
            {mejorMateria.grade > 0 ? `${mejorMateria.grade.toFixed(2)} promedio` : "Pendiente"}
          </span>
        </div>

        {/* Card 3: A Reforzar */}
        <div className="p-6 rounded-2xl bg-[#0c0e18] border border-[#301625] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
            A REFORZAR
          </span>
          <div className="text-4xl font-extrabold text-white tracking-tight truncate">
            {aReforzar.name}
          </div>
          <span className="text-xs text-slate-400 block">
            {aReforzar.grade > 0 ? `${aReforzar.grade.toFixed(2)} promedio` : "Sin materias en riesgo"}
          </span>
        </div>
      </div>

      {/* 6 Cards Grid (5 subjects + 1 quick calculator) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              className="p-6 rounded-2xl bg-[#0c0e18] border border-[#171c2f] hover:border-[#2b3558] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
            >
              {/* Subject Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight group-hover:text-indigo-300 transition">
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
                <div className="rounded-xl bg-[#080911] border border-[#161a2b] py-2 px-1">
                  <span className="text-[10px] font-bold text-[#818cf8] block mb-0.5">
                    1er
                  </span>
                  <span className="text-xs font-bold text-white">
                    {corte1Avg !== null ? corte1Avg.toFixed(1) : "—"}
                  </span>
                </div>
                <div className="rounded-xl bg-[#080911] border border-[#161a2b] py-2 px-1">
                  <span className="text-[10px] font-bold text-[#818cf8] block mb-0.5">
                    2do
                  </span>
                  <span className="text-xs font-bold text-white">
                    {corte2Avg !== null ? corte2Avg.toFixed(1) : "—"}
                  </span>
                </div>
                <div className="rounded-xl bg-[#080911] border border-[#161a2b] py-2 px-1">
                  <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    3er
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {corte3Avg !== null ? corte3Avg.toFixed(1) : "—"}
                  </span>
                </div>
              </div>

              {/* Pink Progress Line */}
              <div className="w-full h-1 bg-[#1a1f33] rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-[#f43f8e] rounded-full"></div>
              </div>

              {/* Ver Detalle Link */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#818cf8] group-hover:text-indigo-300 transition">
                <span>Ver detalle</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}

        {/* Card 6: Calculadora Rápida */}
        <div className="p-6 rounded-2xl bg-[#0c0e18] border border-[#171c2f] flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">
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
              <span className="col-span-3 text-center">NOTA /10</span>
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
                      className="w-full bg-[#101322] border border-[#1e2338] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
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
                      className="w-full text-center bg-[#101322] border border-[#1e2338] rounded-lg px-1 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
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
                      className="w-full text-center bg-[#101322] border border-[#1e2338] rounded-lg px-1 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
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
                  ? "bg-amber-950/30 border-amber-800/40 text-amber-200"
                  : calcResult.status === "aprobado"
                  ? "bg-emerald-950/40 border-emerald-700/50 text-emerald-200 shadow-lg shadow-emerald-950/30"
                  : "bg-rose-950/40 border-rose-800/50 text-rose-200 shadow-lg shadow-rose-950/30"
              }`}
            >
              {calcResult.status === "neutral" ? (
                <p className="text-[11px] text-amber-300 mx-auto text-center font-medium">
                  {calcResult.message}
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Promedio Ponderado
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-black text-white tracking-tight">
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

                    <div className="text-right text-[11px] text-slate-400 font-medium space-y-0.5">
                      <div>
                        Evaluado: <span className="text-white font-bold">{calcResult.totalWeight}%</span>
                      </div>
                      {calcResult.accumulated !== undefined && (
                        <div className="text-slate-300 text-[10px]">
                          Puntos: <span className="text-white font-semibold">{calcResult.accumulated} pts</span>
                        </div>
                      )}
                      {calcResult.totalWeight < 100 && (
                        <div className="text-cyan-300 text-[10px] font-semibold">
                          Resta: {Math.round((100 - calcResult.totalWeight) * 100) / 100}%
                        </div>
                      )}
                    </div>
                  </div>

                  {calcResult.diagnostic && (
                    <div className="pt-2 border-t border-white/10 text-[11px] leading-relaxed text-slate-200">
                      <span className="text-cyan-400 font-semibold mr-1">⚡ Diagnóstico:</span>
                      {calcResult.diagnostic}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Action Buttons: Añadir fila & Calcular */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={addCalcRow}
              className="py-2.5 rounded-xl bg-[#1a1f33] hover:bg-[#232a45] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.99] border border-[#262f4e]"
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
          <div className="w-full max-w-md rounded-2xl bg-[#0c0e1a] border border-[#1e233d] p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-[#181c30] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
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

            <form onSubmit={handleCreateSubject} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Nombre de la asignatura *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cálculo III, Física Cuántica"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full bg-[#111425] border border-[#1e233d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#7c5dfa]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Código (opcional)</label>
                  <input
                    type="text"
                    placeholder="MAT-301"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    className="w-full bg-[#111425] border border-[#1e233d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#7c5dfa]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Créditos</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSubjectCredits}
                    onChange={(e) => setNewSubjectCredits(parseInt(e.target.value) || 3)}
                    className="w-full bg-[#111425] border border-[#1e233d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#7c5dfa]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Docente / Profesor (opcional)</label>
                <input
                  type="text"
                  placeholder="Dr. Fernando Martínez"
                  value={newSubjectProfessor}
                  onChange={(e) => setNewSubjectProfessor(e.target.value)}
                  className="w-full bg-[#111425] border border-[#1e233d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#7c5dfa]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Escala de Calificación</label>
                  <select
                    value={newSubjectScale}
                    onChange={(e) => {
                      const scale = parseFloat(e.target.value);
                      setNewSubjectScale(scale);
                      setNewSubjectPassing(scale === 5.0 ? 3.0 : 6.0);
                    }}
                    className="w-full bg-[#111425] border border-[#1e233d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#7c5dfa]"
                  >
                    <option value={5.0}>0 a 5.0 (Colombia / Latam)</option>
                    <option value={10.0}>0 a 10.0 (México / España)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Nota aprobatoria</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSubjectPassing}
                    onChange={(e) => setNewSubjectPassing(parseFloat(e.target.value) || 3.0)}
                    className="w-full bg-[#111425] border border-[#1e233d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#7c5dfa]"
                  />
                </div>
              </div>

              {/* Selector de color */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-400 font-medium block">Color temático</label>
                <div className="flex items-center gap-2.5">
                  {["#7c5dfa", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#ef4444"].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewSubjectColor(col)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newSubjectColor === col ? "ring-2 ring-white scale-110" : "opacity-75 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#181c30]">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingSubject}
                  className="px-5 py-2 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white font-semibold flex items-center gap-2 shadow-md disabled:opacity-60"
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
