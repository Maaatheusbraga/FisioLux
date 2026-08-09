import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const protocoloFormSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do protocolo."),
  descricao: optionalText,
  objetivo: optionalText,
  tempo_estimado: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    })
    .refine(
      (v) => v === undefined || (Number.isInteger(v) && v > 0 && v <= 600),
      "Tempo estimado deve ser entre 1 e 600 minutos.",
    ),
  observacoes: optionalText,
  categorias: z
    .string()
    .optional()
    .transform((v) => {
      if (!v?.trim()) return [] as string[];
      return v
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
    }),
  ativo: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === undefined) return true;
      if (typeof v === "boolean") return v;
      return v === "true";
    }),
});

export type ProtocoloFormInput = z.infer<typeof protocoloFormSchema>;

export const listarProtocolosQuerySchema = z.object({
  busca: z.string().optional(),
  ativo: z.enum(["todos", "true", "false"]).optional().default("todos"),
  page: z.coerce.number().int().min(1).optional().default(1),
});
