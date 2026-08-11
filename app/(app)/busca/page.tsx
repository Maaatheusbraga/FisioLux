import { redirect } from "next/navigation";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Busca saiu do menu — redireciona para Pacientes (campo do header / filtros). */
export default async function BuscaPage({ searchParams }: Props) {
  const sessao = await exigirSessao();
  if (!possuiPermissao(sessao.perfil, "pacientes.gerenciar")) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const q = typeof raw.q === "string" ? raw.q.trim() : "";
  if (q) {
    redirect(`/pacientes?q=${encodeURIComponent(q)}`);
  }
  redirect("/pacientes");
}
