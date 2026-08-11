import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ClinicaForm } from "@/features/configuracoes/components/clinica-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { ClinicaService } from "@/services/clinicas/clinica-service";

export default async function ConfiguracoesPage() {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "clinica.configurar")) {
    redirect("/dashboard");
  }

  const clinica = await new ClinicaService().obterMinha(sessao);

  return (
    <div>
      <PageHeader
        title="Configurações"
        help="Dados cadastrais da clínica (aparecem no PDF clínico)."
      />
      <div className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
        <ClinicaForm clinica={clinica} />
      </div>
    </div>
  );
}
