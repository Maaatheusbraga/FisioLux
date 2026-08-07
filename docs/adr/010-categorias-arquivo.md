# ADR 010 — Categorias de arquivo fixas + documento

## Status

Aceito

## Decisão

Enum fixo de categorias clínicas + `documento` como coringa com `descricao` livre. Laudos de ressonância usam `laudo`.

## Consequências

- Filtros e Timeline previsíveis
- Flexibilidade para anexos diversos sem categorias dinâmicas no banco
