import { redirect } from "next/navigation";
import { obterSessaoAtual } from "@/lib/auth/sessao";

export default async function HomePage() {
  const sessao = await obterSessaoAtual();
  redirect(sessao ? "/dashboard" : "/login");
}
