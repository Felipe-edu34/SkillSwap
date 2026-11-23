import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  calculateHaversineDistanceKm,
  formatDistanceKm,
} from "@/lib/geolocation";
import ProposeExchangeModal from "@/components/matches/ProposeExchangeModal";
import {
  GraduationCap,
  BookOpen,
  MapPin,
  Star,
  Award,
  Calendar,
  ArrowLeftRight,
  MessageSquareQuote,
  Pencil,
} from "lucide-react";

/**
 * Geração Estática de Parâmetros para Rotas Dinâmicas (Receita 21).
 * Pré-indexa os identificadores dos perfis existentes no build, mantendo
 * suporte dinâmico para novos estudantes cadastrados em tempo de execução.
 */
export async function generateStaticParams() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
      take: 25,
    });
    return users.map((u) => ({ id: u.id }));
  } catch {
    return [];
  }
}

const LEVEL_BADGE: Record<
  "INICIANTE" | "INTERMEDIARIO" | "AVANCADO",
  string
> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Desestruturação assíncrona do parâmetro de rota dinâmica (Receita 21)
  const { id } = await params;

  const [profile, currentUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        skills: {
          include: { skill: true },
          orderBy: { createdAt: "asc" },
        },
        reviewsReceived: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                institutionOrArea: true,
              },
            },
            exchange: {
              include: {
                offeredSkill: { select: { name: true } },
                requestedSkill: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        sentExchanges: {
          where: { status: { in: ["CONCLUIDA", "AVALIADA"] } },
          include: {
            receiver: {
              select: { id: true, name: true, institutionOrArea: true },
            },
            offeredSkill: { select: { name: true, category: true } },
            requestedSkill: { select: { name: true, category: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
        receivedExchanges: {
          where: { status: { in: ["CONCLUIDA", "AVALIADA"] } },
          include: {
            requester: {
              select: { id: true, name: true, institutionOrArea: true },
            },
            offeredSkill: { select: { name: true, category: true } },
            requestedSkill: { select: { name: true, category: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!profile) {
    notFound();
  }

  let myTeachSkills: Array<{ id: string; name: string }> = [];
  if (currentUser && currentUser.id !== profile.id) {
    const mySkills = await prisma.userSkill.findMany({
      where: { userId: currentUser.id, type: "TEACH" },
      include: { skill: { select: { id: true, name: true } } },
    });
    myTeachSkills = mySkills.map((s) => ({
      id: s.skill.id,
      name: s.skill.name,
    }));
  }

  const teachSkills = profile.skills.filter((s) => s.type === "TEACH");
  const learnSkills = profile.skills.filter((s) => s.type === "LEARN");

  const reviewsCount = profile.reviewsReceived.length;
  const averageRating =
    reviewsCount > 0
      ? Number(
          (
            profile.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) /
            reviewsCount
          ).toFixed(1)
        )
      : null;

  const distanceKm =
    currentUser && currentUser.id !== profile.id
      ? calculateHaversineDistanceKm(
          currentUser.latitude,
          currentUser.longitude,
          profile.latitude,
          profile.longitude
        )
      : null;

  // Unifica o Histórico de Aprendizagem (trocas CONCLUIDAS e AVALIADAS)
  const learningHistory = [
    ...profile.sentExchanges.map((ex) => ({
      id: ex.id,
      status: ex.status,
      completedAt: ex.updatedAt,
      partner: ex.receiver,
      taughtSkill: ex.offeredSkill,
      learnedSkill: ex.requestedSkill,
    })),
    ...profile.receivedExchanges.map((ex) => ({
      id: ex.id,
      status: ex.status,
      completedAt: ex.updatedAt,
      partner: ex.requester,
      taughtSkill: ex.requestedSkill,
      learnedSkill: ex.offeredSkill,
    })),
  ].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="space-y-8">
      {/* 1. Cabeçalho Institucional do Estudante / Mentor */}
      <section className="academic-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-900 text-white font-serif font-bold text-2xl flex items-center justify-center shrink-0 shadow-xs">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  {profile.name}
                </h1>
                {isOwnProfile && (
                  <span className="badge-neutral">Seu Currículo Acadêmico</span>
                )}
              </div>

              <p className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                {profile.institutionOrArea || "Comunidade Acadêmica SkillSwap"}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                {profile.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.city}
                  </span>
                )}
                {distanceKm !== null && (
                  <span className="text-emerald-700 font-semibold">
                    • Distância Haversine: {formatDistanceKm(distanceKm)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Membro desde{" "}
                  {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Métricas e Botão de Ação */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start">
            <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <div className="flex items-center justify-center gap-1 text-sm font-bold text-amber-800">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{averageRating ? averageRating.toFixed(1) : "—"}</span>
              </div>
              <span className="text-[10px] font-medium text-amber-700 block">
                {reviewsCount} avaliação(ões)
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-sm font-bold text-emerald-800">
                {learningHistory.length}
              </div>
              <span className="text-[10px] font-medium text-emerald-700 block">
                Trocas certificadas
              </span>
            </div>

            {isOwnProfile ? (
              <Link href="/skills" className="btn-secondary text-xs py-2.5">
                <Pencil className="w-3.5 h-3.5" />
                Editar Competências
              </Link>
            ) : currentUser ? (
              <ProposeExchangeModal
                receiverId={profile.id}
                receiverName={profile.name}
                myTeachSkills={myTeachSkills}
                peerTeachSkills={teachSkills.map((t) => ({
                  id: t.skill.id,
                  name: t.skill.name,
                }))}
                buttonLabel="Propor Troca Acadêmica"
                buttonClassName="btn-primary text-xs py-2.5 px-4"
              />
            ) : (
              <Link
                href={`/login?callbackUrl=/profiles/${profile.id}`}
                className="btn-primary text-xs py-2.5"
              >
                Entrar para Propor Troca
              </Link>
            )}
          </div>
        </div>

        {/* Biografia */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
          {profile.bio ||
            "Este estudante ainda não adicionou uma apresentação acadêmica detalhada."}
        </div>
      </section>

      {/* 2. Grade de Competências com Nível (Iniciante, Intermediário, Avançado) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competências que Ensina */}
        <section className="academic-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-slate-900">
                  Pode Ensinar (Mentoria)
                </h2>
                <p className="text-xs text-slate-500">
                  Disciplinas ofertadas para troca
                </p>
              </div>
            </div>
            <span className="badge-teach">{teachSkills.length}</span>
          </div>

          {teachSkills.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">
              Nenhuma competência de ensino registrada.
            </p>
          ) : (
            <div className="space-y-3">
              {teachSkills.map((us) => (
                <div
                  key={us.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-sm text-slate-900">
                      {us.skill.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="badge-neutral text-[10px] py-0.5">
                        {us.skill.category}
                      </span>
                      <span className="badge-teach text-[11px] py-0.5">
                        {LEVEL_BADGE[us.level]}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    {us.notes || us.skill.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Competências que Quer Aprender */}
        <section className="academic-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-slate-900">
                  Quer Aprender (Interesses)
                </h2>
                <p className="text-xs text-slate-500">
                  Objetivos atuais de desenvolvimento
                </p>
              </div>
            </div>
            <span className="badge-learn">{learnSkills.length}</span>
          </div>

          {learnSkills.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">
              Nenhum objetivo de aprendizado listado.
            </p>
          ) : (
            <div className="space-y-3">
              {learnSkills.map((us) => (
                <div
                  key={us.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-sm text-slate-900">
                      {us.skill.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="badge-neutral text-[10px] py-0.5">
                        {us.skill.category}
                      </span>
                      <span className="badge-learn text-[11px] py-0.5">
                        Base: {LEVEL_BADGE[us.level]}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    {us.notes || us.skill.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 3. Histórico de Aprendizagem (Registro/Certificado de Trocas Concluídas) */}
      <section className="academic-card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Histórico de Aprendizagem & Certificação por Pares
              </h2>
              <p className="text-xs text-slate-500">
                Registro oficial de intercâmbios concluídos e avaliados na plataforma
              </p>
            </div>
          </div>
          <span className="badge-teach">
            {learningHistory.length} registro(s)
          </span>
        </div>

        {learningHistory.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-1">
            <p className="text-sm font-semibold text-slate-700">
              Nenhuma troca concluída até o momento
            </p>
            <p className="text-xs text-slate-500">
              Assim que um ciclo de mentoria atingir as etapas &ldquo;Concluída&rdquo; ou &ldquo;Avaliada&rdquo;, ele será certificado neste histórico.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningHistory.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {record.status === "AVALIADA"
                      ? "Certificada & Avaliada"
                      : "Concluída"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(record.completedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <span className="badge-teach">
                    Ensinou: {record.taughtSkill.name}
                  </span>
                  <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="badge-learn">
                    Aprendeu: {record.learnedSkill.name}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Parceiro(a):{" "}
                    <Link
                      href={`/profiles/${record.partner.id}`}
                      className="font-semibold text-indigo-900 hover:underline"
                    >
                      {record.partner.name}
                    </Link>
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    {record.partner.institutionOrArea}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Bloco de Pareceres e Avaliações Recebidas */}
      <section className="academic-card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Pareceres Acadêmicos Recebidos
              </h2>
              <p className="text-xs text-slate-500">
                Avaliações qualitativas registradas após a conclusão das mentorias
              </p>
            </div>
          </div>
        </div>

        {profile.reviewsReceived.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">
            Este estudante ainda não recebeu avaliações em trocas concluídas.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.reviewsReceived.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/profiles/${review.author.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-indigo-900"
                    >
                      {review.author.name}
                    </Link>
                    <p className="text-[11px] text-slate-500">
                      {review.author.institutionOrArea}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{review.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{review.comment}&rdquo;
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Troca: {review.exchange.offeredSkill.name} ↔{" "}
                    {review.exchange.requestedSkill.name}
                  </span>
                  <span>
                    {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
