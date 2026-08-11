"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSessao } from "@/lib/auth/sessao";
import { ArquivoService } from "@/services/arquivos/arquivo-service";
import { uploadArquivoMetaSchema } from "@/lib/validations/arquivo";
import { MAX_ARQUIVOS_POR_ENVIO } from "@/config/arquivos";
import { mensagemDeErro } from "@/lib/errors/app-error";

export type ArquivoActionState = {
  ok: boolean;
  message?: string;
};

const service = new ArquivoService();

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function uploadArquivoAction(
  _prev: ArquivoActionState,
  formData: FormData,
): Promise<ArquivoActionState> {
  const files = formData
    .getAll("arquivo")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { ok: false, message: "Selecione ao menos um arquivo." };
  }

  if (files.length > MAX_ARQUIVOS_POR_ENVIO) {
    return {
      ok: false,
      message: `Envie no máximo ${MAX_ARQUIVOS_POR_ENVIO} arquivos por vez.`,
    };
  }

  const parsed = uploadArquivoMetaSchema.safeParse({
    paciente_id: formData.get("paciente_id"),
    sessao_id: formData.get("sessao_id") || undefined,
    categoria: formData.get("categoria"),
    descricao: formData.get("descricao") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const redirectTo = String(formData.get("redirect_to") || "").trim();

  try {
    const sessao = await exigirSessao();
    let enviados = 0;

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      await service.upload(sessao, parsed.data, {
        buffer,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      });
      enviados += 1;
    }

    revalidatePath("/arquivos");
    revalidatePath(`/pacientes/${parsed.data.paciente_id}`);
    if (parsed.data.sessao_id) {
      revalidatePath(`/sessoes/${parsed.data.sessao_id}`);
    }

    if (redirectTo.startsWith("/")) {
      redirect(redirectTo);
    }

    return {
      ok: true,
      message:
        enviados === 1
          ? "Arquivo enviado."
          : `${enviados} arquivos enviados.`,
    };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível enviar o arquivo."),
    };
  }
}

export async function excluirArquivoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const pacienteId = String(formData.get("paciente_id") || "");
  const sessaoId = String(formData.get("sessao_id") || "");
  const redirectTo = String(formData.get("redirect_to") || "/arquivos");

  const sessao = await exigirSessao();
  await service.excluir(sessao, id);

  revalidatePath("/arquivos");
  if (pacienteId) revalidatePath(`/pacientes/${pacienteId}`);
  if (sessaoId) revalidatePath(`/sessoes/${sessaoId}`);

  if (redirectTo.startsWith("/")) {
    redirect(redirectTo);
  }
  redirect("/arquivos");
}

export async function obterUrlAssinadaArquivoAction(
  arquivoId: string,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    const sessao = await exigirSessao();
    const { url } = await service.obterUrlAssinada(sessao, arquivoId);
    return { ok: true, url };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível abrir o arquivo."),
    };
  }
}
