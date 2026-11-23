import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SkillForm from "@/components/skills/SkillForm";
import UserSkillCard from "@/components/skills/UserSkillCard";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

export const metadata = {
  title: "Minhas Competências Acadêmicas",
};

export default async function SkillsPage() {
  const user = await requireCurrentUser();

  const [userSkills, catalogSkills] = await Promise.all([
    prisma.userSkill.findMany({
      where: { userId: user.id },
      include: { skill: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.skill.findMany({
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const teachSkills = userSkills.filter((us) => us.type === "TEACH");
  const learnSkills = userSkills.filter((us) => us.type === "LEARN");

  const isReadyForMatches = teachSkills.length > 0 && learnSkills.length > 0;

  return (
    <div className="space-y-8">
      {/* Banner de Status de Reciprocidade */}
      <div
        className={`academic-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          isReadyForMatches
            ? "bg-emerald-50/60 border-emerald-200"
            : "bg-amber-50/70 border-amber-200"
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isReadyForMatches
                ? "bg-emerald-700 text-white"
                : "bg-amber-600 text-white"
            }`}
          >
            {isReadyForMatches ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-slate-900">
              {isReadyForMatches
                ? "Portfólio apto para o Motor de Compatibilidade!"
                : "Complete seu perfil de reciprocidade"}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {isReadyForMatches
                ? `Você cadastrou ${teachSkills.length} competência(s) de ensino e ${learnSkills.length} de aprendizado. O algoritmo já pode calcular seus pares recíprocos.`
                : "Cadastre ao menos uma habilidade que você domina (Ensina) e uma que deseja aprender para liberar sugestões completas de troca."}
            </p>
          </div>
        </div>

        {isReadyForMatches && (
          <Link href="/matches" className="btn-primary shrink-0 text-xs">
            Ver Meus Matches
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Formulário CRUD via Server Action */}
      <SkillForm catalogSkills={catalogSkills} />

      {/* Duas Colunas Semânticas: O que Ensino vs O que Quero Aprender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1: Competências que Ensino (Emerald) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Pode Ensinar (Mentoria)
                </h3>
                <p className="text-xs text-slate-500">
                  Disciplinas e temas que você compartilha com colegas
                </p>
              </div>
            </div>
            <span className="badge-teach">{teachSkills.length}</span>
          </div>

          {teachSkills.length === 0 ? (
            <div className="academic-card p-8 text-center space-y-2 border-dashed">
              <p className="text-sm font-semibold text-slate-700">
                Nenhuma habilidade de ensino cadastrada
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Adicione acima ao menos uma disciplina ou ferramenta que você domina para oferecer em troca de mentoria.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teachSkills.map((item) => (
                <UserSkillCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Coluna 2: Competências que Quero Aprender (Indigo) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Quer Aprender (Objetivos)
                </h3>
                <p className="text-xs text-slate-500">
                  Conhecimentos que você busca desenvolver
                </p>
              </div>
            </div>
            <span className="badge-learn">{learnSkills.length}</span>
          </div>

          {learnSkills.length === 0 ? (
            <div className="academic-card p-8 text-center space-y-2 border-dashed">
              <p className="text-sm font-semibold text-slate-700">
                Nenhum objetivo de aprendizado registrado
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Selecione &ldquo;Quero Aprender&rdquo; no formulário acima para indicar quais disciplinas você procura na rede.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {learnSkills.map((item) => (
                <UserSkillCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
