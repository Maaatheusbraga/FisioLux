import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

type Props = {
  searchParams: Promise<{ redirect?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Acesso à clínica"
      description="Entre com seu e-mail e senha para continuar."
    >
      <LoginForm
        redirectTo={params.redirect || "/dashboard"}
        resetOk={params.reset === "1"}
      />
    </AuthShell>
  );
}
