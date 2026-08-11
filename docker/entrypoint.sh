#!/bin/sh
set -e

echo "[FisioLux] Aplicando migrations (prisma migrate deploy)…"
node ./node_modules/prisma/build/index.js migrate deploy

echo "[FisioLux] Iniciando Next.js…"
exec node server.js
