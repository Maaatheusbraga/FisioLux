import { z } from "zod";
import { apenasDigitos, validarCpf } from "@/utils/cpf";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    const d = apenasDigitos(v);
    return d.length > 0 ? d : undefined;
  });

export const sexoPacienteSchema = z.enum([
  "masculino",
  "feminino",
  "outro",
  "nao_informado",
]);

export const statusPacienteSchema = z.enum(["em_tratamento", "alta"]);

export const pacienteFormSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome completo."),
  cpf: z
    .string()
    .trim()
    .transform(apenasDigitos)
    .refine((v) => v.length === 11, "CPF deve ter 11 dígitos.")
    .refine(validarCpf, "CPF inválido."),
  rg: optionalText,
  sexo: sexoPacienteSchema.default("nao_informado"),
  data_nascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida."),
  telefone: optionalPhone,
  whatsapp: optionalPhone,
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v.toLowerCase() : undefined))
    .refine(
      (v) => v === undefined || z.string().email().safeParse(v).success,
      "E-mail inválido.",
    ),
  endereco: optionalText,
  observacoes: optionalText,
  diagnostico: optionalText,
  medicamentos: optionalText,
  alergias: optionalText,
  historico_medico: optionalText,
  objetivo_tratamento: optionalText,
  contato_emergencia_nome: optionalText,
  contato_emergencia_telefone: optionalPhone,
  contato_emergencia_parentesco: optionalText,
  status: statusPacienteSchema.default("em_tratamento"),
});

export type PacienteFormInput = z.infer<typeof pacienteFormSchema>;

export const listarPacientesQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(["todos", "em_tratamento", "alta"]).optional().default("todos"),
  page: z.coerce.number().int().min(1).optional().default(1),
});
