"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, RotateCw, ChevronLeft, ChevronRight, ChevronDown, FileText, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { flashcardStorage, GeneratedPdfDeck, FlashcardItem } from "@/services/flashcardStorage";

interface DailyMicroReviewProps {
  isLightMode?: boolean;
}

export default function DailyMicroReview({ isLightMode = false }: DailyMicroReviewProps) {
  const [decks, setDecks] = useState<GeneratedPdfDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [isDeckDropdownOpen, setIsDeckDropdownOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [, setMasteredCards] = useState<Set<number>>(new Set());
  const [answeredToday, setAnsweredToday] = useState(false);

  // Load generated decks on mount and listen to updates
  useEffect(() => {
    const loadDecks = () => {
      const availableDecks = flashcardStorage.getDecks();
      setDecks(availableDecks);
      if (availableDecks.length > 0 && !selectedDeckId) {
        setSelectedDeckId(availableDecks[0].id);
      }
    };

    loadDecks();

    const handleStorageUpdate = () => loadDecks();
    window.addEventListener("dalat_flashcards_updated", handleStorageUpdate);
    return () => window.removeEventListener("dalat_flashcards_updated", handleStorageUpdate);
  }, [selectedDeckId]);

  const activeDeck = decks.find((d) => d.id === selectedDeckId) || decks[0] || null;
  const cards: FlashcardItem[] = activeDeck ? activeDeck.cards : [];
  const currentCard: FlashcardItem | undefined = cards[currentCardIndex] || cards[0];

  const handleDeckChange = (newDeckId: string) => {
    setSelectedDeckId(newDeckId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleNextCard = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevCard = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleMarkMastered = (cardId: number) => {
    setMasteredCards((prev) => new Set(prev).add(cardId));
    setAnsweredToday(true);
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.7 },
      colors: ["#a855f7", "#c084fc", "#7c3aed", "#f59e0b"],
    });
    setTimeout(() => {
      handleNextCard();
    }, 400);
  };

  return (
    <div className="rounded-2xl bg-[#0c0e18] border border-white/[0.08] p-5 space-y-4 shadow-xl shadow-black/20 relative overflow-hidden flex flex-col justify-between">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-white/[0.08] flex items-center justify-center text-purple-300 shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              MICRO-REPASO DEL DÍA
            </h4>
            <span className="text-[10px] text-slate-400">Retención activa &bull; 2 min</span>
          </div>
        </div>
      </div>

      {/* PDF / Notes Selector (Custom Elegant Dropdown) */}
      <div className="space-y-1.5">
        <label className={`block text-[11px] font-medium ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
          Apunte / PDF seleccionado:
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDeckDropdownOpen(!isDeckDropdownOpen)}
            className={`w-full py-2.5 pl-3 pr-3 rounded-xl border text-xs text-left font-medium transition cursor-pointer flex items-center justify-between select-none shadow-sm ${
              isLightMode
                ? "bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-800 focus:border-purple-300"
                : "bg-[#111326] hover:bg-[#161a33] border-white/[0.08] text-slate-100 focus:border-purple-500"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className={`w-3.5 h-3.5 shrink-0 ${isLightMode ? "text-purple-600" : "text-purple-400"}`} />
              <span className="truncate">
                {activeDeck ? `${activeDeck.subject} • ${activeDeck.fileName}` : "Seleccionar apunte..."}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 ml-2 transition-transform duration-200 text-slate-400 ${isDeckDropdownOpen ? "rotate-180 text-purple-500" : ""}`} />
          </button>

          {isDeckDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsDeckDropdownOpen(false)}
              />
              <div
                role="menu"
                className={`absolute left-0 right-0 top-full mt-2 max-h-64 overflow-y-auto rounded-2xl border shadow-2xl p-1.5 z-40 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
                  isLightMode
                    ? "bg-white/95 border-slate-200/90 shadow-slate-900/15"
                    : "bg-[#0e111d]/95 border-white/[0.12] shadow-black/80"
                }`}
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  Apuntes & PDFs disponibles
                </div>
                {decks.map((deck) => {
                  const isSelected = deck.id === selectedDeckId;
                  return (
                    <button
                      key={deck.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        handleDeckChange(deck.id);
                        setIsDeckDropdownOpen(false);
                      }}
                      className={`dropdown-item w-full text-left p-2 rounded-xl flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer select-none border-0 ${
                        isSelected
                          ? isLightMode
                            ? "is-active bg-purple-100/70 text-purple-900 font-semibold"
                            : "is-active bg-purple-900/40 text-purple-200 font-semibold"
                          : isLightMode
                          ? "bg-transparent text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                          : "bg-transparent text-slate-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? isLightMode ? "bg-purple-200/80 text-purple-800" : "bg-purple-500/30 text-purple-200"
                            : isLightMode ? "bg-slate-100 text-slate-600" : "bg-white/[0.06] text-slate-400"
                        }`}>
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block font-semibold truncate">
                            {deck.fileName}
                          </span>
                          <span className={`block text-[10px] truncate ${isLightMode ? "text-purple-600" : "text-purple-300/80"}`}>
                            {deck.subject} &bull; {deck.cards?.length || 0} tarjetas
                          </span>
                        </div>
                      </div>
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
      </div>

      {/* Interactive Flashcard Card */}
      {currentCard ? (
        <div className="space-y-3 flex-1 flex flex-col justify-between">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[135px] p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none flex flex-col justify-between group relative overflow-hidden ${
              isFlipped
                ? "bg-[#0e111d] border-white/[0.14] shadow-lg shadow-black/30"
                : "bg-[#090b14] border-white/[0.08] hover:border-white/[0.16] hover:bg-[#101324]"
            }`}
          >
            {/* Card Sub-header */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/[0.06] pb-2 relative z-10">
              <span className="font-semibold text-purple-300 uppercase tracking-wider">
                {currentCard.categoria || activeDeck?.subject || "Concepto"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">
                  {currentCardIndex + 1}/{cards.length}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/[0.06] text-purple-200 border border-white/[0.08]">
                  {isFlipped ? "RESPUESTA" : "PREGUNTA"}
                </span>
              </div>
            </div>

            {/* Question / Answer Text: Calm, high readability */}
            <div className="py-2.5 text-center my-auto relative z-10">
              <p
                className={`text-xs sm:text-sm font-medium leading-relaxed transition-all ${
                  isFlipped ? "text-purple-100" : "text-white"
                }`}
              >
                {isFlipped ? currentCard.reverso : currentCard.anverso}
              </p>
            </div>

            {/* Flip hint */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 group-hover:text-purple-300 transition pt-1 relative z-10">
              <RotateCw className="w-3 h-3 transition-transform group-hover:rotate-180 duration-400" />
              <span>{isFlipped ? "Volver a la pregunta" : "Clic para voltear y ver respuesta"}</span>
            </div>
          </div>

          {/* Flashcard Actions & Navigation */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevCard}
                disabled={cards.length <= 1}
                className={`p-1.5 rounded-lg border transition disabled:opacity-30 cursor-pointer ${
                  isLightMode
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200"
                    : "bg-[#111326] hover:bg-white/[0.06] text-slate-400 hover:text-white border-white/[0.08]"
                }`}
                title="Tarjeta anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextCard}
                disabled={cards.length <= 1}
                className={`p-1.5 rounded-lg border transition disabled:opacity-30 cursor-pointer ${
                  isLightMode
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200"
                    : "bg-[#111326] hover:bg-white/[0.06] text-slate-400 hover:text-white border-white/[0.08]"
                }`}
                title="Siguiente tarjeta"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mastery self-rating button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkMastered(currentCard.id)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-semibold transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm shadow-purple-900/20"
              >
                <Check className="w-3.5 h-3.5 text-white shrink-0 fill-none" strokeWidth={2.5} style={{ fill: "none" }} />
                <span className="text-white font-semibold whitespace-nowrap">¡Me la sé!</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-24 flex items-center justify-center text-center p-3 text-slate-500 text-xs italic">
          No hay flashcards generadas para este archivo.
        </div>
      )}

      {/* Daily streak feedback footer */}
      {answeredToday && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] text-purple-200 animate-in fade-in duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>¡Micro-repaso registrado hoy! Racha activa protegida.</span>
        </div>
      )}
    </div>
  );
}
