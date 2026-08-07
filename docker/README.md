# FisioLux — notas de deploy VPS
#
# 1. Instalar Docker Engine + Compose plugin na VPS
# 2. Clonar/copiar o projeto
# 3. cp .env.example .env e preencher Supabase
# 4. docker compose up -d --build
# 5. Rodar migrations Prisma no release (comando a documentar na Fase 2)
#
# Banco/Auth/Storage NÃO sobem neste compose — ficam no Supabase Cloud.
