import { z } from "zod";

export const statusSessaoSchema = z.enum(["registrada", "cancelada"]);

export const sessaoFormSchema = z.object({
  paciente_id: z.string().uuid("Paciente inválido."),
  profissional_id: z.string().uuid("Profissional inválido."),
  realizado_em: z
    .string()
    .min(1, "Informe data e horário.")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data/hora inválida."),
  procedimentos: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  equipamentos: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
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
  observacoes: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  status: statusSessaoSchema.default("registrada"),
  protocolo_ids: z
    .array(z.string().uuid())
    .optional()
    .default([]),
});

export type SessaoFormInput = z.infer<typeof sessaoFormSchema>;

export const listarSessoesQuerySchema = z.object({
  paciente: z.string().uuid().optional(),
  status: z.enum(["todos", "registrada", "cancelada"]).optional().default("todos"),
  page: z.coerce.number().int().min(1).optional().default(1),
});
