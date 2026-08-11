import { z } from "zod";
import { apenasDigitos } from "@/utils/cpf";

export const perfilUsuarioSchema = z.enum([
  "administrador",
  "fisioterapeuta",
  "recepcao",
]);

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    const d = apenasDigitos(v);
    return d.length > 0 ? d : undefined;
  });

const optionalCnpj = z
  .string()
  .trim()
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    const d = apenasDigitos(v);
    return d.length > 0 ? d : undefined;
  })
  .refine((v) => v === undefined || v.length === 14, {
    message: "CNPJ deve ter 14 dígitos.",
  });

export const usuarioFormSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  email: z
    .string()
    .trim()
    .email("E-mail inválido.")
    .transform((v) => v.toLowerCase()),
  telefone: optionalPhone,
  perfil: perfilUsuarioSchema,
  ativo: z
    .enum(["true", "false"])
    .optional()
    .default("true")
    .transform((v) => v === "true"),
  senha: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export const criarUsuarioSchema = usuarioFormSchema.superRefine((data, ctx) => {
  if (!data.senha || data.senha.length < 8) {
    ctx.addIssue({
      code: "custom",
      message: "Senha inicial com pelo menos 8 caracteres.",
      path: ["senha"],
    });
  }
});

export const atualizarUsuarioSchema = usuarioFormSchema.omit({
  email: true,
  senha: true,
});

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;
export type AtualizarUsuarioInput = z.infer<typeof atualizarUsuarioSchema>;

export const clinicaFormSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da clínica."),
  cnpj: optionalCnpj,
  telefone: optionalPhone,
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v.toLowerCase() : undefined))
    .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
      message: "E-mail inválido.",
    }),
  endereco: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  ativa: z
    .enum(["true", "false"])
    .optional()
    .default("true")
    .transform((v) => v === "true"),
});

export type ClinicaFormInput = z.infer<typeof clinicaFormSchema>;
