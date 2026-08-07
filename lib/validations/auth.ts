import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .transform((v) => v.toLowerCase()),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export const recuperarSenhaSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .transform((v) => v.toLowerCase()),
});

export const redefinirSenhaSchema = z
  .object({
    senha: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres."),
    confirmarSenha: z.string().min(8, "Confirme a nova senha."),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>;
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;
