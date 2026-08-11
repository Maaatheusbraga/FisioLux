import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { UsuariosTabela } from "@/features/usuarios/components/usuarios-tabela";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { UsuarioService } from "@/services/usuarios/usuario-service";

export default async function UsuariosPage() {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "usuarios.gerenciar")) {
    redirect("/dashboard");
  }

  const usuarios = await new UsuarioService().listar(sessao);

  return (
    <div>
      <PageHeader
        title="Usuários"
        help="Profissionais e recepção vinculados a esta clínica. Após criar, a pessoa entra em /login com e-mail e senha inicial."
        actions={
          <Link href="/usuarios/novo">
            <Button type="button">Novo usuário</Button>
          </Link>
        }
      />
      <UsuariosTabela usuarios={usuarios} />
    </div>
  );
}
