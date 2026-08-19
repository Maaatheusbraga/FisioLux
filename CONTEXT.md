# FisioLux — Glossário de domínio

Vocabulário compartilhado do produto. Sem detalhes de implementação.

| Termo | Significado |
| --- | --- |
| **Clínica** | Unidade tenant do sistema. Toda informação operacional pertence a uma clínica. |
| **Usuário** | Pessoa autenticada vinculada a **uma** clínica, com um perfil (Administrador, Fisioterapeuta ou Recepção). |
| **Paciente** | Pessoa em tratamento na clínica. Identificado por CPF único **dentro** da clínica. |
| **Timeline** | Linha do tempo cronológica do paciente; centro da experiência. Cada ação relevante gera um evento. |
| **Evento de timeline** | Registro imutável (na prática) de algo que aconteceu: cadastro, avaliação, evolução, arquivo, alta, etc. |
| **Evolução** | Registro clínico do dia (diário). Substitui o antigo módulo de Atendimentos/sessões na UI. |
| **Sessão / Atendimento** | **Deprecado na UI.** Tabela `sessoes` só legado. |
| **Protocolo** | Modelo reutilizável de tratamento (nome, objetivo, tempo estimado, categorias), escopo da clínica. |
| **Prontuário** | Conjunto clínico do paciente: **avaliação** (intake principal), plano, evoluções e alta. Anamnese genérica foi deprecada (só legado). |
| **Alta** | Encerramento do tratamento: gera evento na Timeline e muda status do paciente para `alta` (reabrível). |
| **Arquivo** | Metadado de um anexo (foto, vídeo, laudo, etc.). Binário fica no Storage, nunca no Postgres. |
| **Categoria de arquivo** | Classificação fixa do anexo (`encaminhamento`, `laudo`, `foto_antes`, `documento`, …). |
| **Exclusão lógica** | Registro marcado com `deleted_at`; some da UI, permanece para histórico/auditoria. |
| **Auditoria** | Log de quem criou/alterou/excluiu e quando. |
| **Agenda** | Fora do escopo desta versão. Marcação de horários é outro sistema/produto. |
