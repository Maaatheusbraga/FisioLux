import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProtocoloForm } from "@/features/protocolos/components/protocolo-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";

export default async function NovoProtocoloPage() {
  const sessaoAuth = await exigirSessao();
  if (!possuiPermissao(sessaoAuth.perfil, "protocolos.gerenciar")) {
    redirect("/dashboard");
  }

  return (
    <div>
      <PageHeader
        title="Novo protocolo"
        description="Cadastre um modelo reutilizável para vincular nas sessões."
      />
      <div className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
        <ProtocoloForm />
      </div>
    </div>
  );
}
