# Continuidade FisioLux — retomar exatamente daqui

> **Última atualização:** 2026-08-11  
> **Status:** aplicação **concluída** no escopo desta versão (fases 1–10, 12, 13 + revisão). Agenda (11) cancelada.

---

## 1. Produto

Sistema web de gestão para clínicas de fisioterapia com a **Timeline do paciente no centro**. Sessões = registro clínico (não agenda).

## 2. Onde paramos

| Item | Status |
| --- | --- |
| Fases 1–10, 12, 13 | **Concluídas** |
| Revisão final | **Concluída** — `docs/REVISAO-FINAL.md` |
| Agenda | **Cancelada** |
| Usuários / Configurações (UI) | **Entregues** |

## 3. Stack e infra

- Next.js 15 · React 19 · Prisma 6 · Supabase (Auth + Postgres + Storage)
- Repo: https://github.com/Maaatheusbraga/FisioLux.git
- Supabase: `ahihcqxxjyjfnhyrllcs` · bucket `fisiolux`
- Segredos só em `.env` (nunca no Git)

## 4. Setup

```bash
git clone https://github.com/Maaatheusbraga/FisioLux.git
cd FisioLux
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

## 5. Mapa de módulos

| Área | Onde |
| --- | --- |
| Início | `/dashboard` |
| Pacientes + Timeline | `/pacientes` |
| Atendimentos (ex-Sessões) | `/sessoes` |
| Protocolos | `/protocolos` |
| Prontuário | aba na ficha do paciente (`?aba=prontuario`) |
| Documentos | `/arquivos` + aba Documentos na ficha |
| Fotos/vídeos | aba Fotos + atendimento |
| PDF clínico | botão na ficha → `/pacientes/[id]/exportar` |
| Busca | header → `/pacientes?q=` |
| Usuários | `/usuarios` |
| Configurações | `/configuracoes` |

## 6. Docs

`docs/PHASES.md`, `docs/FASE-*.md`, `docs/REVISAO-FINAL.md`, `docs/BACKLOG.md`, `PRODUCT.md`, `CONTEXT.md`.

## 7. UX (anti-confusão)

- Menu enxuto: Início, Pacientes, Atendimentos, Protocolos, Documentos, Usuários, Configurações
- Jobs: Timeline = histórico · Atendimento = dia · Prontuário = clínico estruturado · Documentos ≠ Fotos
- PDF = clínico sem anexos/mídia
- Pós-criação de usuário: instrução de login

## 8. Evoluções futuras (opcional)

- Envio WhatsApp nativo do comparador
- Job de purga da lixeira
- Dashboard com “sem atendimento há X dias”
- Nginx + HTTPS na VPS

## 9. Deploy

- Docker pronto: `Dockerfile`, `docker-compose.yml`, `docs/DOCKER.md`
- Subir na VPS: ver `docs/DOCKER.md`

---

*Gerado ao concluir a aplicação nesta versão.*
