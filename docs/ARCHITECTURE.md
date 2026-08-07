# FisioLux — Arquitetura (Fase 1)

## Visão

O **FisioLux** é uma aplicação web interna para clínicas de fisioterapia. O centro do produto é o **histórico clínico do paciente** organizado em uma **Timeline** cronológica — não um ERP de agendamento.

Nome da aplicação: **FisioLux**.

## Princípios

- Clean Architecture adaptada ao Next.js
- Componentes React **apenas renderizam**
- Regras de negócio nos **Services**
- Acesso a dados apenas via **Repositories**
- Upload/download apenas via **StorageService** (interface trocável)
- Multi-tenant por `clinica_id` sem billing
- Soft delete no domínio clínico/operacional
- Tabelas e colunas de negócio em **português** + `snake_case` (Prisma); `created_at` / `updated_at` / `deleted_at` permitidos

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, RHF, Zod |
| Backend | Server Actions + Route Handlers |
| Banco | PostgreSQL (Supabase Cloud) + Prisma 6 |
| Auth | Supabase Auth |
| Storage | Supabase Storage → futuro Cloudflare R2 via mesma interface |
| Deploy | VPS + Docker |

## Fluxo de dependências

```
app / features / components
        ↓
     hooks (opcional)
        ↓
     services
        ↓
   repositories
        ↓
   lib/prisma | lib/storage | lib/supabase
        ↓
   PostgreSQL / Supabase Storage / Supabase Auth
```

- `entities` e `types`: contratos de domínio e DTOs
- `utils` / `config`: helpers e configuração — sem regra de negócio
- `middleware`: proteção de rotas e sessão (implementação na Fase 3)

## Módulos (features) — escopo v1

| Feature | Responsabilidade | Fase |
| --- | --- | --- |
| `auth` | Login, logout, recuperação, sessão, perfis | 3 |
| `dashboard` | Indicadores simples (sem agenda) | 12 |
| `pacientes` | CRUD + status (ativo / em_tratamento / alta) | 5 |
| `timeline` | Eventos cronológicos + filtros | 6 |
| `sessoes` | Registro clínico de atendimentos | 7 |
| `protocolos` | CRUD reutilizável por clínica | 8 |
| `prontuario` | Anamnese, avaliações, plano, evoluções, alta | 9 |
| `arquivos` | Metadados + upload via StorageService | 10 |
| `usuarios` | Gestão de usuários da clínica | 3+ |
| `configuracoes` | Dados da clínica / preferências | 4+ |
| `busca` | Busca global | 5+ |
| `exportacao` | PDFs profissionais | 13 |

**Fora do escopo v1:** módulo de Agenda/calendário.

## Perfis e permissões (resumo)

| Perfil | Escopo |
| --- | --- |
| Administrador | Gestão + clínico (superconjunto) |
| Fisioterapeuta | Todo o clínico da **própria** clínica |
| Recepção | Cadastro de pacientes e dados cadastrais; **sem** prontuário clínico completo |

## Isolamento multi-tenant

1. Toda tabela de negócio com `clinica_id`
2. Usuário autenticado → uma clínica
3. Repositories **obrigatoriamente** filtram por `clinica_id` do contexto
4. RLS no Postgres como rede de segurança
5. Prisma usa connection privilegiada (ver `docs/AUTH.md`)

## Timeline

Cada Service de domínio, ao concluir uma mutação relevante, chama `TimelineService` **na mesma transação**.

## Arquivos

- Uma tabela `arquivos` (só metadados)
- Binários no Storage
- Nunca persistir URL pública
- Soft delete: metadado + move física para prefixo `lixeira/`
- Categorias: ver `docs/STORAGE.md`

## Estrutura de pastas

Ver `docs/STRUCTURE.md`.

## Decisões duras

Ver `docs/adr/` e `CONTEXT.md`.
