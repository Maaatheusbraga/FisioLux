"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { assertPermissao } from "@/lib/auth/permissoes";
import { AgendaService } from "@/services/agenda/agenda-service";
import { GoogleCalendarService } from "@/services/agenda/google-calendar-service";
import { agendaEventoFormSchema } from "@/lib/validations/agenda";
import { mensagemDeErro } from "@/lib/errors/app-error";
import { prisma } from "@/lib/prisma";

export type AgendaActionState = {
  ok: boolean;
  message?: string;
};

const agendaService = new AgendaService();
const googleService = new GoogleCalendarService();

function formToEvento(formData: FormData) {
  return {
    paciente_id: formData.get("paciente_id") || undefined,
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao") || undefined,
    inicio: formData.get("inicio"),
    fim: formData.get("fim"),
  };
}

export async function criarAgendaEventoAction(
  _prev: AgendaActionState,
  formData: FormData,
): Promise<AgendaActionState> {
  const parsed = agendaEventoFormSchema.safeParse(formToEvento(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    await agendaService.criar(sessao, parsed.data);
    revalidatePath("/agenda");
    if (parsed.data.paciente_id) {
      revalidatePath(`/pacientes/${parsed.data.paciente_id}`);
    }
    return { ok: true, message: "Evento criado no Google Calendar." };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível criar o evento."),
    };
  }
}

export async function atualizarAgendaEventoAction(
  _prev: AgendaActionState,
  formData: FormData,
): Promise<AgendaActionState> {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Evento inválido." };

  const parsed = agendaEventoFormSchema.safeParse(formToEvento(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const sessao = await exigirSessao();
    await agendaService.atualizar(sessao, id, parsed.data);
    revalidatePath("/agenda");
    return { ok: true, message: "Evento atualizado." };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível atualizar o evento."),
    };
  }
}

export async function excluirAgendaEventoAction(
  eventoId: string,
): Promise<AgendaActionState> {
  try {
    const sessao = await exigirSessao();
    await agendaService.excluir(sessao, eventoId);
    revalidatePath("/agenda");
    return { ok: true, message: "Evento excluído." };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível excluir o evento."),
    };
  }
}

export async function sincronizarAgendaAction(): Promise<AgendaActionState> {
  try {
    const sessao = await exigirSessao();
    await agendaService.sincronizarManual(sessao);
    revalidatePath("/agenda");
    return { ok: true, message: "Agenda sincronizada com o Google Calendar." };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível sincronizar."),
    };
  }
}

export async function desconectarGoogleAgendaAction(): Promise<AgendaActionState> {
  try {
    const sessao = await exigirSessao();
    assertPermissao(sessao.perfil, "clinica.configurar");
    await googleService.desconectar(sessao.clinicaId);
    revalidatePath("/configuracoes");
    revalidatePath("/agenda");
    return { ok: true, message: "Google Calendar desconectado." };
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível desconectar."),
    };
  }
}

export async function desconectarGoogleAgendaFormAction(
  _prev: AgendaActionState,
): Promise<AgendaActionState> {
  return desconectarGoogleAgendaAction();
}

export async function obterStatusGoogleAgenda() {
  const sessao = await exigirSessao();
  assertPermissao(sessao.perfil, "clinica.configurar");
  const clinica = await prisma.clinica.findFirst({
    where: { id: sessao.clinicaId, deleted_at: null },
    select: {
      agenda_google_refresh_token: true,
      agenda_google_calendar_id: true,
      agenda_google_watch_expira_em: true,
    },
  });
  return {
    conectado: Boolean(clinica?.agenda_google_refresh_token),
    calendarId: clinica?.agenda_google_calendar_id ?? "primary",
    watchExpiraEm: clinica?.agenda_google_watch_expira_em ?? null,
  };
}
