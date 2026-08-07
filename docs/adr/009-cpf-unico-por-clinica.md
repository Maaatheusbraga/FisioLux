# ADR 009 — CPF obrigatório e único por clínica

## Status

Aceito

## Decisão

CPF do paciente é obrigatório. Unicidade: `(clinica_id, cpf)` onde `deleted_at IS NULL`.

## Consequências

- Constraint/índice único parcial na Fase 2
- Validação Zod de dígitos
- Mesmo CPF pode existir em outra clínica do multi-tenant
