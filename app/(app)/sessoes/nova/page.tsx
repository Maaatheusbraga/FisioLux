import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SessaoForm } from "@/features/sessoes/components/sessao-form";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { SessaoService } from "@/services/sessoes/sessao-service";
import { PacienteService } from "@/services/pacientes/paciente-service";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NovaSessaoPage({ searchParams }: Props) {
  const sessaoAuth = await exigirSessao();
  if (!possuiPermissao(sessaoAuth.perfil, "sessoes.gerenciar")) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const pacienteFixoId =
    typeof raw.paciente === "string" ? raw.paciente : undefined;

  const sessaoService = new SessaoService();
  const pacienteService = new PacienteService();

  const [profissionais, protocolos, pacienteFixo] = await Promise.all([
    sessaoService.listarProfissionais(sessaoAuth),
    sessaoService.listarProtocolosAtivos(sessaoAuth),
    pacienteFixoId
      ? pacienteService.obter(sessaoAuth, pacienteFixoId).then((p) => ({
          id: p.id,
          nome: p.nome,
        }))
      : Promise.resolve(null),
  ]);

  return (
    <div>
      <PageHeader
        title="Registrar atendimento"
        help={
          <>
            Registra o que foi feito no dia (procedimentos, dor, observações).
            Não marca horário — não é agenda. Evolução textual estruturada fica
            no Prontuário do paciente.
          </>
        }
      />
      <div className="max-w-3xl rounded-xl border border-border bg-surface-raised p-6">
        <SessaoForm
          profissionais={profissionais}
          protocolos={protocolos}
          pacienteFixo={pacienteFixo}
          profissionalPadraoId={sessaoAuth.usuarioId}
        />
      </div>
    </div>
  );
}
