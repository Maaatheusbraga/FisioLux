import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProntuarioPacienteBusca } from "@/features/prontuario/components/prontuario-paciente-busca";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";

export default async function ProntuarioPage() {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "prontuario.acessar")) {
    redirect("/dashboard");
  }

  return (
    <div>
      <PageHeader
        title="Prontuário"
        help="O prontuário vive na ficha do paciente. Preferência: abra em Pacientes e use a aba Prontuário. Esta página só ajuda a encontrar o paciente."
      />
      <div className="max-w-2xl rounded-xl border border-border bg-surface-raised p-6">
        <ProntuarioPacienteBusca />
      </div>
    </div>
  );
}
