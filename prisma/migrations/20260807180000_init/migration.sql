-- CreateEnum
CREATE TYPE "perfil_usuario" AS ENUM ('administrador', 'fisioterapeuta', 'recepcao');

-- CreateEnum
CREATE TYPE "sexo_paciente" AS ENUM ('masculino', 'feminino', 'outro', 'nao_informado');

-- CreateEnum
CREATE TYPE "status_paciente" AS ENUM ('em_tratamento', 'alta');

-- CreateEnum
CREATE TYPE "status_sessao" AS ENUM ('registrada', 'cancelada');

-- CreateEnum
CREATE TYPE "tipo_avaliacao" AS ENUM ('inicial', 'periodica');

-- CreateEnum
CREATE TYPE "categoria_arquivo" AS ENUM ('encaminhamento', 'relatorio_medico', 'laudo', 'receita', 'foto_antes', 'foto_depois', 'foto_evolucao', 'video', 'documento');

-- CreateEnum
CREATE TYPE "storage_provider" AS ENUM ('supabase', 'r2');

-- CreateEnum
CREATE TYPE "tipo_evento_timeline" AS ENUM ('paciente_criado', 'paciente_atualizado', 'paciente_excluido', 'sessao_criada', 'sessao_atualizada', 'sessao_cancelada', 'protocolo_criado', 'protocolo_atualizado', 'protocolo_vinculado', 'anamnese_criada', 'anamnese_atualizada', 'avaliacao_criada', 'avaliacao_atualizada', 'plano_terapeutico_criado', 'plano_terapeutico_atualizado', 'evolucao_criada', 'evolucao_atualizada', 'alta_registrada', 'tratamento_reaberto', 'arquivo_adicionado', 'arquivo_excluido', 'documento_anexado');

-- CreateEnum
CREATE TYPE "acao_auditoria" AS ENUM ('criar', 'alterar', 'excluir', 'restaurar');

-- CreateTable
CREATE TABLE "clinicas" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "auth_user_id" UUID,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "perfil" "perfil_usuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "sexo" "sexo_paciente" NOT NULL DEFAULT 'nao_informado',
    "data_nascimento" DATE NOT NULL,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
    "diagnostico" TEXT,
    "medicamentos" TEXT,
    "alergias" TEXT,
    "historico_medico" TEXT,
    "objetivo_tratamento" TEXT,
    "contato_emergencia_nome" TEXT,
    "contato_emergencia_telefone" TEXT,
    "contato_emergencia_parentesco" TEXT,
    "status" "status_paciente" NOT NULL DEFAULT 'em_tratamento',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocolos" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "objetivo" TEXT,
    "tempo_estimado" INTEGER,
    "observacoes" TEXT,
    "categorias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "protocolos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "realizado_em" TIMESTAMP(3) NOT NULL,
    "procedimentos" TEXT,
    "equipamentos" TEXT,
    "escala_dor" INTEGER,
    "observacoes" TEXT,
    "status" "status_sessao" NOT NULL DEFAULT 'registrada',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes_protocolos" (
    "sessao_id" UUID NOT NULL,
    "protocolo_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_protocolos_pkey" PRIMARY KEY ("sessao_id","protocolo_id")
);

-- CreateTable
CREATE TABLE "anamneses" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "data_anamnese" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "queixa_principal" TEXT,
    "historia_doenca_atual" TEXT,
    "historico_familiar" TEXT,
    "historico_social" TEXT,
    "habitos_vida" TEXT,
    "exames_complementares" TEXT,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "anamneses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "tipo" "tipo_avaliacao" NOT NULL,
    "data_avaliacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "queixa_principal" TEXT,
    "exame_fisico" TEXT,
    "diagnostico_fisioterapeutico" TEXT,
    "objetivos" TEXT,
    "observacoes" TEXT,
    "dados_complementares" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_terapeuticos" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "data_plano" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objetivos" TEXT,
    "condutas" TEXT,
    "frequencia_sugerida" TEXT,
    "previsao_sessoes" INTEGER,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "planos_terapeuticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolucoes" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "sessao_id" UUID,
    "data_evolucao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,
    "escala_dor" INTEGER,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "evolucoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "altas" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "data_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "observacoes" TEXT,
    "data_reabertura" TIMESTAMP(3),
    "usuario_reabertura_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "altas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arquivos" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "paciente_id" UUID,
    "sessao_id" UUID,
    "usuario_id" UUID NOT NULL,
    "provider" "storage_provider" NOT NULL DEFAULT 'supabase',
    "bucket" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "tamanho" BIGINT NOT NULL,
    "categoria" "categoria_arquivo" NOT NULL,
    "descricao" TEXT,
    "nome_original" TEXT,
    "data_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "arquivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_eventos" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "tipo" "tipo_evento_timeline" NOT NULL,
    "descricao" TEXT NOT NULL,
    "ocorrido_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessao_id" UUID,
    "arquivo_id" UUID,
    "anamnese_id" UUID,
    "avaliacao_id" UUID,
    "plano_terapeutico_id" UUID,
    "evolucao_id" UUID,
    "alta_id" UUID,
    "metadados" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "usuario_id" UUID,
    "acao" "acao_auditoria" NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" UUID NOT NULL,
    "dados_antes" JSONB,
    "dados_depois" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clinicas_nome_idx" ON "clinicas"("nome");

-- CreateIndex
CREATE INDEX "clinicas_deleted_at_idx" ON "clinicas"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_auth_user_id_key" ON "usuarios"("auth_user_id");

-- CreateIndex
CREATE INDEX "usuarios_clinica_id_idx" ON "usuarios"("clinica_id");

-- CreateIndex
CREATE INDEX "usuarios_clinica_id_email_idx" ON "usuarios"("clinica_id", "email");

-- CreateIndex
CREATE INDEX "usuarios_perfil_idx" ON "usuarios"("perfil");

-- CreateIndex
CREATE INDEX "usuarios_deleted_at_idx" ON "usuarios"("deleted_at");

-- CreateIndex
CREATE INDEX "pacientes_clinica_id_idx" ON "pacientes"("clinica_id");

-- CreateIndex
CREATE INDEX "pacientes_clinica_id_nome_idx" ON "pacientes"("clinica_id", "nome");

-- CreateIndex
CREATE INDEX "pacientes_clinica_id_status_idx" ON "pacientes"("clinica_id", "status");

-- CreateIndex
CREATE INDEX "pacientes_clinica_id_cpf_idx" ON "pacientes"("clinica_id", "cpf");

-- CreateIndex
CREATE INDEX "pacientes_telefone_idx" ON "pacientes"("telefone");

-- CreateIndex
CREATE INDEX "pacientes_whatsapp_idx" ON "pacientes"("whatsapp");

-- CreateIndex
CREATE INDEX "pacientes_deleted_at_idx" ON "pacientes"("deleted_at");

-- CreateIndex
CREATE INDEX "protocolos_clinica_id_idx" ON "protocolos"("clinica_id");

-- CreateIndex
CREATE INDEX "protocolos_clinica_id_nome_idx" ON "protocolos"("clinica_id", "nome");

-- CreateIndex
CREATE INDEX "protocolos_deleted_at_idx" ON "protocolos"("deleted_at");

-- CreateIndex
CREATE INDEX "sessoes_clinica_id_idx" ON "sessoes"("clinica_id");

-- CreateIndex
CREATE INDEX "sessoes_paciente_id_idx" ON "sessoes"("paciente_id");

-- CreateIndex
CREATE INDEX "sessoes_profissional_id_idx" ON "sessoes"("profissional_id");

-- CreateIndex
CREATE INDEX "sessoes_clinica_id_realizado_em_idx" ON "sessoes"("clinica_id", "realizado_em");

-- CreateIndex
CREATE INDEX "sessoes_deleted_at_idx" ON "sessoes"("deleted_at");

-- CreateIndex
CREATE INDEX "sessoes_protocolos_protocolo_id_idx" ON "sessoes_protocolos"("protocolo_id");

-- CreateIndex
CREATE INDEX "anamneses_clinica_id_idx" ON "anamneses"("clinica_id");

-- CreateIndex
CREATE INDEX "anamneses_paciente_id_idx" ON "anamneses"("paciente_id");

-- CreateIndex
CREATE INDEX "anamneses_deleted_at_idx" ON "anamneses"("deleted_at");

-- CreateIndex
CREATE INDEX "avaliacoes_clinica_id_idx" ON "avaliacoes"("clinica_id");

-- CreateIndex
CREATE INDEX "avaliacoes_paciente_id_idx" ON "avaliacoes"("paciente_id");

-- CreateIndex
CREATE INDEX "avaliacoes_tipo_idx" ON "avaliacoes"("tipo");

-- CreateIndex
CREATE INDEX "avaliacoes_deleted_at_idx" ON "avaliacoes"("deleted_at");

-- CreateIndex
CREATE INDEX "planos_terapeuticos_clinica_id_idx" ON "planos_terapeuticos"("clinica_id");

-- CreateIndex
CREATE INDEX "planos_terapeuticos_paciente_id_idx" ON "planos_terapeuticos"("paciente_id");

-- CreateIndex
CREATE INDEX "planos_terapeuticos_deleted_at_idx" ON "planos_terapeuticos"("deleted_at");

-- CreateIndex
CREATE INDEX "evolucoes_clinica_id_idx" ON "evolucoes"("clinica_id");

-- CreateIndex
CREATE INDEX "evolucoes_paciente_id_idx" ON "evolucoes"("paciente_id");

-- CreateIndex
CREATE INDEX "evolucoes_sessao_id_idx" ON "evolucoes"("sessao_id");

-- CreateIndex
CREATE INDEX "evolucoes_deleted_at_idx" ON "evolucoes"("deleted_at");

-- CreateIndex
CREATE INDEX "altas_clinica_id_idx" ON "altas"("clinica_id");

-- CreateIndex
CREATE INDEX "altas_paciente_id_idx" ON "altas"("paciente_id");

-- CreateIndex
CREATE INDEX "altas_data_alta_idx" ON "altas"("data_alta");

-- CreateIndex
CREATE INDEX "arquivos_clinica_id_idx" ON "arquivos"("clinica_id");

-- CreateIndex
CREATE INDEX "arquivos_paciente_id_idx" ON "arquivos"("paciente_id");

-- CreateIndex
CREATE INDEX "arquivos_sessao_id_idx" ON "arquivos"("sessao_id");

-- CreateIndex
CREATE INDEX "arquivos_categoria_idx" ON "arquivos"("categoria");

-- CreateIndex
CREATE INDEX "arquivos_deleted_at_idx" ON "arquivos"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "arquivos_clinica_id_storage_key_key" ON "arquivos"("clinica_id", "storage_key");

-- CreateIndex
CREATE INDEX "timeline_eventos_clinica_id_idx" ON "timeline_eventos"("clinica_id");

-- CreateIndex
CREATE INDEX "timeline_eventos_paciente_id_ocorrido_em_idx" ON "timeline_eventos"("paciente_id", "ocorrido_em");

-- CreateIndex
CREATE INDEX "timeline_eventos_tipo_idx" ON "timeline_eventos"("tipo");

-- CreateIndex
CREATE INDEX "timeline_eventos_usuario_id_idx" ON "timeline_eventos"("usuario_id");

-- CreateIndex
CREATE INDEX "timeline_eventos_ocorrido_em_idx" ON "timeline_eventos"("ocorrido_em");

-- CreateIndex
CREATE INDEX "logs_auditoria_clinica_id_idx" ON "logs_auditoria"("clinica_id");

-- CreateIndex
CREATE INDEX "logs_auditoria_usuario_id_idx" ON "logs_auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "logs_auditoria_entidade_entidade_id_idx" ON "logs_auditoria"("entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "logs_auditoria_created_at_idx" ON "logs_auditoria"("created_at");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocolos" ADD CONSTRAINT "protocolos_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_protocolos" ADD CONSTRAINT "sessoes_protocolos_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_protocolos" ADD CONSTRAINT "sessoes_protocolos_protocolo_id_fkey" FOREIGN KEY ("protocolo_id") REFERENCES "protocolos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_terapeuticos" ADD CONSTRAINT "planos_terapeuticos_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_terapeuticos" ADD CONSTRAINT "planos_terapeuticos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_terapeuticos" ADD CONSTRAINT "planos_terapeuticos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolucoes" ADD CONSTRAINT "evolucoes_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolucoes" ADD CONSTRAINT "evolucoes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolucoes" ADD CONSTRAINT "evolucoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolucoes" ADD CONSTRAINT "evolucoes_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altas" ADD CONSTRAINT "altas_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altas" ADD CONSTRAINT "altas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altas" ADD CONSTRAINT "altas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_arquivo_id_fkey" FOREIGN KEY ("arquivo_id") REFERENCES "arquivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_anamnese_id_fkey" FOREIGN KEY ("anamnese_id") REFERENCES "anamneses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_plano_terapeutico_id_fkey" FOREIGN KEY ("plano_terapeutico_id") REFERENCES "planos_terapeuticos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_evolucao_id_fkey" FOREIGN KEY ("evolucao_id") REFERENCES "evolucoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_eventos" ADD CONSTRAINT "timeline_eventos_alta_id_fkey" FOREIGN KEY ("alta_id") REFERENCES "altas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
