-- FisioLux — constraints extras + Row Level Security (rede de segurança)
-- Isolamento por clinica_id via auth.uid() → usuarios.auth_user_id
-- A aplicação (Prisma) usa connection privilegiada; RLS protege acessos via roles Supabase.

-- ─────────────────────────────────────────────
-- Compatibilidade: roles/funções Supabase (no-op se já existirem)
-- ─────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS auth;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'auth' AND p.proname = 'uid'
  ) THEN
    EXECUTE $fn$
      CREATE FUNCTION auth.uid()
      RETURNS uuid
      LANGUAGE sql
      STABLE
      AS $body$
        SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
      $body$
    $fn$;
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- Constraints de domínio
-- ─────────────────────────────────────────────

-- CPF único por clínica entre registros ativos (soft delete)
CREATE UNIQUE INDEX IF NOT EXISTS pacientes_clinica_cpf_ativos_uidx
  ON public.pacientes (clinica_id, cpf)
  WHERE deleted_at IS NULL;

-- E-mail único por clínica entre usuários ativos (soft delete)
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_clinica_email_ativos_uidx
  ON public.usuarios (clinica_id, email)
  WHERE deleted_at IS NULL;

-- Escala de dor 0–10
ALTER TABLE public.sessoes
  ADD CONSTRAINT sessoes_escala_dor_check
  CHECK (escala_dor IS NULL OR (escala_dor >= 0 AND escala_dor <= 10));

ALTER TABLE public.evolucoes
  ADD CONSTRAINT evolucoes_escala_dor_check
  CHECK (escala_dor IS NULL OR (escala_dor >= 0 AND escala_dor <= 10));

-- CPF com 11 dígitos (somente números, sem formatação)
ALTER TABLE public.pacientes
  ADD CONSTRAINT pacientes_cpf_formato_check
  CHECK (cpf ~ '^[0-9]{11}$');

-- ─────────────────────────────────────────────
-- Helpers RLS (Supabase Auth)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fisiolux_clinica_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.clinica_id
  FROM public.usuarios u
  WHERE u.auth_user_id = auth.uid()
    AND u.deleted_at IS NULL
    AND u.ativo = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.fisiolux_perfil()
RETURNS public.perfil_usuario
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.perfil
  FROM public.usuarios u
  WHERE u.auth_user_id = auth.uid()
    AND u.deleted_at IS NULL
    AND u.ativo = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.fisiolux_eh_clinico()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.fisiolux_perfil() IN ('administrador'::public.perfil_usuario, 'fisioterapeuta'::public.perfil_usuario);
$$;

REVOKE ALL ON FUNCTION public.fisiolux_clinica_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fisiolux_perfil() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fisiolux_eh_clinico() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fisiolux_clinica_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fisiolux_perfil() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fisiolux_eh_clinico() TO authenticated;

-- ─────────────────────────────────────────────
-- RLS: habilitar em tabelas de negócio
-- (sem FORCE — owner/Prisma continua operacional)
-- ─────────────────────────────────────────────

ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes_protocolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_terapeuticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.altas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Anon: sem acesso
CREATE POLICY clinicas_anon_deny ON public.clinicas FOR ALL TO anon USING (false);
CREATE POLICY usuarios_anon_deny ON public.usuarios FOR ALL TO anon USING (false);
CREATE POLICY pacientes_anon_deny ON public.pacientes FOR ALL TO anon USING (false);
CREATE POLICY protocolos_anon_deny ON public.protocolos FOR ALL TO anon USING (false);
CREATE POLICY sessoes_anon_deny ON public.sessoes FOR ALL TO anon USING (false);
CREATE POLICY sessoes_protocolos_anon_deny ON public.sessoes_protocolos FOR ALL TO anon USING (false);
CREATE POLICY anamneses_anon_deny ON public.anamneses FOR ALL TO anon USING (false);
CREATE POLICY avaliacoes_anon_deny ON public.avaliacoes FOR ALL TO anon USING (false);
CREATE POLICY planos_terapeuticos_anon_deny ON public.planos_terapeuticos FOR ALL TO anon USING (false);
CREATE POLICY evolucoes_anon_deny ON public.evolucoes FOR ALL TO anon USING (false);
CREATE POLICY altas_anon_deny ON public.altas FOR ALL TO anon USING (false);
CREATE POLICY arquivos_anon_deny ON public.arquivos FOR ALL TO anon USING (false);
CREATE POLICY timeline_eventos_anon_deny ON public.timeline_eventos FOR ALL TO anon USING (false);
CREATE POLICY logs_auditoria_anon_deny ON public.logs_auditoria FOR ALL TO anon USING (false);

-- Clínicas: usuário só vê a própria
CREATE POLICY clinicas_select_propria ON public.clinicas
  FOR SELECT TO authenticated
  USING (id = public.fisiolux_clinica_id() AND deleted_at IS NULL);

CREATE POLICY clinicas_update_admin ON public.clinicas
  FOR UPDATE TO authenticated
  USING (id = public.fisiolux_clinica_id() AND public.fisiolux_perfil() = 'administrador')
  WITH CHECK (id = public.fisiolux_clinica_id() AND public.fisiolux_perfil() = 'administrador');

-- Usuários: mesma clínica; gestão só admin
CREATE POLICY usuarios_select_clinica ON public.usuarios
  FOR SELECT TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id());

CREATE POLICY usuarios_insert_admin ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    clinica_id = public.fisiolux_clinica_id()
    AND public.fisiolux_perfil() = 'administrador'
  );

CREATE POLICY usuarios_update_admin ON public.usuarios
  FOR UPDATE TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_perfil() = 'administrador')
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_perfil() = 'administrador');

-- Pacientes: toda a clínica (cadastro); soft-deleted filtrado na app
CREATE POLICY pacientes_all_clinica ON public.pacientes
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id());

-- Protocolos: só perfis clínicos
CREATE POLICY protocolos_clinico ON public.protocolos
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

-- Sessões e prontuário: só clínico
CREATE POLICY sessoes_clinico ON public.sessoes
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

CREATE POLICY sessoes_protocolos_clinico ON public.sessoes_protocolos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessoes s
      WHERE s.id = sessao_id
        AND s.clinica_id = public.fisiolux_clinica_id()
        AND public.fisiolux_eh_clinico()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessoes s
      WHERE s.id = sessao_id
        AND s.clinica_id = public.fisiolux_clinica_id()
        AND public.fisiolux_eh_clinico()
    )
  );

CREATE POLICY anamneses_clinico ON public.anamneses
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

CREATE POLICY avaliacoes_clinico ON public.avaliacoes
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

CREATE POLICY planos_terapeuticos_clinico ON public.planos_terapeuticos
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

CREATE POLICY evolucoes_clinico ON public.evolucoes
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

CREATE POLICY altas_clinico ON public.altas
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

-- Arquivos: clínico vê/escreve tudo da clínica; recepção só metadados cadastrais (sem sessão)
CREATE POLICY arquivos_select_clinica ON public.arquivos
  FOR SELECT TO authenticated
  USING (
    clinica_id = public.fisiolux_clinica_id()
    AND (
      public.fisiolux_eh_clinico()
      OR (
        public.fisiolux_perfil() = 'recepcao'
        AND sessao_id IS NULL
        AND categoria IN (
          'encaminhamento'::public.categoria_arquivo,
          'documento'::public.categoria_arquivo
        )
      )
    )
  );

CREATE POLICY arquivos_write_clinico ON public.arquivos
  FOR INSERT TO authenticated
  WITH CHECK (
    clinica_id = public.fisiolux_clinica_id()
    AND (
      public.fisiolux_eh_clinico()
      OR (
        public.fisiolux_perfil() = 'recepcao'
        AND sessao_id IS NULL
        AND categoria IN (
          'encaminhamento'::public.categoria_arquivo,
          'documento'::public.categoria_arquivo
        )
      )
    )
  );

CREATE POLICY arquivos_update_clinico ON public.arquivos
  FOR UPDATE TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

CREATE POLICY arquivos_delete_clinico ON public.arquivos
  FOR DELETE TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

-- Timeline: clínico vê completa; recepção não (defesa em profundidade)
CREATE POLICY timeline_eventos_clinico ON public.timeline_eventos
  FOR ALL TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id() AND public.fisiolux_eh_clinico());

-- Auditoria: leitura admin; insert autenticado da clínica
CREATE POLICY logs_auditoria_select_admin ON public.logs_auditoria
  FOR SELECT TO authenticated
  USING (
    clinica_id = public.fisiolux_clinica_id()
    AND public.fisiolux_perfil() = 'administrador'
  );

CREATE POLICY logs_auditoria_insert_clinica ON public.logs_auditoria
  FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.fisiolux_clinica_id());
