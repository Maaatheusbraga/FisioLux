# ADR 015 — Sem módulo de Atendimentos; Evolução é o diário

## Status

Aceito (2026-08-18)

## Contexto

O cliente pediu retirar **Atendimentos** (módulo de sessões) e o vínculo “sessão vinculada” na evolução. Já não via sentido operacional: o diário clínico é a **evolução**.

## Decisão

1. **Atendimentos saem da UI** (menu, dashboard, ficha, CTAs, PDF). Rotas `/sessoes*` redirecionam para o Início.
2. Tabela `sessoes` **permanece** no schema (legado), como anamnese.
3. **Evolução** é o registro do dia (sem campo de sessão).
4. Protocolos ficam só como **biblioteca** (não aplicados a um atendimento).
5. Timeline padrão **não lista** eventos `sessao_*` / `protocolo_vinculado`.
6. Ultrassonografia sai da ficha de avaliação (JSON legado preservado na edição).
7. Relógio da Timeline = instante real do save (`new Date()`), datas/horas no fuso `America/Sao_Paulo`.

## Consequências

- Eixo clínico: Avaliação → Plano → Evolução → Alta.
- Dashboard passa a contar evoluções, não sessões.
- Eventos antigos da Timeline (salvos com meio-dia UTC) **não** são reescritos.
