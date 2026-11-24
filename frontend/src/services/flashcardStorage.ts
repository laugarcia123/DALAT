export interface FlashcardItem {
  id: number;
  anverso: string;
  reverso: string;
  categoria?: string;
  dificultad?: string;
}

export interface GeneratedPdfDeck {
  id: string;
  fileName: string;
  subject: string;
  cardCount: number;
  cards: FlashcardItem[];
  generatedAt: string;
}

const STORAGE_KEY = "dalat_generated_pdf_decks";

export const DEFAULT_GENERATED_DECKS: GeneratedPdfDeck[] = [];

export const flashcardStorage = {
  getDecks(): GeneratedPdfDeck[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: GeneratedPdfDeck[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      // Filtrar mazos de prueba antiguos
      const cleaned = parsed.filter(
        (d) =>
          d.id !== "deck-calc3" &&
          d.id !== "deck-fisica" &&
          d.id !== "deck-micro" &&
          !d.fileName.includes("Unidad 3") &&
          !d.fileName.includes("Leyes de Newton") &&
          !d.fileName.includes("Microeconomía")
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  },

  saveDeck(newDeck: GeneratedPdfDeck): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getDecks();
      const filtered = current.filter((d) => d.id !== newDeck.id && d.fileName !== newDeck.fileName);
      const updated = [newDeck, ...filtered];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("dalat_flashcards_updated"));
    } catch (e) {
      console.warn("No se pudo guardar el mazo de flashcards:", e);
    }
  },
};
