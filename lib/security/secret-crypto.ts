import crypto from "crypto";

const ALGO = "aes-256-gcm";

function chaveDerivada(): Buffer {
  const secret = process.env.AGENDA_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AGENDA_TOKEN_SECRET ausente ou curto demais (mín. 32 caracteres).",
    );
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function criptografar(texto: string): string {
  const key = chaveDerivada();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const cifrado = Buffer.concat([
    cipher.update(texto, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, cifrado]).toString("base64url");
}

export function descriptografar(payload: string): string {
  const key = chaveDerivada();
  const buf = Buffer.from(payload, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const cifrado = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(cifrado),
    decipher.final(),
  ]).toString("utf8");
}

export function assinarEstado(dados: Record<string, string>): string {
  const json = JSON.stringify(dados);
  const sig = crypto
    .createHmac("sha256", chaveDerivada())
    .update(json)
    .digest("base64url");
  return Buffer.from(JSON.stringify({ d: dados, s: sig })).toString(
    "base64url",
  );
}

export function verificarEstado(
  token: string,
): Record<string, string> | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8"),
    ) as { d?: Record<string, string>; s?: string };
    if (!parsed.d || !parsed.s) return null;
    const json = JSON.stringify(parsed.d);
    const esperado = crypto
      .createHmac("sha256", chaveDerivada())
      .update(json)
      .digest("base64url");
    const a = Buffer.from(parsed.s);
    const b = Buffer.from(esperado);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
    return parsed.d;
  } catch {
    return null;
  }
}
