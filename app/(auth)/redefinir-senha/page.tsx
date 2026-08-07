import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RedefinirSenhaForm } from "@/features/auth/components/redefinir-senha-form";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

export default function RedefinirSenhaPage() {
  return (
    <AuthShell
      title="Nova senha"
      description="Defina uma nova senha para a sua conta."
    >
      <RedefinirSenhaForm />
    </AuthShell>
  );
}
