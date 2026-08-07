# Fase 7 concluída — Sessões

## O que foi desenvolvido

- Registro clínico de sessões (não é agenda/calendário)
- Campos: data/hora, profissional, procedimentos, equipamentos, escala de dor 0–10, observações, status
- Vínculo a protocolos **já existentes** (CRUD de protocolos = Fase 8)
- Soft delete + eventos na Timeline (`sessao_criada`, `sessao_atualizada`, `sessao_cancelada`, `protocolo_vinculado`)
- Lista da clínica com filtro de status
- CTA **Nova sessão** na ficha do paciente
- Anexos (fotos/vídeos) deixados para a Fase 10 — UI com placeholder

## Rotas

| Rota | Função |
| --- | --- |
| `/sessoes` | Lista de sessões da clínica |
| `/sessoes/nova` | Registrar sessão |
| `/sessoes/nova?paciente=[id]` | Registrar com paciente pré-selecionado |
| `/sessoes/[id]` | Detalhe |
| `/sessoes/[id]/editar` | Editar |

## Permissão

- `sessoes.gerenciar` — administrador e fisioterapeuta
- Recepção **não** acessa sessões

## Arquivos principais

- `repositories/sessoes/sessao-repository.ts`
- `repositories/protocolos/protocolo-repository.ts` (leitura)
- `services/sessoes/sessao-service.ts`
- `lib/validations/sessao.ts`
- `features/sessoes/actions.ts`
- `features/sessoes/components/*`
- `app/(app)/sessoes/**`

## Como testar

1. Login como admin ou fisioterapeuta
2. Menu **Sessões** → Nova sessão
3. Ou abra um paciente → **Nova sessão**
4. Preencha data/hora, profissional, dor opcional → Registrar
5. Confira a sessão na lista e o evento na Timeline do paciente
6. Edite / marque como cancelada / exclua (soft delete)

## Checklist

- [x] CRUD clínico de sessões
- [x] Timeline na mesma transação
- [x] Nav disponível
- [x] CTA na ficha do paciente
- [x] Sem upload de mídia (Fase 10)
- [x] Sem CRUD de protocolos (Fase 8)
