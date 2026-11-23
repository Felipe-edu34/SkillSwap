import { ExchangeStatus } from "@prisma/client";

export interface ExchangeStepMeta {
  status: ExchangeStatus;
  stepNumber: number;
  label: string;
  shortLabel: string;
  description: string;
  actionGuidance: {
    requester: string;
    receiver: string;
  };
}

export const EXCHANGE_STEPS: ExchangeStepMeta[] = [
  {
    status: "SOLICITACAO_ENVIADA",
    stepNumber: 1,
    label: "Solicitação enviada",
    shortLabel: "1. Enviada",
    description:
      "A proposta inicial de intercâmbio foi registrada pelo solicitante.",
    actionGuidance: {
      requester:
        "Proposta enviada. O receptor pode colocá-la em análise ou aceitá-la.",
      receiver:
        "Nova proposta recebida! Marque como 'Em análise (Aguardando aceite)' ou confirme a troca.",
    },
  },
  {
    status: "AGUARDANDO_ACEITE",
    stepNumber: 2,
    label: "Aguardando aceite",
    shortLabel: "2. Aguardando",
    description:
      "O receptor visualizou a proposta e está alinhando a disponibilidade de horários.",
    actionGuidance: {
      requester:
        "O colega está analisando sua proposta. Aguarde a confirmação do aceite.",
      receiver:
        "Confirme o aceite da proposta para liberar o agendamento de encontros.",
    },
  },
  {
    status: "CONFIRMADA",
    stepNumber: 3,
    label: "Confirmada",
    shortLabel: "3. Confirmada",
    description:
      "Ambos os estudantes concordaram com a troca. Pronta para iniciar as sessões de mentoria.",
    actionGuidance: {
      requester:
        "Troca confirmada! Inicie as atividades de estudo ou agende o primeiro encontro.",
      receiver:
        "Troca confirmada! Inicie as atividades de estudo ou agende o primeiro encontro.",
    },
  },
  {
    status: "EM_ANDAMENTO",
    stepNumber: 4,
    label: "Em andamento",
    shortLabel: "4. Em andamento",
    description:
      "As sessões de mentoria online ou presencial estão ocorrendo entre os participantes.",
    actionGuidance: {
      requester:
        "Mentoria ativa. Quando concluírem o ciclo de encontros, marque como concluída.",
      receiver:
        "Mentoria ativa. Quando concluírem o ciclo de encontros, marque como concluída.",
    },
  },
  {
    status: "CONCLUIDA",
    stepNumber: 5,
    label: "Concluída",
    shortLabel: "5. Concluída",
    description:
      "Ciclo de estudos finalizado. Aguardando o registro da avaliação pedagógica pelos pares.",
    actionGuidance: {
      requester:
        "Etapa concluída! Registre sua avaliação de 1 a 5 estrelas para certificar o histórico.",
      receiver:
        "Etapa concluída! Registre sua avaliação de 1 a 5 estrelas para certificar o histórico.",
    },
  },
  {
    status: "AVALIADA",
    stepNumber: 6,
    label: "Avaliada",
    shortLabel: "6. Avaliada",
    description:
      "Intercâmbio concluído e avaliado. Registrado permanentemente no Histórico de Aprendizagem.",
    actionGuidance: {
      requester:
        "Ciclo completo! Esta troca consta no seu Histórico Acadêmico.",
      receiver:
        "Ciclo completo! Esta troca consta no seu Histórico Acadêmico.",
    },
  },
];

export function getStepMeta(status: ExchangeStatus): ExchangeStepMeta {
  return (
    EXCHANGE_STEPS.find((s) => s.status === status) ?? EXCHANGE_STEPS[0]
  );
}

/**
 * Valida se uma transição de estado é permitida e se o usuário atual
 * (solicitante ou receptor) tem autorização para executá-la.
 */
export function validateExchangeTransition(params: {
  currentStatus: ExchangeStatus;
  nextStatus: ExchangeStatus;
  actorUserId: string;
  requesterId: string;
  receiverId: string;
}): { allowed: boolean; reason?: string } {
  const { currentStatus, nextStatus, actorUserId, requesterId, receiverId } =
    params;

  const isRequester = actorUserId === requesterId;
  const isReceiver = actorUserId === receiverId;

  if (!isRequester && !isReceiver) {
    return {
      allowed: false,
      reason: "Apenas os dois estudantes participantes podem atualizar esta troca.",
    };
  }

  switch (currentStatus) {
    case "SOLICITACAO_ENVIADA": {
      if (nextStatus === "AGUARDANDO_ACEITE") {
        if (!isReceiver) {
          return {
            allowed: false,
            reason:
              "Apenas o estudante receptor pode mover a solicitação para 'Aguardando aceite'.",
          };
        }
        return { allowed: true };
      }
      if (nextStatus === "CONFIRMADA") {
        if (!isReceiver) {
          return {
            allowed: false,
            reason: "Apenas o estudante receptor pode aceitar e confirmar a solicitação.",
          };
        }
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "De 'Solicitação enviada', a troca só pode avançar para 'Aguardando aceite' ou 'Confirmada'.",
      };
    }

    case "AGUARDANDO_ACEITE": {
      if (nextStatus === "CONFIRMADA") {
        if (!isReceiver) {
          return {
            allowed: false,
            reason:
              "Apenas o estudante receptor pode confirmar o aceite da troca.",
          };
        }
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "De 'Aguardando aceite', o próximo estado obrigatório é 'Confirmada'.",
      };
    }

    case "CONFIRMADA": {
      if (nextStatus === "EM_ANDAMENTO") {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "De 'Confirmada', a troca deve avançar para 'Em andamento' quando iniciarem os estudos.",
      };
    }

    case "EM_ANDAMENTO": {
      if (nextStatus === "CONCLUIDA") {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "De 'Em andamento', a troca deve avançar para 'Concluída' ao término das sessões.",
      };
    }

    case "CONCLUIDA": {
      if (nextStatus === "AVALIADA") {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          "De 'Concluída', a troca avança para 'Avaliada' mediante registro de avaliação.",
      };
    }

    case "AVALIADA": {
      return {
        allowed: false,
        reason: "Esta troca já atingiu o estado final ('Avaliada').",
      };
    }

    default:
      return { allowed: false, reason: "Transição de estado inválida." };
  }
}

/**
 * Retorna as próximas ações disponíveis na interface para o usuário logado.
 */
export function getAvailableActionsForUser(params: {
  currentStatus: ExchangeStatus;
  actorUserId: string;
  requesterId: string;
  receiverId: string;
}): Array<{
  nextStatus: ExchangeStatus;
  buttonLabel: string;
  variant: "primary" | "emerald" | "secondary";
}> {
  const { currentStatus, actorUserId, requesterId, receiverId } = params;
  const isReceiver = actorUserId === receiverId;
  const isParticipant =
    actorUserId === requesterId || actorUserId === receiverId;

  if (!isParticipant) return [];

  if (currentStatus === "SOLICITACAO_ENVIADA" && isReceiver) {
    return [
      {
        nextStatus: "AGUARDANDO_ACEITE",
        buttonLabel: "Colocar em Análise (Etapa 2)",
        variant: "secondary",
      },
      {
        nextStatus: "CONFIRMADA",
        buttonLabel: "Aceitar e Confirmar Troca",
        variant: "emerald",
      },
    ];
  }

  if (currentStatus === "AGUARDANDO_ACEITE" && isReceiver) {
    return [
      {
        nextStatus: "CONFIRMADA",
        buttonLabel: "Confirmar Aceite da Troca (Etapa 3)",
        variant: "emerald",
      },
    ];
  }

  if (currentStatus === "CONFIRMADA") {
    return [
      {
        nextStatus: "EM_ANDAMENTO",
        buttonLabel: "Iniciar Ciclo de Estudos (Etapa 4)",
        variant: "primary",
      },
    ];
  }

  if (currentStatus === "EM_ANDAMENTO") {
    return [
      {
        nextStatus: "CONCLUIDA",
        buttonLabel: "Marcar Mentoria como Concluída (Etapa 5)",
        variant: "emerald",
      },
    ];
  }

  return [];
}
