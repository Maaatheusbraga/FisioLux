import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SessaoForm } from "@/features/sessoes/components/sessao-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { SessaoService } from "@/services/sessoes/sessao-service";
import { AppError } from "@/lib/errors/app-error";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarSessaoPage({ params }: Props) {
  const sessaoAuth = await exigirSessao();
  if (!possuiPermissao(sessaoAuth.perfil, "sessoes.gerenciar")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const sessaoService = new SessaoService();

  try {
    const [sessao, profissionais, protocolos] = await Promise.all([
      sessaoService.obter(sessaoAuth, id),
      sessaoService.listarProfissionais(sessaoAuth),
      sessaoService.listarProtocolosAtivos(sessaoAuth),
    ]);

    return (
      <div>
        <PageHeader
          title="Editar sessão"
          description={sessao.paciente.nome}
        />
        <div className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
          <SessaoForm
            profissionais={profissionais}
            protocolos={protocolos}
            sessao={{
              id: sessao.id,
              paciente_id: sessao.paciente_id,
              profissional_id: sessao.profissional_id,
              realizado_em: sessao.realizado_em,
              procedimentos: sessao.procedimentos,
              equipamentos: sessao.equipamentos,
              escala_dor: sessao.escala_dor,
              observacoes: sessao.observacoes,
              status: sessao.status,
              protocoloIds: sessao.protocolos.map((p) => p.protocolo.id),
              paciente: {
                id: sessao.paciente.id,
                nome: sessao.paciente.nome,
              },
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof AppError && error.code === "SESSAO_NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
