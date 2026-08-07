# Fase 3 concluída — Autenticação

## O que foi desenvolvido

- Scaffold **Next.js 15** + React 19 + Tailwind
- Clients Supabase (browser, server, admin, middleware)
- `AuthService` + `UsuarioRepository`
- Login, logout, recuperação e redefinição de senha
- Middleware de sessão + proteção de rotas
- Matriz de permissões por perfil
- Dashboard mínimo autenticado (sem módulos de negócio)
- Script `auth:bootstrap-admin` (cria Auth + vincula `usuarios`)

## Arquivos principais

- `middleware.ts`
- `lib/supabase/*`
- `lib/auth/sessao.ts`, `lib/auth/permissoes.ts`
- `services/auth/auth-service.ts`
- `repositories/usuarios/usuario-repository.ts`
- `features/auth/*`
- `app/(auth)/login`, `recuperar-senha`, `redefinir-senha`, `callback`
- `app/(app)/dashboard`
- `scripts/bootstrap-admin.ts`

## Como testar

1. No Supabase → **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/callback/**`
2. No `.env`, confirme `APP_URL=http://localhost:3000` e `SEED_ADMIN_PASSWORD`
3. Vincule o admin:
   ```bash
   npm run auth:bootstrap-admin
   ```
4. Suba o app:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000/login` com o e-mail/senha do seed

## Decisões

- Sessão via cookies (`@supabase/ssr`) + `getUser()` no middleware
- Login exige vínculo `usuarios.auth_user_id` ativo
- Recepção sem permissões clínicas (matriz pronta para fases seguintes)
- UI de auth funcional; Design System completo na **Fase 4**

## Checklist

- [x] Login / Logout
- [x] Recuperação de senha
- [x] Middleware e proteção de rotas
- [x] Sessão + perfil
- [x] Permissões (admin / fisioterapeuta / recepção)
- [x] Sem módulos de negócio
