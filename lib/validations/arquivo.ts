import { z } from "zod";

export const categoriaArquivoSchema = z.enum([
  "encaminhamento",
  "relatorio_medico",
  "laudo",
  "receita",
  "foto_antes",
  "foto_depois",
  "foto_evolucao",
  "video",
  "documento",
]);

export const uploadArquivoMetaSchema = z
  .object({
    paciente_id: z.string().uuid("Paciente inválido."),
    sessao_id: z
      .string()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined))
      .pipe(z.string().uuid().optional()),
    categoria: categoriaArquivoSchema,
    descricao: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.categoria === "documento" && !data.descricao) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a descrição para a categoria Documento.",
        path: ["descricao"],
      });
    }
  });

export type UploadArquivoMetaInput = z.infer<typeof uploadArquivoMetaSchema>;

export const listarArquivosQuerySchema = z.object({
  paciente: z.string().uuid().optional(),
  sessao: z.string().uuid().optional(),
  categoria: z
    .enum([
      "todos",
      "encaminhamento",
      "relatorio_medico",
      "laudo",
      "receita",
      "foto_antes",
      "foto_depois",
      "foto_evolucao",
      "video",
      "documento",
    ])
    .optional()
    .default("todos"),
  page: z.coerce.number().int().min(1).optional().default(1),
});
