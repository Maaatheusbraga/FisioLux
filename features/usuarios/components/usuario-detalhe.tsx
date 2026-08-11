"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { HelpTip } from "@/components/ui/help-tip";
import { excluirUsuarioAction } from "@/features/usuarios/actions";
import { formatarTelefoneExibicao } from "@/utils/cpf";

type Props = {
  usuario: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    perfil: string;
    ativo: boolean;
  };
  ehEu: boolean;
  recemCriado?: boolean;
};

const LABELS: Record<string, string> = {
  administrador: "Administrador",
  fisioterapeuta: "Fisioterapeuta",
  recepcao: "Recepção",
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-sm text-ink-subtle">{label}</dt>
      <dd className="text-sm text-ink sm:text-right">{value?.trim() || "—"}</dd>
    </div>
  );
}

export function UsuarioDetalhe({
  usuario,
  ehEu,
  recemCriado = false,
}: Props) {
  return (
    <div className="space-y-6">
      {recemCriado ? (
        <div
          className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-ink"
          role="status"
        >
          <p className="font-medium">Usuário criado</p>
          <p className="mt-1 text-ink-muted">
            Passe o e-mail e a senha inicial para a pessoa. Ela entra em{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              /login
            </Link>{" "}
            com esses dados. Se esquecer a senha, usa{" "}
            <strong className="text-ink">Recuperar senha</strong> na tela de
            login.
          </p>
          <p className="mt-2 break-all rounded-lg bg-surface px-3 py-2 font-mono text-xs">
            {usuario.email}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={
            usuario.ativo
              ? "border-primary/30 text-primary"
              : "border-danger/30 text-danger"
          }
        >
          {usuario.ativo ? "Ativo" : "Inativo"}
        </Badge>
        <Badge className="border-border text-ink-muted">
          {LABELS[usuario.perfil] ?? usuario.perfil}
        </Badge>
        {ehEu ? (
          <Badge className="border-accent/30 text-accent">Você</Badge>
        ) : null}
        <HelpTip label="Como o usuário entra">
          Login com o e-mail abaixo e a senha definida na criação (ou
          redefinida em Recuperar senha). Não há convite automático por e-mail.
        </HelpTip>
      </div>

      <section className="rounded-xl border border-border bg-surface-raised p-5">
        <dl>
          <Row label="Nome" value={usuario.nome} />
          <Row label="E-mail (login)" value={usuario.email} />
          <Row
            label="Telefone"
            value={formatarTelefoneExibicao(usuario.telefone)}
          />
        </dl>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Link href={`/usuarios/${usuario.id}/editar`}>
          <Button type="button">Editar</Button>
        </Link>
        <Link href="/usuarios">
          <Button type="button" variant="secondary">
            Voltar
          </Button>
        </Link>
        {!ehEu ? (
          <ConfirmForm
            action={excluirUsuarioAction}
            className="sm:ml-auto"
            title="Excluir usuário"
            message={`Excluir logicamente ${usuario.nome}? O acesso será bloqueado.`}
            confirmLabel="Excluir"
          >
            <input type="hidden" name="id" value={usuario.id} />
            <Button type="submit" variant="danger">
              Excluir
            </Button>
          </ConfirmForm>
        ) : null}
      </div>
    </div>
  );
}
