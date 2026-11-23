"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExchangeStatus } from "@prisma/client";
import {
  getAvailableActionsForUser,
  getStepMeta,
} from "@/lib/exchange-state";
import { advanceExchangeStatusAction } from "@/actions/exchanges";
import ExchangeStepper from "@/components/exchanges/ExchangeStepper";
import ReviewModal from "@/components/exchanges/ReviewModal";
import {
  ArrowLeftRight,
  Calendar,
  GraduationCap,
  BookOpen,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

export interface ExchangeItemData {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ExchangeStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    name: string;
    institutionOrArea: string | null;
    city: string | null;
  };
  receiver: {
    id: string;
    name: string;
    institutionOrArea: string | null;
    city: string | null;
  };
  offeredSkill: {
    id: string;
    name: string;
    category: string;
  };
  requestedSkill: {
    id: string;
    name: string;
    category: string;
  };
  meetingsCount: number;
  reviews: Array<{
    id: string;
    authorId: string;
    authorName: string;
    rating: number;
    comment: string;
  }>;
}

interface ExchangeCardProps {
  exchange: ExchangeItemData;
  currentUserId: string;
}

export default function ExchangeCard({
  exchange,
  currentUserId,
}: ExchangeCardProps) {
  const [isPending, startTransition] = useTransition();
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const isRequester = exchange.requesterId === currentUserId;
  const role: "requester" | "receiver" = isRequester ? "requester" : "receiver";
  const partner = isRequester ? exchange.receiver : exchange.requester;

  // Do ponto de vista do usuário logado: o que ele ensina e o que ele aprende nesta troca
  const myTaughtSkill = isRequester
    ? exchange.offeredSkill
    : exchange.requestedSkill;
  const myLearnedSkill = isRequester
    ? exchange.requestedSkill
    : exchange.offeredSkill;

  const stepMeta = getStepMeta(exchange.status);
  const availableActions = getAvailableActionsForUser({
    currentStatus: exchange.status,
    actorUserId: currentUserId,
    requesterId: exchange.requesterId,
    receiverId: exchange.receiverId,
  });

  const hasCurrentUserReviewed = exchange.reviews.some(
    (r) => r.authorId === currentUserId
  );

  const canEvaluate =
    (exchange.status === "CONCLUIDA" || exchange.status === "AVALIADA") &&
    !hasCurrentUserReviewed;

  const canScheduleMeeting =
    exchange.status === "CONFIRMADA" || exchange.status === "EM_ANDAMENTO";

  const handleTransition = (nextStatus: ExchangeStatus) => {
    setFeedbackError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("exchangeId", exchange.id);
      formData.set("nextStatus", nextStatus);
      const res = await advanceExchangeStatusAction(formData);
      if (res.error) {
        setFeedbackError(res.error);
      }
    });
  };

  return (
    <article className="academic-card p-6 space-y-5">
      {/* Cabeçalho da Troca */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${
                isRequester
                  ? "bg-indigo-50 text-indigo-900 border-indigo-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {isRequester ? "Solicitação Enviada por Você" : "Solicitação Recebida"}
            </span>
            <span className="text-xs text-slate-400">
              • Atualizada em{" "}
              {new Date(exchange.updatedAt).toLocaleDateString("pt-BR")}
            </span>
          </div>

          <h3 className="text-lg font-serif font-bold text-slate-900">
            Intercâmbio com{" "}
            <Link
              href={`/profiles/${partner.id}`}
              className="text-indigo-900 hover:underline"
            >
              {partner.name}
            </Link>
          </h3>
          <p className="text-xs text-slate-500">
            {partner.institutionOrArea || "Estudante / Mentor"}
            {partner.city ? ` • ${partner.city}` : ""}
          </p>
        </div>

        {/* Badge de Status Atual */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span
            className={
              exchange.status === "CONCLUIDA" || exchange.status === "AVALIADA"
                ? "badge-teach"
                : exchange.status === "SOLICITACAO_ENVIADA" ||
                  exchange.status === "AGUARDANDO_ACEITE"
                ? "badge-pending"
                : "badge-learn"
            }
          >
            Etapa {stepMeta.stepNumber}/6: {stepMeta.label}
          </span>
        </div>
      </div>

      {/* Par Recíproco de Disciplinas */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        <div className="md:col-span-5 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Você Ensina
            </span>
            <p className="text-sm font-serif font-bold text-slate-900 mt-0.5">
              {myTaughtSkill.name}
            </p>
          </div>
          <span className="badge-neutral text-[10px]">
            {myTaughtSkill.category}
          </span>
        </div>

        <div className="md:col-span-1 flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-900">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>

        <div className="md:col-span-5 p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {partner.name.split(" ")[0]} Ensina
            </span>
            <p className="text-sm font-serif font-bold text-slate-900 mt-0.5">
              {myLearnedSkill.name}
            </p>
          </div>
          <span className="badge-neutral text-[10px]">
            {myLearnedSkill.category}
          </span>
        </div>
      </div>

      {/* Mensagem da Proposta */}
      {exchange.message && (
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">
              Mensagem da proposta:{" "}
            </span>
            <span>{exchange.message}</span>
          </div>
        </div>
      )}

      {/* Stepper Pedagógico de 6 Estados */}
      <ExchangeStepper currentStatus={exchange.status} role={role} />

      {feedbackError && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* Avaliações já registradas nesta troca */}
      {exchange.reviews.length > 0 && (
        <div className="pt-2 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pareceres Acadêmicos Registrados ({exchange.reviews.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exchange.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3 rounded-lg bg-amber-50/40 border border-amber-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    {rev.authorName}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {rev.rating}.0
                  </span>
                </div>
                <p className="text-slate-600 italic">&ldquo;{rev.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Ações Contextuais por Papel do Usuário */}
      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {canScheduleMeeting && (
            <Link
              href={`/calendar?exchangeId=${exchange.id}`}
              className="inline-flex items-center gap-1.5 font-semibold text-indigo-900 hover:underline"
            >
              <Calendar className="w-3.5 h-3.5" />
              Agendar Sessão ({exchange.meetingsCount} encontro
              {exchange.meetingsCount === 1 ? "" : "s"})
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {availableActions.map((act) => (
            <button
              key={act.nextStatus}
              type="button"
              disabled={isPending}
              onClick={() => handleTransition(act.nextStatus)}
              className={
                act.variant === "emerald"
                  ? "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                  : act.variant === "primary"
                  ? "btn-primary text-xs py-2 px-3.5"
                  : "btn-secondary text-xs py-2 px-3.5"
              }
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isPending ? "Atualizando..." : act.buttonLabel}
            </button>
          ))}

          {canEvaluate && (
            <ReviewModal
              exchangeId={exchange.id}
              partnerName={partner.name}
              taughtSkillName={myTaughtSkill.name}
              learnedSkillName={myLearnedSkill.name}
            />
          )}
        </div>
      </div>
    </article>
  );
}
