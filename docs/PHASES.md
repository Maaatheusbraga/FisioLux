# Fases do desenvolvimento

É **proibido** iniciar uma fase sem concluir a anterior. Ao final de cada fase: entregar resumo, aguardar autorização.

| Fase | Nome | Status |
| --- | --- | --- |
| 1 | Arquitetura (pastas + estratégias) | **Concluída** |
| 2 | Modelagem do banco (Prisma, RLS, seed) | **Concluída** |
| 3 | Autenticação | **Concluída** |
| 4 | Layout / Design System | **Concluída** |
| 5 | Pacientes | **Concluída** |
| 6 | Timeline | **Concluída** |
| 7 | Sessões | **Concluída** |
| 8 | Protocolos | **Concluída** |
| 9 | Prontuário | **Concluída** |
| 10 | Arquivos / StorageService | **Concluída** |
| 11 | ~~Agenda~~ | **Cancelada nesta versão** (histórico > agendamento) |
| 12 | Dashboard (sem próximos agendamentos) | **Concluída** |
| 13 | Exportação PDF | **Concluída** |
| — | Revisão final | **Concluída** |

## Ajuste de escopo (grilling)

- Sem módulo de Agenda/calendário
- Dashboard sem “próximos atendimentos”
- Atendimentos/sessões **fora da UI** — diário = Evolução (ADR 015)

## Retomada

Aplicação concluída no escopo desta versão — ver [`CONTINUIDADE.md`](../CONTINUIDADE.md) e [`REVISAO-FINAL.md`](./REVISAO-FINAL.md).

Débitos residual / futuro: [`docs/BACKLOG.md`](./BACKLOG.md).
