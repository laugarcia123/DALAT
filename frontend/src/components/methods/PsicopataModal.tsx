"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { repositoryService, DocumentoItem, EquipoItem } from "@/services/repositoryService";
import { studySessionService } from "@/services/studySessionService";
import { aiService } from "@/services/aiService";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
  Flame,
  Trophy,
  ShieldAlert,
  Zap,
  Maximize2,
  Minimize2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Skull,
  FileText,
  Check,
  AlertTriangle,
  UploadCloud,
  Target,
  ChevronRight,
  RefreshCw,
  Award,
  Search,
  Lock,
  XCircle,
  Coins,
  Folder,
  Users,
  Link2,
  FileArchive,
  Info,
} from "lucide-react";
import {
  getCreditsByFileSize,
  getFileTierInfo,
  DALAT_FILE_CREDIT_TIERS,
} from "@/lib/creditRules";

interface PsicopataModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
  isPro?: boolean;
  onGoToCheckout?: () => void;
  tokensBalance?: number;
  onDeductTokens?: (amount: number) => Promise<number> | void;
  onSessionCompleted?: () => void;
}

export interface MaterialFile {
  id: string;
  backendDocId?: number;
  name: string;
  subject: string;
  size: string;
  type: "pdf" | "docx" | "txt" | "ppt" | "link" | "zip";
  isLink?: boolean;
  isArchive?: boolean;
  isLocal?: boolean;
  previewText?: string;
}

const DEFAULT_MATERIALS: MaterialFile[] = [];

interface FlashcardQuestion {
  id: number;
  pregunta: string;
  opciones: string[];
  indice_correcto: number;
  explicacion: string;
  tema?: string;
}

// Costo de tokens según la meta de flashcards consecutivas
export const PSICOPATA_TOKEN_COST: Record<20 | 35 | 50, number> = {
  20: 2,
  35: 3,
  50: 5,
};

// Componente SVG: Cuchillo / Daga táctica
export function TacticalKnifeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bladeSteel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="bladeBevel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="handleGrip" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="50%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
      </defs>
      <path
        d="M24 2 C25 25, 29 55, 30 75 L18 75 C19 55, 23 25, 24 2 Z"
        fill="url(#bladeSteel)"
        stroke="#475569"
        strokeWidth="1.2"
      />
      <path d="M24 2 L24 75" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
      <path d="M24 2 C24.5 25, 27 55, 30 75 L24 75 Z" fill="url(#bladeBevel)" />
      <rect x="12" y="75" width="24" height="6" rx="2.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
      <rect x="18" y="81" width="12" height="32" rx="3" fill="url(#handleGrip)" stroke="#09090b" strokeWidth="1" />
      <line x1="18" y1="87" x2="30" y2="87" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="18" y1="94" x2="30" y2="94" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="18" y1="101" x2="30" y2="101" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="18" y1="108" x2="30" y2="108" stroke="#3f3f46" strokeWidth="1.5" />
      <circle cx="24" cy="116" r="3" fill="#475569" stroke="#1e293b" strokeWidth="1" />
    </svg>
  );
}

// Componente SVG: Gotas y derramamiento de sangre para la base
export function BloodDripSvg({ className = "w-full h-8" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 500 40"
        preserveAspectRatio="none"
        className="w-full h-full fill-red-700/90 dark:fill-red-600/90 drop-shadow-[0_2px_6px_rgba(220,38,38,0.6)]"
      >
        <defs>
          <linearGradient id="bloodWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="25%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="75%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* Manto de sangre con ondulaciones y gotas colgantes */}
        <path
          fill="url(#bloodWaveGrad)"
          d="
            M 0,0 
            L 0,6 
            Q 18,16 35,8 
            Q 50,0 65,12 
            C 72,24 82,24 88,10 
            Q 105,2 120,14 
            C 126,28 138,32 144,16 
            Q 158,4 175,10 
            Q 192,18 205,8 
            C 215,26 228,34 235,14 
            Q 250,2 270,12 
            C 278,28 290,30 296,16 
            Q 312,2 330,12 
            Q 348,22 360,10 
            C 368,26 380,30 388,14 
            Q 405,2 422,12 
            C 432,24 442,26 448,12 
            Q 465,0 482,10 
            L 500,4 
            L 500,0 
            Z
          "
        />

        {/* Gotas a punto de caer */}
        <circle cx="132" cy="34" r="2.5" fill="#ef4444" className="animate-pulse" />
        <circle cx="221" cy="36" r="2.8" fill="#dc2626" />
        <circle cx="284" cy="33" r="2.2" fill="#ef4444" />
        <circle cx="374" cy="34" r="2.4" fill="#dc2626" className="animate-pulse" />
      </svg>
    </div>
  );
}

// Generador integral de preguntas académicas para el Método Psicópata (hasta 50 preguntas únicas por materia)
function generatePsicopataQuestions(
  material: MaterialFile,
  count: 20 | 35 | 50
): FlashcardQuestion[] {
  const subj = (material.subject || "").toLowerCase();
  const name = (material.name || "").toLowerCase();

  // Banco de cálculo y matemáticas avanzadas
  const calculusBank: Omit<FlashcardQuestion, "id">[] = [
    {
      pregunta: "¿Qué representa geométricamente una integral doble ∬_R f(x,y) dA cuando f(x,y) ≥ 0?",
      opciones: [
        "El volumen del sólido bajo la superficie z = f(x,y) sobre la región R",
        "El área superficial total de la región plana R",
        "La longitud de arco de la curva de nivel más alta",
        "La derivada direccional en el vector gradiente",
      ],
      indice_correcto: 0,
      explicacion: "Una integral doble de una función no negativa f(x,y) sobre R calcula el volumen exacto bajo la superficie.",
    },
    {
      pregunta: "En coordenadas polares, ¿cuál es el factor de escala (Jacobiano) diferencial de área dA?",
      opciones: [
        "r dr dθ",
        "dr dθ",
        "r² dr dθ",
        "(1/r) dr dθ",
      ],
      indice_correcto: 0,
      explicacion: "El determinante del Jacobiano al transformar a polares es r, por tanto dA = r dr dθ.",
    },
    {
      pregunta: "¿Qué establece el Teorema de Fubini para integrales iteradas?",
      opciones: [
        "Si f(x,y) es continua en un rectángulo R, el orden de integración no altera el resultado",
        "Toda integral múltiple converge a cero si la región es cerrada",
        "La derivada de una integral es siempre igual al integrando evaluado en el borde",
        "El volumen bajo cualquier esfera es exactamente 4/3 π r³",
      ],
      indice_correcto: 0,
      explicacion: "Fubini garantiza que ∬ f(x,y) dx dy = ∬ f(x,y) dy dx cuando f es continua en la región.",
    },
    {
      pregunta: "¿Cuál es el vector gradiente ∇f(x,y) en un punto (a,b)?",
      opciones: [
        "El vector de derivadas parciales [∂f/∂x, ∂f/∂y] que apunta en la dirección de máximo crecimiento",
        "Un escalar que mide la curvatura de la superficie",
        "El vector perpendicular a la recta tangente en 2 dimensiones",
        "La matriz de segundas derivadas parciales cruzadas",
      ],
      indice_correcto: 0,
      explicacion: "El gradiente [fx, fy] apunta en la dirección de máxima tasa de incremento de la función.",
    },
    {
      pregunta: "Para calcular el área de una región plana D usando una integral doble, ¿cuál debe ser la función integrando f(x,y)?",
      opciones: [
        "f(x,y) = 1",
        "f(x,y) = x² + y²",
        "f(x,y) = 0",
        "f(x,y) = x · y",
      ],
      indice_correcto: 0,
      explicacion: "Cuando el integrando es 1, la integral doble ∬_D 1 dA calcula exactamente el área bidimensional de D.",
    },
    {
      pregunta: "Si el determinante Hessiano D = f_xx f_yy - (f_xy)² es menor que 0 en un punto crítico, ¿qué tipo de punto es?",
      opciones: [
        "Punto de silla (saddle point)",
        "Mínimo local estricto",
        "Máximo local estricto",
        "El criterio no concluye",
      ],
      indice_correcto: 0,
      explicacion: "Cuando D < 0, la superficie se dobla en sentidos opuestos, clasificándose como punto de silla.",
    },
    {
      pregunta: "¿Cuál es el Jacobiano de transformación para coordenadas esféricas (ρ, θ, φ)?",
      opciones: [
        "ρ² sen(φ)",
        "ρ sen(θ)",
        "ρ² cos(φ)",
        "ρ cos(θ) sen(φ)",
      ],
      indice_correcto: 0,
      explicacion: "En esféricas dV = ρ² sen(φ) dρ dθ dφ, siendo ρ² sen(φ) el factor de volumen diferencial.",
    },
    {
      pregunta: "¿Qué postula el Teorema de Green en el plano?",
      opciones: [
        "Relaciona una integral de línea sobre una curva cerrada con una integral doble sobre la región encerrada",
        "Afirma que la divergencia de un rotacional siempre es 1",
        "Permite calcular límites indeterminados de funciones multivariables",
        "Define la regla de la cadena para funciones implícitas",
      ],
      indice_correcto: 0,
      explicacion: "Green conecta la integral de línea de frontera ∮ (P dx + Q dy) con la integral doble de (∂Q/∂x - ∂P/∂y).",
    },
    {
      pregunta: "¿Cuándo se dice que un campo vectorial F es conservativo?",
      opciones: [
        "Cuando existe una función potencial f tal que F = ∇f (su rotacional es cero)",
        "Cuando la integral a lo largo de cualquier camino abierto es siempre constante",
        "Cuando la magnitud de sus vectores no cambia con el tiempo",
        "Cuando su divergencia es igual a su norma euclidiana",
      ],
      indice_correcto: 0,
      explicacion: "Un campo conservativo es el gradiente de una función potencial y su integral de línea es independiente de la trayectoria.",
    },
    {
      pregunta: "¿Qué representa la divergencia de un campo vectorial div(F) en un punto?",
      opciones: [
        "La tasa neta de flujo que sale o entra por unidad de volumen (fuente o sumidero)",
        "La velocidad de rotación angular del fluido alrededor de un eje",
        "La distancia mínima a la superficie equipotencial",
        "La aceleración tangencial de una partícula en el campo",
      ],
      indice_correcto: 0,
      explicacion: "div(F) = ∇ · F mide la densidad de generación de flujo por unidad de volumen.",
    },
  ];

  // Banco de Economía y Finanzas
  const economicsBank: Omit<FlashcardQuestion, "id">[] = [
    {
      pregunta: "¿Qué significa que la elasticidad precio de la demanda sea |ε| = 1.8?",
      opciones: [
        "Demanda elástica: una subida del 1% en el precio reduce la cantidad demandada en 1.8%",
        "Demanda inelástica: los consumidores compran lo mismo sin importar el precio",
        "Demanda perfectamente unitaria: el ingreso total se mantiene constante",
        "Bien inferior: ante mayor ingreso se consume menos",
      ],
      indice_correcto: 0,
      explicacion: "Cuando |ε| > 1, el cambio porcentual de la cantidad supera al del precio (demanda elástica).",
    },
    {
      pregunta: "¿Cuál es la condición fundamental de maximización de beneficios para cualquier empresa?",
      opciones: [
        "Ingreso Marginal igual a Costo Marginal (IMg = CMg)",
        "Precio igual a Costo Fijo Medio",
        "Ingreso Total igual a Costo Total",
        "Costo Variable Medio en su punto máximo",
      ],
      indice_correcto: 0,
      explicacion: "La regla de oro de la optimización empresarial exige producir donde IMg = CMg.",
    },
    {
      pregunta: "¿Qué es el Excedente del Consumidor en el análisis de mercado?",
      opciones: [
        "La diferencia entre lo que los consumidores estaban dispuestos a pagar y lo que realmente pagaron",
        "El inventario no vendido al final del período contable",
        "El subsidio directo que entrega el gobierno a los compradores",
        "La ganancia neta de las empresas monopolistas",
      ],
      indice_correcto: 0,
      explicacion: "Es el área bajo la curva de demanda y por encima del precio de equilibrio de mercado.",
    },
    {
      pregunta: "En competencia perfecta, ¿a qué es igual el Precio (P) en el equilibrio de largo plazo?",
      opciones: [
        "P = CMg = CMeT mínimo (beneficios económicos nulos)",
        "P = Costo Fijo Total",
        "P = 2 × Ingreso Marginal",
        "P = Mayor que el costo marginal con margen monopólico",
      ],
      indice_correcto: 0,
      explicacion: "A largo plazo en competencia perfecta la libre entrada elimina beneficios extraordinarios (P = CMeT mín).",
    },
    {
      pregunta: "¿Cuál es la definición de Costo de Oportunidad?",
      opciones: [
        "El valor de la mejor alternativa a la que se renuncia al tomar una decisión",
        "El costo monetario visible en la factura contable",
        "El descuento financiero obtenido por pronto pago",
        "La depreciación acumulada de un activo fijo",
      ],
      indice_correcto: 0,
      explicacion: "El costo de oportunidad evalúa el rendimiento sacrificado de la segunda mejor opción no elegida.",
    },
    {
      pregunta: "¿Qué caracteriza a un Monopolio Natural?",
      opciones: [
        "Economías de escala continuas donde una sola empresa abastece todo el mercado a menor costo que varias",
        "Propiedad exclusiva de un yacimiento petrolero por ley gubernamental",
        "Empresas que producen únicamente bienes de origen orgánico o agrícola",
        "Mercados donde no existen barreras de entrada ni costos fijos",
      ],
      indice_correcto: 0,
      explicacion: "Un monopolio natural surge por altos costos fijos y costos medios decrecientes (ej. redes eléctricas o agua).",
    },
    {
      pregunta: "¿Qué expresa la Ley de Rendimientos Decrecientes?",
      opciones: [
        "Al añadir unidades sucesivas de un factor variable a factores fijos, el producto marginal finalmente decae",
        "A mayor producción, los costos fijos totales siempre aumentan exponencialmente",
        "Los precios de mercado caen a medida que el salario mínimo sube",
        "Toda inversión en bolsa pierde valor después de 5 años",
      ],
      indice_correcto: 0,
      explicacion: "Con al menos un factor fijo (ej. tierra o planta), agregar más trabajadores genera aumentos marginales decrecientes.",
    },
    {
      pregunta: "¿Qué es la Pérdida Irrecuperable de Eficiencia (Deadweight Loss)?",
      opciones: [
        "La pérdida de excedente total provocada por distorsiones como impuestos, cuotas o monopolios",
        "El dinero gastado en publicidad que no genera ventas",
        "El pago de intereses sobre deudas incobrables",
        "La reducción del PIB originada por vacaciones laborales",
      ],
      indice_correcto: 0,
      explicacion: "Representa el bienestar económico que ni consumidores ni productores capturan debido a una ineficiencia.",
    },
  ];

  // Banco de Física e Ingeniería
  const physicsBank: Omit<FlashcardQuestion, "id">[] = [
    {
      pregunta: "Según la Segunda Ley de Newton, ¿cuál es la relación entre fuerza neta, masa y aceleración?",
      opciones: [
        "ΣF = m · a (la aceleración es directamente proporcional a la fuerza e inversamente a la masa)",
        "ΣF = m / a²",
        "ΣF = 1/2 m · v²",
        "ΣF = m · g · h",
      ],
      indice_correcto: 0,
      explicacion: "La segunda ley establece la ecuación vectorial fundamental de la dinámica clásica: F = m · a.",
    },
    {
      pregunta: "¿Bajo qué condición se conserva el momentum lineal (cantidad de movimiento) de un sistema?",
      opciones: [
        "Cuando la fuerza externa neta que actúa sobre el sistema es igual a cero (ΣF_ext = 0)",
        "Solo si no existe fricción estática entre las superficies",
        "Cuando todas las colisiones son perfectamente elásticas",
        "Únicamente en el vacío espacial sin gravedad",
      ],
      indice_correcto: 0,
      explicacion: "Si no hay fuerzas externas netas, la derivada temporal del momento total es cero (se conserva).",
    },
    {
      pregunta: "¿Qué establece el Teorema del Trabajo y la Energía Cinética?",
      opciones: [
        "El trabajo neto realizado por todas las fuerzas es igual al cambio en la energía cinética (W_neto = ΔK)",
        "La energía potencial gravitatoria siempre es igual a la masa por la velocidad",
        "El trabajo realizado por fuerzas conservativas siempre es positivo",
        "La potencia disipada equivale al calor absorbido dividido por el tiempo",
      ],
      indice_correcto: 0,
      explicacion: "W_neto = Kf - Ki: toda aceleración resultante de fuerzas netas modifica la energía cinética.",
    },
    {
      pregunta: "¿Cuál es la unidad del Sistema Internacional para la energía y el trabajo?",
      opciones: [
        "Joule (J) = N · m = kg · m² / s²",
        "Watt (W) = J / s",
        "Pascal (Pa) = N / m²",
        "Newton (N) = kg · m / s",
      ],
      indice_correcto: 0,
      explicacion: "El Joule es la unidad estándar de trabajo y energía en el Sistema Internacional.",
    },
    {
      pregunta: "¿Qué ocurre con la energía mecánica total en presencia de fuerzas no conservativas (como la fricción)?",
      opciones: [
        "Parte de la energía mecánica se transforma en energía térmica/calor (ΔE_mec = W_no_cons)",
        "La energía total del universo desaparece por completo",
        "La masa del objeto disminuye en proporción a la velocidad",
        "La aceleración de la gravedad se incrementa instantáneamente",
      ],
      indice_correcto: 0,
      explicacion: "La fricción realiza trabajo negativo que disipa energía mecánica en forma de calor.",
    },
    {
      pregunta: "En un Movimiento Armónico Simple (MAS), ¿dónde es máxima la aceleración del oscilador?",
      opciones: [
        "En los extremos de máxima amplitud (donde el desplazamiento x = ±A)",
        "En el punto de equilibrio central (x = 0)",
        "Exactamente a la mitad de la amplitud (x = A/2)",
        "La aceleración es constante durante todo el ciclo",
      ],
      indice_correcto: 0,
      explicacion: "Como a = -ω² x, la aceleración alcanza su valor máximo en los extremos de desplazamiento.",
    },
  ];

  // Banco de Sistemas y Computación
  const csBank: Omit<FlashcardQuestion, "id">[] = [
    {
      pregunta: "¿Cuál es la complejidad temporal promedio de búsqueda en una Tabla Hash (Hash Map)?",
      opciones: [
        "O(1) tiempo constante",
        "O(n) tiempo lineal",
        "O(log n) tiempo logarítmico",
        "O(n²) tiempo cuadrático",
      ],
      indice_correcto: 0,
      explicacion: "Con una buena función hash y baja tasa de colisiones, el acceso promedio es O(1).",
    },
    {
      pregunta: "¿Qué estructura de datos opera bajo el principio LIFO (Last In, First Out)?",
      opciones: [
        "Pila (Stack)",
        "Cola (Queue)",
        "Árbol Binario de Búsqueda (BST)",
        "Grafo Dirigido Acíclico (DAG)",
      ],
      indice_correcto: 0,
      explicacion: "Una Pila procesa primero el último elemento apilado (LIFO), mientras que una Cola es FIFO.",
    },
    {
      pregunta: "¿Qué garantiza el algoritmo Dijkstra en teoría de grafos?",
      opciones: [
        "Encuentra el camino más corto desde un nodo origen a todos los demás con pesos no negativos",
        "Ordena topológicamente los nodos de un grafo con ciclos negativos",
        "Calcula el flujo máximo en una red de transporte de datos",
        "Detecta componentes fuertemente conexos en tiempo O(V³)",
      ],
      indice_correcto: 0,
      explicacion: "Dijkstra es el algoritmo óptimo para caminos mínimos con aristas de peso mayor o igual a cero.",
    },
    {
      pregunta: "¿Qué principio de la programación orientada a objetos promueve que una clase tenga una única razón para cambiar?",
      opciones: [
        "Single Responsibility Principle (S de SOLID)",
        "Open/Closed Principle (O de SOLID)",
        "Liskov Substitution Principle (L de SOLID)",
        "Interface Segregation Principle (I de SOLID)",
      ],
      indice_correcto: 0,
      explicacion: "El Principio de Responsabilidad Única prescribe que cada módulo o clase debe encargarse de una sola funcionalidad.",
    },
  ];

  // Banco de Fundamentos Universitarios y Pensamiento Crítico (Humanidades, Metodología, Ciencias Sociales y Salud)
  const universityTheoryBank: Omit<FlashcardQuestion, "id">[] = [
    {
      pregunta: "¿Cuál es la distinción epistemológica central entre el falsacionismo popperiano y el inductivismo clásico?",
      opciones: [
        "Una teoría científica nunca puede verificarse de forma definitiva, únicamente refutarse mediante contrastación empírica",
        "El conocimiento avanza acumulando observaciones particulares sin necesidad de hipótesis previas",
        "Toda proposición científica debe ser demostrable mediante inducción probabilística infalible",
        "La ciencia se fundamenta exclusivamente en juicios sintéticos a priori indemostrables",
      ],
      indice_correcto: 0,
      explicacion: "Karl Popper demostró que ninguna cantidad de casos favorables verifica una ley universal, pero una sola refutación la invalida.",
    },
    {
      pregunta: "En metodología de investigación, ¿qué define la validez interna de un diseño experimental?",
      opciones: [
        "El grado de certeza con que la variación observada en la variable dependiente es atribuible únicamente a la independiente",
        "La capacidad de extrapolar los hallazgos a toda la población diana sin sesgo muestral",
        "La concordancia temporal entre dos mediciones sucesivas aplicadas al mismo sujeto",
        "La consistencia interna de los ítems evaluada mediante el coeficiente Alfa de Cronbach",
      ],
      indice_correcto: 0,
      explicacion: "La validez interna garantiza el control riguroso de variables extrañas y confirma causalidad directa en el estudio.",
    },
    {
      pregunta: "¿Qué caracteriza al concepto de 'paradigma científico' formulado por Thomas Kuhn?",
      opciones: [
        "Un marco conceptual, metodológico y de valores compartido por una comunidad científica que guía la ciencia normal",
        "Una hipótesis cuantitativa que ha resistido más de un siglo de pruebas de laboratorio",
        "El método experimental inductivo empleado exclusivamente en las ciencias duras",
        "La suma lineal y continua de todos los descubrimientos acumulados a lo largo de la historia",
      ],
      indice_correcto: 0,
      explicacion: "Kuhn define el paradigma como el consenso de supuestos teóricos y métodos que rige hasta la aparición de anomalías y crisis.",
    },
    {
      pregunta: "En ética normativa, ¿cuál es el postulado definitorio del deontologismo kantiano?",
      opciones: [
        "La moralidad de una acción radica en el cumplimiento del deber por respeto al imperativo categórico, no en sus consecuencias",
        "Una acción es correcta si y solo si maximiza la felicidad neta para el mayor número de personas afectadas",
        "El bien moral está determinado por el florecimiento de virtudes y el hábito del término medio aristotélico",
        "Los juicios morales son meras proyecciones emotivas carentes de verdad o validez universal",
      ],
      indice_correcto: 0,
      explicacion: "Para Kant, el valor moral de un acto emana de la buena voluntad y el deber categórico, independientemente de los resultados.",
    },
    {
      pregunta: "¿Qué establece el principio de contradicción como axioma lógico fundamental?",
      opciones: [
        "Es imposible que una proposición sea verdadera y falsa al mismo tiempo y en el mismo sentido: ¬(P ∧ ¬P)",
        "Toda afirmación requiere una causa suficiente demostrada empíricamente",
        "Si dos premisas son contingentes, la conclusión necesariamente debe ser verdadera",
        "Cualquier juicio sintético es deducible a partir de sus propiedades semánticas intrínsecas",
      ],
      indice_correcto: 0,
      explicacion: "El principio aristotélico de no contradicción sostiene que una entidad no puede poseer y no poseer un atributo simultáneamente.",
    },
    {
      pregunta: "En el análisis de políticas públicas e instituciones, ¿qué define el concepto de 'Path Dependence' (dependencia del camino)?",
      opciones: [
        "Las decisiones y estructuras institucionales del pasado constriñen y determinan las trayectorias y alternativas viables presentes",
        "La obligación constitucional de someter cada ley a consulta popular obligatoria",
        "El principio administrativo según el cual los presupuestos deben incrementarse a tasa constante",
        "La teoría que postula que las instituciones convergen automáticamente hacia el óptimo económico de Pareto",
      ],
      indice_correcto: 0,
      explicacion: "La dependencia del camino demuestra cómo los costos de transición refuerzan patrones institucionales históricos previos.",
    },
    {
      pregunta: "¿En qué consiste el sesgo cognitivo de confirmación en el razonamiento crítico?",
      opciones: [
        "La tendencia sistemática a buscar, interpretar y recordar información que respalda las hipótesis previas propias",
        "La sobreestimación de la probabilidad de eventos basada en la facilidad para recordar ejemplos vívidos",
        "La creencia infundada de que los resultados pasados aleatorios influyen en eventos futuros independientes",
        "La atribución de éxitos a causas internas y fracasos a factores externos circunstanciales",
      ],
      indice_correcto: 0,
      explicacion: "El sesgo de confirmación distorsiona la evaluación objetiva al filtrar evidencias contrarias a las creencias del analista.",
    },
    {
      pregunta: "¿Qué diferencia medular existe entre un enfoque de investigación cualitativo y uno cuantitativo?",
      opciones: [
        "El cualitativo busca comprender significados, contextos y fenómenos en profundidad; el cuantitativo mide variables y prueba hipótesis estadísticas",
        "El cualitativo siempre carece de rigor científico, mientras que el cuantitativo es infalible",
        "El cualitativo se restringe únicamente al análisis lingüístico de obras literarias antiguas",
        "El cuantitativo no utiliza datos empíricos ni recolección de muestras observacionales",
      ],
      indice_correcto: 0,
      explicacion: "La distinción reside en el propósito ontológico y metodológico: comprensión hermenéutica contextual vs. contrastación probabilística.",
    },
  ];

  // Seleccionar banco base según materia
  let selectedBase = universityTheoryBank;
  if (subj.includes("cálcul") || subj.includes("calcul") || subj.includes("matem") || name.includes("calcul") || name.includes("integral")) {
    selectedBase = calculusBank;
  } else if (subj.includes("econ") || name.includes("econ") || subj.includes("finan")) {
    selectedBase = economicsBank;
  } else if (subj.includes("fís") || subj.includes("fis") || name.includes("newton") || subj.includes("mecán")) {
    selectedBase = physicsBank;
  } else if (subj.includes("sist") || subj.includes("soft") || subj.includes("prog") || name.includes("datos")) {
    selectedBase = csBank;
  }

  // Mezclar asegurando preguntas variadas
  const combined = [...selectedBase, ...universityTheoryBank, ...economicsBank, ...csBank];

  // Generar exactamente la cantidad solicitada (20, 35 o 50) con preguntas variadas
  const result: FlashcardQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const template = combined[i % combined.length];
    
    // Barajar opciones y mantener el índice correcto sincronizado
    const rawOptions = [...template.opciones];
    const correctText = rawOptions[template.indice_correcto];
    
    // Shuffler determinista por iteración
    const shuffledOptions = [...rawOptions].sort(() => (Math.sin(i * 997 + 13) > 0 ? 1 : -1));
    const newCorrectIndex = shuffledOptions.indexOf(correctText);

    result.push({
      id: i + 1,
      pregunta: i >= combined.length ? `[Nivel Avanzado #${i + 1}] ${template.pregunta}` : template.pregunta,
      opciones: shuffledOptions,
      indice_correcto: newCorrectIndex >= 0 ? newCorrectIndex : 0,
      explicacion: template.explicacion,
      tema: material.subject || "Recurso IA",
    });
  }

  return result;
}

export default function PsicopataModal({
  isOpen,
  onClose,
  isLightMode = false,
  isPro = false,
  onGoToCheckout,
  tokensBalance = 0,
  onDeductTokens,
  onSessionCompleted,
}: PsicopataModalProps) {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [resourceSearch, setResourceSearch] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  // Control de paywall para usuarios gratuitos y feedback de validación
  const [showFreePaywall, setShowFreePaywall] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRepoExplorerOpen, setIsRepoExplorerOpen] = useState<boolean>(false);
  const [explorerSearch, setExplorerSearch] = useState<string>("");
  const [equipos, setEquipos] = useState<EquipoItem[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const [repoFilterTab, setRepoFilterTab] = useState<"equipos" | "personal">("equipos");

  // Materiales cargados desde Recursos IA y Repositorio
  const [materials, setMaterials] = useState<MaterialFile[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId) || materials[0] || null;
  const tokenCost = getCreditsByFileSize(selectedMaterial?.size);
  const materialTier = getFileTierInfo(selectedMaterial?.size);
  const [showCreditTiersModal, setShowCreditTiersModal] = useState(false);

  // Mostrar únicamente los 3 documentos más recientes en la vista rápida
  const recentMaterials = materials.slice(0, 3);
  const displayedQuickMaterials = recentMaterials.some((m) => m.id === selectedMaterialId)
    ? recentMaterials
    : selectedMaterial
    ? [selectedMaterial, ...recentMaterials.slice(0, 2)]
    : [];

  // Filtrado de materiales para el modal explorador completo
  const filteredMaterials = materials.filter((m) => {
    if (!resourceSearch.trim()) return true;
    const query = resourceSearch.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(query) ||
      (m.subject || "").toLowerCase().includes(query)
    );
  });

  // Estado del Desafío Flashcards
  const [cardCountGoal, setCardCountGoal] = useState<20 | 35 | 50>(20);
  const [gameStage, setGameStage] = useState<"setup" | "playing" | "fatal_error" | "victory">("setup");
  const [questions, setQuestions] = useState<FlashcardQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecking, setIsAnswerChecking] = useState<boolean>(false);

  // Registro del fallo para pantalla de muerte súbita
  const [failedQuestion, setFailedQuestion] = useState<{
    question: FlashcardQuestion;
    chosenOption: string;
    correctOption: string;
    index: number;
  } | null>(null);

  // Estadísticas persistentes del Método Psicópata (sincronizadas con PostgreSQL)
  const [bestStreakRecord, setBestStreakRecord] = useState<number>(user?.recordPsicopata ?? 0);
  const [psicopataVictories, setPsicopataVictories] = useState<number>(user?.victoriasPsicopata ?? 0);

  useEffect(() => {
    if (user?.recordPsicopata !== undefined) {
      setBestStreakRecord(user.recordPsicopata);
    } else {
      setBestStreakRecord(0);
    }
    if (user?.victoriasPsicopata !== undefined) {
      setPsicopataVictories(user.victoriasPsicopata);
    } else {
      setPsicopataVictories(0);
    }
  }, [user?.recordPsicopata, user?.victoriasPsicopata, isOpen]);

  // Cargar repositorios reales desde el backend
  useEffect(() => {
    if (isOpen) {
      repositoryService
        .getEquipos()
        .then((data) => {
          if (Array.isArray(data)) {
            setEquipos(data);
            // Aplanar documentos de todos los repositorios para la selección rápida de recientes
            const allDocs: MaterialFile[] = [];
            data.forEach((eq) => {
              (eq.documentos || []).forEach((d) => {
                const fmt = (d.formato || "").toUpperCase();
                const docNameLower = d.nombre.toLowerCase();
                const isDocx =
                  fmt.includes("DOC") ||
                  fmt.includes("WORD") ||
                  docNameLower.endsWith(".docx") ||
                  docNameLower.endsWith(".doc");

                const isPpt =
                  fmt.includes("PPT") ||
                  docNameLower.endsWith(".pptx") ||
                  docNameLower.endsWith(".ppt");

                const isTxt =
                  fmt.includes("TXT") ||
                  fmt.includes("MD") ||
                  docNameLower.endsWith(".txt") ||
                  docNameLower.endsWith(".md");

                const isPdf =
                  fmt.includes("PDF") ||
                  docNameLower.endsWith(".pdf");

                const isRealDoc = isDocx || isPpt || isTxt || isPdf;

                const isArchive =
                  !isRealDoc &&
                  (fmt === "ZIP" ||
                    fmt === "RAR" ||
                    fmt === "7Z" ||
                    fmt === "TAR" ||
                    fmt === "GZ" ||
                    fmt.includes("ZIP") ||
                    fmt.includes("RAR") ||
                    docNameLower.endsWith(".zip") ||
                    docNameLower.endsWith(".rar") ||
                    docNameLower.endsWith(".7z") ||
                    docNameLower.endsWith(".tar") ||
                    docNameLower.endsWith(".gz") ||
                    docNameLower.endsWith(".tgz"));

                const isLink =
                  !isRealDoc &&
                  !isArchive &&
                  (fmt === "LINK" ||
                    fmt === "NOTION" ||
                    d.tamano === "Enlace" ||
                    docNameLower.startsWith("http://") ||
                    docNameLower.startsWith("https://"));

                allDocs.push({
                  id: `doc_${d.id_documento}`,
                  backendDocId: d.id_documento,
                  name: d.nombre,
                  subject: eq.nombre,
                  size: d.tamano || "1.0 MB",
                  type: isLink
                    ? "link"
                    : isArchive
                    ? "zip"
                    : isDocx
                    ? "docx"
                    : isTxt
                    ? "txt"
                    : isPpt
                    ? "ppt"
                    : "pdf",
                  isLink,
                  isArchive,
                  previewText: d.descripcion || d.nombre,
                });
              });
            });
            // Para la selección rápida inicial, excluir enlaces y archivos comprimidos
            const playableDocs = allDocs.filter((d) => !d.isLink && !d.isArchive);
            setMaterials(playableDocs);
            if (playableDocs.length > 0) {
              setSelectedMaterialId((prev) =>
                prev && playableDocs.some((m) => m.id === prev) ? prev : playableDocs[0].id
              );
            } else {
              setSelectedMaterialId("");
            }
          }
        })
        .catch((err) =>
          console.warn("Error cargando repositorios en PsicopataModal:", err)
        );
    }
  }, [isOpen]);

  // Iniciar el Desafío Muerte Súbita con IA real, validación PRO y deducción real en base de datos
  const handleStartFlashcardChallenge = async () => {
    setErrorMessage("");

    // 1. Si no es PRO, bloquear con paywall modal de inmediato
    if (!isPro) {
      setShowFreePaywall(true);
      return;
    }

    // 2. Si es PRO, validar tokens disponibles según peso del archivo seleccionado:
    // <= 10MB: 2 tokens | 10-25MB: 4 tokens | 25-40MB: 7 tokens | > 40MB: 10 tokens
    if (tokensBalance < tokenCost) {
      setErrorMessage(`No tienes suficientes tokens disponibles. Requieres ${tokenCost} tokens para este archivo (${selectedMaterial?.size || "≤ 10 MB"}) y dispones de ${tokensBalance}.`);
      return;
    }

    setIsGenerating(true);

    try {
      // 3. Descontar tokens del balance global en la base de datos PostgreSQL
      if (onDeductTokens) {
        await onDeductTokens(tokenCost);
      } else {
        await authService.deductTokens(tokenCost);
      }

      // 4. Invocar IA real universitaria a partir del archivo seleccionado
      const promptTema = selectedMaterial?.name || "Conceptos Teóricos Universitarios";
      const promptMateria = selectedMaterial?.subject || "Universidad";
      const promptContexto = selectedMaterial?.previewText || `Documento de estudio: ${selectedMaterial?.name}`;

      const aiResponse = await aiService.generarRecurso({
        tipo_recurso: "Psicopata",
        materia: promptMateria,
        tema: promptTema,
        dificultad: "Avanzado",
        cantidad: cardCountGoal,
        archivo_nombre: selectedMaterial?.name,
        documento_id: selectedMaterial?.backendDocId,
        texto_adicional: promptContexto,
      });

      let loadedQuestions: FlashcardQuestion[] = [];

      if (aiResponse && aiResponse.contenido && Array.isArray(aiResponse.contenido) && aiResponse.contenido.length > 0) {
        loadedQuestions = aiResponse.contenido.map((q: any, idx: number) => ({
          id: q.id || idx + 1,
          pregunta: q.pregunta || `Pregunta ${idx + 1}`,
          opciones: Array.isArray(q.opciones) ? q.opciones : ["Opción A", "Opción B", "Opción C", "Opción D"],
          indice_correcto: typeof q.indice_correcto === "number" ? q.indice_correcto : 0,
          explicacion: q.explicacion || "Justificación teórica y análisis pedagógico profundo.",
          tema: promptMateria,
        }));
      }

      // Complementar si faltan para alcanzar la meta exacta
      if (loadedQuestions.length < cardCountGoal) {
        const fallback = generatePsicopataQuestions(selectedMaterial, cardCountGoal);
        const needed = cardCountGoal - loadedQuestions.length;
        loadedQuestions = [...loadedQuestions, ...fallback.slice(0, needed)];
      }

      setQuestions(loadedQuestions);
      setCurrentIndex(0);
      setStreak(0);
      setSelectedOptionIndex(null);
      setIsAnswerChecking(false);
      setFailedQuestion(null);
      setSessionStartTime(Date.now());
      setGameStage("playing");
    } catch (err: any) {
      console.error("Error al iniciar Desafío Psicópata con IA:", err);
      setErrorMessage(err?.message || "Error al conectar con la IA de Dalat. Inténtalo nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Manejar respuesta del usuario a una flashcard (sin sonidos ni música)
  const handleSelectAnswer = (optionIndex: number) => {
    if (isAnswerChecking || gameStage !== "playing") return;

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setSelectedOptionIndex(optionIndex);
    setIsAnswerChecking(true);

    const isCorrect = optionIndex === currentQ.indice_correcto;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);

      if (nextStreak > bestStreakRecord) {
        setBestStreakRecord(nextStreak);
        try {
          localStorage.setItem("dalat_psicopata_best_streak", nextStreak.toString());
        } catch {}
        // Persistir récord en PostgreSQL
        authService.updatePsicopataRecord(nextStreak, false).catch((err) => {
          console.warn("Error persistiendo récord psicópata en backend:", err);
        });
      }

      // Verificar si completó todas sin error
      if (currentIndex + 1 >= cardCountGoal) {
        const elapsedSecs = Math.max(60, Math.floor((Date.now() - sessionStartTime) / 1000));
        // Registrar sesión de estudio completada para encender la racha diaria en PostgreSQL
        studySessionService.logSession({
          duracion_segundos: elapsedSecs,
          materia: selectedMaterial?.subject || "Método Psicópata",
          completada: true,
          tipo: "psicopata",
          notas: `Desafío Psicópata completado con éxito: ${cardCountGoal} preguntas perfectas`,
        }).then(() => {
          onSessionCompleted?.();
        }).catch((err) => {
          console.error("Error al registrar sesión de Método Psicópata:", err);
        });

        // Persistir victoria en base de datos PostgreSQL
        authService.updatePsicopataRecord(nextStreak, true).catch((err) => {
          console.warn("Error persistiendo victoria psicópata en backend:", err);
        });

        setTimeout(() => {
          setGameStage("victory");
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#ef4444", "#dc2626", "#f59e0b", "#ffffff"],
          });
          const newVic = psicopataVictories + 1;
          setPsicopataVictories(newVic);
          try {
            localStorage.setItem("dalat_psicopata_victories", newVic.toString());
          } catch {}
        }, 500);
      } else {
        // Siguiente tarjeta
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOptionIndex(null);
          setIsAnswerChecking(false);
        }, 450);
      }
    } else {
      // ¡MUERTE SÚBITA! ERROR FATAL: Reinicio obligatorio
      setFailedQuestion({
        question: currentQ,
        chosenOption: currentQ.opciones[optionIndex],
        correctOption: currentQ.opciones[currentQ.indice_correcto],
        index: currentIndex,
      });

      // Guardar sesión de estudio real en PostgreSQL para encender y mantener la racha
      const elapsedSecs = Math.max(30, Math.floor((Date.now() - sessionStartTime) / 1000));
      studySessionService.logSession({
        duracion_segundos: elapsedSecs,
        materia: selectedMaterial?.subject || "Método Psicópata",
        completada: false,
        tipo: "psicopata",
        notas: `Intento Desafío Psicópata: racha de ${streak} aciertos antes de error`,
      }).then(() => {
        onSessionCompleted?.();
      }).catch((err) => {
        console.warn("Error registrando sesión de intento psicópata:", err);
      });

      setTimeout(() => {
        setGameStage("fatal_error");
        setIsAnswerChecking(false);
      }, 500);
    }
  };

  // Reiniciar el desafío tras el error fatal (regla psicópata: vuelve a la tarjeta 1, sin sonidos ni música)
  const handleRestartAfterFatalError = () => {
    // Rebarajar las preguntas existentes generadas para un nuevo intento limpio
    const reshuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(reshuffled);
    setCurrentIndex(0);
    setStreak(0);
    setSelectedOptionIndex(null);
    setIsAnswerChecking(false);
    setFailedQuestion(null);
    setSessionStartTime(Date.now());
    setGameStage("playing");
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const progressPercent = cardCountGoal > 0 ? ((currentIndex) / cardCountGoal) * 100 : 0;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200 ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      <div
        className={`w-full ${
          isFullscreen
            ? "h-full max-w-none rounded-none border-none"
            : "max-w-4xl max-h-[95vh] rounded-3xl border shadow-2xl"
        } overflow-y-auto flex flex-col justify-between relative transition-colors duration-200 ${
          isLightMode
            ? "bg-[#fffafa] border-red-300 text-slate-900 shadow-red-950/20"
            : "bg-[#0b0305] border-red-600/40 text-white shadow-[0_0_60px_-10px_rgba(220,38,38,0.45)]"
        }`}
      >
        {/* Decoración visual táctica */}
        <div className="absolute top-2 right-12 pointer-events-none select-none opacity-20 group-hover:opacity-40 transition-opacity">
          <TacticalKnifeIcon className="w-10 h-28 -rotate-12" />
        </div>

        {/* 1. HEADER CON BOTONES DE CONTROL */}
        <div
          className={`p-4 sm:p-6 pb-3 border-b flex items-center justify-between gap-3 relative z-10 ${
            isLightMode ? "border-red-200/80" : "border-red-950/60"
          }`}
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <h2
                className={`text-xl sm:text-2xl font-editorial font-bold tracking-tight flex items-center gap-2 ${
                  isLightMode ? "text-red-950" : "text-white"
                }`}
              >
                <span>Método Psicópata</span>
              </h2>

              <button
                type="button"
                onClick={() => setShowExplanation(true)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  isLightMode
                    ? "bg-red-100/70 hover:bg-red-100 text-red-950 border-red-300"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border-white/[0.12]"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-red-500" />
                <span>¿Cómo funciona?</span>
              </button>
            </div>
          </div>

          {/* Botones de Control */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isLightMode
                  ? "text-slate-500 hover:text-slate-900 hover:bg-red-50"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
              }`}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isLightMode
                  ? "text-slate-500 hover:text-slate-900 hover:bg-red-50"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
              }`}
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. CONTENIDO PRINCIPAL: DESAFÍO FLASHCARDS */}
        <div className="p-5 sm:p-8 space-y-6 flex-1">
          {/* ETAPA A: SETUP / CONFIGURACIÓN DEL DESAFÍO */}
          {gameStage === "setup" && (
            <div className="space-y-7 sm:space-y-8 animate-in fade-in duration-200 max-w-3xl mx-auto py-2">
              {/* 1. Seleccionar archivo de Recursos IA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <label
                        className={`text-xs font-bold uppercase tracking-wider block ${
                          isLightMode ? "text-slate-800" : "text-slate-200"
                        }`}
                      >
                        1. Elige el recurso de estudio:
                      </label>
                      <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        Recientes
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Mostrando los 3 documentos más recientes de tus repositorios
                    </p>
                  </div>
                </div>

                {/* Contenedor con documentos recientes o estado vacío */}
                {displayedQuickMaterials.length === 0 ? (
                  <div
                    className={`p-6 sm:p-7 rounded-2xl border text-center space-y-2.5 ${
                      isLightMode
                        ? "bg-slate-50 border-slate-200 text-slate-600 shadow-xs"
                        : "bg-white/[0.02] border-white/[0.08] text-slate-400"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className={`text-xs sm:text-sm font-bold ${isLightMode ? "text-slate-800" : "text-white"}`}>
                        No tienes documentos en tus repositorios
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                        Sube tus apuntes, resúmenes o lecturas en la pestaña <strong>Repositorio</strong> para que el Método Psicópata genere tu desafío de estudio.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {displayedQuickMaterials.map((mat) => {
                      const isSelected = selectedMaterialId === mat.id;
                      return (
                        <div
                          key={mat.id}
                          onClick={() => setSelectedMaterialId(mat.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative select-none flex items-center justify-between gap-3 ${
                            isSelected
                              ? isLightMode
                                ? "bg-red-50/80 border-red-500 ring-2 ring-red-400/30 shadow-sm"
                                : "bg-red-950/40 border-red-500 ring-2 ring-red-500/30 shadow-sm"
                              : isLightMode
                              ? "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300 shadow-sm"
                              : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-300 hover:border-white/[0.15]"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span
                              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0 ${
                                mat.type === "pdf"
                                  ? "bg-rose-500/15 text-rose-600 border border-rose-500/25"
                                  : mat.type === "docx"
                                  ? "bg-blue-500/15 text-blue-600 border border-blue-500/25"
                                  : mat.type === "ppt"
                                  ? "bg-amber-500/15 text-amber-600 border border-amber-500/25"
                                  : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/25"
                              }`}
                            >
                              {mat.type.toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold truncate leading-snug" title={mat.name}>
                                {mat.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {mat.subject} • {mat.size}
                              </p>
                            </div>
                          </div>
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div
                              className={`w-4 h-4 rounded-full border shrink-0 ${
                                isLightMode ? "border-slate-300" : "border-slate-700"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Detalle del archivo seleccionado y botón para abrir todos */}
                <div className="flex flex-wrap items-center justify-between text-xs px-1 text-slate-400 pt-1 gap-2">
                  <span className="truncate max-w-[280px] sm:max-w-[420px] flex items-center gap-1.5">
                    <span>Seleccionado:</span>
                    <span className={`font-semibold ${isLightMode ? "text-slate-800" : "text-slate-200"}`}>
                      {selectedMaterial?.name || "Ninguno"}
                    </span>
                    {selectedMaterial && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${materialTier.badgeColor}`}>
                        {selectedMaterial.size} • {tokenCost} créditos
                      </span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsRepoExplorerOpen(true)}
                    className="text-red-500 hover:text-red-400 font-semibold text-xs inline-flex items-center gap-1 hover:underline cursor-pointer shrink-0"
                  >
                    <span>Explorar repositorios ({materials.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Aviso de Compatibilidad Académica */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  isLightMode
                    ? "bg-amber-50/90 border-amber-200 text-amber-950 shadow-sm"
                    : "bg-amber-950/20 border-amber-500/30 text-amber-200"
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <b className={`block text-xs sm:text-sm font-bold ${isLightMode ? "text-amber-900" : "text-amber-300"}`}>
                    Aviso de Compatibilidad Académica
                  </b>
                  <p className={`leading-relaxed text-[11px] sm:text-xs ${isLightMode ? "text-amber-900/80" : "text-amber-200/80"}`}>
                    El Método Psicópata está optimizado para conceptos teóricos, definiciones, leyes, medicina y memorización activa. <strong>No está optimizado para matemáticas, física, cálculo ni resolución de fórmulas.</strong>
                  </p>
                </div>
              </div>

              {/* 2. Seleccionar Cantidad de Flashcards: 20, 35 o 50 con costo de tokens */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label
                      className={`text-xs font-bold uppercase tracking-wider block ${
                        isLightMode ? "text-slate-800" : "text-slate-200"
                      }`}
                    >
                      2. Meta de aciertos consecutivos (Muerte Súbita):
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aciertos consecutivos sin error requeridos para superar el reto
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md">
                  {([20, 35, 50] as const).map((count) => {
                    const isSelected = cardCountGoal === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setCardCountGoal(count);
                          setErrorMessage("");
                        }}
                        className={`py-3 sm:py-3.5 px-3 rounded-2xl font-bold transition-all cursor-pointer select-none active:scale-95 border flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-gradient-to-b from-red-600 to-rose-700 text-white border-red-500 shadow-md shadow-red-600/30 ring-2 ring-red-400/40"
                            : isLightMode
                            ? "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300 shadow-sm"
                            : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:border-white/[0.16]"
                        }`}
                      >
                        <span className="text-base sm:text-lg font-bold">{count}</span>
                        <span
                          className={`text-[10px] font-semibold tracking-tight ${
                            isSelected
                              ? "text-red-100"
                              : isLightMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          aciertos seguidos
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Banner de Regla de Muerte Súbita */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${
                  isLightMode
                    ? "bg-red-50/70 border-red-200/90 text-slate-800 shadow-sm"
                    : "bg-red-950/20 border-red-600/30 text-red-200"
                }`}
              >
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <b className={`block text-xs sm:text-sm font-bold ${isLightMode ? "text-red-900" : "text-red-300"}`}>
                    Regla Inquebrantable de Muerte Súbita
                  </b>
                  <p className={`leading-relaxed text-[11px] sm:text-xs ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
                    Un solo fallo reinicia tu racha a la tarjeta #1. Debes responder las {cardCountGoal} flashcards consecutivas con 100% de precisión continua.
                  </p>
                </div>
              </div>

              {/* 4. Footer con Récord, Tokens y Botón de Inicio */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-3">
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-in fade-in">
                    <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${
                        isLightMode
                          ? "bg-white border-slate-200 text-slate-700 shadow-sm"
                          : "bg-white/[0.03] border-white/[0.08] text-slate-300"
                      }`}
                    >
                      <Flame className="w-4 h-4 text-red-500 fill-red-500/20" />
                      <span className="text-xs">
                        Récord:{" "}
                        <b className={`font-mono font-bold text-sm ml-1 ${isLightMode ? "text-red-600 font-extrabold" : "text-white"}`}>
                          {bestStreakRecord}
                        </b>
                      </span>
                    </div>

                    {isPro && (
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                          isLightMode
                            ? "bg-purple-50/70 border-purple-200 text-purple-900 shadow-sm"
                            : "bg-purple-950/20 border-purple-500/30 text-purple-300"
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5 text-purple-500" />
                        <span>
                          Costo por peso: <strong className="font-bold">{tokenCost} {tokenCost === 1 ? "crédito" : "créditos"}</strong> ({selectedMaterial?.size || "≤ 10 MB"}) • Te quedarán:{" "}
                          <strong>{Math.max(0, tokensBalance - tokenCost)}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCreditTiersModal(true)}
                          className="text-[10px] text-purple-400 hover:underline cursor-pointer ml-1 inline-flex items-center gap-0.5"
                          title="Ver tabla oficial de costos por peso"
                        >
                          <span>Tarifas</span>
                          <Info className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isGenerating || materials.length === 0 || !selectedMaterial}
                    onClick={handleStartFlashcardChallenge}
                    className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-red-600/30 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Generando desafío con IA real...</span>
                      </>
                    ) : materials.length === 0 ? (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Sube un documento para iniciar</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Iniciar Desafío ({cardCountGoal} Flashcards)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA B: JUGANDO EL DESAFÍO EN VIVO */}
          {gameStage === "playing" && currentQ && (
            <div className="relative pt-2">
              <div
                className={`space-y-5 animate-in fade-in duration-150 max-w-3xl mx-auto ${
                  !isPro
                    ? "filter blur-md select-none pointer-events-none opacity-25 min-h-[580px] sm:min-h-[620px] max-h-[660px] py-4 px-2 overflow-hidden"
                    : ""
                }`}
              >
                {/* Barra de progreso de muerte súbita */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-400">
                      <span className="text-red-500 font-bold">Tarjeta {currentIndex + 1}</span> de {cardCountGoal}
                      <span className="text-slate-600">•</span>
                      <span className="truncate max-w-[200px] text-slate-400">{selectedMaterial.name}</span>
                    </span>

                    <span className="flex items-center gap-1.5 text-amber-500 font-mono font-bold">
                      <Flame className="w-4 h-4 fill-amber-500" />
                      <span>Racha: {streak} consecutivas</span>
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* TARJETA DE COMBATE / PREGUNTA */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden space-y-6 ${
                    isLightMode
                      ? "bg-white border-red-200/90 shadow-red-950/10 text-slate-900"
                      : "bg-[#110507] border-red-600/40 shadow-black/80 text-white"
                  }`}
                >
                  {/* Badge temático */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isLightMode ? "bg-red-100 text-red-800" : "bg-red-950/80 text-red-300 border border-red-600/40"
                      }`}
                    >
                      {currentQ.tema || selectedMaterial.subject}
                    </span>

                    <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                      <Skull className="w-3.5 h-3.5" />
                      <span>Sin margen de error</span>
                    </span>
                  </div>

                  {/* Pregunta */}
                  <h3 className="text-lg sm:text-xl font-bold leading-snug tracking-tight">
                    {currentQ.pregunta}
                  </h3>

                  {/* Opciones interactivas */}
                  <div className="grid grid-cols-1 gap-2.5 pt-2">
                    {currentQ.opciones.map((op, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      const isCorrect = idx === currentQ.indice_correcto;
                      
                      let btnStyle = isLightMode
                        ? "bg-slate-50 hover:bg-red-50/70 border-slate-200 text-slate-800 hover:border-red-300"
                        : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.1] text-slate-200 hover:border-red-500/40";

                      if (isAnswerChecking) {
                        if (isSelected) {
                          btnStyle = isCorrect
                            ? "bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/40"
                            : "bg-red-600 text-white border-red-700 ring-2 ring-red-400/40 animate-shake";
                        } else if (isCorrect) {
                          btnStyle = "bg-emerald-600/40 text-emerald-200 border-emerald-500/60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAnswerChecking}
                          onClick={() => handleSelectAnswer(idx)}
                          className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer disabled:cursor-not-allowed active:scale-98 ${btnStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 uppercase ${
                              isSelected
                                ? "bg-white text-slate-900"
                                : isLightMode
                                ? "bg-slate-200 text-slate-700"
                                : "bg-white/[0.1] text-slate-300"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed flex-1">{op}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Abortar sesión */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setGameStage("setup")}
                    className="text-xs text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    ← Abandonar desafío
                  </button>
                  <span className="text-[11px] text-slate-500">
                    Pregunta {currentIndex + 1} de {cardCountGoal}
                  </span>
                </div>
              </div>

              {/* Paywall Overlay para Método Psicópata */}
              {!isPro && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-6 sm:p-10">
                  <div
                    className={`max-w-md w-full p-6 sm:p-7 rounded-3xl border shadow-2xl backdrop-blur-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200 my-auto ${
                      isLightMode
                        ? "bg-white/95 border-red-200 shadow-2xl shadow-red-950/10 text-slate-900"
                        : "bg-[#0f0406]/95 border-red-500/40 shadow-2xl shadow-black/90 text-white"
                    }`}
                  >
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold tracking-wide">
                      <span>Método Psicópata • Exclusivo Dalat PRO</span>
                    </div>

                    <div className="pb-1.5 pt-0.5">
                      <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}`}>
                        Desbloquea el Método Psicópata con Dalat PRO
                      </h3>
                    </div>

                    <div
                      className={`border rounded-2xl p-4 text-left space-y-2.5 text-xs mt-3 ${
                        isLightMode
                          ? "bg-red-50/50 border-red-100 text-slate-700"
                          : "bg-white/[0.03] border-white/[0.07] text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>Exámenes, flashcards y resúmenes para tus trabajos o parciales.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>Explicaciones exactas sin informacion inventada.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>Acceso a metodos Feyman y psicopata.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>2 GB de almacenamiento en tus repositorios</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onGoToCheckout) onGoToCheckout();
                        }}
                        className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Comprar Plan PRO para jugar el desafío</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

            {/* ETAPA C: ERROR FATAL (MUERTE SÚBITA ACTIVADA) */}
            {gameStage === "fatal_error" && failedQuestion && (
              <div
                className={`max-w-xl mx-auto p-6 sm:p-8 rounded-3xl text-center space-y-6 animate-in zoom-in-95 duration-200 ${
                  isLightMode
                    ? "bg-white border-2 border-red-200/90 text-slate-900 shadow-2xl shadow-red-950/10"
                    : "border border-red-600/60 bg-gradient-to-b from-[#1c0507] via-[#100204] to-[#080102] text-white shadow-2xl shadow-red-950"
                }`}
              >
                <div className="space-y-1.5">
                  <h3
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${
                      isLightMode ? "text-red-600" : "text-red-500"
                    }`}
                  >
                    ¡ERROR FATAL!
                  </h3>
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      isLightMode ? "text-slate-600" : "text-red-200"
                    }`}
                  >
                    Caíste en la tarjeta{" "}
                    <b className={isLightMode ? "text-red-600 font-bold" : "text-red-400 font-bold"}>
                      #{failedQuestion.index + 1}
                    </b>{" "}
                    de {cardCountGoal}.
                  </p>
                </div>

                {/* Comparación de respuestas */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-left space-y-3 text-xs border ${
                    isLightMode
                      ? "bg-red-50/50 border-red-200 text-slate-800"
                      : "bg-black/50 border-red-950/80 text-white"
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase block ${
                        isLightMode ? "text-red-900/60" : "text-slate-400"
                      }`}
                    >
                      La pregunta era:
                    </span>
                    <p
                      className={`font-semibold mt-0.5 ${
                        isLightMode ? "text-slate-900 text-sm" : "text-slate-200"
                      }`}
                    >
                      {failedQuestion.question.pregunta}
                    </p>
                  </div>

                  <div
                    className={`pt-2.5 border-t space-y-2.5 ${
                      isLightMode ? "border-red-200/80" : "border-white/[0.08]"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2.5 rounded-xl ${
                        isLightMode
                          ? "bg-rose-100/70 border border-rose-200 p-2.5 text-rose-950"
                          : "text-rose-400"
                      }`}
                    >
                      <X className={`w-4 h-4 shrink-0 mt-0.5 ${isLightMode ? "text-rose-600 stroke-[3]" : ""}`} />
                      <div>
                        <span
                          className={`text-[10px] uppercase font-bold block ${
                            isLightMode ? "text-rose-800" : ""
                          }`}
                        >
                          Tu respuesta (Incorrecta):
                        </span>
                        <p className={isLightMode ? "font-semibold" : ""}>{failedQuestion.chosenOption}</p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-2.5 rounded-xl ${
                        isLightMode
                          ? "bg-emerald-100/70 border border-emerald-200 p-2.5 text-emerald-950"
                          : "text-emerald-400 pt-1"
                      }`}
                    >
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isLightMode ? "text-emerald-600 stroke-[3]" : ""}`} />
                      <div>
                        <span
                          className={`text-[10px] uppercase font-bold block ${
                            isLightMode ? "text-emerald-800" : ""
                          }`}
                        >
                          Respuesta Correcta:
                        </span>
                        <p className="font-semibold">{failedQuestion.correctOption}</p>
                        <p
                          className={`text-[11px] mt-1 italic ${
                            isLightMode ? "text-slate-600" : "text-slate-300"
                          }`}
                        >
                          {failedQuestion.question.explicacion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón de reinicio inmediato y salida */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleRestartAfterFatalError}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/40 cursor-pointer active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Reiniciar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGameStage("setup");
                      onClose();
                    }}
                    className={`w-full py-2 text-xs transition cursor-pointer ${
                      isLightMode
                        ? "text-slate-500 hover:text-slate-900 font-semibold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Salir
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA D: VICTORIA PSICÓPATA ABSOLUTA */}
            {gameStage === "victory" && (
              <div className="max-w-lg mx-auto p-6 sm:p-8 rounded-3xl border border-amber-500/50 bg-gradient-to-b from-[#1c1204] via-[#120a02] to-[#070401] text-white shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                  <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                    ¡VICTORIA PSICÓPATA ABSOLUTA!
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                    Has completado <b>{cardCountGoal} flashcards consecutivas</b> con <b>100% de precisión</b> sin fallar ni una sola vez. Tu cerebro ha alcanzado el nivel supremo de retención.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-white/[0.05] border border-amber-500/30 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Aciertos Consecutivos</span>
                    <b className="text-xl font-mono text-amber-400">{cardCountGoal} / {cardCountGoal}</b>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.05] border border-amber-500/30 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Margen de Error</span>
                    <b className="text-xl font-mono text-emerald-400">0% (Inviolable)</b>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGameStage("setup")}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer active:scale-95"
                  >
                    Nuevo Desafío
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs sm:text-sm border border-white/[0.1] transition cursor-pointer"
                  >
                    Finalizar y Volver
                  </button>
                </div>
              </div>
            )}
          </div>

        {/* 4. EXPLICACIÓN DEL MÉTODO PSICÓPATA */}
        {showExplanation && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
            <div
              className={`w-full max-w-lg rounded-3xl border p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 shadow-2xl relative ${
                isLightMode
                  ? "bg-white border-red-200/90 text-slate-900 shadow-xl shadow-red-950/10"
                  : "bg-[#110507] border-red-600/40 text-white shadow-2xl shadow-red-950/50"
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-start justify-between gap-3 pb-4 border-b ${
                  isLightMode ? "border-slate-100" : "border-red-950/60"
                }`}
              >
                <div>
                  <h3 className="font-editorial text-xl font-bold tracking-tight">
                    El Protocolo del Método Psicópata
                  </h3>
                  <p className={`text-xs ${isLightMode ? "text-slate-500" : "text-red-200/70"}`}>
                    La regla de muerte súbita y retención al 100%
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExplanation(false)}
                  className={`p-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    isLightMode
                      ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                  }`}
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido / 3 Pilares Neurocientíficos */}
              <div className="space-y-3">
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isLightMode ? "text-slate-600" : "text-slate-300"
                  }`}
                >
                  A diferencia de técnicas suaves que toleran fallos, el <b>Método Psicópata</b> entrena tu cerebro bajo estrés controlado similar al de un parcial de alto impacto.
                </p>

                <div className="space-y-2.5 pt-1">
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                      isLightMode
                        ? "bg-red-50/70 border-red-200/80 text-slate-800"
                        : "bg-red-950/25 border-red-600/30 text-red-100"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      1
                    </div>
                    <div className="text-xs space-y-0.5">
                      <b className={`block font-bold ${isLightMode ? "text-red-900" : "text-red-300"}`}>
                        Cero Margen de Error
                      </b>
                      <p className={`leading-relaxed text-[11px] ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
                        Elimina el hábito de adivinar a la suerte. Tu mente entra en alerta máxima y analiza cada flashcard con hiperconcentración.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                      isLightMode
                        ? "bg-amber-50/70 border-amber-200/80 text-slate-800"
                        : "bg-amber-950/20 border-amber-500/30 text-amber-100"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      2
                    </div>
                    <div className="text-xs space-y-0.5">
                      <b className={`block font-bold ${isLightMode ? "text-amber-900" : "text-amber-300"}`}>
                        El Castigo del Reinicio a la #1
                      </b>
                      <p className={`leading-relaxed text-[11px] ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
                        Si fallas, tu racha se destruye. Esta penalización activa una respuesta de neuroplasticidad profunda que graba el concepto correcto.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                      isLightMode
                        ? "bg-emerald-50/70 border-emerald-200/80 text-slate-800"
                        : "bg-emerald-950/20 border-emerald-500/30 text-emerald-100"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      3
                    </div>
                    <div className="text-xs space-y-0.5">
                      <b className={`block font-bold ${isLightMode ? "text-emerald-900" : "text-emerald-300"}`}>
                        Dominio Garantizado
                      </b>
                      <p className={`leading-relaxed text-[11px] ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
                        Superar la racha completa (20, 35 o 50 preguntas seguidas) asegura que dominas el tema con seguridad matemática.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-500/30 cursor-pointer active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <span>¡Entendido, listo para el desafío!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 4. MODAL BLOQUEO PRO PARA USUARIOS GRATUITOS */}
        {showFreePaywall && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
              className={`max-w-md w-full p-6 sm:p-7 rounded-3xl border shadow-2xl backdrop-blur-xl text-center space-y-4 animate-in zoom-in-95 duration-200 relative ${
                isLightMode
                  ? "bg-white border-red-200 shadow-2xl shadow-red-950/10 text-slate-900"
                  : "bg-[#0f0406] border-red-500/40 shadow-2xl shadow-black/90 text-white"
              }`}
            >
              <button
                type="button"
                onClick={() => setShowFreePaywall(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold tracking-wide">
                <span>Método Psicópata • Exclusivo Dalat PRO</span>
              </div>

              <div className="pb-1.5 pt-0.5">
                <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}`}>
                  Desbloquea el Método Psicópata con Dalat PRO
                </h3>
              </div>

              <div
                className={`border rounded-2xl p-4 text-left space-y-2.5 text-xs mt-3 ${
                  isLightMode
                    ? "bg-red-50/50 border-red-100 text-slate-700"
                    : "bg-white/[0.03] border-white/[0.07] text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>Exámenes, flashcards y resúmenes para tus trabajos o parciales.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>Explicaciones exactas sin informacion inventada.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>Acceso a metodos Feynman y psicopata.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>2 GB de almacenamiento en tus repositorios</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFreePaywall(false);
                    onClose();
                    if (onGoToCheckout) onGoToCheckout();
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Comprar Plan PRO para jugar el desafío</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. MODAL: EXPLORADOR DE REPOSITORIOS (SELECCIÓN CÓMODA) */}
        {/* ======================================================== */}
        {isRepoExplorerOpen && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            <div
              className={`w-full max-w-3xl max-h-[88vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${
                isLightMode ? "bg-white border-slate-200 shadow-slate-900/15" : "bg-[#0d1020] border-[#22294c] shadow-black/90"
              }`}
            >
              {/* Header */}
              <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 ${isLightMode ? "border-slate-100" : "border-white/[0.08]"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 text-red-500 flex items-center justify-center shrink-0">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isLightMode ? "text-slate-900" : "text-white"}`}>
                      {selectedRepoId === null ? "Explorador de Repositorios" : (equipos.find((e) => e.id_equipo === selectedRepoId)?.nombre || "Documentos del Repositorio")}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedRepoId === null
                        ? "Selecciona un repositorio para ver y elegir tus archivos de estudio"
                        : "Elige un archivo de este repositorio para el desafío de flashcards"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedRepoId !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedRepoId(null)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isLightMode
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-white/10 hover:bg-white/15 text-slate-200"
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a repositorios</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsRepoExplorerOpen(false);
                      setSelectedRepoId(null);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* VISTA 1: LISTADO DE REPOSITORIOS (NIVEL 1) */}
              {selectedRepoId === null ? (
                <div className="p-5 sm:p-6 overflow-y-auto max-h-[520px] space-y-5">
                  {/* Píldoras de Filtro: Equipos de Estudio vs Apuntes Personales */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRepoFilterTab("equipos")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        repoFilterTab === "equipos"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                          : isLightMode
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          : "bg-white/[0.05] text-slate-400 hover:text-white"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Equipos de Estudio</span>
                      <span className="w-4 h-4 rounded-full text-[10px] bg-white/20 flex items-center justify-center font-bold">
                        {equipos.filter((e) => !e.es_personal).length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRepoFilterTab("personal")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        repoFilterTab === "personal"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                          : isLightMode
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          : "bg-white/[0.05] text-slate-400 hover:text-white"
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span>Apuntes Personales</span>
                      <span className="w-4 h-4 rounded-full text-[10px] bg-white/20 flex items-center justify-center font-bold">
                        {equipos.filter((e) => e.es_personal).length}
                      </span>
                    </button>
                  </div>

                  {/* Cuadros de Repositorios en Grilla */}
                  {equipos.filter((e) => (repoFilterTab === "personal" ? e.es_personal : !e.es_personal)).length === 0 ? (
                    <div
                      className={`rounded-2xl border p-10 text-center space-y-3 ${
                        isLightMode ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/[0.06]"
                      }`}
                    >
                      <Folder className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                      <p className="text-xs font-semibold text-slate-400">
                        No tienes repositorios en esta sección aún.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {equipos
                        .filter((e) => (repoFilterTab === "personal" ? e.es_personal : !e.es_personal))
                        .map((team) => {
                          const totalDocs = team.documentos?.length || team.documentos_count || 0;
                          return (
                            <div
                              key={team.id_equipo}
                              onClick={() => setSelectedRepoId(team.id_equipo)}
                              className={`group rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
                                isLightMode
                                  ? "bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300"
                                  : "bg-[#0c0e18] border-[#171c2f] hover:border-[#2f385c] hover:bg-[#0f1220]"
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm"
                                    style={{ backgroundColor: team.color || "#7c5dfa" }}
                                  >
                                    {team.icono_iniciales || "EQ"}
                                  </div>
                                  <div className="min-w-0">
                                    <span
                                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                      style={{
                                        backgroundColor: `${team.color || "#7c5dfa"}15`,
                                        color: team.color || "#7c5dfa",
                                        border: `1px solid ${team.color || "#7c5dfa"}35`,
                                      }}
                                    >
                                      {team.materia || "GENERAL"}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <h4
                                    className={`text-base font-bold tracking-tight truncate ${
                                      isLightMode ? "text-slate-900 group-hover:text-purple-600" : "text-white group-hover:text-purple-400"
                                    }`}
                                  >
                                    {team.nombre}
                                  </h4>
                                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                    {team.descripcion || (team.es_personal ? "Notas personales privadas" : `Equipo de estudio colaborativo para ${team.materia}`)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>
                                      {team.miembros_count || 1} {(team.miembros_count || 1) === 1 ? "miembro" : "miembros"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>
                                      {totalDocs} {totalDocs === 1 ? "material" : "materiales"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                                <span>Ver y elegir materiales</span>
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ) : (
                /* VISTA 2: DOCUMENTOS DENTRO DEL REPOSITORIO SELECCIONADO (NIVEL 2) */
                <div className="p-5 sm:p-6 overflow-y-auto max-h-[520px] space-y-4">
                  {/* Buscador dentro del repositorio */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={explorerSearch}
                      onChange={(e) => setExplorerSearch(e.target.value)}
                      placeholder="Buscar archivo en este repositorio..."
                      className={`w-full text-xs pl-10 pr-8 py-2.5 rounded-xl border transition-colors outline-none ${
                        isLightMode
                          ? "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-red-400"
                          : "bg-[#090b16] border-[#1f2644] text-white placeholder-slate-500 focus:border-red-500/60"
                      }`}
                    />
                    {explorerSearch && (
                      <button
                        type="button"
                        onClick={() => setExplorerSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Lista de Documentos del Repositorio */}
                  {(() => {
                    const currentRepo = equipos.find((e) => e.id_equipo === selectedRepoId);
                    const docs = currentRepo?.documentos || [];
                    const filteredDocs = docs.filter((d) =>
                      !explorerSearch.trim() || d.nombre.toLowerCase().includes(explorerSearch.toLowerCase())
                    );

                    if (filteredDocs.length === 0) {
                      return (
                        <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                          <FileText className="w-8 h-8 mx-auto opacity-40 text-red-400" />
                          <p className="font-semibold text-slate-300">No hay documentos en este repositorio</p>
                          <p className="text-[11px] text-slate-500">
                            Sube guías o diapositivas en la pestaña Repositorio para poder utilizarlos con el Método Psicópata.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2.5">
                        {filteredDocs.map((doc) => {
                          const fmt = (doc.formato || "").toUpperCase();
                          const docNameLower = doc.nombre.toLowerCase();
                          const isDocx =
                            fmt.includes("DOC") ||
                            fmt.includes("WORD") ||
                            docNameLower.endsWith(".docx") ||
                            docNameLower.endsWith(".doc");

                          const isPpt =
                            fmt.includes("PPT") ||
                            docNameLower.endsWith(".pptx") ||
                            docNameLower.endsWith(".ppt");

                          const isTxt =
                            fmt.includes("TXT") ||
                            fmt.includes("MD") ||
                            docNameLower.endsWith(".txt") ||
                            docNameLower.endsWith(".md");

                          const isPdf =
                            fmt.includes("PDF") ||
                            docNameLower.endsWith(".pdf");

                          const isRealDoc = isDocx || isPpt || isTxt || isPdf;

                          const isArchive =
                            !isRealDoc &&
                            (fmt === "ZIP" ||
                              fmt === "RAR" ||
                              fmt === "7Z" ||
                              fmt === "TAR" ||
                              fmt === "GZ" ||
                              fmt.includes("ZIP") ||
                              fmt.includes("RAR") ||
                              docNameLower.endsWith(".zip") ||
                              docNameLower.endsWith(".rar") ||
                              docNameLower.endsWith(".7z") ||
                              docNameLower.endsWith(".tar") ||
                              docNameLower.endsWith(".gz") ||
                              docNameLower.endsWith(".tgz"));

                          const isLink =
                            !isRealDoc &&
                            !isArchive &&
                            (fmt === "LINK" ||
                              fmt === "NOTION" ||
                              doc.tamano === "Enlace" ||
                              docNameLower.startsWith("http://") ||
                              docNameLower.startsWith("https://"));

                          const isSelected = selectedMaterialId === `doc_${doc.id_documento}` || selectedMaterial?.name === doc.nombre;

                          // Caso 1: ENLACES WEB Y ARCHIVOS COMPRIMIDOS (NO disponibles para IA ni Método Psicópata)
                          if (isLink || isArchive) {
                            return (
                              <div
                                key={doc.id_documento}
                                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 opacity-50 cursor-not-allowed select-none ${
                                  isLightMode
                                    ? "bg-slate-100/70 border-slate-200 text-slate-500"
                                    : "bg-white/[0.02] border-white/[0.06] text-slate-400"
                                }`}
                                title={
                                  isArchive
                                    ? "Los archivos comprimidos (.zip, .rar) no están disponibles para generar recursos con IA ni Método Psicópata."
                                    : "Los enlaces web no están disponibles para generar recursos con IA ni Método Psicópata."
                                }
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0 flex items-center gap-1 ${
                                      isArchive
                                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    }`}
                                  >
                                    {isArchive ? <FileArchive className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                                    <span>{isArchive ? "ZIP" : "ENLACE"}</span>
                                  </span>
                                  <div className="min-w-0">
                                    <h5 className="text-xs sm:text-sm font-semibold truncate line-through">
                                      {doc.nombre}
                                    </h5>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                      {isArchive
                                        ? "Archivo comprimido (ZIP/RAR) • No ejecutable"
                                        : "Enlace web o Google Drive • Solo lectura"}
                                    </p>
                                  </div>
                                </div>

                                <span className="text-[10px] font-semibold text-amber-500/90 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg shrink-0">
                                  No disponible para IA
                                </span>
                              </div>
                            );
                          }

                          // Caso 2: DOCUMENTOS REALES (PDF, DOCX, TXT, PPT) -> Elegibles
                          const docType: "pdf" | "docx" | "txt" | "ppt" =
                            fmt.includes("DOC") ||
                            fmt.includes("WORD") ||
                            doc.nombre.toLowerCase().endsWith(".docx") ||
                            doc.nombre.toLowerCase().endsWith(".doc")
                              ? "docx"
                              : fmt.includes("TXT") ||
                                fmt.includes("MD") ||
                                doc.nombre.toLowerCase().endsWith(".txt") ||
                                doc.nombre.toLowerCase().endsWith(".md")
                              ? "txt"
                              : fmt.includes("PPT") ||
                                doc.nombre.toLowerCase().endsWith(".pptx") ||
                                doc.nombre.toLowerCase().endsWith(".ppt")
                              ? "ppt"
                              : "pdf";

                          return (
                            <div
                              key={doc.id_documento}
                              onClick={() => {
                                const chosen: MaterialFile = {
                                  id: `doc_${doc.id_documento}`,
                                  backendDocId: doc.id_documento,
                                  name: doc.nombre,
                                  subject: currentRepo?.nombre || "Repositorio Académico",
                                  size: doc.tamano || "1.0 MB",
                                  type: docType,
                                  isLink: false,
                                  isArchive: false,
                                  previewText: doc.descripcion || doc.nombre,
                                };
                                setMaterials((prev) => [chosen, ...prev.filter((m) => m.id !== chosen.id)]);
                                setSelectedMaterialId(chosen.id);
                                setIsRepoExplorerOpen(false);
                                setSelectedRepoId(null);
                              }}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? isLightMode
                                    ? "bg-red-50/80 border-red-500 ring-2 ring-red-400/30 shadow-sm"
                                    : "bg-red-950/40 border-red-500 ring-2 ring-red-500/30 shadow-sm"
                                  : isLightMode
                                  ? "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 hover:border-slate-300"
                                  : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-200 hover:border-white/[0.15]"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0 ${
                                    docType === "pdf"
                                      ? "bg-rose-500/15 text-rose-600 border border-rose-500/25"
                                      : docType === "docx"
                                      ? "bg-blue-500/15 text-blue-600 border border-blue-500/25"
                                      : docType === "ppt"
                                      ? "bg-amber-500/15 text-amber-600 border border-amber-500/25"
                                      : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/25"
                                  }`}
                                >
                                  {docType.toUpperCase()}
                                </span>

                                <div className="min-w-0">
                                  <h4 className="text-xs sm:text-sm font-bold truncate">{doc.nombre}</h4>
                                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                    {currentRepo?.nombre} &bull; {doc.tamano || "1.0 MB"} &bull; <strong className="text-red-400 font-semibold">{getCreditsByFileSize(doc.tamano)} créditos</strong>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Seleccionado</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                                      isLightMode
                                        ? "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
                                        : "text-red-300 hover:text-white bg-red-500/15 hover:bg-red-500/25 border-red-500/30"
                                    }`}
                                  >
                                    Elegir
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Footer */}
              <div className={`p-4 sm:p-5 border-t flex items-center justify-between text-xs text-slate-400 ${isLightMode ? "border-slate-100 bg-slate-50/50" : "border-white/[0.08] bg-black/20"}`}>
                <span>
                  {selectedRepoId === null
                    ? `${equipos.length} repositorios creados`
                    : `Mostrando materiales de ${(equipos.find((e) => e.id_equipo === selectedRepoId)?.nombre) || "repositorio"}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRepoExplorerOpen(false);
                    setSelectedRepoId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Informativo: Tarifas de Créditos por Peso del Archivo */}
        {showCreditTiersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
                isLightMode ? "bg-white border-slate-200 text-slate-900" : "bg-[#0f0709] border-red-500/30 text-white"
              }`}
            >
              <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${isLightMode ? "border-slate-100 bg-red-50/40" : "border-white/[0.08] bg-white/[0.02]"}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Tarifas Oficiales Dalat (Método Psicópata)</h3>
                    <p className="text-xs text-slate-400">Consumo de créditos según el peso del documento</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreditTiersModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="rounded-2xl border overflow-hidden border-slate-200 dark:border-white/[0.08]">
                  <table className="w-full text-left text-xs">
                    <thead className={isLightMode ? "bg-slate-100 text-slate-700" : "bg-white/[0.04] text-slate-300"}>
                      <tr>
                        <th className="p-3 font-bold">Peso del PDF / Archivo</th>
                        <th className="p-3 font-bold">Tipo típico</th>
                        <th className="p-3 font-bold text-right">Costo (por reto)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                      {DALAT_FILE_CREDIT_TIERS.map((tier, idx) => (
                        <tr key={idx} className={isLightMode ? "hover:bg-slate-50" : "hover:bg-white/[0.02]"}>
                          <td className="p-3 font-bold text-red-500">{tier.tierName}</td>
                          <td className="p-3 text-slate-400">{tier.typicalType}</td>
                          <td className="p-3 text-right">
                            <span className={`px-2.5 py-1 rounded-full font-extrabold text-xs border ${tier.badgeColor}`}>
                              {tier.credits} créditos
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${isLightMode ? "bg-red-50/60 border-red-200 text-red-950" : "bg-red-950/20 border-red-500/20 text-red-200"}`}>
                  <p className="font-semibold">⚡ Desafío Muerte Súbita con IA Real:</p>
                  <p className="text-[11px] opacity-90">
                    El Método Psicópata analiza el documento completo para generar preguntas trampas y de alta retención. La tarifa depende únicamente del tamaño del archivo seleccionado.
                  </p>
                </div>
              </div>

              <div className={`p-4 border-t flex justify-end ${isLightMode ? "border-slate-100 bg-slate-50" : "border-white/[0.08] bg-white/[0.02]"}`}>
                <button
                  type="button"
                  onClick={() => setShowCreditTiersModal(false)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
