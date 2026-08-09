# Continuidade FisioLux — retomar exatamente daqui

> **Para o próximo Cursor / outra máquina:** leia este arquivo **primeiro**, depois `docs/PHASES.md`, `PRODUCT.md`, `CONTEXT.md` e `docs/ARCHITECTURE.md`.  
> **Última atualização:** 2026-08-09  
> **Ponto de parada:** Fase **9 — Prontuário** entregue (aguardando validação). **Próxima:** Fase **10 — Arquivos** (só após “pode seguir”).

---

## 1. O que é o produto (em uma frase)

Sistema web de gestão para clínicas de fisioterapia com a **Timeline do paciente no centro**. Sessões = registro clínico do que foi feito, **não** agenda/calendário.

## 2. Onde paramos

| Item | Status |
| --- | --- |
| Fases 1–8 | **Concluídas e validadas pelo usuário** |
| Fase 9 (Prontuário) | **Entregue** — aguardar validação |
| Fase 10 (Arquivos) | **Próxima** — aguardar “pode seguir” após validar a 9 |
| Agenda (antiga Fase 11) | **Cancelada** nesta versão |

## 2.1 Tarefas / débitos (fora da fase atual)

| Tarefa | Status | Notas |
| --- | --- | --- |
| Ajustar os pop-ups da aplicação | Pendente | BL-001 — `confirm()` nativo |
| Avaliação musculoesquelética estruturada | **Feito** | BL-002 — ficha em `dados_complementares`; prioridade sobre anamnese |

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
17. **Avaliação > Anamnese** — a ficha pedida pelo cliente é a **Avaliação musculoesquelética** (`AVALIAÇÃO/`). Onde houver sobreposição com anamnese, a **Avaliação é a prioridade de produto/UI**. Anamnese permanece no schema/prontuário como módulo secundário (não compete pelo mesmo fluxo principal). Plano e Evolução continuam entidades separadas (não embutir no formulário de avaliação).

## 4. Infra já existente (não recriar do zero)

- Repositório GitHub: https://github.com/Maaatheusbraga/FisioLux.git
- Projeto Supabase (região São Paulo): ref `ahihcqxxjyjfnhyrllcs`
- Auth URLs (dev): Site `http://localhost:3000`, redirect `http://localhost:3000/callback/**`
- Em redes **só IPv4**: Session pooler `:5432` no `DIRECT_URL` e Transaction `:6543` no `DATABASE_URL`
- Migrations + seed + `auth:bootstrap-admin` já rodaram; `npm run dev` é o fluxo local

**Segredos:** `.env` **nunca** vai no Git.

## 5. Como subir o projeto em outra máquina

```bash
git clone https://github.com/Maaatheusbraga/FisioLux.git
cd FisioLux
cp .env.example .env
# Preencher Supabase
npm install
npm run db:migrate
npm run dev
```

> Continue o FisioLux a partir de `CONTINUIDADE.md`. Fases 1–9 (validar 9 se pendente). Próxima é a Fase 10 — Arquivos. Não pule fases.

## 6. O que a Fase 9 entregou (contexto útil)

- Aba **Prontuário** na ficha do paciente + menu `/prontuario` (busca)
- Anamnese, avaliação (inicial/periódica), plano, evolução (opcional vínculo a sessão), alta + reabertura
- Soft delete nos registros (alta não soft-deleta — reabre)
- Timeline na mesma transação; FKs de prontuário no evento
- Permissão: `prontuario.acessar` (admin + fisioterapeuta; **não** recepção)
- Doc: `docs/FASE-9.md`

Arquivos-chave:

- `repositories/prontuario/prontuario-repository.ts`
- `services/prontuario/prontuario-service.ts`
- `features/prontuario/*`
- `app/(app)/pacientes/[id]/prontuario/**`
- `app/(app)/prontuario/page.tsx`

## 7. Próxima fase — 10 Arquivos (escopo esperado)

Upload/metadados via StorageService (fotos, vídeos, categorias fixas, soft delete → `lixeira/`). Ver `docs/STORAGE.md`.

**Antes de codar a Fase 10:** só após o usuário validar a Fase 9 e autorizar.

## 8. Mapa rápido das próximas fases

| Fase | Foco |
| --- | --- |
| 10 | Arquivos / StorageService |
| 11 | ~~Agenda~~ cancelada |
| 12 | Dashboard (sem próximos agendamentos) |
| 13 | Exportação PDF |
| — | Revisão final |

## 9. Arquitetura e docs de referência

| Doc | Uso |
| --- | --- |
| `CONTINUIDADE.md` (este) | Ponto de retomada |
| `docs/PHASES.md` | Status das fases |
| `docs/BACKLOG.md` | Débitos (ex.: pop-ups) |
| `docs/FASE-1.md` … `docs/FASE-9.md` | Entregas por fase |
| `docs/STORAGE.md` | Storage (Fase 10) |
| `docs/adr/` | Decisões (ex.: ADR 011 alta) |

## 10. Padrões de código que o agent deve manter

- Português nas tabelas/colunas e na UI
- Services com `assertPermissao`; repositories sem regra de negócio pesada
- Toda ação clínica relevante → `TimelineService.registrar` na **mesma** `prisma.$transaction`
- Server Actions: rethrow `NEXT_REDIRECT` no `catch`
- Soft delete (`deleted_at`), não hard delete clínico
- UI: tokens OKLCH / shell existente
- Respostas ao usuário em **português**
- Commits só se o usuário pedir; não commitar `.env`

## 11. Checklist mental ao reabrir o chat

1. Ler `CONTINUIDADE.md`
2. Confirmar `docs/PHASES.md` (Fase 9 entregue; 10 pendente de autorização)
3. Confirmar `.env` local e `npm run dev`
4. Conferir `docs/BACKLOG.md` se for tratar débito
5. Propor / implementar **somente Fase 10** após o usuário autorizar
6. Ao terminar: `docs/FASE-10.md` + atualizar docs + aguardar validação

---

*Atualizado ao entregar a Fase 9, antes da validação e da Fase 10.*
