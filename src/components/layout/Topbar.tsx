"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, MapPin, GraduationCap, PlusCircle } from "lucide-react";
import type { SidebarUser } from "./Sidebar";

interface TopbarProps {
  user: SidebarUser | null;
  pendingExchangesCount: number;
}

const SECTION_META: Record<
  string,
  { title: string; subtitle: string }
> = {
  "/matches": {
    title: "Motor de Compatibilidade Acadêmica",
    subtitle:
      "Pares ordenados por reciprocidade direta de conhecimentos, afinidade de área e proximidade.",
  },
  "/discover": {
    title: "Catálogo de Mentores e Competências",
    subtitle:
      "Pesquise estudantes, pesquisadores e habilidades disponíveis para intercâmbio.",
  },
  "/skills": {
    title: "Portfólio de Competências",
    subtitle:
      "Gerencie as disciplinas que você pode ensinar e os temas que deseja aprender.",
  },
  "/exchanges": {
    title: "Painel Pedagógico de Trocas",
    subtitle:
      "Acompanhe o progresso nas 6 etapas, aceite solicitações e registre avaliações.",
  },
  "/calendar": {
    title: "Agenda Acadêmica de Encontros",
    subtitle:
      "Sessões online e presenciais com exportação para Google Calendar e arquivo .ics.",
  },
};

export default function Topbar({ user, pendingExchangesCount }: TopbarProps) {
  const pathname = usePathname();

  const currentSection =
    SECTION_META[pathname] ||
    (pathname.startsWith("/profiles/")
      ? {
          title: "Histórico & Currículo Acadêmico",
          subtitle:
            "Competências certificadas pela comunidade, trocas concluídas e pareceres.",
        }
      : {
          title: "Ambiente Acadêmico SkillSwap",
          subtitle: "Aprendizado colaborativo baseado em reciprocidade.",
        });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-10 lg:pl-0">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-900">
            {currentSection.title}
          </h2>
          <p className="text-xs text-slate-600">{currentSection.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {pendingExchangesCount > 0 && (
            <Link
              href="/exchanges"
              className="badge-pending hover:bg-amber-100 transition-colors"
              title="Solicitações ou avaliações pendentes"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {pendingExchangesCount}{" "}
                {pendingExchangesCount === 1
                  ? "troca pendente"
                  : "trocas pendentes"}
              </span>
            </Link>
          )}

          {user ? (
            <div className="hidden md:flex items-center gap-3 pl-2 border-l border-slate-200 text-xs text-slate-600">
              {user.institutionOrArea && (
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-900" />
                  {user.institutionOrArea}
                </span>
              )}
              {user.city && (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.city}
                </span>
              )}
            </div>
          ) : (
            <Link href="/register" className="btn-primary text-xs py-1.5 px-3">
              <PlusCircle className="w-3.5 h-3.5" />
              Criar Conta Acadêmica
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
