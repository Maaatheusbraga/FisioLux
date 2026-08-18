import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { obterSessaoAtual } from "@/lib/auth/sessao";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await obterSessaoAtual();
  if (!sessao) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
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
