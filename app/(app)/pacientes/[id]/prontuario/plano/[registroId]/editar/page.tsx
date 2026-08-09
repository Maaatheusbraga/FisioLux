import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PlanoForm } from "@/features/prontuario/components/plano-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { PacienteService } from "@/services/pacientes/paciente-service";
import { ProntuarioService } from "@/services/prontuario/prontuario-service";
import { AppError } from "@/lib/errors/app-error";

type Props = {
  params: Promise<{ id: string; registroId: string }>;
};

export default async function EditarPlanoPage({ params }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "prontuario.acessar")) {
    redirect("/dashboard");
  }

  const { id, registroId } = await params;
  const pacienteService = new PacienteService();
  const prontuarioService = new ProntuarioService();

  try {
    const [paciente, plano] = await Promise.all([
      pacienteService.obter(sessao, id),
      prontuarioService.obterPlano(sessao, registroId),
    ]);
    if (plano.paciente_id !== paciente.id) notFound();

    return (
      <div>
        <PageHeader title="Editar plano terapêutico" description={paciente.nome} />
        <div className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
          <PlanoForm
            pacienteId={paciente.id}
            pacienteNome={paciente.nome}
            plano={plano}
          />
        </div>
      </div>
    );
  } catch (error) {
    if (
      error instanceof AppError &&
      (error.code === "PACIENTE_NOT_FOUND" || error.code === "PLANO_NOT_FOUND")
    ) {
      notFound();
    }
    throw error;
  }
}
