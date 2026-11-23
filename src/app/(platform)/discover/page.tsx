import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateHaversineDistanceKm } from "@/lib/geolocation";
import DiscoverFilters from "@/components/matches/DiscoverFilters";
import MentorCard from "@/components/matches/MentorCard";
import { Compass, RotateCcw } from "lucide-react";

export const metadata = {
  title: "Explorar Catálogo de Mentores e Disciplinas",
};

/**
 * Página de Descoberta (/discover) com busca e filtragem no servidor via searchParams
 * (implementando os padrões das Receitas 16 e 17).
 */
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
  }>;
}) {
  const { q = "", category = "", type = "" } = await searchParams;
  const trimmedQ = q.trim();
  const trimmedCategory = category.trim();
  const validType =
    type === "TEACH" || type === "LEARN" ? type : "";

  const currentUser = await getCurrentUser();

  // Busca as habilidades de ensino do usuário logado para popular o modal "Propor Troca"
  let myTeachSkills: Array<{ id: string; name: string }> = [];
  if (currentUser) {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: currentUser.id, type: "TEACH" },
      include: { skill: { select: { id: true, name: true } } },
    });
    myTeachSkills = userSkills.map((us) => ({
      id: us.skill.id,
      name: us.skill.name,
    }));
  }

  // Lista única de categorias disponíveis no catálogo
  const allSkills = await prisma.skill.findMany({
    select: { category: true },
    orderBy: { category: "asc" },
  });
  const categories = Array.from(new Set(allSkills.map((s) => s.category)));

  // Consulta de mentores/estudantes filtrada no servidor a partir dos searchParams
  const users = await prisma.user.findMany({
    where: {
      AND: [
        trimmedQ
          ? {
              OR: [
                { name: { contains: trimmedQ, mode: "insensitive" } },
                {
                  institutionOrArea: {
                    contains: trimmedQ,
                    mode: "insensitive",
                  },
                },
                { city: { contains: trimmedQ, mode: "insensitive" } },
                { bio: { contains: trimmedQ, mode: "insensitive" } },
                {
                  skills: {
                    some: {
                      ...(validType ? { type: validType } : {}),
                      skill: {
                        name: { contains: trimmedQ, mode: "insensitive" },
                      },
                    },
                  },
                },
              ],
            }
          : {},
        trimmedCategory || validType
          ? {
              skills: {
                some: {
                  ...(validType ? { type: validType } : {}),
                  ...(trimmedCategory
                    ? {
                        skill: {
                          category: {
                            equals: trimmedCategory,
                            mode: "insensitive",
                          },
                        },
                      }
                    : {}),
                },
              },
            }
          : {},
      ],
    },
    include: {
      skills: {
        include: { skill: true },
        orderBy: { createdAt: "asc" },
      },
      reviewsReceived: {
        select: { rating: true },
      },
      sentExchanges: {
        where: { status: { in: ["CONCLUIDA", "AVALIADA"] } },
        select: { id: true },
      },
      receivedExchanges: {
        where: { status: { in: ["CONCLUIDA", "AVALIADA"] } },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Formulário de Pesquisa GET via next/form (Receita 17) */}
      <DiscoverFilters
        currentQuery={trimmedQ}
        currentCategory={trimmedCategory}
        currentType={validType}
        categories={categories}
      />

      {/* Resumo dos Resultados */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>
          Exibindo <strong>{users.length}</strong>{" "}
          {users.length === 1
            ? "estudante/mentor encontrado"
            : "estudantes/mentores encontrados"}
          {trimmedQ && ` para "${trimmedQ}"`}
          {trimmedCategory && ` na área de ${trimmedCategory}`}
          {validType === "TEACH" && " (filtrando por quem ensina)"}
          {validType === "LEARN" && " (filtrando por quem quer aprender)"}
        </span>
      </div>

      {/* Grade de Fichas de Mentoria */}
      {users.length === 0 ? (
        <div className="academic-card p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Nenhum colega ou disciplina corresponde aos filtros aplicados
            </h3>
            <p className="text-xs text-slate-600">
              Tente remover o filtro de categoria ou buscar por um termo mais abrangente.
            </p>
          </div>
          <Link href="/discover" className="btn-secondary text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Filtros de Pesquisa
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {users.map((u) => {
            const teachSkills = u.skills
              .filter((us) => us.type === "TEACH")
              .map((us) => ({
                skillId: us.skillId,
                name: us.skill.name,
                category: us.skill.category,
                level: us.level,
                notes: us.notes,
              }));

            const learnSkills = u.skills
              .filter((us) => us.type === "LEARN")
              .map((us) => ({
                skillId: us.skillId,
                name: us.skill.name,
                category: us.skill.category,
                level: us.level,
                notes: us.notes,
              }));

            const reviewsCount = u.reviewsReceived.length;
            const averageRating =
              reviewsCount > 0
                ? Number(
                    (
                      u.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) /
                      reviewsCount
                    ).toFixed(1)
                  )
                : null;

            const distanceKm = currentUser
              ? calculateHaversineDistanceKm(
                  currentUser.latitude,
                  currentUser.longitude,
                  u.latitude,
                  u.longitude
                )
              : null;

            return (
              <MentorCard
                key={u.id}
                userId={u.id}
                name={u.name}
                institutionOrArea={u.institutionOrArea}
                city={u.city}
                bio={u.bio}
                teachSkills={teachSkills}
                learnSkills={learnSkills}
                averageRating={averageRating}
                reviewsCount={reviewsCount}
                completedExchangesCount={
                  u.sentExchanges.length + u.receivedExchanges.length
                }
                distanceKm={distanceKm}
                isAuthenticated={Boolean(currentUser)}
                isCurrentUser={currentUser?.id === u.id}
                myTeachSkills={myTeachSkills}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
