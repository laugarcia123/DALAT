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
    .replace(/>/g, "&gt;");
}

function formatMarkdownToHtml(txt: string): string {
  if (!txt) return "";
  let html = sanitizeText(txt);
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="highlight-strong">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  const rawLines = html.split("\n");
  let inList = false;
  let result = "";

  for (const l of rawLines) {
    const trimmed = l.trim();
    if (!trimmed) {
      if (inList) {
        result += "</ul>";
        inList = false;
      }
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        result += "<ul class='page-list'>";
        inList = true;
      }
      const itemText = trimmed.replace(/^(?:[-*]|\d+\.)\s+/, "");
      result += `<li><span class='bullet-dot'></span><span>${itemText}</span></li>`;
    } else {
      if (inList) {
        result += "</ul>";
        inList = false;
      }
      result += `<p class='page-p'>${trimmed}</p>`;
    }
  }

  if (inList) {
    result += "</ul>";
  }

  return result;
}

/**
 * Motor de renderizado multipágina independiente.
 * Cada elemento con clase .pdf-page se convierte en una página A4 exacta,
 * evitando cortes arbitrarios de texto, desbordes o saltos rotos.
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

    // Pausa para asegurar la carga completa de estilos y fuentes tipográficas
    await new Promise((resolve) => setTimeout(resolve, 400));

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

      const canvas = await html2canvas(pageEl, {
        scale: 2, // 2x Retina resolution (~192 DPI)
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }

      // 210mm x 297mm (A4 exacto)
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
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
    }, 600);
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
    background: #f1f5f9;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
  }

  .pdf-page {
    width: 794px;
    height: 1123px;
    max-height: 1123px;
    min-height: 1123px;
    padding: 38px 44px;
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
  }

  /* Pinned Footers */
  .pdf-footer {
    height: 26px;
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8pt;
    color: #94a3b8;
    margin-top: 10px;
  }
  .pdf-footer strong {
    color: #64748b;
  }
`;

/**
 * Exporta Examen en formato A4 con distribución limpia de preguntas y hoja de respuestas independiente.
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

  // Distribuir preguntas: Página 1 (2 preguntas + banner info), Páginas siguientes (3 preguntas c/u)
  const questionPages: ExamQuestion[][] = [];
  if (preguntas.length > 0) {
    questionPages.push(preguntas.slice(0, 2));
    for (let i = 2; i < preguntas.length; i += 3) {
      questionPages.push(preguntas.slice(i, i + 3));
    }
  }

  const totalPages = questionPages.length + 1; // +1 para la hoja de respuestas

  let pagesHtml = "";

  // Renderizar páginas de preguntas
  questionPages.forEach((batch, pIdx) => {
    const pageNum = pIdx + 1;
    const isFirstPage = pIdx === 0;

    const questionsHtml = batch
      .map((q, qIndex) => {
        const absoluteIndex = isFirstPage ? qIndex : 2 + (pIdx - 1) * 3 + qIndex;
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
              <span class="q-score">1.0 punto</span>
            </div>
            <h4 class="q-title">${sanitizeText(q.pregunta)}</h4>
            <div class="opt-grid">
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
                  <h1 class="brand-exam-title">Simulacro de Examen</h1>
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
                <div class="info-cell"><strong>Estudiante:</strong> _________________________________</div>
                <div class="info-cell"><strong>Nota:</strong> _____ / 10.0</div>
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

  // Hoja de Respuestas y Justificaciones
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
            <div class="ans-text"><strong>${letraCorrecta}:</strong> ${sanitizeText(textoCorrecto)}</div>
            ${
              q.explicacion
                ? `<div class="ans-explanation"><span class="exp-tag">Justificación:</span> ${sanitizeText(q.explicacion)}</div>`
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
            <p class="brand-exam-sub">${sanitizeText(materia)} — Justificaciones Pedagógicas</p>
          </div>
          <div class="brand-right">
            <div class="meta-pill-diff" style="background: #d1fae5; color: #065f46;">Auto-Calificación</div>
            <div class="meta-date-text">Respuestas correctas: ${preguntas.length}</div>
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
      padding: 14px 18px;
      background: #faf5ff;
      border: 1.5px solid #e9d5ff;
      border-left: 5px solid #7c3aed;
      border-radius: 12px;
      margin-bottom: 14px;
    }
    .brand-badge-pill {
      font-size: 7.5pt;
      font-weight: 800;
      color: #6b21a8;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
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
      padding: 9px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 8.5pt;
      margin-bottom: 16px;
      color: #334155;
    }

    .exam-mini-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 16px;
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
      gap: 16px;
    }

    .question-block {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
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
      line-height: 1.4;
      margin: 0 0 10px 0;
    }

    .opt-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px 12px;
    }
    .opt-card {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 7px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      font-size: 8.5pt;
    }
    .opt-bubble {
      width: 19px;
      height: 19px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #334155;
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
      line-height: 1.35;
    }

    /* Answers */
    .answers-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .answer-card {
      display: flex;
      gap: 12px;
      padding: 10px 14px;
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
      font-size: 14pt;
      font-weight: 900;
      color: #047857;
    }
    .ans-right-content {
      flex: 1;
      font-size: 8.5pt;
    }
    .ans-text {
      color: #0f172a;
      margin-bottom: 4px;
    }
    .ans-explanation {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 6px 9px;
      font-size: 8pt;
      color: #166534;
      line-height: 1.4;
    }
    .exp-tag {
      font-weight: 800;
      color: #15803d;
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
 * Exporta Tarjetas de Estudio (Flashcards) distribuidas de forma exacta en páginas A4 (6 tarjetas por hoja).
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

  // 6 tarjetas por página (2 columnas x 3 filas) para un ajuste milimétrico en A4
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

          <div class="fc-grid">
            ${cardsHtml}
          </div>
        </div>

        <div class="pdf-footer">
          <span>Dalat AI • Colección imprimible para repaso activo</span>
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
      padding: 12px 18px;
      background: #faf5ff;
      border: 1.5px solid #e9d5ff;
      border-left: 5px solid #9333ea;
      border-radius: 12px;
      margin-bottom: 14px;
    }
    .brand-badge-pill {
      font-size: 7.5pt;
      font-weight: 800;
      color: #6b21a8;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .brand-exam-title {
      font-size: 14.5pt;
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
      margin-bottom: 3px;
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

    .fc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(3, 1fr);
      gap: 12px;
      flex: 1;
    }

    .fc-card {
      border: 1.5px dashed #cbd5e1;
      border-radius: 10px;
      padding: 10px 14px;
      background: #faf5ff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      min-height: 250px;
      max-height: 290px;
    }
    .fc-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .fc-badge {
      background: #7c3aed;
      color: #ffffff;
      font-size: 6.8pt;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .fc-cat {
      font-size: 7pt;
      font-weight: 700;
      color: #7e22ce;
      background: #f3e8ff;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #d8b4fe;
    }
    .fc-label {
      display: block;
      font-size: 6.2pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .fc-prompt {
      margin: 0;
      font-size: 8.8pt;
      font-weight: 700;
      color: #1e1b4b;
      line-height: 1.35;
    }
    .fc-divider {
      height: 1px;
      background: #e9d5ff;
      margin: 6px 0;
    }
    .fc-answer {
      margin: 0;
      font-size: 8.2pt;
      color: #334155;
      line-height: 1.35;
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
 * Exporta Guía de Estudio / Resumen Estructurado (Técnica Feynman) como PDF de descarga directa con diseño estético.
 */
export async function exportStudyGuideToPDF(params: StudyGuideParams): Promise<void> {
  const { title = "Guia_de_Estudio_Dalat", introText = "", phases, keyConcepts = [], markdownFallback } = params;

  const cleanTitle = (title || "Guia_de_Estudio_Dalat")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  const cleanFilename = `Guia_Estudio_${cleanTitle}`;

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
    // 2 fases por página para que respiren con formato y tipografía amplia
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
                  <div class="mini-page">Continuación</div>
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
    // Modo fallback por si no tiene fases estructuradas
    pagesHtml = `
      <div class="pdf-page">
        <div class="page-main-content">
          <div class="guide-brand-bar">
            <div class="guide-brand-left">
              <div class="guide-logo-box">D</div>
              <span class="guide-brand-name">Dalat</span>
              <span class="guide-brand-sub">Tutor Inteligente de Estudio</span>
            </div>
            <div class="guide-brand-date">${fechaStr}</div>
          </div>

          <div class="guide-hero-banner">
            <h1 class="guide-hero-title">${sanitizeText(title)}</h1>
          </div>

          <div class="fallback-body">
            ${formatMarkdownToHtml(markdownFallback)}
          </div>
        </div>

        <div class="pdf-footer">
          <span>Dalat AI • Tutor Personalizado de Estudio Activo</span>
          <span>Página <strong>1</strong> de <strong>1</strong></span>
        </div>
      </div>
    `;
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
      padding-bottom: 10px;
      border-bottom: 1.5px solid #f1f5f9;
      margin-bottom: 14px;
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
      font-size: 10.5px;
      color: #64748b;
      margin-left: 6px;
      padding-left: 6px;
      border-left: 1px solid #cbd5e1;
    }
    .guide-brand-date {
      font-size: 10px;
      color: #64748b;
      text-transform: capitalize;
    }

    .guide-hero-banner {
      background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 50%, #eef2ff 100%);
      border: 1.5px solid #e9d5ff;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .route-pill {
      display: inline-block;
      background: #f3e8ff;
      color: #6b21a8;
      border: 1px solid #d8b4fe;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .guide-hero-title {
      font-size: 16pt;
      font-weight: 800;
      color: #2e1065;
      margin: 0 0 6px 0;
      letter-spacing: -0.3px;
    }
    .guide-intro-p {
      font-size: 8.5pt;
      color: #475569;
      line-height: 1.45;
    }

    .phases-stack {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .phase-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }
    .phase-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .phase-badge-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .phase-badge {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 7px;
      font-size: 7.5pt;
      font-weight: 800;
      letter-spacing: 0.4px;
    }
    .phase-title {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .phase-subtitle {
      font-size: 8pt;
      font-weight: 600;
      display: block;
    }
    .status-pill {
      font-size: 7.5pt;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #64748b;
    }
    .phase-body {
      font-size: 8.8pt;
      line-height: 1.5;
      color: #334155;
    }

    .page-p {
      margin: 0 0 8px 0;
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
      margin-bottom: 5px;
      font-size: 8.5pt;
    }
    .bullet-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #7c3aed;
      margin-top: 6px;
      flex-shrink: 0;
    }
    .highlight-strong {
      background: #f3e8ff;
      color: #581c87;
      padding: 0 4px;
      border-radius: 3px;
    }

    /* Key Concepts */
    .concepts-box {
      margin-top: 14px;
      background: #faf5ff;
      border: 1.5px solid #e9d5ff;
      border-radius: 12px;
      padding: 12px 16px;
    }
    .concepts-header {
      font-size: 8pt;
      font-weight: 800;
      color: #6b21a8;
      margin-bottom: 8px;
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
      font-size: 7.8pt;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .fallback-body {
      font-size: 9pt;
      line-height: 1.55;
      color: #334155;
      padding: 14px;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

  await renderPagesToPdf(fullHtml, cleanFilename);
}
