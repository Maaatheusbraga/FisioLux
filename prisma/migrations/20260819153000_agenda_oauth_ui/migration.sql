-- Credenciais OAuth Google Calendar por clínica (UI Configurações)

ALTER TABLE "clinicas"
  ADD COLUMN IF NOT EXISTS "agenda_google_oauth_client_id" TEXT,
  ADD COLUMN IF NOT EXISTS "agenda_google_oauth_client_secret" TEXT;
