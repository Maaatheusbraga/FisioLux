import type { Permissao } from "@/lib/auth/permissoes";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  ClipboardList,
  FileText,
  FolderOpen,
  UserCog,
  Settings,
  Search,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Se definido, item só aparece com a permissão */
  permissao?: Permissao;
  /** false = placeholder de fase futura (rota existe, conteúdo “em breve”) */
  disponivel: boolean;
  fase?: number;
};

export const navegacaoPrincipal: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    disponivel: true,
  },
  {
    title: "Pacientes",
    href: "/pacientes",
    icon: Users,
    permissao: "pacientes.gerenciar",
    disponivel: true,
    fase: 5,
  },
  {
    title: "Sessões",
    href: "/sessoes",
    icon: CalendarClock,
    permissao: "sessoes.gerenciar",
    disponivel: true,
    fase: 7,
  },
  {
    title: "Protocolos",
    href: "/protocolos",
    icon: ClipboardList,
    permissao: "protocolos.gerenciar",
    disponivel: true,
    fase: 8,
  },
  {
    title: "Prontuário",
    href: "/prontuario",
    icon: FileText,
    permissao: "prontuario.acessar",
    disponivel: true,
    fase: 9,
  },
  {
    title: "Arquivos",
    href: "/arquivos",
    icon: FolderOpen,
    permissao: "arquivos.cadastrais",
    disponivel: false,
    fase: 10,
  },
  {
    title: "Usuários",
    href: "/usuarios",
    icon: UserCog,
    permissao: "usuarios.gerenciar",
    disponivel: false,
    fase: 3,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    permissao: "clinica.configurar",
    disponivel: false,
    fase: 4,
  },
  {
    title: "Busca",
    href: "/busca",
    icon: Search,
    disponivel: false,
    fase: 5,
  },
];
