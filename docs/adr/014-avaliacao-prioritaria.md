# ADR 014 — Avaliação prioritária à anamnese

## Status

Aceito (2026-08-09) · **Atualizado (2026-08-11): anamnese descontinuada na UI**

## Contexto

O cliente entregou a **Ficha de Avaliação Musculoesquelética** (pasta `AVALIAÇÃO/`) como referência do que precisa na plataforma. Parte do conteúdo overlap com anamnese (queixa, histórico, medicações).

Na prática do FisioLux, anamnese genérica e avaliação competiam pelo mesmo intake: `queixa_principal` duplicada, HDA em dois formatos, e campos familiares/sociais/hábitos só na anamnese.

## Decisão

1. A **Avaliação** é o fluxo clínico principal de intake/exame.
2. **Anamnese genérica não é mais criada** na UI; rota `…/anamnese/nova` redireciona para `…/avaliacao/nova`.
3. Campos que eram exclusivos da anamnese (`historico_familiar`, `historico_social`, `habitos_vida`, `exames_complementares`) passam a `Avaliacao.dados_complementares.contexto`.
4. Tabela `anamneses` **permanece** no schema para registros legados (edição/exclusão lógica + PDF como “Anamnese (legado)”).
5. **Plano terapêutico** e **Evolução** continuam entidades separadas.

## Consequências

- Painel do prontuário: Avaliação → Plano → Evolução → Alta; seção de anamnese só aparece se houver legado.
- PDF prioriza avaliação musculoesquelética; anamneses antigas saem como legado.
- Timeline ainda pode exibir eventos `anamnese_*` históricos.
