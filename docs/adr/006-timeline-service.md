# ADR 006 — Timeline via TimelineService na mesma transação

## Status

Aceito

## Contexto

Toda ação relevante deve aparecer na Timeline.

## Decisão

Services de domínio chamam `TimelineService` na **mesma transação** da mutação. Sem triggers Postgres e sem bus assíncrono na v1.

## Consequências

- Eventos explícitos e testáveis
- Consistência forte dado↔evento
- Cada novo caso de uso deve lembrar de emitir o evento
