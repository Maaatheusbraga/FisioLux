/**
 * scripts/migrate-storage.ts
 *
 * Migra todos os arquivos do Supabase Storage para o Cloudflare R2,
 * preservando os mesmos storageKeys — sem alterar nenhum registro no banco.
 *
 * ─── Pré-requisitos ────────────────────────────────────────────────────────
 * npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *
 * ─── Variáveis de ambiente necessárias (.env ou exportadas no shell) ───────
 * DATABASE_URL              → mesma do app (acesso ao Prisma)
 * DIRECT_URL                → URL direta do Supabase (sem pooler)
 * SUPABASE_URL              → URL do projeto Supabase
 * SUPABASE_SERVICE_ROLE_KEY → chave de service role do Supabase
 * STORAGE_BUCKET            → nome do bucket (ex: fisiolux)
 * R2_ACCOUNT_ID             → account ID da Cloudflare
 * R2_ACCESS_KEY_ID          → chave de acesso R2
 * R2_SECRET_ACCESS_KEY      → segredo R2
 *
 * ─── Como rodar ────────────────────────────────────────────────────────────
 * npx tsx scripts/migrate-storage.ts
 *
 * O script é idempotente: pula arquivos que já existem no R2.
 * Pode ser interrompido e retomado sem duplicar objetos.
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = (process.env.STORAGE_BUCKET ?? "fisiolux").trim().toLowerCase();

async function jaExisteNoR2(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function migrarArquivo(storageKey: string, mimeType: string) {
  if (await jaExisteNoR2(storageKey)) {
    console.log(`  ⏭  já existe — ${storageKey}`);
    return;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(storageKey);

  if (error || !data) {
    console.error(`  ✗  erro ao baixar do Supabase — ${storageKey}:`, error?.message);
    return;
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  console.log(`  ✓  migrado (${Math.round(buffer.byteLength / 1024)} KB) — ${storageKey}`);
}

async function main() {
  console.log("FisioLux — Migração Supabase Storage → Cloudflare R2");
  console.log(`Bucket: ${BUCKET}\n`);

  // Busca todos os arquivos ativos e na lixeira
  const arquivos = await prisma.arquivo.findMany({
    where: { deleted_at: null },
    select: { id: true, storage_key: true, mime_type: true, nome_original: true },
  });

  console.log(`Total de arquivos a migrar: ${arquivos.length}\n`);

  let ok = 0;
  let erros = 0;

  for (const arquivo of arquivos) {
    if (!arquivo.storage_key) {
      console.warn(`  ⚠  sem storage_key — id ${arquivo.id}`);
      erros++;
      continue;
    }
    try {
      await migrarArquivo(arquivo.storage_key, arquivo.mime_type ?? "application/octet-stream");
      ok++;
    } catch (err) {
      console.error(`  ✗  falha inesperada — ${arquivo.storage_key}:`, err);
      erros++;
    }
  }

  console.log(`\nConcluído: ${ok} migrados, ${erros} com erro.`);
  console.log("\nPróximos passos:");
  console.log("  1. Verifique os erros acima (se houver) e re-rode o script.");
  console.log("  2. Adicione STORAGE_PROVIDER=r2 ao .env do VPS.");
  console.log("  3. Reinicie o container: docker compose -p fisiolux up -d");
  console.log("  4. Teste upload e visualização de uma foto/vídeo na aplicação.");
  console.log("  5. Após confirmar que tudo funciona, limpe o Supabase Storage.");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
