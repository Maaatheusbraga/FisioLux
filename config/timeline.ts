import type { tipo_evento_timeline } from "@prisma/client";
import type { TipoEventoTimeline } from "@/types/dominio";

export const LABELS_TIPO_EVENTO: Record<TipoEventoTimeline, string> = {
  paciente_criado: "Paciente cadastrado",
  paciente_atualizado: "Cadastro atualizado",
  paciente_excluido: "Paciente excluído",
  sessao_criada: "Sessão registrada",
  sessao_atualizada: "Sessão atualizada",
  sessao_cancelada: "Sessão cancelada",
  protocolo_criado: "Protocolo criado",
  protocolo_atualizado: "Protocolo atualizado",
  protocolo_vinculado: "Protocolo vinculado",
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
  arquivo_adicionado: "Arquivo adicionado",
  arquivo_excluido: "Arquivo excluído",
  documento_anexado: "Documento anexado",
};

/** Eventos visíveis para recepção (não clínicos). */
export const TIPOS_EVENTO_CADASTRAIS: tipo_evento_timeline[] = [
  "paciente_criado",
  "paciente_atualizado",
  "paciente_excluido",
  "documento_anexado",
];

export function labelTipoEvento(tipo: string): string {
  return (
    LABELS_TIPO_EVENTO[tipo as TipoEventoTimeline] ??
    tipo.replaceAll("_", " ")
  );
}
