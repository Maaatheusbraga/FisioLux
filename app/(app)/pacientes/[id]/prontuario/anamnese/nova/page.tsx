import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AnamneseForm } from "@/features/prontuario/components/anamnese-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { PacienteService } from "@/services/pacientes/paciente-service";
import { AppError } from "@/lib/errors/app-error";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NovaAnamnesePage({ params }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "prontuario.acessar")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  try {
    const paciente = await new PacienteService().obter(sessao, id);
    return (
      <div>
        <PageHeader
          title="Nova anamnese"
          description={paciente.nome}
        />
        <div className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
          <AnamneseForm
            pacienteId={paciente.id}
            pacienteNome={paciente.nome}
          />
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
