# ADR 002 — Usuário pertence a uma clínica

## Status

Aceito

## Contexto

Profissionais podem teoricamente atuar em mais de uma unidade.

## Decisão

Cada usuário pertence a **exatamente uma** clínica. Sem seletor de clínica na v1.

## Consequências

- Sessão e middleware simples
- Troca de unidade = outra conta (ou evolução futura)
