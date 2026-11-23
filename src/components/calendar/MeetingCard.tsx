"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteMeetingAction } from "@/actions/meetings";
import { formatDistanceKm } from "@/lib/geolocation";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Download,
  Trash2,
  ArrowLeftRight,
} from "lucide-react";

export interface MeetingCardItem {
  id: string;
  exchangeId: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: "ONLINE" | "PRESENCIAL";
  locationName: string | null;
  meetingUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  googleCalendarLink: string;
  partner: {
    id: string;
    name: string;
    institutionOrArea: string | null;
    city: string | null;
  };
  offeredSkillName: string;
  requestedSkillName: string;
  distanceBetweenParticipantsKm: number | null;
}

export default function MeetingCard({ item }: { item: MeetingCardItem }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const dateObj = new Date(item.scheduledAt);
  const isOnline = item.mode === "ONLINE";

  const handleDelete = () => {
    startTransition(async () => {
      await deleteMeetingAction(item.id);
    });
  };

  return (
    <article
      className={`academic-card p-5 space-y-4 border-l-4 ${
        isOnline ? "border-l-indigo-900" : "border-l-emerald-700"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={isOnline ? "badge-learn" : "badge-teach"}>
              {isOnline ? (
                <Video className="w-3.5 h-3.5" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
              {isOnline ? "Sessão Online" : "Encontro Presencial"}
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-indigo-900" />
              {dateObj.toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {dateObj.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              ({item.durationMinutes} min)
            </span>
          </div>

          <h4 className="text-base font-serif font-bold text-slate-900 pt-1 flex flex-wrap items-center gap-2">
            <span>{item.offeredSkillName}</span>
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.requestedSkillName}</span>
          </h4>

          <p className="text-xs text-slate-600">
            Com{" "}
            <Link
              href={`/profiles/${item.partner.id}`}
              className="font-semibold text-indigo-900 hover:underline"
            >
              {item.partner.name}
            </Link>{" "}
            {item.partner.institutionOrArea
              ? `(${item.partner.institutionOrArea})`
              : ""}
          </p>
        </div>

        {/* Remoção com confirmação */}
        <div>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Cancelar encontro"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs">
              <span className="text-amber-900 font-semibold">Cancelar?</span>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700"
              >
                {isDeleting ? "..." : "Sim"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-slate-500 hover:text-slate-800 px-1"
              >
                Não
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detalhes do Local ou Sala Virtual + Distância Haversine */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
        {isOnline ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-700 font-medium">
              {item.locationName || "Videoconferência Acadêmica"}
            </span>
            {item.meetingUrl && (
              <a
                href={item.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-indigo-900 hover:underline"
              >
                Acessar Sala Virtual
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-800 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              {item.locationName || "Campus Universitário"}
            </span>
            {item.distanceBetweenParticipantsKm !== null && (
              <span className="text-emerald-700 font-semibold">
                Distância entre os participantes:{" "}
                {formatDistanceKm(item.distanceBetweenParticipantsKm)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Ações de Exportação para Google Calendar e Arquivo .ICS */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
        <a
          href={item.googleCalendarLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs py-1.5 px-3"
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-900" />
          Adicionar ao Google Calendar
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        <a
          href={`/api/calendar/${item.id}/ics`}
          download={`skillswap-encontro-${item.id}.ics`}
          className="btn-primary text-xs py-1.5 px-3"
        >
          <Download className="w-3.5 h-3.5" />
          Baixar Arquivo .ICS
        </a>
      </div>
    </article>
  );
}
