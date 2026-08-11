# Fase 12 concluída — Dashboard

## O que foi desenvolvido

- Dashboard com indicadores reais da clínica (sem “próximos agendamentos”)
- KPIs: pacientes em tratamento / altas, sessões 30 dias, eventos timeline 7 dias
- Para perfil clínico: protocolos ativos, documentos, fotos/vídeos
- Listas: pacientes recentes e sessões recentes (atalhos)
- CTAs: novo paciente / nova sessão

## Rota

| Rota | Função |
| --- | --- |
| `/dashboard` | Visão geral |

## Arquivos

- `repositories/dashboard/dashboard-repository.ts`
- `services/dashboard/dashboard-service.ts`
- `app/(app)/dashboard/page.tsx`

## Checklist

- [x] Sem agenda / próximos atendimentos
- [x] Indicadores úteis
- [x] Respeita permissões (sessões só clínico)
