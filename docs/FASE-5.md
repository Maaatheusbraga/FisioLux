# Fase 5 concluída — Pacientes

## O que foi desenvolvido

- CRUD completo de pacientes (criar, listar, filtrar, visualizar, editar, exclusão lógica)
- Validação Zod (CPF obrigatório + dígitos verificadores, único por clínica)
- `PacienteRepository` com escopo `clinica_id`
- `PacienteService` + permissão `pacientes.gerenciar`
- Eventos de Timeline na mesma transação (`paciente_criado` / `_atualizado` / `_excluido`)
- UI: lista, filtros, formulário, detalhe
- Item **Pacientes** ativo na sidebar

## Rotas

| Rota | Função |
| --- | --- |
| `/pacientes` | Lista + busca + filtro de status |
| `/pacientes/novo` | Cadastro |
| `/pacientes/[id]` | Visualização |
| `/pacientes/[id]/editar` | Edição |

## Arquivos principais

- `repositories/pacientes/paciente-repository.ts`
- `repositories/timeline/timeline-repository.ts`
- `services/pacientes/paciente-service.ts`
- `services/timeline/timeline-service.ts`
- `lib/validations/paciente.ts`
- `features/pacientes/*`
- `utils/cpf.ts`, `utils/date.ts`
- `app/(app)/pacientes/**`

## Como testar

1. Login → **Pacientes**
2. **Novo paciente** com CPF válido (ex.: `390.533.447-05` — use um gerador válido)
3. Buscar por nome/CPF
4. Editar e excluir (soft delete)

## Checklist

- [x] Cadastro / pesquisa / filtros
- [x] Visualização / edição
- [x] Exclusão lógica
- [x] Validações + CPF único por clínica
- [x] Timeline events (sem UI da Timeline ainda — Fase 6)
