-- Alta ganha deleted_at (soft delete), alinhando com o restante do domínio clínico.
-- Coluna aditiva e nullable: nenhuma linha existente precisa de backfill.

ALTER TABLE "altas" ADD COLUMN "deleted_at" TIMESTAMP(3);

CREATE INDEX "altas_deleted_at_idx" ON "altas"("deleted_at");
