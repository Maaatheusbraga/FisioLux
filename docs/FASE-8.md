# Fase 8 concluída — Protocolos

## O que foi desenvolvido

- CRUD completo de protocolos terapêuticos da clínica
- Campos: nome, objetivo, descrição, tempo estimado (min), categorias (lista), observações, ativo
- Soft delete (`deleted_at` + desativa)
- Lista com busca (nome/objetivo/descrição/categoria) e filtro ativo/inativo
- Nav **Protocolos** disponível (`protocolos.gerenciar`)
- Sessões continuam listando/vinculando apenas protocolos **ativos**

## Timeline

Protocolos são modelos da **clínica** (sem `paciente_id`). A Timeline do paciente exige paciente, então o CRUD de protocolo **não** grava `protocolo_criado` / `protocolo_atualizado` na Timeline.

O evento que aparece no histórico do paciente continua sendo **`protocolo_vinculado`**, gerado na Fase 7 ao vincular protocolos em uma sessão. Os tipos `protocolo_criado` / `protocolo_atualizado` permanecem no enum para uso futuro (ex.: auditoria / feed da clínica).

## Rotas

| Rota | Função |
| --- | --- |
| `/protocolos` | Lista com busca e filtro |
| `/protocolos/novo` | Criar |
| `/protocolos/[id]` | Detalhe |
| `/protocolos/[id]/editar` | Editar |

## Permissão

- `protocolos.gerenciar` — administrador e fisioterapeuta
- Recepção **não** acessa protocolos

## Arquivos principais

- `repositories/protocolos/protocolo-repository.ts`
- `services/protocolos/protocolo-service.ts`
- `lib/validations/protocolo.ts`
- `features/protocolos/actions.ts`
- `features/protocolos/components/*`
- `app/(app)/protocolos/**`
- `config/navigation.ts` (`disponivel: true`)

## Como testar

1. Login como admin ou fisioterapeuta
2. Menu **Protocolos** → Novo protocolo
3. Preencha nome (obrigatório), tempo, categorias (vírgula), etc. → Criar
4. Confira na lista; edite; marque inativo; exclua (soft delete)
5. Em **Sessões** → Nova sessão, o protocolo ativo deve aparecer para vincular

## Checklist

- [x] CRUD de protocolos
- [x] Soft delete
- [x] Nav disponível
- [x] Integração de leitura com Sessões preservada
- [x] Sem inventar Timeline sem paciente
- [x] Recepção sem acesso
