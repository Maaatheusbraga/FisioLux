import { NextResponse } from "next/server";
import { exigirSessao } from "@/lib/auth/sessao";
import { assertPermissao } from "@/lib/auth/permissoes";
import { assinarEstado } from "@/lib/security/secret-crypto";
import { GoogleCalendarService } from "@/services/agenda/google-calendar-service";
import { mensagemDeErro } from "@/lib/errors/app-error";

export async function GET() {
  try {
    const sessao = await exigirSessao();
    assertPermissao(sessao.perfil, "clinica.configurar");

    const state = assinarEstado({
      clinicaId: sessao.clinicaId,
      ts: String(Date.now()),
    });

    const google = new GoogleCalendarService();
    const url = await google.urlAutorizacao(sessao.clinicaId, state);

    return NextResponse.redirect(url);
  } catch (error) {
    const url = new URL("/configuracoes", process.env.APP_URL ?? "http://localhost:3000");
    url.searchParams.set(
      "google",
      encodeURIComponent(mensagemDeErro(error, "Erro ao conectar Google Calendar.")),
    );
    return NextResponse.redirect(url);
  }
}
