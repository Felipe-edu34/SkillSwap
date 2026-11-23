/**
 * ============================================================================
 * MÓDULO DE AUTENTICAÇÃO E SESSÃO SEGURA (JWT em Cookie HttpOnly)
 * ============================================================================
 * Responsável por:
 * 1. Assinar tokens JWT com algoritmo HS256 usando a biblioteca `jose` (compatível com Edge).
 * 2. Gravar e remover o cookie `HttpOnly` (`skillswap_session`) inacessível via JavaScript no cliente.
 * 3. Extrair com segurança o usuário autenticado no servidor (`getCurrentUser` / `requireCurrentUser`).
 *
 * REGRA CRÍTICA DE SEGURANÇA:
 * Nenhuma Server Action ou Route Handler confia em `userId` enviado pelo navegador.
 * O identificador do estudante é sempre extraído do claim `sub` do JWT validado no servidor.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "skillswap_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 dias de validade

export interface SessionPayload {
  sub: string; // ID único do usuário no banco de dados
  name: string;
  email: string;
  institutionOrArea?: string | null;
}

/**
 * Converte a chave secreta do ambiente (`JWT_SECRET`) para Uint8Array exigido pela biblioteca `jose`.
 */
function getJwtSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "skillswap-academic-super-secret-jwt-key-2026-change-in-production";
  return new TextEncoder().encode(secret);
}

/**
 * Gera e assina um token JWT para a sessão do estudante autenticado.
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    name: payload.name,
    email: payload.email,
    institutionOrArea: payload.institutionOrArea ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecretKey());
}

/**
 * Valida a assinatura e expiração de um token JWT recebido.
 * Retorna o payload decodificado ou `null` caso seja inválido/expirado.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (!payload.sub || typeof payload.sub !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      institutionOrArea:
        typeof payload.institutionOrArea === "string"
          ? payload.institutionOrArea
          : null,
    };
  } catch {
    return null;
  }
}

/**
 * Armazena o JWT em um cookie HttpOnly seguro na resposta HTTP.
 */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Remove o cookie de sessão durante o logout.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Extrai o payload JWT diretamente do cookie HttpOnly no servidor.
 */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Busca no PostgreSQL os dados atualizados do usuário autenticado na sessão atual.
 */
export async function getCurrentUser() {
  const session = await getSessionPayload();
  if (!session?.sub) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      institutionOrArea: true,
      city: true,
      latitude: true,
      longitude: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Exige que o usuário esteja autenticado em um Server Component.
 * Caso contrário, interrompe a execução e redireciona para `/login`.
 */
export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
