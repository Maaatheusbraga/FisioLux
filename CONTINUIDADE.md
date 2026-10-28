# Continuidade FisioLux — retomar exatamente daqui

> **Última atualização:** 2026-10-28  
> **Branch:** `main`  
> **Repo:** https://github.com/Maaatheusbraga/FisioLux.git  
> **Status:** MVP no ar + auditoria de arquitetura/perf/segurança aplicada (commits `bf9416a` e `9fc631d`); falta reconectar Google Calendar e validar manualmente (ver seção 2.1)

---

## 1. Produto

Sistema web de gestão para clínicas de fisioterapia com a **Timeline do paciente no centro**.  
Diário clínico = **Evolução**. Atendimentos/sessões saíram da UI.

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
| Atendimentos (sessões) | **Retirados da UI** (ADR 015) — tabela legado |
| Ultrassom na avaliação | **Retirado da ficha** |
| Relógio da Timeline | **Corrigido** — instante real, fuso Brasília |

### Decisão clínica recente (ADR 014 atualizada)

- **Avaliação** = fluxo principal de intake/exame.
- **Anamnese** não cria mais (rota `…/anamnese/nova` → avaliação).
- Campos familiar/social/hábitos/exames → `Avaliacao.dados_complementares.contexto`.
- Tabela `anamneses` **mantida** só para legado (editar/excluir + PDF “Anamnese (legado)”).
- Eixo do prontuário: **Avaliação → Plano → Evolução → Alta**.

## 2.1 Auditoria de arquitetura/perf/segurança — 2026-10-27/28

Feita uma auditoria completa (claude code: 3 agentes de exploração — arquitetura, performance, segurança — + 1 agente de design do plano) e aplicadas 10 correções, já commitadas e deployadas na VPS.

**Commits:** `bf9416a` (as 10 correções) + `9fc631d` (fix de um bug encontrado durante a validação, ver abaixo). Ambos já em `origin/main` e já deployados na VPS no momento desta atualização.

**O que foi corrigido (resumo, do mais crítico):**
1. Exclusão de paciente exigia só a permissão genérica (`pacientes.gerenciar`) no servidor — Fisioterapeuta/Recepção conseguiam excluir paciente direto via action, só a UI escondia o botão. Corrigido para exigir `pacientes.excluir` (admin-only) no server.
2. Webhook do Google Calendar rodava o sync de forma síncrona no request — risco real de 504 (igual um bug que já tinha sido corrigido no callback OAuth). Corrigido para rodar em background (`after()`).
3. N+1 na sincronização da agenda (lookup de paciente/usuário por evento) — trocado por lookup em lote.
4. Galeria de fotos buscava 1 signed URL por item, todas no carregamento da página — trocado por carregamento lazy (`IntersectionObserver`).
5. Aba do prontuário limitada a 200 evoluções mais recentes (PDF exportado continua com histórico completo).
6. Dois métodos de repository sem filtro `clinica_id` corrigidos (agenda e storage key de paciente).
7. Uma action de agenda que chamava Prisma direto, pulando repository/service — corrigida.
8. Token do webhook do Google Calendar passou a ser assinado com HMAC (antes era o UUID puro da clínica).
9. Lógica duplicada de "paciente pertence à clínica" consolidada.
10. `Alta` ganhou `deleted_at` (soft delete) — faltava, era a única tabela clínica sem. Migration `prisma/migrations/20260827000000_alta_deleted_at/` já aplicada em produção (confirmada no log do `docker compose up` — "All migrations have been successfully applied").

**Bug extra encontrado e corrigido durante a validação (commit `9fc631d`):** upload de foto/arquivo mostrava "Não foi possível enviar o arquivo." mesmo quando o upload funcionava. Causa: `redirectComAviso` (usa `redirect()` do Next.js) estava dentro do mesmo `try/catch` que trata erros reais — o redirect "de sucesso" caía no catch genérico. Corrigido movendo o redirect para fora do try/catch (padrão já usado em todas as outras actions do sistema).

**Pendente (retomar daqui em qualquer PC):**
- [ ] **Reconectar o Google Calendar** em Configurações → Agenda → Conectar conta Google. Foi desconectado durante a auditoria (token do webhook mudou de formato) e a reconexão precisa de verificação OAuth em outro dispositivo (celular) que não estava disponível. Sem isso, o webhook automático da agenda fica mudo (mas o botão **Sincronizar** manual funciona normalmente nesse meio tempo).
- [ ] Depois de reconectar: criar evento de teste na Agenda, clicar em Sincronizar, confirmar que aparece certo.
- [ ] Testar upload de foto de novo (valida o fix do commit `9fc631d`) — a mensagem de sucesso deve aparecer certa agora.
- [ ] Dar alta em um paciente de teste e confirmar que aparece certo no prontuário (valida o `deleted_at` em `Alta`).
- [ ] Confirmar que Recepção/Fisioterapeuta não conseguem mais excluir paciente (deve dar erro de permissão).

**Nota:** o banco Supabase (`ahihcqxxjyjfnhyrllcs`) é o único ambiente — não há banco de dev/staging separado. O deploy na VPS (`docker compose -p fisiolux up -d`) já roda `prisma migrate deploy` automaticamente via entrypoint, então qualquer migration pendente é aplicada nesse passo.

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
| ~~Atendimentos~~ | **Retirado da UI** — `/sessoes` redireciona |
| Protocolos | `/protocolos` (biblioteca) |
| Prontuário | `?aba=prontuario` (avaliação, plano, evolução, alta) |
| Documentos | `/arquivos` + aba Documentos |
| Fotos/vídeos | aba Fotos |
| PDF clínico | `/pacientes/[id]/exportar` |
| Busca | header (também no mobile) → `/pacientes?q=` |
| Usuários | `/usuarios` |
| Configurações | `/configuracoes` |

## 7. Docs úteis

| Doc | Para quê |
| --- | --- |
| `docs/DOCKER.md` | Deploy Docker |
| `docs/adr/014-avaliacao-prioritaria.md` | Avaliação vs anamnese |
| `docs/adr/015-sem-atendimentos.md` | Sem Atendimentos; evolução = diário |
| `docs/PHASES.md` / `docs/FASE-*.md` | Histórico de fases |
| `docs/REVISAO-FINAL.md` | Revisão do MVP |
| `docs/BACKLOG.md` | Backlog |
| `PRODUCT.md` / `DESIGN.md` | Produto e design |
| `CONTEXT.md` | Glossário |

## 8. UX vigente

- Menu: Início, Pacientes, Protocolos, Documentos, Usuários, Configurações
- Mobile: drawer, busca no header, listas em cards, abas com scroll, alvos de toque maiores
- Jobs: Timeline = histórico · Evolução = diário · Prontuário = clínico · Documentos ≠ Fotos
- PDF = clínico sem anexos/mídia
- Ultrassom **não** entra na avaliação (pedido do cliente)

## 9. Próximas evoluções (opcional — não iniciado)

1. Barra inferior (atalhos mobile)
2. PWA / “Adicionar à tela inicial”
3. Comparador de fotos com pinch/zoom
4. Atalho WhatsApp na ficha
5. Modo rápido “maca” (foto + dor + nota)
6. Thumbnails no Storage
7. Domínio + HTTPS (Nginx já existe na VPS)
8. Job de purga da lixeira
9. Dashboard “sem evolução há X dias”

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
