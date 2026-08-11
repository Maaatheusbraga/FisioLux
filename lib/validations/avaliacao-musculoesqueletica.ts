import { z } from "zod";

export const AVALIACAO_TEMPLATE = "musculoesqueletica" as const;
export const AVALIACAO_TEMPLATE_VERSAO = 1;

export const CRONOLOGIA_OPCOES = [
  { value: "agudo", label: "Agudo (< 6 semanas)" },
  { value: "subagudo", label: "Subagudo (6–12 semanas)" },
  { value: "cronico", label: "Crônico (> 12 semanas)" },
] as const;

export const MECANISMO_OPCOES = [
  { value: "traumatico", label: "Traumático" },
  { value: "sobrecarga", label: "Sobrecarga" },
  { value: "espontaneo", label: "Espontâneo" },
  { value: "pos_operatorio", label: "Pós-operatório" },
  { value: "outro", label: "Outro" },
] as const;

export const TRATAMENTOS_PREVIOS_OPCOES = [
  { value: "fisioterapia", label: "Fisioterapia" },
  { value: "medicamentos", label: "Medicamentos" },
  { value: "infiltracao", label: "Infiltração" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "ondas_choque", label: "Ondas de choque" },
  { value: "outros", label: "Outros" },
] as const;

export const DOR_CARACTERISTICAS_OPCOES = [
  { value: "pontada", label: "Pontada" },
  { value: "queimacao", label: "Queimação" },
  { value: "peso", label: "Peso" },
  { value: "choque", label: "Choque" },
  { value: "latejante", label: "Latejante" },
  { value: "rigidez", label: "Rigidez" },
  { value: "outra", label: "Outra" },
] as const;

export const HISTORICO_CONDICOES_OPCOES = [
  { value: "hipertensao", label: "Hipertensão" },
  { value: "diabetes", label: "Diabetes" },
  { value: "doenca_vascular", label: "Doença vascular" },
  { value: "doenca_autoimune", label: "Doença autoimune" },
  { value: "cancer", label: "Câncer" },
  { value: "osteoporose", label: "Osteoporose" },
  { value: "infeccao_ativa", label: "Infecção ativa" },
  { value: "gestacao", label: "Gestação" },
  { value: "anticoagulantes", label: "Uso de anticoagulantes" },
  { value: "alergia_medicamentosa", label: "Alergia medicamentosa" },
] as const;

export const INSPECAO_OPCOES = [
  { value: "edema", label: "Edema" },
  { value: "rubor", label: "Rubor" },
  { value: "equimose", label: "Equimose" },
  { value: "atrofia", label: "Atrofia" },
  { value: "deformidade", label: "Deformidade" },
  { value: "derrame_articular", label: "Derrame articular" },
] as const;

export const LIMITACAO_ADM_OPCOES = [
  { value: "dor", label: "Dor" },
  { value: "rigidez", label: "Rigidez" },
  { value: "bloqueio", label: "Bloqueio" },
  { value: "fraqueza", label: "Fraqueza" },
] as const;

export const US_ACHADOS_OPCOES = [
  { value: "tendinopatia", label: "Tendinopatia" },
  { value: "rotura_parcial", label: "Rotura parcial" },
  { value: "rotura_completa", label: "Rotura completa" },
  { value: "bursite", label: "Bursite" },
  { value: "sinovite", label: "Sinovite" },
  { value: "derrame", label: "Derrame" },
  { value: "calcificacao", label: "Calcificação" },
  { value: "fibrose", label: "Fibrose" },
  { value: "espessamento_fascial", label: "Espessamento fascial" },
  { value: "outro", label: "Outro" },
] as const;

export const INDICACAO_OPCOES = [
  { value: "tendao", label: "Tendão" },
  { value: "bursa", label: "Bursa" },
  { value: "articulacao", label: "Articulação" },
  { value: "ligamento", label: "Ligamento" },
  { value: "fascia", label: "Fáscia" },
  { value: "cicatriz", label: "Cicatriz" },
  { value: "ponto_gatilho", label: "Ponto-gatilho" },
  { value: "nervo_periferico", label: "Nervo periférico" },
  { value: "outro", label: "Outro" },
] as const;

export const OBJETIVO_PROC_OPCOES = [
  { value: "analgesia", label: "Analgesia" },
  { value: "regeneracao", label: "Regeneração" },
  { value: "modulacao_inflamatoria", label: "Modulação inflamatória" },
  { value: "hidrodisseccao", label: "Hidrodissecção" },
  { value: "terapia_neural", label: "Terapia neural" },
  { value: "outro", label: "Outro" },
] as const;

export const CONTRAINDICACOES_OPCOES = [
  { value: "infeccao_local", label: "Infecção local" },
  { value: "infeccao_sistemica", label: "Infecção sistêmica" },
  { value: "febre", label: "Febre" },
  { value: "alergia_conhecida", label: "Alergia conhecida" },
  { value: "coagulacao", label: "Alteração importante da coagulação" },
  { value: "anticoagulantes_avaliado", label: "Uso de anticoagulantes (avaliado)" },
  { value: "gestacao", label: "Gestação (quando aplicável)" },
] as const;

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const boolTri = z
  .enum(["", "sim", "nao"])
  .optional()
  .transform((v) => {
    if (v === "sim") return true;
    if (v === "nao") return false;
    return null;
  });

export const dadosComplementaresAvaliacaoSchema = z
  .object({
    template: z.literal(AVALIACAO_TEMPLATE).default(AVALIACAO_TEMPLATE),
    versao: z.literal(AVALIACAO_TEMPLATE_VERSAO).default(AVALIACAO_TEMPLATE_VERSAO),
    cronologia: z.enum(["agudo", "subagudo", "cronico"]).optional(),
    inicio_sintomas: optionalText,
    fatores_melhora_piora: optionalText,
    tratamentos_anteriores_texto: optionalText,
    hda: z.object({
      mecanismo: z.array(z.string()).default([]),
      mecanismo_outro: optionalText,
      evolucao: optionalText,
      tratamentos_previos: z.array(z.string()).default([]),
      tratamentos_outro: optionalText,
      resultado_obtido: optionalText,
    }),
    dor: z.object({
      eva: z.number().int().min(0).max(10).optional().nullable(),
      localizacao: optionalText,
      irradiacao: optionalText,
      caracteristicas: z.array(z.string()).default([]),
      caracteristica_outra: optionalText,
      piora_com: optionalText,
      melhora_com: optionalText,
    }),
    historico_clinico: z.object({
      condicoes: z.array(z.string()).default([]),
      outros: optionalText,
      medicamentos: optionalText,
    }),
    /** Campos que antes viviam na anamnese genérica (agora no intake da avaliação). */
    contexto: z
      .object({
        historico_familiar: optionalText,
        historico_social: optionalText,
        habitos_vida: optionalText,
        exames_complementares: optionalText,
      })
      .default({
        historico_familiar: undefined,
        historico_social: undefined,
        habitos_vida: undefined,
        exames_complementares: undefined,
      }),
    exame: z.object({
      inspecao: z.array(z.string()).default([]),
      inspecao_obs: optionalText,
      estruturas_dolorosas: optionalText,
      espessamento: z.boolean().nullable().optional(),
      crepitacao: z.boolean().nullable().optional(),
      temperatura_aumentada: z.boolean().nullable().optional(),
      adm_ativa: optionalText,
      adm_passiva: optionalText,
      limitacao: z.array(z.string()).default([]),
      forca_muscular: optionalText,
      testes_especiais: optionalText,
    }),
    ultrassonografia: z.object({
      achados: z.array(z.string()).default([]),
      outro: optionalText,
    }),
    hipotese_diagnostica: optionalText,
    procedimento: z.object({
      indicacao: z.array(z.string()).default([]),
      indicacao_outro: optionalText,
      objetivo: z.array(z.string()).default([]),
      objetivo_outro: optionalText,
    }),
    contraindicacoes: z.object({
      nenhuma: z.boolean().default(false),
      itens: z.array(z.string()).default([]),
    }),
  })
  .transform((data) => {
    if (data.contraindicacoes.nenhuma) {
      return {
        ...data,
        contraindicacoes: { nenhuma: true, itens: [] as string[] },
      };
    }
    return data;
  });

export type DadosComplementaresAvaliacao = z.infer<
  typeof dadosComplementaresAvaliacaoSchema
>;

function getAll(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .map(String)
    .map((v) => v.trim())
    .filter(Boolean);
}

function opt(formData: FormData, name: string): string | undefined {
  const v = formData.get(name);
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length > 0 ? s : undefined;
}

function parseEva(formData: FormData): number | null | undefined {
  const raw = opt(formData, "dc_dor_eva");
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function parseTri(formData: FormData, name: string): "sim" | "nao" | "" {
  const v = String(formData.get(name) || "");
  if (v === "sim" || v === "nao") return v;
  return "";
}

/** Extrai o bloco estruturado a partir do FormData do formulário de avaliação. */
export function dadosComplementaresFromFormData(formData: FormData) {
  const cronologiaRaw = opt(formData, "dc_cronologia");
  const cronologia =
    cronologiaRaw === "agudo" ||
    cronologiaRaw === "subagudo" ||
    cronologiaRaw === "cronico"
      ? cronologiaRaw
      : undefined;

  return dadosComplementaresAvaliacaoSchema.safeParse({
    template: AVALIACAO_TEMPLATE,
    versao: AVALIACAO_TEMPLATE_VERSAO,
    cronologia,
    inicio_sintomas: opt(formData, "dc_inicio_sintomas"),
    fatores_melhora_piora: opt(formData, "dc_fatores_melhora_piora"),
    tratamentos_anteriores_texto: opt(formData, "dc_tratamentos_anteriores"),
    hda: {
      mecanismo: getAll(formData, "dc_mecanismo"),
      mecanismo_outro: opt(formData, "dc_mecanismo_outro"),
      evolucao: opt(formData, "dc_hda_evolucao"),
      tratamentos_previos: getAll(formData, "dc_tratamentos_previos"),
      tratamentos_outro: opt(formData, "dc_tratamentos_outro"),
      resultado_obtido: opt(formData, "dc_resultado_obtido"),
    },
    dor: {
      eva: parseEva(formData),
      localizacao: opt(formData, "dc_dor_localizacao"),
      irradiacao: opt(formData, "dc_dor_irradiacao"),
      caracteristicas: getAll(formData, "dc_dor_caracteristicas"),
      caracteristica_outra: opt(formData, "dc_dor_outra"),
      piora_com: opt(formData, "dc_dor_piora"),
      melhora_com: opt(formData, "dc_dor_melhora"),
    },
    historico_clinico: {
      condicoes: getAll(formData, "dc_historico_condicoes"),
      outros: opt(formData, "dc_historico_outros"),
      medicamentos: opt(formData, "dc_medicamentos"),
    },
    contexto: {
      historico_familiar: opt(formData, "dc_historico_familiar"),
      historico_social: opt(formData, "dc_historico_social"),
      habitos_vida: opt(formData, "dc_habitos_vida"),
      exames_complementares: opt(formData, "dc_exames_complementares"),
    },
    exame: {
      inspecao: getAll(formData, "dc_inspecao"),
      inspecao_obs: opt(formData, "dc_inspecao_obs"),
      estruturas_dolorosas: opt(formData, "dc_estruturas_dolorosas"),
      espessamento: boolTri.parse(parseTri(formData, "dc_espessamento")),
      crepitacao: boolTri.parse(parseTri(formData, "dc_crepitacao")),
      temperatura_aumentada: boolTri.parse(
        parseTri(formData, "dc_temperatura"),
      ),
      adm_ativa: opt(formData, "dc_adm_ativa"),
      adm_passiva: opt(formData, "dc_adm_passiva"),
      limitacao: getAll(formData, "dc_limitacao"),
      forca_muscular: opt(formData, "dc_forca_muscular"),
      testes_especiais: opt(formData, "dc_testes_especiais"),
    },
    ultrassonografia: {
      achados: getAll(formData, "dc_us_achados"),
      outro: opt(formData, "dc_us_outro"),
    },
    hipotese_diagnostica: opt(formData, "dc_hipotese"),
    procedimento: {
      indicacao: getAll(formData, "dc_indicacao"),
      indicacao_outro: opt(formData, "dc_indicacao_outro"),
      objetivo: getAll(formData, "dc_objetivo_proc"),
      objetivo_outro: opt(formData, "dc_objetivo_outro"),
    },
    contraindicacoes: {
      nenhuma: formData.get("dc_contra_nenhuma") === "on",
      itens: getAll(formData, "dc_contraindicacoes"),
    },
  });
}

export function parseDadosComplementares(
  raw: unknown,
): DadosComplementaresAvaliacao | null {
  if (raw == null || typeof raw !== "object") return null;
  const base = {
    template: AVALIACAO_TEMPLATE,
    versao: AVALIACAO_TEMPLATE_VERSAO,
    hda: {},
    dor: {},
    historico_clinico: {},
    contexto: {},
    exame: {},
    ultrassonografia: {},
    procedimento: {},
    contraindicacoes: {},
    ...(raw as Record<string, unknown>),
  };
  const parsed = dadosComplementaresAvaliacaoSchema.safeParse(base);
  return parsed.success ? parsed.data : null;
}

export function triFromBool(value: boolean | null | undefined): string {
  if (value === true) return "sim";
  if (value === false) return "nao";
  return "";
}
