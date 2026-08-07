# Continuidade FisioLux — retomar exatamente daqui

> **Para o próximo Cursor / outra máquina:** leia este arquivo **primeiro**, depois `docs/PHASES.md`, `PRODUCT.md`, `CONTEXT.md` e `docs/ARCHITECTURE.md`.  
> **Última atualização:** 2026-08-07  
> **Ponto de parada:** Fase **7 — Sessões** validada e concluída. **Próxima:** Fase **8 — Protocolos**.

---

## 1. O que é o produto (em uma frase)

Sistema web de gestão para clínicas de fisioterapia com a **Timeline do paciente no centro**. Sessões = registro clínico do que foi feito, **não** agenda/calendário.

## 2. Onde paramos

| Item | Status |
| --- | --- |
| Fases 1–7 | **Concluídas e validadas pelo usuário** |
| Fase 7 (Sessões) | CRUD clínico + Timeline + busca de paciente por LIKE + docs |
| Fase 8 (Protocolos) | **Próxima a implementar** — aguardar autorização explícita |
| Agenda (antiga Fase 11) | **Cancelada** nesta versão |

**Regra de processo:** é proibido iniciar uma fase sem a anterior estar concluída e **autorizada**. Ao fim de cada fase: entregar resumo e esperar o “pode seguir”.

## 3. Decisões de produto (grilling) — não reabrir sem pedido

1. Multi-tenant **sem billing**; usuário ∈ **1 clínica**
2. Stack: Next.js 15 + React 19 + TS + Tailwind + Prisma 6 + Postgres (Supabase) + Supabase Auth
3. Clean Architecture: UI → Services → Repositories → Prisma
4. Tabelas/colunas em **português** (`snake_case`)
5. Soft delete no clínico; Timeline/auditoria permanecem
6. Timeline via `TimelineService` **na mesma transação** da ação
7. Recepção = cadastro (sem prontuário/timeline clínica completa)
8. Fisioterapeuta vê todos os pacientes da clínica
9. Admin = gestão + clínico
10. CPF obrigatório, único **por clínica**
11. Arquivos: soft delete → pasta `lixeira/`; upload = Fase 10
12. Categorias de arquivo fixas + `documento`
13. Alta = status do paciente + evento na Timeline
14. Dark mode padrão (+ light)
15. **Agenda fora do escopo**
16. Dashboard sem “próximos agendamentos”

## 4. Infra já existente (não recriar do zero)

- Repositório GitHub: https://github.com/Maaatheusbraga/FisioLux.git
- Projeto Supabase (região São Paulo): ref `ahihcqxxjyjfnhyrllcs`
- Auth URLs (dev): Site `http://localhost:3000`, redirect `http://localhost:3000/callback/**`
- Em redes **só IPv4**: `db.*.supabase.co` (Direct) falha → usar **Session pooler `:5432`** no `DIRECT_URL` e Transaction `:6543` no `DATABASE_URL` (ver `.env.example`)
- Migrations + seed + `auth:bootstrap-admin` já rodaram na máquina original
- Login validado; `npm run dev` era o fluxo local

**Segredos:** `.env` **nunca** vai no Git. Na outra máquina, copiar `.env` de forma segura **ou** recriar a partir do dashboard Supabase + `.env.example`.

## 5. Como subir o projeto em outra máquina

```bash
git clone https://github.com/Maaatheusbraga/FisioLux.git
cd FisioLux
cp .env.example .env
# Preencher Supabase (URL, anon, service_role, DATABASE_URL, DIRECT_URL, SEED_*)
npm install
npm run db:migrate          # se o banco já estiver migrado, só confirma
# Se banco novo / seed necessário:
# npm run db:seed
# npm run auth:bootstrap-admin
npm run dev
```

Abrir no Cursor a pasta do clone e dizer algo como:

> Continue o FisioLux a partir de `CONTINUIDADE.md`. Fases 1–7 concluídas. Próxima é a Fase 8 — Protocolos. Não pule fases; espere autorização ao fim de cada uma.

## 6. O que a Fase 7 entregou (contexto útil)

- Rotas: `/sessoes`, `/sessoes/nova`, `/sessoes/[id]`, `/sessoes/[id]/editar`
- Nav **Sessões** ativa (`config/navigation.ts`)
- CTA **Nova sessão** na ficha do paciente
- Eventos Timeline: `sessao_criada`, `sessao_atualizada`, `sessao_cancelada`, `protocolo_vinculado`
- Permissão: `sessoes.gerenciar` (admin + fisioterapeuta; **não** recepção)
- **UX:** em `/sessoes/nova` (menu Sessões), paciente é **busca LIKE** (nome/CPF), não `<select>` — componente `PacienteBuscaField`. Se a sessão nasce na ficha do paciente (`?paciente=`), o paciente fica fixo.
- Anexos da sessão = placeholder até Fase 10
- Vincular protocolos existentes = ok; **CRUD de protocolos = Fase 8**
- Doc da fase: `docs/FASE-7.md`

Arquivos-chave:

- `repositories/sessoes/sessao-repository.ts`
- `repositories/protocolos/protocolo-repository.ts` (só leitura por enquanto)
- `services/sessoes/sessao-service.ts`
- `features/sessoes/*`
- `features/pacientes/components/paciente-busca-field.tsx`
- `features/pacientes/actions.ts` → `buscarPacientesAction`

## 7. Próxima fase — 8 Protocolos (escopo esperado)

CRUD completo de protocolos da clínica:

- Campos típicos já no schema: nome, objetivo, tempo estimado, categorias, ativo, etc.
- Soft delete + eventos Timeline (`protocolo_criado`, `protocolo_atualizado`, …)
- Nav Protocolos `disponivel: true`
- Sessões já sabem listar/vincular protocolos ativos — completar o lado de cadastro/edição
- Permissão: `protocolos.gerenciar`

**Antes de codar a Fase 8:** confirmar escopo fino com o usuário se algo estiver ambíguo no schema/UI; depois implementar; depois entregar resumo e aguardar validação.

## 8. Mapa rápido das próximas fases

| Fase | Foco |
| --- | --- |
| 8 | Protocolos (CRUD) |
| 9 | Prontuário (anamnese, avaliação, plano, evolução, alta) |
| 10 | Arquivos / StorageService (fotos, vídeos, lixeira) |
| 11 | ~~Agenda~~ cancelada |
| 12 | Dashboard (sem próximos agendamentos) |
| 13 | Exportação PDF |
| — | Revisão final |

## 9. Arquitetura e docs de referência

| Doc | Uso |
| --- | --- |
| `CONTINUIDADE.md` (este) | Ponto de retomada |
| `docs/PHASES.md` | Status das fases |
| `PRODUCT.md` / `DESIGN.md` | Produto e visual |
| `CONTEXT.md` | Glossário |
| `docs/ARCHITECTURE.md` | Camadas |
| `docs/STRUCTURE.md` | Pastas |
| `docs/DATABASE.md` | Schema / RLS / seed |
| `docs/AUTH.md` | Auth e permissões |
| `docs/STORAGE.md` | Storage (Fase 10) |
| `docs/FASE-1.md` … `docs/FASE-7.md` | Entregas por fase |
| `docs/adr/` | Decisões arquiteturais |

## 10. Padrões de código que o agent deve manter

- Português nas tabelas/colunas e na UI
- Services com `assertPermissao`; repositories sem regra de negócio pesada
- Toda ação clínica relevante → `TimelineService.registrar` na **mesma** `prisma.$transaction`
- Server Actions: rethrow `NEXT_REDIRECT` no `catch`
- Soft delete (`deleted_at`), não hard delete clínico
- UI: tokens OKLCH / Plus Jakarta Sans / shell existente — não reinventar design system
- Respostas ao usuário em **português**
- Commits só se o usuário pedir; não commitar `.env`

## 11. Checklist mental ao reabrir o chat

1. Ler `CONTINUIDADE.md`
2. Confirmar `docs/PHASES.md` (Fase 7 OK, 8 pendente)
3. Confirmar `.env` local e `npm run dev`
4. Propor / implementar **somente Fase 8** após o usuário autorizar
5. Ao terminar: `docs/FASE-8.md` + atualizar `PHASES.md` / `README.md` + aguardar validação

---

*Gerado ao pausar após validação da Fase 7, antes da Fase 8.*
