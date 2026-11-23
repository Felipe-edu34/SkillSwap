"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  userSkillCreateSchema,
  userSkillUpdateSchema,
} from "@/lib/validators";

export interface SkillActionState {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

/**
 * Cria um vínculo UserSkill (TEACH ou LEARN) para o usuário autenticado.
 * Caso a habilidade ainda não exista no catálogo global (Skill), cria-a automaticamente.
 */
export async function createUserSkillAction(
  _prevState: SkillActionState,
  formData: FormData
): Promise<SkillActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      error: "Sessão expirada. Faça login novamente para gerenciar suas habilidades.",
    };
  }

  const parsed = userSkillCreateSchema.safeParse({
    skillName: formData.get("skillName"),
    category: formData.get("category"),
    description: formData.get("description") || "",
    type: formData.get("type"),
    level: formData.get("level"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return {
      error: "Verifique os dados informados para a habilidade.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { skillName, category, description, type, level, notes } = parsed.data;

  try {
    // 1. Busca habilidade existente (case-insensitive) ou cria no catálogo global
    let skill = await prisma.skill.findFirst({
      where: {
        name: {
          equals: skillName,
          mode: "insensitive",
        },
      },
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name: skillName,
          category,
          description:
            description ||
            `Competência acadêmica na área de ${category}: ${skillName}.`,
        },
      });
    }

    // 2. Verifica duplicidade para o par (userId + skillId + type)
    const existingRelation = await prisma.userSkill.findUnique({
      where: {
        userId_skillId_type: {
          userId: currentUser.id,
          skillId: skill.id,
          type,
        },
      },
    });

    if (existingRelation) {
      return {
        error: `Você já cadastrou "${skill.name}" na sua lista de ${
          type === "TEACH" ? "ensino (mentoria)" : "aprendizado"
        }.`,
      };
    }

    // 3. Cria o vínculo UserSkill associado ao usuário da sessão
    await prisma.userSkill.create({
      data: {
        userId: currentUser.id,
        skillId: skill.id,
        type,
        level,
        notes: notes || null,
      },
    });

    revalidatePath("/skills");
    revalidatePath("/matches");
    revalidatePath("/discover");
    revalidatePath(`/profiles/${currentUser.id}`);

    return {
      success: true,
      message: `Habilidade "${skill.name}" adicionada com sucesso ao seu portfólio!`,
    };
  } catch (err) {
    console.error("[createUserSkillAction error]:", err);
    return {
      error: "Não foi possível salvar a habilidade. Tente novamente.",
    };
  }
}

/**
 * Atualiza o nível de proficiência e observações de uma habilidade do usuário logado.
 */
export async function updateUserSkillAction(
  _prevState: SkillActionState,
  formData: FormData
): Promise<SkillActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const parsed = userSkillUpdateSchema.safeParse({
    userSkillId: formData.get("userSkillId"),
    level: formData.get("level"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return {
      error: "Dados de atualização inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { userSkillId, level, notes } = parsed.data;

  try {
    // Garante que o registro pertence estritamente ao usuário da sessão
    const userSkill = await prisma.userSkill.findUnique({
      where: { id: userSkillId },
      include: { skill: true },
    });

    if (!userSkill || userSkill.userId !== currentUser.id) {
      return {
        error: "Permissão negada ou registro de habilidade não encontrado.",
      };
    }

    await prisma.userSkill.update({
      where: { id: userSkillId },
      data: {
        level,
        notes: notes || null,
      },
    });

    revalidatePath("/skills");
    revalidatePath("/matches");
    revalidatePath("/discover");
    revalidatePath(`/profiles/${currentUser.id}`);

    return {
      success: true,
      message: `Competência "${userSkill.skill.name}" atualizada.`,
    };
  } catch (err) {
    console.error("[updateUserSkillAction error]:", err);
    return {
      error: "Erro ao atualizar habilidade.",
    };
  }
}

/**
 * Remove uma habilidade vinculada ao usuário logado.
 */
export async function deleteUserSkillAction(
  userSkillId: string
): Promise<SkillActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  if (!userSkillId) {
    return { error: "Identificador inválido." };
  }

  try {
    const userSkill = await prisma.userSkill.findUnique({
      where: { id: userSkillId },
      include: { skill: true },
    });

    if (!userSkill || userSkill.userId !== currentUser.id) {
      return {
        error: "Você não tem permissão para remover este registro.",
      };
    }

    await prisma.userSkill.delete({
      where: { id: userSkillId },
    });

    revalidatePath("/skills");
    revalidatePath("/matches");
    revalidatePath("/discover");
    revalidatePath(`/profiles/${currentUser.id}`);

    return {
      success: true,
      message: `"${userSkill.skill.name}" foi removida do seu portfólio.`,
    };
  } catch (err) {
    console.error("[deleteUserSkillAction error]:", err);
    return {
      error: "Erro ao remover habilidade.",
    };
  }
}
