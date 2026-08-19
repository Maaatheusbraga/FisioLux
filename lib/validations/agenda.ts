import { z } from "zod";
import { parseDateTimeLocalBr } from "@/utils/date";

const datetimeLocal = z
  .string()
  .trim()
  .min(1, "Informe data e hora.")
  .transform((v) => parseDateTimeLocalBr(v));

export const agendaEventoFormSchema = z
  .object({
    paciente_id: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
    titulo: z.string().trim().min(2, "Informe o título do evento."),
    descricao: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
    inicio: datetimeLocal,
    fim: datetimeLocal,
  })
  .superRefine((data, ctx) => {
    if (data.fim <= data.inicio) {
      ctx.addIssue({
        code: "custom",
        message: "O término deve ser posterior ao início.",
        path: ["fim"],
      });
    }
  });

export type AgendaEventoFormInput = z.infer<typeof agendaEventoFormSchema>;

export const agendaGoogleCalendarIdSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : "primary"));

export const agendaConfigSchema = z.object({
  oauth_client_id: z
    .string()
    .trim()
    .min(10, "Informe o Client ID OAuth do Google Cloud."),
  oauth_client_secret: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  agenda_google_calendar_id: agendaGoogleCalendarIdSchema,
  agenda_embed_url: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) =>
        v === undefined ||
        /^https:\/\/calendar\.google\.com\/calendar\/embed\?/i.test(v) ||
        v.includes("<iframe"),
      {
        message:
          "Informe uma URL de incorporação do Google Calendar ou o código iframe.",
      },
    ),
});

export type AgendaConfigInput = z.infer<typeof agendaConfigSchema>;
