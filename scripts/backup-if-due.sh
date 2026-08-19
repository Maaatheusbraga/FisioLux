#!/usr/bin/env bash
# Executa backup-fisiolux.sh apenas se passaram >= N dias desde o último.
#
# Agende no cron diário; o script decide se roda (padrão: a cada 20 dias).
#
#   30 3 * * * /opt/FisioLux/scripts/backup-if-due.sh >> /opt/backups/fisiolux/cron.log 2>&1

set -euo pipefail

INTERVAL_DAYS="${FISIOLUX_BACKUP_INTERVAL_DAYS:-20}"
APP_DIR="${FISIOLUX_APP_DIR:-/opt/FisioLux}"
BACKUP_ROOT="${FISIOLUX_BACKUP_DIR:-/opt/backups/fisiolux}"
MARKER="$BACKUP_ROOT/.last-backup-ts"
SCRIPT="$APP_DIR/scripts/backup-fisiolux.sh"

now() { date +%s; }

if [[ ! -x "$SCRIPT" ]]; then
  echo "[$(date -Iseconds)] ERRO: script não executável: $SCRIPT" >&2
  exit 1
fi

mkdir -p "$BACKUP_ROOT"

if [[ -f "$MARKER" ]]; then
  last="$(cat "$MARKER")"
  elapsed=$(( ($(now) - last) / 86400 ))
  if (( elapsed < INTERVAL_DAYS )); then
    echo "[$(date -Iseconds)] Backup ignorado (${elapsed}d < ${INTERVAL_DAYS}d)"
    exit 0
  fi
fi

"$SCRIPT"
echo "$(now)" > "$MARKER"
