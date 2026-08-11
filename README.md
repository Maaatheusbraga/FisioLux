# FisioLux

Sistema de gestão clínica focado no **histórico do paciente** e na **Timeline** — para clínicas de fisioterapia.

> Fase atual: **aplicação concluída** (fases 1–10, 12, 13 + revisão).  
> **Retomar / contexto:** [CONTINUIDADE.md](./CONTINUIDADE.md) · [docs/REVISAO-FINAL.md](./docs/REVISAO-FINAL.md)

## Stack

- Next.js 15 · React 19 · TypeScript · Tailwind
- Prisma 6 · PostgreSQL (Supabase Cloud)
- Supabase Auth · Supabase Storage
- Docker na VPS

## Documentação

| Doc | Conteúdo |
| --- | --- |
| [CONTINUIDADE.md](./CONTINUIDADE.md) | **Retomar o projeto** (contexto + ponto de parada) |
| [docs/REVISAO-FINAL.md](./docs/REVISAO-FINAL.md) | Encerramento desta versão |
| [CONTEXT.md](./CONTEXT.md) | Glossário de domínio |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Visão arquitetural |
| [docs/DATABASE.md](./docs/DATABASE.md) | Schema, migrations, RLS, seed |
| [docs/AUTH.md](./docs/AUTH.md) | Autenticação e permissões |
| [docs/FASE-3.md](./docs/FASE-3.md) | Entrega da Fase 3 |
| [docs/STRUCTURE.md](./docs/STRUCTURE.md) | Pastas, services, repositories |
| [docs/STORAGE.md](./docs/STORAGE.md) | Storage e categorias de arquivo |
| [docs/DOCKER.md](./docs/DOCKER.md) | Deploy Docker / VPS |
| [docs/PHASES.md](./docs/PHASES.md) | Fases do desenvolvimento |
| [docs/adr/](./docs/adr/) | Decisões arquiteturais |

## Desenvolvimento local

```bash
cp .env.example .env
# Preencher Supabase + DATABASE_URL / DIRECT_URL

npm install
npm run db:migrate
npm run db:seed
npm run auth:bootstrap-admin
npm run dev
```

Abra `http://localhost:3000/login`.

## Deploy (VPS + Docker)

Detalhes: [docs/DOCKER.md](./docs/DOCKER.md).

```bash
cp .env.example .env   # preencher Supabase + APP_URL da VPS
docker compose build
docker compose up -d
```

Banco/Auth/Storage ficam no **Supabase Cloud**; a VPS só roda a app.

## Escopo desta versão

Inclui: pacientes, timeline, sessões (registro), protocolos, prontuário, arquivos, usuários, configurações, dashboard simples, exportação PDF.

**Não inclui:** agenda/calendário de horários.

## Licença

Uso privado / projeto FisioLux.
