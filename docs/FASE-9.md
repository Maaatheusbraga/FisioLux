# Fase 9 concluída — Prontuário

## O que foi desenvolvido

- Prontuário clínico do paciente: **anamnese**, **avaliação**, **plano terapêutico**, **evolução** e **alta**
- Soft delete nos registros clínicos (exceto alta — reabertura via `data_reabertura`)
- Eventos na Timeline na **mesma** `$transaction` de cada ação
- Alta altera `status` do paciente para `alta`; **reabrir tratamento** volta para `em_tratamento` + evento `tratamento_reaberto`
- Aba **Prontuário** na ficha do paciente (somente perfil clínico)
- Entrada pelo menu `/prontuario` com busca LIKE de paciente
- Nav **Prontuário** disponível (`prontuario.acessar`)

## Timeline

| Ação | Evento |
| --- | --- |
| Criar/atualizar/excluir anamnese | `anamnese_criada` / `anamnese_atualizada` |
| Criar/atualizar/excluir avaliação | `avaliacao_criada` / `avaliacao_atualizada` |
| Criar/atualizar/excluir plano | `plano_terapeutico_criado` / `plano_terapeutico_atualizado` |
| Criar/atualizar/excluir evolução | `evolucao_criada` / `evolucao_atualizada` |
| Registrar alta | `alta_registrada` |
| Reabrir tratamento | `tratamento_reaberto` |

FKs opcionais no evento: `anamnese_id`, `avaliacao_id`, `plano_terapeutico_id`, `evolucao_id`, `alta_id` (e `sessao_id` na evolução).

## Rotas

| Rota | Função |
| --- | --- |
| `/prontuario` | Busca paciente → abre aba prontuário |
| `/pacientes/[id]?aba=prontuario` | Painel do prontuário |
| `/pacientes/[id]/prontuario/anamnese/nova` | Nova anamnese |
| `/pacientes/[id]/prontuario/anamnese/[registroId]/editar` | Editar |
| `/pacientes/[id]/prontuario/avaliacao/nova` | Nova avaliação |
| `/pacientes/[id]/prontuario/avaliacao/[registroId]/editar` | Editar |
| `/pacientes/[id]/prontuario/plano/novo` | Novo plano |
| `/pacientes/[id]/prontuario/plano/[registroId]/editar` | Editar |
| `/pacientes/[id]/prontuario/evolucao/nova` | Nova evolução |
| `/pacientes/[id]/prontuario/evolucao/[registroId]/editar` | Editar |
| `/pacientes/[id]/prontuario/alta/nova` | Registrar alta |

## Permissão

- `prontuario.acessar` — administrador e fisioterapeuta
- Recepção **não** vê a aba nem o menu

## Arquivos principais

- `repositories/prontuario/prontuario-repository.ts`
- `services/prontuario/prontuario-service.ts`
- `lib/validations/prontuario.ts`
- `features/prontuario/actions.ts`
- `features/prontuario/components/*`
- `app/(app)/prontuario/page.tsx`
- `app/(app)/pacientes/[id]/prontuario/**`
- `repositories/timeline/timeline-repository.ts` (FKs de prontuário)

## Como testar

1. Login como admin ou fisioterapeuta
2. Abra um paciente → aba **Prontuário** (ou menu Prontuário → busca)
3. Registre anamnese, avaliação, plano e evolução
4. Confira os eventos na Timeline
5. Registre alta → status vira Alta; reabra o tratamento

## Checklist

- [x] Anamnese / Avaliação / Plano / Evolução / Alta
- [x] Timeline na mesma transação
- [x] Soft delete clínico (alta via reabertura)
- [x] Nav + aba na ficha
- [x] Recepção sem acesso
- [x] ADR 011 (status + evento + reabertura)
