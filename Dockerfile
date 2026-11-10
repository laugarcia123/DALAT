# ==============================================================================
# Dockerfile para Next.js 16 (Dalat StudyOS)
# Multi-stage build para máxima eficiencia y tamaño mínimo de imagen (~150MB)
# ==============================================================================

# ------------------------------------------------------------------------------
# ETAPA 1: Dependencias (deps)
# Instala únicamente las dependencias necesarias aprovechando la caché de Docker
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de definición de paquetes
COPY package.json package-lock.json* ./

# Instalar dependencias exactas con npm ci
RUN npm ci

# ------------------------------------------------------------------------------
# ETAPA 2: Compilación (builder)
# Construye el código para producción generando la versión standalone
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Ejecutar el build de Next.js
RUN npm run build

# ------------------------------------------------------------------------------
# ETAPA 3: Ejecución en Producción (runner)
# Imagen final limpia y ligera sin herramientas de compilación
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crear usuario y grupo sin privilegios de root por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos públicos estáticos
COPY --from=builder /app/public ./public

# Copiar los artefactos generados por el modo 'standalone'
# Configurar los permisos adecuados para el usuario nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no-root
USER nextjs

# Exponer el puerto de la aplicación
EXPOSE 3000

# Iniciar el servidor Next.js standalone
CMD ["node", "server.js"]
