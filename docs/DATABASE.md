# Banco de dados — FisioLux (Fase 2)

## Visão

PostgreSQL no **Supabase Cloud**, modelado com **Prisma 6**.

- Tabelas/colunas de negócio em **português** + `snake_case`
- `created_at` / `updated_at` / `deleted_at` em inglês (padrão técnico)
- Multi-tenant por `clinica_id`
- Soft delete no domínio clínico/operacional
- Timeline e auditoria **sem** soft delete

## Tabelas

| Tabela | Papel |
| --- | --- |
| `clinicas` | Tenant |
| `usuarios` | Usuário da clínica ↔ `auth_user_id` (Supabase Auth) |
| `pacientes` | Cadastro + status (`em_tratamento` / `alta`) |
| `protocolos` | Protocolos reutilizáveis |
| `sessoes` | Registro clínico de atendimento (não é agenda) |
| `sessoes_protocolos` | N:N sessão ↔ protocolo |
| `anamneses` | Anamnese |
| `avaliacoes` | Avaliação inicial / periódica |
| `planos_terapeuticos` | Plano terapêutico |
| `evolucoes` | Evoluções clínicas |
| `altas` | Histórico de altas (reabertura registrada) |
| `arquivos` | Metadados de storage (sem binário) |
| `timeline_eventos` | Eventos cronológicos do paciente |
| `logs_auditoria` | Quem criou/alterou/excluiu |

## Constraints importantes

- CPF: 11 dígitos numéricos; **único por clínica** entre ativos (`deleted_at IS NULL`)
- E-mail de usuário: único por clínica entre ativos
- Escala de dor: 0–10 em `sessoes` e `evolucoes`
- Usuário ∈ **uma** clínica (`clinica_id` obrigatório)

## Migrations

1. `20260807180000_init` — enums, tabelas, FKs, índices Prisma
2. `20260807180100_constraints_e_rls` — checks, índices parciais, helpers RLS, policies

```bash
cp .env.example .env
# preencher DATABASE_URL (pooler :6543) e DIRECT_URL (pooler session :5432 ou Direct)
npx prisma migrate deploy
npm run db:seed
```

> **IPv4:** o host Direct (`db.*.supabase.co`) muitas vezes só resolve IPv6.
> Se `migrate` falhar com P1001, use o **Session pooler** (`...pooler.supabase.com:5432`) no `DIRECT_URL`.

Em desenvolvimento com shadow DB:

```bash
npx prisma migrate dev
```

## Seed

Cria **1 clínica** + **1 administrador**.

Variáveis:

- `SEED_CLINICA_NOME`
- `SEED_ADMIN_NOME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_AUTH_USER_ID` (opcional até Fase 3)

## RLS (rede de segurança)

- Habilitado em todas as tabelas de negócio
- **Sem** `FORCE ROW LEVEL SECURITY` → owner/Prisma continua operacional
- Policies para roles `authenticated` / `anon` (padrão Supabase)
- Helpers: `fisiolux_clinica_id()`, `fisiolux_perfil()`, `fisiolux_eh_clinico()`
- Isolamento por clínica; prontuário/timeline/sessões restritos a admin + fisioterapeuta
- Recepção: pacientes + arquivos cadastrais limitados; sem timeline clínica

A **fonte da verdade** na app continua sendo filtro `clinica_id` nos repositories (ADR 004).

## Prisma Client

```ts
import { prisma } from "@/lib/prisma";
```

Uso apenas em repositories/services — nunca em components.

## Versionamento

Prisma ORM **6.19** (estável com Supabase `url` + `directUrl`). Upgrade para Prisma 7 fica para avaliação futura (adapter obrigatório).
