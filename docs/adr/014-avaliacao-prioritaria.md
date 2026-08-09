# ADR 014 — Avaliação prioritária à anamnese

## Status

Aceito (2026-08-09)

## Contexto

O cliente entregou a **Ficha de Avaliação Musculoesquelética** (pasta `AVALIAÇÃO/`) como referência do que precisa na plataforma. Parte do conteúdo overlap com anamnese (queixa, histórico, medicações).

## Decisão

1. A **Avaliação** é o fluxo clínico principal de intake/exame.
2. Onde houver disputa de escopo/UI com **Anamnese**, vence a Avaliação.
3. Anamnese permanece no prontuário como módulo **secundário** (não remover do schema agora).
4. **Plano terapêutico** e **Evolução** continuam entidades separadas (seções 15–16 do papel não viram campos embutidos na avaliação).
5. Implementação: enriquecer `Avaliacao` (campos + `dados_complementares`), não criar segunda ficha concorrente.

## Consequências

- UI do prontuário deve destacar Avaliação; anamnese não compete pelo mesmo CTA principal.
- Backlog BL-002 cobre a ficha estruturada.
- PDF futuro (Fase 13) deve espelhar a avaliação musculoesquelética, não um “anamnese genérico”.
