/**
 * Contratos de domínio — alinhados ao Prisma schema (Fase 2).
 */

export type PerfilUsuario = "administrador" | "fisioterapeuta" | "recepcao";

export type SexoPaciente =
  | "masculino"
  | "feminino"
  | "outro"
  | "nao_informado";

export type StatusPaciente = "em_tratamento" | "alta";

export type StatusSessao = "registrada" | "cancelada";

export type TipoAvaliacao = "inicial" | "periodica";

export type CategoriaArquivo =
  | "encaminhamento"
  | "relatorio_medico"
  | "laudo"
  | "receita"
  | "foto_antes"
  | "foto_depois"
  | "foto_evolucao"
  | "video"
  | "documento";

export type StorageProvider = "supabase" | "r2";

export type TipoEventoTimeline =
  | "paciente_criado"
  | "paciente_atualizado"
  | "paciente_excluido"
  | "sessao_criada"
  | "sessao_atualizada"
  | "sessao_cancelada"
  | "protocolo_criado"
  | "protocolo_atualizado"
  | "protocolo_vinculado"
  | "anamnese_criada"
  | "anamnese_atualizada"
  | "avaliacao_criada"
  | "avaliacao_atualizada"
  | "plano_terapeutico_criado"
  | "plano_terapeutico_atualizado"
  | "evolucao_criada"
  | "evolucao_atualizada"
  | "alta_registrada"
  | "tratamento_reaberto"
  | "arquivo_adicionado"
  | "arquivo_excluido"
  | "documento_anexado";

export type AcaoAuditoria = "criar" | "alterar" | "excluir" | "restaurar";
