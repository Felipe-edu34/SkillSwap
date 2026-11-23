import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { SkillRelationType } from "@prisma/client";

/**
 * Endpoint REST de Consulta ao Catálogo de Habilidades e Mentores (Receitas 19 e 23).
 * Suporta filtros ?q=, ?category= e ?type= (TEACH | LEARN).
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const typeParam = searchParams.get("type")?.trim() || "";

    const validType =
      typeParam === "TEACH" || typeParam === "LEARN"
        ? (typeParam as SkillRelationType)
        : undefined;

    const skills = await prisma.skill.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          category
            ? { category: { equals: category, mode: "insensitive" } }
            : {},
          validType
            ? {
                userSkills: {
                  some: { type: validType },
                },
              }
            : {},
        ],
      },
      include: {
        userSkills: {
          where: validType ? { type: validType } : undefined,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                institutionOrArea: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return Response.json({
      total: skills.length,
      filters: { q, category, type: validType ?? "ALL" },
      skills,
    });
  } catch (err) {
    console.error("[GET /api/skills error]:", err);
    return Response.json(
      { error: "Falha ao consultar catálogo de habilidades." },
      { status: 500 }
    );
  }
}
