// Utility for generating and exporting high-resolution, beautifully styled A4 PDFs for Dalat AI resources
// Supports: Exams, Flashcard Decks, and Academic Summaries

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

function triggerPrintIframe(htmlContent: string, documentTitle: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  const prevTitle = document.title;
  document.title = documentTitle;

  const handlePrintDone = () => {
    document.title = prevTitle;
    setTimeout(() => {
      try {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      } catch {}
    }, 1200);
  };

  iframe.contentWindow?.addEventListener("afterprint", handlePrintDone);

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(handlePrintDone, 3000);
    }
  }, 350);
}

function sanitizeText(txt: string): string {
  if (!txt) return "";
  return txt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Generates an A4 PDF for interactive or printed exams with answer key & rationales.
 */
export function exportExamToPDF(params: {
  tema: string;
  materia: string;
  dificultad?: string;
  preguntas: ExamQuestion[];
}) {
  const { tema, materia, dificultad = "Intermedio", preguntas } = params;
  const fechaStr = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cleanFilename = `Examen_${tema.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  const questionsHtml = preguntas
    .map((q, idx) => {
      const qNum = String(idx + 1).padStart(2, "0");
      const letras = ["A", "B", "C", "D"];

      const optionsHtml = q.opciones
        .map((opt, oIdx) => {
          const letra = letras[oIdx] || String(oIdx + 1);
          return `
            <div class="option-item">
              <span class="option-bubble">${letra}</span>
              <span class="option-text">${sanitizeText(opt)}</span>
            </div>
          `;
        })
        .join("");

      return `
        <div class="question-card">
          <div class="question-header">
            <span class="q-badge">PREGUNTA ${qNum}</span>
            <span class="q-points">1.0 pto</span>
          </div>
          <h4 class="q-text">${sanitizeText(q.pregunta)}</h4>
          <div class="options-container">
            ${optionsHtml}
          </div>
        </div>
      `;
    })
    .join("");

  const answerKeyHtml = preguntas
    .map((q, idx) => {
      const qNum = String(idx + 1).padStart(2, "0");
      const letras = ["A", "B", "C", "D"];
      const correctLetter = letras[q.indice_correcto] || "A";
      const correctText = q.opciones[q.indice_correcto] || "";

      return `
        <div class="answer-row">
          <div class="answer-left">
            <span class="ans-qnum">#${qNum}</span>
            <span class="ans-letter">${correctLetter}</span>
          </div>
          <div class="answer-right">
            <p class="ans-text"><strong>Opción ${correctLetter}:</strong> ${sanitizeText(correctText)}</p>
            ${q.explicacion ? `<p class="ans-expl"><strong>Justificación:</strong> ${sanitizeText(q.explicacion)}</p>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${cleanFilename}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.5;
    }
    .print-container {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
    }
    /* Header */
    .exam-header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 16pt;
      font-weight: 800;
      color: #6b21a8;
      letter-spacing: -0.5px;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-sub {
      font-size: 9pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin: 0;
    }
    .exam-meta {
      text-align: right;
      font-size: 8.5pt;
      color: #475569;
    }
    .meta-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 9999px;
      background: #f3e8ff;
      color: #7e22ce;
      font-weight: 700;
      font-size: 8pt;
      border: 1px solid #d8b4fe;
      margin-bottom: 4px;
    }
    /* Info Card */
    .exam-info-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
    }
    .info-item strong {
      color: #1e293b;
    }
    /* Questions */
    .question-card {
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 14px;
      background: #ffffff;
    }
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .q-badge {
      background: #ede9fe;
      color: #5b21b6;
      font-size: 8pt;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .q-points {
      font-size: 8pt;
      font-weight: 600;
      color: #94a3b8;
    }
    .q-text {
      margin: 0 0 12px 0;
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.45;
    }
    .options-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }
    .option-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
      font-size: 9.5pt;
    }
    .option-bubble {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #334155;
      font-size: 8.5pt;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .option-text {
      color: #1e293b;
      line-height: 1.35;
    }
    /* Section Break & Answer Key */
    .page-break {
      page-break-before: always;
      break-before: page;
      margin-top: 24px;
    }
    .key-header {
      border-bottom: 2px solid #7c5dfa;
      padding-bottom: 6px;
      margin-bottom: 16px;
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .key-title {
      font-size: 13pt;
      font-weight: 800;
      color: #4c1d95;
      margin: 0;
    }
    .answer-row {
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      gap: 12px;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #10b981;
      border-radius: 6px;
      margin-bottom: 10px;
      background: #fdfdfd;
    }
    .answer-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      border-right: 1px solid #e2e8f0;
      padding-right: 10px;
    }
    .ans-qnum {
      font-size: 7.5pt;
      font-weight: 700;
      color: #64748b;
    }
    .ans-letter {
      font-size: 15pt;
      font-weight: 900;
      color: #047857;
    }
    .answer-right {
      flex: 1;
      font-size: 9pt;
    }
    .ans-text {
      margin: 0 0 4px 0;
      color: #0f172a;
    }
    .ans-expl {
      margin: 0;
      color: #475569;
      font-size: 8.5pt;
      line-height: 1.4;
      background: #f0fdf4;
      padding: 5px 8px;
      border-radius: 4px;
      border: 1px solid #bbf7d0;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 8pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="exam-header">
      <div>
        <h1 class="brand-title">Dalat • Simulacro de Evaluación</h1>
        <p class="brand-sub">${sanitizeText(materia)} — Examen Académico</p>
      </div>
      <div class="exam-meta">
        <span class="meta-badge">${sanitizeText(dificultad)}</span>
        <div>${fechaStr}</div>
        <div>Total Preguntas: ${preguntas.length}</div>
      </div>
    </div>

    <div class="exam-info-card">
      <div class="info-item"><strong>Tema Evaluado:</strong> ${sanitizeText(tema)}</div>
      <div class="info-item"><strong>Estudiante:</strong> _______________________</div>
      <div class="info-item"><strong>Calificación:</strong> ____ / 10.0</div>
    </div>

    ${questionsHtml}

    <div class="page-break"></div>

    <div class="key-header">
      <h2 class="key-title">Clave de Respuestas y Justificaciones</h2>
      <span style="font-size: 8.5pt; color: #047857; font-weight: bold;">Hoja de Retroalimentación Pedagógica</span>
    </div>

    ${answerKeyHtml}

    <div class="footer">
      Generado con Dalat AI • Asistente de Estudio Inteligente • Documento para práctica académica personal
    </div>
  </div>
</body>
</html>`;

  triggerPrintIframe(html, cleanFilename);
}

/**
 * Generates an A4 PDF for printable study flashcards in a grid with cut lines and clean typography.
 */
export function exportFlashcardsToPDF(params: {
  tema: string;
  materia: string;
  dificultad?: string;
  flashcards: Flashcard[];
}) {
  const { tema, materia, dificultad = "Intermedio", flashcards } = params;
  const fechaStr = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cleanFilename = `Flashcards_${tema.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  const cardsHtml = flashcards
    .map((card, idx) => {
      const cNum = String(idx + 1).padStart(2, "0");
      const cat = card.categoria || "Concepto Clave";

      return `
        <div class="fc-card">
          <div class="fc-header">
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

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${cleanFilename}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 12mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 10pt;
      line-height: 1.45;
    }
    .print-container {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
    }
    /* Header */
    .header {
      border-bottom: 2px solid #7c5dfa;
      padding-bottom: 8px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand-title {
      font-size: 15pt;
      font-weight: 800;
      color: #581c87;
      margin: 0 0 2px 0;
    }
    .brand-sub {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .meta-info {
      text-align: right;
      font-size: 8pt;
      color: #64748b;
    }
    /* Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .fc-card {
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1.5px dashed #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
      background: #faf5ff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 175px;
    }
    .fc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .fc-badge {
      background: #9333ea;
      color: #ffffff;
      font-size: 7pt;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .fc-cat {
      font-size: 7.5pt;
      font-weight: 700;
      color: #7e22ce;
      background: #f3e8ff;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #d8b4fe;
    }
    .fc-label {
      display: block;
      font-size: 6.5pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .fc-prompt {
      margin: 0;
      font-size: 9.5pt;
      font-weight: 700;
      color: #1e1b4b;
      line-height: 1.35;
    }
    .fc-divider {
      height: 1px;
      background: #e9d5ff;
      margin: 8px 0;
    }
    .fc-answer {
      margin: 0;
      font-size: 8.5pt;
      color: #334155;
      line-height: 1.35;
    }
    .footer {
      margin-top: 14px;
      text-align: center;
      font-size: 7.5pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="header">
      <div>
        <h1 class="brand-title">Dalat • Tarjetas de Estudio (Flashcards)</h1>
        <p class="brand-sub">${sanitizeText(materia)} — ${sanitizeText(tema)}</p>
      </div>
      <div class="meta-info">
        <div><strong>Nivel:</strong> ${sanitizeText(dificultad)}</div>
        <div>${fechaStr} • Total: ${flashcards.length} tarjetas</div>
      </div>
    </div>

    <div class="cards-grid">
      ${cardsHtml}
    </div>

    <div class="footer">
      Colección de repaso espaciado Dalat • Imprime y recorta por las líneas punteadas para estudiar en cualquier lugar
    </div>
  </div>
</body>
</html>`;

  triggerPrintIframe(html, cleanFilename);
}
