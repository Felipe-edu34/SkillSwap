"use client";

import { useActionState, useState } from "react";
import { loginAction, type AuthActionState } from "@/actions/auth";
import { LogIn, AlertCircle, Sparkles, Lock, Mail } from "lucide-react";

const initialState: AuthActionState = {};

interface LoginFormProps {
  callbackUrl?: string;
}

export default function LoginForm({ callbackUrl = "/matches" }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState("felipe@skillswap.edu.br");
  const [password, setPassword] = useState("123456");

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("123456");
  };

  return (
    <div className="space-y-6">
      {/* Seletor Rápido de Contas Acadêmicas do Seed */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Acesso Rápido de Demonstração (Seed Acadêmico)</span>
        </div>
        <p className="text-xs text-slate-600">
          Selecione um estudante para preencher automaticamente as credenciais:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => fillDemoAccount("felipe@skillswap.edu.br")}
            className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
              email === "felipe@skillswap.edu.br"
                ? "bg-white border-indigo-900 ring-1 ring-indigo-900 text-slate-900"
                : "bg-white/70 border-slate-200 text-slate-700 hover:bg-white"
            }`}
          >
            <span className="font-semibold block">Felipe Eduardo (UFRN)</span>
            <span className="text-[11px] text-slate-500">
              Ensina Python • Aprende Inglês
            </span>
          </button>

          <button
            type="button"
            onClick={() => fillDemoAccount("maria@skillswap.edu.br")}
            className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
              email === "maria@skillswap.edu.br"
                ? "bg-white border-indigo-900 ring-1 ring-indigo-900 text-slate-900"
                : "bg-white/70 border-slate-200 text-slate-700 hover:bg-white"
            }`}
          >
            <span className="font-semibold block">Maria Clara (UFRN)</span>
            <span className="text-[11px] text-slate-500">
              Ensina Inglês • Aprende Python
            </span>
          </button>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        {state.error && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className="label-academic">
            E-mail Acadêmico ou Pessoal
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@universidade.edu.br"
              className="input-academic pl-10"
            />
          </div>
          {state.fieldErrors?.email && (
            <p className="text-xs text-amber-700 mt-1">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="label-academic">
            Senha de Acesso
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-academic pl-10"
            />
          </div>
          {state.fieldErrors?.password && (
            <p className="text-xs text-amber-700 mt-1">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-2.5 mt-2"
        >
          <LogIn className="w-4 h-4" />
          {isPending ? "Autenticando..." : "Entrar no Ambiente Acadêmico"}
        </button>
      </form>
    </div>
  );
}
