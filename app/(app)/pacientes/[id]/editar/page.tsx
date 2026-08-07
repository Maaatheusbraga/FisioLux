import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PacienteForm } from "@/features/pacientes/components/paciente-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { PacienteService } from "@/services/pacientes/paciente-service";
import { AppError } from "@/lib/errors/app-error";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarPacientePage({ params }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "pacientes.gerenciar")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const service = new PacienteService();

  try {
    const paciente = await service.obter(sessao, id);
    return (
      <div>
        <PageHeader
          title={`Editar · ${paciente.nome}`}
          description="Atualize os dados cadastrais do paciente."
        />
        <div className="max-w-4xl rounded-xl border border-border bg-surface-raised p-6">
          <PacienteForm paciente={paciente} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof AppError && error.code === "PACIENTE_NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
