import Link from "next/link";
import {
  BookOpen,
  ArrowLeftRight,
  GraduationCap,
  Sparkles,
  Calendar,
  Award,
  CheckCircle2,
  ArrowRight,
  Compass,
  MapPin,
  Star,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navegação Superior Institucional */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-serif font-bold text-slate-900 tracking-tight block leading-none">
                SkillSwap
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block mt-0.5">
                Intercâmbio Acadêmico
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/discover"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg"
            >
              <Compass className="w-4 h-4" />
              Explorar Catálogo
            </Link>

            {user ? (
              <Link href="/matches" className="btn-primary">
                Acessar Meu Painel
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">
                  Entrar
                </Link>
                <Link href="/register" className="btn-primary">
                  Criar Conta Acadêmica
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section Editorial */}
      <section className="py-16 lg:py-24 px-6 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              Plataforma Colaborativa de Estudo & Mentoria entre Pares
            </div>

            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 leading-tight">
              Compartilhe o que você domina. Aprenda o que impulsiona sua pesquisa.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              O <strong>SkillSwap</strong> conecta estudantes, pesquisadores e mentores em uma rede estruturada de reciprocidade intelectual — onde o conhecimento é a única moeda de troca.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <Link href="/matches" className="btn-primary px-6 py-3 text-base">
                  <Sparkles className="w-4 h-4" />
                  Ver Meus Matches Acadêmicos
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn-primary px-6 py-3 text-base"
                  >
                    Começar Agora Gratuitamente
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="btn-secondary px-5 py-3 text-base"
                  >
                    Entrar com Conta Demo
                  </Link>
                </>
              )}
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-900 hover:text-indigo-700 px-3 py-2"
              >
                Consultar catálogo público →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
              <div>
                <span className="font-serif font-bold text-lg text-slate-900 block">
                  100% Gratuito
                </span>
                Sem taxas ou mensalidades
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-slate-900 block">
                  Match Recíproco
                </span>
                Algoritmo por área & Haversine
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-slate-900 block">
                  Histórico Certificado
                </span>
                6 etapas com avaliação por pares
              </div>
            </div>
          </div>

          {/* Card Demonstrativo: Caso Real Felipe <-> Maria */}
          <div className="lg:col-span-5">
            <div className="academic-card p-6 bg-slate-50/70 space-y-5 border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900 block">
                    Exemplo Real de Reciprocidade
                  </span>
                  <h3 className="text-base font-serif font-bold text-slate-900">
                    Compatibilidade Direta Identificada
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  98% Match
                </span>
              </div>

              {/* Card Felipe */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      Felipe Eduardo
                    </p>
                    <p className="text-xs text-slate-500">
                      Sistemas de Informação — UFRN • Natal, RN
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    5.0
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge-teach">
                    Ensina: Python (Avançado)
                  </span>
                  <span className="badge-learn">
                    Quer aprender: Inglês
                  </span>
                </div>
              </div>

              {/* Indicador Central de Troca */}
              <div className="flex items-center justify-center gap-3 text-xs font-semibold text-indigo-900">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-900" />
                  Intercâmbio sem custo financeiro
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Card Maria */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      Maria Clara Vasconcelos
                    </p>
                    <p className="text-xs text-slate-500">
                      Letras Inglês — UFRN • Natal, RN
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    5.0
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge-teach">
                    Ensina: Inglês (Avançado)
                  </span>
                  <span className="badge-learn">
                    Quer aprender: Python
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  Distância no campus: ~0.5 km (Bônus Geográfico)
                </span>
                <span className="font-medium text-emerald-700">
                  Sessão Presencial / Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metodologia em 3 Passos */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-900">
            Metodologia Pedagógica
          </span>
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            Como funciona a troca de conhecimentos em 3 etapas
          </h2>
          <p className="text-sm text-slate-600">
            Um fluxo transparente pensado para organizar o aprendizado colaborativo com rigor acadêmico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="academic-card p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-serif font-bold">
              1
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Estruture seu Portfólio Acadêmico
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cadastre as competências que você domina (<span className="text-emerald-700 font-medium">Ensina</span>) e os tópicos que busca desenvolver (<span className="text-indigo-700 font-medium">Quer Aprender</span>), indicando seu nível de proficiência.
            </p>
          </div>

          <div className="academic-card p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center font-serif font-bold">
              2
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Encontre Pares Recíprocos
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nosso motor de compatibilidade cruza interesses complementares, categorias correlatas e proximidade geográfica via fórmula de Haversine para sugerir mentores ideais.
            </p>
          </div>

          <div className="academic-card p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-serif font-bold">
              3
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Agende Sessões & Certifique seu Histórico
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Avance pelos 6 estágios da troca, agende encontros online ou presenciais integrados ao Google Calendar e construa seu histórico acadêmico avaliado por pares.
            </p>
          </div>
        </div>
      </section>

      {/* Destaques de Governança da Plataforma */}
      <section className="py-12 px-6 bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <span className="inline-flex items-center gap-2 font-medium text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Stepper Pedagógico de 6 Estados
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-slate-800">
              <Calendar className="w-4 h-4 text-indigo-900" />
              Exportação Google Calendar & .ICS
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-slate-800">
              <Award className="w-4 h-4 text-amber-600" />
              Certificação de Histórico de Aprendizagem
            </span>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SkillSwap — Rede Acadêmica de Troca de Conhecimentos.
          </p>
        </div>
      </section>
    </div>
  );
}
