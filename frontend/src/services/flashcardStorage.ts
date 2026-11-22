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

export const DEFAULT_GENERATED_DECKS: GeneratedPdfDeck[] = [
  {
    id: "deck-calc3",
    fileName: "Unidad 3 — Integrales múltiples.pdf",
    subject: "Cálculo III",
    cardCount: 3,
    generatedAt: "2026-11-10T14:30:00Z",
    cards: [
      {
        id: 1,
        categoria: "Cambio de Variable",
        anverso: "¿Cuál es el significado geométrico del Jacobiano 'r' al transformar integrales a coordenadas polares (dx dy = r dr dθ)?",
        reverso: "El Jacobiano actúa como factor de escala o distorsión del diferencial de área. Al alejarse del origen (mayor radio r), el arco de círculo r·dθ es más largo, por lo que el elemento de área crece proporcionalmente a r.",
        dificultad: "Intermedio",
      },
      {
        id: 2,
        categoria: "Teoremas Fundamentales",
        anverso: "¿Bajo qué condición estricta es aplicable el Teorema de Fubini para invertir el orden de integración?",
        reverso: "La función f(x,y) debe ser continua (o acotada con un conjunto de discontinuidades de medida cero) sobre una región integrable. Garantiza que integrar primero en x y luego en y da el mismo resultado exacto.",
        dificultad: "Básico",
      },
      {
        id: 3,
        categoria: "Aplicaciones Físicas",
        anverso: "¿Cómo se calcula la masa total y el centro de masa (x̄, ȳ) de una lámina plana con densidad variable ρ(x,y)?",
        reverso: "La masa total es M = ∬_R ρ(x,y) dA. Las coordenadas del centro de masa son x̄ = (1/M) ∬_R x·ρ(x,y) dA y ȳ = (1/M) ∬_R y·ρ(x,y) dA.",
        dificultad: "Avanzado",
      },
    ],
  },
  {
    id: "deck-fisica",
    fileName: "Guía 2 — Leyes de Newton y Energía.pdf",
    subject: "Física Mecánica",
    cardCount: 3,
    generatedAt: "2026-11-08T09:15:00Z",
    cards: [
      {
        id: 101,
        categoria: "Dinámica",
        anverso: "¿Bajo qué condición fundamental se conserva la cantidad de movimiento lineal (momentum) de un sistema de partículas?",
        reverso: "La cantidad de movimiento lineal total se conserva si y solo si la sumatoria neta de todas las fuerzas externas que actúan sobre el sistema es cero (∑F_ext = 0). Las fuerzas internas se cancelan por 3ra Ley de Newton.",
        dificultad: "Intermedio",
      },
      {
        id: 102,
        categoria: "Energía",
        anverso: "¿Cuál es la diferencia conceptual entre una fuerza conservativa y una fuerza no conservativa?",
        reverso: "En una fuerza conservativa (como gravedad o resorte), el trabajo sobre una trayectoria cerrada es cero y existe una energía potencial asociada. En las no conservativas (como fricción o resistencia del aire), el trabajo disipa energía mecánica en calor.",
        dificultad: "Básico",
      },
      {
        id: 103,
        categoria: "Trabajo & Energía",
        anverso: "¿Qué establece el Teorema del Trabajo y la Energía Cinética?",
        reverso: "El trabajo neto efectuado por todas las fuerzas (conservativas y no conservativas) sobre un cuerpo rígido es exactamente igual al cambio en su energía cinética: W_neto = ΔK = (1/2)m·vf² - (1/2)m·vi².",
        dificultad: "Básico",
      },
    ],
  },
  {
    id: "deck-micro",
    fileName: "Notas de clase — Microeconomía.docx",
    subject: "Economía",
    cardCount: 2,
    generatedAt: "2026-11-05T18:00:00Z",
    cards: [
      {
        id: 201,
        categoria: "Teoría del Consumidor",
        anverso: "¿Qué representa la Tasa Marginal de Sustitución (TMS) en una curva de indiferencia convexa?",
        reverso: "Es la cantidad del bien Y que un consumidor está dispuesto a ceder para consumir una unidad adicional del bien X manteniendo constante su nivel total de utilidad: TMS = -dy/dx = UMg_x / UMg_y.",
        dificultad: "Intermedio",
      },
      {
        id: 202,
        categoria: "Estructuras de Mercado",
        anverso: "¿Por qué en competencia perfecta a largo plazo el beneficio económico de las empresas es igual a cero?",
        reverso: "Debido a la ausencia de barreras de entrada y salida: si hay beneficios positivos, nuevas firmas entran aumentando la oferta y bajando el precio hasta que P = CMg = CMe_mínimo, estabilizando el beneficio en cero.",
        dificultad: "Avanzado",
      },
    ],
  },
];

export const flashcardStorage = {
  getDecks(): GeneratedPdfDeck[] {
    if (typeof window === "undefined") return DEFAULT_GENERATED_DECKS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GENERATED_DECKS));
        return DEFAULT_GENERATED_DECKS;
      }
      const parsed: GeneratedPdfDeck[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return DEFAULT_GENERATED_DECKS;
      }
      return parsed;
    } catch {
      return DEFAULT_GENERATED_DECKS;
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
