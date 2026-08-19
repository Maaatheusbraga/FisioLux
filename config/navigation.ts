import type { Permissao } from "@/lib/auth/permissoes";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FolderOpen,
  UserCog,
  Settings,
} from "lucide-react";

export type NavGrupo = "clinico" | "admin";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Se definido, item só aparece com a permissão */
  permissao?: Permissao;
  /** false = placeholder de fase futura (rota existe, conteúdo “em breve”) */
  disponivel: boolean;
  fase?: number;
  grupo: NavGrupo;
  /** Texto curto no hover / aria (opcional) */
  dica?: string;
};

export const labelsGrupoNav: Record<NavGrupo, string> = {
  clinico: "Dia a dia",
  admin: "Clínica",
};

/**
 * Menu enxuto — Busca e Prontuário global ficam fora (busca no header;
 * prontuário só na ficha do paciente). Rotas /busca e /prontuario seguem válidas.
 */
export const navegacaoPrincipal: NavItem[] = [
  {
    title: "Início",
    href: "/dashboard",
    icon: LayoutDashboard,
    disponivel: true,
    grupo: "clinico",
  },
  {
    title: "Pacientes",
    href: "/pacientes",
    icon: Users,
    permissao: "pacientes.gerenciar",
    disponivel: true,
    fase: 5,
    grupo: "clinico",
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: CalendarDays,
    disponivel: true,
    grupo: "clinico",
    dica: "Agenda da clínica via Google Calendar",
  },
  {
    title: "Documentos",
    href: "/arquivos",
    icon: FolderOpen,
    permissao: "arquivos.cadastrais",
    disponivel: true,
    fase: 10,
    grupo: "clinico",
    dica: "Consulta de laudos e anexos (upload na ficha do paciente)",
  },
  {
    title: "Usuários",
    href: "/usuarios",
    icon: UserCog,
    permissao: "usuarios.gerenciar",
    disponivel: true,
    fase: 3,
    grupo: "admin",
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    permissao: "clinica.configurar",
    disponivel: true,
    fase: 4,
    grupo: "admin",
  },
];
