# Estratégia de Docker

## Contexto

- App hospedada em **VPS Linux**
- Banco, Auth e Storage no **Supabase Cloud** (não sobe Postgres/Auth na VPS nesta versão)
- Docker é o caminho oficial de deploy; o aprendizado prático ocorre na hora do primeiro deploy

## Artefatos

| Arquivo | Função |
| --- | --- |
| `Dockerfile` | Build multi-stage da app Next.js (standalone) |
| `docker-compose.yml` | Sobe o serviço `app` + rede + env |
| `.env.example` | Modelo de variáveis |
| `docker/` | Scripts/notas auxiliares de VPS |

## O que roda no Compose (v1)

- Serviço `fisioLux-app` (Next.js)
- Healthcheck em `/api/health` (implementação futura mínima na Fase 3+)

**Não** sobe neste Compose: Postgres, Supabase Studio, Storage local.

## Variáveis críticas

Ver `.env.example`:

- `DATABASE_URL` — Postgres Supabase (Prisma)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — somente server
- `STORAGE_PROVIDER=supabase`
- `STORAGE_BUCKET=...`

## Fluxo de deploy (visão)

1. Build da imagem na VPS (ou CI)
2. `docker compose up -d`
3. Migrations Prisma (`prisma migrate deploy`) como step de release
4. Seed apenas em ambientes novos

## Fase atual

Arquivos Docker e `.env.example` existem como **esqueleto**. Build real e polish ocorrem junto com o app funcional; nenhum requisito de “aprender Docker agora” além de ter os arquivos versionados.
