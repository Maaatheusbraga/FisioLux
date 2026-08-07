import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { obterSessaoAtual } from "@/lib/auth/sessao";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await obterSessaoAtual();
  if (!sessao) {
    redirect("/login");
  }

  return (
    <AppShell
      nome={sessao.nome}
      email={sessao.email}
      perfil={sessao.perfil}
    >
      {children}
    </AppShell>
  );
}
