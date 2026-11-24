import os
import json
import time
import urllib.request
import urllib.error
from typing import Dict, Any, Tuple, Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from schemas.ai_resource import GenerarRecursoRequest


def _load_env_vars():
    """Carga variables desde el archivo .env en backend/ o raíz si existen."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(current_dir, "..", ".env"),
        os.path.join(current_dir, "..", "..", ".env"),
    ]
    for env_file in candidates:
        if os.path.isfile(env_file):
            try:
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            key_clean = k.strip()
                            val_clean = v.strip().strip('"').strip("'")
                            if key_clean:
                                os.environ[key_clean] = val_clean
            except Exception as e:
                print(f"[Env Loader] Error al leer {env_file}: {e}")


def get_gemini_api_key() -> str:
    _load_env_vars()
    return os.getenv("GEMINI_API_KEY", "").strip()


def generar_con_gemini(req: GenerarRecursoRequest, api_key: str, pdf_base64: Optional[str] = None) -> Any:
    """
    Invoca la API de Google Gemini (Multimodal con soporte directo de PDF / OCR)
    para generar contenido académico real, dinámico y estructurado en JSON.
    """
    tipo = req.tipo_recurso.lower()
    materia = req.materia
    tema = req.tema
    dificultad = req.dificultad or "Intermedio"
    cantidad = req.cantidad or 5
    contexto = req.texto_adicional or ""

    contexto_prompt = ""
    if contexto:
        contexto_prompt = f"\nUsa prioritariamente el siguiente material o texto de estudio como base:\n---\n{contexto[:8000]}\n---\n"

    if tipo == "examen":
        prompt = (
            f"Actúa como un profesor universitario titular y examinador de pregrado en '{materia}'. "
            f"Diseña un examen interactivo riguroso de nivel universitario de exactamente {cantidad} preguntas de opción múltiple "
            f"sobre el tema '{tema}'. Nivel de exigencia académica: '{dificultad}'.{contexto_prompt}\n\n"
            "DIRECTRICES DE EXCELENCIA PSICOMÉTRICA UNIVERSITARIA (MUY IMPORTANTE):\n"
            "1. NIVEL COGNITIVO SUPERIOR: Formula preguntas de aplicación práctica, análisis crítico de escenarios, teoremas y resolución de problemas. EVITA preguntas de memorización simple o definiciones de diccionario.\n"
            "2. REGLA ESTRICTA DE DISTRACTORES (OPCIONES INCORRECTAS): Las 3 opciones incorrectas DEBEN ser plausibles, convincentes y fundamentadas en errores conceptuales o trampas comunes de estudiantes universitarios. NUNCA uses distractores absurdos, disparatados o que se noten falsos a simple vista.\n"
            "3. LONGITUD Y TONO HOMOGÉNEO: Todas las opciones (correcta e incorrectas) deben tener una longitud, redacción técnica y nivel de detalle similares.\n"
            "4. NOTACIÓN MATEMÁTICA: Si el tema involucra matemáticas, cálculo, álgebra o física, utiliza SIEMPRE notación LaTeX estándar delimitada por signos de dólar ($...$ para fórmulas en línea y $$...$$ para ecuaciones centradas).\n"
            "5. EXPLICACIÓN PEDAGÓGICA INTEGRAL: La explicación debe justificar con rigor por qué la opción seleccionada es la verdadera y desmantelar por qué los distractores clave son conceptualmente erróneos.\n\n"
            "Responde EXCLUSIVAMENTE con un arreglo JSON válido (sin markdown ```json adicional):\n"
            "[\n"
            "  {\n"
            '    "id": 1,\n'
            '    "pregunta": "¿Enunciado analítico o problema de nivel universitario?",\n'
            '    "opciones": ["Opción plausible A", "Opción plausible B", "Opción plausible C", "Opción plausible D"],\n'
            '    "indice_correcto": 0,\n'
            '    "explicacion": "Demostración y justificación pedagógica profunda..."\n'
            "  }\n"
            "]"
        )
    elif tipo in ("psicopata", "psicopata_challenge"):
        prompt = (
            f"Actúa como un profesor universitario titular y examinador de élite en '{materia}'. "
            f"Diseña un desafío riguroso de Muerte Súbita (Método Psicópata) con exactamente {cantidad} preguntas de análisis crítico "
            f"sobre el documento o tema '{tema}'. Nivel de exigencia: PREGRADO UNIVERSITARIO AVANZADO.{contexto_prompt}\n\n"
            "DIRECTRICES OBLIGATORIAS (CERO MARGEN DE ERROR):\n"
            "1. NO OPTIMIZADO PARA CÁLCULOS MATEMÁTICOS O FÍSICA NUMÉRICA. Este desafío está enfocado en comprensión conceptual profunda, definiciones técnicas exactas, relaciones causales, mecanismos doctrinales, clínicos, históricos o epistemológicos, y resolución analítica.\n"
            "2. EXIGENCIA DE ALTO NIVEL: Cada pregunta debe desafiar el razonamiento del estudiante. Se prohíben preguntas obvias o de memorización superficial.\n"
            "3. 4 OPCIONES HOMOGÉNEAS Y PLAUSIBLES: Las 3 opciones incorrectas (distractores) deben representar confusiones teóricas reales y sofisticadas de estudiantes universitarios. Ningún distractor debe ser ingenuo ni descartable a simple vista.\n"
            "4. EXPLICACIÓN RIGUROSA: La explicación pedagógica debe justificar por qué la opción seleccionada es la verdadera y por qué las alternativas fallan.\n\n"
            "Responde EXCLUSIVAMENTE con un arreglo JSON válido (sin código markdown ```json extra):\n"
            "[\n"
            "  {\n"
            '    "id": 1,\n'
            '    "pregunta": "¿Pregunta analítica profunda de nivel universitario?",\n'
            '    "opciones": ["Opción correcta", "Distractor plausible 1", "Distractor plausible 2", "Distractor plausible 3"],\n'
            '    "indice_correcto": 0,\n'
            '    "explicacion": "Demostración y justificación pedagógica completa..."\n'
            "  }\n"
            "]"
        )
    elif tipo == "flashcards":
        prompt = (
            f"Actúa como un profesor y tutor universitario en '{materia}'. "
            f"Genera exactamente {cantidad} tarjetas de estudio activo (flashcards) para repaso espaciado de alto impacto "
            f"sobre el tema '{tema}'. Nivel universitario: '{dificultad}'.{contexto_prompt}\n\n"
            "DIRECTRICES:\n"
            "1. El anverso debe plantear preguntas conceptuales profundas, dilemas analíticos o condiciones de teoremas (no simples definiciones).\n"
            "2. El reverso debe sintetizar la respuesta con rigor técnico, explicando el 'por qué' del mecanismo.\n"
            "3. Usa notación LaTeX ($...$) si incluye fórmulas matemáticas o físicas.\n\n"
            "Responde EXCLUSIVAMENTE con un arreglo JSON válido:\n"
            "[\n"
            "  {\n"
            '    "id": 1,\n'
            '    "anverso": "¿Pregunta conceptual o desafío analítico?",\n'
            '    "reverso": "Explicación rigurosa del principio subyacente...",\n'
            '    "categoria": "Teorema o Subtema",\n'
            f'    "dificultad": "{dificultad}"\n'
            "  }\n"
            "]"
        )
    elif tipo in ("psicopata", "psicopata_challenge"):
        prompt = (
            f"Actúa como un profesor universitario titular y examinador de élite en '{materia}'. "
            f"Diseña un desafío riguroso de Muerte Súbita (Método Psicópata) con exactamente {cantidad} preguntas de análisis crítico "
            f"sobre el documento o tema '{tema}'. Nivel de exigencia: PREGRADO UNIVERSITARIO AVANZADO.{contexto_prompt}\n\n"
            "DIRECTRICES OBLIGATORIAS (CERO MARGEN DE ERROR):\n"
            "1. NO OPTIMIZADO PARA CÁLCULOS MATEMÁTICOS O FÍSICA NUMÉRICA. Este desafío está enfocado en comprensión conceptual profunda, definiciones técnicas exactas, relaciones causales, mecanismos doctrinales, clínicos, históricos o epistemológicos, y resolución analítica.\n"
            "2. EXIGENCIA DE ALTO NIVEL: Cada pregunta debe desafiar el razonamiento del estudiante. Se prohíben preguntas obvias o de memorización superficial.\n"
            "3. 4 OPCIONES HOMOGÉNEAS Y PLAUSIBLES: Las 3 opciones incorrectas (distractores) deben representar confusiones teóricas reales y sofisticadas de estudiantes universitarios. Ningún distractor debe ser ingenuo ni descartable a simple vista.\n"
            "4. EXPLICACIÓN RIGUROSA: La explicación pedagógica debe justificar por qué la opción seleccionada es la verdadera y por qué las alternativas fallan.\n\n"
            "Responde EXCLUSIVAMENTE con un arreglo JSON válido (sin código markdown ```json extra):\n"
            "[\n"
            "  {\n"
            '    "id": 1,\n'
            '    "pregunta": "¿Pregunta analítica profunda de nivel universitario?",\n'
            '    "opciones": ["Opción correcta", "Distractor plausible 1", "Distractor plausible 2", "Distractor plausible 3"],\n'
            '    "indice_correcto": 0,\n'
            '    "explicacion": "Demostración y justificación pedagógica completa..."\n'
            "  }\n"
            "]"
        )
    elif tipo == "resumen":
        prompt = (
            f"Actúa como un profesor universitario titular especialista en '{materia}'. "
            f"Genera un resumen académico de nivel superior en formato Markdown "
            f"sobre el tema '{tema}'. Nivel: '{dificultad}'.{contexto_prompt}\n\n"
            "ESTRUCTURA OBLIGATORIA:\n"
            "1. Marco conceptual y premisas fundamentales.\n"
            "2. Análisis técnico detallado, teoremas o modelos cuantitativos (con fórmulas en LaTeX $...$).\n"
            "3. Trade-offs, aplicaciones prácticas y conclusiones analíticas.\n\n"
            "Responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura:\n"
            "{\n"
            f'  "titulo": "Resumen Académico de Nivel Superior: {tema}",\n'
            '  "resumen_markdown": "# Título\\n\\n## 1. Fundamentos y Premisas...\\n\\n## 2. Desarrollo Técnico y Teoremas...",\n'
            '  "puntos_clave": ["Pilar analítico 1", "Pilar analítico 2", "Pilar analítico 3"],\n'
            '  "formulas_o_conceptos": ["Concepto o fórmula 1", "Concepto 2"]\n'
            "}"
        )
    elif tipo in ("pack_general", "pack1"):
        prompt = (
            f"Actúa como un decano y profesor universitario titular en '{materia}'. "
            f"Diseña un PACK DE ESTUDIO UNIVERSITARIO DE ALTO RENDIMIENTO (Modelo de Optimización 1 — General) para el tema '{tema}'. Nivel: '{dificultad}'.{contexto_prompt}\n\n"
            "ESTÁNDARES DE CALIDAD Y EXIGENCIA ACADÉMICA:\n"
            "1. 'examen': Exactamente 5 preguntas de nivel pregrado/universitario. Las 4 opciones deben ser técnicamente homogéneas y plausibles; las 3 opciones falsas DEBEN reflejar confusiones teóricas comunes (CERO distractores obvios o ingenuos). Explicación pedagógica detallada.\n"
            "2. 'flashcards': Exactamente 6 tarjetas de estudio activo con desafíos sobre causas, consecuencias y condiciones límite del tema.\n"
            "3. 'resumen': Síntesis formal y rigurosa en Markdown estructurada con secciones numeradas (##), balance de trade-offs y conceptos esenciales.\n\n"
            "Responde EXCLUSIVAMENTE con un único objeto JSON válido con la siguiente estructura exacta:\n"
            "{\n"
            '  "examen": [\n'
            '    {"id": 1, "pregunta": "¿Enunciado de análisis de caso o aplicación teórica?", "opciones": ["Opción plausible A", "Opción plausible B", "Opción plausible C", "Opción plausible D"], "indice_correcto": 0, "explicacion": "Demostración completa..."}\n'
            '  ],\n'
            '  "flashcards": [\n'
            '    {"id": 1, "anverso": "...", "reverso": "...", "categoria": "...", "dificultad": "Avanzado"}\n'
            '  ],\n'
            '  "resumen": {\n'
            f'    "titulo": "Resumen Analítico Universitario: {tema}",\n'
            '    "resumen_markdown": "# Resumen Universitario\\n\\n## 1. Fundamentos Estructurales...\\n\\n## 2. Variables Operativas...",\n'
            '    "puntos_clave": ["Principio 1", "Principio 2"],\n'
            '    "formulas_o_conceptos": ["Concepto 1"]\n'
            '  }\n'
            "}"
        )
    elif tipo in ("pack_matematicas", "pack2"):
        prompt = (
            f"Actúa como un profesor distinguido de Matemáticas y Física Teórica/Aplicada en '{materia}'. "
            f"Diseña un PACK ESPECIALIZADO DE MATEMÁTICAS & FÍSICA AVANZADA (Cálculo Multivariable, Álgebra Lineal, EDO, Termodinámica, Mecánica Analítica) con el Modelo de Optimización 2 "
            f"para dominar con rigor matemático absoluto el tema '{tema}'. Nivel: '{dificultad}'.{contexto_prompt}\n\n"
            "REGLAS INQUEBRANTABLES DE RIGOR MATEMÁTICO:\n"
            "1. NOTACIÓN LATEX ESTÁNDAR: Toda variable, integral, matriz, derivada o fórmula DEBE escribirse en notación LaTeX delimitada por $...$ (ejemplos: $\\iint_R f(x,y)\\,dA$, $\\nabla f(x,y)$, $\\det(A - \\lambda I) = 0$, $\\frac{d^2 y}{dx^2} + \\omega^2 y = 0$).\n"
            "2. VERIFICACIÓN DE CÁLCULO PASO A PASO: Resuelve internamente cada problema paso a paso verificando signos, dimensiones físicas y álgebra antes de definir las opciones.\n"
            "3. DISTRACTORES REALISTAS DE CÁLCULO (CERO OPCIONES RIDÍCULAS): En el examen, las 3 opciones erróneas DEBEN ser errores algebraicos y conceptuales típicos de estudiantes universitarios (ejemplo: olvidar la regla de la cadena, error de signo en integración por partes, confundir multiplicidad algebraica con geométrica, o invertir el orden de límites de integración).\n"
            "4. 'guia': Guía Feynman paso a paso en 4 fases metodológicas (# Ruta Feynman, ### Fase 1..., ### Fase 2..., etc.) desglosando la intuición y el formalismo.\n"
            "5. 'resumen': Resumen formal con demostraciones clave, teoremas con hipótesis y tesis, y catálogo de ecuaciones en LaTeX.\n"
            "6. 'examen': 5 problemas cuantitativos y conceptuales avanzados con opciones homogéneas y justificación matemática exhaustiva.\n\n"
            "Responde EXCLUSIVAMENTE con un único objeto JSON válido con la siguiente estructura exacta:\n"
            "{\n"
            '  "guia": {\n'
            f'    "titulo": "Guía de Estudio Paso a Paso: {tema}",\n'
            '    "resumen_markdown": "# Ruta Feynman Matemáticas Avanzadas\\n\\n### Fase 1: Selección y Estudio Inicial\\n...\\n\\n### Fase 2: Explicación Simplificada\\n...\\n\\n### Fase 3: Identificación de Brechas\\n...\\n\\n### Fase 4: Refinamiento y Analogía\\n...",\n'
            '    "puntos_clave": ["Teorema fundamental", "Condición de convergencia"],\n'
            '    "formulas_o_conceptos": ["$Fórmula en LaTeX$"]\n'
            '  },\n'
            '  "resumen": {\n'
            f'    "titulo": "Resumen Cuantitativo con Fórmulas: {tema}",\n'
            '    "resumen_markdown": "# Resumen Analítico con Ecuaciones\\n\\n## 1. Teoremas y Definiciones Formales...\\n\\n## 2. Desarrollo Cuantitativo...",\n'
            '    "puntos_clave": ["Hipótesis del teorema", "Propiedad de invariancia"],\n'
            '    "formulas_o_conceptos": ["$\\oint_C \\vec{F} \\cdot d\\vec{r}$"]\n'
            '  },\n'
            '  "examen": [\n'
            '    {"id": 1, "pregunta": "¿Problema analítico o cuantitativo avanzado?", "opciones": ["$Opción plausible A$", "$Opción plausible B$", "$Opción plausible C$", "$Opción plausible D$"], "indice_correcto": 0, "explicacion": "Demostración matemática paso a paso y análisis de por qué los distractores fallan..."}\n'
            '  ]\n'
            "}"
        )
    else:  # Guía de estudio
        prompt = (
            f"Actúa como un mentor de estudio en '{materia}'. "
            f"Genera una guía de estudio paso a paso aplicando la técnica Feynman "
            f"para dominar el tema '{tema}'. Nivel: '{dificultad}'.{contexto_prompt}\n\n"
            "Responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura:\n"
            "{\n"
            f'  "titulo": "Guía de Estudio Paso a Paso: {tema}",\n'
            '  "resumen_markdown": "# Ruta de Aprendizaje...\\n\\n### Fase 1...\\n\\n### Fase 2...",\n'
            '  "puntos_clave": ["Objetivo 1", "Objetivo 2"],\n'
            '  "formulas_o_conceptos": ["Concepto esencial 1"]\n'
            "}"
        )

    # Modelos de Gemini a intentar en orden de preferencia según la API v1beta
    models = [
        "gemini-3.5-flash-lite",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
        "gemini-pro-latest",
    ]
    last_error = None
    had_high_demand = False

    contents_parts = []
    if pdf_base64:
        contents_parts.append({
            "inlineData": {
                "mimeType": "application/pdf",
                "data": pdf_base64
            }
        })
        prompt = (
            "DOCUMENTO ADJUNTO: Se incluye el archivo PDF original de estudio (con su texto, páginas escaneadas, artículos, notas y conceptos).\n"
            "DEBES BASAR EL 100% DEL CONTENIDO RIGUROSAMENTE EN ESTE DOCUMENTO ADJUNTO.\n\n"
            + prompt
        )
    contents_parts.append({"text": prompt})

    for model_name in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": contents_parts
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "responseMimeType": "application/json"
            }
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        req_obj = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req_obj, timeout=40) as response:
                resp_json = json.loads(response.read().decode("utf-8"))
                text_out = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                # Limpiar posibles delimitadores de código si el modelo los incluyó
                text_clean = text_out.strip()
                if text_clean.startswith("```json"):
                    text_clean = text_clean[7:]
                elif text_clean.startswith("```"):
                    text_clean = text_clean[3:]
                if text_clean.endswith("```"):
                    text_clean = text_clean[:-3]
                text_clean = text_clean.strip()
                return json.loads(text_clean)
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            print(f"[Gemini API Error] {model_name} HTTP {he.code}: {err_body}")
            last_error = f"HTTP {he.code}: {err_body}"

            if he.code in (404, 429, 503) or "high demand" in err_body.lower() or "unavailable" in err_body.lower():
                had_high_demand = True
                continue
            continue
        except urllib.error.URLError as ue:
            print(f"[Gemini Network Error] {model_name}: {ue}")
            last_error = str(ue)
            continue
        except Exception as e:
            print(f"[Gemini Parse Error] {model_name}: {e}")
            last_error = str(e)
            continue

    # Si todos los modelos fallaron o experimentaron alta demanda
    error_str = str(last_error or "").lower()
    if had_high_demand or any(k in error_str for k in ("503", "429", "unavailable", "high demand", "resource_exhausted")):
        raise HTTPException(
            status_code=503,
            detail="Nuestros recursos PRO están altamente demandados en este momento. Por favor, intenta más tarde."
        )

    raise HTTPException(
        status_code=502,
        detail="Nuestros recursos PRO están altamente demandados en este momento. Por favor, intenta más tarde."
    )


def _generar_local_heuristico(req: GenerarRecursoRequest) -> Any:
    """Motor Heurístico Académico Local de Alta Disponibilidad para Dalat."""
    tipo = req.tipo_recurso.lower()
    materia = req.materia or "General"
    tema = req.tema or "Contenido de Estudio"
    dificultad = req.dificultad or "Intermedio"

    texto_doc = (req.texto_adicional or "").strip()
    if len(texto_doc) > 100:
        import re
        raw_sentences = [s.strip() for s in re.split(r'[\.\n;]+', texto_doc) if len(s.strip()) > 35]
        if len(raw_sentences) >= 4:
            examen_contextualizado = []
            for i in range(min(req.cantidad or 5, len(raw_sentences))):
                sent = raw_sentences[i]
                distractor1 = f"Se contradice la premisa de que {sent[:60]}... considerándose un supuesto no aplicable."
                distractor2 = f"El criterio normativo excluye taxativamente las condiciones descritas en el texto."
                distractor3 = f"Únicamente tiene validez cuando se omiten las formalidades sustanciales examinadas."
                examen_contextualizado.append({
                    "id": i + 1,
                    "pregunta": f"De acuerdo con el documento de estudio sobre '{materia}': ¿cuál de los siguientes enunciados refleja fielmente la premisa analizada?",
                    "opciones": [
                        sent,
                        distractor1,
                        distractor2,
                        distractor3
                    ],
                    "indice_correcto": 0,
                    "explicacion": f"El texto oficial del documento establece textualmente: '{sent}'."
                })
            examen_general_demo = examen_contextualizado
        else:
            examen_general_demo = []
    else:
        examen_general_demo = []

    meta_texto = f"{materia} {tema} {req.archivo_nombre or ''}".lower()
    es_derecho = any(k in meta_texto for k in ["derecho", "ley", "jurid", "administrativ", "constitucional", "civil", "penal", "norma", "acto", "codigo", "abogad", "fiscal", "tutela", "sentencia", "jurisprudencia"])
    es_salud = any(k in meta_texto for k in ["medicin", "salud", "anatomic", "farmaco", "fisiolog", "clinica", "enfermer", "biolog", "patolog", "quirurg"])

    if not examen_general_demo:
        if es_derecho:
            examen_general_demo = [
                {
                    "id": 1,
                    "pregunta": f"En el marco del Derecho Administrativo y la teoría de los actos administrativos: ¿Cuál es el fundamento dogmático de la presunción de legalidad y ejecutoriedad de las decisiones estatales?",
                    "opciones": [
                        "Que todo acto administrativo se presume expedido conforme al ordenamiento jurídico superior y produce plenos efectos obligatorios hasta que la jurisdicción competente declare su nulidad o se suspenda provisionalmente.",
                        "Que la Administración Pública no está obligada a fundamentar sus motivos cuando actúa en ejercicio de facultades regladas frente a particulares.",
                        "Que los actos administrativos adquieren firmeza irrevocable e inimpugnable de manera automática desde el instante de su firma por el funcionario.",
                        "Que la voluntad unilateral de la autoridad prevalece de manera absoluta sobre los derechos subjetivos sin posibilidad de control judicial."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "La presunción de legalidad confiere validez y eficacia inmediata al acto administrativo mientras no sea desvirtuada ante la Jurisdicción de lo Contencioso Administrativo. Las opciones B, C y D desconocen los límites del Estado de Derecho y el debido proceso."
                },
                {
                    "id": 2,
                    "pregunta": f"Respecto a los vicios que afectan la validez del acto administrativo: ¿En qué consiste la causal de 'Desviación de Poder'?",
                    "opciones": [
                        "En expedir el acto con apariencia de legalidad formal pero persiguiendo un fin distinto al interés general o ajeno al propósito asignado expresamente por la norma que otorgó la competencia.",
                        "En proferir la decisión fuera del término legal establecido en el Código de Procedimiento Administrativo.",
                        "En la manifiesta incompetencia territorial o funcional del funcionario público que suscribe el acto.",
                        "En omitir la notificación personal al administrado cuando la ley exigía únicamente su publicación en gaceta."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "La desviación de poder sanciona la adulteración de la teleología del acto: la autoridad usa una potestad legal para fines particulares, políticos o encubiertos. Las opciones B, C y D corresponden a vicios de forma, incompetencia o indebida notificación."
                },
                {
                    "id": 3,
                    "pregunta": f"En el régimen contencioso administrativo: ¿Qué diferencia sustancial existe entre el medio de control de Simple Nulidad y el de Nulidad y Restablecimiento del Derecho?",
                    "opciones": [
                        "La Simple Nulidad protege la legalidad objetiva y el orden público abstracto con legitimación universal, mientras que la Nulidad y Restablecimiento busca resarcir un derecho subjetivo vulnerado y tiene un término de caducidad estricto (4 meses).",
                        "La Simple Nulidad exige agotar obligatoriamente los recursos de la vía administrativa, mientras que el restablecimiento del derecho no requiere pronunciamiento previo de la entidad.",
                        "La Simple Nulidad únicamente procede contra actos de contenido particular y concreto con efectos patrimoniales directos.",
                        "Ambos medios de control persiguen indemnización pecuniaria, diferenciándose únicamente en el monto de la cuantía fijada en la demanda."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "La simple nulidad defiende el ordenamiento jurídico general (cualquiera puede demandar en cualquier tiempo), mientras que la nulidad y restablecimiento ampara derechos individuales agraviados y caduca en cuatro meses. Las opciones B, C y D son contrarias a la dogmática procesal."
                },
                {
                    "id": 4,
                    "pregunta": f"Frente a la inactividad de la Administración: ¿Cómo opera la figura procesal del Silencio Administrativo Negativo?",
                    "opciones": [
                        "Como una ficción legal procesal que faculta al administrado a considerar desestimada su petición para acudir a los recursos administrativos o demandar ante la jurisdicción contenciosa.",
                        "Como una sanción disciplinaria automática de destitución contra el funcionario que omitió dar respuesta oportuna.",
                        "Como una aceptación tácita e incondicional de todas las pretensiones y solicitudes formuladas por el ciudadano.",
                        "Como la extinción definitiva del derecho reclamado por haber operado la prescripción adquisitiva a favor del Estado."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "El silencio negativo no es un acto administrativo real sino una garantía procesal que impide que la inercia estatal bloquee indefinidamente el acceso a la justicia. La opción C describe el silencio positivo (excepcional), y B y D son figuras jurídicas erróneas."
                },
                {
                    "id": 5,
                    "pregunta": f"En la responsabilidad patrimonial del Estado (Art. 90 CP): ¿Bajo qué título de imputación responde la administración pública en casos de Daño Especial?",
                    "opciones": [
                        "Responsabilidad de régimen objetivo fundamentada en el principio de igualdad ante las cargas públicas, donde un actuar legítimo del Estado genera una carga desproporcionada y singular sobre un particular.",
                        "Responsabilidad subjetiva basada exclusivamente en la culpa probada o negligencia grave en la conducta de los agentes estatales.",
                        "Régimen de falta disciplinaria que exige demostrar la intención dolosa del servidor público causante de la perturbación.",
                        "Responsabilidad subsidiaria que solo se activa cuando se declara la quiebra financiera de la entidad pública demandada."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "El daño especial opera bajo el régimen objetivo: la actuación administrativa puede ser plenamente legítima, pero al romper la equidad en el reparto de las cargas públicas, impone al Estado el deber de indemnizar al afectado."
                }
            ]
        elif es_salud:
            examen_general_demo = [
                {
                    "id": 1,
                    "pregunta": f"En el razonamiento clínico y farmacológico de '{materia}': ¿Cuál es el mecanismo fisiopatológico primario a considerar ante un cuadro de descompensación aguda?",
                    "opciones": [
                        "La pérdida de autorregulación hemodinámica y la alteración en la perfusión tisular sistémica.",
                        "La supresión completa de los receptores intracelulares sin afectación de la gradiente osmótica.",
                        "El incremento idiopático de la volemia sin repercusión en la poscarga ventricular.",
                        "La inhibición irreversible de la glucólisis anaeróbica en el miocardio."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "La perfusión tisular insuficiente es el factor crítico en fallas orgánicas agudas."
                }
            ]
        else:
            examen_general_demo = [
                {
                    "id": 1,
                    "pregunta": f"En el análisis de '{tema}' dentro de la disciplina de '{materia}': ¿Cuál es el principio fundamental que rige la relación entre sus conceptos estructurantes?",
                    "opciones": [
                        "La interdependencia funcional entre los marcos conceptuales y la validación empírica de sus postulados.",
                        "La subordinación absoluta a criterios preestablecidos sin posibilidad de contrastación crítica.",
                        "La invariancia estática de los principios teóricos independientemente del contexto de aplicación.",
                        "La desconexión metodológica entre la formulación dogmática y su ejercicio operativo."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "El rigor académico exige contrastar los fundamentos teóricos con su implementación práctica."
                },
                {
                    "id": 2,
                    "pregunta": f"Al evaluar críticamente las fuentes y premisas de '{tema}': ¿Qué criterio metodológico garantiza la mayor validez analítica?",
                    "opciones": [
                        "El contraste sistemático entre la doctrina especializada y los datos observables en el campo de estudio.",
                        "La aceptación acrítica de fuentes secundarias desprovistas de revisión por pares.",
                        "La extrapolación indiscriminada de conclusiones locales a escenarios normativos divergentes.",
                        "La sustitución de la argumentación fundamentada por apreciaciones puramente subjetivas."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "La contrastación sistemática de fuentes primarias es el estándar de rigor académico superior."
                },
                {
                    "id": 3,
                    "pregunta": f"En la aplicación práctica de los conocimientos relativos a '{tema}': ¿Cuál es la estrategia pedagógica más efectiva para consolidar el dominio conceptual?",
                    "opciones": [
                        "La resolución activa de casos y problemas complejos acompañada de retroalimentación inmediata.",
                        "La memorización mecánica de definiciones aisladas sin contexto ni aplicación.",
                        "La postergación de la práctica evaluativa hasta finalizar la totalidad del plan de estudios.",
                        "La lectura pasiva reiterada sin autoevaluación ni contrastación de ideas clave."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "La práctica deliberada y la resolución de casos es el estándar más respaldado por la ciencia del aprendizaje."
                },
                {
                    "id": 4,
                    "pregunta": f"Al estructurar una síntesis analítica sobre los tópicos centrales de '{tema}': ¿Qué elemento resulta indispensable?",
                    "opciones": [
                        "La jerarquización clara de las ideas principales y la articulación lógica con sus fundamentos.",
                        "La omisión de los principios rectores para concentrarse únicamente en aspectos accesorios.",
                        "El tratamiento desarticulado de los conceptos sin establecer relaciones causales.",
                        "La recopilación acrítica de datos sin someterlos a un filtro metodológico riguroso."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "Una síntesis efectiva exige jerarquía y articulación lógica de las ideas clave."
                },
                {
                    "id": 5,
                    "pregunta": f"Frente a discrepancias doctrinales o metodológicas en el estudio de '{tema}': ¿Cómo debe proceder el análisis académico?",
                    "opciones": [
                        "Ponderando los fundamentos argumentativos de cada postura a la luz de las fuentes primarias.",
                        "Adoptando la postura más reciente sin verificar su solidez argumentativa ni empírica.",
                        "Descartando de plano cualquier perspectiva que difiera de la postura hegemónica tradicional.",
                        "Sustituyendo la deliberación razonada por criterios de mera preferencia subjetiva."
                    ],
                    "indice_correcto": 0,
                    "explicacion": "La ponderación crítica de argumentos frente a fuentes directas es el método científico y académico por excelencia."
                }
            ]

    examen_matematicas_demo = [
        {
            "id": 1,
            "pregunta": "Para evaluar la integral iterada $\\int_0^1 \\int_y^1 e^{x^2} \\, dx \\, dy$, ¿cuál es el procedimiento analítico correcto y el valor exacto de la integral?",
            "opciones": [
                "Invertir el orden de integración a $\\int_0^1 \\int_0^x e^{x^2} \\, dy \\, dx$, obteniendo $\\frac{e - 1}{2}$.",
                "Integrar directamente por partes respecto a $x$, obteniendo $e^1 - e^0 = e - 1$.",
                "Invertir el orden de integración a $\\int_0^1 \\int_x^1 e^{x^2} \\, dy \\, dx$, obteniendo $\\frac{e + 1}{2}$.",
                "Aproximar mediante serie de Taylor truncada porque el teorema de Fubini exige que la región sea estrictamente rectangular."
            ],
            "indice_correcto": 0,
            "explicacion": "Al cambiar el orden sobre la región triangular $0 \\le y \\le x \\le 1$, la integral interna en $y$ produce un factor $x$, permitiendo resolver $\\int_0^1 x e^{x^2}\\,dx = \\frac{1}{2}(e - 1)$. Las opciones B y C cometen errores clásicos de límites e integración."
        },
        {
            "id": 2,
            "pregunta": "Dada la matriz $A = \\begin{pmatrix} 2 & 1 \\\\ 0 & 2 \\end{pmatrix}$, ¿cuál es la razón matemática por la cual $A$ NO es diagonalizable sobre $\\mathbb{R}$?",
            "opciones": [
                "Porque el autovalor $\\lambda = 2$ tiene multiplicidad algebraica 2, pero su multiplicidad geométrica $\\dim(\\ker(A - 2I))$ es solo 1.",
                "Porque la matriz es invertible ya que $\\det(A) = 4 \\neq 0$, lo que impide la existencia de vectores propios linealmente independientes.",
                "Porque la traza de la matriz $\\text{tr}(A) = 4$ es igual al cuadrado de su determinante, generando un bloque de Jordan nilpotente.",
                "Porque los elementos fuera de la diagonal principal no satisfacen la simetría hermitiana requerida por el Teorema Espectral."
            ],
            "indice_correcto": 0,
            "explicacion": "Una matriz es diagonalizable si y solo si la multiplicidad geométrica iguala a la algebraica para cada autovalor. Aquí $\\ker(A - 2I)$ tiene dimensión 1. La opción B es la falacia clásica de confundir invertibilidad con diagonalizabilidad."
        },
        {
            "id": 3,
            "pregunta": "Al optimizar $f(x, y)$ sujeta a $g(x, y) = c$ mediante Multiplicadores de Lagrange $\\nabla f = \\lambda \\nabla g$, ¿cuál es la hipótesis indispensable sobre la restricción $g$ en el punto crítico $(x_0, y_0)$?",
            "opciones": [
                "Que $\\nabla g(x_0, y_0) \\neq \\vec{0}$ (condición de calificación de restricciones o punto regular de la variedad).",
                "Que la matriz Hessiana de la restricción $\\mathcal{H}(g)$ sea estrictamente definida positiva en todo el dominio.",
                "Que el multiplicador $\\lambda$ sea un número irracional positivo para garantizar la convexidad del lagrangiano.",
                "Que la función objetivo $f(x, y)$ sea idénticamente ortogonal a las curvas de nivel de $g(x, y)$."
            ],
            "indice_correcto": 0,
            "explicacion": "El Teorema de Lagrange exige que $\\nabla g \\neq \\vec{0}$ para garantizar que el espacio tangente a la variedad esté bien definido. La opción B es innecesaria y C y D son conceptualmente erróneas."
        },
        {
            "id": 4,
            "pregunta": "Sea la ecuación diferencial lineal homogénea $y'' + P(x)y' + Q(x)y = 0$ con $P, Q$ continuas en $(a, b)$. Si el Wronskiano $W(y_1, y_2)(x_0) = 0$ para un punto $x_0 \\in (a, b)$, ¿qué se concluye rigurosamente?",
            "opciones": [
                "Por la fórmula de Abel, $W(x) = 0$ en todo $(a, b)$, y por tanto \\{y_1, y_2\\} son linealmente dependientes en $(a, b)$.",
                "Que las funciones son independientes en $(a, b)$, excepto en el conjunto discreto de ceros aislados de la función $P(x)$.",
                "Que al menos una de las soluciones diverge asintóticamente hacia el infinito en las proximidades del punto $x_0$.",
                "Que la ecuación diferencial presenta un punto singular regular en $x_0$ donde el método de Frobenius es obligatorio."
            ],
            "indice_correcto": 0,
            "explicacion": "Por la Identidad de Abel $W(x) = W(x_0)e^{-\\int_{x_0}^x P(t)dt}$, si se anula en un punto de continuidad, se anula en todo el intervalo. Las otras opciones confunden ceros del Wronskiano con singularidades."
        },
        {
            "id": 5,
            "pregunta": "Para un campo vectorial $\\vec{F} = P\\hat{i} + Q\\hat{j}$ de clase $C^1$ en una región simplemente conexa $D$, ¿cuál es la condición necesaria y suficiente para que $\\oint_C \\vec{F} \\cdot d\\vec{r} = 0$ a lo largo de cualquier curva cerrada suave $C$?",
            "opciones": [
                "Que el rotacional bidimensional sea nulo en todo $D$: $\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 0$ (campo conservativo).",
                "Que la divergencia del campo sea idénticamente nula: $\\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} = 0$ (campo solenoidal).",
                "Que el módulo del campo vectorial $\\|\\vec{F}\\|$ sea constante a lo largo de la trayectoria perimetral de la curva $C$.",
                "Que la integral de superficie del flujo a través del plano $xy$ sea igual a la circulación perimetral por el Teorema de Gauss."
            ],
            "indice_correcto": 0,
            "explicacion": "Por el Teorema de Green y la teoría de campos conservativos en regiones simplemente conexas, la condición rotacional $\\partial Q/\\partial x = \\partial P/\\partial y$ es equivalente a independencia de trayectoria. La opción B comete la confusión típica entre rotacional y divergencia."
        }
    ]

    if es_derecho:
        flashcards_demo = [
            {
                "id": 1,
                "anverso": "¿Qué es la presunción de legalidad del acto administrativo?",
                "reverso": "Es la garantía jurídica que presume que todo acto administrativo fue expedido conforme a derecho, manteniendo su vigencia y obligatoriedad mientras no sea suspendido o anulado por la jurisdicción competente.",
                "categoria": "Teoría del Acto Administrativo",
                "dificultad": dificultad
            },
            {
                "id": 2,
                "anverso": "¿En qué se diferencia el medio de control de Simple Nulidad del de Nulidad y Restablecimiento del Derecho?",
                "reverso": "La Simple Nulidad defiende la legalidad objetiva abstracta, no caduca y tiene legitimación universal. La Nulidad y Restablecimiento protege derechos subjetivos particulares y caduca a los 4 meses.",
                "categoria": "Medios de Control Contencioso",
                "dificultad": dificultad
            },
            {
                "id": 3,
                "anverso": "¿Cómo opera la causal de nulidad por Desviación de Poder?",
                "reverso": "Se configura cuando la autoridad ejerce una potestad con apego formal a la competencia legal, pero persiguiendo un propósito oculto, particular o ajeno al interés público.",
                "categoria": "Vicios de Legalidad",
                "dificultad": dificultad
            },
            {
                "id": 4,
                "anverso": "¿Cuál es la naturaleza jurídica del Silencio Administrativo Negativo?",
                "reverso": "Es una ficción procesal y garantía legal para el administrado que le permite entender denegada su solicitud para interponer recursos o demandar ante la justicia, sin relevar a la entidad de su deber de responder.",
                "categoria": "Procedimiento Administrativo",
                "dificultad": dificultad
            },
            {
                "id": 5,
                "anverso": "¿Bajo qué título de imputación opera el Daño Especial en la responsabilidad estatal?",
                "reverso": "Bajo régimen objetivo fundado en el principio de igualdad ante las cargas públicas, cuando una acción estatal legítima genera una carga anormal, grave e inequitativa a un particular.",
                "categoria": "Responsabilidad del Estado",
                "dificultad": dificultad
            },
            {
                "id": 6,
                "anverso": "¿Cuándo se produce la pérdida de fuerza ejecutoria de un acto administrativo?",
                "reverso": "Por suspensión provisional, anulación judicial, revocatoria directa, cumplimiento del plazo o condición resolutoria, o transcurso de 5 años sin ejecución administrativa.",
                "categoria": "Eficacia del Acto",
                "dificultad": dificultad
            }
        ]

        resumen_demo = {
            "titulo": f"Resumen Dogmático y Jurisprudencial: {tema}",
            "resumen_markdown": (
                f"# Resumen Especializado de Derecho Administrativo: {tema}\n\n"
                f"## 1. Fundamentos Constitucionales y Dogmática del Estado de Derecho\n"
                f"El análisis de **{tema}** se enmarca en la sujeción estricta de las autoridades al principio de legalidad, debido proceso administrativo (Art. 29 CP) y la prevalencia del interés general sobre los intereses particulares.\n\n"
                f"## 2. Estructura y Elementos de Validez del Acto Administrativo\n"
                f"- **Competencia:** Aptitud jurídica atribuida por norma expresa a la autoridad emisora.\n"
                f"- **Motivación Fáctica y Jurídica:** Exteriorización fundada de las razones de hecho y derecho que justifican la decisión.\n"
                f"- **Finalidad Pública:** Proscripción absoluta de la desviación de poder y el actuar arbitrario.\n"
                f"- **Procedimiento y Publicidad:** Trámite expedito, notificación legal y respeto a la contradicción probatoria.\n\n"
                f"## 3. Mecanismos de Control y Responsabilidad Patrimonial\n"
                f"Las decisiones de la administración son susceptibles de revisión administrativa (reposición, apelación) y control judicial ante la Jurisdicción de lo Contencioso Administrativo mediante los medios de Simple Nulidad y Nulidad y Restablecimiento del Derecho, garantizando la indemnización de perjuicios bajo regímenes objetivos y subjetivos."
            ),
            "puntos_clave": [
                f"Principio de legalidad y presunción de validez de {tema}",
                "Causales de anulación: incompetencia, falsa motivación y desviación de poder",
                "Garantías procesales, contradicción y recursos obligatorios",
                "Responsabilidad patrimonial del Estado y reparación integral"
            ],
            "formulas_o_conceptos": [
                "Presunción de Legalidad y Ejecutoriedad",
                "Medio de Control de Nulidad y Restablecimiento (Caducidad 4 meses)",
                "Responsabilidad Estatal Objetivo-Solidaria (Art. 90 CP)"
            ]
        }

        guia_demo = {
            "titulo": f"Guía Dogmática y Estudio de Casos: {tema}",
            "resumen_markdown": (
                f"# Ruta de Aprendizaje Jurídico: {tema}\n\n"
                f"### Fase 1: Identificación Normativa y Fuentes Superiores\n"
                f"Revisa los artículos constitucionales y normas del Código de Procedimiento Administrativo y de lo Contencioso Administrativo aplicables a **{tema}**.\n\n"
                f"### Fase 2: Explicación y Subsunción Típica\n"
                f"Formula la regla jurídica con tus propias palabras: 'Si se dan los supuestos de hecho X, la consecuencia jurídica que la ley impone es Y'.\n\n"
                f"### Fase 3: Análisis de Vicios y Casos Problemáticos\n"
                f"Identifica excepciones, causales de nulidad o supuestos de vulneración al debido proceso en los antecedentes fácticos.\n\n"
                f"### Fase 4: Resolución de Caso y Redacción Argumentativa\n"
                f"Aplica el test de proporcionalidad y formula la tesis defensiva o contenciosa con jurisprudencia unificada de las altas cortes."
            ),
            "puntos_clave": [
                f"Análisis hermenéutico de {tema}",
                "Identificación de causales de nulidad y recursos procedentes",
                "Construcción silogística de argumentos jurídicos",
                "Línea jurisprudencial consolidada"
            ],
            "formulas_o_conceptos": [
                "Silogismo Jurídico y Subsunción",
                "Juicio de Proporcionalidad y Razonabilidad",
                "Precedente Jurisprudencial Vinculante"
            ]
        }
    else:
        flashcards_demo = [
            {
                "id": 1,
                "anverso": f"¿Cuál es la premisa o fundamento central de '{tema}'?",
                "reverso": f"La articulación coherente entre los principios teóricos y su contrastación analítica en la disciplina de {materia}.",
                "categoria": "Fundamentos",
                "dificultad": dificultad
            },
            {
                "id": 2,
                "anverso": "¿Cómo se diferencian las variables estructurales de las accesorias?",
                "reverso": "Las estructurales determinan la validez y el comportamiento del modelo, mientras que las accesorias solo modulan aspectos secundarios.",
                "categoria": "Estructura Teórica",
                "dificultad": dificultad
            },
            {
                "id": 3,
                "anverso": "¿Por qué es crucial la contrastación de fuentes en el análisis académico?",
                "reverso": "Permite mitigar sesgos de confirmación y asegurar que las conclusiones descansen en evidencia rigurosa y verificable.",
                "categoria": "Metodología",
                "dificultad": dificultad
            },
            {
                "id": 4,
                "anverso": f"¿Qué importancia tiene el contexto de aplicación en '{tema}'?",
                "reverso": "Define los supuestos de validez y las condiciones de frontera bajo las cuales los postulados teóricos resultan aplicables.",
                "categoria": "Condiciones",
                "dificultad": dificultad
            },
            {
                "id": 5,
                "anverso": "¿Cuál es la ventaja de la recuperación activa frente a la lectura pasiva?",
                "reverso": "Estimula el esfuerzo cognitivo de evocación, consolidando la memoria a largo plazo y la capacidad de transferencia a problemas nuevos.",
                "categoria": "Ciencia del Aprendizaje",
                "dificultad": dificultad
            },
            {
                "id": 6,
                "anverso": "¿Cómo debe abordarse una contradicción o anomalía conceptual?",
                "reverso": "Sometiendo las premisas iniciales a falsación y contrastando con literatura especializada para refinar o reformular el marco teórico.",
                "categoria": "Pensamiento Crítico",
                "dificultad": dificultad
            }
        ]

        resumen_demo = {
            "titulo": f"Resumen Académico Estructurado: {tema}",
            "resumen_markdown": (
                f"# Resumen Académico: {tema}\n\n"
                f"## 1. Introducción y Contexto Disciplinar\n"
                f"El análisis riguroso de **{tema}** dentro de la disciplina de **{materia}** constituye una base fundamental para el dominio conceptual y la resolución fundamentada de problemas.\n\n"
                f"## 2. Principios y Ejes Estructurantes\n"
                f"- **Marco Conceptual Central:** Delimitación de premisas teóricas y conceptos clave.\n"
                f"- **Relaciones Causales y Metodológicas:** Articulación lógica entre causas, efectos e implicaciones prácticas.\n"
                f"- **Contrastación Crítica:** Evaluación frente a estándares académicos rigurosos.\n\n"
                f"## 3. Síntesis y Aplicación Práctica\n"
                f"El dominio de estos conceptos permite formular diagnósticos precisos, fundamentar juicios analíticos y optimizar el rendimiento en evaluaciones de nivel superior."
            ),
            "puntos_clave": [
                f"Dominio conceptual y marco teórico de {tema}",
                "Estructuración lógica de argumentos y premisas",
                "Evaluación crítica y contrastación de fuentes",
                "Transferencia práctica a casos y problemas complejos"
            ],
            "formulas_o_conceptos": [
                f"Principios Fundamentales de {materia}",
                "Criterios de Validez y Rigor Metodológico",
                "Articulación Causal y Síntesis Analítica"
            ]
        }

        guia_demo = {
            "titulo": f"Guía de Aprendizaje Activo: {tema}",
            "resumen_markdown": (
                f"# Ruta de Aprendizaje Feynman: {tema}\n\n"
                f"Esta guía aplica los 4 pasos de la **Técnica Feynman** para consolidar el dominio de **{tema}**.\n\n"
                f"### Fase 1: Delimitación del Tema\n"
                f"Identifica con precisión los 3 o 4 conceptos nucleares de **{tema}** y escribe sus definiciones con tus propias palabras.\n\n"
                f"### Fase 2: Explicación en Lenguaje Claro\n"
                f"Explica cada concepto simulando que se lo enseñas a un estudiante sin conocimientos previos. Usa analogías de la vida real.\n\n"
                f"### Fase 3: Detección y Cierre de Brechas\n"
                f"Vuelve a los materiales de estudio en aquellos puntos donde tu explicación se tornó confusa o recurrió a jerga innecesaria.\n\n"
                f"### Fase 4: Síntesis y Transferencia Práctica\n"
                f"Formula preguntas tipo examen y resuelve casos prácticos para verificar tu capacidad de aplicar el conocimiento."
            ),
            "puntos_clave": [
                f"Ruta estructurada de aprendizaje para {tema}",
                "Explicación intuitiva sin jerga técnica superficial",
                "Identificación sistemática de brechas de comprensión",
                "Práctica activa y autoevaluación deliberada"
            ],
            "formulas_o_conceptos": [
                "Técnica Feynman de Aprendizaje Profundo",
                "Práctica de Evocación Activa",
                "Resolución y Transferencia a Casos Reales"
            ]
        }

    is_math_oriented = (
        "matematica" in materia.lower()
        or "fisica" in materia.lower()
        or "calculo" in materia.lower()
        or "algebra" in materia.lower()
        or (req.dificultad and "opción 2" in req.dificultad.lower())
    )

    if tipo in ("examen", "psicopata", "psicopata_challenge"):
        return examen_matematicas_demo if is_math_oriented else examen_general_demo
    if tipo == "flashcards":
        return flashcards_demo
    if tipo == "resumen":
        return resumen_demo
    if tipo in ("pack_general", "pack1"):
        return {
            "examen": examen_general_demo,
            "flashcards": flashcards_demo,
            "resumen": resumen_demo
        }
    if tipo in ("pack_matematicas", "pack2"):
        return {
            "guia": guia_demo,
            "resumen": {
                "titulo": f"Resumen Cuantitativo con Fórmulas: {tema}",
                "resumen_markdown": (
                    f"# Resumen Cuantitativo Especializado: {tema}\n\n"
                    f"## 1. Fundamentos Matemáticos y Físicos\n"
                    f"El análisis cuantitativo de **{tema}** requiere formular relaciones funcionales exactas entre los parámetros del sistema.\n\n"
                    f"## 2. Ecuaciones Principales y Leyes de Conservación\n"
                    f"- **Principio de Conservación:** $\\iint_{{\\partial V}} \\vec{{F}} \\cdot \\hat{{n}}\\,dA = 0$ en estado estacionario.\n"
                    f"- **Gradiente y Dirección de Máxima Variación:** $\\nabla F(\\vec{{x}})$ indica la trayectoria ortogonal a las superficies de nivel.\n"
                    f"- **Análisis de Sensibilidad:** Las derivadas parciales $\\frac{{\\partial y}}{{\\partial x_i}}$ determinan el impacto de cada perturbación.\n\n"
                    f"## 3. Conclusiones y Demostraciones Clave\n"
                    f"La resolución analítica permite diseñar esquemas de control adaptativo ante condiciones transitorias con precisión matemática."
                ),
                "puntos_clave": [
                    "Rigor en formulaciones de cálculo diferencial e integral",
                    "Análisis de estado estacionario vs transitorio",
                    "Sensibilidad paramétrica y funciones de transferencia"
                ],
                "formulas_o_conceptos": [
                    "Teorema de Transporte de Reynolds",
                    "Matriz Hessiana para extremos locales: $\\det(\\mathcal{H}) > 0$",
                    "Integral de línea en campos conservativos: $\\oint_C \\vec{F} \\cdot d\\vec{r} = 0$"
                ]
            },
            "examen": examen_matematicas_demo
        }
    return guia_demo


def _mezclar_opciones_examen(contenido: Any, tipo_recurso: str) -> Any:
    """
    Baraja aleatoriamente las opciones de cada pregunta del examen
    para que la respuesta correcta quede distribuida uniformemente entre A, B, C y D (0, 1, 2, 3).
    """
    tipo = (tipo_recurso or "").lower()

    def _barajar_lista_preguntas(preguntas: list) -> list:
        if not isinstance(preguntas, list):
            return preguntas
        resultado = []
        for p in preguntas:
            if not isinstance(p, dict) or "opciones" not in p or not isinstance(p["opciones"], list):
                resultado.append(p)
                continue
            p_copia = dict(p)
            opciones = list(p["opciones"])
            idx_orig = p.get("indice_correcto", 0)
            if not (0 <= idx_orig < len(opciones)):
                idx_orig = 0
            respuesta_correcta = opciones[idx_orig]

            import random
            random.shuffle(opciones)
            p_copia["opciones"] = opciones
            p_copia["indice_correcto"] = opciones.index(respuesta_correcta)
            resultado.append(p_copia)
        return resultado

    if tipo in ("examen", "psicopata", "psicopata_challenge") and isinstance(contenido, list):
        return _barajar_lista_preguntas(contenido)
    elif isinstance(contenido, dict):
        contenido_copia = dict(contenido)
        if "examen" in contenido_copia and isinstance(contenido_copia["examen"], list):
            contenido_copia["examen"] = _barajar_lista_preguntas(contenido_copia["examen"])
        return contenido_copia
    return contenido


class AIService:
    @staticmethod
    def generar_recurso_resiliente(
        db: Session,
        req: GenerarRecursoRequest,
        user_id: Optional[int] = None
    ) -> Tuple[Any, str, int]:
        """
        Genera recursos académicos reales invocando Google Gemini API con soporte multimodal (PDF/OCR).
        Si la API está en alta demanda o agota cuota, activa el motor heurístico local garantizado.
        """
        api_key = get_gemini_api_key()
        start_time = time.time()

        # 1. Intentar localizar el documento en BD para extraer su PDF real o texto
        pdf_base64 = None
        doc = None
        doc_id = getattr(req, "documento_id", None)
        if doc_id:
            try:
                from models.repository import DocumentoRepositorio
                doc = db.query(DocumentoRepositorio).filter(DocumentoRepositorio.id_documento == doc_id).first()
            except Exception as e:
                print(f"[AIService Document Lookup by ID Error] {e}")

        if not doc and req.archivo_nombre:
            try:
                from models.repository import DocumentoRepositorio
                doc = db.query(DocumentoRepositorio).filter(DocumentoRepositorio.nombre == req.archivo_nombre).first()
            except Exception as e:
                print(f"[AIService Document Lookup by Name Error] {e}")

        if doc:
            try:
                if getattr(doc, "equipo", None) and (not req.materia or req.materia in ("General", "Repositorio Académico")):
                    req.materia = doc.equipo.nombre or doc.equipo.materia or req.materia
            except Exception as eq_err:
                print(f"[AIService Equipo Resolution Error] {eq_err}")

        if doc and doc.url_recurso:
            try:
                from services.storage_service import StorageService
                file_bytes = StorageService.get_file_bytes(doc.url_recurso)
                if file_bytes:
                    fname = (doc.nombre or "").lower()
                    formato = (doc.formato or "").lower()
                    is_pdf = fname.endswith(".pdf") or "pdf" in formato
                    is_docx = fname.endswith(".docx") or fname.endswith(".doc") or "word" in formato or "docx" in formato
                    is_pptx = fname.endswith(".pptx") or fname.endswith(".ppt") or "powerpoint" in formato or "pptx" in formato
                    is_txt = fname.endswith(".txt") or fname.endswith(".md") or "text" in formato

                    # 1. Si es PDF (Texto + OCR Multimodal para escaneos)
                    if is_pdf:
                        try:
                            import io
                            from pypdf import PdfReader
                            reader = PdfReader(io.BytesIO(file_bytes))
                            pages_txt = []
                            for p in reader.pages[:25]:
                                txt = p.extract_text()
                                if txt and txt.strip():
                                    pages_txt.append(txt.strip())
                            extracted = "\n\n".join(pages_txt).strip()
                            if extracted and len(extracted) > 60:
                                req.texto_adicional = extracted[:15000]
                                print(f"[AIService] PDF texto extraído con pypdf: {len(extracted)} caracteres")
                        except Exception as pe:
                            print(f"[pypdf extraction notice] {pe}")

                        import base64
                        if len(file_bytes) <= 15 * 1024 * 1024:
                            pdf_base64 = base64.b64encode(file_bytes).decode("utf-8")
                            print(f"[AIService] PDF adjunto preparado para Gemini Multimodal OCR ({len(file_bytes)} bytes)")

                    # 2. Si es Microsoft Word (.docx)
                    elif is_docx:
                        try:
                            import io
                            import docx
                            doc_obj = docx.Document(io.BytesIO(file_bytes))
                            paragraphs = [p.text.strip() for p in doc_obj.paragraphs if p.text and p.text.strip()]
                            for table in doc_obj.tables:
                                for row in table.rows:
                                    row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                                    if row_text:
                                        paragraphs.append(row_text)
                            extracted = "\n\n".join(paragraphs).strip()
                            if extracted:
                                req.texto_adicional = extracted[:15000]
                                print(f"[AIService] Word (.docx) texto extraído con éxito: {len(extracted)} caracteres")
                        except Exception as de:
                            print(f"[docx extraction notice] {de}")

                    # 3. Si es Microsoft PowerPoint (.pptx)
                    elif is_pptx:
                        try:
                            import io
                            from pptx import Presentation
                            prs = Presentation(io.BytesIO(file_bytes))
                            slides_text = []
                            for sIdx, slide in enumerate(prs.slides[:40]):
                                slide_parts = [f"--- Diapositiva {sIdx + 1} ---"]
                                for shape in slide.shapes:
                                    if shape.has_text_frame and shape.text_frame:
                                        for p in shape.text_frame.paragraphs:
                                            if p.text and p.text.strip():
                                                slide_parts.append(p.text.strip())
                                if len(slide_parts) > 1:
                                    slides_text.append("\n".join(slide_parts))
                            extracted = "\n\n".join(slides_text).strip()
                            if extracted:
                                req.texto_adicional = extracted[:15000]
                                print(f"[AIService] PowerPoint (.pptx) texto extraído con éxito: {len(extracted)} caracteres")
                        except Exception as pte:
                            print(f"[pptx extraction notice] {pte}")

                    # 4. Si es Texto plano (.txt / .md)
                    elif is_txt:
                        try:
                            extracted = file_bytes.decode("utf-8", errors="ignore").strip()
                            if extracted:
                                req.texto_adicional = extracted[:15000]
                                print(f"[AIService] Texto plano (.txt/.md) extraído: {len(extracted)} caracteres")
                        except Exception as te:
                            print(f"[txt extraction notice] {te}")
            except Exception as e:
                print(f"[AIService Document Fetch Error] {e}")

        if api_key:
            try:
                contenido = generar_con_gemini(req, api_key, pdf_base64=pdf_base64)
                contenido = _mezclar_opciones_examen(contenido, req.tipo_recurso)
                fuente = "gemini_api"
                elapsed_ms = int((time.time() - start_time) * 1000)
                return contenido, fuente, elapsed_ms
            except (HTTPException, Exception) as exc:
                print(f"[AIService Fallback] Activando motor académico garantizado debido a: {exc}")

        contenido = _generar_local_heuristico(req)
        contenido = _mezclar_opciones_examen(contenido, req.tipo_recurso)
        fuente = "motor_academico_dalat"
        elapsed_ms = int((time.time() - start_time) * 1000)
        return contenido, fuente, elapsed_ms
