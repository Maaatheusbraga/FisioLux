import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RecuperarSenhaForm } from "@/features/auth/components/recuperar-senha-form";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default function RecuperarSenhaPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      description="Enviaremos um link de redefinição para o seu e-mail."
    >
      <RecuperarSenhaForm />
    </AuthShell>
  );
}
