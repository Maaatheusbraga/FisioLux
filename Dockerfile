# syntax=docker/dockerfile:1

# Esqueleto Fase 1 — build real após scaffold Next.js (Fases 2–3)
# Target: Next.js standalone em VPS

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json package-lock.json* ./
# RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# RUN npx prisma generate
# RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
# USER nextjs
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
# CMD ["node", "server.js"]
CMD ["node", "-e", "console.log('FisioLux: Dockerfile esqueleto — ative o build nas fases seguintes')"]
