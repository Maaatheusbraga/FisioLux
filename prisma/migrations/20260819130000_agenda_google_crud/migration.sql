-- Google Calendar OAuth + eventos locais vinculados a pacientes

ALTER TABLE "clinicas"
  ADD COLUMN IF NOT EXISTS "agenda_google_calendar_id" TEXT DEFAULT 'primary',
  ADD COLUMN IF NOT EXISTS "agenda_google_access_token" TEXT,
  ADD COLUMN IF NOT EXISTS "agenda_google_refresh_token" TEXT,
  ADD COLUMN IF NOT EXISTS "agenda_google_token_expira_em" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "agenda_google_sync_token" TEXT,
  ADD COLUMN IF NOT EXISTS "agenda_google_watch_channel_id" TEXT,
  ADD COLUMN IF NOT EXISTS "agenda_google_watch_resource_id" TEXT,
  ADD COLUMN IF NOT EXISTS "agenda_google_watch_expira_em" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "agenda_eventos" (
  "id" UUID NOT NULL,
  "clinica_id" UUID NOT NULL,
  "paciente_id" UUID,
  "usuario_id" UUID,
  "google_event_id" TEXT NOT NULL,
  "google_calendar_id" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "descricao" TEXT,
  "inicio" TIMESTAMP(3) NOT NULL,
  "fim" TIMESTAMP(3) NOT NULL,
  "google_updated_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),

  CONSTRAINT "agenda_eventos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "agenda_eventos_clinica_id_google_event_id_key"
  ON "agenda_eventos"("clinica_id", "google_event_id");

CREATE INDEX IF NOT EXISTS "agenda_eventos_clinica_id_inicio_idx"
  ON "agenda_eventos"("clinica_id", "inicio");

CREATE INDEX IF NOT EXISTS "agenda_eventos_clinica_id_paciente_id_idx"
  ON "agenda_eventos"("clinica_id", "paciente_id");

CREATE INDEX IF NOT EXISTS "agenda_eventos_deleted_at_idx"
  ON "agenda_eventos"("deleted_at");

ALTER TABLE "agenda_eventos"
  ADD CONSTRAINT "agenda_eventos_clinica_id_fkey"
  FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "agenda_eventos"
  ADD CONSTRAINT "agenda_eventos_paciente_id_fkey"
  FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "agenda_eventos"
  ADD CONSTRAINT "agenda_eventos_usuario_id_fkey"
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
