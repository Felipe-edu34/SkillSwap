import { requireCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateHaversineDistanceKm } from "@/lib/geolocation";
import { buildGoogleCalendarTemplateLink } from "@/lib/google-calendar";
import MeetingForm, {
  type SchedulableExchangeOption,
} from "@/components/calendar/MeetingForm";
import MeetingCard, {
  type MeetingCardItem,
} from "@/components/calendar/MeetingCard";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Agenda Acadêmica de Encontros",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ exchangeId?: string }>;
}) {
  const { exchangeId: preselectedExchangeId } = await searchParams;
  const user = await requireCurrentUser();

  // Busca trocas confirmadas ou em andamento para o seletor de agendamento
  const activeExchanges = await prisma.exchange.findMany({
    where: {
      OR: [{ requesterId: user.id }, { receiverId: user.id }],
      status: {
        in: ["CONFIRMADA", "EM_ANDAMENTO"],
      },
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          latitude: true,
          longitude: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          latitude: true,
          longitude: true,
        },
      },
      offeredSkill: { select: { name: true } },
      requestedSkill: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const schedulableOptions: SchedulableExchangeOption[] = activeExchanges.map(
    (ex) => {
      const isRequester = ex.requesterId === user.id;
      const partner = isRequester ? ex.receiver : ex.requester;
      return {
        id: ex.id,
        partnerName: partner.name,
        partnerCity: partner.city,
        partnerLat: partner.latitude,
        partnerLng: partner.longitude,
        offeredSkillName: ex.offeredSkill.name,
        requestedSkillName: ex.requestedSkill.name,
      };
    }
  );

  // Busca todos os encontros vinculados às trocas do usuário logado
  const meetings = await prisma.meeting.findMany({
    where: {
      exchange: {
        OR: [{ requesterId: user.id }, { receiverId: user.id }],
      },
    },
    include: {
      exchange: {
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              institutionOrArea: true,
              city: true,
              latitude: true,
              longitude: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              institutionOrArea: true,
              city: true,
              latitude: true,
              longitude: true,
            },
          },
          offeredSkill: { select: { name: true } },
          requestedSkill: { select: { name: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const meetingItems: MeetingCardItem[] = meetings.map((m) => {
    const { exchange } = m;
    const isRequester = exchange.requesterId === user.id;
    const partner = isRequester ? exchange.receiver : exchange.requester;

    const distanceBetweenParticipantsKm = calculateHaversineDistanceKm(
      exchange.requester.latitude,
      exchange.requester.longitude,
      exchange.receiver.latitude,
      exchange.receiver.longitude
    );

    const googleCalendarLink =
      m.googleCalendarLink ||
      buildGoogleCalendarTemplateLink({
        title: `Mentoria SkillSwap: ${exchange.offeredSkill.name} ↔ ${exchange.requestedSkill.name}`,
        description: `Intercâmbio acadêmico entre ${exchange.requester.name} e ${exchange.receiver.name}.`,
        startTime: m.scheduledAt,
        durationMinutes: m.durationMinutes,
        location:
          m.mode === "ONLINE"
            ? m.meetingUrl || "Sala Virtual Online"
            : m.locationName || "Campus Universitário",
        attendeeEmails: [exchange.requester.email, exchange.receiver.email],
      });

    return {
      id: m.id,
      exchangeId: m.exchangeId,
      scheduledAt: m.scheduledAt.toISOString(),
      durationMinutes: m.durationMinutes,
      mode: m.mode,
      locationName: m.locationName,
      meetingUrl: m.meetingUrl,
      latitude: m.latitude,
      longitude: m.longitude,
      googleCalendarLink,
      partner: {
        id: partner.id,
        name: partner.name,
        institutionOrArea: partner.institutionOrArea,
        city: partner.city,
      },
      offeredSkillName: exchange.offeredSkill.name,
      requestedSkillName: exchange.requestedSkill.name,
      distanceBetweenParticipantsKm,
    };
  });

  return (
    <div className="space-y-8">
      {/* Formulário de Agendamento de Sessão (Online ou Presencial com Geolocation) */}
      <MeetingForm
        exchanges={schedulableOptions}
        defaultExchangeId={preselectedExchangeId}
        currentUserLat={user.latitude}
        currentUserLng={user.longitude}
      />

      {/* Lista Cronológica de Encontros Agendados */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Sessões de Mentoria Agendadas
              </h2>
              <p className="text-xs text-slate-500">
                Exporte qualquer encontro para o Google Calendar ou baixe o arquivo universal .ICS
              </p>
            </div>
          </div>

          <span className="badge-learn">
            {meetingItems.length}{" "}
            {meetingItems.length === 1 ? "sessão" : "sessões"}
          </span>
        </div>

        {meetingItems.length === 0 ? (
          <div className="academic-card p-10 text-center space-y-2 border-dashed">
            <p className="text-sm font-semibold text-slate-700">
              Nenhum encontro agendado até o momento
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Utilize o formulário acima para definir a data, horário e modalidade (Online ou Presencial no campus) da sua próxima mentoria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {meetingItems.map((item) => (
              <MeetingCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Nota Técnica de Compatibilidade Google Calendar & RFC 5545 */}
      <div className="academic-card p-4 bg-slate-50/80 border-slate-200 flex items-center gap-3 text-xs text-slate-600">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>
          <strong>Integração Híbrida Ativa:</strong> Os agendamentos geram automaticamente links diretos para o <strong>Google Calendar</strong>, sincronizam via OAuth2 quando configurado no servidor e disponibilizam download nativo em formato <code>.ics</code> (RFC 5545) via <code>/api/calendar/[meetingId]/ics</code>.
        </span>
      </div>
    </div>
  );
}
