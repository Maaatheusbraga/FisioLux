import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AVISO_COOKIE } from "@/lib/feedback/aviso-const";

export type AvisoTipo = "ok" | "erro";

/** Grava um aviso curto para o toast após o próximo carregamento. */
export async function definirAviso(texto: string, tipo: AvisoTipo = "ok") {
  const jar = await cookies();
  jar.set(AVISO_COOKIE, JSON.stringify({ t: tipo, m: texto.slice(0, 180) }), {
    path: "/",
    maxAge: 20,
    sameSite: "lax",
    httpOnly: false,
  });
}

export async function redirectComAviso(
  path: string,
  texto: string,
  tipo: AvisoTipo = "ok",
): Promise<never> {
  await definirAviso(texto, tipo);
  return redirect(path);
}
