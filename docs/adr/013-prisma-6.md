# ADR 013 — Prisma 6.19 (não 7) na Fase 2

## Status

Aceito

## Contexto

`npm install prisma` trouxe a major 7, que exige `prisma.config.ts` e driver adapter para PostgreSQL.

## Decisão

Fixar **Prisma ORM 6.19** + `@prisma/client` 6.19 com `url` + `directUrl` no schema (padrão Supabase).

## Consequências

- Menos atrito com Supabase Cloud e migrations
- Upgrade para Prisma 7 pode ser avaliado depois (com adapter `pg`)
- Warning de depreciação do campo `package.json#prisma.seed` é aceitável na 6.x
