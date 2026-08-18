-- Rede de segurança PostgREST + Storage.
-- Prisma continua como owner (sem FORCE RLS): queries da app não passam por estas policies.
-- A superfície de risco é anon/authenticated via API do Supabase.

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.fisiolux_clinica_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fisiolux_perfil() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fisiolux_eh_clinico() TO authenticated;

-- Pacientes: soft-delete não vaza por PostgREST se alguém reativar GRANT.
DROP POLICY IF EXISTS pacientes_all_clinica ON public.pacientes;

CREATE POLICY pacientes_select_ativos ON public.pacientes
  FOR SELECT TO authenticated
  USING (
    clinica_id = public.fisiolux_clinica_id()
    AND deleted_at IS NULL
  );

CREATE POLICY pacientes_insert_clinica ON public.pacientes
  FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.fisiolux_clinica_id());

CREATE POLICY pacientes_update_clinica ON public.pacientes
  FOR UPDATE TO authenticated
  USING (clinica_id = public.fisiolux_clinica_id())
  WITH CHECK (clinica_id = public.fisiolux_clinica_id());

-- Arquivos: categorias alinhadas à app (recepção: docs cadastrais).
DROP POLICY IF EXISTS arquivos_select_clinica ON public.arquivos;
DROP POLICY IF EXISTS arquivos_write_clinico ON public.arquivos;

CREATE POLICY arquivos_select_clinica ON public.arquivos
  FOR SELECT TO authenticated
  USING (
    clinica_id = public.fisiolux_clinica_id()
    AND deleted_at IS NULL
    AND (
      public.fisiolux_eh_clinico()
      OR (
        public.fisiolux_perfil() = 'recepcao'
        AND sessao_id IS NULL
        AND categoria IN (
          'encaminhamento'::public.categoria_arquivo,
          'relatorio_medico'::public.categoria_arquivo,
          'laudo'::public.categoria_arquivo,
          'receita'::public.categoria_arquivo,
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
          'relatorio_medico'::public.categoria_arquivo,
          'laudo'::public.categoria_arquivo,
          'receita'::public.categoria_arquivo,
          'documento'::public.categoria_arquivo
        )
      )
    )
  );

-- Storage: bucket privado + leitura só da pasta da clínica (upload segue service role).
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    UPDATE storage.buckets
    SET public = false
    WHERE id = 'fisiolux';
  END IF;

  IF to_regclass('storage.objects') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS fisiolux_storage_anon_deny ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS fisiolux_storage_select_clinica ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS fisiolux_storage_write_deny ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS fisiolux_storage_update_deny ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS fisiolux_storage_delete_deny ON storage.objects';
    EXECUTE $p$
      CREATE POLICY fisiolux_storage_anon_deny ON storage.objects
        FOR ALL TO anon
        USING (false)
        WITH CHECK (false)
    $p$;
    EXECUTE $p$
      CREATE POLICY fisiolux_storage_select_clinica ON storage.objects
        FOR SELECT TO authenticated
        USING (
          bucket_id = 'fisiolux'
          AND (split_part(name, '/', 1) = public.fisiolux_clinica_id()::text)
        )
    $p$;
    EXECUTE $p$
      CREATE POLICY fisiolux_storage_write_deny ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (false)
    $p$;
    EXECUTE $p$
      CREATE POLICY fisiolux_storage_update_deny ON storage.objects
        FOR UPDATE TO authenticated
        USING (false)
        WITH CHECK (false)
    $p$;
    EXECUTE $p$
      CREATE POLICY fisiolux_storage_delete_deny ON storage.objects
        FOR DELETE TO authenticated
        USING (false)
    $p$;
  END IF;
END $$;
