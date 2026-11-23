"use client";

import { useActionState, useState } from "react";
import {
  createMeetingAction,
  type MeetingActionState,
} from "@/actions/meetings";
import {
  calculateHaversineDistanceKm,
  formatDistanceKm,
} from "@/lib/geolocation";
import {
  CalendarPlus,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export interface SchedulableExchangeOption {
  id: string;
  partnerName: string;
  partnerCity: string | null;
  partnerLat: number | null;
  partnerLng: number | null;
  offeredSkillName: string;
  requestedSkillName: string;
}

interface MeetingFormProps {
  exchanges: SchedulableExchangeOption[];
  defaultExchangeId?: string;
  currentUserLat: number | null;
  currentUserLng: number | null;
}

const initialState: MeetingActionState = {};

export default function MeetingForm({
  exchanges,
  defaultExchangeId,
  currentUserLat,
  currentUserLng,
}: MeetingFormProps) {
  const [state, formAction, isPending] = useActionState(
    createMeetingAction,
    initialState
  );

  const [selectedExchangeId, setSelectedExchangeId] = useState(
    defaultExchangeId || exchanges[0]?.id || ""
  );
  const [mode, setMode] = useState<"ONLINE" | "PRESENCIAL">("PRESENCIAL");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    currentUserLat && currentUserLng
      ? { lat: currentUserLat, lng: currentUserLng }
      : null
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const selectedExchange = exchanges.find(
    (ex) => ex.id === selectedExchangeId
  );

  // Calcula distância Haversine em tempo real entre o local do encontro e o parceiro da troca
  const distanceToPartnerKm =
    selectedExchange && coords
      ? calculateHaversineDistanceKm(
          coords.lat,
          coords.lng,
          selectedExchange.partnerLat,
          selectedExchange.partnerLng
        )
      : selectedExchange
      ? calculateHaversineDistanceKm(
          currentUserLat,
          currentUserLng,
          selectedExchange.partnerLat,
          selectedExchange.partnerLng
        )
      : null;

  const handleCaptureBrowserLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoNotice("Geolocalização não suportada pelo navegador.");
      return;
    }

    setGeoLoading(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setGeoLoading(false);
        setGeoNotice(
          "Coordenadas atuais capturadas via Browser Geolocation API."
        );
      },
      () => {
        setGeoLoading(false);
        setGeoNotice(
          "Não foi possível obter o GPS do navegador. Mantendo coordenadas do perfil acadêmico."
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Data padrão sugerida: amanhã às 15:00 no formato datetime-local (YYYY-MM-DDTHH:mm)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(15, 0, 0, 0);
  const defaultDateTime = new Date(
    tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  if (exchanges.length === 0) {
    return (
      <div className="academic-card p-6 bg-amber-50/50 border-amber-200 text-xs text-amber-900 space-y-1">
        <p className="font-semibold text-sm font-serif">
          Nenhuma troca confirmada ou em andamento disponível para agendamento
        </p>
        <p className="text-slate-600">
          Para agendar uma sessão na agenda acadêmica, aceite uma solicitação ou aguarde a confirmação de uma proposta em <strong>Painel de Trocas</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="academic-card p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900">
            Agendamento de Sessão • Google Calendar & Geolocation
          </span>
          <h3 className="text-lg font-serif font-bold text-slate-900">
            Agendar Novo Encontro de Mentoria
          </h3>
        </div>

        {/* Seletor de Modalidade: PRESENCIAL vs ONLINE */}
        <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => setMode("PRESENCIAL")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === "PRESENCIAL"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Presencial (Campus)
          </button>
          <button
            type="button"
            onClick={() => setMode("ONLINE")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === "ONLINE"
                ? "bg-indigo-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Online (Sala Virtual)
          </button>
        </div>
      </div>

      {state.error && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state.success && state.message && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
        <input type="hidden" name="longitude" value={coords?.lng ?? ""} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Seleção da Troca Confirmada / Em Andamento */}
          <div className="md:col-span-6">
            <label htmlFor="exchangeId" className="label-academic">
              Intercâmbio Acadêmico Vinculado
            </label>
            <select
              id="exchangeId"
              name="exchangeId"
              value={selectedExchangeId}
              onChange={(e) => setSelectedExchangeId(e.target.value)}
              className="input-academic"
            >
              {exchanges.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.partnerName} — ({ex.offeredSkillName} ↔{" "}
                  {ex.requestedSkillName})
                </option>
              ))}
            </select>
          </div>

          {/* Data e Horário */}
          <div className="md:col-span-4">
            <label htmlFor="scheduledAt" className="label-academic">
              Data e Horário da Sessão
            </label>
            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              required
              defaultValue={defaultDateTime}
              className="input-academic"
            />
          </div>

          {/* Duração */}
          <div className="md:col-span-2">
            <label htmlFor="durationMinutes" className="label-academic">
              Duração
            </label>
            <select
              id="durationMinutes"
              name="durationMinutes"
              defaultValue="60"
              className="input-academic"
            >
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min (1h)</option>
              <option value="90">90 min (1h30)</option>
              <option value="120">120 min (2h)</option>
            </select>
          </div>
        </div>

        {/* Campos Específicos por Modalidade */}
        {mode === "PRESENCIAL" ? (
          <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-8">
                <label htmlFor="locationName" className="label-academic">
                  Nome do Campus, Biblioteca ou Sala de Estudos
                </label>
                <input
                  id="locationName"
                  name="locationName"
                  type="text"
                  required
                  placeholder="Ex.: Biblioteca Central Zila Mamede (UFRN) — Sala 2"
                  className="input-academic bg-white"
                />
                {state.fieldErrors?.locationName && (
                  <p className="text-xs text-amber-700 mt-1">
                    {state.fieldErrors.locationName[0]}
                  </p>
                )}
              </div>

              <div className="md:col-span-4">
                <button
                  type="button"
                  onClick={handleCaptureBrowserLocation}
                  disabled={geoLoading}
                  className="btn-secondary w-full text-xs py-2.5 bg-white"
                >
                  {geoLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 text-emerald-700" />
                  )}
                  Capturar GPS do Local
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                {coords ? (
                  <span className="text-emerald-800 font-medium">
                    Coordenadas definidas: ({coords.lat}, {coords.lng})
                  </span>
                ) : (
                  <span>
                    Clique em &ldquo;Capturar GPS do Local&rdquo; para anexar a localização exata.
                  </span>
                )}
              </div>

              {distanceToPartnerKm !== null && selectedExchange && (
                <span className="px-2.5 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 font-semibold">
                  Distância até {selectedExchange.partnerName.split(" ")[0]}:{" "}
                  {formatDistanceKm(distanceToPartnerKm)}
                </span>
              )}
            </div>

            {geoNotice && (
              <p className="text-[11px] text-emerald-700">{geoNotice}</p>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="meetingUrl" className="label-academic">
                  Link da Sala Virtual (Google Meet, Zoom, Teams)
                </label>
                <input
                  id="meetingUrl"
                  name="meetingUrl"
                  type="url"
                  required
                  defaultValue="https://meet.google.com/skw-acad-room"
                  placeholder="https://meet.google.com/..."
                  className="input-academic bg-white"
                />
                {state.fieldErrors?.meetingUrl && (
                  <p className="text-xs text-amber-700 mt-1">
                    {state.fieldErrors.meetingUrl[0]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="locationNameOnline" className="label-academic">
                  Título / Plataforma da Sala (Opcional)
                </label>
                <input
                  id="locationNameOnline"
                  name="locationName"
                  type="text"
                  defaultValue="Sala de Videoconferência Google Meet"
                  className="input-academic bg-white"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary text-xs py-2.5 px-5"
          >
            <CalendarPlus className="w-4 h-4" />
            {isPending
              ? "Registrando e Sincronizando..."
              : "Confirmar Agendamento Acadêmico"}
          </button>
        </div>
      </form>
    </div>
  );
}
