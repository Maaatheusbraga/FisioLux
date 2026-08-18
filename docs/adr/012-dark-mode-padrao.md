# ADR 012 — Tema claro como padrão

## Status

Aceito (substitui dark-first)

## Decisão

Tema **claro** padrão no handshake (login e primeira carga). Toggle permanece para escuro. Clínicas trabalham sob fluorescente; o primeiro ecrã não deve parecer ferramenta de startup.

## Consequências

- Tokens light em `:root`; dark em `html.dark`
- Preferência em `localStorage` (`fisiolux-theme-v2`). A chave antiga `fisiolux-theme` é ignorada (era dark por default, não escolha do usuário).
