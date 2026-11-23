/**
 * ============================================================================
 * LAYOUT RAIZ DA APLICAÇÃO (RootLayout)
 * Referência Pedagógica: Receita 15 (Next.js: layouts e links)
 * ============================================================================
 * No App Router, `app/layout.tsx` define a moldura HTML global (`<html>` e `<body>`)
 * que envolve todas as páginas do sistema. Ele é montado no servidor e preserva seu
 * estado durante a navegação entre rotas via `<Link>`.
 */

import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Fonte sem serifa (Inter) para interface, formulários, tabelas e textos de apoio
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Fonte serifada editorial (Source Serif 4) para títulos acadêmicos (h1, h2) e identidade da marca
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  display: "swap",
});

// Metadados institucionais de SEO da plataforma
export const metadata: Metadata = {
  title: {
    default: "SkillSwap — Rede Acadêmica de Troca de Conhecimentos",
    template: "%s | SkillSwap Acadêmico",
  },
  description:
    "Plataforma acadêmica e colaborativa onde estudantes, pesquisadores e mentores compartilham competências e aprendem de forma recíproca sem custos financeiros.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
