import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SessaoDetalhe } from "@/features/sessoes/components/sessao-detalhe";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { SessaoService } from "@/services/sessoes/sessao-service";
import { ArquivoService } from "@/services/arquivos/arquivo-service";
import { AppError } from "@/lib/errors/app-error";
import { CATEGORIAS_MIDIA } from "@/config/arquivos";
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
  const arquivoService = new ArquivoService();
  const podeArquivos = possuiPermissao(sessaoAuth.perfil, "arquivos.clinicos");

  try {
    const sessao = await service.obter(sessaoAuth, id);
    const categoriasUpload = podeArquivos
      ? arquivoService.categoriasDisponiveisParaUpload(sessaoAuth, "midia")
      : [];

    const midias = sessao.arquivos.filter((a) =>
      (CATEGORIAS_MIDIA as readonly string[]).includes(a.categoria),
    );

    return (
      <div>
        <PageHeader
          title={`Sessão · ${sessao.paciente.nome}`}
          description={formatarDataHoraBr(sessao.realizado_em)}
        />
        <SessaoDetalhe
          sessao={{
            ...sessao,
            arquivos: midias.map((a) => ({
              ...a,
              tamanho: Number(a.tamanho),
            })),
          }}
          categoriasUpload={categoriasUpload}
          podeUploadArquivos={podeArquivos}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof AppError && error.code === "SESSAO_NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
