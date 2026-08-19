"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { ClinicaService } from "@/services/clinicas/clinica-service";
import { clinicaFormSchema } from "@/lib/validations/usuario-clinica";
import { agendaConfigSchema } from "@/lib/validations/agenda";
import { mensagemDeErro } from "@/lib/errors/app-error";

export type ClinicaActionState = {
  ok: boolean;
  message?: string;
};

export type AgendaConfigActionState = ClinicaActionState;

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

export async function salvarAgendaConfigAction(
  _prev: AgendaConfigActionState,
  formData: FormData,
): Promise<AgendaConfigActionState> {
  const parsed = agendaConfigSchema.safeParse({
    oauth_client_id: formData.get("oauth_client_id"),
    oauth_client_secret: formData.get("oauth_client_secret") || undefined,
    agenda_google_calendar_id:
      formData.get("agenda_google_calendar_id") || undefined,
    agenda_embed_url: formData.get("agenda_embed_url") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    await service.salvarAgendaConfig(sessao, parsed.data);
    revalidatePath("/configuracoes");
    revalidatePath("/agenda");
    return { ok: true, message: "Integração Google Calendar salva." };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível salvar a integração."),
    };
  }
}
