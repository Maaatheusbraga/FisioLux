# FisioLux — notas de deploy VPS
#
# 1. Instalar Docker Engine + Compose plugin na VPS
# 2. Clonar/copiar o projeto
# 3. cp .env.example .env e preencher Supabase
# 4. docker compose up -d --build
# 5. Rodar migrations Prisma no release (comando a documentar na Fase 2)
#
# Banco/Auth/Storage NÃO sobem neste compose — ficam no Supabase Cloud.

## Backup automático (a cada 20 dias)

Na VPS (host, fora do container):

```bash
apt update && apt install -y postgresql-client   # Debian/Ubuntu
mkdir -p /opt/backups/fisiolux
chmod +x /opt/FisioLux/scripts/backup-fisiolux.sh
chmod +x /opt/FisioLux/scripts/backup-if-due.sh

# Teste manual
/opt/FisioLux/scripts/backup-fisiolux.sh
```

Cron (verifica todo dia às 03:30; só executa se passaram 20+ dias):

```bash
crontab -e
# adicionar:
30 3 * * * /opt/FisioLux/scripts/backup-if-due.sh >> /opt/backups/fisiolux/cron.log 2>&1
```

- Dump: `pg_dump` via `DIRECT_URL` do `.env`
- Saída: `/opt/backups/fisiolux/AAAA-MM-DD_HHMM/fisiolux.dump.gz`
- Retenção: últimos 6 backups (~120 dias)
- Fotos/arquivos: permanecem no Supabase Storage (backup de mídia = fase futura)
