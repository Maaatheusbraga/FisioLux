import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SessaoDetalhe } from "@/features/sessoes/components/sessao-detalhe";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { SessaoService } from "@/services/sessoes/sessao-service";
import { AppError } from "@/lib/errors/app-error";
import { formatarDataHoraBr } from "@/utils/date";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SessaoPage({ params }: Props) {
  const sessaoAuth = await exigirSessao();
  if (!possuiPermissao(sessaoAuth.perfil, "sessoes.gerenciar")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const service = new SessaoService();

  try {
    const sessao = await service.obter(sessaoAuth, id);
    return (
      <div>
        <PageHeader
          title={`Sessão · ${sessao.paciente.nome}`}
          description={formatarDataHoraBr(sessao.realizado_em)}
        />
        <SessaoDetalhe sessao={sessao} />
      </div>
    );
  } catch (error) {
    if (error instanceof AppError && error.code === "SESSAO_NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
