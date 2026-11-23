import {
  PrismaClient,
  SkillRelationType,
  ProficiencyLevel,
  ExchangeStatus,
  MeetingMode,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed acadêmico do SkillSwap...");

  // Limpeza respeitando integridade referencial
  await prisma.review.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.exchange.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("123456", 10);

  // 1. Catálogo de Habilidades Acadêmicas e Técnicas
  const skillsData = [
    {
      name: "Python",
      category: "Programação",
      description:
        "Desenvolvimento em Python, automação de scripts, estruturas de dados e análise científica com Pandas.",
    },
    {
      name: "Inglês",
      category: "Idiomas",
      description:
        "Conversação acadêmica, leitura de artigos científicos (papers), escrita técnica e preparação para intercâmbio.",
    },
    {
      name: "Programação Web",
      category: "Programação",
      description:
        "Fundamentos da web moderna, lógica de programação, APIs REST e arquitetura de aplicações.",
    },
    {
      name: "Cálculo Diferencial e Integral",
      category: "Matemática",
      description:
        "Limites, derivadas, integrais e aplicações práticas em engenharia e ciências exatas.",
    },
    {
      name: "UX/UI Design",
      category: "Design",
      description:
        "Pesquisa com usuários, arquitetura da informação, wireframes, prototipação no Figma e sistemas de design.",
    },
    {
      name: "Espanhol",
      category: "Idiomas",
      description:
        "Fluência comunicativa, compreensão auditiva e gramática aplicada para contextos acadêmicos e profissionais.",
    },
    {
      name: "Banco de Dados SQL",
      category: "Programação",
      description:
        "Modelagem relacional, normalização, consultas complexas em PostgreSQL e otimização de índices.",
    },
    {
      name: "Estatística Aplicada",
      category: "Matemática",
      description:
        "Probabilidade, testes de hipótese, regressão linear e interpretação de dados quantitativos em pesquisas.",
    },
    {
      name: "Violão Clássico & Teoria Musical",
      category: "Música",
      description:
        "Leitura de partitura, harmonia funcional, postura instrumental e repertório erudito/popular.",
    },
    {
      name: "Redação Acadêmica & ABNT",
      category: "Humanidades",
      description:
        "Estruturação de artigos científicos, TCC, citações, metodologia científica e revisão textual.",
    },
  ];

  const skillMap: Record<string, { id: string; name: string; category: string }> = {};

  for (const s of skillsData) {
    const created = await prisma.skill.create({ data: s });
    skillMap[s.name] = created;
  }

  // 2. Usuários / Estudantes & Mentores (Cenário obrigatório Felipe + Maria + 4 colegas)
  const felipe = await prisma.user.create({
    data: {
      name: "Felipe Eduardo",
      email: "felipe@skillswap.edu.br",
      passwordHash: defaultPasswordHash,
      institutionOrArea: "Sistemas de Informação — UFRN",
      city: "Natal, RN",
      latitude: -5.8397,
      longitude: -35.1994,
      bio: "Estudante de Sistemas de Informação e monitor de algoritmos. Domino Python e Banco de Dados SQL, e busco aprimorar meu Inglês para leitura de artigos internacionais e apresentações.",
    },
  });

  const maria = await prisma.user.create({
    data: {
      name: "Maria Clara Vasconcelos",
      email: "maria@skillswap.edu.br",
      passwordHash: defaultPasswordHash,
      institutionOrArea: "Letras Inglês — UFRN",
      city: "Natal, RN",
      latitude: -5.8365,
      longitude: -35.2031,
      bio: "Graduanda em Letras com certificação Cambridge C1 e pesquisadora em Linguística Computacional. Ensino Inglês conversacional e acadêmico e quero aprender Python para processar corpora textuais.",
    },
  });

  const lucas = await prisma.user.create({
    data: {
      name: "Lucas Andrade",
      email: "lucas@skillswap.edu.br",
      passwordHash: defaultPasswordHash,
      institutionOrArea: "Engenharia de Computação — UFPE",
      city: "Recife, PE",
      latitude: -8.0553,
      longitude: -34.9511,
      bio: "Monitor de Cálculo Diferencial e Estatística há 4 semestres. Procuro colegas de Design para aprender UX/UI e melhorar a usabilidade dos meus projetos acadêmicos.",
    },
  });

  const camila = await prisma.user.create({
    data: {
      name: "Camila Borges",
      email: "camila@skillswap.edu.br",
      passwordHash: defaultPasswordHash,
      institutionOrArea: "Design Digital — UFC",
      city: "Fortaleza, CE",
      latitude: -3.7458,
      longitude: -38.5736,
      bio: "Product Designer e pesquisadora de interfaces acessíveis. Ensino UX/UI Design no Figma e busco mentoria em Programação Web ou Cálculo/Estatística para análise quantitativa de pesquisas.",
    },
  });

  const rafael = await prisma.user.create({
    data: {
      name: "Rafael Mendoza",
      email: "rafael@skillswap.edu.br",
      passwordHash: defaultPasswordHash,
      institutionOrArea: "Relações Internacionais — UnB",
      city: "Brasília, DF",
      latitude: -15.7633,
      longitude: -47.8704,
      bio: "Nativo em Espanhol e revisor de periódicos acadêmicos. Posso ajudar com Espanhol e Redação Acadêmica, e tenho grande interesse em aprender Banco de Dados SQL e análise de dados.",
    },
  });

  const helena = await prisma.user.create({
    data: {
      name: "Helena Duarte",
      email: "helena@skillswap.edu.br",
      passwordHash: defaultPasswordHash,
      institutionOrArea: "Ciência de Dados & Música — USP",
      city: "São Paulo, SP",
      latitude: -23.5614,
      longitude: -46.7308,
      bio: "Pesquisadora em Estatística Aplicada e formada em Violão Clássico pelo conservatório. Adoro trocar conhecimentos interdisciplinares entre exatas, música e idiomas.",
    },
  });

  // 3. Vínculos de Habilidades (UserSkill)
  await prisma.userSkill.createMany({
    data: [
      // FELIPE: Ensina Python e SQL | Quer aprender Inglês e UX/UI Design
      {
        userId: felipe.id,
        skillId: skillMap["Python"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "3 anos de experiência com Python, estruturas de dados, FastAPI e automação.",
      },
      {
        userId: felipe.id,
        skillId: skillMap["Banco de Dados SQL"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "Modelagem relacional, PostgreSQL, Prisma e otimização de queries.",
      },
      {
        userId: felipe.id,
        skillId: skillMap["Inglês"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INTERMEDIARIO,
        notes: "Foco em destravar conversação técnica e escrita de resumos (abstracts).",
      },
      {
        userId: felipe.id,
        skillId: skillMap["UX/UI Design"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INICIANTE,
        notes: "Quero aprender hierarquia visual e prototipação limpa para sistemas web.",
      },

      // MARIA: Ensina Inglês e Redação Acadêmica | Quer aprender Python e Programação Web
      {
        userId: maria.id,
        skillId: skillMap["Inglês"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "Mentoria focada em conversação acadêmica, pronúncia e leitura crítica de papers.",
      },
      {
        userId: maria.id,
        skillId: skillMap["Redação Acadêmica & ABNT"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "Estruturação metodológica e revisão de artigos científicos.",
      },
      {
        userId: maria.id,
        skillId: skillMap["Python"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INICIANTE,
        notes: "Preciso aprender Python do zero para análise de textos em Linguística Computacional.",
      },
      {
        userId: maria.id,
        skillId: skillMap["Programação Web"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INICIANTE,
        notes: "Interesse em compreender lógica de programação e páginas interativas.",
      },

      // LUCAS: Ensina Cálculo e Programação Web | Quer aprender UX/UI Design e Inglês
      {
        userId: lucas.id,
        skillId: skillMap["Cálculo Diferencial e Integral"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "Resolução passo a passo de listas de Cálculo I e II.",
      },
      {
        userId: lucas.id,
        skillId: skillMap["Programação Web"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.INTERMEDIARIO,
        notes: "TypeScript, React e construção de APIs REST.",
      },
      {
        userId: lucas.id,
        skillId: skillMap["UX/UI Design"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INICIANTE,
        notes: "Busco fundamentos de design de interfaces e componentização no Figma.",
      },
      {
        userId: lucas.id,
        skillId: skillMap["Inglês"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INTERMEDIARIO,
        notes: "Prática semanal de conversação.",
      },

      // CAMILA: Ensina UX/UI Design | Quer aprender Python, Programação Web e Estatística
      {
        userId: camila.id,
        skillId: skillMap["UX/UI Design"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "Design Systems, acessibilidade WCAG, testes de usabilidade e Figma avançado.",
      },
      {
        userId: camila.id,
        skillId: skillMap["Programação Web"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INICIANTE,
        notes: "Quero entender melhor a ponte entre design e implementação front-end.",
      },
      {
        userId: camila.id,
        skillId: skillMap["Python"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INICIANTE,
        notes: "Automação e análise de métricas de produto.",
      },
      {
        userId: camila.id,
        skillId: skillMap["Estatística Aplicada"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INICIANTE,
        notes: "Análise quantitativa de pesquisas com usuários.",
      },

      // RAFAEL: Ensina Espanhol e Redação Acadêmica | Quer aprender Banco de Dados SQL e Python
      {
        userId: rafael.id,
        skillId: skillMap["Espanhol"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "Espanhol nativo com foco em conversação, DELE e leitura acadêmica.",
      },
      {
        userId: rafael.id,
        skillId: skillMap["Redação Acadêmica & ABNT"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "Metodologia de pesquisa e normas de publicação.",
      },
      {
        userId: rafael.id,
        skillId: skillMap["Banco de Dados SQL"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INICIANTE,
        notes: "Consultas SQL para cruzar bases de dados de comércio exterior e políticas públicas.",
      },

      // HELENA: Ensina Estatística e Violão | Quer aprender Espanhol e Inglês
      {
        userId: helena.id,
        skillId: skillMap["Estatística Aplicada"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "Modelagem estatística, inferência e interpretação de dados para TCC/Mestrado.",
      },
      {
        userId: helena.id,
        skillId: skillMap["Violão Clássico & Teoria Musical"].id,
        type: SkillRelationType.TEACH,
        level: ProficiencyLevel.AVANCADO,
        notes: "Harmonia, leitura musical e técnica de mão direita/esquerda.",
      },
      {
        userId: helena.id,
        skillId: skillMap["Espanhol"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INICIANTE,
        notes: "Preparação para congresso latino-americano.",
      },
      {
        userId: helena.id,
        skillId: skillMap["Inglês"].id,
        type: SkillRelationType.LEARN,
        level: ProficiencyLevel.INTERMEDIARIO,
        notes: "Apresentação oral de artigos em conferências.",
      },
    ],
  });

  // 4. Trocas em Diferentes Estágios (Demonstração completa da Máquina de 6 Estados)

  // Troca 1: Felipe <-> Maria (EM_ANDAMENTO) com encontro agendado no campus da UFRN
  const exchangeFelipeMaria = await prisma.exchange.create({
    data: {
      requesterId: felipe.id,
      receiverId: maria.id,
      offeredSkillId: skillMap["Python"].id,
      requestedSkillId: skillMap["Inglês"].id,
      status: ExchangeStatus.EM_ANDAMENTO,
      message:
        "Olá Maria! Vi que você pesquisa Linguística Computacional na UFRN e quer aprender Python. Posso te ensinar desde a base até manipulação de textos, e em troca praticamos Inglês acadêmico!",
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(15, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 4);
  nextWeek.setHours(10, 0, 0, 0);

  await prisma.meeting.createMany({
    data: [
      {
        exchangeId: exchangeFelipeMaria.id,
        scheduledAt: tomorrow,
        durationMinutes: 60,
        mode: MeetingMode.PRESENCIAL,
        locationName: "Biblioteca Central Zila Mamede (UFRN) — Sala de Estudos 3",
        latitude: -5.8384,
        longitude: -35.1999,
      },
      {
        exchangeId: exchangeFelipeMaria.id,
        scheduledAt: nextWeek,
        durationMinutes: 60,
        mode: MeetingMode.ONLINE,
        locationName: "Sala Virtual Google Meet",
        meetingUrl: "https://meet.google.com/skw-pyen-edu",
      },
    ],
  });

  // Troca 2: Camila -> Felipe (AGUARDANDO_ACEITE - Recebida por Felipe)
  await prisma.exchange.create({
    data: {
      requesterId: camila.id,
      receiverId: felipe.id,
      offeredSkillId: skillMap["UX/UI Design"].id,
      requestedSkillId: skillMap["Python"].id,
      status: ExchangeStatus.AGUARDANDO_ACEITE,
      message:
        "Oi Felipe! Notei que você quer aprender UX/UI Design. Posso preparar 3 sessões práticas no Figma sobre hierarquia visual e design systems em troca de uma introdução prática a scripts em Python.",
    },
  });

  // Troca 3: Felipe -> Rafael (CONCLUIDA - pronta para Felipe avaliar e testar transição CONCLUIDA -> AVALIADA)
  await prisma.exchange.create({
    data: {
      requesterId: felipe.id,
      receiverId: rafael.id,
      offeredSkillId: skillMap["Banco de Dados SQL"].id,
      requestedSkillId: skillMap["Redação Acadêmica & ABNT"].id,
      status: ExchangeStatus.CONCLUIDA,
      message:
        "Olá Rafael! Podemos trocar uma mentoria de consultas SQL em PostgreSQL por uma revisão estrutural do meu artigo acadêmico?",
    },
  });

  // Troca 4: Felipe <-> Lucas (AVALIADA - Histórico de Aprendizagem completo com avaliações mútuas)
  const exchangeAvaliada = await prisma.exchange.create({
    data: {
      requesterId: lucas.id,
      receiverId: felipe.id,
      offeredSkillId: skillMap["Cálculo Diferencial e Integral"].id,
      requestedSkillId: skillMap["Banco de Dados SQL"].id,
      status: ExchangeStatus.AVALIADA,
      message:
        "Felipe, preciso estruturar o banco relacional do meu projeto de engenharia. Em troca, posso revisar os tópicos de derivadas e integrais aplicadas que você precisar.",
    },
  });

  await prisma.review.createMany({
    data: [
      {
        exchangeId: exchangeAvaliada.id,
        authorId: lucas.id,
        targetId: felipe.id,
        rating: 5,
        comment:
          "Didática impecável! O Felipe explicou normalização, chaves estrangeiras e índices no PostgreSQL com exemplos muito claros.",
      },
      {
        exchangeId: exchangeAvaliada.id,
        authorId: felipe.id,
        targetId: lucas.id,
        rating: 5,
        comment:
          "Excelente mentor de Cálculo. O Lucas tem muita paciência e organiza o raciocínio matemático de forma super intuitiva.",
      },
    ],
  });

  // Troca 5: Maria <-> Helena (AVALIADA - para enriquecer a nota média e histórico da Maria)
  const exchangeMariaHelena = await prisma.exchange.create({
    data: {
      requesterId: helena.id,
      receiverId: maria.id,
      offeredSkillId: skillMap["Estatística Aplicada"].id,
      requestedSkillId: skillMap["Inglês"].id,
      status: ExchangeStatus.AVALIADA,
      message:
        "Maria, tenho uma apresentação em inglês para uma conferência e posso te ensinar estatística descritiva aplicada a dados linguísticos!",
    },
  });

  await prisma.review.createMany({
    data: [
      {
        exchangeId: exchangeMariaHelena.id,
        authorId: helena.id,
        targetId: maria.id,
        rating: 5,
        comment:
          "A Maria transformou minha apresentação acadêmica em inglês. Deu dicas valiosas de vocabulário formal e postura em conferências.",
      },
      {
        exchangeId: exchangeMariaHelena.id,
        authorId: maria.id,
        targetId: helena.id,
        rating: 5,
        comment:
          "A Helena tornou os testes de hipótese muito acessíveis para minha pesquisa em Letras. Recomendo fortemente!",
      },
    ],
  });

  console.log("✅ Seed concluído com sucesso!");
  console.log("------------------------------------------------------------");
  console.log("👤 Credenciais de demonstração (Senha padrão: 123456):");
  console.log("   • felipe@skillswap.edu.br (Ensina Python/SQL | Aprende Inglês/UX)");
  console.log("   • maria@skillswap.edu.br  (Ensina Inglês/Redação | Aprende Python/Web)");
  console.log("   • camila@skillswap.edu.br (Ensina UX/UI Design | Aprende Python/Web)");
  console.log("   • lucas@skillswap.edu.br  (Ensina Cálculo/Web | Aprende UX/Inglês)");
  console.log("   • rafael@skillswap.edu.br (Ensina Espanhol/Redação | Aprende SQL)");
  console.log("   • helena@skillswap.edu.br (Ensina Estatística/Violão | Aprende Idiomas)");
  console.log("------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
