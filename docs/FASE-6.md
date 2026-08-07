# Fase 6 concluída — Timeline

## O que foi desenvolvido

- Timeline como **aba principal** da ficha do paciente
- Filtros: **período**, **tipo**, **profissional**
- Evento exibe: data/hora, tipo, descrição, responsável, arquivo relacionado (quando houver)
- Recepção vê só eventos **cadastrais**; clínico vê a timeline completa
- Paginação de eventos
- Aba **Cadastro** mantém a ficha detalhada

## Rotas

| Rota | Função |
| --- | --- |
| `/pacientes/[id]?aba=timeline` | Timeline (padrão) |
| `/pacientes/[id]?aba=cadastro` | Dados cadastrais |

## Arquivos principais

- `repositories/timeline/timeline-repository.ts`
- `services/timeline/timeline-service.ts`
- `config/timeline.ts`
- `lib/validations/timeline.ts`
- `features/timeline/components/*`
- `features/pacientes/components/paciente-abas.tsx`
- `app/(app)/pacientes/[id]/page.tsx`

## Como testar

1. Abra um paciente cadastrado
2. Aba Timeline deve mostrar `paciente_criado` (e atualizações)
3. Filtre por tipo / profissional / datas
4. Alternar para Cadastro e voltar

## Checklist

- [x] Timeline no centro da ficha
- [x] Filtros período / tipo / profissional
- [x] Responsável + descrição + arquivos relacionados
- [x] Permissão recepção vs clínico
- [x] Sem módulos de sessão/prontuário ainda (só eventos já emitidos)
