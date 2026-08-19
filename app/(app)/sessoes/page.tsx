import { redirect } from "next/navigation";

/** Atendimentos (sessões) saíram da UI — rotas antigas redirecionam. */
export default function SessoesPage() {
  redirect("/dashboard");
}
