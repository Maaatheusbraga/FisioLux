import { assertPermissao } from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { DashboardRepository } from "@/repositories/dashboard/dashboard-repository";

export class DashboardService {
  constructor(private readonly dashboard = new DashboardRepository()) {}

  async obterResumo(sessao: SessaoUsuario) {
    // Qualquer usuário autenticado da clínica vê o dashboard;
    // números clínicos ficam naturalmente vazios/irrelevantes para recepção
    // mas a página é o ponto de entrada.
    assertPermissao(sessao.perfil, "pacientes.gerenciar");
    return this.dashboard.obterResumo(sessao.clinicaId);
  }
}
