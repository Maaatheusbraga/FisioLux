# Fase 13 concluída — Exportação PDF

## O que foi desenvolvido

- `ExportacaoService` + geração PDF (`pdf-lib`) do prontuário do paciente
- Conteúdo: cadastro, avaliações (incl. dados musculoesqueléticos), anamneses, planos, evoluções, sessões recentes, altas
- Botão **Exportar PDF** na ficha do paciente (`exportacao.clinica`)
- Download: `GET /pacientes/[id]/exportar`

## Permissão

- `exportacao.clinica` — administrador e fisioterapeuta
- Recepção **não** exporta

## Arquivos

- `services/exportacao/exportacao-service.ts`
- `services/exportacao/pdf-prontuario.ts`
- `app/(app)/pacientes/[id]/exportar/route.ts`

## Checklist

- [x] PDF clínico
- [x] Avaliação prioritária no relatório (ADR 014)
- [x] Sem URL pública no banco (não se aplica a PDF gerado)
