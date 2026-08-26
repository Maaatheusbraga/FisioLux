-- Sprint B: índices parciais alinhados às queries + RLS em agenda_eventos

CREATE INDEX IF NOT EXISTS "pacientes_clinica_status_ativos_idx"
  ON "pacientes" ("clinica_id", "status")
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "sessoes_paciente_realizado_ativos_idx"
  ON "sessoes" ("paciente_id", "realizado_em" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "anamneses_paciente_data_ativos_idx"
  ON "anamneses" ("paciente_id", "data_anamnese" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "avaliacoes_paciente_data_ativos_idx"
  ON "avaliacoes" ("paciente_id", "data_avaliacao" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "avaliacoes_clinica_data_ativos_idx"
  ON "avaliacoes" ("clinica_id", "data_avaliacao" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "planos_paciente_data_ativos_idx"
  ON "planos_terapeuticos" ("paciente_id", "data_plano" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "evolucoes_paciente_data_ativos_idx"
  ON "evolucoes" ("paciente_id", "data_evolucao" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "evolucoes_clinica_data_ativos_idx"
  ON "evolucoes" ("clinica_id", "data_evolucao" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "altas_paciente_id_data_alta_idx"
  ON "altas" ("paciente_id", "data_alta" DESC);

CREATE INDEX IF NOT EXISTS "timeline_eventos_clinica_id_ocorrido_em_idx"
  ON "timeline_eventos" ("clinica_id", "ocorrido_em" DESC);

CREATE INDEX IF NOT EXISTS "arquivos_clinica_categoria_ativos_idx"
  ON "arquivos" ("clinica_id", "categoria")
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "agenda_eventos_clinica_inicio_ativos_idx"
  ON "agenda_eventos" ("clinica_id", "inicio")
  WHERE "deleted_at" IS NULL;

-- Também cria índices do schema Prisma (composites) se ainda não existirem
CREATE INDEX IF NOT EXISTS "sessoes_paciente_id_realizado_em_idx"
  ON "sessoes" ("paciente_id", "realizado_em");

CREATE INDEX IF NOT EXISTS "anamneses_paciente_id_data_anamnese_idx"
  ON "anamneses" ("paciente_id", "data_anamnese");

CREATE INDEX IF NOT EXISTS "avaliacoes_paciente_id_data_avaliacao_idx"
  ON "avaliacoes" ("paciente_id", "data_avaliacao");

CREATE INDEX IF NOT EXISTS "avaliacoes_clinica_id_data_avaliacao_idx"
  ON "avaliacoes" ("clinica_id", "data_avaliacao");

CREATE INDEX IF NOT EXISTS "planos_terapeuticos_paciente_id_data_plano_idx"
  ON "planos_terapeuticos" ("paciente_id", "data_plano");

CREATE INDEX IF NOT EXISTS "evolucoes_paciente_id_data_evolucao_idx"
  ON "evolucoes" ("paciente_id", "data_evolucao");

CREATE INDEX IF NOT EXISTS "evolucoes_clinica_id_data_evolucao_idx"
  ON "evolucoes" ("clinica_id", "data_evolucao");

CREATE INDEX IF NOT EXISTS "arquivos_clinica_id_categoria_idx"
  ON "arquivos" ("clinica_id", "categoria");

-- RLS agenda
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agenda_eventos_anon_deny ON public.agenda_eventos;
CREATE POLICY agenda_eventos_anon_deny ON public.agenda_eventos
  FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS agenda_eventos_clinico ON public.agenda_eventos;
CREATE POLICY agenda_eventos_clinico ON public.agenda_eventos
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());
