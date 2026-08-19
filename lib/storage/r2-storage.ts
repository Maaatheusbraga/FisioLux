/**
 * StorageService para Cloudflare R2.
 *
 * Usa o SDK S3-compatível da AWS (@aws-sdk/client-s3) — o R2 expõe
 * a mesma API do S3, então não é necessário nenhum SDK proprietário.
 *
 * ─── Para ativar ───────────────────────────────────────────────────────────
 * 1. Instale a dependência (uma única vez):
 *      npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *
 * 2. Adicione ao .env do VPS:
 *      STORAGE_PROVIDER=r2
 *      STORAGE_BUCKET=fisiolux
 *      R2_ACCOUNT_ID=<seu-account-id>
 *      R2_ACCESS_KEY_ID=<key-id>
 *      R2_SECRET_ACCESS_KEY=<secret>
 *
 * 3. Reinicie o container. A factory em lib/storage/index.ts
 *    instanciará esta classe automaticamente.
 *
 * ─── Migração do Supabase ──────────────────────────────────────────────────
 * Os storageKeys no banco são idênticos em ambos os providers.
 * Rode scripts/migrate-storage.ts para copiar os objetos existentes.
 */

import { randomUUID } from "crypto";
import { storageConfig } from "@/config/storage";
import { AppError } from "@/lib/errors/app-error";
import type {
  StorageObject,
  StorageService,
  UploadInput,
} from "@/services/storage/storage-service";

function sanitizeFileName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (base || "arquivo").slice(0, 120);
}

function buildKey(
  clinicaId: string,
  pacienteId: string,
  categoria: string,
  fileName: string,
  trash = false,
): string {
  const safe = sanitizeFileName(fileName);
  const path = `${clinicaId}/${pacienteId}/${categoria}/${randomUUID()}-${safe}`;
  return trash ? `${storageConfig.trashPrefix}/${path}` : path;
}

function missingEnv(): never {
  throw new AppError(
    "Variáveis de ambiente do R2 não configuradas (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).",
    "STORAGE_R2_ENV_MISSING",
  );
}

function missingSdk(): never {
  throw new AppError(
    "SDK do R2 não instalado. Execute: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner",
    "STORAGE_R2_SDK_MISSING",
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadS3(): Promise<any> {
  // webpackIgnore impede o Next.js de resolver o módulo em build time.
  // @ts-ignore — SDK opcional, instalado apenas no VPS quando STORAGE_PROVIDER=r2.
  return import(/* webpackIgnore: true */ "@aws-sdk/client-s3").catch(missingSdk);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadPresigner(): Promise<any> {
  // @ts-ignore — SDK opcional, instalado apenas no VPS quando STORAGE_PROVIDER=r2.
  return import(/* webpackIgnore: true */ "@aws-sdk/s3-request-presigner").catch(missingSdk);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeClient(): any {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) missingEnv();

  // Instanciado de forma síncrona após o módulo ser carregado em getClient().
  return { accountId, accessKeyId, secretAccessKey };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getClient(): Promise<any> {
  const { S3Client } = await loadS3();
  const creds = makeClient();
  return new S3Client({
    region: "auto",
    endpoint: `https://${creds.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
    },
  });
}

export class R2StorageService implements StorageService {
  private readonly bucket = storageConfig.bucket;

  async upload(input: UploadInput): Promise<StorageObject> {
    const { PutObjectCommand } = await loadS3();
    const client = await getClient();
    const storageKey = buildKey(
      input.clinicaId,
      input.pacienteId,
      input.categoria,
      input.fileName,
    );

    const body =
      input.body instanceof ArrayBuffer
        ? Buffer.from(input.body)
        : input.body instanceof Blob
          ? Buffer.from(await input.body.arrayBuffer())
          : input.body;

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: body,
        ContentType: input.mimeType,
      }),
    );

    return {
      provider: "r2",
      bucket: this.bucket,
      storageKey,
      mimeType: input.mimeType,
      tamanho: Buffer.isBuffer(body) ? body.byteLength : 0,
    };
  }

  async getSignedUrl(
    storageKey: string,
    expiresInSeconds: number,
    bucket?: string,
  ): Promise<string> {
    const { GetObjectCommand } = await loadS3();
    const { getSignedUrl } = await loadPresigner();
    const client = await getClient();
    const alvo = bucket ?? this.bucket;

    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: alvo, Key: storageKey }),
      { expiresIn: expiresInSeconds },
    );
  }

  async moveToTrash(storageKey: string): Promise<StorageObject> {
    if (storageKey.startsWith(`${storageConfig.trashPrefix}/`)) {
      return {
        provider: "r2",
        bucket: this.bucket,
        storageKey,
        mimeType: "application/octet-stream",
        tamanho: 0,
      };
    }

    const { CopyObjectCommand, DeleteObjectCommand } = await loadS3();
    const client = await getClient();
    const trashKey = `${storageConfig.trashPrefix}/${storageKey}`;

    await client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${storageKey}`,
        Key: trashKey,
      }),
    );
    await client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }),
    );

    return {
      provider: "r2",
      bucket: this.bucket,
      storageKey: trashKey,
      mimeType: "application/octet-stream",
      tamanho: 0,
    };
  }

  async deletePermanent(storageKey: string): Promise<void> {
    const { DeleteObjectCommand } = await loadS3();
    const client = await getClient();
    await client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }),
    );
  }

  async download(storageKey: string): Promise<Buffer> {
    const { GetObjectCommand } = await loadS3();
    const client = await getClient();

    const { Body } = await client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: storageKey }),
    );

    if (!Body) {
      throw new AppError("Arquivo não encontrado no R2.", "STORAGE_R2_NOT_FOUND");
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}
