// Utility for generating and exporting high-resolution, beautifully styled A4 PDFs for Dalat AI resources
// Supports: Exams, Flashcard Decks, and Academic Summaries / Study Guides

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ExamQuestion {
  id?: number;
  pregunta: string;
  opciones: string[];
  indice_correcto: number;
  explicacion?: string;
}

export interface Flashcard {
  id?: number;
  anverso: string;
  reverso: string;
  categoria?: string;
  dificultad?: string;
}

export interface StudyGuidePhase {
  phaseNumber: number | string;
  title: string;
  subtitle?: string;
  content: string;
}

export interface StudyGuideParams {
  title?: string;
  introText?: string;
  phases: StudyGuidePhase[];
  keyConcepts?: string[];
  markdownFallback?: string;
}

function sanitizeText(txt: string): string {
  if (!txt) return "";
  return txt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Parsea markdown estándar a HTML semántico y elegante para impresión A4,
 * eliminando caracteres crudos como #, ##, *** y listas desalineadas.
 */
function formatMarkdownToHtml(txt: string): string {
  if (!txt) return "";
  
  const lines = txt.split("\n");
  let inList = false;
  let inNumList = false;
  let result = "";

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inList) {
        result += "</ul>";
        inList = false;
      }
      if (inNumList) {
        result += "</ol>";
        inNumList = false;
      }
      continue;
    }

    // Encabezados Markdown (#, ##, ###, ####)
    if (/^#{1,2}\s+/.test(trimmed)) {
      if (inList) { result += "</ul>"; inList = false; }
      if (inNumList) { result += "</ol>"; inNumList = false; }
      const cleanH = trimmed.replace(/^#{1,2}\s+/, "");
      result += `<h3 class="guide-sec-title">${formatInlineStyles(cleanH)}</h3>`;
      continue;
    }

    if (/^#{3,4}\s+/.test(trimmed)) {
      if (inList) { result += "</ul>"; inList = false; }
      if (inNumList) { result += "</ol>"; inNumList = false; }
      const cleanH = trimmed.replace(/^#{3,4}\s+/, "");
      result += `<h4 class="guide-sub-title">${formatInlineStyles(cleanH)}</h4>`;
      continue;
    }

    // Citas o Callouts (> Texto)
    if (trimmed.startsWith(">")) {
      if (inList) { result += "</ul>"; inList = false; }
      if (inNumList) { result += "</ol>"; inNumList = false; }
      const quoteText = trimmed.replace(/^>\s*/, "");
      result += `<div class="guide-callout-box"><span class="callout-sparkle">✦</span><div class="callout-content">${formatInlineStyles(quoteText)}</div></div>`;
      continue;
    }

    // Listas con viñetas (- o *)
    if (/^[-*]\s+/.test(trimmed)) {
      if (inNumList) { result += "</ol>"; inNumList = false; }
      if (!inList) {
        result += "<ul class='page-list'>";
        inList = true;
      }
      const itemText = trimmed.replace(/^[-*]\s+/, "");
      result += `<li><span class='bullet-dot'></span><span>${formatInlineStyles(itemText)}</span></li>`;
      continue;
    }

    // Listas numeradas (1. 2. 3.)
    if (/^\d+\.\s+/.test(trimmed)) {
      if (inList) { result += "</ul>"; inList = false; }
      if (!inNumList) {
        result += "<ol class='page-num-list'>";
        inNumList = true;
      }
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      const numVal = numMatch ? numMatch[1] : "•";
      const itemText = numMatch ? numMatch[2] : trimmed;
      result += `<li><span class='num-badge'>${numVal}</span><span>${formatInlineStyles(itemText)}</span></li>`;
      continue;
    }

    // Párrafo normal
    if (inList) { result += "</ul>"; inList = false; }
    if (inNumList) { result += "</ol>"; inNumList = false; }

    result += `<p class='page-p'>${formatInlineStyles(trimmed)}</p>`;
  }

  if (inList) result += "</ul>";
  if (inNumList) result += "</ol>";

  return result;
}

function formatInlineStyles(txt: string): string {
  let s = sanitizeText(txt);
  // Negrita **texto**
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong class="highlight-strong">$1</strong>');
  // Cursiva *texto*
  s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Código inline `code`
  s = s.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  return s;
}

/**
 * Motor de renderizado de ultra-alta definición A4 (300 DPI, PNG Lossless).
 * Cada elemento .pdf-page se captura en resolución de imprenta profesional
 * asegurando tipografía nítida y márgenes perfectos.
 */
async function renderPagesToPdf(fullHtml: string, documentTitle: string): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "794px"; // 794px = Ancho exacto A4 a 96 DPI
  iframe.style.height = "auto";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      throw new Error("No se pudo inicializar el entorno de renderizado");
    }

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Esperar carga completa de tipografías web
    if (doc.fonts) {
      try {
        await doc.fonts.ready;
      } catch {}
    }

    // Breve pausa para estabilización de render y reflow del navegador
    await new Promise((resolve) => setTimeout(resolve, 350));

    const pageElements = Array.from(doc.querySelectorAll<HTMLElement>(".pdf-page"));
    if (pageElements.length === 0) {
      throw new Error("No se encontraron páginas para renderizar");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      // Escala 2.8 (~270-300 DPI de imprenta nítida) con fondo blanco puro
      const canvas = await html2canvas(pageEl, {
        scale: 2.8,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
        windowWidth: 794,
      });

      // Exportar en PNG sin pérdida para evitar artefactos de compresión JPEG en los bordes de texto
      const imgData = canvas.toDataURL("image/png");

      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }

      // 210mm x 297mm (A4 exacto)
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
    }

    const cleanFilename = documentTitle.endsWith(".pdf") ? documentTitle : `${documentTitle}.pdf`;
    pdf.save(cleanFilename);
  } finally {
    setTimeout(() => {
      try {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      } catch {}
    }, 500);
  }
}

const COMMON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    margin: 0;
    padding: 0;
    background: #f8fafc;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
  }

  .pdf-page {
    width: 794px;
    height: 1123px;
    max-height: 1123px;
    min-height: 1123px;
    padding: 34px 40px 24px 40px;
    background: #ffffff;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    position: relative;
    margin-bottom: 20px;
  }

  .page-main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* Footer con numeración clara */
  .pdf-footer {
    height: 24px;
    border-top: 1px solid #e2e8f0;
    padding-top: 7px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7.8pt;
    color: #94a3b8;
    margin-top: 8px;
    flex-shrink: 0;
  }
  .pdf-footer strong {
    color: #475569;
  }

  .inline-code {
    background: #f1f5f9;
    color: #7c3aed;
    padding: 1px 5px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 8.5pt;
  }
`;

/**
 * Exporta Examen en formato A4 profesional con preguntas en ancho completo
 * y hoja de respuestas independiente con justificación pedagógica.
 */
export async function exportExamToPDF(params: {
  tema: string;
  materia: string;
  dificultad?: string;
  preguntas: ExamQuestion[];
}): Promise<void> {
  const { tema, materia, dificultad = "Intermedio", preguntas } = params;
  const fechaStr = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cleanFilename = `Examen_${tema.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  // Distribución balanceada: 2 preguntas en Página 1 (con banner y datos de alumno), 2 preguntas en siguientes
  const questionPages: ExamQuestion[][] = [];
  if (preguntas.length > 0) {
    questionPages.push(preguntas.slice(0, 2));
    for (let i = 2; i < preguntas.length; i += 2) {
      questionPages.push(preguntas.slice(i, i + 2));
    }
  }

  const totalPages = questionPages.length + 1; // +1 para la hoja de respuestas

  let pagesHtml = "";

  questionPages.forEach((batch, pIdx) => {
    const pageNum = pIdx + 1;
    const isFirstPage = pIdx === 0;

    const questionsHtml = batch
      .map((q, qIndex) => {
        const absoluteIndex = isFirstPage ? qIndex : 2 + (pIdx - 1) * 2 + qIndex;
        const qNum = String(absoluteIndex + 1).padStart(2, "0");
        const letras = ["A", "B", "C", "D"];

        const optionsHtml = q.opciones
          .map((opt, oIdx) => {
            const letra = letras[oIdx] || String(oIdx + 1);
            return `
              <div class="opt-card">
                <span class="opt-bubble">${letra}</span>
                <span class="opt-text">${sanitizeText(opt)}</span>
              </div>
            `;
          })
          .join("");

        return `
          <div class="question-block">
            <div class="q-meta-row">
              <span class="q-badge">PREGUNTA ${qNum}</span>
              <span class="q-score">Valor: 1.0 pto</span>
            </div>
            <h4 class="q-title">${sanitizeText(q.pregunta)}</h4>
            <div class="opt-stack">
              ${optionsHtml}
            </div>
          </div>
        `;
      })
      .join("");

    pagesHtml += `
      <div class="pdf-page">
        <div class="page-main-content">
          ${
            isFirstPage
              ? `
              <div class="exam-header-banner">
                <div class="brand-left">
                  <div class="brand-badge-pill">DALAT ACADEMIC • EVALUACIÓN INTELIGENTE</div>
                  <h1 class="brand-exam-title">Simulacro de Evaluación</h1>
                  <p class="brand-exam-sub">${sanitizeText(materia)} — ${sanitizeText(tema)}</p>
                </div>
                <div class="brand-right">
                  <div class="meta-pill-diff">${sanitizeText(dificultad)}</div>
                  <div class="meta-date-text">${fechaStr}</div>
                  <div class="meta-date-text">Total: <strong>${preguntas.length} preguntas</strong></div>
                </div>
              </div>

              <div class="student-info-box">
                <div class="info-cell"><strong>Tema:</strong> ${sanitizeText(tema)}</div>
                <div class="info-cell"><strong>Estudiante:</strong> ________________________________</div>
                <div class="info-cell"><strong>Calificación:</strong> _____ / 10.0</div>
              </div>
            `
              : `
              <div class="exam-mini-header">
                <div>
                  <span class="mini-brand">Dalat • Evaluación</span>
                  <span class="mini-tema">${sanitizeText(materia)} — ${sanitizeText(tema)}</span>
                </div>
                <div class="mini-page">Hoja de Preguntas</div>
              </div>
            `
          }

          <div class="questions-container">
            ${questionsHtml}
          </div>
        </div>

        <div class="pdf-footer">
          <span>Dalat AI • Asistente de Aprendizaje Universitario</span>
          <span>Página <strong>${pageNum}</strong> de <strong>${totalPages}</strong></span>
        </div>
      </div>
    `;
  });

  // Hoja de Respuestas y Rúbrica Pedagógica
  const answerRowsHtml = preguntas
    .map((q, idx) => {
      const qNum = String(idx + 1).padStart(2, "0");
      const letras = ["A", "B", "C", "D"];
      const letraCorrecta = letras[q.indice_correcto] || "A";
      const textoCorrecto = q.opciones[q.indice_correcto] || "";

      return `
        <div class="answer-card">
          <div class="ans-left-badge">
            <span class="ans-num">P${qNum}</span>
            <span class="ans-letter">${letraCorrecta}</span>
          </div>
          <div class="ans-right-content">
            <div class="ans-text"><strong>Respuesta Correcta (${letraCorrecta}):</strong> ${sanitizeText(textoCorrecto)}</div>
            ${
              q.explicacion
                ? `<div class="ans-explanation"><span class="exp-tag">Justificación Pedagógica:</span> ${sanitizeText(q.explicacion)}</div>`
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");

  pagesHtml += `
    <div class="pdf-page">
      <div class="page-main-content">
        <div class="exam-header-banner" style="border-left-color: #10b981;">
          <div class="brand-left">
            <div class="brand-badge-pill" style="background: #ecfdf5; color: #047857; border-color: #a7f3d0;">
              HOJA OFICIAL DE RETROALIMENTACIÓN
            </div>
            <h1 class="brand-exam-title">Clave de Respuestas</h1>
            <p class="brand-exam-sub">${sanitizeText(materia)} — Justificaciones y Rúbrica</p>
          </div>
          <div class="brand-right">
            <div class="meta-pill-diff" style="background: #d1fae5; color: #065f46;">Auto-Calificación</div>
            <div class="meta-date-text">Total: <strong>${preguntas.length} ítems</strong></div>
          </div>
        </div>

        <div class="answers-container">
          ${answerRowsHtml}
        </div>
      </div>

      <div class="pdf-footer">
        <span>Dalat AI • Retroalimentación Pedagógica Activa</span>
        <span>Página <strong>${totalPages}</strong> de <strong>${totalPages}</strong></span>
      </div>
    </div>
  `;

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${cleanFilename}</title>
  <style>
    ${COMMON_CSS}

    .exam-header-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18px;
      background: #faf5ff;
      border: 1.5px solid #e9d5ff;
      border-left: 5px solid #7c3aed;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .brand-badge-pill {
      font-size: 7.5pt;
      font-weight: 800;
      color: #6b21a8;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .brand-exam-title {
      font-size: 15pt;
      font-weight: 800;
      color: #3b0764;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .brand-exam-sub {
      font-size: 8.5pt;
      color: #64748b;
      margin: 2px 0 0 0;
      font-weight: 500;
    }
    .brand-right {
      text-align: right;
    }
    .meta-pill-diff {
      display: inline-block;
      background: #ede9fe;
      color: #5b21b6;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      margin-bottom: 3px;
    }
    .meta-date-text {
      font-size: 7.5pt;
      color: #64748b;
    }

    .student-info-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 8pt;
      margin-bottom: 14px;
      color: #334155;
    }

    .exam-mini-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 14px;
    }
    .mini-brand {
      font-size: 10pt;
      font-weight: 800;
      color: #581c87;
      margin-right: 8px;
    }
    .mini-tema {
      font-size: 8.5pt;
      color: #64748b;
    }
    .mini-page {
      font-size: 8pt;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
    }

    .questions-container {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .question-block {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 13px 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }
    .q-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .q-badge {
      font-size: 7pt;
      font-weight: 800;
      color: #6b21a8;
      background: #f3e8ff;
      border: 1px solid #d8b4fe;
      padding: 2px 7px;
      border-radius: 5px;
      letter-spacing: 0.5px;
    }
    .q-score {
      font-size: 7.5pt;
      color: #94a3b8;
      font-weight: 600;
    }
    .q-title {
      font-size: 9.8pt;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.45;
      margin: 0 0 10px 0;
    }

    .opt-stack {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .opt-card {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 7px 11px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 8.5pt;
    }
    .opt-bubble {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ede9fe;
      color: #6d28d9;
      font-size: 7.5pt;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .opt-text {
      color: #1e293b;
      line-height: 1.4;
      flex: 1;
    }

    /* Answers */
    .answers-container {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .answer-card {
      display: flex;
      gap: 12px;
      padding: 9px 13px;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-left: 4px solid #10b981;
      border-radius: 10px;
    }
    .ans-left-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      padding-right: 10px;
      border-right: 1px solid #e2e8f0;
    }
    .ans-num {
      font-size: 7pt;
      font-weight: 700;
      color: #64748b;
    }
    .ans-letter {
      font-size: 13pt;
      font-weight: 800;
      color: #059669;
    }
    .ans-right-content {
      flex: 1;
      font-size: 8.5pt;
    }
    .ans-text {
      color: #0f172a;
      margin-bottom: 3px;
      line-height: 1.35;
    }
    .ans-explanation {
      color: #475569;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 5px 9px;
      border-radius: 6px;
      font-size: 8pt;
      line-height: 1.35;
    }
    .exp-tag {
      font-weight: 700;
      color: #047857;
      margin-right: 4px;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

  await renderPagesToPdf(fullHtml, cleanFilename);
}

/**
 * Exporta Tarjetas de Estudio (Flashcards) en cuadrícula simétrica 2x3 con líneas de corte,
 * tipografía legible de alto contraste y márgenes exactos.
 */
export async function exportFlashcardsToPDF(params: {
  tema: string;
  materia: string;
  dificultad?: string;
  flashcards: Flashcard[];
}): Promise<void> {
  const { tema, materia, dificultad = "Intermedio", flashcards } = params;
  const fechaStr = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cleanFilename = `Flashcards_${tema.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  const CARDS_PER_PAGE = 6;
  const pages: Flashcard[][] = [];
  for (let i = 0; i < flashcards.length; i += CARDS_PER_PAGE) {
    pages.push(flashcards.slice(i, i + CARDS_PER_PAGE));
  }
  const totalPages = pages.length;

  let pagesHtml = "";

  pages.forEach((batch, pIdx) => {
    const pageNum = pIdx + 1;
    const isFirstPage = pIdx === 0;

    const cardsHtml = batch
      .map((card, cIndex) => {
        const absoluteIndex = pIdx * CARDS_PER_PAGE + cIndex;
        const cNum = String(absoluteIndex + 1).padStart(2, "0");
        const cat = card.categoria || "Concepto Clave";

        return `
          <div class="fc-card">
            <div class="fc-top-bar">
              <span class="fc-badge">TARJETA ${cNum}</span>
              <span class="fc-cat">${sanitizeText(cat)}</span>
            </div>
            <div class="fc-front">
              <span class="fc-label">PREGUNTA / ANVERSO</span>
              <p class="fc-prompt">${sanitizeText(card.anverso)}</p>
            </div>
            <div class="fc-divider"></div>
            <div class="fc-back">
              <span class="fc-label">RESPUESTA / REVERSO</span>
              <p class="fc-answer">${sanitizeText(card.reverso)}</p>
            </div>
          </div>
        `;
      })
      .join("");

    pagesHtml += `
      <div class="pdf-page">
        <div class="page-main-content">
          ${
            isFirstPage
              ? `
              <div class="fc-header-banner">
                <div>
                  <div class="brand-badge-pill">DALAT ACTIVE RECALL • SISTEMA DE REPASO</div>
                  <h1 class="brand-exam-title">Tarjetas de Estudio (Flashcards)</h1>
                  <p class="brand-exam-sub">${sanitizeText(materia)} — ${sanitizeText(tema)}</p>
                </div>
                <div style="text-align: right;">
                  <div class="meta-pill-diff">${sanitizeText(dificultad)}</div>
                  <div class="meta-date-text">${fechaStr}</div>
                  <div class="meta-date-text">Total: <strong>${flashcards.length} tarjetas</strong></div>
                </div>
              </div>
            `
              : `
              <div class="exam-mini-header">
                <div>
                  <span class="mini-brand">Dalat • Flashcards</span>
                  <span class="mini-tema">${sanitizeText(materia)} — ${sanitizeText(tema)}</span>
                </div>
                <div class="mini-page">Hoja de Tarjetas</div>
              </div>
            `
          }

          <div class="fc-cut-guideline">
            <span>✂ Líneas guía de corte simétrico para repaso activo</span>
          </div>

          <div class="fc-grid">
            ${cardsHtml}
          </div>
        </div>

        <div class="pdf-footer">
          <span>Dalat AI • Colección imprimible para repaso activo y espaciado</span>
          <span>Página <strong>${pageNum}</strong> de <strong>${totalPages}</strong></span>
        </div>
      </div>
    `;
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${cleanFilename}</title>
  <style>
    ${COMMON_CSS}

    .fc-header-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 18px;
      background: #faf5ff;
      border: 1.5px solid #e9d5ff;
      border-left: 5px solid #7c3aed;
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .brand-badge-pill {
      font-size: 7.5pt;
      font-weight: 800;
      color: #6b21a8;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .brand-exam-title {
      font-size: 15pt;
      font-weight: 800;
      color: #3b0764;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .brand-exam-sub {
      font-size: 8.5pt;
      color: #64748b;
      margin: 2px 0 0 0;
      font-weight: 500;
    }
    .meta-pill-diff {
      display: inline-block;
      background: #ede9fe;
      color: #5b21b6;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      margin-bottom: 2px;
    }
    .meta-date-text {
      font-size: 7.5pt;
      color: #64748b;
    }

    .exam-mini-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 8px;
    }
    .mini-brand {
      font-size: 10pt;
      font-weight: 800;
      color: #581c87;
      margin-right: 8px;
    }
    .mini-tema {
      font-size: 8.5pt;
      color: #64748b;
    }
    .mini-page {
      font-size: 8pt;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
    }

    .fc-cut-guideline {
      text-align: center;
      font-size: 7.2pt;
      color: #94a3b8;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }

    .fc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(3, 1fr);
      gap: 14px 16px;
      flex: 1;
      min-height: 0;
    }

    .fc-card {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      padding: 13px 15px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      position: relative;
    }

    .fc-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .fc-badge {
      font-size: 7pt;
      font-weight: 800;
      color: #ffffff;
      background: #7c3aed;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .fc-cat {
      font-size: 7.2pt;
      font-weight: 700;
      color: #6d28d9;
      background: #f5f3ff;
      padding: 2px 7px;
      border-radius: 5px;
      border: 1px solid #ddd6fe;
    }

    .fc-front {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .fc-label {
      display: block;
      font-size: 6.5pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .fc-prompt {
      margin: 0;
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.4;
    }

    .fc-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 8px 0;
    }

    .fc-back {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .fc-answer {
      margin: 0;
      font-size: 8.8pt;
      color: #334155;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

  await renderPagesToPdf(fullHtml, cleanFilename);
}

/**
 * Exporta Guía de Estudio / Resumen Estructurado (Técnica Feynman) con paginación
 * multipágina automática y eliminación completa de caracteres markdown crudos.
 */
export async function exportStudyGuideToPDF(params: StudyGuideParams): Promise<void> {
  const { title = "Guia_de_Estudio_Dalat", introText = "", phases, keyConcepts = [], markdownFallback } = params;

  const cleanTitle = (title || "Guia_de_Estudio_Dalat")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  const cleanFilename = `Documento_${cleanTitle}`;

  const fechaStr = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const PHASE_PRINT_THEMES = [
    {
      badgeBg: "#f3e8ff",
      badgeColor: "#7e22ce",
      borderColor: "#d8b4fe",
      topBorder: "#9333ea",
      subColor: "#6b21a8",
    },
    {
      badgeBg: "#cffafe",
      badgeColor: "#0e7490",
      borderColor: "#67e8f9",
      topBorder: "#06b6d4",
      subColor: "#0891b2",
    },
    {
      badgeBg: "#d1fae5",
      badgeColor: "#047857",
      borderColor: "#6ee7b7",
      topBorder: "#10b981",
      subColor: "#059669",
    },
    {
      badgeBg: "#fef3c7",
      badgeColor: "#b45309",
      borderColor: "#fde68a",
      topBorder: "#f59e0b",
      subColor: "#d97706",
    },
  ];

  let pagesHtml = "";

  if (phases && phases.length > 0) {
    // Si viene estructurado por fases (Técnica Feynman / Guía de Estudio): 2 fases por página
    const phasePages: StudyGuidePhase[][] = [];
    for (let i = 0; i < phases.length; i += 2) {
      phasePages.push(phases.slice(i, i + 2));
    }
    const totalPages = phasePages.length;

    phasePages.forEach((batch, pIdx) => {
      const pageNum = pIdx + 1;
      const isFirstPage = pIdx === 0;
      const isLastPage = pIdx === totalPages - 1;

      const phasesHtml = batch
        .map((phase, bIdx) => {
          const globalIdx = pIdx * 2 + bIdx;
          const theme = PHASE_PRINT_THEMES[globalIdx % PHASE_PRINT_THEMES.length];

          return `
            <div class="phase-card" style="border-color: ${theme.borderColor}; border-top: 4px solid ${theme.topBorder};">
              <div class="phase-top-bar">
                <div class="phase-badge-title">
                  <span class="phase-badge" style="background: ${theme.badgeBg}; color: ${theme.badgeColor};">
                    FASE ${phase.phaseNumber}
                  </span>
                  <div>
                    <h3 class="phase-title">${sanitizeText(phase.title)}</h3>
                    ${
                      phase.subtitle
                        ? `<span class="phase-subtitle" style="color: ${theme.subColor};">${sanitizeText(phase.subtitle)}</span>`
                        : ""
                    }
                  </div>
                </div>
                <span class="status-pill">Estrategia Feynman</span>
              </div>
              <div class="phase-body">
                ${formatMarkdownToHtml(phase.content)}
              </div>
            </div>
          `;
        })
        .join("");

      pagesHtml += `
        <div class="pdf-page">
          <div class="page-main-content">
            ${
              isFirstPage
                ? `
                <div class="guide-brand-bar">
                  <div class="guide-brand-left">
                    <div class="guide-logo-box">D</div>
                    <span class="guide-brand-name">Dalat</span>
                    <span class="guide-brand-sub">Tutor Inteligente de Estudio</span>
                  </div>
                  <div class="guide-brand-date">${fechaStr}</div>
                </div>

                <div class="guide-hero-banner">
                  <div class="route-pill">
                    <span>✦ RUTA DE APRENDIZAJE ACTIVO · PASO A PASO</span>
                  </div>
                  <h1 class="guide-hero-title">${sanitizeText(title)}</h1>
                  ${introText ? `<div class="guide-intro-p">${formatMarkdownToHtml(introText)}</div>` : ""}
                </div>
              `
                : `
                <div class="exam-mini-header">
                  <div>
                    <span class="mini-brand">Dalat • Guía de Estudio</span>
                    <span class="mini-tema">${sanitizeText(title)}</span>
                  </div>
                  <div class="mini-page">Página ${pageNum}</div>
                </div>
              `
            }

            <div class="phases-stack">
              ${phasesHtml}
            </div>

            ${
              isLastPage && keyConcepts.length > 0
                ? `
                <div class="concepts-box">
                  <div class="concepts-header">✦ CONCEPTOS CLAVE PARA EL PARCIAL</div>
                  <div class="concepts-wrap">
                    ${keyConcepts.map((c) => `<span class="concept-chip">${sanitizeText(c)}</span>`).join("")}
                  </div>
                </div>
              `
                : ""
            }
          </div>

          <div class="pdf-footer">
            <span>Dalat AI • Tutor Personalizado de Estudio Activo</span>
            <span>Página <strong>${pageNum}</strong> de <strong>${totalPages}</strong></span>
          </div>
        </div>
      `;
    });
  } else if (markdownFallback) {
    // Si viene como resumen libre (Resumen Académico): Paginación inteligente multipágina
    // Dividimos por encabezados ## o secciones lógicas para que nunca desborde ni se corte
    const rawSections = markdownFallback.split(/(?=^##\s+)/m);
    const sections: string[] = [];

    // Agrupamos secciones para que quepan holgadamente en cada página A4 (~250-350 palabras por página)
    let currentBatch = "";
    for (const sec of rawSections) {
      if (!sec.trim()) continue;
      if (currentBatch.length + sec.length > 1400 && currentBatch.trim().length > 0) {
        sections.push(currentBatch);
        currentBatch = sec;
      } else {
        currentBatch += (currentBatch ? "\n\n" : "") + sec;
      }
    }
    if (currentBatch.trim().length > 0) {
      sections.push(currentBatch);
    }

    const totalPages = Math.max(sections.length, 1);

    sections.forEach((secContent, sIdx) => {
      const pageNum = sIdx + 1;
      const isFirst = sIdx === 0;
      const isLast = sIdx === totalPages - 1;

      pagesHtml += `
        <div class="pdf-page">
          <div class="page-main-content">
            ${
              isFirst
                ? `
                <div class="guide-brand-bar">
                  <div class="guide-brand-left">
                    <div class="guide-logo-box">D</div>
                    <span class="guide-brand-name">Dalat</span>
                    <span class="guide-brand-sub">Resumen Académico Estructurado</span>
                  </div>
                  <div class="guide-brand-date">${fechaStr}</div>
                </div>

                <div class="guide-hero-banner">
                  <div class="route-pill">
                    <span>✦ SÍNTESIS ACADÉMICA DE ALTO RENDIMIENTO</span>
                  </div>
                  <h1 class="guide-hero-title">${sanitizeText(title)}</h1>
                </div>
              `
                : `
                <div class="exam-mini-header">
                  <div>
                    <span class="mini-brand">Dalat • Resumen</span>
                    <span class="mini-tema">${sanitizeText(title)}</span>
                  </div>
                  <div class="mini-page">Página ${pageNum}</div>
                </div>
              `
            }

            <div class="summary-body-card">
              ${formatMarkdownToHtml(secContent)}
            </div>

            ${
              isLast && keyConcepts.length > 0
                ? `
                <div class="concepts-box">
                  <div class="concepts-header">✦ CONCEPTOS CLAVE DESTACADOS</div>
                  <div class="concepts-wrap">
                    ${keyConcepts.map((c) => `<span class="concept-chip">${sanitizeText(c)}</span>`).join("")}
                  </div>
                </div>
              `
                : ""
            }
          </div>

          <div class="pdf-footer">
            <span>Dalat AI • Plataforma de Aprendizaje Activo</span>
            <span>Página <strong>${pageNum}</strong> de <strong>${totalPages}</strong></span>
          </div>
        </div>
      `;
    });
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${cleanFilename}</title>
  <style>
    ${COMMON_CSS}

    .guide-brand-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #f1f5f9;
      margin-bottom: 12px;
    }
    .guide-brand-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .guide-logo-box {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 13px;
    }
    .guide-brand-name {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
    }
    .guide-brand-sub {
      font-size: 10px;
      color: #64748b;
      margin-left: 6px;
      padding-left: 6px;
      border-left: 1px solid #cbd5e1;
    }
    .guide-brand-date {
      font-size: 9.5px;
      color: #64748b;
      text-transform: capitalize;
    }

    .guide-hero-banner {
      background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 50%, #eef2ff 100%);
      border: 1.5px solid #e9d5ff;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 14px;
    }
    .route-pill {
      display: inline-block;
      background: #f3e8ff;
      color: #6b21a8;
      border: 1px solid #d8b4fe;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .guide-hero-title {
      font-size: 15pt;
      font-weight: 800;
      color: #2e1065;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .guide-intro-p {
      font-size: 8.5pt;
      color: #475569;
      line-height: 1.45;
      margin-top: 6px;
    }

    .phases-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .phase-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 13px 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }
    .phase-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .phase-badge-title {
      display: flex;
      align-items: center;
      gap: 9px;
    }
    .phase-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 7.2pt;
      font-weight: 800;
      letter-spacing: 0.4px;
    }
    .phase-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .phase-subtitle {
      font-size: 7.8pt;
      font-weight: 600;
      display: block;
    }
    .status-pill {
      font-size: 7.2pt;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #64748b;
    }
    .phase-body {
      font-size: 8.6pt;
      line-height: 1.48;
      color: #334155;
    }

    .summary-body-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      font-size: 8.8pt;
      line-height: 1.55;
      color: #334155;
    }

    .guide-sec-title {
      font-size: 11.5pt;
      font-weight: 800;
      color: #4c1d95;
      margin: 12px 0 6px 0;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #f3e8ff;
    }
    .guide-sec-title:first-child {
      margin-top: 0;
    }
    .guide-sub-title {
      font-size: 9.8pt;
      font-weight: 700;
      color: #1e1b4b;
      margin: 10px 0 4px 0;
    }

    .guide-callout-box {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #f5f3ff;
      border-left: 3.5px solid #7c3aed;
      border-radius: 6px;
      padding: 7px 11px;
      margin: 8px 0;
      font-size: 8.2pt;
      color: #4c1d95;
    }
    .callout-sparkle {
      color: #7c3aed;
      font-weight: bold;
    }

    .page-p {
      margin: 0 0 7px 0;
    }
    .page-p:last-child {
      margin-bottom: 0;
    }
    .page-list {
      margin: 4px 0 8px 0;
      padding-left: 0;
      list-style: none;
    }
    .page-list li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 8.5pt;
    }
    .bullet-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #7c3aed;
      margin-top: 5px;
      flex-shrink: 0;
    }

    .page-num-list {
      margin: 4px 0 8px 0;
      padding-left: 0;
      list-style: none;
    }
    .page-num-list li {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      margin-bottom: 4px;
      font-size: 8.5pt;
    }
    .num-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: #ede9fe;
      color: #6d28d9;
      font-weight: 800;
      font-size: 7pt;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .highlight-strong {
      background: #f3e8ff;
      color: #581c87;
      padding: 0 4px;
      border-radius: 3px;
    }

    /* Key Concepts */
    .concepts-box {
      margin-top: 12px;
      background: #faf5ff;
      border: 1.5px solid #e9d5ff;
      border-radius: 12px;
      padding: 10px 14px;
    }
    .concepts-header {
      font-size: 7.8pt;
      font-weight: 800;
      color: #6b21a8;
      margin-bottom: 6px;
    }
    .concepts-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .concept-chip {
      background: #ffffff;
      border: 1px solid #d8b4fe;
      color: #581c87;
      font-size: 7.5pt;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

  await renderPagesToPdf(fullHtml, cleanFilename);
}
