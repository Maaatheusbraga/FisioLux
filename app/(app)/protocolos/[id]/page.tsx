import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProtocoloDetalhe } from "@/features/protocolos/components/protocolo-detalhe";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { ProtocoloService } from "@/services/protocolos/protocolo-service";
import { AppError } from "@/lib/errors/app-error";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProtocoloPage({ params }: Props) {
  const sessaoAuth = await exigirSessao();
  if (!possuiPermissao(sessaoAuth.perfil, "protocolos.gerenciar")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const service = new ProtocoloService();

  try {
    const protocolo = await service.obter(sessaoAuth, id);
    return (
      <div>
        <PageHeader title={protocolo.nome} />
        <ProtocoloDetalhe protocolo={protocolo} />
      </div>
    );
  } catch (error) {
    if (error instanceof AppError && error.code === "PROTOCOLO_NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
