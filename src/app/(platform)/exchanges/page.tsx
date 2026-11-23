import { requireCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ExchangesTabs from "@/components/exchanges/ExchangesTabs";
import type { ExchangeItemData } from "@/components/exchanges/ExchangeCard";
import { ArrowLeftRight, Inbox, Send, Award } from "lucide-react";

export const metadata = {
  title: "Painel Pedagógico de Trocas",
};

export default async function ExchangesPage() {
  const user = await requireCurrentUser();

  const exchanges = await prisma.exchange.findMany({
    where: {
      OR: [{ requesterId: user.id }, { receiverId: user.id }],
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          institutionOrArea: true,
          city: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          institutionOrArea: true,
          city: true,
        },
      },
      offeredSkill: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      requestedSkill: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      meetings: {
        select: { id: true },
      },
      reviews: {
        include: {
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized: ExchangeItemData[] = exchanges.map((ex) => ({
    id: ex.id,
    requesterId: ex.requesterId,
    receiverId: ex.receiverId,
    status: ex.status,
    message: ex.message,
    createdAt: ex.createdAt.toISOString(),
    updatedAt: ex.updatedAt.toISOString(),
    requester: ex.requester,
    receiver: ex.receiver,
    offeredSkill: ex.offeredSkill,
    requestedSkill: ex.requestedSkill,
    meetingsCount: ex.meetings.length,
    reviews: ex.reviews.map((r) => ({
      id: r.id,
      authorId: r.authorId,
      authorName: r.author.name,
      rating: r.rating,
      comment: r.comment,
    })),
  }));

  const isHistoryStatus = (status: ExchangeItemData["status"]) =>
    status === "CONCLUIDA" || status === "AVALIADA";

  const receivedExchanges = serialized.filter(
    (ex) => ex.receiverId === user.id && !isHistoryStatus(ex.status)
  );

  const sentExchanges = serialized.filter(
    (ex) => ex.requesterId === user.id && !isHistoryStatus(ex.status)
  );

  const historyExchanges = serialized.filter((ex) =>
    isHistoryStatus(ex.status)
  );

  return (
    <div className="space-y-8">
      {/* Resumo Estatístico das Trocas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="academic-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-slate-900 block leading-none">
              {serialized.length}
            </span>
            <span className="text-xs text-slate-500">
              Total de intercâmbios
            </span>
          </div>
        </div>

        <div className="academic-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-slate-900 block leading-none">
              {receivedExchanges.length}
            </span>
            <span className="text-xs text-slate-500">
              Recebidas em andamento
            </span>
          </div>
        </div>

        <div className="academic-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-slate-900 block leading-none">
              {sentExchanges.length}
            </span>
            <span className="text-xs text-slate-500">
              Enviadas em andamento
            </span>
          </div>
        </div>

        <div className="academic-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-slate-900 block leading-none">
              {historyExchanges.length}
            </span>
            <span className="text-xs text-slate-500">
              Concluídas & avaliadas
            </span>
          </div>
        </div>
      </div>

      {/* Painel em Abas (Recebidas, Enviadas, Histórico) com Stepper de 6 Estados */}
      <ExchangesTabs
        currentUserId={user.id}
        receivedExchanges={receivedExchanges}
        sentExchanges={sentExchanges}
        historyExchanges={historyExchanges}
      />
    </div>
  );
}
