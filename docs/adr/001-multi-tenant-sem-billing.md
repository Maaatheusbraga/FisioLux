# ADR 001 — Multi-tenant sem billing

## Status

Aceito

## Contexto

O sistema precisa isolar dados por clínica, mas não haverá pagamento nem onboarding self-service.

## Decisão

Multi-tenant no modelo (`clinica_id` + RLS) sem billing, planos ou signup público. Bootstrap via seed/script.

## Consequências

- Schema já preparado para várias clínicas
- Sem complexidade de assinatura
- Criação de clínicas é operacional, não produto
