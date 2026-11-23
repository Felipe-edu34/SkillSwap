"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Compass,
  GraduationCap,
  ArrowLeftRight,
  Calendar,
  UserCheck,
  LogOut,
  Menu,
  X,
  LogIn,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

export interface SidebarUser {
  id: string;
  name: string;
  email: string;
  institutionOrArea?: string | null;
  city?: string | null;
}

interface SidebarProps {
  user: SidebarUser | null;
  pendingExchangesCount: number;
}

export default function Sidebar({ user, pendingExchangesCount }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Sugestões de Match",
      href: "/matches",
      icon: Sparkles,
      description: "Reciprocidade acadêmica",
    },
    {
      label: "Explorar Catálogo",
      href: "/discover",
      icon: Compass,
      description: "Colegas & disciplinas",
    },
    {
      label: "Minhas Competências",
      href: "/skills",
      icon: GraduationCap,
      description: "O que ensino e aprendo",
    },
    {
      label: "Painel de Trocas",
      href: "/exchanges",
      icon: ArrowLeftRight,
      badge: pendingExchangesCount > 0 ? pendingExchangesCount : undefined,
      description: "Propostas e avaliações",
    },
    {
      label: "Agenda Acadêmica",
      href: "/calendar",
      icon: Calendar,
      description: "Sessões online e campus",
    },
  ];

  if (user) {
    navItems.push({
      label: "Meu Histórico",
      href: `/profiles/${user.id}`,
      icon: UserCheck,
      description: "Currículo de trocas",
    });
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-72 select-none">
      {/* Cabeçalho Institucional da Marca */}
      <div className="p-6 border-b border-slate-200">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-800 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-slate-900 tracking-tight block leading-none">
              SkillSwap
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500 mt-1 block">
              Rede Acadêmica
            </span>
          </div>
        </Link>
      </div>

      {/* Menu Principal */}
      <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Ambiente de Estudo
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-indigo-900 text-white font-medium shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? "text-indigo-200" : "text-slate-500"
                  }`}
                />
                <div className="truncate">
                  <span className="block leading-tight">{item.label}</span>
                  <span
                    className={`text-[11px] block truncate ${
                      active ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                    active
                      ? "bg-amber-400 text-slate-950"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Rodapé com Credencial Acadêmica do Estudante Logado */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-900 font-serif font-bold text-sm flex items-center justify-center shrink-0">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.institutionOrArea || user.email}
                </p>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Encerrar Sessão
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-600">
              Acesse sua conta para propor trocas e gerenciar competências.
            </p>
            <Link href="/login" className="btn-primary w-full text-xs py-2">
              <LogIn className="w-3.5 h-3.5" />
              Entrar na Plataforma
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Botão Mobile */}
      <div className="lg:hidden fixed top-3.5 left-4 z-50">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menu de navegação"
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Drawer Mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 flex">{sidebarContent}</div>
        </div>
      )}

      {/* Sidebar Fixa Desktop */}
      <aside className="hidden lg:flex lg:shrink-0">{sidebarContent}</aside>
    </>
  );
}
