"use client";

import React, { useState } from "react";
import { Download, FileText, Plus, Upload, Check, Copy } from "lucide-react";

interface TeamItem {
  id: string;
  initials: string;
  initialsBg: string;
  name: string;
  subject: string;
  members: string;
}

const TEAMS: TeamItem[] = [
  {
    id: "t1",
    initials: "CÁ",
    initialsBg: "bg-[#7c5dfa] text-white",
    name: "Cálculo sin drama",
    subject: "Cálculo III",
    members: "4 miembros",
  },
  {
    id: "t2",
    initials: "MI",
    initialsBg: "bg-[#10b981] text-slate-900 font-extrabold",
    name: "Microeconomía",
    subject: "Economía",
    members: "3 miembros",
  },
  {
    id: "t3",
    initials: "PR",
    initialsBg: "bg-[#f43f8e] text-white",
    name: "Proyecto final",
    subject: "Arquitectura",
    members: "2 miembros",
  },
];

interface TeamDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  author: string;
  date: string;
}

const TEAM_DOCS: TeamDoc[] = [
  {
    id: "d1",
    name: "Apuntes Cálculo III — Integrales dobles.pdf",
    size: "2.2 MB",
    type: "PDF",
    author: "Luis Martínez",
    date: "9 sep",
  },
  {
    id: "d2",
    name: "Guía parcial — Aplicaciones de integrales.docx",
    size: "439 KB",
    type: "MSWORD",
    author: "Tú",
    date: "11 sep",
  },
];

export default function RepositoryTab() {
  const [activeTabFilter, setActiveTabFilter] = useState<"equipos" | "personal">("equipos");
  const [selectedTeamId, setSelectedTeamId] = useState("t1");
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedTeam = TEAMS.find((t) => t.id === selectedTeamId) || TEAMS[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://dalat.app/invite/calculo-sin-drama-782");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-editorial font-bold tracking-tight text-white">
            Repositorio
          </h2>
          <p className="text-sm text-slate-400">
            Organiza tus archivos y estudia en equipo.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Crear nuevo equipo de estudio")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141829] border border-[#232945] text-slate-200 hover:text-white text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear equipo</span>
          </button>
          <button
            onClick={() => alert("Subir archivo al repositorio")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7c5dfa] hover:bg-[#6c4ae8] text-white text-xs font-semibold shadow-lg shadow-[#7c5dfa]/20 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir archivo</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTabFilter("equipos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTabFilter === "equipos"
              ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
              : "bg-[#0d1020] border border-[#1b2038] text-slate-400 hover:text-white"
          }`}
        >
          <span>Equipos</span>
          <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">
            3
          </span>
        </button>

        <button
          onClick={() => setActiveTabFilter("personal")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTabFilter === "personal"
              ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
              : "bg-[#0d1020] border border-[#1b2038] text-slate-400 hover:text-white"
          }`}
        >
          <span>Personal</span>
          <span className="w-4 h-4 rounded-full bg-white/10 text-slate-400 text-[10px] flex items-center justify-center font-bold">
            3
          </span>
        </button>
      </div>

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tus Equipos Sidebar */}
        <aside className="lg:col-span-4 rounded-2xl bg-[#0c0e18] border border-[#171c2f] p-4 sm:p-5 space-y-4">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block px-1">
            TUS EQUIPOS
          </span>

          <div className="space-y-2.5">
            {TEAMS.map((team) => {
              const isSelected = selectedTeamId === team.id;
              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? "bg-[#181333] border-[#3e2c77]"
                      : "bg-[#090b14] border-[#161a2b] hover:bg-[#0e1120]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${team.initialsBg}`}
                  >
                    {team.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {team.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {team.subject} &bull; {team.members}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => alert("Crear un nuevo equipo")}
            className="w-full py-2.5 rounded-xl border border-dashed border-[#232945] text-indigo-300 hover:text-white hover:bg-[#121629] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo equipo</span>
          </button>
        </aside>

        {/* Right: Team Documents Content */}
        <section className="lg:col-span-8 space-y-5">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-[#0a151b] border border-[#13373d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-white">{selectedTeam.name}</h3>
              <p className="text-xs text-slate-400">
                {selectedTeam.subject} &bull; Comparte recursos con tu grupo mediante un enlace.
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#071d1d] border border-[#114b43] text-emerald-400 text-xs font-semibold hover:bg-[#0c2a27] transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "¡Enlace copiado!" : "Copiar enlace de invitación"}</span>
            </button>
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEAM_DOCS.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-[#0c0e18] border border-[#171c2f] flex flex-col justify-between space-y-4 hover:border-[#283256] transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#131728] border border-[#20263f] flex items-center justify-center text-slate-200 shrink-0">
                    <FileText className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {doc.size} &bull; {doc.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#15192c]">
                  <span>{doc.author}</span>
                  <span>{doc.date}</span>
                </div>

                <button
                  onClick={() => alert(`Descargando ${doc.name}`)}
                  className="w-full py-2 rounded-xl bg-[#121628] hover:bg-[#1a1f38] border border-[#1e243f] text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
