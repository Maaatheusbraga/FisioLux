import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarAnamnesePage({ params }: Props) {
  const { id } = await params;
  redirect(`/pacientes/${id}/prontuario/avaliacao/nova`);
}
