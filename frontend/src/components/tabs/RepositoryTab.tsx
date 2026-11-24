"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  FileText,
  Plus,
  Upload,
  Check,
  Copy,
  Trash2,
  Loader2,
  ExternalLink,
  Users,
  Folder,
  X,
  Link2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lock,
  Search,
  BookOpen,
  Presentation,
  FolderArchive,
  ChevronDown,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  repositoryService,
  EquipoItem,
  DocumentoItem,
  StorageQuotaInfo,
} from "@/services/repositoryService";
import { useAuth } from "@/context/AuthContext";

const COLOR_PALETTE = [
  { label: "Índigo", value: "#7c5dfa" },
  { label: "Esmeralda", value: "#10b981" },
  { label: "Rosa", value: "#f43f8e" },
  { label: "Ámbar", value: "#f59e0b" },
  { label: "Púrpura", value: "#c084fc" },
  { label: "Cielo", value: "#38bdf8" },
];

const PRESET_INVITE_REPOSITORIES: Record<string, Omit<EquipoItem, "id_equipo">> = {
  "dalat-fisica-mecanica": {
    id_usuario: 1,
    nombre: "Física Mecánica & Dinámica",
    materia: "Física I",
    icono_iniciales: "FM",
    color: "#38bdf8",
    es_personal: false,
    codigo_invitacion: "dalat-fisica-mecanica",
    miembros_count: 5,
    documentos_count: 2,
    documentos: [
      {
        id_documento: 101,
        id_usuario: 1,
        nombre: "Guía de Laboratorio — Leyes de Newton y Fricción.pdf",
        formato: "PDF",
        tamano: "3.1 MB",
        autor_nombre: "Prof. Alberto Gómez",
        fecha_creacion: "2026-10-02",
      },
      {
        id_documento: 102,
        id_usuario: 1,
        nombre: "Ejercicios Resueltos de Trabajo y Energía.docx",
        formato: "MSWORD",
        tamano: "740 KB",
        autor_nombre: "María Fernanda",
        fecha_creacion: "2026-10-08",
      },
    ],
  },
  "dalat-quimica-organica": {
    id_usuario: 1,
    nombre: "Química Orgánica Avanzada",
    materia: "Química II",
    icono_iniciales: "QO",
    color: "#10b981",
    es_personal: false,
    codigo_invitacion: "dalat-quimica-organica",
    miembros_count: 6,
    documentos_count: 2,
    documentos: [
      {
        id_documento: 201,
        id_usuario: 1,
        nombre: "Mecanismos de Reacción SN1 y SN2.pdf",
        formato: "PDF",
        tamano: "4.5 MB",
        autor_nombre: "Dr. Roberto Silva",
        fecha_creacion: "2026-10-14",
      },
      {
        id_documento: 202,
        id_usuario: 1,
        nombre: "Resumen de Síntesis de Alcoholes y Éteres.pdf",
        formato: "PDF",
        tamano: "1.9 MB",
        autor_nombre: "Tú",
        fecha_creacion: "2026-10-20",
      },
    ],
  },
  "dalat-algoritmos": {
    id_usuario: 1,
    nombre: "Algoritmos y Estructuras de Datos",
    materia: "Sistemas",
    icono_iniciales: "AL",
    color: "#f59e0b",
    es_personal: false,
    codigo_invitacion: "dalat-algoritmos",
    miembros_count: 4,
    documentos_count: 2,
    documentos: [
      {
        id_documento: 301,
        id_usuario: 1,
        nombre: "CheatSheet — Grafos, Árboles AVL y Dijkstra.pdf",
        formato: "PDF",
        tamano: "1.6 MB",
        autor_nombre: "Tú",
        fecha_creacion: "2026-10-25",
      },
      {
        id_documento: 302,
        id_usuario: 1,
        nombre: "Repositorio GitHub — Ejercicios en Python.docx",
        formato: "LINK",
        tamano: "Enlace",
        url_recurso: "https://github.com",
        autor_nombre: "Santiago Vera",
        fecha_creacion: "2026-10-29",
      },
    ],
  },
};

const INITIAL_FALLBACK_EQUIPOS: EquipoItem[] = [];

interface RepositoryTabProps {
  isLightMode?: boolean;
  isPro?: boolean;
  onGoToCheckout?: () => void;
}


const FORMAT_OPTIONS = [
  {
    value: "PDF",
    label: "Documento PDF (.pdf)",
    colorDot: "bg-purple-500",
    icon: FileText,
  },
  {
    value: "MSWORD",
    label: "Documento Word (.docx, .doc)",
    colorDot: "bg-emerald-500",
    icon: FileText,
  },
  {
    value: "PPT",
    label: "Diapositivas PowerPoint (.pptx, .ppt)",
    colorDot: "bg-amber-500",
    icon: Presentation,
  },
  {
    value: "ZIP",
    label: "Archivo ZIP / Código (.zip, .rar)",
    colorDot: "bg-sky-500",
    icon: FolderArchive,
  },
  {
    value: "LINK",
    label: "Enlace Drive / Web (URL)",
    colorDot: "bg-rose-500",
    icon: Link2,
  },
];

export default function RepositoryTab({
  isLightMode = false,
  isPro = false,
  onGoToCheckout,
}: RepositoryTabProps) {
  const { isAuthenticated, user: authUser } = useAuth();

  // Sincronización reactiva del tema claro
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
      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ["class"],
      });
      window.addEventListener("storage", updateTheme);
      return () => {
        observer.disconnect();
        window.removeEventListener("storage", updateTheme);
      };
    }
  }, [isLightMode]);

  const activeLight = Boolean(isLightMode || domIsLight);

  const [activeTabFilter, setActiveTabFilter] = useState<"equipos" | "personal">("equipos");
  const [equipos, setEquipos] = useState<EquipoItem[]>(INITIAL_FALLBACK_EQUIPOS);
  const [viewingEquipoId, setViewingEquipoId] = useState<number | null>(null);
  const [copiedEquipoId, setCopiedEquipoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Input de código de invitación
  const [inviteInputCode, setInviteInputCode] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modales
  const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State Equipo
  const [equipoNombre, setEquipoNombre] = useState("");
  const [equipoMateria, setEquipoMateria] = useState("General");
  const [equipoColor, setEquipoColor] = useState("#7c5dfa");
  const [equipoEsPersonal, setEquipoEsPersonal] = useState(false);

  // Form State Documento
  const [docNombre, setDocNombre] = useState("");
  const [docFormato, setDocFormato] = useState("PDF");
  const [docUrl, setDocUrl] = useState("");
  const [uploadedFileObj, setUploadedFileObj] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Cargar datos reales desde el backend
  const loadRepository = useCallback(async () => {
    if (!isAuthenticated) {
      setEquipos([]);
      return;
    }
    try {
      setLoading(true);
      const data = await repositoryService.getEquipos();
      if (data && Array.isArray(data)) {
        setEquipos(data);
      } else {
        setEquipos([]);
      }
    } catch (err) {
      console.warn("No se pudo cargar el repositorio del backend:", err);
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Cuota de almacenamiento de repositorios
  const [quotaInfo, setQuotaInfo] = useState<StorageQuotaInfo | null>(null);

  const loadQuota = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const q = await repositoryService.getStorageQuota();
      setQuotaInfo(q);
    } catch (err) {
      console.warn("No se pudo cargar la cuota de almacenamiento:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    queueMicrotask(() => {
      loadRepository();
      loadQuota();
    });
  }, [loadRepository, loadQuota]);

  // Procesar unión automática si viene de un enlace de invitación /?join_repo=... o dalat_pending_invite
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pending = localStorage.getItem("dalat_pending_invite");
      const urlParams = new URLSearchParams(window.location.search);
      const joinCode = urlParams.get("join_repo") || pending;
      if (joinCode) {
        try {
          localStorage.removeItem("dalat_pending_invite");
          const url = new URL(window.location.href);
          url.searchParams.delete("join_repo");
          window.history.replaceState({}, "", url.pathname + (url.search || ""));
        } catch {}
        setTimeout(() => {
          handleJoinBySlug(joinCode);
        }, 350);
      }
    }
  }, []);

  // Filtrar equipos según tab (Equipos vs Personal)
  const filteredEquipos = equipos.filter((e) =>
    activeTabFilter === "personal" ? e.es_personal : !e.es_personal
  );

  // Equipo actualmente en vista detallada de materiales
  const viewingEquipo = viewingEquipoId
    ? equipos.find((e) => e.id_equipo === viewingEquipoId) || null
    : null;

  // Documentos del equipo en vista detallada
  const currentDocs = viewingEquipo?.documentos || [];

  // ========================================================
  // COPIAR ENLACE DE INVITACIÓN
  // ========================================================
  const handleCopyLink = (equipo: EquipoItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const inviteCode = equipo.codigo_invitacion || `dalat-${equipo.id_equipo}`;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedEquipoId(equipo.id_equipo);
    setTimeout(() => setCopiedEquipoId(null), 2500);
  };

  // Helper para procesar unión por código o URL
  const handleJoinBySlug = async (raw: string) => {
    if (!raw.trim()) return;
    let slug = raw.trim();
    if (slug.includes("/invite/")) {
      slug = slug.split("/invite/").pop()?.trim() || slug;
    }
    slug = slug.replace(/[?#].*$/, "");

    // Asegurar que estamos en la pestaña de equipos compartidos
    setActiveTabFilter("equipos");

    // 1. Si está autenticado, registrar y cargar el equipo real desde el backend PostgreSQL
    if (isAuthenticated) {
      try {
        const joinedBackend = await repositoryService.unirseEquipo(slug);
        if (joinedBackend && joinedBackend.id_equipo) {
          setEquipos((prev) => {
            const idx = prev.findIndex(
              (e) =>
                e.id_equipo === joinedBackend.id_equipo ||
                e.codigo_invitacion?.toLowerCase() === slug.toLowerCase()
            );
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...joinedBackend };
              return copy;
            }
            return [joinedBackend, ...prev];
          });
          setInviteFeedback({
            type: "success",
            message: `¡Te has unido exitosamente al repositorio "${joinedBackend.nombre}"!`,
          });
          setInviteInputCode("");
          setViewingEquipoId(joinedBackend.id_equipo);
          setTimeout(() => setInviteFeedback(null), 4500);
          return;
        }
      } catch (err) {
        console.warn("Aviso uniendo equipo en backend:", err);
      }
    }

    // 2. Verificar si ya está en la lista actual
    const existing = equipos.find(
      (eq) =>
        eq.codigo_invitacion?.toLowerCase() === slug.toLowerCase() ||
        eq.nombre.toLowerCase() === slug.toLowerCase()
    );

    if (existing) {
      setInviteFeedback({
        type: "success",
        message: `¡Ya formas parte de "${existing.nombre}"! Abriendo materiales...`,
      });
      setInviteInputCode("");
      setViewingEquipoId(existing.id_equipo);
      setTimeout(() => setInviteFeedback(null), 4000);
      return;
    }

    // 3. Verificar catálogo de repositorios predefinidos
    const preset = PRESET_INVITE_REPOSITORIES[slug.toLowerCase()];
    if (preset) {
      const newRepo: EquipoItem = {
        ...preset,
        id_equipo: Date.now(),
      };
      setEquipos((prev) => [newRepo, ...prev]);
      setInviteFeedback({
        type: "success",
        message: `¡Te has unido exitosamente al repositorio "${newRepo.nombre}"!`,
      });
      setInviteInputCode("");
      setViewingEquipoId(newRepo.id_equipo);
      setTimeout(() => setInviteFeedback(null), 4500);
      return;
    }

    // 4. Crear repositorio dinámico a partir del código si no existe
    const cleanName = slug
      .replace(/^dalat-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const generatedRepo: EquipoItem = {
      id_equipo: Date.now(),
      id_usuario: 1,
      nombre: cleanName.length > 2 ? cleanName : `Repositorio (${slug})`,
      materia: "General",
      icono_iniciales: slug.slice(0, 2).toUpperCase(),
      color: "#7c5dfa",
      es_personal: false,
      codigo_invitacion: slug,
      miembros_count: 2,
      documentos_count: 0,
      documentos: [],
    };

    setEquipos((prev) => [generatedRepo, ...prev]);
    setInviteFeedback({
      type: "success",
      message: `¡Te has unido exitosamente a "${generatedRepo.nombre}"!`,
    });
    setInviteInputCode("");
    setViewingEquipoId(generatedRepo.id_equipo);
    setTimeout(() => setInviteFeedback(null), 4500);
  };

  // ========================================================
  // UNIRSE MEDIANTE CÓDIGO DE INVITACIÓN
  // ========================================================
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoinBySlug(inviteInputCode);
  };

  // ========================================================
  // CREAR EQUIPO
  // ========================================================
  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoNombre.trim()) return;

    setSubmitting(true);
    const words = equipoNombre.trim().split(" ");
    const iniciales =
      words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : equipoNombre.trim().slice(0, 2).toUpperCase();

    const tempEquipo: EquipoItem = {
      id_equipo: Date.now(),
      id_usuario: 1,
      nombre: equipoNombre.trim(),
      materia: equipoMateria.trim() || "General",
      icono_iniciales: iniciales,
      color: equipoColor,
      es_personal: equipoEsPersonal,
      codigo_invitacion: `dalat-${Date.now().toString(36)}`,
      miembros_count: 1,
      documentos_count: 0,
      documentos: [],
    };

    if (isAuthenticated) {
      try {
        const created = await repositoryService.createEquipo({
          nombre: tempEquipo.nombre,
          materia: tempEquipo.materia,
          icono_iniciales: tempEquipo.icono_iniciales,
          color: tempEquipo.color,
          es_personal: tempEquipo.es_personal,
          miembros_count: tempEquipo.miembros_count,
        });
        setEquipos((prev) => [...prev, created]);
        setViewingEquipoId(created.id_equipo);
      } catch (err) {
        console.error("Error al crear equipo en backend:", err);
        setEquipos((prev) => [...prev, tempEquipo]);
        setViewingEquipoId(tempEquipo.id_equipo);
      }
    } else {
      setEquipos((prev) => [...prev, tempEquipo]);
      setViewingEquipoId(tempEquipo.id_equipo);
    }

    setSubmitting(false);
    setIsEquipoModalOpen(false);
    setEquipoNombre("");
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  // ========================================================
  // ELIMINAR EQUIPO
  // ========================================================
  const handleDeleteEquipo = async (id_equipo: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("¿Estás seguro de eliminar este repositorio y todos sus materiales?")) return;

    setEquipos((prev) => prev.filter((eq) => eq.id_equipo !== id_equipo));
    if (viewingEquipoId === id_equipo) {
      setViewingEquipoId(null);
    }

    if (isAuthenticated) {
      try {
        await repositoryService.deleteEquipo(id_equipo);
      } catch (err) {
        console.error("Error al eliminar equipo en backend:", err);
      }
    }
  };

  // ========================================================
  // CREAR DOCUMENTO
  // ========================================================
  const handleCreateDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetRepo = viewingEquipo || filteredEquipos[0] || equipos[0];
    if (!docNombre.trim() || !targetRepo) return;

    setSubmitting(true);
    const isLink = docFormato === "LINK" || Boolean(docUrl.trim()) || docNombre.trim().startsWith("http");
    let resolvedFormato = isLink ? "LINK" : docFormato;

    // Autodetección resiliente del formato real por extensión
    if (!isLink) {
      const checkName = (uploadedFileObj?.name || docNombre).toLowerCase();
      if (checkName.endsWith(".docx") || checkName.endsWith(".doc")) {
        resolvedFormato = "MSWORD";
      } else if (checkName.endsWith(".pptx") || checkName.endsWith(".ppt")) {
        resolvedFormato = "PPT";
      } else if (checkName.endsWith(".pdf")) {
        resolvedFormato = "PDF";
      } else if (checkName.endsWith(".zip") || checkName.endsWith(".rar") || checkName.endsWith(".7z") || checkName.endsWith(".tar") || checkName.endsWith(".gz")) {
        resolvedFormato = "ZIP";
      } else if (checkName.endsWith(".txt") || checkName.endsWith(".md")) {
        resolvedFormato = "TXT";
      }
    }

    let finalTamano = "1.0 MB";
    let sizeMb = 1.0;
    if (isLink) {
      finalTamano = "Enlace";
      sizeMb = 0.01;
    } else if (uploadedFileObj) {
      sizeMb = uploadedFileObj.size / (1024 * 1024);
      finalTamano =
        uploadedFileObj.size >= 1024 * 1024
          ? `${(uploadedFileObj.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(uploadedFileObj.size / 1024))} KB`;
    }

    if (quotaInfo && quotaInfo.usado_mb + sizeMb > quotaInfo.limite_mb) {
      alert(
        `Límite de almacenamiento alcanzado (${quotaInfo.limite_texto}). ${
          isPro
            ? "Por favor elimina documentos antiguos para liberar espacio."
            : "Mejora a Plan PRO para obtener 2 GB de almacenamiento."
        }`
      );
      setSubmitting(false);
      return;
    }

    const localId = (targetRepo.documentos?.length || 0) + 101;
    const today = new Date().toISOString().slice(0, 10);
    const tempDoc: DocumentoItem = {
      id_documento: localId,
      id_usuario: 1,
      id_equipo: targetRepo.id_equipo,
      nombre: docNombre.trim(),
      formato: resolvedFormato,
      tamano: finalTamano,
      url_recurso: isLink ? docUrl.trim() || undefined : undefined,
      autor_nombre: authUser?.name || "Tú",
      fecha_creacion: today,
    };

    if (isAuthenticated) {
      try {
        let created: DocumentoItem;
        if (!isLink && uploadedFileObj) {
          // Subida real a Cloudflare R2 a través del backend
          const formData = new FormData();
          formData.append("file", uploadedFileObj);
          if (targetRepo.id_equipo) {
            formData.append("id_equipo", String(targetRepo.id_equipo));
          }
          formData.append("formato", resolvedFormato);
          created = await repositoryService.uploadDocumentoFile(formData);
        } else {
          created = await repositoryService.createDocumento({
            id_equipo: targetRepo.id_equipo,
            nombre: tempDoc.nombre,
            formato: tempDoc.formato,
            tamano: tempDoc.tamano,
            url_recurso: tempDoc.url_recurso,
            autor_nombre: tempDoc.autor_nombre,
          });
        }

        setEquipos((prev) =>
          prev.map((eq) => {
            if (eq.id_equipo === targetRepo.id_equipo) {
              const updatedDocs = [created, ...(eq.documentos || [])];
              return {
                ...eq,
                documentos: updatedDocs,
                documentos_count: updatedDocs.length,
              };
            }
            return eq;
          })
        );
        await loadQuota();
      } catch (err) {
        console.error("Error al guardar documento en backend:", err);
        setEquipos((prev) =>
          prev.map((eq) => {
            if (eq.id_equipo === targetRepo.id_equipo) {
              const updatedDocs = [tempDoc, ...(eq.documentos || [])];
              return {
                ...eq,
                documentos: updatedDocs,
                documentos_count: updatedDocs.length,
              };
            }
            return eq;
          })
        );
      }
    } else {
      setEquipos((prev) =>
        prev.map((eq) => {
          if (eq.id_equipo === targetRepo.id_equipo) {
            const updatedDocs = [tempDoc, ...(eq.documentos || [])];
            return {
              ...eq,
              documentos: updatedDocs,
              documentos_count: updatedDocs.length,
            };
          }
          return eq;
        })
      );
    }

    setSubmitting(false);
    setIsDocModalOpen(false);
    setDocNombre("");
    setDocUrl("");
    setUploadedFileObj(null);
    setDocFormato("PDF");
    confetti({ particleCount: 30, spread: 55, origin: { y: 0.7 } });
  };

  // ========================================================
  // ELIMINAR DOCUMENTO
  // ========================================================
  const handleDeleteDocumento = async (id_documento: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar este documento del repositorio?")) return;

    setEquipos((prev) =>
      prev.map((eq) => {
        if (eq.id_equipo === viewingEquipo?.id_equipo) {
          const updatedDocs = (eq.documentos || []).filter(
            (d) => d.id_documento !== id_documento
          );
          return {
            ...eq,
            documentos: updatedDocs,
            documentos_count: updatedDocs.length,
          };
        }
        return eq;
      })
    );

    if (isAuthenticated) {
      try {
        await repositoryService.deleteDocumento(id_documento);
        await loadQuota();
      } catch (err) {
        console.error("Error al eliminar documento en backend:", err);
      }
    }
  };

  // ========================================================
  // DESCARGAR O ABRIR RECURSO
  // ========================================================
  const handleOpenDoc = (doc: DocumentoItem) => {
    if (doc.url_recurso) {
      let finalUrl = doc.url_recurso.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith("/")) {
        finalUrl = `https://${finalUrl}`;
      }
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } else {
      // Si es un documento sin enlace externo, creamos una vista previa descargable
      const dummyContent = `Dalat Repositorio Académico\nDocumento: ${doc.nombre}\nAutor: ${doc.autor_nombre}\nFormato: ${doc.formato}\nTamaño: ${doc.tamano || "1.0 MB"}\nFecha: ${doc.fecha_creacion || "2026-11-22"}`;
      const blob = new Blob([dummyContent], { type: "text/plain;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = doc.nombre.endsWith(`.${doc.formato.toLowerCase()}`) ? doc.nombre : `${doc.nombre}.txt`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    }
  };

  const totalEquiposCount = equipos.filter((e) => !e.es_personal).length;
  const totalPersonalCount = equipos.filter((e) => e.es_personal).length;

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* VISTA 1: GRILLA PRINCIPAL DE CUADROS DE REPOSITORIOS     */}
      {/* ======================================================== */}
      {viewingEquipoId === null ? (
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2
                  className={`text-3xl sm:text-4xl font-editorial font-bold tracking-tight ${
                    activeLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  Repositorio
                </h2>
                {loading && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Sincronizando...</span>
                  </div>
                )}
              </div>
              <p className={`text-sm ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                Tu espacio para crear carpetas, guardar tus archivos de estudio y compartir apuntes en equipo.
              </p>
            </div>

            {/* Storage Quota Card & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
              {/* Card de Cuota de Almacenamiento */}
              <div className={`p-4 rounded-2xl border w-full sm:w-80 space-y-2.5 shrink-0 ${
                activeLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-[#0c0e18] border-[#171c2f]"
              }`}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className={`font-semibold flex items-center gap-2 min-w-0 ${activeLight ? "text-slate-700" : "text-slate-200"}`}>
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                      <FolderArchive className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">Almacenamiento</span>
                  </span>
                  <div className="flex items-baseline gap-1 text-xs shrink-0">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {quotaInfo ? quotaInfo.usado_mb : "0"} MB
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      usados de <span className="font-semibold text-slate-700 dark:text-slate-200">{quotaInfo ? quotaInfo.limite_texto : (isPro ? "2 GB" : "70 MB")}</span>
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (quotaInfo?.porcentaje_usado || 0) > 90
                        ? "bg-rose-500"
                        : (quotaInfo?.porcentaje_usado || 0) > 70
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-purple-500 to-indigo-600 shadow-sm"
                    }`}
                    style={{ width: `${Math.max(2, quotaInfo?.porcentaje_usado || 0)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                    <span>{isPro ? "Plan PRO (2 GB disponibles)" : "Plan Básico (70 MB disponibles)"}</span>
                  </span>
                  {!isPro && onGoToCheckout && (
                    <button
                      type="button"
                      onClick={onGoToCheckout}
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors inline-flex items-center gap-1 shrink-0 cursor-pointer group"
                    >
                      <span>Mejorar a 2 GB</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setEquipoEsPersonal(activeTabFilter === "personal");
                  setIsEquipoModalOpen(true);
                }}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer shrink-0 shadow-sm ${
                  activeLight
                    ? "bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white shadow-purple-500/20"
                    : "bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white shadow-purple-900/30"
                }`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{activeTabFilter === "personal" ? "Nuevo espacio" : "Crear equipo"}</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BARRA PARA INGRESAR CÓDIGO DE INVITACIÓN                 */}
          {/* ======================================================== */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              activeLight
                ? "bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white border-indigo-100 shadow-sm"
                : "bg-gradient-to-r from-[#111429] via-[#0d1020] to-[#0c0e18] border-[#22294c]"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      activeLight ? "bg-indigo-100 text-indigo-700" : "bg-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    <Link2 className="w-4 h-4" />
                  </div>
                  <h3
                    className={`text-sm font-bold tracking-tight ${
                      activeLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    ¿Tienes un código o enlace de invitación?
                  </h3>
                </div>
                <p className={`text-xs pl-9 ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                  Ingresa el código compartido por tu compañero para acceder al instante al repositorio del equipo.
                </p>
              </div>

              <form onSubmit={handleJoinByCode} className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search
                    className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      activeLight ? "text-slate-400" : "text-slate-500"
                    }`}
                  />
                  <input
                    type="text"
                    value={inviteInputCode}
                    onChange={(e) => setInviteInputCode(e.target.value)}
                    placeholder="Código (ej: dalat-calc-sin-drama)..."
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs transition focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                      activeLight
                        ? "bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-sm"
                        : "bg-[#151a30] border border-[#273059] text-white placeholder:text-slate-500"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inviteInputCode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-[#7c5dfa]/20 flex items-center gap-1.5 transition shrink-0 cursor-pointer active:scale-95"
                >
                  <span>Unirse</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Feedback mensaje al ingresar código */}
            {inviteFeedback && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in duration-200 ${
                  inviteFeedback.type === "success"
                    ? activeLight
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-emerald-950/40 border-emerald-700/50 text-emerald-300"
                    : activeLight
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-rose-950/40 border-rose-700/50 text-rose-300"
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{inviteFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTabFilter("equipos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTabFilter === "equipos"
                  ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                  : activeLight
                  ? "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
                  : "bg-[#0d1020] border border-[#1b2038] text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Equipos de Estudio</span>
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  activeTabFilter === "equipos"
                    ? "bg-white/20 text-white"
                    : activeLight
                    ? "bg-slate-100 text-slate-700"
                    : "bg-white/10 text-slate-400"
                }`}
              >
                {totalEquiposCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTabFilter("personal")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTabFilter === "personal"
                  ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                  : activeLight
                  ? "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
                  : "bg-[#0d1020] border border-[#1b2038] text-slate-400 hover:text-white"
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Apuntes Personales</span>
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  activeTabFilter === "personal"
                    ? "bg-white/20 text-white"
                    : activeLight
                    ? "bg-slate-100 text-slate-700"
                    : "bg-white/10 text-slate-400"
                }`}
              >
                {totalPersonalCount}
              </span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* CUADROS DE REPOSITORIOS (GRID VIEW)                      */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEquipos.length === 0 ? (
              <div
                className={`col-span-full rounded-2xl border p-12 text-center space-y-4 ${
                  activeLight ? "bg-white border-slate-200" : "bg-[#0c0e18] border-[#171c2f]"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                  <Folder className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className={`text-base font-bold ${activeLight ? "text-slate-900" : "text-white"}`}>
                    No tienes repositorios ni carpetas creadas
                  </h3>
                  <p className={`text-xs max-w-sm mx-auto ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                    Crea tu primer equipo de estudio o espacio personal para organizar tus archivos y apuntes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEquipoEsPersonal(activeTabFilter === "personal");
                    setIsEquipoModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear primer repositorio</span>
                </button>
              </div>
            ) : (
              filteredEquipos.map((team) => {
              const isCopied = copiedEquipoId === team.id_equipo;
              return (
                <div
                  key={team.id_equipo}
                  onClick={() => setViewingEquipoId(team.id_equipo)}
                  className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
                    activeLight
                      ? "bg-white border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-indigo-300"
                      : "bg-[#0c0e18] border-[#171c2f] hover:border-[#2f385c] hover:bg-[#0f1220]"
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: team.color || "#7c5dfa" }}
                        >
                          {team.icono_iniciales || "EQ"}
                        </div>
                        <div>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${team.color}15`,
                              color: team.color,
                              border: `1px solid ${team.color}35`,
                            }}
                          >
                            {team.materia}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteEquipo(team.id_equipo, e)}
                        title="Eliminar repositorio"
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition opacity-40 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Repo Title & Description */}
                    <div>
                      <h3
                        className={`text-base font-bold tracking-tight line-clamp-1 transition-colors ${
                          activeLight
                            ? "text-slate-900 group-hover:text-indigo-600"
                            : "text-white group-hover:text-indigo-400"
                        }`}
                      >
                        {team.nombre}
                      </h3>
                      <p
                        className={`text-xs mt-1 line-clamp-1 ${
                          activeLight ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {team.es_personal
                          ? "Notas personales privadas y resúmenes de estudio"
                          : `Equipo de estudio colaborativo para ${team.materia}`}
                      </p>
                    </div>

                    {/* Stats Badges */}
                    <div className="flex items-center gap-3 pt-1">
                      <div
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                          activeLight
                            ? "bg-slate-100 text-slate-600"
                            : "bg-[#141829] text-slate-300"
                        }`}
                      >
                        {team.es_personal ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-sky-500" />
                            <span>Privado</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            <span>
                              {team.miembros_count || 1} {(team.miembros_count || 1) === 1 ? "miembro" : "miembros"}
                            </span>
                          </>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                          activeLight
                            ? "bg-slate-100 text-slate-600"
                            : "bg-[#141829] text-slate-300"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        <span>
                          {team.documentos?.length || 0} {(team.documentos?.length || 0) === 1 ? "material" : "materiales"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div
                    className={`mt-5 pt-4 border-t flex items-center justify-between gap-2 ${
                      activeLight ? "border-slate-100" : "border-[#171c2f]"
                    }`}
                  >
                    {!team.es_personal ? (
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(team, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                          isCopied
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : activeLight
                            ? "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-[#131728] hover:bg-[#1a2037] text-slate-300 border border-[#212744]"
                        }`}
                        title="Copiar enlace de invitación"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar enlace</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sólo tú</span>
                    )}

                    <div className="flex items-center gap-1 text-xs font-semibold text-indigo-500 group-hover:translate-x-0.5 transition-transform">
                      <span>Ver materiales</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            }))}

            {/* Cuadro para Crear Nuevo Repositorio (solo si ya existen repositorios creados) */}
            {filteredEquipos.length > 0 && (
              <div
                onClick={() => {
                  setEquipoEsPersonal(activeTabFilter === "personal");
                  setIsEquipoModalOpen(true);
                }}
                className={`rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer min-h-[220px] ${
                  activeLight
                    ? "border-slate-300 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-400 text-slate-600"
                    : "border-[#202742] bg-[#0c0e18]/40 hover:bg-[#11152a] hover:border-indigo-500/50 text-slate-300"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 ${
                    activeLight
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-indigo-500/20 text-indigo-400"
                  }`}
                >
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold ${activeLight ? "text-slate-800" : "text-white"}`}
                  >
                    {activeTabFilter === "personal" ? "Nuevo espacio personal" : "Crear nuevo equipo"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                    Crea un repositorio para compartir apuntes o almacenar tus guías
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* VISTA 2: DETALLE DEL REPOSITORIO Y SUS MATERIALES        */
        /* ======================================================== */
        viewingEquipo && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Navigation & Back Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewingEquipoId(null)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer ${
                  activeLight
                    ? "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm"
                    : "bg-[#141829] hover:bg-[#1f253f] border border-[#232945] text-slate-200"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a todos los repositorios</span>
              </button>

              <div className="flex items-center gap-3">
                {quotaInfo && (
                  <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                    activeLight ? "bg-white border-slate-200 text-slate-700" : "bg-[#141829] border-[#232945] text-slate-300"
                  }`}>
                    <span className="text-[11px] text-slate-400">Cuota:</span>
                    <span className="font-mono font-bold text-purple-500">
                      {quotaInfo.usado_mb} MB / {quotaInfo.limite_texto}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir archivo / Enlace</span>
                </button>
              </div>
            </div>

            {/* Repository Banner Showcase */}
            <div
              className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
                activeLight
                  ? "bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/20 border-slate-200/90 shadow-sm"
                  : "bg-gradient-to-r from-[#0e1222] via-[#0b0e1b] to-[#0a0d18] border-[#1a213d]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shrink-0 shadow-md"
                  style={{ backgroundColor: viewingEquipo.color || "#7c5dfa" }}
                >
                  {viewingEquipo.icono_iniciales || "EQ"}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2
                      className={`text-xl sm:text-2xl font-bold tracking-tight ${
                        activeLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {viewingEquipo.nombre}
                    </h2>
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${viewingEquipo.color}15`,
                        color: viewingEquipo.color,
                        border: `1px solid ${viewingEquipo.color}35`,
                      }}
                    >
                      {viewingEquipo.materia}
                    </span>
                  </div>
                  <p className={`text-xs ${activeLight ? "text-slate-500" : "text-slate-400"}`}>
                    {viewingEquipo.es_personal
                      ? "Tus notas, resúmenes y documentos personales de estudio."
                      : `${viewingEquipo.miembros_count || 1} ${(viewingEquipo.miembros_count || 1) === 1 ? "miembro" : "miembros"} en este repositorio. Comparte recursos mediante el enlace.`}
                  </p>
                </div>
              </div>

              {/* Botón Destacado de Copiar Enlace de Invitación */}
              {!viewingEquipo.es_personal && (
                <button
                  type="button"
                  onClick={() => handleCopyLink(viewingEquipo)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer shrink-0 ${
                    copiedEquipoId === viewingEquipo.id_equipo
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : activeLight
                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                      : "bg-[#09221c] hover:bg-[#0e2e26] text-emerald-400 border border-[#14473c]"
                  }`}
                >
                  {copiedEquipoId === viewingEquipo.id_equipo ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Enlace copiado al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar enlace de invitación</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Materiales Title & Count */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <h3
                  className={`text-base font-bold ${
                    activeLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  Materiales y Apuntes ({currentDocs.length})
                </h3>
              </div>
            </div>

            {/* Document Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {currentDocs.length === 0 ? (
                <div
                  className={`sm:col-span-2 lg:col-span-3 rounded-2xl border p-12 text-center space-y-4 ${
                    activeLight
                      ? "bg-white border-slate-200 shadow-sm"
                      : "bg-[#0c0e18] border-[#171c2f]"
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3
                      className={`text-base font-bold ${
                        activeLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      No hay archivos en este repositorio aún
                    </h3>
                    <p
                      className={`text-xs max-w-sm mx-auto ${
                        activeLight ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Sube guías de estudio, resúmenes en PDF o enlaces a Notion y Google Drive para empezar a estudiar.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDocModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir primer recurso</span>
                  </button>
                </div>
              ) : (
                currentDocs.map((doc) => (
                  <div
                    key={doc.id_documento}
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-200 group hover:-translate-y-0.5 ${
                      activeLight
                        ? "bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300"
                        : "bg-[#0c0e18] border-[#171c2f] hover:border-[#283256]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            doc.formato === "LINK" || doc.formato === "NOTION"
                              ? activeLight
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                                : "bg-[#102421] border border-[#17443d] text-emerald-400"
                              : activeLight
                              ? "bg-indigo-50 border border-indigo-200 text-indigo-600"
                              : "bg-[#131728] border border-[#20263f] text-indigo-300"
                          }`}
                        >
                          {doc.formato === "LINK" || doc.formato === "NOTION" ? (
                            <Link2 className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h4
                            className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${
                              activeLight ? "text-slate-900" : "text-white"
                            }`}
                          >
                            {doc.nombre}
                          </h4>
                          <p
                            className={`text-[11px] ${
                              activeLight ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            {doc.tamano || "1.0 MB"} &bull; {doc.formato}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteDocumento(doc.id_documento, e)}
                        title="Eliminar archivo"
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition opacity-40 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div
                      className={`flex items-center justify-between text-[11px] pt-2 border-t ${
                        activeLight ? "border-slate-100 text-slate-400" : "border-[#15192c] text-slate-500"
                      }`}
                    >
                      <span className="font-medium">{doc.autor_nombre}</span>
                      <span>{doc.fecha_creacion?.slice(0, 10) || "Reciente"}</span>
                    </div>

                    {/* Botón Descargar / Abrir: ¡CLARO EN MODO CLARO, NADA DE BOTONES NEGROS! */}
                    {doc.formato === "LINK" || doc.formato === "NOTION" || doc.tamano === "Enlace" ? (
                      <button
                        onClick={() => handleOpenDoc(doc)}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer ${
                          activeLight
                            ? "bg-slate-50 hover:bg-emerald-50 border border-slate-200/90 text-emerald-600 hover:text-emerald-700 shadow-sm"
                            : "bg-[#102421] hover:bg-[#173a34] border border-[#17443d] text-emerald-400 hover:text-white"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir enlace / recurso</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenDoc(doc)}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer ${
                          activeLight
                            ? "bg-slate-50 hover:bg-indigo-50 border border-slate-200/90 text-indigo-600 hover:text-indigo-700 shadow-sm"
                            : "bg-[#13172c] hover:bg-[#1c223f] border border-[#202747] text-indigo-300 hover:text-white"
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar material</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR EQUIPO / ESPACIO                            */}
      {/* ======================================================== */}
      {isEquipoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 space-y-5 animate-in zoom-in-95 duration-150 ${
              activeLight
                ? "bg-white border-slate-200 shadow-2xl"
                : "bg-[#0c0e18] border-[#212744] shadow-2xl"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                activeLight ? "border-slate-100" : "border-[#1b2034]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h3
                  className={`font-bold text-lg ${
                    activeLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {equipoEsPersonal ? "Crear Espacio Personal" : "Crear Equipo de Estudio"}
                </h3>
              </div>
              <button
                onClick={() => setIsEquipoModalOpen(false)}
                className={`p-1.5 rounded-lg transition ${
                  activeLight
                    ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipo} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label
                  className={`font-semibold block ${
                    activeLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  Nombre del {equipoEsPersonal ? "Espacio" : "Equipo"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Grupo de Cálculo, Apuntes de Física..."
                  value={equipoNombre}
                  onChange={(e) => setEquipoNombre(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    activeLight
                      ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500"
                      : "bg-[#121526] border border-[#232948] text-white placeholder:text-slate-500 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className={`font-semibold block ${
                    activeLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  Materia / Asignatura
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cálculo III, Economía, General..."
                  value={equipoMateria}
                  onChange={(e) => setEquipoMateria(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    activeLight
                      ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500"
                      : "bg-[#121526] border border-[#232948] text-white placeholder:text-slate-500 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className={`font-semibold block ${
                    activeLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  Color distintivo
                </label>
                <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                  {COLOR_PALETTE.map((pal) => {
                    const isColorSelected = equipoColor === pal.value;
                    return (
                      <button
                        key={pal.value}
                        type="button"
                        onClick={() => setEquipoColor(pal.value)}
                        className={`color-swatch-btn relative w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center p-0 overflow-hidden shadow-xs border ${
                          activeLight ? "border-slate-300" : "border-white/20"
                        } ${
                          isColorSelected
                            ? activeLight
                              ? "ring-2 ring-indigo-600 ring-offset-2 ring-offset-white scale-110 shadow-md"
                              : "ring-2 ring-white ring-offset-2 ring-offset-[#0c0e18] scale-110 shadow-md"
                            : "hover:scale-105 opacity-85 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: pal.value }}
                        title={pal.label}
                      >
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: pal.value }}
                          aria-hidden="true"
                        />
                        {isColorSelected && (
                          <Check className="w-4 h-4 text-white drop-shadow-md relative z-10" strokeWidth={3} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={`flex items-center justify-end gap-3 pt-4 border-t ${
                  activeLight ? "border-slate-100" : "border-[#1b2034]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsEquipoModalOpen(false)}
                  className={`px-4 py-2 rounded-xl transition font-medium cursor-pointer ${
                    activeLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar repositorio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SUBIR ARCHIVO / ENLACE                            */}
      {/* ======================================================== */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 space-y-5 animate-in zoom-in-95 duration-150 ${
              activeLight
                ? "bg-white border-slate-200 shadow-2xl"
                : "bg-[#0c0e18] border-[#212744] shadow-2xl"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                activeLight ? "border-slate-100" : "border-[#1b2034]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                <h3
                  className={`font-bold text-lg ${
                    activeLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  Subir Recurso al Repositorio
                </h3>
              </div>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className={`p-1.5 rounded-lg transition ${
                  activeLight
                    ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocumento} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label
                  className={`font-semibold block ${
                    activeLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  Nombre del Documento o Apunte
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Guía de Ejercicios Parcial 2.pdf"
                  value={docNombre}
                  onChange={(e) => setDocNombre(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    activeLight
                      ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500"
                      : "bg-[#121526] border border-[#232948] text-white placeholder:text-slate-500 focus:border-indigo-500"
                  }`}
                />
              </div>

              {/* Selector de Formato con Botón Desplegable Estilo Dalat */}
              <div className="space-y-1.5 relative">
                <label
                  className={`font-semibold block ${
                    activeLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  Formato / Tipo de Recurso
                </label>

                {/* Botón trigger del dropdown */}
                <button
                  type="button"
                  onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs transition flex items-center justify-between cursor-pointer border select-none ${
                    activeLight
                      ? "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800"
                      : "bg-[#121526] hover:bg-[#181d33] border-[#232948] text-slate-200"
                  } ${showFormatDropdown ? (activeLight ? "ring-2 ring-indigo-500/20 border-indigo-500 bg-white" : "border-indigo-500 bg-[#161a30]") : ""}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        (FORMAT_OPTIONS.find((f) => f.value === docFormato) || FORMAT_OPTIONS[0]).colorDot
                      }`}
                    />
                    <span className="font-medium truncate">
                      {(FORMAT_OPTIONS.find((f) => f.value === docFormato) || FORMAT_OPTIONS[0]).label}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      showFormatDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Popover / Menú Desplegable flotante */}
                {showFormatDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowFormatDropdown(false)}
                    />
                    <div
                      role="menu"
                      className={`absolute left-0 top-full mt-1.5 w-full rounded-2xl border shadow-2xl p-1.5 z-40 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
                        activeLight
                          ? "bg-white/95 border-slate-200/90 shadow-slate-900/15"
                          : "bg-[#101322]/95 border-white/[0.12] shadow-black/80"
                      }`}
                    >
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                        Materia o formato de recurso
                      </div>
                      {FORMAT_OPTIONS.map((opt) => {
                        const isSelected = docFormato === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setDocFormato(opt.value);
                              if (opt.value === "LINK") {
                                setUploadedFileObj(null);
                              }
                              setShowFormatDropdown(false);
                            }}
                            className={`dropdown-item w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs font-medium cursor-pointer transition-colors duration-150 select-none border-0 border-transparent shadow-none ${
                              isSelected
                                ? activeLight
                                  ? "is-active bg-purple-100/70 text-purple-900 font-semibold"
                                  : "is-active bg-purple-900/40 text-purple-200 font-semibold"
                                : activeLight
                                ? "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                                : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-2.5 truncate">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${opt.colorDot}`} />
                              <span className="truncate">{opt.label}</span>
                            </span>
                            {isSelected && (
                              <Check
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  activeLight ? "text-purple-600" : "text-purple-400"
                                }`}
                                strokeWidth={2.5}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Si es ENLACE DRIVE / WEB: Mostrar campo para ingresar enlace */}
              {docFormato === "LINK" ? (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label
                    className={`font-semibold block ${
                      activeLight ? "text-slate-700" : "text-slate-300"
                    }`}
                  >
                    Enlace web o Google Drive *
                  </label>
                  <div className="relative">
                    <Link2
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        activeLight ? "text-slate-400" : "text-slate-500"
                      }`}
                    />
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/... o enlace web"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                        activeLight
                          ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500"
                          : "bg-[#121526] border border-[#232948] text-slate-200 placeholder:text-slate-500 focus:border-indigo-500"
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pega cualquier enlace público o compartido de Google Drive, Dropbox, Notion, GitHub o web.
                  </p>
                </div>
              ) : (
                /* Si es ARCHIVO (PDF, Word, PPT, ZIP): Mostrar opción para subir desde el escritorio */
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label
                    className={`font-semibold block ${
                      activeLight ? "text-slate-700" : "text-slate-300"
                    }`}
                  >
                    Archivo desde el ordenador
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={
                      docFormato === "PDF"
                        ? ".pdf"
                        : docFormato === "MSWORD"
                        ? ".docx,.doc"
                        : docFormato === "PPT"
                        ? ".pptx,.ppt"
                        : docFormato === "ZIP"
                        ? ".zip,.rar,.7z,.tar,.gz"
                        : ".pdf,.docx,.doc,.pptx,.ppt,.zip,.rar"
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFileObj(file);
                        if (!docNombre.trim()) {
                          setDocNombre(file.name);
                        }
                        // Autodetectar formato en el selector de tipo
                        const ext = file.name.split(".").pop()?.toLowerCase();
                        if (ext === "docx" || ext === "doc") {
                          setDocFormato("MSWORD");
                        } else if (ext === "pptx" || ext === "ppt") {
                          setDocFormato("PPT");
                        } else if (ext === "pdf") {
                          setDocFormato("PDF");
                        } else if (ext === "zip" || ext === "rar" || ext === "7z") {
                          setDocFormato("ZIP");
                        } else if (ext === "txt" || ext === "md") {
                          setDocFormato("TXT");
                        }
                      }
                    }}
                  />

                  {uploadedFileObj ? (
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        activeLight
                          ? "bg-indigo-50/70 border-indigo-200 text-slate-800"
                          : "bg-[#141935] border-indigo-500/40 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{uploadedFileObj.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {uploadedFileObj.size >= 1024 * 1024
                              ? `${(uploadedFileObj.size / (1024 * 1024)).toFixed(1)} MB`
                              : `${Math.max(1, Math.round(uploadedFileObj.size / 1024))} KB`}{" "}
                            &bull; Detectado automáticamente
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadedFileObj(null)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Quitar archivo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setUploadedFileObj(file);
                          if (!docNombre.trim()) {
                            setDocNombre(file.name);
                          }
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                        isDraggingFile
                          ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
                          : activeLight
                          ? "border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40"
                          : "border-[#252c4b] hover:border-indigo-500/50 bg-[#121526]/60 hover:bg-[#161a30]"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activeLight ? "bg-indigo-100 text-indigo-600" : "bg-indigo-500/20 text-indigo-400"
                        }`}
                      >
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            activeLight ? "text-slate-800" : "text-slate-200"
                          }`}
                        >
                          Haz clic para subir desde tu escritorio o arrastra el archivo aquí
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Formatos admitidos: {docFormato === "PDF" ? "PDF (.pdf)" : docFormato === "MSWORD" ? "Word (.docx, .doc)" : docFormato === "PPT" ? "PowerPoint (.pptx, .ppt)" : "ZIP / RAR"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`flex items-center justify-end gap-3 pt-4 border-t ${
                  activeLight ? "border-slate-100" : "border-[#1b2034]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className={`px-4 py-2 rounded-xl transition font-medium cursor-pointer ${
                    activeLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Subir al Repositorio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
