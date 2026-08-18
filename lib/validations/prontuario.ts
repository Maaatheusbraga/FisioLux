import { z } from "zod";
import type { DadosComplementaresAvaliacao } from "@/lib/validations/avaliacao-musculoesqueletica";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const dataObrigatoria = z
  .string()
  .min(1, "Informe a data.")
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida.");

export const avaliacaoFormSchema = z.object({
  paciente_id: z.string().uuid("Paciente inválido."),
  tipo: z.enum(["inicial", "periodica"]),
  data_avaliacao: dataObrigatoria,
  queixa_principal: optionalText,
  exame_fisico: optionalText,
  diagnostico_fisioterapeutico: optionalText,
  objetivos: optionalText,
  observacoes: optionalText,
  dados_complementares: z.custom<DadosComplementaresAvaliacao>().optional(),
});

export type AvaliacaoFormInput = z.infer<typeof avaliacaoFormSchema>;

export const planoFormSchema = z.object({
  paciente_id: z.string().uuid("Paciente inválido."),
  data_plano: dataObrigatoria,
  objetivos: optionalText,
  condutas: optionalText,
  frequencia_sugerida: optionalText,
  previsao_sessoes: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    })
    .refine(
      (v) => v === undefined || (Number.isInteger(v) && v > 0 && v <= 500),
      "Previsão de sessões deve ser entre 1 e 500.",
    ),
  observacoes: optionalText,
});

export type PlanoFormInput = z.infer<typeof planoFormSchema>;

export const evolucaoFormSchema = z.object({
  paciente_id: z.string().uuid("Paciente inválido."),
  data_evolucao: dataObrigatoria,
  descricao: z.string().trim().min(2, "Descreva a evolução."),
  escala_dor: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    })
    .refine(
      (v) => v === undefined || (Number.isInteger(v) && v >= 0 && v <= 10),
      "Escala de dor deve ser entre 0 e 10.",
    ),
  observacoes: optionalText,
  sessao_id: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || z.string().uuid().safeParse(v).success,
      "Sessão inválida.",
    ),
});

export type EvolucaoFormInput = z.infer<typeof evolucaoFormSchema>;

export const altaFormSchema = z.object({
  paciente_id: z.string().uuid("Paciente inválido."),
  data_alta: dataObrigatoria,
  motivo: optionalText,
  observacoes: optionalText,
});

export type AltaFormInput = z.infer<typeof altaFormSchema>;

export const reabrirFormSchema = z.object({
  paciente_id: z.string().uuid("Paciente inválido."),
});
