#!/usr/bin/env bash
# Restaura dump custom (.dump.gz) gerado por backup-fisiolux.sh
#
# ATENÇÃO: sobrescreve dados do schema public. Use só em ambiente de teste
# ou com clínica ciente do risco.
#
# Uso:
#   ./restore-fisiolux.sh /opt/backups/fisiolux/2026-08-19_0330/fisiolux.dump.gz

set -euo pipefail

DUMP_GZ="${1:-}"
APP_DIR="${FISIOLUX_APP_DIR:-/opt/FisioLux}"
ENV_FILE="${FISIOLUX_ENV_FILE:-$APP_DIR/.env}"

if [[ -z "$DUMP_GZ" || ! -f "$DUMP_GZ" ]]; then
  echo "Uso: $0 /caminho/fisiolux.dump.gz" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

URL="${DIRECT_URL:-${DATABASE_URL:-}}"
if [[ -z "$URL" ]]; then
  echo "DIRECT_URL não definido" >&2
  exit 1
fi

if ! command -v pg_restore >/dev/null 2>&1; then
  echo "pg_restore não instalado" >&2
  exit 1
fi

TMP="$(mktemp)"
gunzip -c "$DUMP_GZ" > "$TMP"
trap 'rm -f "$TMP"' EXIT

echo "Restaurando $DUMP_GZ …"
pg_restore --dbname="$URL" --clean --if-exists --no-owner --no-acl "$TMP"
echo "Restore concluído."
