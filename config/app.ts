/**
 * Constantes da aplicação FisioLux (Fase 1).
 */
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "FisioLux",
  defaultTheme: (process.env.NEXT_PUBLIC_DEFAULT_THEME ?? "dark") as
    | "dark"
    | "light",
} as const;

export const perfis = [
  "administrador",
  "fisioterapeuta",
  "recepcao",
] as const;

export const categoriasArquivo = [
  "encaminhamento",
  "relatorio_medico",
  "laudo",
  "receita",
  "foto_antes",
  "foto_depois",
  "foto_evolucao",
  "video",
  "documento",
] as const;
