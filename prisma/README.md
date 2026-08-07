# Prisma — FisioLux

## Arquivos

| Arquivo | Função |
| --- | --- |
| `schema.prisma` | Modelos, enums, relações |
| `seed.ts` | Clínica demo + admin |
| `migrations/` | SQL versionado |

## Comandos

```bash
npm run db:generate      # gera Prisma Client
npm run db:migrate       # aplica migrations (deploy)
npm run db:migrate:dev   # migrate em desenvolvimento
npm run db:seed          # seed inicial
npm run db:studio        # UI do Prisma
npm run db:validate      # valida schema
```

Documentação completa: [docs/DATABASE.md](../docs/DATABASE.md).
