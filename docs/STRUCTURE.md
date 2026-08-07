# Estrutura de pastas

```text
FisioLux/
├── app/                      # Next.js App Router (rotas — sem UI nesta fase)
│   ├── (auth)/               # Grupo público: login, recuperar senha, callback
│   ├── (app)/                # Grupo autenticado: módulos do sistema
│   └── api/                  # Route Handlers (health, webhooks futuros)
├── components/
│   ├── ui/                   # shadcn/ui (primitivos)
│   ├── layout/               # shell: sidebar, header, breadcrumb (Fase 4)
│   ├── shared/               # átomos reutilizáveis de produto
│   └── forms/                # blocos de formulário reutilizáveis
├── features/                 # UI + composição por domínio (sem regra de negócio)
│   ├── auth/
│   ├── pacientes/
│   ├── timeline/
│   ├── sessoes/
│   ├── protocolos/
│   ├── prontuario/
│   ├── arquivos/
│   ├── usuarios/
│   ├── configuracoes/
│   ├── dashboard/
│   ├── busca/
│   └── exportacao/
├── services/                 # Regras de negócio
│   ├── auth/
│   ├── pacientes/
│   ├── timeline/
│   ├── sessoes/
│   ├── protocolos/
│   ├── prontuario/
│   ├── arquivos/
│   ├── usuarios/
│   ├── clinicas/
│   ├── auditoria/
│   ├── busca/
│   ├── exportacao/
│   └── storage/              # StorageService (interface + Supabase)
├── repositories/             # Acesso a dados (Prisma), sempre com clinica_id
├── entities/                 # Entidades / modelos de domínio
├── hooks/                    # Hooks de UI (chamam services/actions)
├── lib/
│   ├── supabase/             # Clients Auth (browser/server/middleware)
│   ├── prisma/               # Cliente Prisma
│   ├── auth/                 # Sessão e permissões
│   ├── storage/              # Adapters de storage
│   ├── validations/          # Schemas Zod compartilhados
│   └── errors/               # Erros tipados da aplicação
├── types/                    # DTOs, enums compartilhados
├── utils/                    # Funções puras (cpf, data, format)
├── config/                   # Constantes e env tipado
├── middleware.ts             # Proteção de rotas + refresh de sessão
├── prisma/                   # Schema, migrations, seed
├── scripts/                  # Bootstrap admin e utilitários
├── docker/                   # Assets auxiliares de deploy
├── docs/                     # Arquitetura e ADRs
├── public/
├── CONTEXT.md
├── README.md
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Convenções

| Camada | Pode | Não pode |
| --- | --- | --- |
| `components/*` | JSX, props, estado de UI | Prisma, regras de negócio, Storage direto |
| `features/*` | Compor UI do módulo, chamar hooks/actions | Regra de negócio “escondida” no componente |
| `services/*` | Orquestrar casos de uso, permissões, Timeline, auditoria | Conhecer JSX |
| `repositories/*` | Queries Prisma, filtro `clinica_id`, soft delete | Regras de perfil/UX |
| `hooks/*` | Estado cliente, chamar server actions | Acessar banco direto |
| `app/*` | Rotas, server components finos, server actions delgadas | Lógica de negócio longa |

## Services previstos

| Service | Responsabilidade |
| --- | --- |
| `AuthService` | Sessão, login/logout, recuperação (orquestra Supabase Auth) |
| `PacienteService` | CRUD, status, validações de domínio |
| `TimelineService` | Criação de eventos (chamado pelos outros services) |
| `SessaoService` | Registro de sessões + evento timeline |
| `ProtocoloService` | CRUD de protocolos |
| `ProntuarioService` | Anamnese, avaliações, evoluções, alta |
| `ArquivoService` | Metadados + orquestra StorageService |
| `StorageService` | Upload, signed URL, delete→lixeira, download |
| `UsuarioService` | Usuários da clínica |
| `ClinicaService` | Dados da clínica |
| `AuditoriaService` | Logs de criação/alteração/exclusão |
| `BuscaService` | Busca global |
| `ExportacaoService` | Geração de PDFs |

## Repositories previstos

Espelhados por agregado: `PacienteRepository`, `TimelineRepository`, `SessaoRepository`, `ProtocoloRepository`, `ProntuarioRepository`, `ArquivoRepository`, `UsuarioRepository`, `ClinicaRepository`, `AuditoriaRepository`.

Todo método de leitura/escrita recebe ou resolve `clinicaId` do contexto autenticado.
