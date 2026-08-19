# ADR 007 — Agenda fora do escopo desta versão; Google Calendar via embed planejado

## Status

Parcialmente aceito — agenda própria cancelada; integração Google Calendar mapeada para Fase futura.

## Contexto

O produto é o histórico clínico do paciente. Agendamento é outro problema/sistema.
A clínica já usa o Google Calendar como ferramenta de agenda — uma conta compartilhada
entre todos os usuários (não uma conta por profissional).

## Decisão v1 (mantida)

Cancelar o módulo Agenda próprio (antiga Fase 11) nesta versão.
Sessões são registros clínicos, não slots de calendário.
Dashboard sem "próximos atendimentos".

## Decisão v2 — Google Calendar embed (planejado)

Integrar o Google Calendar da clínica dentro do FisioLux via **embed de URL privada**,
configurável pelo administrador em Configurações.

### Por que URL embed e não OAuth?

A clínica usa **uma conta Google compartilhada** para toda a equipe.
Nesse cenário, OAuth por usuário seria desnecessário e complexo:
cada profissional teria que autorizar individualmente, mas todos veriam o mesmo calendário.

O Google Calendar oferece duas URLs de incorporação:
- **URL pública** — qualquer um com o link vê (adequado se o calendário for interno)
- **URL secreta (ICAL/embed privado)** — só quem tem o link vê; o Google gera nas
  Configurações → "Integrar agenda" → "URL secreta no formato iCal"

### Fluxo de configuração (a implementar)

1. Administrador acessa **Configurações → Agenda**
2. Cola a URL de embed fornecida pelo Google Calendar
   (Settings → Integrate calendar → "Embed code" ou "Secret address in iCal format")
3. O sistema salva a URL criptografada no banco (campo `agenda_embed_url` em `clinica`)
4. Uma nova aba **Agenda** aparece no menu para todos os usuários da clínica
5. A aba renderiza o Google Calendar via `<iframe>` com a URL configurada

### O que NÃO precisa

- OAuth 2.0 (não há conta individual por profissional)
- Email e senha do Google (o Google não permite isso em apps de terceiros)
- Sincronização bidirecional (a agenda continua sendo gerenciada no Google)

### O que PRECISA (quando for implementar)

- Campo `agenda_embed_url` (string, nullable) na tabela `clinica` — migration simples
- Página `Configurações → Agenda` com campo de URL + preview
- Nova rota `/agenda` com iframe responsivo
- Item de menu "Agenda" (visível apenas se `agenda_embed_url` estiver preenchida)
- Permissão de leitura: todos os perfis; escrita: apenas `administrador`

## Consequências

- Escopo menor e alinhado à Timeline (v1)
- Sem tabelas de agendamento no banco em Fase 2
- Recepção foca em cadastro; agenda fica no Google (situação atual)
- Quando implementado, a clínica mantém o Google Calendar como fonte da verdade —
  o FisioLux apenas o exibe dentro da mesma interface
