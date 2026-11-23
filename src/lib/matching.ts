import prisma from "@/lib/prisma";
import {
  calculateHaversineDistanceKm,
  calculateProximityBonus,
} from "@/lib/geolocation";

export interface SkillSummary {
  skillId: string;
  name: string;
  category: string;
  level: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  notes: string | null;
}

export interface MatchCandidate {
  userId: string;
  name: string;
  email: string;
  institutionOrArea: string | null;
  city: string | null;
  bio: string | null;
  score: number;
  matchType:
    | "RECIPROCO_DIRETO"
    | "COMPLEMENTAR_CATEGORIA"
    | "AFINIDADE_PARCIAL";
  matchTypeLabel: string;
  headline: string;
  reasons: string[];
  distanceKm: number | null;
  averageRating: number | null;
  reviewsCount: number;
  completedExchangesCount: number;
  teachSkills: SkillSummary[];
  learnSkills: SkillSummary[];
  suggestedOfferedSkill: { id: string; name: string } | null;
  suggestedRequestedSkill: { id: string; name: string } | null;
}

/**
 * Calcula e ordena todos os candidatos compatíveis com o usuário informado.
 * Regras de pontuação:
 * 1. Match Direto Recíproco (Peso Alto): A ensina exatamente o que B quer aprender E B ensina exatamente o que A quer aprender.
 * 2. Match Complementar por Categoria (Peso Médio): Habilidades correlatas dentro da mesma categoria acadêmica (ex.: Python <-> Programação Web).
 * 3. Bônus Geográfico (Haversine): Prioriza colegas próximos para sessões presenciais no campus.
 */
export async function computeMatchesForUser(
  currentUserId: string,
  options?: {
    categoryFilter?: string;
    minScore?: number;
  }
): Promise<{
  userReady: boolean;
  userTeachSkills: SkillSummary[];
  userLearnSkills: SkillSummary[];
  matches: MatchCandidate[];
}> {
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  if (!currentUser) {
    return {
      userReady: false,
      userTeachSkills: [],
      userLearnSkills: [],
      matches: [],
    };
  }

  const myTeach: SkillSummary[] = currentUser.skills
    .filter((us) => us.type === "TEACH")
    .map((us) => ({
      skillId: us.skillId,
      name: us.skill.name,
      category: us.skill.category,
      level: us.level,
      notes: us.notes,
    }));

  const myLearn: SkillSummary[] = currentUser.skills
    .filter((us) => us.type === "LEARN")
    .map((us) => ({
      skillId: us.skillId,
      name: us.skill.name,
      category: us.skill.category,
      level: us.level,
      notes: us.notes,
    }));

  const userReady = myTeach.length > 0 && myLearn.length > 0;

  // Busca todos os demais estudantes/mentores com suas habilidades e avaliações
  const otherUsers = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
    },
    include: {
      skills: {
        include: { skill: true },
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
  });

  const candidates: MatchCandidate[] = [];

  for (const peer of otherUsers) {
    const peerTeach: SkillSummary[] = peer.skills
      .filter((us) => us.type === "TEACH")
      .map((us) => ({
        skillId: us.skillId,
        name: us.skill.name,
        category: us.skill.category,
        level: us.level,
        notes: us.notes,
      }));

    const peerLearn: SkillSummary[] = peer.skills
      .filter((us) => us.type === "LEARN")
      .map((us) => ({
        skillId: us.skillId,
        name: us.skill.name,
        category: us.skill.category,
        level: us.level,
        notes: us.notes,
      }));

    if (peerTeach.length === 0) continue;

    // Filtro opcional por categoria
    if (options?.categoryFilter && options.categoryFilter.trim() !== "") {
      const hasCategory = peer.skills.some(
        (s) =>
          s.skill.category.toLowerCase() ===
          options.categoryFilter!.toLowerCase()
      );
      if (!hasCategory) continue;
    }

    // 1. Verifica Match Direto: Eu ensino o que o colega quer aprender
    const directIProvide = myTeach.filter((mine) =>
      peerLearn.some((theirs) => theirs.skillId === mine.skillId)
    );

    // 2. Verifica Match Direto: O colega ensina o que eu quero aprender
    const directPeerProvides = peerTeach.filter((theirs) =>
      myLearn.some((mine) => mine.skillId === theirs.skillId)
    );

    // 3. Verifica Match por Categoria Complementar (ex.: "Python" conversa com "Programação")
    const categoryIProvide = myTeach.filter((mine) =>
      peerLearn.some(
        (theirs) =>
          theirs.skillId !== mine.skillId &&
          theirs.category.toLowerCase() === mine.category.toLowerCase()
      )
    );

    const categoryPeerProvides = peerTeach.filter((theirs) =>
      myLearn.some(
        (mine) =>
          mine.skillId !== theirs.skillId &&
          mine.category.toLowerCase() === theirs.category.toLowerCase()
      )
    );

    let rawScore = 0;
    let matchType: MatchCandidate["matchType"] = "AFINIDADE_PARCIAL";
    let matchTypeLabel = "Afinidade Parcial";
    const reasons: string[] = [];

    const hasDirectGive = directIProvide.length > 0;
    const hasDirectReceive = directPeerProvides.length > 0;
    const hasCategoryGive = categoryIProvide.length > 0;
    const hasCategoryReceive = categoryPeerProvides.length > 0;

    if (hasDirectGive && hasDirectReceive) {
      // Match Recíproco Direto (Peso Alto — Ex.: Felipe ensina Python <-> Maria ensina Inglês)
      rawScore = 84;
      matchType = "RECIPROCO_DIRETO";
      matchTypeLabel = "Reciprocidade Direta";

      // Bônus por múltiplas skills ou nível avançado
      if (
        directIProvide.some((s) => s.level === "AVANCADO") &&
        directPeerProvides.some((s) => s.level === "AVANCADO")
      ) {
        rawScore += 4;
      }

      reasons.push(
        `Match direto: você ensina ${directIProvide
          .map((s) => s.name)
          .join(", ")} e ${peer.name.split(" ")[0]} ensina ${directPeerProvides
          .map((s) => s.name)
          .join(", ")}.`
      );
    } else if (
      (hasDirectGive && hasCategoryReceive) ||
      (hasCategoryGive && hasDirectReceive)
    ) {
      // Match Híbrido (Direto de um lado + Categoria complementar do outro)
      rawScore = 70;
      matchType = "COMPLEMENTAR_CATEGORIA";
      matchTypeLabel = "Complementar por Área";

      if (hasDirectGive && hasCategoryReceive) {
        reasons.push(
          `Você ensina exatamente ${directIProvide[0].name} e ${
            peer.name.split(" ")[0]
          } domina ${categoryPeerProvides[0].name} (área de ${
            categoryPeerProvides[0].category
          }).`
        );
      } else {
        reasons.push(
          `${peer.name.split(" ")[0]} ensina exatamente ${
            directPeerProvides[0].name
          } e busca conhecimentos na sua área de ${
            categoryIProvide[0].category
          } (${categoryIProvide[0].name}).`
        );
      }
    } else if (hasCategoryGive && hasCategoryReceive) {
      // Match Recíproco por Categoria Complementar
      rawScore = 62;
      matchType = "COMPLEMENTAR_CATEGORIA";
      matchTypeLabel = "Sinergia de Categoria";
      reasons.push(
        `Intercâmbio entre áreas correlatas: ${categoryIProvide[0].name} (${categoryIProvide[0].category}) ↔ ${categoryPeerProvides[0].name} (${categoryPeerProvides[0].category}).`
      );
    } else if (hasDirectReceive) {
      // Colega ensina diretamente o que o usuário procura
      rawScore = 48;
      matchType = "AFINIDADE_PARCIAL";
      matchTypeLabel = "Mentor da Disciplina";
      reasons.push(
        `${peer.name.split(" ")[0]} ensina ${directPeerProvides
          .map((s) => s.name)
          .join(", ")}, que está nos seus objetivos de estudo.`
      );
    } else if (hasDirectGive) {
      // Usuário ensina diretamente o que o colega procura
      rawScore = 44;
      matchType = "AFINIDADE_PARCIAL";
      matchTypeLabel = "Interesse na sua Mentoria";
      reasons.push(
        `${peer.name.split(" ")[0]} procura aprender ${directIProvide
          .map((s) => s.name)
          .join(", ")}, competência que você ensina.`
      );
    } else {
      // Sem conexão direta nem complementar relevante
      continue;
    }

    // Cálculo de Proximidade Geográfica (Fórmula de Haversine)
    const distanceKm = calculateHaversineDistanceKm(
      currentUser.latitude,
      currentUser.longitude,
      peer.latitude,
      peer.longitude
    );

    const proximity = calculateProximityBonus(distanceKm);
    rawScore += proximity.bonus;

    if (proximity.label) {
      reasons.push(proximity.label);
    } else if (
      currentUser.city &&
      peer.city &&
      currentUser.city.toLowerCase() === peer.city.toLowerCase()
    ) {
      rawScore += 6;
      reasons.push(`Mesma cidade (${peer.city})`);
    }

    // Nota média e histórico
    const reviewsCount = peer.reviewsReceived.length;
    const averageRating =
      reviewsCount > 0
        ? Number(
            (
              peer.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) /
              reviewsCount
            ).toFixed(1)
          )
        : null;

    const completedExchangesCount =
      peer.sentExchanges.length + peer.receivedExchanges.length;

    const finalScore = Math.min(99, Math.max(25, Math.round(rawScore)));

    if (options?.minScore && finalScore < options.minScore) {
      continue;
    }

    const bestOffered =
      directIProvide[0] || categoryIProvide[0] || myTeach[0] || null;
    const bestRequested =
      directPeerProvides[0] || categoryPeerProvides[0] || peerTeach[0] || null;

    const headline =
      bestOffered && bestRequested
        ? `Você ensina ${bestOffered.name} • ${
            peer.name.split(" ")[0]
          } ensina ${bestRequested.name}`
        : bestRequested
        ? `${peer.name.split(" ")[0]} ensina ${bestRequested.name}`
        : `Intercâmbio acadêmico com ${peer.name}`;

    candidates.push({
      userId: peer.id,
      name: peer.name,
      email: peer.email,
      institutionOrArea: peer.institutionOrArea,
      city: peer.city,
      bio: peer.bio,
      score: finalScore,
      matchType,
      matchTypeLabel,
      headline,
      reasons,
      distanceKm,
      averageRating,
      reviewsCount,
      completedExchangesCount,
      teachSkills: peerTeach,
      learnSkills: peerLearn,
      suggestedOfferedSkill: bestOffered
        ? { id: bestOffered.skillId, name: bestOffered.name }
        : null,
      suggestedRequestedSkill: bestRequested
        ? { id: bestRequested.skillId, name: bestRequested.name }
        : null,
    });
  }

  // Ordenação determinística: maior score -> RECIPROCO_DIRETO -> menor distância
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }
    return a.name.localeCompare(b.name);
  });

  return {
    userReady,
    userTeachSkills: myTeach,
    userLearnSkills: myLearn,
    matches: candidates,
  };
}
