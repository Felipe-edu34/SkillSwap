/**
 * ============================================================================
 * ESQUEMAS DE VALIDAÇÃO CENTRALIZADOS (Zod)
 * Referência Pedagógica: Receita 20 (Validação de dados em Server Actions)
 * ============================================================================
 * Todos os dados submetidos por formulários (`FormData`) passam por estes
 * schemas antes de qualquer operação no PostgreSQL via Prisma.
 */

import { z } from "zod";

// 1. Validação de Cadastro de Novo Estudante / Mentor (/register)
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo (mínimo de 3 caracteres).")
    .max(100, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um endereço de e-mail institucional ou pessoal válido."),
  password: z
    .string()
    .min(6, "A senha deve possuir no mínimo 6 caracteres.")
    .max(72, "A senha deve possuir no máximo 72 caracteres."),
  institutionOrArea: z
    .string()
    .trim()
    .min(2, "Informe seu curso, área de estudo ou instituição.")
    .max(120, "Campo muito longo."),
  city: z
    .string()
    .trim()
    .min(2, "Informe sua cidade/estado (ex.: Natal, RN).")
    .max(100, "Cidade muito longa."),
  bio: z
    .string()
    .trim()
    .max(600, "A biografia acadêmica pode ter no máximo 600 caracteres.")
    .optional()
    .or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

// 2. Validação de Login (/login)
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha de acesso."),
});

// 3. Validação de Cadastro de Competência no Portfólio (/skills)
export const userSkillCreateSchema = z.object({
  skillName: z
    .string()
    .trim()
    .min(2, "O nome da habilidade deve ter ao menos 2 caracteres.")
    .max(80, "Nome da habilidade muito longo."),
  category: z
    .string()
    .trim()
    .min(2, "Selecione uma categoria acadêmica.")
    .max(50, "Categoria inválida."),
  description: z
    .string()
    .trim()
    .max(300, "Descrição curta até 300 caracteres.")
    .optional()
    .or(z.literal("")),
  type: z.enum(["TEACH", "LEARN"], {
    errorMap: () => ({ message: "Selecione se você ensina ou quer aprender." }),
  }),
  level: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"], {
    errorMap: () => ({ message: "Selecione o nível de proficiência." }),
  }),
  notes: z
    .string()
    .trim()
    .max(400, "As observações devem ter no máximo 400 caracteres.")
    .optional()
    .or(z.literal("")),
});

// 4. Validação de Edição de Nível e Ementa de Competência (/skills)
export const userSkillUpdateSchema = z.object({
  userSkillId: z.string().min(1, "Identificador de habilidade inválido."),
  level: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"]),
  notes: z
    .string()
    .trim()
    .max(400, "As observações devem ter no máximo 400 caracteres.")
    .optional()
    .or(z.literal("")),
});

// 5. Validação de Proposta de Troca de Conhecimentos (/matches, /discover, /profiles/[id])
export const exchangeProposalSchema = z.object({
  receiverId: z.string().min(1, "Destinatário da troca é obrigatório."),
  offeredSkillId: z.string().min(1, "Selecione a habilidade que você vai ensinar."),
  requestedSkillId: z.string().min(1, "Selecione a habilidade que você deseja aprender."),
  message: z
    .string()
    .trim()
    .min(10, "Escreva uma mensagem acadêmica apresentando sua proposta (mín. 10 caracteres).")
    .max(600, "A mensagem deve ter no máximo 600 caracteres."),
});

// 6. Validação de Transição da Máquina de 6 Estados (/exchanges)
export const exchangeStatusTransitionSchema = z.object({
  exchangeId: z.string().min(1, "ID da troca é obrigatório."),
  nextStatus: z.enum([
    "SOLICITACAO_ENVIADA",
    "AGUARDANDO_ACEITE",
    "CONFIRMADA",
    "EM_ANDAMENTO",
    "CONCLUIDA",
    "AVALIADA",
  ]),
});

// 7. Validação de Agendamento de Encontro Online ou Presencial (/calendar)
export const meetingCreateSchema = z
  .object({
    exchangeId: z.string().min(1, "Selecione a troca vinculada ao encontro."),
    scheduledAt: z.string().min(1, "Informe a data e horário do encontro."),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(15, "Duração mínima de 15 minutos.")
      .max(360, "Duração máxima de 6 horas."),
    mode: z.enum(["ONLINE", "PRESENCIAL"]),
    locationName: z
      .string()
      .trim()
      .max(160, "Nome do local muito longo.")
      .optional()
      .or(z.literal("")),
    meetingUrl: z
      .string()
      .trim()
      .url("Informe uma URL válida para a sala virtual (ex.: https://meet.google.com/...).")
      .optional()
      .or(z.literal("")),
    latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
    longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Validação condicional conforme a modalidade escolhida
    if (data.mode === "ONLINE" && !data.meetingUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["meetingUrl"],
        message: "Para encontros ONLINE, informe o link da sala de videoconferência.",
      });
    }
    if (data.mode === "PRESENCIAL" && !data.locationName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["locationName"],
        message: "Para encontros PRESENCIAIS, informe o nome do campus, biblioteca ou sala.",
      });
    }
  });

// 8. Validação de Avaliação Pedagógica por Pares (/exchanges -> Etapa 6)
export const reviewCreateSchema = z.object({
  exchangeId: z.string().min(1, "Identificador da troca é obrigatório."),
  rating: z.coerce
    .number()
    .int()
    .min(1, "A nota deve ser entre 1 e 5 estrelas.")
    .max(5, "A nota deve ser entre 1 e 5 estrelas."),
  comment: z
    .string()
    .trim()
    .min(10, "Compartilhe um parecer construtivo com pelo menos 10 caracteres.")
    .max(600, "A avaliação pode ter no máximo 600 caracteres."),
});
