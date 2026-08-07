# ADR 011 — Alta como status + evento

## Status

Aceito

## Decisão

Alta gera evento na Timeline e altera status do paciente para `alta`. Tratamento pode ser reaberto depois.

## Consequências

- Status previstos: ao menos `em_tratamento` | `alta` (detalhe fino na Fase 2)
- Listagens padrão focam pacientes ativos / em tratamento
