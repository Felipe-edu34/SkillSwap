"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { meetingCreateSchema } from "@/lib/validators";
import { syncEventWithGoogleCalendar } from "@/lib/google-calendar";

export interface MeetingActionState {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

/**
 * Agenda uma nova sessão de mentoria (ONLINE ou PRESENCIAL) vinculada a uma troca
 * confirmada ou em andamento, gerando integração com Google Calendar.
 */
export async function createMeetingAction(
  _prevState: MeetingActionState,
  formData: FormData
): Promise<MeetingActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      error: "Sessão expirada. Faça login para agendar encontros.",
    };
  }

  const rawLat = formData.get("latitude");
  const rawLng = formData.get("longitude");

  const parsed = meetingCreateSchema.safeParse({
    exchangeId: formData.get("exchangeId"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
    mode: formData.get("mode"),
    locationName: formData.get("locationName") || "",
    meetingUrl: formData.get("meetingUrl") || "",
    latitude: rawLat && String(rawLat).trim() !== "" ? Number(rawLat) : null,
    longitude: rawLng && String(rawLng).trim() !== "" ? Number(rawLng) : null,
  });

  if (!parsed.success) {
    return {
      error: "Verifique os dados informados para o agendamento.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    exchangeId,
    scheduledAt,
    durationMinutes,
    mode,
    locationName,
    meetingUrl,
    latitude,
    longitude,
  } = parsed.data;

  const parsedDate = new Date(scheduledAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      error: "Data e horário inválidos.",
    };
  }

  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
        offeredSkill: { select: { name: true } },
        requestedSkill: { select: { name: true } },
      },
    });

    if (!exchange) {
      return { error: "Troca vinculada não encontrada." };
    }

    const isParticipant =
      exchange.requesterId === currentUser.id ||
      exchange.receiverId === currentUser.id;

    if (!isParticipant) {
      return {
        error: "Apenas os participantes da troca podem agendar encontros.",
      };
    }

    if (
      exchange.status !== "CONFIRMADA" &&
      exchange.status !== "EM_ANDAMENTO"
    ) {
      return {
        error:
          "Encontros só podem ser agendados para trocas nas etapas 'Confirmada' ou 'Em andamento'.",
      };
    }

    const eventTitle = `Mentoria SkillSwap: ${exchange.offeredSkill.name} ↔ ${exchange.requestedSkill.name}`;
    const eventLocation =
      mode === "ONLINE"
        ? meetingUrl || "Sala Virtual Online"
        : locationName || "Campus Universitário";
    const eventDescription = [
      `Sessão de Intercâmbio Acadêmico SkillSwap`,
      `Participantes: ${exchange.requester.name} e ${exchange.receiver.name}`,
      `Disciplinas: ${exchange.offeredSkill.name} ↔ ${exchange.requestedSkill.name}`,
      `Modalidade: ${mode}`,
      mode === "ONLINE" && meetingUrl ? `Link da Sala: ${meetingUrl}` : "",
      mode === "PRESENCIAL" && locationName ? `Local: ${locationName}` : "",
      latitude && longitude ? `Coordenadas: ${latitude}, ${longitude}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const calendarSync = await syncEventWithGoogleCalendar({
      title: eventTitle,
      description: eventDescription,
      startTime: parsedDate,
      durationMinutes,
      location: eventLocation,
      attendeeEmails: [exchange.requester.email, exchange.receiver.email],
    });

    await prisma.meeting.create({
      data: {
        exchangeId,
        scheduledAt: parsedDate,
        durationMinutes,
        mode,
        locationName:
          mode === "PRESENCIAL"
            ? locationName || null
            : locationName || "Sala Virtual Online",
        meetingUrl: mode === "ONLINE" ? meetingUrl || null : null,
        latitude: mode === "PRESENCIAL" ? latitude ?? null : null,
        longitude: mode === "PRESENCIAL" ? longitude ?? null : null,
        googleCalendarEventId: calendarSync.googleCalendarEventId,
        googleCalendarLink: calendarSync.googleCalendarLink,
      },
    });

    // Se a troca estava CONFIRMADA (Etapa 3), avança automaticamente para EM_ANDAMENTO (Etapa 4)
    if (exchange.status === "CONFIRMADA") {
      await prisma.exchange.update({
        where: { id: exchangeId },
        data: { status: "EM_ANDAMENTO" },
      });
    }

    revalidatePath("/calendar");
    revalidatePath("/exchanges");

    return {
      success: true,
      message:
        "Encontro agendado com sucesso! Link do Google Calendar e arquivo .ICS prontos para exportação.",
    };
  } catch (err) {
    console.error("[createMeetingAction error]:", err);
    return {
      error: "Não foi possível registrar o agendamento.",
    };
  }
}

/**
 * Cancela/remove um encontro agendado caso o usuário logado seja participante da troca.
 */
export async function deleteMeetingAction(
  meetingId: string
): Promise<MeetingActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Sessão expirada." };
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { exchange: true },
    });

    if (!meeting) {
      return { error: "Encontro não encontrado." };
    }

    const isParticipant =
      meeting.exchange.requesterId === currentUser.id ||
      meeting.exchange.receiverId === currentUser.id;

    if (!isParticipant) {
      return { error: "Permissão negada para cancelar este encontro." };
    }

    await prisma.meeting.delete({
      where: { id: meetingId },
    });

    revalidatePath("/calendar");
    revalidatePath("/exchanges");

    return {
      success: true,
      message: "Encontro removido da agenda acadêmica.",
    };
  } catch (err) {
    console.error("[deleteMeetingAction error]:", err);
    return { error: "Erro ao remover encontro." };
  }
}
