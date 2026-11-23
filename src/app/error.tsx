"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SkillSwap Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="academic-card max-w-lg w-full p-8 text-center space-y-5">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Interrupção no Ambiente Acadêmico
          </p>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Não foi possível concluir a operação
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {error.message ||
              "Ocorreu uma falha inesperada ao processar sua solicitação. Tente recarregar a seção ou retornar ao painel principal."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button onClick={() => reset()} className="btn-primary">
            <RotateCcw className="w-4 h-4" />
            Tentar Novamente
          </button>
          <Link href="/" className="btn-secondary">
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
