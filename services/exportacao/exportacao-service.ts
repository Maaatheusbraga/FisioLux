import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { PacienteRepository } from "@/repositories/pacientes/paciente-repository";
import { ProntuarioRepository } from "@/repositories/prontuario/prontuario-repository";
import { gerarPdfProntuarioPaciente } from "@/services/exportacao/pdf-prontuario";

export class ExportacaoService {
  constructor(
    private readonly pacientes = new PacienteRepository(),
    private readonly prontuario = new ProntuarioRepository(),
  ) {}

  async exportarProntuarioPdf(sessao: SessaoUsuario, pacienteId: string) {
    assertPermissao(sessao.perfil, "exportacao.clinica");

    const paciente = await this.pacientes.buscarPorId(
      sessao.clinicaId,
      pacienteId,
    );
    if (!paciente) {
      throw new AppError("Paciente não encontrado.", "PACIENTE_NOT_FOUND");
    }

    const [painel, clinica] = await Promise.all([
      this.prontuario.listarPorPaciente(sessao.clinicaId, pacienteId),
      prisma.clinica.findFirst({
        where: { id: sessao.clinicaId, deleted_at: null },
        select: { nome: true },
      }),
    ]);

    const buffer = await gerarPdfProntuarioPaciente({
      clinicaNome: clinica?.nome ?? "Clínica",
      paciente: {
        nome: paciente.nome,
        cpf: paciente.cpf,
        data_nascimento: paciente.data_nascimento,
        status: paciente.status,
        diagnostico: paciente.diagnostico,
        telefone: paciente.telefone,
        medicamentos: paciente.medicamentos,
        alergias: paciente.alergias,
      },
      avaliacoes: painel.avaliacoes,
      planos: painel.planos,
      evolucoes: painel.evolucoes,
      altas: painel.altas,
    });

    const nomeArquivo = paciente.nome
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);

    return {
      buffer,
      fileName: `FISIOLUX - ${nomeArquivo || "PACIENTE"} - PRONTUARIO.pdf`,
    };
  }
}
