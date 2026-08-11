import { NextResponse } from "next/server";
import { exigirSessao } from "@/lib/auth/sessao";
import { possuiPermissao } from "@/lib/auth/permissoes";
import { ExportacaoService } from "@/services/exportacao/exportacao-service";
import { AppError, mensagemDeErro } from "@/lib/errors/app-error";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Props) {
  try {
    const sessao = await exigirSessao();
    if (!possuiPermissao(sessao.perfil, "exportacao.clinica")) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const { id } = await params;
    const { buffer, fileName } =
      await new ExportacaoService().exportarProntuarioPdf(sessao, id);

    const asciiName = fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E]/g, "_");

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const status =
      error instanceof AppError && error.code === "PACIENTE_NOT_FOUND"
        ? 404
        : 400;
    return NextResponse.json(
      { error: mensagemDeErro(error, "Falha ao gerar PDF.") },
      { status },
    );
  }
}
