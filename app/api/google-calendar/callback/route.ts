import { NextResponse, type NextRequest } from "next/server";
import { verificarEstado } from "@/lib/security/secret-crypto";
import { GoogleCalendarService } from "@/services/agenda/google-calendar-service";
import { AgendaService } from "@/services/agenda/agenda-service";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const base = process.env.APP_URL ?? request.nextUrl.origin;
  const redirectOk = new URL("/configuracoes", base);
  redirectOk.searchParams.set("google", "conectado");

  const redirectErro = new URL("/configuracoes", base);

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const erroGoogle = searchParams.get("error");

  if (erroGoogle) {
    redirectErro.searchParams.set(
      "google",
      encodeURIComponent(`Google recusou: ${erroGoogle}`),
    );
    return NextResponse.redirect(redirectErro);
  }

  if (!code || !state) {
    redirectErro.searchParams.set(
      "google",
      encodeURIComponent("Resposta OAuth incompleta."),
    );
    return NextResponse.redirect(redirectErro);
  }

  const dados = verificarEstado(state);
  const clinicaId = dados?.clinicaId;
  if (!clinicaId) {
    redirectErro.searchParams.set(
      "google",
      encodeURIComponent("State OAuth inválido ou expirado."),
    );
    return NextResponse.redirect(redirectErro);
  }

  try {
    const google = new GoogleCalendarService();
    const tokens = await google.trocarCodigoPorTokens(clinicaId, code);
    await google.salvarConexao(clinicaId, tokens);

    const clinicaDb = await prisma.clinica.findUnique({ where: { id: clinicaId } });
    if (clinicaDb) {
      try {
        await google.registrarWatch(clinicaDb);
      } catch {
        redirectOk.searchParams.set(
          "google",
          "conectado-sem-webhook",
        );
      }
      try {
        await new AgendaService().sincronizarClinica(clinicaId);
      } catch {
        // sync inicial opcional
      }
    }

    return NextResponse.redirect(redirectOk);
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Erro ao conectar Google Calendar.";
    redirectErro.searchParams.set("google", encodeURIComponent(msg));
    return NextResponse.redirect(redirectErro);
  }
}
