"use client";

import React, { useState } from "react";

interface ScheduleItem {
  id: string;
  time: string;
  dotColor: string;
  dotBorder: string;
  cardBg: string;
  cardBorder: string;
  title: string;
  location: string;
  duration: string;
}

const DAY_SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    time: "07:30",
    dotColor: "border-[#818cf8] text-[#818cf8]",
    dotBorder: "border-[#818cf8]",
    cardBg: "bg-[#0d1022]",
    cardBorder: "border-[#1e2348]",
    title: "Cálculo III",
    location: "Aula 204",
    duration: "90 min",
  },
  {
    id: "2",
    time: "10:00",
    dotColor: "border-[#818cf8] text-[#818cf8]",
    dotBorder: "border-[#818cf8]",
    cardBg: "bg-[#0d1022]",
    cardBorder: "border-[#1e2348]",
    title: "Arquitectura de Software",
    location: "Sala Virtual",
    duration: "90 min",
  },
  {
    id: "3",
    time: "13:00",
    dotColor: "border-[#f59e0b] text-[#f59e0b]",
    dotBorder: "border-[#f59e0b]",
    cardBg: "bg-[#18150f]",
    cardBorder: "border-[#332815]",
    title: "Almuerzo + descanso",
    location: "Cafetería",
    duration: "60 min",
  },
  {
    id: "4",
    time: "16:00",
    dotColor: "border-[#10b981] text-[#10b981]",
    dotBorder: "border-[#10b981]",
    cardBg: "bg-[#09181a]",
    cardBorder: "border-[#123635]",
    title: "Revisión de apuntes",
    location: "Casa",
    duration: "60 min",
  },
];

export default function ScheduleTab() {
  const [viewMode, setViewMode] = useState<"dia" | "semana">("dia");

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-editorial font-bold tracking-tight text-white">
            Horario
          </h2>
          <p className="text-sm text-slate-400">Miércoles, 4 De Noviembre</p>
        </div>

        {/* Día / Semana Pill Switcher */}
        <div className="flex rounded-xl bg-[#141829] border border-[#212744] p-1">
          <button
            onClick={() => setViewMode("dia")}
            className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "dia"
                ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setViewMode("semana")}
            className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "semana"
                ? "bg-[#7c5dfa] text-white shadow-md shadow-[#7c5dfa]/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      {viewMode === "dia" ? (
        <div className="relative pl-0 sm:pl-2 max-w-5xl">
          <div className="space-y-6">
            {DAY_SCHEDULE.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-4 sm:gap-6 group">
                {/* Time Indicator & Dot with vertical line */}
                <div className="flex items-center gap-3 shrink-0 w-24 sm:w-28 justify-end relative">
                  <span className="font-mono text-xs sm:text-sm text-slate-400 font-medium">
                    {item.time}
                  </span>

                  {/* Circle dot on vertical timeline */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 ${item.dotBorder} bg-[#08090f] shrink-0 z-10`}
                    ></div>
                    {/* Vertical connecting line */}
                    {idx < DAY_SCHEDULE.length - 1 && (
                      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-[#1e2338]"></div>
                    )}
                  </div>
                </div>

                {/* Event Card */}
                <div
                  className={`flex-1 rounded-2xl p-5 border ${item.cardBorder} ${item.cardBg} flex items-center justify-between transition hover:border-opacity-80`}
                >
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400">{item.location}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium shrink-0">
                    {item.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Semana view */
        <div className="rounded-2xl bg-[#0c0e18] border border-[#171c2f] p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {["Lunes", "Martes", "Miércoles (Hoy)", "Jueves", "Viernes"].map((day, i) => (
              <div
                key={day}
                className={`p-4 rounded-xl border ${
                  i === 2
                    ? "bg-[#111428] border-indigo-500/40"
                    : "bg-[#090b14] border-[#181d30]"
                }`}
              >
                <div className="text-xs font-bold text-slate-200 mb-2">{day}</div>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-[#141829] text-[11px] text-white">
                    08:00 - Cálculo III
                  </div>
                  <div className="p-2 rounded-lg bg-[#141829] text-[11px] text-white">
                    10:00 - Sistemas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
