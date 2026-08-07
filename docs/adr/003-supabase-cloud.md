# ADR 003 — Supabase Cloud + app na VPS

## Status

Aceito

## Contexto

Deploy atual do time é VPS; custo e ops importam. Self-host Supabase exige mais RAM e manutenção.

## Decisão

Auth, PostgreSQL e Storage no **Supabase Cloud**. Next.js sobe na VPS via Docker.

## Consequências

- Compose enxuto (só app)
- Dependência de serviço externo
- Custo controlável no free/pro tier do Supabase
