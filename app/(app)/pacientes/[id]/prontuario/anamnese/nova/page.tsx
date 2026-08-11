import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

/** Anamnese genérica foi fundida na Avaliação — redireciona o fluxo antigo. */
export default async function NovaAnamnesePage({ params }: Props) {
  const { id } = await params;
  redirect(`/pacientes/${id}/prontuario/avaliacao/nova`);
}
