import Link from "next/link";
import { UserX, Compass } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="academic-card p-10 text-center max-w-lg mx-auto my-8 space-y-5">
      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
        <UserX className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Registro Acadêmico Inexistente
        </span>
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          Estudante ou mentor não localizado
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          O identificador informado não corresponde a nenhum perfil ativo na rede SkillSwap.
        </p>
      </div>
      <Link href="/discover" className="btn-primary text-xs">
        <Compass className="w-4 h-4" />
        Voltar ao Catálogo de Mentores
      </Link>
    </div>
  );
}
