import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Acesso Acadêmico",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-900 text-white shadow-xs mx-auto"
          >
            <BookOpen className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-slate-900 pt-2">
            Acesse sua Conta Acadêmica
          </h1>
          <p className="text-sm text-slate-600">
            Entre para visualizar seus matches de estudo e gerenciar suas mentorias.
          </p>
        </div>

        <div className="academic-card p-6 sm:p-8">
          <LoginForm callbackUrl={resolvedParams.callbackUrl} />

          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
            Ainda não possui cadastro no SkillSwap?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-900 hover:underline"
            >
              Criar perfil de estudante/mentor
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a página institucional
          </Link>
        </div>
      </div>
    </div>
  );
}
