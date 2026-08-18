import type { tipo_evento_timeline } from "@prisma/client";
import type { TipoEventoTimeline } from "@/types/dominio";

export const LABELS_TIPO_EVENTO: Record<TipoEventoTimeline, string> = {
  paciente_criado: "Cadastro",
  paciente_atualizado: "Cadastro atualizado",
  paciente_excluido: "Paciente excluído",
  sessao_criada: "Atendimento",
  sessao_atualizada: "Sessão atualizada",
  sessao_cancelada: "Sessão cancelada",
  protocolo_criado: "Protocolo criado",
  protocolo_atualizado: "Protocolo atualizado",
  protocolo_vinculado: "Protocolo",
  anamnese_criada: "Anamnese",
  anamnese_atualizada: "Anamnese atualizada",
  avaliacao_criada: "Avaliação",
  avaliacao_atualizada: "Avaliação atualizada",
  plano_terapeutico_criado: "Plano terapêutico",
  plano_terapeutico_atualizado: "Plano atualizado",
  evolucao_criada: "Evolução",
  evolucao_atualizada: "Evolução atualizada",
  alta_registrada: "Alta",
  tratamento_reaberto: "Tratamento reaberto",
  arquivo_adicionado: "Foto / vídeo",
  arquivo_excluido: "Arquivo excluído",
  documento_anexado: "Documento",
};

/** Marcos da jornada clínica — o que a Timeline mostra. */
export const TIPOS_EVENTO_JORNADA: tipo_evento_timeline[] = [
  "paciente_criado",
  "avaliacao_criada",
  "plano_terapeutico_criado",
  "sessao_criada",
  "evolucao_criada",
  "documento_anexado",
  "arquivo_adicionado",
  "protocolo_vinculado",
  "alta_registrada",
  "tratamento_reaberto",
];

/** Eventos visíveis para recepção (não clínicos). */
export const TIPOS_EVENTO_CADASTRAIS: tipo_evento_timeline[] = [
  "paciente_criado",
  "documento_anexado",
];

export function labelTipoEvento(tipo: string): string {
  return (
    LABELS_TIPO_EVENTO[tipo as TipoEventoTimeline] ??
    tipo.replaceAll("_", " ")
  );
}
