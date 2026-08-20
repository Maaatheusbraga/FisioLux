"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { PacienteService } from "@/services/pacientes/paciente-service";
import { pacienteFormSchema } from "@/lib/validations/paciente";
import { mensagemDeErro } from "@/lib/errors/app-error";
import { redirectComAviso } from "@/lib/feedback/aviso";

export type PacienteActionState = {
  ok: boolean;
  message?: string;
};

const service = new PacienteService();

function formToObject(formData: FormData) {
  return {
    nome: formData.get("nome"),
    cpf: formData.get("cpf"),
    rg: formData.get("rg") || undefined,
    sexo: formData.get("sexo") || "nao_informado",
    data_nascimento: formData.get("data_nascimento"),
    telefone: formData.get("telefone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    endereco: formData.get("endereco") || undefined,
    observacoes: formData.get("observacoes") || undefined,
    diagnostico: formData.get("diagnostico") || undefined,
    medicamentos: formData.get("medicamentos") || undefined,
    alergias: formData.get("alergias") || undefined,
    historico_medico: formData.get("historico_medico") || undefined,
    objetivo_tratamento: formData.get("objetivo_tratamento") || undefined,
    contato_emergencia_nome: formData.get("contato_emergencia_nome") || undefined,
    contato_emergencia_telefone:
      formData.get("contato_emergencia_telefone") || undefined,
    contato_emergencia_parentesco:
      formData.get("contato_emergencia_parentesco") || undefined,
    status: formData.get("status") || "em_tratamento",
  };
}

export type PacienteBuscaItem = {
  id: string;
  nome: string;
  cpf: string;
};

/** Busca pacientes por nome/CPF/telefone (LIKE) — para selects que não escalam. */
export async function buscarPacientesAction(
  termo: string,
): Promise<PacienteBuscaItem[]> {
  const q = termo.trim();
  if (q.length < 2) return [];

  const sessao = await exigirSessao();
  const resultado = await service.listar(sessao, {
    busca: q,
    status: "todos",
    page: 1,
    pageSize: 15,
  });

  return resultado.items.map((p) => ({
    id: p.id,
    nome: p.nome,
    cpf: p.cpf,
  }));
}

export async function criarPacienteAction(
  _prev: PacienteActionState,
  formData: FormData,
): Promise<PacienteActionState> {
  const parsed = pacienteFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let destino: string;
  try {
    const sessao = await exigirSessao();
    const paciente = await service.criar(sessao, parsed.data);
    revalidatePath("/pacientes");
    destino = `/pacientes/${paciente.id}`;
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível cadastrar o paciente."),
    };
  }

  return await redirectComAviso(destino, "Paciente cadastrado.");
}

export async function atualizarPacienteAction(
  _prev: PacienteActionState,
  formData: FormData,
): Promise<PacienteActionState> {
  const id = String(formData.get("id") || "");
  if (!id) {
    return { ok: false, message: "Paciente inválido." };
  }

  const parsed = pacienteFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let destino: string;
  try {
    const sessao = await exigirSessao();
    await service.atualizar(sessao, id, parsed.data);
    revalidatePath("/pacientes");
    revalidatePath(`/pacientes/${id}`);
    destino = `/pacientes/${id}`;
  } catch (error) {
    return {
      ok: false,
      message: mensagemDeErro(error, "Não foi possível atualizar o paciente."),
    };
  }

  return await redirectComAviso(destino, "Paciente atualizado.");
}

export async function excluirPacienteAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const sessao = await exigirSessao();
  await service.excluir(sessao, id);
  revalidatePath("/pacientes");
  await redirectComAviso("/pacientes", "Paciente excluído.");
}
