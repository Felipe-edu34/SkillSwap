import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { generateIcsFileContent } from "@/lib/google-calendar";

/**
 * Route Handler para exportação de arquivo iCalendar (.ics) de um encontro agendado
 * (Receitas 19 e 21: Rota de API dinâmica com await params).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        exchange: {
          include: {
            requester: { select: { name: true, email: true } },
            receiver: { select: { name: true, email: true } },
            offeredSkill: { select: { name: true } },
            requestedSkill: { select: { name: true } },
          },
        },
      },
    });

    if (!meeting) {
      return Response.json(
        { error: "Encontro acadêmico não encontrado." },
        { status: 404 }
      );
    }

    const { exchange } = meeting;
    const title = `SkillSwap: ${exchange.offeredSkill.name} <-> ${exchange.requestedSkill.name}`;
    const location =
      meeting.mode === "ONLINE"
        ? meeting.meetingUrl || meeting.locationName || "Sala Virtual Online"
        : meeting.locationName || "Campus Universitário";

    const description = [
      `Mentoria Acadêmica SkillSwap`,
      `Estudantes: ${exchange.requester.name} & ${exchange.receiver.name}`,
      `Intercâmbio: ${exchange.offeredSkill.name} <-> ${exchange.requestedSkill.name}`,
      `Modalidade: ${meeting.mode}`,
      meeting.meetingUrl ? `Sala Virtual: ${meeting.meetingUrl}` : "",
      meeting.locationName ? `Local: ${meeting.locationName}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const icsContent = generateIcsFileContent({
      id: meeting.id,
      title,
      description,
      startTime: meeting.scheduledAt,
      durationMinutes: meeting.durationMinutes,
      location,
      attendeeEmails: [exchange.requester.email, exchange.receiver.email],
    });

    return new Response(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="skillswap-encontro-${meeting.id}.ics"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/calendar/[meetingId]/ics error]:", err);
    return Response.json(
      { error: "Falha ao gerar arquivo .ics do encontro." },
      { status: 500 }
    );
  }
}
