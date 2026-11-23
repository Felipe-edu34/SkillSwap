/**
 * ============================================================================
 * MIDDLEWARE DE PROTEÇÃO DE ROTAS NO EDGE RUNTIME
 * ============================================================================
 * Intercepta requisições antes mesmo da página ser renderizada:
 * 1. Se o usuário tentar acessar uma rota privada (/skills, /matches, /exchanges, /calendar)
 *    sem um token JWT válido no cookie HttpOnly, é redirecionado para /login.
 * 2. Se o usuário já estiver autenticado e acessar /login ou /register,
 *    é redirecionado automaticamente para /matches.
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "skillswap_session";

// Prefixos de rotas privadas que exigem sessão autenticada
const PROTECTED_PREFIXES = [
  "/skills",
  "/matches",
  "/exchanges",
  "/calendar",
];

// Rotas exclusivas para visitantes não autenticados
const AUTH_ROUTES = ["/login", "/register"];

function getJwtSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "skillswap-academic-super-secret-jwt-key-2026-change-in-production";
  return new TextEncoder().encode(secret);
}

/**
 * Verifica a assinatura criptográfica e a validade temporal do JWT no Edge.
 */
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return Boolean(payload.sub);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const authenticated = await isAuthenticated(request);

  // Caso 1: Rota protegida acessada sem login -> Redireciona para /login guardando callbackUrl
  if (isProtectedRoute && !authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Caso 2: Usuário já autenticado tentando acessar /login ou /register -> Redireciona ao painel
  if (isAuthRoute && authenticated) {
    return NextResponse.redirect(new URL("/matches", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/skills/:path*",
    "/matches/:path*",
    "/exchanges/:path*",
    "/calendar/:path*",
    "/login",
    "/register",
  ],
};
