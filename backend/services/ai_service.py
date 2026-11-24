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


def generar_con_gemini(req: GenerarRecursoRequest, api_key: str) -> Any:
    """
    Invoca la API de Google Gemini (gemini-1.5-flash / gemini-2.0-flash / gemini-2.5-flash)
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
        contexto_prompt = f"\nUsa prioritariamente el siguiente material o texto de estudio como base:\n---\n{contexto[:5000]}\n---\n"

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
        "gemini-flash-lite-latest",
        "gemini-3.8-flash",
        "gemini-3-flash-preview",
        "gemini-flash-latest",
    ]
    last_error = None
    had_high_demand = False

    for model_name in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
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

    examen_general_demo = [
        {
            "id": 1,
            "pregunta": f"En el análisis estructural de '{tema}', ¿cuál es la razón fundamental por la que optimizar variables locales de forma aislada puede comprometer el rendimiento global del sistema?",
            "opciones": [
                "Porque los acoplamientos y dependencias no lineales entre subsistemas pueden desplazar el cuello de botella hacia componentes críticos no monitoreados.",
                "Porque la tasa de variación temporal de las variables de estado siempre se anula en ausencia de perturbaciones estocásticas externas.",
                "Porque los modelos deterministas exigen que todas las funciones de transferencia presenten simetría puntual respecto al origen.",
                "Porque la varianza residual del sistema se amplifica únicamente cuando los parámetros operativos operan en estado estacionario."
            ],
            "indice_correcto": 0,
            "explicacion": "En sistemas complejos, las interacciones cruzadas hacen que una optimización local subóptima desplace restricciones críticas. Las opciones B, C y D representan confusiones teóricas comunes sobre invariancia y estado estacionario."
        },
        {
            "id": 2,
            "pregunta": f"Al contrastar un modelo predictivo de '{tema}' con datos experimentales en {materia}, ¿qué fenómeno revela típicamente una alta correlación R² acompañada de un elevado error de generalización en validación cruzada?",
            "opciones": [
                "Sobreajuste (overfitting) debido a la sobreparametrización del modelo frente a la dimensionalidad real de la muestra.",
                "Subajuste severo (underfitting) ocasionado por una excesiva regularización de los coeficientes de regresión.",
                "Colinealidad perfecta entre variables independientes que anula el sesgo intrínseco del estimador.",
                "Convergencia asintótica prematura del algoritmo de optimización hacia un punto de ensilladura."
            ],
            "indice_correcto": 0,
            "explicacion": "Un R² elevado en entrenamiento con baja capacidad de generalización es el síntoma clásico de sobreajuste. La opción B afirma lo opuesto, mientras que C y D aluden a patologías numéricas distintas."
        },
        {
            "id": 3,
            "pregunta": f"Bajo qué criterio se valida rigurosamente la estabilidad de un proceso continuo en '{tema}' ante perturbaciones transitorias?",
            "opciones": [
                "Demostrando que la función de Lyapunov asociada posee derivada temporal semidefinida negativa en la región de atracción.",
                "Comprobando que la respuesta al escalón unitario alcance su valor asintótico en un tiempo estrictamente inferior a la constante de tiempo.",
                "Verificando que la matriz de covarianza de las perturbaciones tenga traza estrictamente nula en el régimen permanente.",
                "Asumiendo que las fluctuaciones de alta frecuencia son filtradas de manera pasiva sin amortiguamiento viscoso."
            ],
            "indice_correcto": 0,
            "explicacion": "El segundo método de Lyapunov es el criterio analítico definitivo de estabilidad asintótica. La opción B confunde rapidez de respuesta con estabilidad, y C confunde ruido con propiedades dinámicas del sistema."
        },
        {
            "id": 4,
            "pregunta": f"¿Cuál es el trade-off técnico fundamental al implementar un esquema de control predictivo o adaptativo en '{tema}'?",
            "opciones": [
                "El balance entre la velocidad de convergencia ante cambios dinámicos y la robustez frente a incertidumbre en los parámetros del modelo.",
                "El compromiso entre la reducción de costos energéticos y la eliminación absoluta de retardos de transporte en la planta.",
                "La disyuntiva entre linealizar el sistema en torno a un punto de operación o prescindir de sensores de retroalimentación.",
                "La tensión entre aumentar la frecuencia de muestreo y garantizar que la entropía del controlador permanezca constante."
            ],
            "indice_correcto": 0,
            "explicacion": "El compromiso clásico en control avanzado es velocidad versus robustez ante incertidumbre del modelo. Las opciones B, C y D proponen premisas técnicamente inválidas o incompatibles con la teoría de control."
        },
        {
            "id": 5,
            "pregunta": f"Al analizar la sensibilidad paramétrica en '{tema}', ¿qué indica un coeficiente de elasticidad normalizado mayor a la unidad?",
            "opciones": [
                "Que una variación porcentual en el parámetro genera un cambio porcentual amplificado en la respuesta (comportamiento elástico).",
                "Que el parámetro evaluado es invariante y no ejerce influencia significativa sobre el régimen dinámico de la variable.",
                "Que la función de respuesta presenta una discontinuidad esencial de primera especie en el punto de evaluación nominal.",
                "Que el sistema es estrictamente disipativo y disipa energía proporcionalmente al cuadrado de la perturbación inicial."
            ],
            "indice_correcto": 0,
            "explicacion": "Una elasticidad o sensibilidad normalizada mayor a 1 implica que las perturbaciones en el parámetro se amplifican en la salida. La opción B confunde alta sensibilidad con invariancia, y C y D son conceptos matemáticos mal aplicados."
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

    flashcards_demo = [
        {
            "id": 1,
            "anverso": f"¿Qué principio fundamental rige {tema}?",
            "reverso": f"La optimización de variables y el control de parámetros críticos dentro de {materia}.",
            "categoria": "Fundamento",
            "dificultad": dificultad
        },
        {
            "id": 2,
            "anverso": "¿Cómo se define la eficiencia de un modelo operativo?",
            "reverso": "La relación entre el rendimiento obtenido y los recursos o energía invertidos.",
            "categoria": "Optimización",
            "dificultad": dificultad
        },
        {
            "id": 3,
            "anverso": "¿Por qué es crucial la evaluación continua de brechas de conocimiento?",
            "reverso": "Permite detectar inconsistencias antes de abordar problemas complejos de nivel avanzado.",
            "categoria": "Metodología",
            "dificultad": dificultad
        },
        {
            "id": 4,
            "anverso": f"¿Qué rol juega el contexto en el análisis de {tema}?",
            "reverso": "Define las restricciones de frontera y los supuestos bajo los cuales el modelo es válido.",
            "categoria": "Condiciones",
            "dificultad": dificultad
        },
        {
            "id": 5,
            "anverso": "¿Cuál es la ventaja de la práctica activa frente al repaso pasivo?",
            "reverso": "Estimula el esfuerzo cognitivo, fortaleciendo la recuperación de información a largo plazo.",
            "categoria": "Didáctica",
            "dificultad": dificultad
        },
        {
            "id": 6,
            "anverso": "¿Cómo se interpretan las anomalías en un conjunto de datos?",
            "reverso": "Como indicadores de fallas de calibración o fenómenos no contemplados en el modelo inicial.",
            "categoria": "Análisis Crítico",
            "dificultad": dificultad
        }
    ]

    resumen_demo = {
        "titulo": f"Resumen General de Alto Rendimiento: {tema}",
        "resumen_markdown": (
            f"# Resumen General: {tema}\n\n"
            f"## 1. Introducción y Contexto\n"
            f"El estudio de **{tema}** dentro de la disciplina de **{materia}** constituye un pilar esencial para la comprensión holística de los procesos analíticos.\n\n"
            f"## 2. Pilares y Conceptos Fundamentales\n"
            f"- **Identificación de Variables:** Separación rigurosa entre variables dependientes e independientes.\n"
            f"- **Control de Parámetros:** Mitigación de factores de perturbación y ruido experimental.\n"
            f"- **Evaluación de Rendimiento:** Medición constante de tasas de convergencia y eficiencia.\n\n"
            f"## 3. Síntesis y Aplicación Práctica\n"
            f"La implementación adecuada de estos conceptos asegura una toma de decisiones informada, reduciendo la incertidumbre operativa y maximizando la retención del estudiante."
        ),
        "puntos_clave": [
            f"Dominio conceptual de {tema}",
            "Control y calibración de parámetros",
            "Evaluación empírica y contrastación de resultados",
            "Optimización de recursos y mitigación de cuellos de botella"
        ],
        "formulas_o_conceptos": [
            f"Principio de Eficiencia en {materia}",
            "Tasa de transferencia operativa",
            "Condiciones de frontera y convergencia"
        ]
    }

    guia_demo = {
        "titulo": f"Guía de Estudio Paso a Paso: {tema}",
        "resumen_markdown": (
            f"# Ruta de Aprendizaje Activo Feynman: {tema}\n\n"
            f"Esta guía aplica la **Técnica Feynman** para desglosar los componentes conceptuales y operativos de **{tema}** con el máximo rigor pedagógico.\n\n"
            f"### Fase 1: Selección y Estudio Inicial\n"
            f"Identifica los pilares cuantitativos fundamentales de **{tema}**. Analiza las variables de estado, los vectores de flujo y las ecuaciones o principios que gobiernan el sistema.\n\n"
            f"### Fase 2: Explicación Simplificada\n"
            f"Explica el fenómeno como si se lo enseñaras a un estudiante principiante. Usa analogías intuitivas: cualquier acumulación interna equivale a la diferencia entre entradas y salidas menos pérdidas energéticas.\n\n"
            f"### Fase 3: Identificación de Brechas\n"
            f"Examina los datos numéricos y las condiciones de contorno. ¿Puedes justificar dimensionalmente cada término del problema? Verifica casos límite y anomalías.\n\n"
            f"### Fase 4: Refinamiento y Analogía\n"
            f"Conecta los principios teóricos con aplicaciones reales de ingeniería y optimización, asegurando un aprendizaje duradero y alta capacidad de resolución."
        ),
        "puntos_clave": [
            f"Modelado sistemático de {tema}",
            "Técnica Feynman en 4 fases de dominio",
            "Análisis dimensional y casos límite",
            "Ecuaciones de balance y conservación"
        ],
        "formulas_o_conceptos": [
            "Ecuación de Continuidad y Balance: dM/dt = In - Out",
            "Ley de Transferencia Térmica / Fricción: Q = -k * A * (dT/dx)",
            "Optimización y Extremos Locales"
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
        Genera recursos académicos reales invocando Google Gemini API.
        Si la API está en alta demanda o agota cuota, activa el motor heurístico local garantizado.
        """
        api_key = get_gemini_api_key()
        start_time = time.time()

        if api_key:
            try:
                contenido = generar_con_gemini(req, api_key)
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
