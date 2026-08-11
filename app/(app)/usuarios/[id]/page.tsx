import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UsuarioDetalhe } from "@/features/usuarios/components/usuario-detalhe";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { UsuarioService } from "@/services/usuarios/usuario-service";
import { AppError } from "@/lib/errors/app-error";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UsuarioPage({ params, searchParams }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "usuarios.gerenciar")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const raw = await searchParams;
  const recemCriado = raw.criado === "1";

  try {
    const usuario = await new UsuarioService().obter(sessao, id);
    return (
      <div>
        <PageHeader title={usuario.nome} description={usuario.email} />
        <UsuarioDetalhe
          usuario={usuario}
          ehEu={usuario.id === sessao.usuarioId}
          recemCriado={recemCriado}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof AppError && error.code === "USUARIO_NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
