# Fase 2 concluída — Modelagem do banco

## O que foi desenvolvido

- Schema Prisma completo (enums, tabelas, relações, índices)
- Migration inicial + migration de constraints/RLS
- Seed (1 clínica + 1 admin)
- Client Prisma em `lib/prisma`
- Documentação do banco (`docs/DATABASE.md`)
- **Nenhuma interface** criada

## Arquivos criados

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/migrations/migration_lock.toml`
- `prisma/migrations/20260807180000_init/migration.sql`
- `prisma/migrations/20260807180100_constraints_e_rls/migration.sql`
- `lib/prisma/client.ts`
- `lib/prisma/index.ts`
- `docs/DATABASE.md`
- `docs/FASE-2.md`

## Arquivos alterados

- `package.json` (deps Prisma, scripts `db:*`)
- `types/dominio.ts` (enums alinhados ao schema)
- `prisma/README.md`
- `docs/PHASES.md`
- `README.md`
- `.env.example`
- `.gitignore` (se necessário para `node_modules`)

## Decisões desta fase

1. **Prisma 6.19** (não 7) — `directUrl` nativo, sem adapter; melhor encaixe com Supabase agora
2. **Agenda ausente** do modelo — sem tabelas de agendamento
3. **Unicidade CPF/e-mail** via índice parcial (`deleted_at IS NULL`), não unique absoluto
4. **Altas** como tabela histórica (sem soft delete) + `status` no paciente
5. **RLS** como defesa; Prisma owner sem FORCE; policies por perfil clínico vs recepção
6. **`auth_user_id` opcional** no seed até Fase 3 vincular Auth

## Como aplicar no Supabase

1. Copiar `.env.example` → `.env` com connection strings do projeto Supabase
2. `npx prisma migrate deploy`
3. `npm run db:seed`
4. (Fase 3) criar usuário no Auth e setar `SEED_ADMIN_AUTH_USER_ID` / update no banco

## Checklist

- [x] Prisma schema
- [x] Relacionamentos / índices / constraints
- [x] Migrations
- [x] Seed inicial
- [x] Políticas RLS
- [x] Sem telas
