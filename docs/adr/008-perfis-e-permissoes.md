# ADR 008 — Matriz de perfis

## Status

Aceito

## Decisão

- **Administrador**: gestão + clínico (superconjunto)
- **Fisioterapeuta**: todo clínico da própria clínica (todos os pacientes)
- **Recepção**: cadastro/dados cadastrais; sem prontuário clínico completo

## Consequências

- Checagens de permissão nos Services (Fase 3+)
- UI esconde ações; servidor é a fonte da verdade
