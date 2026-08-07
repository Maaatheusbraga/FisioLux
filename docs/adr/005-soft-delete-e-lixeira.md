# ADR 005 — Soft delete clínico e arquivos em lixeira/

## Status

Aceito

## Contexto

Histórico clínico e LGPD operacional: apagar de verdade é arriscado; storage tem custo.

## Decisão

- Soft delete (`deleted_at`) em entidades clínicas/operacionais
- Timeline e auditoria não são apagadas na operação normal
- Arquivos: soft delete no metadado + move do objeto para `lixeira/`

## Consequências

- Recuperação possível
- Jobs de purga opcionais depois
- Queries padrão sempre excluem `deleted_at IS NOT NULL`
