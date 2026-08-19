import { NextResponse, type NextRequest } from "next/server";
import { AgendaService } from "@/services/agenda/agenda-service";

export async function POST(request: NextRequest) {
  const channelToken = request.headers.get("x-goog-channel-token") ?? "";
  const resourceState =
    request.headers.get("x-goog-resource-state") ?? "exists";

  try {
    if (channelToken) {
      const agenda = new AgendaService();
      await agenda.processarWebhook(channelToken, resourceState);
    }
  } catch {
    // Google espera 2xx mesmo se o sync falhar momentaneamente
  }

  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "google-calendar-webhook" });
}
