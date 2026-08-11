import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
};

const LABELS: Record<string, string> = {
  administrador: "Administrador",
  fisioterapeuta: "Fisioterapeuta",
  recepcao: "Recepção",
};

type Props = { usuarios: Item[] };

export function UsuariosTabela({ usuarios }: Props) {
  if (usuarios.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center text-sm text-ink-muted">
        Nenhum usuário cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">
              E-mail
            </th>
            <th className="px-4 py-3 font-medium">Perfil</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr
              key={u.id}
              className="border-b border-border last:border-0 hover:bg-surface/60"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/usuarios/${u.id}`}
                  className="font-medium text-ink hover:text-primary"
                >
                  {u.nome}
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-ink-muted md:table-cell">
                {u.email}
              </td>
              <td className="px-4 py-3 text-ink-muted">
                {LABELS[u.perfil] ?? u.perfil}
              </td>
              <td className="px-4 py-3">
                <Badge
                  className={
                    u.ativo
                      ? "border-primary/30 text-primary"
                      : "border-danger/30 text-danger"
                  }
                >
                  {u.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
