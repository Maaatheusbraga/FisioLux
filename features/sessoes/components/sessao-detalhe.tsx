"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { HelpTip } from "@/components/ui/help-tip";
import { excluirSessaoAction } from "@/features/sessoes/actions";
import { ArquivoUploadForm } from "@/features/arquivos/components/arquivo-upload-form";
import { MidiaGaleria } from "@/features/arquivos/components/midia-galeria";
import { formatarDataHoraBr } from "@/utils/date";

type ArquivoItem = {
  id: string;
  categoria: string;
  nome_original: string | null;
  descricao: string | null;
  mime_type: string;
  tamanho?: number;
  data_upload?: Date | string;
  paciente_id?: string | null;
  sessao_id?: string | null;
};

type Props = {
  sessao: {
    id: string;
    paciente_id: string;
    realizado_em: Date;
    procedimentos: string | null;
    equipamentos: string | null;
    escala_dor: number | null;
    observacoes: string | null;
    status: "registrada" | "cancelada";
    paciente: { id: string; nome: string };
    profissional: { id: string; nome: string };
    protocolos: { protocolo: { id: string; nome: string } }[];
    arquivos: ArquivoItem[];
  };
  categoriasUpload: { value: string; label: string }[];
  podeUploadArquivos?: boolean;
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-sm text-ink-subtle">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm text-ink sm:text-right">
        {value?.trim() || "—"}
      </dd>
    </div>
  );
}

export function SessaoDetalhe({
  sessao,
  categoriasUpload,
  podeUploadArquivos = false,
}: Props) {
  const redirectTo = `/sessoes/${sessao.id}`;
  const arquivosLista = sessao.arquivos.map((a) => ({
    ...a,
    tamanho: a.tamanho ?? 0,
    data_upload: a.data_upload ?? sessao.realizado_em,
    paciente_id: a.paciente_id ?? sessao.paciente_id,
    sessao_id: a.sessao_id ?? sessao.id,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={
            sessao.status === "cancelada"
              ? "border-danger/30 text-danger"
              : "border-primary/30 text-primary"
          }
        >
          {sessao.status === "cancelada" ? "Cancelada" : "Registrada"}
        </Badge>
        <span className="text-sm text-ink-muted">
          {formatarDataHoraBr(sessao.realizado_em)}
        </span>
      </div>

      <section className="rounded-xl border border-border bg-surface-raised p-5">
        <dl>
          <Row label="Paciente" value={sessao.paciente.nome} />
          <Row label="Profissional" value={sessao.profissional.nome} />
          <Row
            label="Escala de dor"
            value={
              sessao.escala_dor != null ? `${sessao.escala_dor}/10` : null
            }
          />
          <Row label="Procedimentos" value={sessao.procedimentos} />
          <Row label="Equipamentos" value={sessao.equipamentos} />
          <Row label="Observações" value={sessao.observacoes} />
          <Row
            label="Protocolos"
            value={
              sessao.protocolos.length > 0
                ? sessao.protocolos.map((p) => p.protocolo.nome).join(", ")
                : null
            }
          />
        </dl>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-surface-raised p-5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-ink">
            Fotos e vídeos do atendimento
          </h2>
          <HelpTip label="Sobre mídia do atendimento">
            Registre a mídia deste atendimento. Na próxima visita, esta pode
            virar o “antes” na timeline de fotos do paciente.
          </HelpTip>
        </div>
        <MidiaGaleria
          midias={arquivosLista}
          pacienteId={sessao.paciente_id}
          redirectTo={redirectTo}
          emptyHint="Adicione uma ou mais fotos/vídeos neste atendimento."
        />
        {podeUploadArquivos && categoriasUpload.length > 0 ? (
          <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-sm font-medium text-ink">
              Adicionar fotos ou vídeos
            </h3>
            <ArquivoUploadForm
              categorias={categoriasUpload}
              pacienteFixo={{
                id: sessao.paciente.id,
                nome: sessao.paciente.nome,
              }}
              sessaoId={sessao.id}
              redirectTo={redirectTo}
              modo="midia"
            />
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Link href={`/sessoes/${sessao.id}/editar`}>
          <Button type="button">Editar</Button>
        </Link>
        <Link href={`/pacientes/${sessao.paciente_id}`}>
          <Button type="button" variant="secondary">
            Ver Timeline do paciente
          </Button>
        </Link>
        <ConfirmForm
          action={excluirSessaoAction}
          className="sm:ml-auto"
          title="Excluir sessão"
          message="Excluir logicamente esta sessão?"
          confirmLabel="Excluir"
        >
          <input type="hidden" name="id" value={sessao.id} />
          <input type="hidden" name="paciente_id" value={sessao.paciente_id} />
          <Button type="submit" variant="danger">
            Excluir
          </Button>
        </ConfirmForm>
      </div>
    </div>
  );
}
