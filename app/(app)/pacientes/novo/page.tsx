import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PacienteForm } from "@/features/pacientes/components/paciente-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";

export default async function NovoPacientePage() {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "pacientes.gerenciar")) {
    redirect("/dashboard");
  }

  return (
    <div>
      <PageHeader
        title="Novo paciente"
        description="Preencha os dados cadastrais. O CPF é obrigatório e único na clínica."
      />
      <div className="max-w-4xl rounded-xl border border-border bg-surface-raised p-6">
        <PacienteForm />
      </div>
    </div>
  );
}
