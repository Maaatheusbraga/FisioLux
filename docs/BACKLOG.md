# Backlog FisioLux (fora das fases)

Tarefas anotadas pelo usuário / débitos de UX. Itens tratados na revisão final quando possível.

| ID | Tarefa | Status | Contexto |
| --- | --- | --- | --- |
| BL-001 | Ajustar os pop-ups da aplicação | **Feito** | `ConfirmProvider` + `ConfirmForm` |
| BL-002 | Avaliação musculoesquelética estruturada | **Feito** | Fase 9 |
| BL-003 | Comparador de fotos avançado | **Feito** | Slider + **Baixar PNG**; WhatsApp nativo fica futuro |
| BL-004 | Retirar ultrassom / atendimentos / sessão na evolução; relógio Timeline | **Feito** | ADR 015 · 2026-08-18 |

## Futuro (não bloqueia esta versão)

- Envio WhatsApp nativo do comparador
- Job de purga física da lixeira de storage
- Reset de senha pelo admin (hoje: fluxo Auth do próprio usuário)
- Exclusão física permanente de paciente (hoje: cascata lógica + storage na lixeira)

### Agenda — Google Calendar embed (ADR 007 v2)

A clínica usa uma conta Google compartilhada para toda a equipe.
A integração será via URL de embed (não OAuth), configurada pelo admin em Configurações.

**O que o admin precisará fazer no Google Calendar:**
1. Abrir o Google Calendar → engrenagem → Configurações
2. Clicar no calendário desejado (coluna esquerda)
3. Ir em "Integrar agenda"
4. Copiar o **"Código de incorporação"** (iframe) ou a **"URL secreta no formato iCal"**
5. Colar em Configurações → Agenda no FisioLux

**O que precisa ser desenvolvido:**
- Migration: adicionar `agenda_embed_url String?` na tabela `clinica`
- `Configurações → Agenda`: campo de URL + botão salvar + preview do iframe
- Rota `/agenda`: página com iframe responsivo (sem barra lateral desnecessária)
- Menu: item "Agenda" aparece somente quando a URL estiver configurada
- Permissão: leitura para todos os perfis; escrita apenas `administrador`

**Estimativa:** 1–2 dias de desenvolvimento quando priorizado.
