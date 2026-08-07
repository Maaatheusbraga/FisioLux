# ADR 004 — Prisma + clinica_id + RLS como rede de segurança

## Status

Aceito

## Contexto

Clean Architecture pede Repositories. RLS do Supabase não se aplica automaticamente às queries Prisma com connection privilegiada.

## Decisão

Prisma é o caminho de dados. Todo repository filtra por `clinica_id`. RLS no Postgres é defesa em profundidade.

## Consequências

- Tipagem e queries complexas melhores
- Disciplina obrigatória nos repositories
- Políticas RLS ainda são criadas na Fase 2
