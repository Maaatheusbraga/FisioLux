import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { ClinicaRepository } from "@/repositories/clinicas/clinica-repository";
import type { ClinicaFormInput } from "@/lib/validations/usuario-clinica";
import type { AgendaConfigInput } from "@/lib/validations/agenda";
import { criptografar } from "@/lib/security/secret-crypto";
import { Prisma } from "@prisma/client";

export class ClinicaService {
  constructor(private readonly clinicas = new ClinicaRepository()) {}

  async obterMinha(sessao: SessaoUsuario) {
    assertPermissao(sessao.perfil, "clinica.configurar");
    const clinica = await this.clinicas.buscarPorId(sessao.clinicaId);
    if (!clinica) {
      throw new AppError("Clínica não encontrada.", "CLINICA_NOT_FOUND");
    }
    return clinica;
  }

  async atualizar(sessao: SessaoUsuario, input: ClinicaFormInput) {
    assertPermissao(sessao.perfil, "clinica.configurar");
    return prisma.$transaction(async (tx) => {
      try {
        return await this.clinicas.atualizar(tx, sessao.clinicaId, {
          nome: input.nome,
          cnpj: input.cnpj ?? null,
          telefone: input.telefone ?? null,
          email: input.email ?? null,
          endereco: input.endereco ?? null,
          ativa: input.ativa,
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ) {
          throw new AppError("Clínica não encontrada.", "CLINICA_NOT_FOUND");
        }
        throw error;
      }
    });
  }

  async salvarAgendaConfig(sessao: SessaoUsuario, input: AgendaConfigInput) {
    assertPermissao(sessao.perfil, "clinica.configurar");
    const existente = await this.clinicas.buscarPorId(sessao.clinicaId);
    if (!existente) {
      throw new AppError("Clínica não encontrada.", "CLINICA_NOT_FOUND");
    }

    const temSecret =
      Boolean(input.oauth_client_secret) ||
      Boolean(existente.agenda_google_oauth_client_secret) ||
      Boolean(process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim());

    if (!temSecret) {
      throw new AppError(
        "Informe a chave secreta OAuth do Google Cloud.",
        "VALIDATION",
      );
    }

    const data: {
      agenda_google_oauth_client_id: string;
      agenda_google_oauth_client_secret?: string;
      agenda_google_calendar_id: string;
      agenda_embed_url: string | null;
    } = {
      agenda_google_oauth_client_id: input.oauth_client_id,
      agenda_google_calendar_id: input.agenda_google_calendar_id ?? "primary",
      agenda_embed_url: normalizarAgendaEmbed(input.agenda_embed_url) ?? null,
    };

    if (input.oauth_client_secret) {
      data.agenda_google_oauth_client_secret = criptografar(
        input.oauth_client_secret,
      );
    }

    return prisma.clinica.update({
      where: { id: sessao.clinicaId },
      data,
    });
  }
}

function normalizarAgendaEmbed(valor?: string): string | undefined {
  if (!valor) return undefined;
  const v = valor.trim();
  if (!v) return undefined;
  if (v.includes("<iframe")) {
    const match = v.match(/src="([^"]+)"/i);
    return match?.[1]?.trim() || undefined;
  }
  return v;
}
