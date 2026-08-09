# Backlog FisioLux (fora das fases)

Tarefas anotadas pelo usuário / débitos de UX que **não** abrem uma fase nova sozinhas. Tratar quando autorizado (entre fases ou na revisão final).

| ID | Tarefa | Status | Contexto |
| --- | --- | --- | --- |
| BL-001 | Ajustar os pop-ups da aplicação | Pendente | Validação Fase 8. `confirm()` nativo — padronizar diálogos. |
| BL-002 | Avaliação musculoesquelética estruturada | **Feito** (2026-08-09) | Ficha do cliente em `Avaliacao.dados_complementares`. Avaliação prioritária no painel. |

## Ao retomar

### Pop-ups (BL-001)
1. Confirmar se trata agora ou na revisão final.
2. Mapear `confirm` / `alert` / diálogos ad-hoc.
3. Componente de diálogo do design system + trocar usos.

### Avaliação (BL-002)
1. Confirmar escopo P0 (dor, HDA, exame, hipótese, contraindicações) vs incluir US/procedimento.
2. Formulário seccionado na UI de Avaliação; anamnese fica secundária no painel.
3. Referência visual: pasta `AVALIAÇÃO/` (não commitar se for material sensível do cliente — preferir docs).
