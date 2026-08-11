import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UsuarioForm } from "@/features/usuarios/components/usuario-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { UsuarioService } from "@/services/usuarios/usuario-service";
import { AppError } from "@/lib/errors/app-error";

type Props = { params: Promise<{ id: string }> };

export default async function EditarUsuarioPage({ params }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "usuarios.gerenciar")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  try {
    const usuario = await new UsuarioService().obter(sessao, id);
    return (
      <div>
        <PageHeader title="Editar usuário" description={usuario.email} />
        <div className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
          <UsuarioForm
            usuario={{
              id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              telefone: usuario.telefone,
              perfil: usuario.perfil,
              ativo: usuario.ativo,
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof AppError && error.code === "USUARIO_NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
