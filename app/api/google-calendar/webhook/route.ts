import { NextResponse, after, type NextRequest } from "next/server";
import { AgendaService } from "@/services/agenda/agenda-service";
import { verificarEstado } from "@/lib/security/secret-crypto";

export async function POST(request: NextRequest) {
  const channelToken = request.headers.get("x-goog-channel-token") ?? "";
  const resourceState =
    request.headers.get("x-goog-resource-state") ?? "exists";

  const dados = channelToken ? verificarEstado(channelToken) : null;
  const clinicaId = dados?.clinicaId;

  if (clinicaId) {
    // Sync pode levar tempo (muitos eventos) — não bloquear a resposta ao Google.
    after(async () => {
      try {
        const agenda = new AgendaService();
        await agenda.processarWebhook(clinicaId, resourceState);
      } catch {
        // Google espera 2xx mesmo se o sync falhar momentaneamente
      }
    });
  }

  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "google-calendar-webhook" });
}
