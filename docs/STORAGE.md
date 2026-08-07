# Estratégia de Storage

## Objetivo

Encapsular todo acesso a arquivos em um **StorageService**, permitindo trocar Supabase Storage por **Cloudflare R2** no futuro sem alterar pages/features.

## Regras

1. Nunca acessar Storage de dentro de `app/` ou `components/`
2. Nunca salvar binários no PostgreSQL
3. Nunca persistir URL pública no banco
4. Banco guarda apenas metadados na tabela `arquivos`
5. URLs sempre geradas sob demanda (signed URL) pelo StorageService

## Metadados (`arquivos`)

Campos previstos (nomes em português / snake_case, exceto timestamps técnicos):

- `provider` — ex.: `supabase` | `r2`
- `bucket`
- `storage_key`
- `mime_type`
- `tamanho`
- `categoria`
- `descricao` — texto livre (obrigatório especialmente para `documento`)
- `usuario_id`, `paciente_id`, `sessao_id` (opcional conforme contexto)
- `clinica_id`
- `data_upload`
- `deleted_at`
- `created_at`, `updated_at`

## Categorias fixas (enum)

| Categoria | Uso |
| --- | --- |
| `encaminhamento` | Encaminhamento / pedido para fisioterapia |
| `relatorio_medico` | Relatório médico |
| `laudo` | Laudos (inclui ressonância e similares) |
| `receita` | Receitas |
| `foto_antes` | Foto inicial |
| `foto_depois` | Foto final / comparativa |
| `foto_evolucao` | Foto de evolução |
| `video` | Vídeos clínicos |
| `documento` | Coringa — outros arquivos + `descricao` |

## Layout de chaves no bucket

Bucket privado único (recomendado):

```text
{clinica_id}/{paciente_id}/{categoria}/{uuid}-{filename}
lixeira/{clinica_id}/{paciente_id}/{categoria}/{uuid}-{filename}
```

## Soft delete

1. Marca `deleted_at` no metadado
2. Move objeto para prefixo `lixeira/`
3. Purga física posterior (manual/job) se custo de storage exigir

## Interface (contrato)

```ts
interface StorageService {
  upload(input: UploadInput): Promise<StorageObject>
  getSignedUrl(storageKey: string, expiresInSeconds: number): Promise<string>
  moveToTrash(storageKey: string): Promise<StorageObject>
  deletePermanent(storageKey: string): Promise<void>
  download(storageKey: string): Promise<Blob | Buffer>
}
```

- `SupabaseStorageService` — implementação v1
- `R2StorageService` — implementação futura
- Seleção via `config` / env (`STORAGE_PROVIDER`)

## Implementação de código

**Fase 10** (contrato e pastas já reservados em `services/storage` e `lib/storage`).
