# Deploy Docker / VPS — FisioLux

## Arquitetura

| Onde | O quê |
| --- | --- |
| **VPS (Docker)** | App Next.js |
| **Supabase Cloud** | Postgres, Auth, Storage |

Não sobe banco na VPS.

## Pré-requisitos na VPS

- Linux (Ubuntu 22.04+ recomendado)
- Docker Engine + Docker Compose plugin
- Porta **3000** aberta (ou 80/443 com reverse proxy)
- Arquivo `.env` de produção (nunca no Git)

### Instalar Docker (Ubuntu, uma vez)

```bash
sudo apt update
sudo apt install -y ca-certificates curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# saia e entre de novo no SSH para o grupo docker valer
```

## Deploy (passo a passo)

No seu PC (ou na VPS):

```bash
git clone https://github.com/Maaatheusbraga/FisioLux.git
cd FisioLux
cp .env.example .env
nano .env   # preencher URLs/keys do Supabase + APP_URL da VPS
```

**Importante no `.env` de produção:**

- `NODE_ENV=production`
- `APP_URL=https://seu-dominio-ou-ip:3000` (URL real que o usuário abre)
- `DATABASE_URL` / `DIRECT_URL` do pooler Supabase
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STORAGE_BUCKET=fisiolux`

Subir:

```bash
docker compose build
docker compose up -d
docker compose logs -f app
```

Testar health:

```bash
curl http://127.0.0.1:3000/api/health
```

Abrir no navegador: `http://IP_DA_VPS:3000/login`

No primeiro ambiente: criar admin (localmente com `.env` apontando pro mesmo Supabase, ou dentro do container):

```bash
docker compose exec app npx tsx scripts/bootstrap-admin.ts
```

> Se `tsx` não estiver na imagem de produção, rode `npm run auth:bootstrap-admin` na sua máquina com o `.env` de produção (só a primeira vez).

## `NEXT_PUBLIC_*` (importante)

Variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` entram no **bundle na hora do `docker compose build`**. Trocar o `.env` e só dar `up -d` **não** atualiza o login. Depois de mudar URL/anon key: `docker compose build && docker compose up -d`.

A anon key no browser é esperada (Auth). Dados clínicos **não** passam por ela: a app usa Prisma no servidor.

## Atualizar depois de um push no GitHub

```bash
cd FisioLux
git pull
docker compose build
docker compose up -d
```

O `entrypoint` roda `prisma migrate deploy` antes de iniciar a app.

## Domínio + HTTPS (recomendado)

Com Nginx + Certbot na VPS, proxy para `127.0.0.1:3000`. Exemplo de site:

```nginx
server {
  listen 80;
  server_name fisio.seudominio.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 55m;
  }
}
```

Depois: `sudo certbot --nginx -d fisio.seudominio.com` e ajuste `APP_URL` para `https://fisio.seudominio.com`.

## Comandos úteis

```bash
docker compose ps
docker compose logs -f app
docker compose restart app
docker compose down
```

## Troubleshooting

| Sintoma | Checar |
| --- | --- |
| Build falha em `NEXT_PUBLIC_*` | `.env` na pasta do compose com URL/anon key |
| App sobe mas login falha | `APP_URL` e redirect URLs no Supabase Auth |
| Migration falha | `DATABASE_URL` / `DIRECT_URL` e senha (`@` → `%40`) |
| Upload falha | bucket `fisiolux` + `SUPABASE_SERVICE_ROLE_KEY` |
| Healthcheck unhealthy | `docker compose logs app` |

## O que é viável agora

1. **Sim:** Docker Compose na VPS com este repo (caminho oficial).
2. **Sim:** Supabase continua na nuvem (sem Postgres na VPS).
3. **Depois:** Nginx + HTTPS + domínio.
4. **Não necessário agora:** Kubernetes, CI complexo.
