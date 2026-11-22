# Regla de Diseño Mandatoria: UI/UX Pro Max

Para **cualquier** tarea que involucre:
- Diseño de interfaces o componentes
- Modificación de layouts, espaciados, colores, tarjetas o navegación
- Evaluación de experiencia de usuario (UX), densidad visual o accesibilidad
- Creación de nuevas pantallas o secciones

**Procedimiento obligatorio del agente:**
1. Consultar la skill local ubicada en `.agents/skills/ui-ux-pro-max/scripts/search.py` mediante comandos de python:
   - Para decisiones de diseño general / sistemas: `python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Dalat"`
   - Para componentes o dudas de UX específicas: `python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux`
   - Para implementación en Next.js / React / Tailwind: `python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack nextjs` o `--stack html-tailwind`
2. Aplicar rigurosamente los principios de contraste, jerarquía, tamaño de objetivos táctiles y reducción de carga cognitiva devueltos por la skill.
3. Validar los cambios visualmente con el subagente de navegador en `http://localhost:3000/`.
