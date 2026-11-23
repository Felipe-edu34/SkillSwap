"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewCreateSchema } from "@/lib/validators";

export interface ReviewActionState {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

/**
 * Registra uma avaliação (1 a 5 estrelas + parecer construtivo) para uma troca
 * concluída e avança o status da troca para AVALIADA (Etapa 6).
 * Regra crítica: authorId é extraído estritamente da sessão JWT no servidor.
 */
export async function createReviewAction(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      error: "Sessão expirada. Faça login novamente para registrar sua avaliação.",
    };
  }

  const parsed = reviewCreateSchema.safeParse({
    exchangeId: formData.get("exchangeId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return {
      error: "Verifique a nota e o parecer informados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { exchangeId, rating, comment } = parsed.data;

  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        requester: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    if (!exchange) {
      return { error: "Troca acadêmica não encontrada." };
    }

    const isRequester = exchange.requesterId === currentUser.id;
    const isReceiver = exchange.receiverId === currentUser.id;

    if (!isRequester && !isReceiver) {
      return {
        error: "Apenas os dois estudantes participantes podem avaliar esta troca.",
      };
    }

    if (
      exchange.status !== "CONCLUIDA" &&
      exchange.status !== "AVALIADA"
    ) {
      return {
        error:
          "A avaliação só pode ser registrada após a troca atingir a etapa 'Concluída'.",
      };
    }

    const targetId = isRequester ? exchange.receiverId : exchange.requesterId;
    const targetName = isRequester
      ? exchange.receiver.name
      : exchange.requester.name;

    // Verifica se o usuário já avaliou esta troca (constraint única exchangeId + authorId)
    const existingReview = await prisma.review.findUnique({
      where: {
        exchangeId_authorId: {
          exchangeId,
          authorId: currentUser.id,
        },
      },
    });

    if (existingReview) {
      return {
        error: "Você já registrou seu parecer para este intercâmbio acadêmico.",
      };
    }

    // Transação atômica: cria a avaliação e atualiza o status da troca para AVALIADA (Etapa 6)
    await prisma.$transaction([
      prisma.review.create({
        data: {
          exchangeId,
          authorId: currentUser.id,
          targetId,
          rating,
          comment,
        },
      }),
      prisma.exchange.update({
        where: { id: exchangeId },
        data: { status: "AVALIADA" },
      }),
    ]);

    revalidatePath("/exchanges");
    revalidatePath("/matches");
    revalidatePath("/discover");
    revalidatePath(`/profiles/${targetId}`);
    revalidatePath(`/profiles/${currentUser.id}`);

    return {
      success: true,
      message: `Avaliação enviada para ${targetName}! A troca agora consta como Avaliada no Histórico de Aprendizagem.`,
    };
  } catch (err) {
    console.error("[createReviewAction error]:", err);
    return {
      error: "Não foi possível salvar a avaliação no momento.",
    };
  }
}
