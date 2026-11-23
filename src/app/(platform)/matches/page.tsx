import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth";
import { computeMatchesForUser } from "@/lib/matching";
import MentorCard from "@/components/matches/MentorCard";
import MatchesApiVerifier from "@/components/matches/MatchesApiVerifier";
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  PlusCircle,
  Compass,
} from "lucide-react";

export const metadata = {
  title: "Sugestões de Match Acadêmico",
};

export default async function MatchesPage() {
  const user = await requireCurrentUser();
  const { userReady, userTeachSkills, userLearnSkills, matches } =
    await computeMatchesForUser(user.id);

  const myTeachOptions = userTeachSkills.map((s) => ({
    id: s.skillId,
    name: s.name,
  }));

  const directReciprocalMatches = matches.filter(
    (m) => m.matchType === "RECIPROCO_DIRETO"
  );
  const complementaryMatches = matches.filter(
    (m) => m.matchType !== "RECIPROCO_DIRETO"
  );

  return (
    <div className="space-y-8">
      {/* Resumo de Critérios do Usuário Logado */}
      <div className="academic-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900">
              Algoritmo de Reciprocidade & Proximidade Haversine
            </span>
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              Combinações Recomendadas para {user.name.split(" ")[0]}
            </h1>
          </div>

          <Link href="/skills" className="btn-secondary text-xs self-start">
            <PlusCircle className="w-3.5 h-3.5" />
            Gerenciar Minhas Competências
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200 flex items-start gap-3">
            <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-950 block mb-1">
                O que você oferece para ensinar:
              </span>
              {userTeachSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {userTeachSkills.map((s) => (
                    <span key={s.skillId} className="badge-teach">
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500 italic">
                  Nenhuma habilidade de ensino cadastrada.
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-200 flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-indigo-900 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-950 block mb-1">
                O que você procura aprender:
              </span>
              {userLearnSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {userLearnSkills.map((s) => (
                    <span key={s.skillId} className="badge-learn">
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500 italic">
                  Nenhum objetivo de aprendizado cadastrado.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verificador Client-Side da API Própria GET /api/matches (Receitas 18, 19 e 23) */}
      <MatchesApiVerifier />

      {/* Empty State Guiado caso o estudante ainda não tenha cadastrado habilidades */}
      {!userReady ? (
        <div className="academic-card p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Complete suas competências para liberar o Match Recíproco
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cadastre ao menos uma habilidade que você domina e uma que deseja aprender para liberar sugestões personalizadas de troca.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/skills" className="btn-primary">
              <PlusCircle className="w-4 h-4" />
              Cadastrar Competências Agora
            </Link>
          </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="academic-card p-10 text-center space-y-4">
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Nenhum par direto encontrado para suas disciplinas atuais
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Explore o catálogo completo de estudantes ou adicione novas áreas de interesse ao seu portfólio acadêmico.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/discover" className="btn-primary">
              <Compass className="w-4 h-4" />
              Explorar Catálogo Geral
            </Link>
            <Link href="/skills" className="btn-secondary">
              Adicionar Mais Competências
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Seção 1: Matches Diretos Recíprocos (Peso Alto — Ex.: Felipe <-> Maria) */}
          {directReciprocalMatches.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Prioridade Máxima • Match Direto (A ↔ B)
                  </span>
                  <h2 className="text-xl font-serif font-bold text-slate-900">
                    Reciprocidade Exata de Conhecimentos
                  </h2>
                </div>
                <span className="badge-teach">
                  {directReciprocalMatches.length}{" "}
                  {directReciprocalMatches.length === 1
                    ? "par ideal"
                    : "pares ideais"}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {directReciprocalMatches.map((m) => (
                  <MentorCard
                    key={m.userId}
                    userId={m.userId}
                    name={m.name}
                    institutionOrArea={m.institutionOrArea}
                    city={m.city}
                    bio={m.bio}
                    teachSkills={m.teachSkills}
                    learnSkills={m.learnSkills}
                    averageRating={m.averageRating}
                    reviewsCount={m.reviewsCount}
                    completedExchangesCount={m.completedExchangesCount}
                    distanceKm={m.distanceKm}
                    score={m.score}
                    matchType={m.matchType}
                    matchTypeLabel={m.matchTypeLabel}
                    headline={m.headline}
                    reasons={m.reasons}
                    suggestedOfferedSkillId={m.suggestedOfferedSkill?.id}
                    suggestedRequestedSkillId={m.suggestedRequestedSkill?.id}
                    isAuthenticated={true}
                    myTeachSkills={myTeachOptions}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Seção 2: Matches Complementares por Categoria & Afinidade */}
          {complementaryMatches.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Sinergia Interdisciplinar • Categoria & Afinidade
                  </span>
                  <h2 className="text-xl font-serif font-bold text-slate-900">
                    Mentores Complementares por Área de Estudo
                  </h2>
                </div>
                <span className="badge-learn">
                  {complementaryMatches.length} sugestão(ões)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {complementaryMatches.map((m) => (
                  <MentorCard
                    key={m.userId}
                    userId={m.userId}
                    name={m.name}
                    institutionOrArea={m.institutionOrArea}
                    city={m.city}
                    bio={m.bio}
                    teachSkills={m.teachSkills}
                    learnSkills={m.learnSkills}
                    averageRating={m.averageRating}
                    reviewsCount={m.reviewsCount}
                    completedExchangesCount={m.completedExchangesCount}
                    distanceKm={m.distanceKm}
                    score={m.score}
                    matchType={m.matchType}
                    matchTypeLabel={m.matchTypeLabel}
                    headline={m.headline}
                    reasons={m.reasons}
                    suggestedOfferedSkillId={m.suggestedOfferedSkill?.id}
                    suggestedRequestedSkillId={m.suggestedRequestedSkill?.id}
                    isAuthenticated={true}
                    myTeachSkills={myTeachOptions}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
