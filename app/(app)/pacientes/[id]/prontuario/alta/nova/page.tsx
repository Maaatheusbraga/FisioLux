import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AltaForm } from "@/features/prontuario/components/alta-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { PacienteService } from "@/services/pacientes/paciente-service";
import { AppError } from "@/lib/errors/app-error";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NovaAltaPage({ params }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "prontuario.acessar")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  try {
    const paciente = await new PacienteService().obter(sessao, id);
    if (paciente.status === "alta") {
      redirect(`/pacientes/${paciente.id}?aba=prontuario`);
    }

    return (
      <div>
        <PageHeader title="Registrar alta" description={paciente.nome} />
        <div className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
          <AltaForm pacienteId={paciente.id} pacienteNome={paciente.nome} />
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
