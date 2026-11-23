"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/validators";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";

export interface AuthActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawLat = formData.get("latitude");
  const rawLng = formData.get("longitude");

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    institutionOrArea: formData.get("institutionOrArea"),
    city: formData.get("city"),
    bio: formData.get("bio") || "",
    latitude: rawLat && String(rawLat).trim() !== "" ? Number(rawLat) : null,
    longitude: rawLng && String(rawLng).trim() !== "" ? Number(rawLng) : null,
  });

  if (!parsed.success) {
    return {
      error: "Revise os campos destacados no formulário acadêmico.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    name,
    email,
    password,
    institutionOrArea,
    city,
    bio,
    latitude,
    longitude,
  } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return {
        error: "Já existe um estudante ou mentor cadastrado com este e-mail.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        institutionOrArea,
        city,
        bio: bio || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });

    await setSessionCookie({
      sub: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      institutionOrArea: createdUser.institutionOrArea,
    });
  } catch (err) {
    console.error("[registerAction error]:", err);
    return {
      error:
        "Não foi possível concluir o cadastro no momento. Verifique a conexão com o banco de dados.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/skills");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Preencha seu e-mail e senha corretamente.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;
  const callbackUrl = String(formData.get("callbackUrl") || "/matches");

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        error: "Credenciais inválidas. Verifique seu e-mail ou senha.",
      };
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return {
        error: "Credenciais inválidas. Verifique seu e-mail ou senha.",
      };
    }

    await setSessionCookie({
      sub: user.id,
      name: user.name,
      email: user.email,
      institutionOrArea: user.institutionOrArea,
    });
  } catch (err) {
    console.error("[loginAction error]:", err);
    return {
      error:
        "Erro ao autenticar. Verifique se o banco PostgreSQL está ativo e populado.",
    };
  }

  revalidatePath("/", "layout");
  const safeRedirect =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/matches";
  redirect(safeRedirect);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect("/login");
}
