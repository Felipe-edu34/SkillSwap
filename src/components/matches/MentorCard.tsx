import Link from "next/link";
import {
  MapPin,
  Star,
  GraduationCap,
  BookOpen,
  Sparkles,
  UserCheck,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { formatDistanceKm } from "@/lib/geolocation";
import ProposeExchangeModal, {
  type SkillOption,
} from "@/components/matches/ProposeExchangeModal";
import type { SkillSummary } from "@/lib/matching";

export interface MentorCardProps {
  userId: string;
  name: string;
  institutionOrArea: string | null;
  city: string | null;
  bio: string | null;
  teachSkills: SkillSummary[];
  learnSkills: SkillSummary[];
  averageRating: number | null;
  reviewsCount: number;
  completedExchangesCount?: number;
  distanceKm?: number | null;
  // Campos opcionais de Match (presentes em /matches e quando logado)
  score?: number;
  matchType?:
    | "RECIPROCO_DIRETO"
    | "COMPLEMENTAR_CATEGORIA"
    | "AFINIDADE_PARCIAL";
  matchTypeLabel?: string;
  headline?: string;
  reasons?: string[];
  suggestedOfferedSkillId?: string | null;
  suggestedRequestedSkillId?: string | null;
  // Contexto do usuário logado para habilitar o modal "Propor Troca"
  isAuthenticated: boolean;
  isCurrentUser?: boolean;
  myTeachSkills: SkillOption[];
}

const LEVEL_SHORT: Record<SkillSummary["level"], string> = {
  INICIANTE: "Inic.",
  INTERMEDIARIO: "Interm.",
  AVANCADO: "Avançado",
};

export default function MentorCard({
  userId,
  name,
  institutionOrArea,
  city,
  bio,
  teachSkills,
  learnSkills,
  averageRating,
  reviewsCount,
  completedExchangesCount = 0,
  distanceKm = null,
  score,
  matchType,
  matchTypeLabel,
  headline,
  reasons,
  suggestedOfferedSkillId,
  suggestedRequestedSkillId,
  isAuthenticated,
  isCurrentUser = false,
  myTeachSkills,
}: MentorCardProps) {
  const formattedDistance = formatDistanceKm(distanceKm);
  const peerTeachOptions: SkillOption[] = teachSkills.map((s) => ({
    id: s.skillId,
    name: s.name,
  }));

  const isTopReciprocal = matchType === "RECIPROCO_DIRETO";

  return (
    <article
      className={`academic-card academic-card-hover p-6 flex flex-col justify-between space-y-5 ${
        isTopReciprocal ? "ring-1 ring-emerald-600/30 border-emerald-300" : ""
      }`}
    >
      <div className="space-y-4">
        {/* Cabeçalho da Ficha de Mentoria */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-900 text-white font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/profiles/${userId}`}
                  className="text-lg font-serif font-bold text-slate-900 hover:text-indigo-900 transition-colors truncate"
                >
                  {name}
                </Link>
                {isCurrentUser && (
                  <span className="badge-neutral text-[10px] py-0.5">Você</span>
                )}
              </div>

              <p className="text-xs font-medium text-indigo-900 truncate mt-0.5">
                {institutionOrArea || "Pesquisador / Estudante Universitário"}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                {city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {city}
                  </span>
                )}
                {formattedDistance && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    • a {formattedDistance}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Selo de Compatibilidade (%) + Avaliação Média */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {score !== undefined && (
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                  score >= 80
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : score >= 60
                    ? "bg-indigo-50 text-indigo-900 border-indigo-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{score}% Match</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {averageRating ? (
                <span>
                  {averageRating.toFixed(1)}{" "}
                  <span className="text-slate-500 font-normal">
                    ({reviewsCount})
                  </span>
                </span>
              ) : (
                <span className="text-slate-500 font-normal">Novo mentor</span>
              )}
            </div>
          </div>
        </div>

        {/* Bloco Explicativo do Porquê Houve Match */}
        {headline && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              isTopReciprocal
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-indigo-50/60 border-indigo-200 text-indigo-950"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    isTopReciprocal ? "text-emerald-700" : "text-indigo-900"
                  }`}
                />
                {headline}
              </span>
              {matchTypeLabel && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700 shrink-0">
                  {matchTypeLabel}
                </span>
              )}
            </div>

            {reasons && reasons.length > 0 && (
              <ul className="space-y-0.5 text-[11px] text-slate-600 pl-5 list-disc">
                {reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Biografia Acadêmica Curta */}
        {bio && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {bio}
          </p>
        )}

        {/* Duas Seções Claramente Separadas: "Pode ensinar" vs. "Quer aprender" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Seção 1: Pode Ensinar */}
          <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pode Ensinar</span>
            </div>
            {teachSkills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Não informado</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {teachSkills.map((s) => (
                  <span key={s.skillId} className="badge-teach">
                    {s.name}
                    <span className="text-[10px] opacity-75">
                      • {LEVEL_SHORT[s.level]}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Seção 2: Quer Aprender */}
          <div className="p-3 rounded-lg bg-indigo-50/40 border border-indigo-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-900">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Quer Aprender</span>
            </div>
            {learnSkills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Não informado</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {learnSkills.map((s) => (
                  <span key={s.skillId} className="badge-learn">
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé do Card: Link de Histórico Acadêmico + Botão Propor Troca */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
        <Link
          href={`/profiles/${userId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-900 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-900" />
          Histórico Acadêmico
          {completedExchangesCount > 0 && (
            <span className="text-slate-400 font-normal">
              ({completedExchangesCount} concluída
              {completedExchangesCount > 1 ? "s" : ""})
            </span>
          )}
        </Link>

        {!isCurrentUser &&
          (isAuthenticated ? (
            <ProposeExchangeModal
              receiverId={userId}
              receiverName={name}
              myTeachSkills={myTeachSkills}
              peerTeachSkills={peerTeachOptions}
              defaultOfferedSkillId={suggestedOfferedSkillId}
              defaultRequestedSkillId={suggestedRequestedSkillId}
              buttonLabel={score ? "Solicitar Troca" : "Propor Troca"}
            />
          ) : (
            <Link
              href={`/login?callbackUrl=/profiles/${userId}`}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar para Propor Troca
            </Link>
          ))}
      </div>
    </article>
  );
}
