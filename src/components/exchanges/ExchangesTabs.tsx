"use client";

import { useState } from "react";
import Link from "next/link";
import ExchangeCard, {
  type ExchangeItemData,
} from "@/components/exchanges/ExchangeCard";
import { Inbox, Send, Award, Compass } from "lucide-react";

interface ExchangesTabsProps {
  currentUserId: string;
  receivedExchanges: ExchangeItemData[];
  sentExchanges: ExchangeItemData[];
  historyExchanges: ExchangeItemData[];
}

export default function ExchangesTabs({
  currentUserId,
  receivedExchanges,
  sentExchanges,
  historyExchanges,
}: ExchangesTabsProps) {
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "history">(
    receivedExchanges.length > 0 ? "received" : "sent"
  );

  const tabs = [
    {
      id: "received" as const,
      label: "Solicitações Recebidas",
      count: receivedExchanges.length,
      icon: Inbox,
    },
    {
      id: "sent" as const,
      label: "Solicitações Enviadas",
      count: sentExchanges.length,
      icon: Send,
    },
    {
      id: "history" as const,
      label: "Histórico (Concluídas & Avaliadas)",
      count: historyExchanges.length,
      icon: Award,
    },
  ];

  const currentList =
    activeTab === "received"
      ? receivedExchanges
      : activeTab === "sent"
      ? sentExchanges
      : historyExchanges;

  return (
    <div className="space-y-6">
      {/* Abas de Navegação */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? "bg-indigo-900 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] ${
                  active
                    ? "bg-indigo-800 text-indigo-100"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de Cards de Troca da Aba Ativa */}
      {currentList.length === 0 ? (
        <div className="academic-card p-10 text-center space-y-4">
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Nenhum registro nesta categoria
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeTab === "received"
                ? "Você não possui solicitações recebidas em andamento no momento."
                : activeTab === "sent"
                ? "Você ainda não enviou propostas ativas ou todas já foram concluídas."
                : "Suas trocas concluídas e avaliadas aparecerão aqui como certificação acadêmica."}
            </p>
          </div>
          <Link href="/matches" className="btn-primary text-xs">
            <Compass className="w-4 h-4" />
            Explorar Sugestões de Match
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {currentList.map((exchange) => (
            <ExchangeCard
              key={exchange.id}
              exchange={exchange}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
