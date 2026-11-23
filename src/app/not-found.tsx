import Link from "next/link";
import { BookOpen, Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="academic-card max-w-lg w-full p-8 text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-900">
          <BookOpen className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">
            Erro 404 • Registro Não Localizado
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Página ou perfil acadêmico não encontrado
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            O endereço acessado não corresponde a uma rota ativa ou o registro de mentor/habilidade foi removido do catálogo.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/discover" className="btn-primary">
            <Compass className="w-4 h-4" />
            Explorar Catálogo
          </Link>
          <Link href="/" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
