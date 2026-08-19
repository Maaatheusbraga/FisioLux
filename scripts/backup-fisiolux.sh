#!/usr/bin/env bash
# Backup do banco FisioLux (Supabase Postgres) via pg_dump.
#
# Uso na VPS:
#   chmod +x /opt/FisioLux/scripts/backup-fisiolux.sh
#   /opt/FisioLux/scripts/backup-fisiolux.sh
#
# Requer: postgresql-client (pg_dump) instalado no host.
# Usa DIRECT_URL do .env (porta 5432 — não use o pooler 6543).

set -euo pipefail

APP_DIR="${FISIOLUX_APP_DIR:-/opt/FisioLux}"
ENV_FILE="${FISIOLUX_ENV_FILE:-$APP_DIR/.env}"
BACKUP_ROOT="${FISIOLUX_BACKUP_DIR:-/opt/backups/fisiolux}"
KEEP="${FISIOLUX_BACKUP_KEEP:-6}"
STAMP="$(date +%Y-%m-%d_%H%M)"
DEST="$BACKUP_ROOT/$STAMP"
LOG="$BACKUP_ROOT/backup.log"

log() {
  echo "[$(date -Iseconds)] $*" | tee -a "$LOG"
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo .env não encontrado: $ENV_FILE" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

URL="${DIRECT_URL:-${DATABASE_URL:-}}"
if [[ -z "$URL" ]]; then
  log "ERRO: DIRECT_URL ou DATABASE_URL não definido em $ENV_FILE"
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  log "ERRO: pg_dump não instalado. Ex.: apt install postgresql-client"
  exit 1
fi

mkdir -p "$DEST"
log "Iniciando backup → $DEST"

pg_dump "$URL" \
  --no-owner \
  --no-acl \
  --format=custom \
  --file="$DEST/fisiolux.dump"

gzip -9 -c "$DEST/fisiolux.dump" > "$DEST/fisiolux.dump.gz"
rm -f "$DEST/fisiolux.dump"

# Metadados úteis para restore
{
  echo "timestamp=$STAMP"
  echo "app=FisioLux"
  echo "host=$(hostname)"
} > "$DEST/meta.txt"

log "Backup concluído: $DEST/fisiolux.dump.gz ($(du -h "$DEST/fisiolux.dump.gz" | cut -f1))"

# Retenção: mantém os N backups mais recentes (pastas datadas)
mapfile -t OLD < <(ls -1dt "$BACKUP_ROOT"/[0-9][0-9][0-9][0-9]-* 2>/dev/null || true)
if ((${#OLD[@]} > KEEP)); then
  for dir in "${OLD[@]:KEEP}"; do
    log "Removendo backup antigo: $dir"
    rm -rf "$dir"
  done
fi

log "Retenção: mantidos até $KEEP backups em $BACKUP_ROOT"
