"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { ClinicaService } from "@/services/clinicas/clinica-service";
import { clinicaFormSchema } from "@/lib/validations/usuario-clinica";
import { mensagemDeErro } from "@/lib/errors/app-error";

export type ClinicaActionState = {
  ok: boolean;
  message?: string;
};

const service = new ClinicaService();

export async function atualizarClinicaAction(
  _prev: ClinicaActionState,
  formData: FormData,
): Promise<ClinicaActionState> {
  const parsed = clinicaFormSchema.safeParse({
    nome: formData.get("nome"),
    cnpj: formData.get("cnpj") || undefined,
    telefone: formData.get("telefone") || undefined,
    email: formData.get("email") || undefined,
    endereco: formData.get("endereco") || undefined,
    ativa: formData.get("ativa") || "true",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    await service.atualizar(sessao, parsed.data);
    revalidatePath("/configuracoes");
    return { ok: true, message: "Configurações salvas." };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível salvar."),
    };
  }
}
