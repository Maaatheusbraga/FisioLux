import { z } from "zod";

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined));

export const listarTimelineQuerySchema = z.object({
  tipo: z.string().optional().default("todos"),
  profissional: z.string().optional().default("todos"),
  de: optionalDate,
  ate: optionalDate,
  page: z.coerce.number().int().min(1).optional().default(1),
  aba: z
    .enum(["timeline", "cadastro", "prontuario", "arquivos", "fotos"])
    .optional()
    .default("timeline"),
});
