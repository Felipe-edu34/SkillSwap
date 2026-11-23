import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { computeMatchesForUser } from "@/lib/matching";

/**
 * Endpoint REST de Compatibilidade Acadêmica (Receitas 19, 22 e 23).
 * Extrai o usuário autenticado a partir da sessão JWT HttpOnly no servidor
 * e processa parâmetros opcionais via request.nextUrl.searchParams.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          error:
            "Autenticação necessária. Faça login para calcular seus matches acadêmicos.",
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;
    const minScoreParam = searchParams.get("minScore");
    const minScore = minScoreParam ? Number(minScoreParam) : undefined;

    const result = await computeMatchesForUser(user.id, {
      categoryFilter: category,
      minScore:
        minScore !== undefined && !Number.isNaN(minScore)
          ? minScore
          : undefined,
    });

    return Response.json({
      authenticatedUser: {
        id: user.id,
        name: user.name,
        city: user.city,
        institutionOrArea: user.institutionOrArea,
      },
      ...result,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[GET /api/matches error]:", err);
    return Response.json(
      { error: "Falha ao calcular compatibilidade acadêmica." },
      { status: 500 }
    );
  }
}
