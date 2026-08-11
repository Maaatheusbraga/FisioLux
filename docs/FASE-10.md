# Fase 10 concluída — Arquivos / StorageService

## O que foi desenvolvido

- **StorageService** concreto (`SupabaseStorageService`) + factory via `STORAGE_PROVIDER`
- Metadados em `arquivos`; binários no bucket privado; **URL assinada** sob demanda
- **Documentos** no módulo Arquivos / aba Arquivos (encaminhamento, laudo, receita, documento…)
- **Fotos e vídeos** na aba **Fotos** do paciente e na **sessão** (antes/depois = timeline temporal + comparador simples)
- Soft delete: `deleted_at` + move do objeto para `lixeira/`
- Timeline: `documento_anexado` / `arquivo_adicionado` / `arquivo_excluido`
- Permissões: recepção = documentos; clínico = documentos + mídia

## Separação de contexto

| Contexto | Conteúdo |
| --- | --- |
| `/arquivos` + aba Arquivos | Documentos |
| Aba Fotos + sessão | Foto / vídeo (evolução) |

## Rotas

| Rota | Função |
| --- | --- |
| `/arquivos` | Documentos da clínica |
| `/pacientes/[id]?aba=arquivos` | Documentos do paciente |
| `/pacientes/[id]?aba=fotos` | Galeria + comparar antes/depois |
| `/sessoes/[id]` | Fotos/vídeos da sessão |

## Pré-requisito Supabase (manual)

1. Storage → criar bucket **privado** com o nome de `STORAGE_BUCKET` (ex.: `fisiolux`)
2. Confirmar `SUPABASE_SERVICE_ROLE_KEY` no `.env` (upload/signed URL via admin client)
3. Limites: 15 MB padrão / 50 MB vídeo (`next.config` bodySizeLimit 50mb)

## Arquivos principais

- `lib/storage/supabase-storage.ts`, `lib/storage/index.ts`
- `services/arquivos/arquivo-service.ts`
- `repositories/arquivos/arquivo-repository.ts`
- `config/arquivos.ts`, `config/storage.ts`
- `lib/validations/arquivo.ts`
- `features/arquivos/*`
- `app/(app)/arquivos/page.tsx`

## Como testar

1. Criar o bucket privado no Supabase (se ainda não existir)
2. Login → menu **Arquivos** → buscar paciente → enviar PDF/imagem
3. Abrir (URL assinada) e excluir (vai para `lixeira/`)
4. Conferir evento na Timeline do paciente
5. Anexar arquivo também pela sessão e pela aba Arquivos

## Checklist

- [x] StorageService + Supabase
- [x] Metadados + signed URL
- [x] Soft delete → lixeira/
- [x] Timeline na mesma TX
- [x] Permissões cadastrais vs clínicas
- [x] Nav + aba paciente + sessão
- [x] R2 ainda não implementado (contrato pronto)
