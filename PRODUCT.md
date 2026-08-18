# Product

## Register

product

## Users

Profissionais internos de clínicas de fisioterapia: **Administrador**, **Fisioterapeuta** e **Recepção**. Não é self-service para o paciente.

## Product Purpose

O FisioLux registra o trabalho da clínica: cadastro, atendimento do dia, prontuário estruturado, fotos e a jornada do paciente. Após o login o profissional cai no **Início** (leitura rápida da clínica). A ficha do paciente concentra o trabalho. Sem agenda nesta versão.

## Como o dia a dia se divide

| Superfície | O que é | O que não é |
| --- | --- | --- |
| **Início** | Números e listas recentes para se orientar ao entrar | O lugar de registrar o atendimento |
| **Atendimento** | A sessão que aconteceu (ou acontece) naquele dia — procedimentos, dor, mídia | Documento estruturado de avaliação |
| **Prontuário** | Avaliação, plano, evolução e alta — texto clínico no tempo do tratamento | O log de cada clique no sistema |
| **Timeline / jornada** | Marcos do tratamento (cadastro, avaliação, sessões, fotos, alta) | Auditoria de edições, exclusões e “cadastro atualizado” |
| **Documentos / Fotos** | Papel e mídia anexados ao paciente | Substitutos do prontuário |

## Brand Personality

Preciso · calmo · confiável.

Ferramenta de consultório: some na tarefa. Não compete com ERP antigo nem com SaaS genérico.

## Anti-references

- ERP clínico antigo (densidade caótica, tabelas cinzas, clipart)
- SaaS purple-glow / glass / metric cards idênticos como identidade
- Agenda/calendário como centro (fora do escopo)
- Log de git disfarçado de prontuário

## Design Principles

1. **Início para se situar; ficha para trabalhar.** Login → dashboard. O ofício vive no paciente.
2. **Jornada, não auditoria.** A Timeline mostra marcos clínicos.
3. **Restrição visual.** Um accent teal; neutros limpos; peças pontuais (timeline, comparador, accordion), não skin nova.
4. **Densidade útil.** Dados clínicos legíveis; espaço em branco com propósito.
5. **Permissão visível.** O que a recepção não pode fazer, a UI não oferece.

## Accessibility & Inclusion

- Contraste de texto ≥ 4.5:1 (corpo); alvos grandes ≥ 3:1
- `prefers-reduced-motion`
- Teclado e foco visível
- Tema claro padrão; escuro opcional (toggle)
