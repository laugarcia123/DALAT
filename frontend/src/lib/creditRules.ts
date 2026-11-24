// Reglas oficiales de tarificación de créditos y tokens en Dalat por peso de archivo (PDF / documentos)
// Tabla oficial definida:
// - Hasta 10 MB: 2 créditos (~$40 – $90 COP) | Apuntes de clase, talleres, guías cortas
// - 10 MB a 25 MB: 4 créditos (~$120 – $220 COP) | Capítulos largos, diapositivas con imágenes
// - 25 MB a 40 MB: 7 créditos (~$250 – $350 COP) | Módulos completos o guías extensas
// - Más de 40 MB: 10 créditos (~$350 – $450 COP) | Libros completos o escaneos pesados

export interface FileCreditTier {
  tierName: string;
  rangeText: string;
  minMb: number;
  maxMb: number;
  credits: number;
  typicalType: string;
  approxCop: string;
  badgeColor: string;
}

export const DALAT_FILE_CREDIT_TIERS: FileCreditTier[] = [
  {
    tierName: "Hasta 10 MB",
    rangeText: "≤ 10 MB",
    minMb: 0,
    maxMb: 10.0,
    credits: 2,
    typicalType: "Apuntes de clase, talleres, guías cortas",
    approxCop: "~$40 – $90 COP",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  {
    tierName: "10 MB a 25 MB",
    rangeText: "10 – 25 MB",
    minMb: 10.0001,
    maxMb: 25.0,
    credits: 4,
    typicalType: "Capítulos largos, diapositivas con imágenes",
    approxCop: "~$120 – $220 COP",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  {
    tierName: "25 MB a 40 MB",
    rangeText: "25 – 40 MB",
    minMb: 25.0001,
    maxMb: 40.0,
    credits: 7,
    typicalType: "Módulos completos o guías extensas",
    approxCop: "~$250 – $350 COP",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    tierName: "Más de 40 MB",
    rangeText: "> 40 MB",
    minMb: 40.0001,
    maxMb: Infinity,
    credits: 10,
    typicalType: "Libros completos o escaneos pesados",
    approxCop: "~$350 – $450 COP",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
];

/**
 * Parsea un string de tamaño como "1.2 MB", "450 KB", "15.4 MB", "1.1 GB" a número en Megabytes.
 */
export function parseFileSizeToMb(sizeStr?: string | number | null): number {
  if (sizeStr === undefined || sizeStr === null) return 1.0;
  if (typeof sizeStr === "number") return sizeStr;

  const s = String(sizeStr).toUpperCase().trim();
  if (!s || s === "ENLACE" || s === "SIN TAMAÑO") return 1.0;

  try {
    if (s.includes("MB")) {
      const val = parseFloat(s.replace("MB", "").trim());
      return isNaN(val) ? 1.0 : val;
    }
    if (s.includes("KB")) {
      const val = parseFloat(s.replace("KB", "").trim());
      return isNaN(val) ? 0.5 : val / 1024.0;
    }
    if (s.includes("GB")) {
      const val = parseFloat(s.replace("GB", "").trim());
      return isNaN(val) ? 1024.0 : val * 1024.0;
    }
    const val = parseFloat(s);
    return isNaN(val) ? 1.0 : val;
  } catch {
    return 1.0;
  }
}

/**
 * Retorna los créditos / tokens oficiales a cobrar según el peso del archivo:
 * - Hasta 10 MB: 2 créditos
 * - 10 MB a 25 MB: 4 créditos
 * - 25 MB a 40 MB: 7 créditos
 * - Más de 40 MB: 10 créditos
 */
export function getCreditsByFileSize(sizeStr?: string | number | null): number {
  const mb = parseFileSizeToMb(sizeStr);
  if (mb <= 10.0) return 2;
  if (mb <= 25.0) return 4;
  if (mb <= 40.0) return 7;
  return 10;
}

/**
 * Retorna la información completa del nivel tarifario para mostrar en UI / badges.
 */
export function getFileTierInfo(sizeStr?: string | number | null): FileCreditTier {
  const mb = parseFileSizeToMb(sizeStr);
  if (mb <= 10.0) return DALAT_FILE_CREDIT_TIERS[0];
  if (mb <= 25.0) return DALAT_FILE_CREDIT_TIERS[1];
  if (mb <= 40.0) return DALAT_FILE_CREDIT_TIERS[2];
  return DALAT_FILE_CREDIT_TIERS[3];
}
