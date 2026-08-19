import type { PerfilUsuario } from "@/types/dominio";
import { AppError } from "@/lib/errors/app-error";

export type Permissao =
  | "usuarios.gerenciar"
  | "clinica.configurar"
  | "pacientes.gerenciar"
  | "pacientes.excluir"
  | "prontuario.acessar"
  | "timeline.clinica"
  | "sessoes.gerenciar"
  | "protocolos.gerenciar"
  | "arquivos.clinicos"
  | "arquivos.cadastrais"
  | "exportacao.clinica";

const permissoesPorPerfil: Record<PerfilUsuario, readonly Permissao[]> = {
  administrador: [
    "usuarios.gerenciar",
    "clinica.configurar",
    "pacientes.gerenciar",
    "pacientes.excluir",
    "prontuario.acessar",
    "timeline.clinica",
    "sessoes.gerenciar",
    "protocolos.gerenciar",
    "arquivos.clinicos",
    "arquivos.cadastrais",
    "exportacao.clinica",
  ],
  fisioterapeuta: [
    "pacientes.gerenciar",
    "prontuario.acessar",
    "timeline.clinica",
    "sessoes.gerenciar",
    "protocolos.gerenciar",
    "arquivos.clinicos",
    "arquivos.cadastrais",
    "exportacao.clinica",
  ],
  recepcao: ["pacientes.gerenciar", "arquivos.cadastrais"],
};

export function permissoesDoPerfil(perfil: PerfilUsuario): readonly Permissao[] {
  return permissoesPorPerfil[perfil];
}

export function possuiPermissao(
  perfil: PerfilUsuario,
  permissao: Permissao,
): boolean {
  return permissoesPorPerfil[perfil].includes(permissao);
}

export function assertPermissao(
  perfil: PerfilUsuario,
  permissao: Permissao,
): void {
  if (!possuiPermissao(perfil, permissao)) {
    throw new AppError(`Permissão negada: ${permissao}`, "FORBIDDEN");
  }
}

export function ehPerfilClinico(perfil: PerfilUsuario): boolean {
  return perfil === "administrador" || perfil === "fisioterapeuta";
}
