"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Avaliacao } from "@prisma/client";
import {
  Activity,
  ClipboardList,
  HeartPulse,
  Plus,
  ShieldAlert,
  Stethoscope,
  StickyNote,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  atualizarAvaliacaoAction,
  criarAvaliacaoAction,
  type ProntuarioActionState,
} from "@/features/prontuario/actions";
import { toInputDate } from "@/utils/date";
import {
  CONTRAINDICACOES_OPCOES,
  CRONOLOGIA_OPCOES,
  DOR_CARACTERISTICAS_OPCOES,
  HISTORICO_CONDICOES_OPCOES,
  INDICACAO_OPCOES,
  INSPECAO_OPCOES,
  LIMITACAO_ADM_OPCOES,
  MECANISMO_OPCOES,
  OBJETIVO_PROC_OPCOES,
  TRATAMENTOS_PREVIOS_OPCOES,
  parseDadosComplementares,
  triFromBool,
  type DadosComplementaresAvaliacao,
} from "@/lib/validations/avaliacao-musculoesqueletica";
import { cn } from "@/utils/cn";

const initialState: ProntuarioActionState = { ok: false };

type Props = {
  pacienteId: string;
  pacienteNome: string;
  avaliacao?: Avaliacao;
};

function Secao({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof ClipboardList;
  children: ReactNode;
}) {
  return (
    <details
      name="ficha-avaliacao"
      className="group border-b border-border last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-1 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{title}</span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-ink-muted transition group-open:rotate-45">
          <Plus className="h-4 w-4" aria-hidden />
        </span>
      </summary>
      <div className="space-y-4 pb-4 pl-12">{children}</div>
    </details>
  );
}

function CheckboxGroup({
  name,
  options,
  selected,
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  selected: string[];
}) {
  const set = new Set(selected);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm text-ink",
            "has-[:checked]:border-primary/40 has-[:checked]:bg-primary/10",
          )}
        >
          <input
            type="checkbox"
            name={name}
            value={opt.value}
            defaultChecked={set.has(opt.value)}
            className="size-3.5 accent-[var(--primary)]"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function TriRadio({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-ink-muted">{label}</p>
      <div className="flex flex-wrap gap-3 text-sm">
        {(
          [
            ["", "—"],
            ["sim", "Sim"],
            ["nao", "Não"],
          ] as const
        ).map(([value, text]) => (
          <label key={value || "vazio"} className="inline-flex items-center gap-1.5">
            <input
              type="radio"
              name={name}
              value={value}
              defaultChecked={defaultValue === value}
              className="accent-[var(--primary)]"
            />
            {text}
          </label>
        ))}
      </div>
    </div>
  );
}

export function AvaliacaoForm({ pacienteId, pacienteNome, avaliacao }: Props) {
  const editing = Boolean(avaliacao);
  const action = editing ? atualizarAvaliacaoAction : criarAvaliacaoAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const voltar = `/pacientes/${pacienteId}?aba=prontuario`;

  const dc: DadosComplementaresAvaliacao | null = parseDadosComplementares(
    avaliacao?.dados_complementares,
  );

  const [contraNenhuma, setContraNenhuma] = useState(
    dc?.contraindicacoes.nenhuma ?? false,
  );
  const [recovery, setRecovery] = useState(dc?.recovery ?? false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="paciente_id" value={pacienteId} />
      {avaliacao ? <input type="hidden" name="id" value={avaliacao.id} /> : null}

      <div className="rounded-xl border border-border bg-surface px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">
              Ficha de avaliação musculoesquelética
            </p>
            <p className="text-sm text-ink-muted">Paciente: {pacienteNome}</p>
          </div>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-ink has-[:checked]:border-primary/40 has-[:checked]:bg-primary/10">
            <input
              type="checkbox"
              name="dc_recovery"
              checked={recovery}
              onChange={(e) => setRecovery(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Recovery
          </label>
        </div>
      </div>

      {state.message ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="rounded-xl border border-border bg-surface-raised px-4">
      <Secao title="Identificação da avaliação" icon={ClipboardList}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              id="tipo"
              name="tipo"
              required
              defaultValue={avaliacao?.tipo ?? "inicial"}
            >
              <option value="inicial">Inicial</option>
              <option value="periodica">Periódica</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="data_avaliacao">Data *</Label>
            <Input
              id="data_avaliacao"
              name="data_avaliacao"
              type="date"
              required
              defaultValue={
                avaliacao
                  ? toInputDate(avaliacao.data_avaliacao)
                  : toInputDate(new Date())
              }
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="queixa_principal">Queixa principal</Label>
          <Textarea
            id="queixa_principal"
            name="queixa_principal"
            rows={3}
            disabled={recovery}
            defaultValue={avaliacao?.queixa_principal ?? ""}
          />
        </div>
      </Secao>

      <fieldset
        disabled={recovery}
        className={cn("min-w-0 border-0 p-0", recovery && "opacity-50")}
      >
        <legend className="sr-only">Perguntas da avaliação clínica</legend>
      <Secao
        title="Histórico clínico / HDA"
        icon={Stethoscope}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dc_inicio_sintomas">Início dos sintomas</Label>
            <Input
              id="dc_inicio_sintomas"
              name="dc_inicio_sintomas"
              defaultValue={dc?.inicio_sintomas ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dc_cronologia">Cronologia</Label>
            <Select
              id="dc_cronologia"
              name="dc_cronologia"
              defaultValue={dc?.cronologia ?? ""}
            >
              <option value="">Não informado</option>
              {CRONOLOGIA_OPCOES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc_fatores_melhora_piora">
            Fatores de melhora / piora
          </Label>
          <Input
            id="dc_fatores_melhora_piora"
            name="dc_fatores_melhora_piora"
            defaultValue={dc?.fatores_melhora_piora ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc_tratamentos_anteriores">
            Tratamentos anteriores (texto)
          </Label>
          <Input
            id="dc_tratamentos_anteriores"
            name="dc_tratamentos_anteriores"
            defaultValue={dc?.tratamentos_anteriores_texto ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Mecanismo de lesão</Label>
          <CheckboxGroup
            name="dc_mecanismo"
            options={MECANISMO_OPCOES}
            selected={dc?.hda.mecanismo ?? []}
          />
          <Input
            name="dc_mecanismo_outro"
            placeholder="Outro (especificar)"
            defaultValue={dc?.hda.mecanismo_outro ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dc_hda_evolucao">Evolução da doença atual</Label>
          <Textarea
            id="dc_hda_evolucao"
            name="dc_hda_evolucao"
            rows={2}
            defaultValue={dc?.hda.evolucao ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Tratamentos prévios</Label>
          <CheckboxGroup
            name="dc_tratamentos_previos"
            options={TRATAMENTOS_PREVIOS_OPCOES}
            selected={dc?.hda.tratamentos_previos ?? []}
          />
          <Input
            name="dc_tratamentos_outro"
            placeholder="Outros (especificar)"
            defaultValue={dc?.hda.tratamentos_outro ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dc_resultado_obtido">Resultado obtido</Label>
          <Input
            id="dc_resultado_obtido"
            name="dc_resultado_obtido"
            defaultValue={dc?.hda.resultado_obtido ?? ""}
          />
        </div>
      </Secao>

      <Secao title="Dor" icon={Activity}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="dc_dor_eva">EVA (0–10)</Label>
            <Input
              id="dc_dor_eva"
              name="dc_dor_eva"
              type="number"
              min={0}
              max={10}
              defaultValue={dc?.dor.eva ?? ""}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="dc_dor_localizacao">Localização</Label>
            <Input
              id="dc_dor_localizacao"
              name="dc_dor_localizacao"
              defaultValue={dc?.dor.localizacao ?? ""}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc_dor_irradiacao">Irradiação</Label>
          <Input
            id="dc_dor_irradiacao"
            name="dc_dor_irradiacao"
            defaultValue={dc?.dor.irradiacao ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label>Características</Label>
          <CheckboxGroup
            name="dc_dor_caracteristicas"
            options={DOR_CARACTERISTICAS_OPCOES}
            selected={dc?.dor.caracteristicas ?? []}
          />
          <Input
            name="dc_dor_outra"
            placeholder="Outra (especificar)"
            defaultValue={dc?.dor.caracteristica_outra ?? ""}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dc_dor_piora">Piora com</Label>
            <Input
              id="dc_dor_piora"
              name="dc_dor_piora"
              defaultValue={dc?.dor.piora_com ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dc_dor_melhora">Melhora com</Label>
            <Input
              id="dc_dor_melhora"
              name="dc_dor_melhora"
              defaultValue={dc?.dor.melhora_com ?? ""}
            />
          </div>
        </div>
      </Secao>

      <Secao title="Comorbidades e medicações" icon={HeartPulse}>
        <div className="space-y-2">
          <Label>Condições</Label>
          <CheckboxGroup
            name="dc_historico_condicoes"
            options={HISTORICO_CONDICOES_OPCOES}
            selected={dc?.historico_clinico.condicoes ?? []}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc_historico_outros">Outros</Label>
          <Input
            id="dc_historico_outros"
            name="dc_historico_outros"
            defaultValue={dc?.historico_clinico.outros ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc_medicamentos">Medicamentos em uso</Label>
          <Textarea
            id="dc_medicamentos"
            name="dc_medicamentos"
            rows={2}
            defaultValue={dc?.historico_clinico.medicamentos ?? ""}
          />
        </div>
      </Secao>

      <Secao title="Contexto (familiar, social e hábitos)" icon={Users}>
        <div className="space-y-1.5">
          <Label htmlFor="dc_historico_familiar">Histórico familiar</Label>
          <Textarea
            id="dc_historico_familiar"
            name="dc_historico_familiar"
            rows={2}
            defaultValue={dc?.contexto?.historico_familiar ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc_historico_social">Histórico social</Label>
          <Textarea
            id="dc_historico_social"
            name="dc_historico_social"
            rows={2}
            defaultValue={dc?.contexto?.historico_social ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc_habitos_vida">Hábitos de vida</Label>
          <Textarea
            id="dc_habitos_vida"
            name="dc_habitos_vida"
            rows={2}
            defaultValue={dc?.contexto?.habitos_vida ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc_exames_complementares">
            Exames complementares
          </Label>
          <Textarea
            id="dc_exames_complementares"
            name="dc_exames_complementares"
            rows={2}
            defaultValue={dc?.contexto?.exames_complementares ?? ""}
          />
        </div>
      </Secao>

      <Secao title="Exame físico" icon={Stethoscope}>
        <div className="space-y-2">
          <Label>Inspeção</Label>
          <CheckboxGroup
            name="dc_inspecao"
            options={INSPECAO_OPCOES}
            selected={dc?.exame.inspecao ?? []}
          />
          <Input
            name="dc_inspecao_obs"
            placeholder="Observações da inspeção"
            defaultValue={dc?.exame.inspecao_obs ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dc_estruturas_dolorosas">Estruturas dolorosas</Label>
          <Input
            id="dc_estruturas_dolorosas"
            name="dc_estruturas_dolorosas"
            defaultValue={dc?.exame.estruturas_dolorosas ?? ""}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TriRadio
            name="dc_espessamento"
            label="Espessamento"
            defaultValue={triFromBool(dc?.exame.espessamento)}
          />
          <TriRadio
            name="dc_crepitacao"
            label="Crepitação"
            defaultValue={triFromBool(dc?.exame.crepitacao)}
          />
          <TriRadio
            name="dc_temperatura"
            label="Temperatura aumentada"
            defaultValue={triFromBool(dc?.exame.temperatura_aumentada)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dc_adm_ativa">ADM ativa</Label>
            <Input
              id="dc_adm_ativa"
              name="dc_adm_ativa"
              defaultValue={dc?.exame.adm_ativa ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dc_adm_passiva">ADM passiva</Label>
            <Input
              id="dc_adm_passiva"
              name="dc_adm_passiva"
              defaultValue={dc?.exame.adm_passiva ?? ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Limitação por</Label>
          <CheckboxGroup
            name="dc_limitacao"
            options={LIMITACAO_ADM_OPCOES}
            selected={dc?.exame.limitacao ?? []}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dc_forca_muscular">Força muscular</Label>
            <Textarea
              id="dc_forca_muscular"
              name="dc_forca_muscular"
              rows={2}
              defaultValue={dc?.exame.forca_muscular ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dc_testes_especiais">Testes especiais</Label>
            <Textarea
              id="dc_testes_especiais"
              name="dc_testes_especiais"
              rows={2}
              defaultValue={dc?.exame.testes_especiais ?? ""}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="exame_fisico">Notas livres do exame</Label>
          <Textarea
            id="exame_fisico"
            name="exame_fisico"
            rows={2}
            defaultValue={avaliacao?.exame_fisico ?? ""}
          />
        </div>
      </Secao>

      <Secao
        title="Hipótese e procedimento"
        icon={Target}
      >
        <div className="space-y-1.5">
          <Label htmlFor="dc_hipotese">Hipótese diagnóstica funcional</Label>
          <Textarea
            id="dc_hipotese"
            name="dc_hipotese"
            rows={2}
            defaultValue={
              dc?.hipotese_diagnostica ??
              avaliacao?.diagnostico_fisioterapeutico ??
              ""
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Indicação do procedimento</Label>
          <CheckboxGroup
            name="dc_indicacao"
            options={INDICACAO_OPCOES}
            selected={dc?.procedimento.indicacao ?? []}
          />
          <Input
            name="dc_indicacao_outro"
            placeholder="Outra indicação"
            defaultValue={dc?.procedimento.indicacao_outro ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Objetivo do procedimento</Label>
          <CheckboxGroup
            name="dc_objetivo_proc"
            options={OBJETIVO_PROC_OPCOES}
            selected={dc?.procedimento.objetivo ?? []}
          />
          <Input
            name="dc_objetivo_outro"
            placeholder="Outro objetivo"
            defaultValue={dc?.procedimento.objetivo_outro ?? ""}
          />
        </div>
      </Secao>

      <Secao title="Contraindicações verificadas" icon={ShieldAlert}>
        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="dc_contra_nenhuma"
            checked={contraNenhuma}
            onChange={(e) => setContraNenhuma(e.target.checked)}
            className="size-3.5 accent-[var(--primary)]"
          />
          Nenhuma contraindicação identificada
        </label>
        {!contraNenhuma ? (
          <CheckboxGroup
            name="dc_contraindicacoes"
            options={CONTRAINDICACOES_OPCOES}
            selected={dc?.contraindicacoes.itens ?? []}
          />
        ) : null}
      </Secao>
      </fieldset>

      <Secao title="Observações gerais" icon={StickyNote}>
        <Textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={avaliacao?.observacoes ?? ""}
          placeholder={
            recovery
              ? "Ex.: massagem, bota de compressão…"
              : "Notas adicionais"
          }
        />
      </Secao>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando…"
            : editing
              ? "Salvar avaliação"
              : "Registrar avaliação"}
        </Button>
        <Link href={voltar}>
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}
