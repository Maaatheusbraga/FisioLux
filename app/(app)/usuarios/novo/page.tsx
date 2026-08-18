import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UsuarioForm } from "@/features/usuarios/components/usuario-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";

export default async function NovoUsuarioPage() {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "usuarios.gerenciar")) {
    redirect("/dashboard");
  }

  return (
    <div>
      <PageHeader title="Novo usuário" />
      <div className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
        <UsuarioForm />
      </div>
    </div>
  );
}
