/**
 * Configuração e mapeamento do Storage do FisioLux.
 *
 * ─── Provider ativo ────────────────────────────────────────────────────────
 * Controlado pela env STORAGE_PROVIDER (padrão: "supabase").
 * Para migrar para R2: STORAGE_PROVIDER=r2 (ver lib/storage/r2-storage.ts).
 *
 * ─── Estrutura de chaves (storageKey) ──────────────────────────────────────
 * Todos os arquivos seguem o padrão:
 *   {clinicaId}/{pacienteId}/{categoria}/{uuid}-{nome-sanitizado}
 *
 * Arquivos na lixeira (soft-delete) ganham prefixo:
 *   lixeira/{clinicaId}/{pacienteId}/{categoria}/{uuid}-{nome}
 *
 * Esse padrão é IDÊNTICO nos dois providers (Supabase e R2).
 * O campo `storage_key` no banco já contém o caminho completo —
 * a migração de provider não exige alteração de nenhum registro no banco.
 *
 * ─── Categorias de arquivo ─────────────────────────────────────────────────
 * Documentos clínicos/administrativos  → config/arquivos.ts CATEGORIAS_DOCUMENTOS
 *   encaminhamento | relatorio_medico | laudo | receita | documento
 *
 * Mídia de evolução (fotos e vídeos)   → config/arquivos.ts CATEGORIAS_MIDIA
 *   foto_evolucao | video | foto_antes (*legado) | foto_depois (*legado)
 *
 * ─── Limites de upload ─────────────────────────────────────────────────────
 * Foto:       15 MB   (LIMITE_UPLOAD_PADRAO)
 * Vídeo:      50 MB   (LIMITE_UPLOAD_VIDEO)
 * Lote:       45 MB   (LIMITE_LOTE_UPLOAD — abaixo do bodySizeLimit das Server Actions)
 * Arquivos/envio: 10  (MAX_ARQUIVOS_POR_ENVIO)
 *
 * ─── Migração Supabase → Cloudflare R2 ────────────────────────────────────
 * 1. Criar bucket "fisiolux" no painel da Cloudflare R2.
 * 2. Gerar API Token R2 com permissão Object Read & Write.
 * 3. Adicionar ao .env do VPS:
 *      STORAGE_PROVIDER=r2
 *      STORAGE_BUCKET=fisiolux
 *      R2_ACCOUNT_ID=<account-id>
 *      R2_ACCESS_KEY_ID=<key-id>
 *      R2_SECRET_ACCESS_KEY=<secret>
 *      R2_PUBLIC_URL=https://<bucket>.<account>.r2.cloudflarestorage.com
 * 4. Rodar o script de migração (scripts/migrate-storage.ts):
 *      npx tsx scripts/migrate-storage.ts
 *    O script lista todos os arquivos via DB, baixa do Supabase e
 *    faz upload no R2 com o MESMO storageKey — zero alteração no banco.
 * 5. Reiniciar o container. URLs assinadas passarão a ser geradas pelo R2.
 */
export const storageConfig = {
  provider: (process.env.STORAGE_PROVIDER ?? "supabase") as "supabase" | "r2",
  bucket: (process.env.STORAGE_BUCKET ?? "fisiolux").trim().toLowerCase(),
  trashPrefix: "lixeira",
} as const;
