# Fase 4 concluída — Layout / Design System

## O que foi desenvolvido

- `PRODUCT.md` + `DESIGN.md` (direção visual)
- Tokens OKLCH (dark padrão + light)
- Tipografia **Plus Jakarta Sans**
- Toggle de tema (persistido em `localStorage`)
- Shell autenticado: **Sidebar**, **Header**, **Breadcrumb**, drawer mobile
- Componentes UI base: Button, Input, Label, Badge, Separator
- Navegação por perfil (itens sem permissão ocultos)
- Placeholders “em breve” para módulos futuros
- Auth restilizado no mesmo design system
- **Sem** funcionalidade de negócio nova

## Arquivos principais

- `PRODUCT.md`, `DESIGN.md`
- `app/globals.css`, `tailwind.config.js`
- `components/ui/*`
- `components/layout/*`
- `components/providers/theme-provider.tsx`
- `config/navigation.ts`
- `app/(app)/layout.tsx` + páginas placeholder

## Como validar

1. `npm run dev`
2. Login → dashboard com sidebar
3. Alternar dark/light no header
4. Redimensionar para mobile → menu hamburger
5. Clicar em “Pacientes” → placeholder Fase 5

## Checklist

- [x] Sidebar / Header / Menu / Breadcrumb
- [x] Dark Mode (+ light)
- [x] Responsividade
- [x] Layout principal
- [x] Sistema de componentes / design tokens
- [x] Sem módulos de negócio
