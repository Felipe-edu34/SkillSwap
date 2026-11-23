# 🎓 SkillSwap — Rede Acadêmica de Troca de Conhecimentos

O **SkillSwap** é uma plataforma web acadêmica e colaborativa desenvolvida com **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** e **PostgreSQL (Prisma ORM)**. Seu objetivo é conectar estudantes, pesquisadores e mentores para **compartilharem conhecimentos de forma recíproca, sem envolver dinheiro**.

---

## 📌 1. O Que é o Projeto?

No ambiente universitário e técnico, muitos estudantes dominam uma área específica (como programação, cálculo ou estatística), mas precisam desenvolver outra competência (como idiomas para leitura de artigos internacionais, design de interfaces ou redação científica).

O **SkillSwap** resolve essa necessidade através de um **Motor de Compatibilidade Acadêmica**:
- Cada estudante estrutura seu portfólio dividindo suas habilidades entre o que **Pode Ensinar (`TEACH`)** e o que **Quer Aprender (`LEARN`)**, informando seu nível de domínio (`Iniciante`, `Intermediário` ou `Avançado`).
- O sistema cruza automaticamente os interesses de toda a comunidade:
  - **Exemplo Real (presente no Seed):** **Felipe Eduardo** (Sistemas de Informação — UFRN) ensina **Python** e quer aprender **Inglês**. **Maria Clara Vasconcelos** (Letras Inglês — UFRN) ensina **Inglês** e quer aprender **Python**.
  - O algoritmo identifica a **reciprocidade direta**, calcula a **proximidade geográfica** entre os dois via **Fórmula de Haversine** (~0.5 km no campus da UFRN) e destaca a combinação com **99% de compatibilidade** no topo da tela `/matches`.
- A partir do match, os estudantes formalizam a proposta, avançam por uma **Máquina de 6 Estados Pedagógicos**, agendam encontros **Online** ou **Presenciais** integrados ao **Google Calendar / arquivo `.ICS`** e certificam a troca com avaliação mútua no **Histórico de Aprendizagem**.

---

## ✨ 2. Principais Funcionalidades e Rotas

| Rota | Tipo | Descrição da Funcionalidade |
| :--- | :--- | :--- |
| **`/`** | Pública (Server) | **Landing Page Institucional:** explica a metodologia em 3 passos, apresenta o estudo de caso real *Felipe ↔ Maria* e direciona para acesso ou catálogo. |
| **`/login`** | Pública (Server + Client) | **Acesso Acadêmico:** autenticação segura com senha hash (`bcryptjs`) e cookie `HttpOnly` JWT (`jose`), incluindo botões de preenchimento rápido em 1 clique para contas de demonstração. |
| **`/register`** | Pública (Server + Client) | **Cadastro de Estudante/Mentor:** registro com curso/instituição, cidade, resumo acadêmico e captura opcional de coordenadas GPS via **Browser Geolocation API**. |
| **`/skills`** | Privada (Server + Actions) | **CRUD Completo de Competências:** adição, edição de nível/ementa e remoção com confirmação das disciplinas que o usuário **Ensina** e **Quer Aprender**. |
| **`/matches`** | Privada (Server + API) | **Motor de Compatibilidade:** exibe os pares ideais ordenados por score percentual (Match Direto Recíproco, Categoria Complementar e Bônus Haversine) + inspetor da API JSON. |
| **`/discover`** | Híbrida (Server `searchParams`) | **Catálogo de Mentores e Disciplinas:** busca textual e filtros combinados por área acadêmica e modalidade (`Ensina` / `Aprende`) sincronizados na URL via `<Form>` do Next.js. |
| **`/profiles/[id]`** | Dinâmica (SSG/ISR + Server) | **Currículo & Histórico de Aprendizagem:** ficha acadêmica completa do estudante, competências por nível, certificado de trocas concluídas e pareceres com estrelas. |
| **`/exchanges`** | Privada (Server + Actions) | **Painel Pedagógico de Trocas:** organizado em abas (*Recebidas*, *Enviadas*, *Histórico*) com **Stepper visual de 6 etapas**, botões de transição por papel e modal de avaliação (1 a 5 estrelas). |
| **`/calendar`** | Privada (Server + Actions) | **Agenda Acadêmica de Encontros:** agendamento de sessões `PRESENCIAL` (com captura GPS e distância Haversine) ou `ONLINE` (link de sala virtual), botão direto **"Adicionar ao Google Calendar"** e download `.ICS`. |
| **`/api/matches`** | Route Handler (`GET`) | Endpoint REST JSON que retorna o cálculo do motor de compatibilidade para o usuário autenticado, aceitando filtros `?minScore=` e `?category=`. |
| **`/api/skills`** | Route Handler (`GET`) | Endpoint REST JSON para consulta filtrada do catálogo global de habilidades e mentores (`?q=`, `?category=`, `?type=`). |
| **`/api/calendar/[meetingId]/ics`** | Route Handler (`GET`) | Endpoint REST dinâmico que gera e faz o download do arquivo iCalendar (`.ics` padrão RFC 5545) de qualquer encontro agendado. |

---

## 📚 3. Mapa de Conformidade com as Receitas 13 a 23 (Programação Web)

O projeto implementa integralmente os fundamentos modernos do Next.js App Router equivalentes às **Receitas 13 a 23**:

- **Receita 13 (Aplicação Next.js e Páginas):** criação de rotas baseadas em diretórios dentro de `src/app/` com funções exportadas por padrão (`export default function ...`) em arquivos `page.tsx`.
- **Receita 14 (Páginas e Componentes):** modularização da interface em componentes parametrizados (`src/components/...`) e distinção clara entre Server Components (padrão) e Client Components (`"use client"`).
- **Receita 15 (Layouts e Links):** uso de layout raiz (`src/app/layout.tsx`) e layout aninhado (`src/app/(platform)/layout.tsx`) com navegação via `<Link>` de `next/link`, mantendo a barra lateral montada sem recarregar a página.
- **Receita 16 (Data Fetching no Servidor & `searchParams`):** páginas assíncronas no servidor (`async function Page({ searchParams })`) que desestruturam `await searchParams` e renderizam coleções com `.map()` e propriedade única `key`.
- **Receita 17 (Formulário de Pesquisa com `next/form`):** utilização do componente `<Form action="/discover">` em `src/components/matches/DiscoverFilters.tsx` para submeter parâmetros de busca na URL sem recarregar o formulário.
- **Receita 18 (Client Components e `useState`):** gerência de estado reativa no navegador em formulários interativos, modais, geolocalização e filtros dinâmicos.
- **Receita 19 (Implementação de API Própria):** Route Handlers em `src/app/api/.../route.ts` exportando `async function GET(request)` e retornando `Response.json(...)`.
- **Receita 20 (Server Actions):** funções assíncronas de servidor com diretiva `"use server"` em `src/actions/*.ts`, validadas com **Zod** e integradas aos formulários React via `useActionState`.
- **Receita 21 (Rotas Dinâmicas `[id]`, Streaming `loading.tsx`, SSG e ISR):** rota dinâmica `/profiles/[id]` utilizando `const { id } = await params`, `generateStaticParams()`, streaming com `loading.tsx` e invalidação de cache com `revalidatePath()`.
- **Receitas 22 e 23 (Acesso a Banco de Dados e Consumo de API Própria):** persistência relacional no PostgreSQL via Prisma Singleton (`src/lib/prisma.ts`), script de migração/população (`prisma/seed.ts`) e consumo client-side da API própria via `fetch("/api/matches")` em `MatchesApiVerifier.tsx`.

---

## 🏗️ 4. Estrutura Completa do Projeto

```text
SkillSwap/
├── docker-compose.yml              # Serviço PostgreSQL 16 local (mapeado na porta 5433)
├── .env.example                    # Exemplo documentado das variáveis de ambiente
├── .gitignore                      # Arquivos ignorados pelo controle de versão Git
├── package.json                    # Scripts npm e dependências do projeto
├── tsconfig.json                   # Configuração TypeScript estrita (strict: true)
├── tailwind.config.ts              # Configuração de fontes (Source Serif 4 + Inter) e sombras
├── postcss.config.mjs              # Processamento do Tailwind CSS
├── next.config.mjs                 # Configuração do Next.js App Router
├── middleware.ts                   # Proteção Edge JWT para rotas privadas (/skills, /matches, /exchanges, /calendar)
│
├── prisma/
│   ├── schema.prisma               # Modelagem das 6 tabelas e 4 enums no PostgreSQL
│   └── seed.ts                     # População inicial: Felipe, Maria + 4 colegas, 10 skills e 5 trocas
│
└── src/
    ├── app/
    │   ├── globals.css             # Paleta acadêmica (Slate/Indigo-900/Emerald-700/Amber-600) e classes base
    │   ├── layout.tsx              # RootLayout com carregamento otimizado de fontes Google
    │   ├── loading.tsx             # Skeleton global de carregamento
    │   ├── error.tsx               # Boundary global de recuperação de erros
    │   ├── not-found.tsx           # Página 404 global com estilo acadêmico
    │   ├── page.tsx                # Landing Page institucional (/)
    │   │
    │   ├── (auth)/                 # Rotas públicas de autenticação
    │   │   ├── login/page.tsx      # Página de login (/login)
    │   │   └── register/page.tsx   # Página de cadastro (/register)
    │   │
    │   ├── (platform)/             # Rotas envolvidas pelo Shell Acadêmico (Sidebar + Topbar)
    │   │   ├── layout.tsx          # Layout autenticado com contador de trocas pendentes
    │   │   ├── loading.tsx         # Skeleton das páginas internas da plataforma
    │   │   ├── skills/page.tsx     # Gestão de competências que ensina e quer aprender (/skills)
    │   │   ├── discover/page.tsx   # Catálogo de colegas filtrado via searchParams (/discover)
    │   │   ├── matches/page.tsx    # Sugestões do algoritmo de compatibilidade (/matches)
    │   │   ├── exchanges/page.tsx  # Painel de trocas com Stepper de 6 estados (/exchanges)
    │   │   ├── calendar/page.tsx   # Agenda de encontros Online e Presenciais (/calendar)
    │   │   └── profiles/[id]/      # Rota dinâmica de perfil e Histórico de Aprendizagem
    │   │       ├── page.tsx        # Página de currículo acadêmico (/profiles/[id])
    │   │       ├── loading.tsx     # Skeleton específico de perfil
    │   │       └── not-found.tsx   # Tratamento 404 para perfil inexistente
    │   │
    │   └── api/                    # Endpoints REST da API Própria (Route Handlers)
    │       ├── matches/route.ts    # GET /api/matches (Motor de compatibilidade JSON)
    │       ├── skills/route.ts     # GET /api/skills (Consulta de habilidades e mentores)
    │       └── calendar/[meetingId]/ics/route.ts # GET /api/calendar/:id/ics (Download .ICS)
    │
    ├── actions/                    # Server Actions ("use server") validadas com Zod
    │   ├── auth.ts                 # registerAction, loginAction e logoutAction
    │   ├── skills.ts               # createUserSkillAction, updateUserSkillAction e deleteUserSkillAction
    │   ├── exchanges.ts            # createExchangeProposalAction e advanceExchangeStatusAction
    │   ├── meetings.ts             # createMeetingAction e deleteMeetingAction
    │   └── reviews.ts              # createReviewAction (avaliação 1-5 estrelas + transição para AVALIADA)
    │
    ├── lib/                        # Camada de Domínio, Segurança e Integrações
    │   ├── prisma.ts               # Singleton do PrismaClient
    │   ├── auth.ts                 # Assinatura/verificação JWT (jose) e extração do usuário da sessão
    │   ├── validators.ts           # Schemas Zod para validação de formulários
    │   ├── matching.ts             # Algoritmo de reciprocidade direta, categoria complementar e Haversine
    │   ├── geolocation.ts          # Fórmula de Haversine e formatação de distâncias em km
    │   ├── exchange-state.ts       # Máquina dos 6 estados de ExchangeStatus e regras de permissão
    │   └── google-calendar.ts      # Integração OAuth2 Google Calendar API, Deep Link e gerador .ICS
    │
    └── components/                 # Componentes Modulares de Interface
        ├── auth/
        │   ├── LoginForm.tsx       # Formulário de login com seletor rápido de contas demo
        │   └── RegisterForm.tsx    # Formulário de cadastro com captura Browser Geolocation API
        ├── layout/
        │   ├── Sidebar.tsx         # Barra lateral acadêmica fixa em desktop e drawer em mobile
        │   └── Topbar.tsx          # Cabeçalho contextual com alerta de trocas pendentes
        ├── skills/
        │   ├── SkillForm.tsx       # Formulário para adicionar habilidades de ensino ou aprendizado
        │   └── UserSkillCard.tsx   # Card com edição inline de nível/ementa e exclusão com confirmação
        ├── matches/
        │   ├── MentorCard.tsx      # Ficha de mentor com score %, estrelas, distância e botão Propor Troca
        │   ├── DiscoverFilters.tsx # Barra de pesquisa e filtros utilizando <Form> de next/form
        │   ├── ProposeExchangeModal.tsx # Modal para envio de proposta de intercâmbio
        │   └── MatchesApiVerifier.tsx   # Inspetor client-side que consome GET /api/matches via fetch()
        ├── exchanges/
        │   ├── ExchangeStepper.tsx # Barra de progresso horizontal com as 6 etapas numeradas
        │   ├── ExchangeCard.tsx    # Card completo da troca com botões de transição por papel
        │   ├── ExchangesTabs.tsx   # Navegação por abas (Recebidas, Enviadas e Histórico)
        │   └── ReviewModal.tsx     # Modal de avaliação construtiva (1 a 5 estrelas)
        └── calendar/
            ├── MeetingForm.tsx     # Agendamento Online/Presencial com GPS e distância até o colega
            └── MeetingCard.tsx     # Card de encontro com botão Google Calendar e download .ICS
```

---

## 🗄️ 5. Modelagem do Banco de Dados e Máquina de Estados

### Entidades Principais (`prisma/schema.prisma`)
- **`User`**: dados acadêmicos (`name`, `email`, `passwordHash`, `institutionOrArea`, `city`, `bio`) e coordenadas geográficas (`latitude`, `longitude`).
- **`Skill`**: catálogo único de disciplinas (`name`, `category`, `description`).
- **`UserSkill`**: vínculo entre estudante e disciplina com `type` (`TEACH` | `LEARN`), `level` (`INICIANTE` | `INTERMEDIARIO` | `AVANCADO`), `notes` e constraint única `@@unique([userId, skillId, type])`.
- **`Exchange`**: registro de troca entre `requesterId` (solicitante) e `receiverId` (receptor), vinculando `offeredSkillId` e `requestedSkillId` e controlada pelo enum `ExchangeStatus`.
- **`Meeting`**: sessões vinculadas a uma troca (`scheduledAt`, `durationMinutes`, `mode`: `ONLINE` | `PRESENCIAL`, `locationName`, `meetingUrl`, `latitude`, `longitude`, `googleCalendarEventId`, `googleCalendarLink`).
- **`Review`**: avaliação de 1 a 5 estrelas com comentário e constraint única `@@unique([exchangeId, authorId])` garantindo que cada estudante avalie cada troca apenas uma vez.

### Os 6 Estados Obrigatórios de uma Troca (`src/lib/exchange-state.ts`)
1. **`SOLICITACAO_ENVIADA`** — Proposta inicial enviada pelo solicitante.
2. **`AGUARDANDO_ACEITE`** — Receptor visualizou e colocou a solicitação em análise.
3. **`CONFIRMADA`** — Receptor aceitou a proposta; habilita o agendamento de encontros em `/calendar`.
4. **`EM_ANDAMENTO`** — Ciclo de estudos iniciado ou encontro agendado.
5. **`CONCLUIDA`** — Sessões de mentoria finalizadas; habilita o formulário de avaliação mútua.
6. **`AVALIADA`** — Avaliada com nota de 1 a 5 estrelas e certificada no **Histórico de Aprendizagem** do perfil.

---

## 🚀 6. Como Rodar o Projeto Passo a Passo

### Pré-requisitos
- **Node.js** v18.18+ ou v20+
- **Docker** e **Docker Compose** (para rodar o banco PostgreSQL localmente) — *ou uma conta gratuita no Supabase*.

### Passo 1 — Instalar as dependências
No terminal, dentro da pasta raiz do projeto (`/home/felipe/Documentos/SkillSwap`):
```bash
npm install
```

### Passo 2 — Configurar o arquivo `.env`
Copie o arquivo `.env.example` para `.env` (caso ainda não exista):
```bash
cp .env.example .env
```
Por padrão, o `.env` já vem configurado para conectar no container Docker local na porta `5433`:
```env
DATABASE_URL="postgresql://skillswap:skillswap_secret@localhost:5433/skillswap_db?schema=public"
JWT_SECRET="skillswap-academic-super-secret-jwt-key-2026-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Passo 3 — Subir o Banco de Dados PostgreSQL via Docker
```bash
docker compose up -d
```

### Passo 4 — Criar as Tabelas e Popular o Seed Acadêmico
Execute os comandos abaixo para sincronizar o schema do Prisma e inserir os dados iniciais de demonstração:
```bash
npm run db:push
npm run db:seed
```

### Passo 5 — Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Abra o navegador em **[http://localhost:3000](http://localhost:3000)** (ou **[http://localhost:3001](http://localhost:3001)** caso a porta 3000 esteja ocupada por outro serviço).

---

## 🧪 7. Credenciais prontas para Teste (Seed Acadêmico)

Na tela **`/login`**, você pode clicar diretamente nos botões de **Acesso Rápido de Demonstração** ou usar qualquer uma das contas abaixo (todas com a senha **`123456`**):

| Nome | E-mail | Curso / Instituição | Ensina (`TEACH`) | Quer Aprender (`LEARN`) |
| :--- | :--- | :--- | :--- | :--- |
| **Felipe Eduardo** | `felipe@skillswap.edu.br` | Sistemas de Informação — UFRN | Python, Banco de Dados SQL | Inglês, UX/UI Design |
| **Maria Clara Vasconcelos** | `maria@skillswap.edu.br` | Letras Inglês — UFRN | Inglês, Redação Acadêmica | Python, Programação Web |
| **Camila Borges** | `camila@skillswap.edu.br` | Design Digital — UFC | UX/UI Design | Programação Web, Python, Estatística |
| **Lucas Andrade** | `lucas@skillswap.edu.br` | Eng. de Computação — UFPE | Cálculo, Programação Web | UX/UI Design, Inglês |
| **Rafael Mendoza** | `rafael@skillswap.edu.br` | Relações Internacionais — UnB | Espanhol, Redação Acadêmica | Banco de Dados SQL |
| **Helena Duarte** | `helena@skillswap.edu.br` | Ciência de Dados & Música — USP | Estatística Aplicada, Violão | Espanhol, Inglês |

### Comandos Úteis Adicionais
- `npm run db:studio` — Abre a interface visual do **Prisma Studio** para inspecionar as tabelas do PostgreSQL no navegador.
- `npm run db:seed` — Restaura o banco de dados para o estado inicial de demonstração.
- `npm run build && npm run start` — Compila e executa a aplicação em modo de produção (testando a pré-renderização `generateStaticParams` da Receita 21).
