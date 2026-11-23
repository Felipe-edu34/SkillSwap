/**
 * Módulo de Integração com Google Calendar API (OAuth2),
 * Geração Automática de Deep Link ("Adicionar ao Google Calendar")
 * e Exportação Universal no Padrão RFC 5545 (.ICS / iCalendar).
 */

export interface CalendarEventInput {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  durationMinutes: number;
  location: string;
  attendeeEmails?: string[];
}

function formatGoogleCalendarUtcDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/**
 * Gera um link direto ("Adicionar ao Google Calendar") que funciona imediatamente
 * no navegador para qualquer usuário, mesmo sem credenciais OAuth2 locais.
 */
export function buildGoogleCalendarTemplateLink(
  event: Omit<CalendarEventInput, "id">
): string {
  const startUtc = formatGoogleCalendarUtcDate(event.startTime);
  const endTime = new Date(
    event.startTime.getTime() + event.durationMinutes * 60 * 1000
  );
  const endUtc = formatGoogleCalendarUtcDate(endTime);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startUtc}/${endUtc}`,
    details: event.description,
    location: event.location,
  });

  if (event.attendeeEmails && event.attendeeEmails.length > 0) {
    params.set("add", event.attendeeEmails.join(","));
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Caso as variáveis de ambiente OAuth2 do Google Calendar (GOOGLE_CLIENT_ID,
 * GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN) estejam configuradas no servidor,
 * cria o evento diretamente via Google Calendar REST API v3.
 * Caso contrário, retorna fallback gracioso utilizando o Deep Link e o arquivo .ICS.
 */
export async function syncEventWithGoogleCalendar(
  event: Omit<CalendarEventInput, "id">
): Promise<{
  googleCalendarEventId: string | null;
  googleCalendarLink: string;
  syncedViaApi: boolean;
}> {
  const fallbackLink = buildGoogleCalendarTemplateLink(event);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return {
      googleCalendarEventId: null,
      googleCalendarLink: fallbackLink,
      syncedViaApi: false,
    };
  }

  try {
    // 1. Troca o refresh_token por um access_token OAuth2 válido
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      return {
        googleCalendarEventId: null,
        googleCalendarLink: fallbackLink,
        syncedViaApi: false,
      };
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      return {
        googleCalendarEventId: null,
        googleCalendarLink: fallbackLink,
        syncedViaApi: false,
      };
    }

    const endTime = new Date(
      event.startTime.getTime() + event.durationMinutes * 60 * 1000
    );

    // 2. Cria o evento na agenda primária via Google Calendar API v3
    const calendarRes = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          location: event.location,
          start: { dateTime: event.startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          attendees: event.attendeeEmails?.map((email) => ({ email })),
        }),
      }
    );

    if (!calendarRes.ok) {
      return {
        googleCalendarEventId: null,
        googleCalendarLink: fallbackLink,
        syncedViaApi: false,
      };
    }

    const createdEvent = (await calendarRes.json()) as {
      id?: string;
      htmlLink?: string;
    };

    return {
      googleCalendarEventId: createdEvent.id ?? null,
      googleCalendarLink: createdEvent.htmlLink || fallbackLink,
      syncedViaApi: true,
    };
  } catch (err) {
    console.warn("[Google Calendar OAuth2 fallback]:", err);
    return {
      googleCalendarEventId: null,
      googleCalendarLink: fallbackLink,
      syncedViaApi: false,
    };
  }
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Gera o conteúdo de arquivo iCalendar (.ics) compatível com Google Calendar,
 * Apple Calendar, Outlook e Thunderbird (RFC 5545).
 */
export function generateIcsFileContent(event: CalendarEventInput): string {
  const nowUtc = formatGoogleCalendarUtcDate(new Date());
  const startUtc = formatGoogleCalendarUtcDate(event.startTime);
  const endTime = new Date(
    event.startTime.getTime() + event.durationMinutes * 60 * 1000
  );
  const endUtc = formatGoogleCalendarUtcDate(endTime);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SkillSwap Academico//Agenda de Mentoria//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:skillswap-meeting-${event.id}@skillswap.edu.br`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
