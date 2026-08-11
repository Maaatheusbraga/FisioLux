# Continuidade FisioLux — retomar exatamente daqui

> **Última atualização:** 2026-08-11 (noite)  
> **Branch:** `main` · último commit relevante: `431235d`  
> **Repo:** https://github.com/Maaatheusbraga/FisioLux.git  
> **Status:** MVP **no ar** na VPS + código mobile-first / anamnese deprecada no GitHub

---

## 1. Produto

Sistema web de gestão para clínicas de fisioterapia com a **Timeline do paciente no centro**.  
Sessões = registro clínico do atendimento (não agenda).

Perfil de uso: **mais celular/tablet** do que desktop — UI evoluída para mobile-first.

## 2. Onde paramos (estado atual)

| Item | Status |
| --- | --- |
| Fases 1–10, 12, 13 + revisão | **Concluídas** |
| Agenda (fase 11) | **Cancelada** |
| Usuários / Configurações | **Entregues** |
| Docker + deploy VPS | **No ar** (porta 3010) |
| Mobile-first (shell, cards, touch, abas) | **Entregue** (`2a954e1`) |
| Foto da câmera espelhada | **Corrigida** (normaliza EXIF + espelho; botão desfazer) |
| Anamnese genérica | **Deprecada na UI** — intake = Avaliação |
| Fix build Zod `contexto.default` | **Entregue** (`431235d`) |

### Decisão clínica recente (ADR 014 atualizada)

- **Avaliação** = fluxo principal de intake/exame.
- **Anamnese** não cria mais (rota `…/anamnese/nova` → avaliação).
- Campos familiar/social/hábitos/exames → `Avaliacao.dados_complementares.contexto`.
- Tabela `anamneses` **mantida** só para legado (editar/excluir + PDF “Anamnese (legado)”).
- Eixo do prontuário: **Avaliação → Plano → Evolução → Alta**.

## 3. Stack e infra

- Next.js 15 · React 19 · Prisma 6 · Supabase (Auth + Postgres + Storage)
- Supabase project ref: `ahihcqxxjyjfnhyrllcs` · bucket `fisiolux`
- Segredos **somente** em `.env` (nunca no Git) — há também `config/.env` no PC; o app usa o `.env` da raiz

### VPS (produção atual)

| | |
| --- | --- |
| IP | `187.77.240.221` |
| SSH | `root@187.77.240.221` |
| App | `/opt/FisioLux` |
| URL | http://187.77.240.221:3010 |
| Porta host | **3010** → container 3000 |
| Compose project | `-p fisiolux` |
| Container | `fisiolux-app` |
| OS | AlmaLinux el10 |
| Docker | CE 29.x + Compose plugin (repo CentOS; `get.docker.com` **não** funciona) |

Outros apps na mesma VPS (não mexer): `/opt/braga` :3000, Next em :3002, nginx 80/443/8080.

## 4. Setup local (PC)

```bash
git clone https://github.com/Maaatheusbraga/FisioLux.git
cd FisioLux
cp .env.example .env   # ou copiar .env que já funciona
npm install
npm run db:migrate
npm run dev            # http://localhost:3000
```

Admin: o mesmo usuário Supabase Auth já usado no dia a dia (seed só se for bootstrap novo).

## 5. Atualizar a VPS (após push no GitHub)

**Não cole logs no SSH** — digite só os comandos:

```bash
cd /opt/FisioLux
git pull
docker compose -p fisiolux build
docker compose -p fisiolux up -d
docker compose -p fisiolux ps
curl http://127.0.0.1:3010/api/health
```

Health esperado: `{"status":"ok","app":"FisioLux",...}`

Logs se algo falhar:

```bash
docker compose -p fisiolux logs --tail=80
```

O `.env` da VPS **não** vem do Git. Manter:

- `NODE_ENV=production`
- `PORT=3010`
- `APP_URL=http://187.77.240.221:3010`
- `DATABASE_URL` / `DIRECT_URL` / keys Supabase iguais ao ambiente que funciona
- `NEXT_PUBLIC_SUPABASE_URL=https://ahihcqxxjyjfnhyrllcs.supabase.co`
- `STORAGE_BUCKET=fisiolux`

No Supabase Auth → URL Configuration:

- Site URL: `http://187.77.240.221:3010`
- Redirect: `http://187.77.240.221:3010/**`

## 6. Mapa de módulos

| Área | Onde |
| --- | --- |
| Início | `/dashboard` |
| Pacientes + Timeline | `/pacientes` |
| Atendimentos | `/sessoes` |
| Protocolos | `/protocolos` |
| Prontuário | `?aba=prontuario` (avaliação, plano, evolução, alta) |
| Documentos | `/arquivos` + aba Documentos |
| Fotos/vídeos | aba Fotos + atendimento |
| PDF clínico | `/pacientes/[id]/exportar` |
| Busca | header (também no mobile) → `/pacientes?q=` |
| Usuários | `/usuarios` |
| Configurações | `/configuracoes` |

## 7. Docs úteis

| Doc | Para quê |
| --- | --- |
| `docs/DOCKER.md` | Deploy Docker |
| `docs/adr/014-avaliacao-prioritaria.md` | Avaliação vs anamnese |
| `docs/PHASES.md` / `docs/FASE-*.md` | Histórico de fases |
| `docs/REVISAO-FINAL.md` | Revisão do MVP |
| `docs/BACKLOG.md` | Backlog |
| `PRODUCT.md` / `DESIGN.md` | Produto e design |
| `CONTEXT.md` | Glossário |

## 8. UX vigente

- Menu: Início, Pacientes, Atendimentos, Protocolos, Documentos, Usuários, Configurações
- Mobile: drawer, busca no header, listas em cards, abas com scroll, alvos de toque maiores
- Jobs: Timeline = histórico · Atendimento = dia · Prontuário = clínico · Documentos ≠ Fotos
- PDF = clínico sem anexos/mídia

## 9. Próximas evoluções (opcional — não iniciado)

1. Barra inferior (atalhos mobile)
2. PWA / “Adicionar à tela inicial”
3. Comparador de fotos com pinch/zoom
4. Atalho WhatsApp na ficha
5. Modo rápido “maca” (foto + dor + nota)
6. Thumbnails no Storage
7. Domínio + HTTPS (Nginx já existe na VPS)
8. Job de purga da lixeira
9. Dashboard “sem atendimento há X dias”

## 10. Armadilhas conhecidas

- AlmaLinux: instalar Docker via `download.docker.com/linux/centos`, não `get.docker.com`
- Runner Docker: Prisma CLI precisa de deps completas (`npm install prisma` no stage runner) — senão `Cannot find module 'effect'`
- Porta 3000 já ocupada na VPS → FisioLux usa **3010**
- Firewall: `firewall-cmd --permanent --add-port=3010/tcp && firewall-cmd --reload`
- Não colar saída de log no terminal SSH (vira `command not found`)

## 11. Como retomar noutro PC

1. Clonar o repo / puxar `main`
2. Ler este arquivo + `PRODUCT.md`
3. Copiar `.env` (não está no Git) do PC antigo ou da VPS (`/opt/FisioLux/.env`)
4. `npm install && npm run dev` **ou** continuar só na VPS com a seção 5
5. Chat Cursor: apontar para este `CONTINUIDADE.md` e o que for fazer a seguir

---

*Atualizado ao concluir deploy VPS + mobile-first + deprecação da anamnese.*
