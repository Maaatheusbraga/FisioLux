# Estratégia de autenticação

## Provedor

**Supabase Auth** (projeto Cloud).

## Modelo

- Usuário no Auth (`auth.users`) ↔ registro em `usuarios` (Prisma)
- Cada `usuarios` tem exatamente **um** `clinica_id`
- Perfis: `administrador` | `fisioterapeuta` | `recepcao`

## Bootstrap

- Seed cria **1 clínica** + **1 administrador**
- Clínicas adicionais: seed/script operacional (sem wizard self-service nesta versão)

## Fluxo

1. Login (e-mail/senha) via Supabase Auth
2. Middleware valida sessão e protege rotas `(app)/*`
3. Server Actions / Services resolvem o usuário atual e a `clinica_id`
4. Repositories filtram por essa clínica
5. Logout invalida sessão Supabase
6. Recuperação de senha via fluxo Supabase (e-mail)

## Permissões (matriz v1)

| Ação | Admin | Fisioterapeuta | Recepção |
| --- | --- | --- | --- |
| Gestão de usuários | sim | não | não |
| Configurações da clínica | sim | não | não |
| CRUD pacientes (cadastral) | sim | sim | sim |
| Ver/editar prontuário e sessões | sim | sim | **não** |
| Ver Timeline clínica completa | sim | sim | **não** (apenas dados cadastrais / eventos não clínicos, se exibidos) |
| Upload arquivos clínicos | sim | sim | não* |
| Upload docs cadastrais básicos | sim | sim | sim (ex.: documento administrativo, se permitido na Fase 10) |
| Protocolos | sim | sim | não |
| Exportação PDF clínico | sim | sim | não |

\* Detalhamento fino de categorias de arquivo na Fase 10, respeitando esta matriz.

## Prisma × RLS

- App usa Prisma com connection string de **owner**. Policies RLS **não** se aplicam a esse papel (sem FORCE, de propósito: senão a app para).
- Isolamento **obrigatório** em repositórios (`clinica_id`).
- PostgREST (`anon` / `authenticated`): **REVOKE** nas tabelas públicas. A chave `NEXT_PUBLIC_SUPABASE_ANON_KEY` serve Auth/cookies, não consulta clínica pelo browser.
- Storage: bucket `fisiolux` privado; upload via service role; leitura autenticada só da pasta `{clinica_id}/`.
- Cliente Supabase no app: Auth. Storage assinado no server.

## Rotas

| Grupo | Acesso |
| --- | --- |
| `(auth)/*` | Público (não autenticado) |
| `(app)/*` | Autenticado + perfil autorizado |
| `api/health` | Público (healthcheck Docker) |

Implementação de código: **Fase 3 concluída** — ver `docs/FASE-3.md`.

## Bootstrap do admin

```bash
# cria usuário no Supabase Auth + vincula usuarios.auth_user_id
npm run auth:bootstrap-admin
```

Requer `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (≥ 8) e `SUPABASE_SERVICE_ROLE_KEY`.

## URLs no Supabase Auth

- Site URL: `http://localhost:3000` (dev)
- Redirect: `http://localhost:3000/callback/**`
