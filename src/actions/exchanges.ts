"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  exchangeProposalSchema,
  exchangeStatusTransitionSchema,
} from "@/lib/validators";
import { validateExchangeTransition } from "@/lib/exchange-state";

export interface ExchangeActionState {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

/**
 * Cria uma nova solicitação de troca de conhecimentos (Estado 1: SOLICITACAO_ENVIADA).
 * Extrai estritamente o requesterId a partir da sessão JWT HttpOnly no servidor.
 */
export async function createExchangeProposalAction(
  _prevState: ExchangeActionState,
  formData: FormData
): Promise<ExchangeActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      error: "Você precisa estar autenticado para propor uma troca acadêmica.",
    };
  }

  const parsed = exchangeProposalSchema.safeParse({
    receiverId: formData.get("receiverId"),
    offeredSkillId: formData.get("offeredSkillId"),
    requestedSkillId: formData.get("requestedSkillId"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      error: "Verifique os campos da proposta de intercâmbio.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { receiverId, offeredSkillId, requestedSkillId, message } = parsed.data;

  if (receiverId === currentUser.id) {
    return {
      error: "Você não pode enviar uma proposta de troca para seu próprio perfil.",
    };
  }

  try {
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true },
    });

    if (!receiver) {
      return { error: "Estudante destinatário não encontrado." };
    }

    // Evita propostas duplicadas em aberto para o mesmo par de habilidades
    const existingActive = await prisma.exchange.findFirst({
      where: {
        requesterId: currentUser.id,
        receiverId,
        offeredSkillId,
        requestedSkillId,
        status: {
          in: [
            "SOLICITACAO_ENVIADA",
            "AGUARDANDO_ACEITE",
            "CONFIRMADA",
            "EM_ANDAMENTO",
          ],
        },
      },
    });

    if (existingActive) {
      return {
        error: `Você já possui uma troca ativa com ${receiver.name} para estas mesmas disciplinas.`,
      };
    }

    await prisma.exchange.create({
      data: {
        requesterId: currentUser.id,
        receiverId,
        offeredSkillId,
        requestedSkillId,
        status: "SOLICITACAO_ENVIADA",
        message,
      },
    });

    revalidatePath("/exchanges");
    revalidatePath("/matches");
    revalidatePath("/discover");
    revalidatePath(`/profiles/${receiverId}`);

    return {
      success: true,
      message: `Solicitação enviada para ${receiver.name}! Acompanhe o andamento em Painel de Trocas.`,
    };
  } catch (err) {
    console.error("[createExchangeProposalAction error]:", err);
    return {
      error: "Não foi possível registrar a solicitação de troca.",
    };
  }
}

/**
 * Avança o status de uma troca respeitando estritamente a máquina de 6 estados
 * e o papel do participante logado (solicitante ou receptor).
 */
export async function advanceExchangeStatusAction(
  formData: FormData
): Promise<ExchangeActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const parsed = exchangeStatusTransitionSchema.safeParse({
    exchangeId: formData.get("exchangeId"),
    nextStatus: formData.get("nextStatus"),
  });

  if (!parsed.success) {
    return { error: "Parâmetros de transição inválidos." };
  }

  const { exchangeId, nextStatus } = parsed.data;

  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
    });

    if (!exchange) {
      return { error: "Registro de troca não encontrado." };
    }

    const validation = validateExchangeTransition({
      currentStatus: exchange.status,
      nextStatus,
      actorUserId: currentUser.id,
      requesterId: exchange.requesterId,
      receiverId: exchange.receiverId,
    });

    if (!validation.allowed) {
      return {
        error: validation.reason || "Transição não autorizada.",
      };
    }

    await prisma.exchange.update({
      where: { id: exchangeId },
      data: { status: nextStatus },
    });

    revalidatePath("/exchanges");
    revalidatePath("/calendar");
    revalidatePath(`/profiles/${exchange.requesterId}`);
    revalidatePath(`/profiles/${exchange.receiverId}`);

    return {
      success: true,
      message: "Status da troca atualizado com sucesso.",
    };
  } catch (err) {
    console.error("[advanceExchangeStatusAction error]:", err);
    return {
      error: "Falha ao atualizar status da troca.",
    };
  }
}
