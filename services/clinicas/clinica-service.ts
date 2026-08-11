import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { ClinicaRepository } from "@/repositories/clinicas/clinica-repository";
import type { ClinicaFormInput } from "@/lib/validations/usuario-clinica";

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
      } catch {
        throw new AppError("Clínica não encontrada.", "CLINICA_NOT_FOUND");
      }
    });
  }
}
