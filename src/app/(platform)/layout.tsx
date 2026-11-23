/**
 * ============================================================================
 * LAYOUT ANINHADO DO AMBIENTE ACADÊMICO ((platform)/layout.tsx)
 * Referência Pedagógica: Receita 15 (Layouts para subdiretórios de app/)
 * ============================================================================
 * Este layout envolve todas as páginas internas da plataforma (/matches, /discover,
 * /skills, /exchanges, /calendar e /profiles/[id]).
 * Por ser um Server Component, consulta diretamente o usuário autenticado e o
 * contador de trocas pendentes no PostgreSQL, mantendo a Sidebar e a Topbar
 * persistentes durante a navegação.
 */

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Recupera o usuário logado a partir do cookie JWT HttpOnly no servidor
  const user = await getCurrentUser();

  let pendingExchangesCount = 0;

  // Conta quantas propostas recebidas aguardam resposta do usuário logado
  if (user) {
    pendingExchangesCount = await prisma.exchange.count({
      where: {
        receiverId: user.id,
        status: {
          in: ["SOLICITACAO_ENVIADA", "AGUARDANDO_ACEITE"],
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Barra lateral fixa em desktop e recolhível em mobile */}
      <Sidebar user={user} pendingExchangesCount={pendingExchangesCount} />

      {/* Área principal com barra superior contextual e conteúdo da rota ativa */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} pendingExchangesCount={pendingExchangesCount} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
