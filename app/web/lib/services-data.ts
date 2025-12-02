export interface ServiceDetail {
  heroSubtitle: string
  heroImage: string
  description: string[]
  highlights: string[]
  deliverables: string[]
  gallery?: string[]
}

export interface ServiceItem {
  name: string
  slug: string
  shortDescription: string
  image: string
  detail: ServiceDetail
}

export interface ServiceCategory {
  id: string
  title: string
  subtitle: string
  description: string
  services: ServiceItem[]
}

export interface ServiceWithCategoryMeta extends ServiceItem {
  categoryId: string
  categoryTitle: string
  categorySubtitle: string
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "administrativo",
    title: "Administrativo",
    subtitle: "Como podemos ajudar sua empresa a crescer?",
    description:
      "Profissionais qualificados para apoiar sua operação administrativa com eficiência, organização e excelência no atendimento.",
    services: [
      {
        name: "Recepcionista",
        slug: "recepcionista",
        shortDescription: "",
        image: "/luxury-office-lobby.jpg",
        detail: {
          heroSubtitle: "Atendimento de excelência desde o primeiro contato.",
          heroImage: "https://images.unsplash.com/photo-1614064641938-3bbee5294030?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Nossas recepcionistas representam a cultura da sua empresa com cordialidade, comunicação clara e postura profissional. Elas são treinadas para receber visitantes, organizar agendas, controlar acessos e apoiar a operação diária da sua recepção.",
            "Com processos bem definidos, garantimos a experiência ideal para colaboradores, clientes e fornecedores, criando o primeiro impacto positivo logo na chegada ao seu ambiente corporativo.",
          ],
          highlights: [
            "Equipe bilíngue disponível sob demanda",
            "Capacitação contínua em etiqueta corporativa",
            "Controle de visitas com registro digital",
          ],
          deliverables: [
            "Gestão de fluxo de visitantes e recebimento de correspondências",
            "Suporte administrativo às equipes internas",
            "Relatórios periódicos de atendimento e indicadores",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1507206130118-b5907f817163?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Auxiliar Administrativo",
        slug: "auxiliar-administrativo",
        shortDescription: "",
        image: "/person-typing-laptop-google.jpg",
        detail: {
          heroSubtitle: "Organização, produtividade e apoio confiável para sua operação.",
          heroImage: "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Os auxiliares administrativos da JSP garantem que rotinas essenciais sejam executadas com agilidade e precisão. Eles cuidam de documentos, planilhas, atendimento interno, controle de materiais e suporte aos gestores.",
            "A equipe atua alinhada aos processos da sua empresa, adotando tecnologias e indicadores para manter a operação sob controle e com dados confiáveis para a tomada de decisão.",
          ],
          highlights: [
            "Profissionais com domínio das principais ferramentas de escritório",
            "Treinamento em atendimento e comunicação corporativa",
            "Aplicação de rotinas padronizadas e checklists operacionais",
          ],
          deliverables: [
            "Organização de arquivos físicos e digitais",
            "Emissão e atualização de relatórios administrativos",
            "Controle de agendas, reuniões e suprimentos",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522156373667-4c7234bbd804?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Porteiro",
        slug: "porteiro",
        shortDescription: "",
        image: "/security-guard-uniform.jpg",
        detail: {
          heroSubtitle: "Segurança humanizada com controle rigoroso de acesso.",
          heroImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
          description: [
            "O serviço de portaria da JSP combina presença ativa, vigilância preventiva e comunicação clara para proteger seus espaços. Nossos profissionais são treinados para lidar com protocolos de segurança, triagem de visitantes e resposta rápida a incidentes.",
            "Com suporte de tecnologias de controle de acesso e protocolos personalizados, garantimos ambientes seguros 24 horas por dia, preservando o patrimônio e a tranquilidade de todos.",
          ],
          highlights: [
            "Procedimentos alinhados às normas de segurança patrimonial",
            "Treinamentos frequentes em atendimento, postura e primeiros socorros",
            "Integração com sistemas de CFTV e controle eletrônico de acesso",
          ],
          deliverables: [
            "Registro e monitoramento de acessos",
            "Abertura e fechamento de instalações com checklist",
            "Relatórios de ocorrências e acompanhamento de visitantes",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
    ],
  },
  {
    id: "limpeza",
    title: "Limpeza e Conservação",
    subtitle: "Como podemos ajudar sua empresa a crescer?",
    description:
      "Serviços de limpeza, conservação, jardinagem, pintura e manutenção predial com equipe especializada.",
    services: [
      {
        name: "Faxineiro",
        slug: "faxineiro",
        shortDescription: "",
        image: "/professional-cleaning-service.jpg",
        detail: {
          heroSubtitle: "Ambientes limpos, seguros e preparados para receber pessoas.",
          heroImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Nossa equipe de limpeza atua com cronogramas definidos, produtos certificados e técnicas modernas para entregar ambientes sempre prontos. Trabalhamos com planos personalizados para escritórios, indústrias, condomínios e instituições públicas ou privadas.",
            "A JSP investe em treinamentos contínuos, equipamentos eficientes e supervisão próxima para garantir padronização e qualidade em cada detalhe.",
          ],
          highlights: [
            "Planos de limpeza customizados por área e período",
            "Produtos sustentáveis e equipamentos de alta performance",
            "Procedimentos que seguem normas de saúde e segurança",
          ],
          deliverables: [
            "Rotinas diárias, periódicas e profundas conforme necessidade",
            "Checklists preenchidos digitalmente e auditáveis",
            "Relatórios de consumo de insumos e ocorrências",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1580894906472-d7dc2b5b079f?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Zelador",
        slug: "zelador",
        shortDescription: "",
        image: "/building-maintenance-worker.jpg",
        detail: {
          heroSubtitle: "Cuidado diário com a estrutura e o bem-estar do seu patrimônio.",
          heroImage: "https://images.unsplash.com/photo-1487956382158-bb926046304a?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Os zeladores da JSP garantem que as instalações funcionem perfeitamente. Eles realizam checklists preventivos, acompanham serviços de terceiros, atendem moradores ou colaboradores e zelam pelo cumprimento das normas internas.",
            "Unimos experiência prática, orientação técnica e comunicação empática para promover ambientes organizados, seguros e acolhedores.",
          ],
          highlights: [
            "Inspeções diárias com registro digital",
            "Monitoramento de manutenção preventiva e corretiva",
            "Interface direta com síndicos, gestores e fornecedores",
          ],
          deliverables: [
            "Relatórios de vistorias e acompanhamento de demandas",
            "Coordenação de pequenos reparos e solicitações emergenciais",
            "Gestão de contratos de manutenção predial",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1503387749549-0cbed1381eff?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Varredor",
        slug: "varredor",
        shortDescription: "",
        image: "/street-cleaning-worker.jpg",
        detail: {
          heroSubtitle: "Espaços externos cuidados para valorizar a sua imagem.",
          heroImage: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Nossos profissionais mantêm calçadas, estacionamentos, parques e áreas externas sempre limpos, garantindo segurança e conforto para quem circula pelos seus espaços.",
            "Com equipamentos adequados e rotinas planejadas, atuamos em condomínios, indústrias, centros comerciais e órgãos públicos com foco em produtividade e padronização.",
          ],
          highlights: [
            "Rotas personalizadas e otimizadas por turno",
            "Treinamento em coleta seletiva e descarte correto",
            "Relatórios fotográficos de entrega",
          ],
          deliverables: [
            "Varrição manual ou mecanizada conforme a área",
            "Manuseio e separação de resíduos conforme legislação",
            "Apoio em eventos e demandas extraordinárias",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
    ],
  },
  {
    id: "servicos-gerais",
    title: "Serviços Gerais",
    subtitle: "Como podemos ajudar sua empresa a crescer?",
    description:
      "Auxiliar de serviços gerais, copeira, maqueiro, ascensorista, lavador de veículos e operador de xerox.",
    services: [
      {
        name: "Auxiliar de Serviços Gerais",
        slug: "auxiliar-de-servicos-gerais",
        shortDescription: "",
        image: "/general-services-worker.jpg",
        detail: {
          heroSubtitle: "Versatilidade e eficiência nas rotinas operacionais.",
          heroImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Os auxiliares de serviços gerais da JSP atuam onde sua equipe mais precisa: organização, logística interna, manuseio de materiais, montagem de salas e apoio a eventos.",
            "Com foco em produtividade e segurança, eles seguem roteiros de trabalho definidos e recebem suporte constante da supervisão JSP.",
          ],
          highlights: [
            "Profissionais multifuncionais e treinados em segurança do trabalho",
            "Escalas flexíveis com cobertura para férias e afastamentos",
            "Monitoramento de produtividade e satisfação",
          ],
          deliverables: [
            "Organização de almoxarifados e áreas de armazenamento",
            "Movimentação de documentos, mobiliário e equipamentos",
            "Apoio logístico a eventos e montagens especiais",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1522156373667-4c7234bbd804?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1580894906472-d7dc2b5b079f?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Operador de Xerox",
        slug: "operador-de-xerox",
        shortDescription: "",
        image: "/copy-machine-operator.jpg",
        detail: {
          heroSubtitle: "Documentos produzidos com qualidade e total confidencialidade.",
          heroImage: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Garantimos a operação de centros de impressão corporativos com profissionais capacitados para todos os modelos de copiadoras e multifuncionais.",
            "Os operadores JSP seguem padrões de segurança da informação, controle de tiragens e manutenção preventiva dos equipamentos, reduzindo custos e garantindo disponibilidade.",
          ],
          highlights: [
            "Configuração de fluxos digitais e físicos",
            "Gestão de insumos e acompanhamento de contratos de locação",
            "Suporte imediato para usuários internos",
          ],
          deliverables: [
            "Produção e acabamento de materiais corporativos",
            "Digitalização e indexação de documentos",
            "Controle de consumo por centro de custo",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Maqueiro",
        slug: "maqueiro",
        shortDescription: "",
        image: "/hospital-stretcher-worker.jpg",
        detail: {
          heroSubtitle: "Cuidado e agilidade no deslocamento de pacientes.",
          heroImage: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Os maqueiros JSP atuam com empatia, protocolos de humanização e técnicas seguras de movimentação, respeitando cada etapa da jornada do paciente.",
            "A equipe é treinada para trabalhar em hospitais, clínicas e unidades de pronto atendimento, em total integração com as equipes assistenciais.",
          ],
          highlights: [
            "Formação em primeiros socorros e NR-32",
            "Comunicação clara com enfermagem e familiares",
            "Controle preciso de tempos de atendimento",
          ],
          deliverables: [
            "Transferência interna entre setores clínicos",
            "Apoio a remoções externas com equipes médicas",
            "Relatórios de movimentações e ocorrências",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1584982842173-1b29235ab885?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
    ],
  },
  {
    id: "arquitetura-engenharia",
    title: "Arquitetura e Engenharia",
    subtitle: "Como potencializar seus projetos com conhecimento técnico e rigor metodológico?",
    description:
      "Times especializados em arquitetura e engenharia para coordenar obras, projetos executivos e supervisão de campo com foco em qualidade.",
    services: [
      {
        name: "Engenharia Civil",
        slug: "engenharia-civil",
        shortDescription: "",
        image: "/civil-engineer.jpg",
        detail: {
          heroSubtitle: "Planejamento estrutural alinhado a custos, prazos e segurança.",
          heroImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Engenheiros civis que acompanham todas as fases do projeto, desde a concepção até a entrega final, garantindo conformidade com normas e indicadores de desempenho.",
            "Integram cronogramas, orçamentos e equipes multidisciplinares, tornando a execução previsível e rastreável.",
          ],
          highlights: [
            "Modelagem BIM integrada ao canteiro de obras",
            "Análises de viabilidade e riscos com indicadores claros",
            "Gestão de materiais e controles de custos",
          ],
          deliverables: [
            "Cronogramas executivos e planos de ação",
            "Relatórios semanais de desempenho",
            "Documentação técnica para licitações e auditorias",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Supervisão de Obras",
        slug: "supervisao-de-obras",
        shortDescription: "",
        image: "/site-supervisor.jpg",
        detail: {
          heroSubtitle: "Visão 360° do canteiro com foco em segurança e produtividade.",
          heroImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Supervisores experientes mantêm a execução sob controle, coordenando equipes, fornecedores e fornecedores de serviços terceirizados.",
            "Promovem fiscalizações diárias, verificam a utilização de materiais e escalas, garantindo que cada etapa seja concluída dentro dos padrões.",
          ],
          highlights: [
            "Checklists digitais e relatórios em tempo real",
            "Integração com equipes de segurança do trabalho",
            "Gestão de fornecedores e contratos de serviços",
          ],
          deliverables: [
            "Relatórios diários de obra",
            "Registro fotográfico e auditoria de qualidade",
            "Coordenação de entregas e recebimentos",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Projetos Executivos",
        slug: "projetos-executivos",
        shortDescription: "",
        image: "/blueprint-desk.jpg",
        detail: {
          heroSubtitle: "Detalhamento preciso que acelera a execução em campo.",
          heroImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Especialistas em arquitetura e engenharia produzem projetos completos com cortes, instalações elétricas, hidráulicas e estruturais, além de memórias de cálculo.",
            "Garantimos compatibilização técnica e integração com equipes de engenharia, facilities e manutenção.",
          ],
          highlights: [
            "Compatibilização multidisciplinar",
            "Revisões técnicas e homologação com fornecedores",
            "Entrega em formatos digitais e BIM",
          ],
          deliverables: [
            "Projetos em BIM e CAD",
            "Memórias de cálculo e especificações",
            "Pacotes de contratação e budget",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Coordenação Arquitetônica",
        slug: "coordenacao-arquitetonica",
        shortDescription: "",
        image: "/architects-collaboration.jpg",
        detail: {
          heroSubtitle: "Arquitetos que orientam a experiência do espaço e a entrega estética.",
          heroImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Coordenação arquitetônica para garantir identidade visual, fluxo de ocupação e usabilidade junto ao cliente.",
            "Acompanhamos decisões de acabamentos, mobiliários e interação com instalações críticas.",
          ],
          highlights: [
            "Desenvolvimento de layouts humanizados",
            "Padronização de materiais e acabamentos",
            "Integração com engenharia e facilities",
          ],
          deliverables: [
            "Layouts executivos e moodboards",
            "Planilhas de especificação de materiais",
            "Acompanhamento durante implementação",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
    ],
  },
  {
    id: "transporte",
    title: "Transporte e Logística",
    subtitle: "Como podemos ajudar sua empresa a crescer?",
    description: "Motoristas, carregadores, conferentes e arrumadores para operações logísticas eficientes.",
    services: [
      {
        name: "Motorista",
        slug: "motorista",
        shortDescription: "",
        image: "/professional-driver.jpg",
        detail: {
          heroSubtitle: "Condutores treinados para representar sua empresa nas estradas.",
          heroImage: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Oferecemos motoristas para frota leve, pesada e executiva, com foco em segurança, pontualidade e cordialidade.",
            "Acompanhamos a jornada de trabalho com indicadores de direção defensiva, consumo e manutenção preventiva.",
          ],
          highlights: [
            "Habilitações atualizadas e exames periódicos em dia",
            "Treinamentos em direção defensiva e condução econômica",
            "Suporte 24h para situações emergenciais",
          ],
          deliverables: [
            "Rotas planejadas e relatórios de viagens",
            "Controle de documentação do veículo e condutor",
            "Checklists de pré e pós-viagem",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1549921296-3ecf9bdd2146?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Carregador",
        slug: "carregador",
        shortDescription: "",
        image: "/warehouse-loader.jpg",
        detail: {
          heroSubtitle: "Agilidade no carregamento, cuidado com cada mercadoria.",
          heroImage: "https://images.unsplash.com/photo-1546541612-25d76b355c7b?auto=format&fit=crop&w=1600&q=80",
          description: [
            "A equipe de carregadores JSP segue procedimentos para manuseio ergonômico, conferência de volumes e organização de caminhões e depósitos.",
            "Com supervisão constante, garantimos cumprimento de prazos e redução de avarias.",
          ],
          highlights: [
            "Treinamento em normas de segurança e movimentação de cargas",
            "Integração com sistemas de WMS e controle de estoque",
            "Escalas flexíveis para operações noturnas e sazonais",
          ],
          deliverables: [
            "Carregamento e descarregamento coordenado",
            "Separação e paletização de produtos",
            "Registro fotográfico e conferência de volumes",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1520340356584-6a6f2c23c05c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
      {
        name: "Conferente",
        slug: "conferente",
        shortDescription: "",
        image: "/inventory-checker.jpg",
        detail: {
          heroSubtitle: "Precisão nos estoques e transparência nos processos logísticos.",
          heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
          description: [
            "Os conferentes JSP cuidam da entrada, separação e expedição de mercadorias, garantindo aderência às ordens de compra e pedidos de venda.",
            "Operamos com coletores de dados, inventários cíclicos e relatórios que dão visibilidade total da sua operação logística.",
          ],
          highlights: [
            "Experiência com WMS, ERP e processos fiscal/tributário",
            "Inventários rotativos e consolidação de divergências",
            "Relatórios com indicadores de acuracidade",
          ],
          deliverables: [
            "Conferência física e sistêmica de mercadorias",
            "Acompanhamento de devoluções e avarias",
            "Inventários periódicos com apontamento de melhorias",
          ],
          gallery: [
            "https://images.unsplash.com/photo-1544991185-13fe5d113fe9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      },
    ],
  },
]

export const servicesFlat: ServiceWithCategoryMeta[] = serviceCategories.flatMap((category) =>
  category.services.map((service) => ({
    ...service,
    categoryId: category.id,
    categoryTitle: category.title,
    categorySubtitle: category.subtitle,
  })),
)
