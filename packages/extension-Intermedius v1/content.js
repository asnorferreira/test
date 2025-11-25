(() => {
  // URL do backend configurável (padrão: porta 3000)
  const BACKEND_URL = (() => {
    try {
      const stored = localStorage.getItem('intermedius_backend_url');
      if (stored) return stored;
    } catch (e) {}
    return "http://localhost:3000";
  })();
  const PANEL_ID = "intermedius-widget-panel";
  const POLLING_INTERVAL_MS = 3000;
  
  // Modo MOCK - ativar quando não conseguir conectar ao backend
  const MOCK_MODE = (() => {
    try {
      const stored = localStorage.getItem('intermedius_mock_mode');
      if (stored !== null) return stored === 'true';
    } catch (e) {}
    return false;
  })();
  
  // FORÇAR MODO MOCK SE ESTIVER NO DOMÍNIO CORRETO
  let MOCK_MODE_FORCED = MOCK_MODE;
  if (window.location.href.includes('intermedius.app.br')) {
    try {
      localStorage.setItem('intermedius_mock_mode', 'true');
      MOCK_MODE_FORCED = true;
    } catch (e) {}
  }
  
  // Usar MOCK_MODE_FORCED ao invés de MOCK_MODE
  const USE_MOCK_MODE = MOCK_MODE_FORCED;
  const STATUS = {
    idle: { label: "Aguardando ID", className: "status-idle" },
    connecting: { label: "Conectando...", className: "status-connecting" },
    connected: { label: "Conectado", className: "status-connected" },
    error: { label: "Erro", className: "status-error" }
  };

  let currentConversationId = null;
  let eventSource = null;
  let pollingInterval = null;
  let isMinimized = true;
  let latestPayload = null;
  let isMounted = false;
  let messageObserver = null;
  let processedMessages = new Set(); // Rastrear mensagens já processadas
  const processedMessagesQueue = [];
  const MAX_PROCESSED_MESSAGES = 1200;
  let messageHistory = []; // Histórico de mensagens capturadas
  const MAX_MESSAGE_HISTORY = 400;

  function addMessageToHistory(message) {
    if (!message) return;
    messageHistory.push(message);
    if (messageHistory.length > MAX_MESSAGE_HISTORY) {
      messageHistory.splice(0, messageHistory.length - MAX_MESSAGE_HISTORY);
    }
  }

  function rememberProcessedMessage(id) {
    if (!id) return;
    processedMessages.add(id);
    processedMessagesQueue.push(id);
    if (processedMessagesQueue.length > MAX_PROCESSED_MESSAGES) {
      const oldest = processedMessagesQueue.shift();
      if (oldest) {
        processedMessages.delete(oldest);
      }
    }
  }
  let lastProcessedMessageHash = ''; // Hash das mensagens já processadas para evitar reprocessamento
  let suggestionsUpdateTimeout = null; // Timeout para atualizar sugestões (evitar mudanças muito rápidas)

  const elements = {
    panel: null,
    headerStatusText: null,
    headerStatusDot: null,
    headerConversationId: null,
    checklistContainer: null,
    suggestionsContainer: null,
    toggleButton: null,
    fabButton: null
  };

  function mountWidget() {
    if (isMounted) {
      return;
    }
    if (document.getElementById(PANEL_ID)) {
      elements.panel = document.getElementById(PANEL_ID);
      isMounted = true;
      return;
    }
    createPanel();
    createFab();
    observeConversationId();
    window.addEventListener("beforeunload", cleanup);
    
    // Expor funções globais para debug/controle
    window.intermediusWidget = {
      enableMock: () => {
        try {
          localStorage.setItem('intermedius_mock_mode', 'true');
          location.reload();
        } catch (e) {
          console.error("[Intermedius] Erro ao ativar modo local:", e);
        }
      },
      disableMock: () => {
        try {
          localStorage.setItem('intermedius_mock_mode', 'false');
          location.reload();
        } catch (e) {
          console.error("[Intermedius] Erro ao desativar modo local:", e);
        }
      },
      loadMock: () => {
        if (currentConversationId) {
          loadMockData(currentConversationId);
        } else {
          const sessionId = 'session-' + Date.now();
          currentConversationId = sessionId;
          updateConversationIdDisplay(sessionId);
          loadMockData(sessionId);
        }
      },
      captureMessages: () => {
        captureExistingMessages();
        return messageHistory.length;
      },
      getMessages: () => messageHistory,
      clearMessages: () => {
        processedMessages.clear();
        messageHistory = [];
        console.info("[Intermedius] Mensagens limpas");
      },
      getStatus: () => ({
        localMode: MOCK_MODE,
        conversationId: currentConversationId,
        backendUrl: BACKEND_URL,
        hasPayload: !!latestPayload
      })
    };
    
    
    isMounted = true;
  }

  function createPanel() {
    const panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-live", "polite");

    const header = document.createElement("header");
    header.className = "intermedius-header";

    const titleGroup = document.createElement("div");
    titleGroup.className = "intermedius-header-left";

    const brandGroup = document.createElement("div");
    brandGroup.className = "intermedius-brand";

    const logo = document.createElement("div");
    logo.className = "intermedius-logo";
    logo.textContent = "I";

    const brandText = document.createElement("div");
    brandText.className = "intermedius-brand-text";
    brandText.textContent = "Intermedius";

    brandGroup.appendChild(logo);
    brandGroup.appendChild(brandText);

    const statusWrap = document.createElement("div");
    statusWrap.className = "intermedius-status";

    const statusDot = document.createElement("span");
    statusDot.className = "intermedius-status-dot";
    statusWrap.appendChild(statusDot);

    const statusText = document.createElement("span");
    statusText.className = "intermedius-status-text";
    statusWrap.appendChild(statusText);

    const conversationText = document.createElement("div");
    conversationText.className = "intermedius-conversation";
    conversationText.textContent = "ID: —";

    titleGroup.appendChild(brandGroup);
    titleGroup.appendChild(statusWrap);
    titleGroup.appendChild(conversationText);

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "intermedius-toggle";
    toggleButton.textContent = "Minimizar";
    toggleButton.addEventListener("click", togglePanel);

    header.appendChild(titleGroup);
    header.appendChild(toggleButton);

    const checklistSection = document.createElement("section");
    checklistSection.className = "intermedius-section";
    const checklistTitle = document.createElement("h2");
    checklistTitle.textContent = "Checklist";
    checklistSection.appendChild(checklistTitle);

    const checklistList = document.createElement("ul");
    checklistList.className = "intermedius-list";
    checklistSection.appendChild(checklistList);

    const suggestionsSection = document.createElement("section");
    suggestionsSection.className = "intermedius-section";
    const suggestionsTitle = document.createElement("h2");
    suggestionsTitle.textContent = "Sugestões";
    suggestionsSection.appendChild(suggestionsTitle);

    const suggestionsList = document.createElement("div");
    suggestionsList.className = "intermedius-suggestions";
    suggestionsSection.appendChild(suggestionsList);

    panel.appendChild(header);
    panel.appendChild(checklistSection);
    panel.appendChild(suggestionsSection);

    document.body.appendChild(panel);

    elements.panel = panel;
    elements.headerStatusText = statusText;
    elements.headerStatusDot = statusDot;
    elements.headerConversationId = conversationText;
    elements.checklistContainer = checklistList;
    elements.suggestionsContainer = suggestionsList;
    elements.toggleButton = toggleButton;

    setStatus("idle");
    // Em modo MOCK, expandir o painel por padrão para mostrar os dados
    let isMockActive = false;
    try {
      isMockActive = localStorage.getItem('intermedius_mock_mode') === 'true';
    } catch (e) {}
    setPanelState((MOCK_MODE || isMockActive || window.location.href.includes('intermedius.app.br')) ? false : true);
  }

  function createFab() {
    if (elements.fabButton) return;
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "intermedius-fab";
    fab.textContent = "I";
    fab.title = "Abrir painel Intermedius";
    fab.addEventListener("click", () => setPanelState(false));
    document.body.appendChild(fab);
    elements.fabButton = fab;
    updateFabState();
  }

  function togglePanel() {
    setPanelState(!isMinimized);
  }

  function setPanelState(minimized) {
    isMinimized = minimized;
    if (elements.panel) {
      elements.panel.classList.toggle("intermedius-minimized", minimized);
    }
    if (elements.toggleButton) {
      elements.toggleButton.textContent = minimized ? "Expandir" : "Minimizar";
      elements.toggleButton.setAttribute("aria-pressed", String(minimized));
    }
    updateFabState();
  }

  function updateFabState() {
    if (!elements.fabButton) return;
    elements.fabButton.classList.toggle("visible", isMinimized);
    elements.fabButton.setAttribute("aria-hidden", String(!isMinimized));
  }

  function setStatus(statusKey) {
    const status = STATUS[statusKey] || STATUS.idle;
    if (elements.headerStatusText) {
      elements.headerStatusText.textContent = status.label;
    }
    if (elements.headerStatusDot) {
      elements.headerStatusDot.className = `intermedius-status-dot ${status.className}`;
    }
  }

  function updateConversationIdDisplay(id) {
    if (!elements.headerConversationId) return;
    elements.headerConversationId.textContent = `ID: ${id || "—"}`;
  }

  function observeConversationId() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    const checkConversation = () => {
      // Se modo MOCK ativado, usar ID mock se não houver ID real
      let isMockActive = false;
      try {
        isMockActive = localStorage.getItem('intermedius_mock_mode') === 'true';
      } catch (e) {}
      
      if (MOCK_MODE || isMockActive || window.location.href.includes('intermedius.app.br')) {
        if (!currentConversationId) {
          const sessionId = 'session-' + Date.now();
          currentConversationId = sessionId;
          updateConversationIdDisplay(sessionId);
        }
        // Em modo MOCK, sempre conectar (mesmo sem ID detectado)
        if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
          connectToStream(currentConversationId);
        }
        return;
      }
      
      const detectedId = getConversationId();
      updateConversationIdDisplay(detectedId);

      if (!detectedId) {
        setStatus("idle");
        disconnectStream();
        latestPayload = null;
        renderChecklist();
        renderSuggestions();
        return;
      }

      if (detectedId !== currentConversationId) {
        currentConversationId = detectedId;
        connectToStream(detectedId);
      }
    };

    checkConversation();
    pollingInterval = setInterval(checkConversation, POLLING_INTERVAL_MS);
  }

  function connectToStream(conversationId) {
    disconnectStream();
    
    // Se modo MOCK ativado, usar dados mockados e iniciar observação de mensagens
    let isMockActive = false;
    try {
      isMockActive = localStorage.getItem('intermedius_mock_mode') === 'true';
    } catch (e) {}
    
    if (MOCK_MODE || isMockActive || window.location.href.includes('intermedius.app.br')) {
      setStatus("connected");
      loadMockData(conversationId);
      startMessageObserver();
      return;
    }
    
    // Usar endpoint específico por conversationId
    const streamUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/stream/conversations/${encodeURIComponent(conversationId)}`;
    setStatus("connecting");

    try {
      eventSource = new EventSource(streamUrl);
      
      // Adicionar timeout para detectar se a conexão não estabelece
      const connectionTimeout = setTimeout(() => {
        if (eventSource && eventSource.readyState === EventSource.CONNECTING) {
          // Timeout na conexão SSE
          try {
            eventSource.close();
            eventSource = null;
          } catch (e) {
            // Ignorar erros ao fechar
          }
          
          // Ativar modo MOCK
          try {
            localStorage.setItem('intermedius_mock_mode', 'true');
          } catch (e) {
            // Ignorar se não conseguir salvar
          }
          
          setStatus("connected");
          loadMockData(conversationId);
        }
      }, 5000); // 5 segundos de timeout
      
      // Limpar timeout quando conectar com sucesso
      eventSource.onopen = () => {
        clearTimeout(connectionTimeout);
        setStatus("connected");
        // Iniciar observador de mensagens para capturar e enviar ao backend
        startMessageObserver();
      };
      
    } catch (error) {
      console.error("[Intermedius] Falha ao criar EventSource:", error);
      // Se falhar, ativar modo local automaticamente
      
      try {
        localStorage.setItem('intermedius_mock_mode', 'true');
      } catch (e) {
        // Erro ao salvar configuração
      }
      
      setStatus("connected");
      loadMockData(conversationId);
      return;
    }

    // Configurar handlers de mensagem e erro
    eventSource.onmessage = (event) => {
      if (!event?.data) return;
      try {
        const data = JSON.parse(event.data);
        
        // Processar diferentes tipos de eventos SSE
        if (data.type === 'connected') {
          return;
        }
        
        if (data.type === 'analysis:updated' && data.payload?.analysis) {
          // Formato do backend: analysis:updated com payload.analysis
          const analysis = data.payload.analysis;
          latestPayload = {
            checklist: analysis.checklist || [],
            suggestions: analysis.suggestions || [],
          };
          renderChecklist(analysis.checklist || []);
          renderSuggestions(analysis.suggestions || []);
          return;
        }
        
        // Formato legado (compatibilidade)
        if (data.checklist || data.suggestions) {
          latestPayload = data;
          renderChecklist(data.checklist || []);
          renderSuggestions(data.suggestions || []);
          return;
        }
        
        // Evento SSE não processado (logs removidos)
      } catch (error) {
        console.error("[Intermedius] Erro ao processar mensagem SSE:", error);
        setStatus("error");
      }
    };

    eventSource.onerror = (event) => {
      // Verificar o estado da conexão
      const readyState = eventSource?.readyState;
      const errorDetails = {
        readyState: readyState,
        readyStateText: readyState === EventSource.CONNECTING ? 'CONNECTING' : 
                       readyState === EventSource.OPEN ? 'OPEN' : 
                       readyState === EventSource.CLOSED ? 'CLOSED' : 'UNKNOWN',
        event: event,
        url: streamUrl
      };
      
      console.error("[Intermedius] Erro na conexão SSE:", errorDetails);
      
      // Verificar se já está em modo MOCK (verificar localStorage dinamicamente)
      let isMockMode = false;
      try {
        const stored = localStorage.getItem('intermedius_mock_mode');
        isMockMode = stored === 'true';
      } catch (e) {
        // Ignorar erro
      }
      
      // Se a conexão foi fechada ou não conseguiu conectar, ativar modo MOCK
      if (readyState === EventSource.CLOSED || readyState === EventSource.CONNECTING) {
        // Evitar múltiplas ativações do modo MOCK
        if (!isMockMode && !window.intermediusMockActivating) {
          window.intermediusMockActivating = true;
          // Erro na conexão SSE - ativando modo local automaticamente
          
          // Fechar conexão SSE se ainda estiver aberta
          try {
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }
          } catch (e) {
            // Erro ao fechar EventSource (silencioso)
          }
          
          // Ativar modo MOCK no localStorage
          try {
            localStorage.setItem('intermedius_mock_mode', 'true');
          } catch (e) {
            // Erro ao salvar configuração no localStorage
          }
          
          // Carregar dados mockados
          setStatus("connected");
          loadMockData(conversationId);
          
          // Limpar flag após um tempo
          setTimeout(() => {
            window.intermediusMockActivating = false;
          }, 1000);
        } else if (isMockMode) {
          // Já está em modo MOCK, apenas garantir que os dados estão carregados
          // Dados já carregados
        }
      } else if (readyState === EventSource.OPEN) {
        // Conexão está aberta mas houve erro - pode ser temporário
        console.warn("[Intermedius] ⚠️ Erro temporário na conexão SSE (conexão ainda aberta)");
        setStatus("error");
      }
    };
  }
  
  // Função para gerar dados MOCK - CHECKLIST DE COBRANÇA
  function generateMockData() {
    return {
      checklist: [
        { item: "ABERTURA_OPERADOR - Saudação, identificação e objetivo", state: "pending", evidence: null },
        { item: "SIGILO_BANCARIO - Confirmar identidade e proteger dados", state: "pending", evidence: null },
        { item: "ATUALIZACAO_DE_CADASTRO - Atualizar ou confirmar dados", state: "pending", evidence: null },
        { item: "MOTIVO_INADIMPLENCIA - Apurar motivo da inadimplência", state: "pending", evidence: null },
        { item: "EMPATIA - Demonstrar compreensão e cordialidade", state: "pending", evidence: null },
        { item: "ARGUMENTACAO - Apresentar argumentos lógicos", state: "pending", evidence: null },
        { item: "BENEFICIOS - Mostrar vantagens ou benefícios", state: "pending", evidence: null },
        { item: "TRANSTORNOS - Citar consequências de não pagar", state: "pending", evidence: null },
        { item: "OFERTA - Apresentar proposta de regularização", state: "pending", evidence: null },
        { item: "OFERTA_ENTREGA - Oferecer entrega amigável do veículo", state: "pending", evidence: null },
        { item: "OFERTA_RENEGOCIACAO - Sugerir renegociação", state: "pending", evidence: null },
        { item: "OFERTA_ATUALIZACAO - Propor atualização total da dívida", state: "pending", evidence: null },
        { item: "OFERTA_QUITACAO - Propor quitação completa", state: "pending", evidence: null },
        { item: "CARTAO_CREDITO - Mencionar uso de cartão de crédito", state: "pending", evidence: null },
        { item: "FINALIZACAO - Confirmar próximos passos e encerrar", state: "pending", evidence: null },
        { item: "NCG - Não conformidade grave (grosseria, xingamento)", state: "pending", evidence: null }
      ],
      suggestions: [
        {
          label: "Abrir Atendimento",
          text: "Olá! Sou [Nome] da [Empresa]. Estou entrando em contato para tratar sobre sua situação. Posso confirmar alguns dados com você?"
        },
        {
          label: "Confirmar Identidade",
          text: "Para sua segurança e sigilo bancário, posso confirmar seu CPF e nome completo?"
        }
      ]
    };
  }
  
  // Carregar dados MOCK
  function loadMockData(conversationId) {
    
    // SEMPRE inicializar com dados mock completos
    const mockData = generateMockData();
    latestPayload = mockData;
    
    // Limpar histórico de mensagens processadas ao carregar mock
    processedMessages.clear();
    messageHistory = [];
    
    // Renderizar checklist e sugestões iniciais imediatamente
    renderChecklist(latestPayload.checklist);
    
    // Gerar sugestões baseadas no checklist inicial
    generateSuggestionsBasedOnChecklist();
    
    renderSuggestions(latestPayload.suggestions || []);
    
    // Iniciar observador de mensagens imediatamente
    startMessageObserver();
    
    // Capturar mensagens existentes após delay
    setTimeout(() => {
      captureExistingMessages();
      // Processar imediatamente após capturar
      if (messageHistory.length > 0) {
        processMessages();
      }
    }, 1000);
    
    // Processar periodicamente para garantir que está sempre atualizado (OTIMIZADO - REMOVIDO)
    // NÃO processar periodicamente - apenas quando houver mensagens novas
    if (window.intermediusMockInterval) {
      clearInterval(window.intermediusMockInterval);
      window.intermediusMockInterval = null;
    }
  }

  function reconnectWithBackoff() {
    // Não reconectar se já estiver em modo MOCK ou se já estiver tentando reconectar
    if (MOCK_MODE || window.intermediusReconnecting) {
      return;
    }
    
    window.intermediusReconnecting = true;
    disconnectStream();
    
    setTimeout(() => {
      window.intermediusReconnecting = false;
      if (currentConversationId && !MOCK_MODE) {
        // Tentando reconectar (logs removidos)
        connectToStream(currentConversationId);
      }
    }, 2000);
  }

  function disconnectStream() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    stopMessageObserver();
  }

  // Observador de mensagens para capturar mensagens da tela
  function startMessageObserver() {
    if (messageObserver) {
      stopMessageObserver();
    }

    
    // Primeira captura: processar mensagens já existentes
    setTimeout(() => {
      captureExistingMessages();
    }, 1000);

    // Debounce para processar mensagens (LIBERADO PARA RECEBER MUITAS MENSAGENS)
    let processTimeout = null;
    const debouncedProcess = () => {
      if (processTimeout) clearTimeout(processTimeout);
      processTimeout = setTimeout(() => {
        processMessages();
      }, 200); // Processar rapidamente (200ms) para checklist responsivo
    };

    // Encontrar container de chat específico ao invés de observar o body inteiro
    const findChatContainer = () => {
      const chatSelectors = [
        '[class*="chat" i]',
        '[class*="conversation" i]',
        '[class*="messages" i]',
        '[role="log"]',
        '[role="region"]',
        '[id*="chat" i]',
        '[id*="message" i]',
        '[id*="conversation" i]'
      ];
      
      for (const selector of chatSelectors) {
        try {
          const container = document.querySelector(selector);
          if (container) {
            const rect = container.getBoundingClientRect();
            if (rect.width > 200 && rect.height > 100) {
              return container;
            }
          }
        } catch (e) {}
      }
      return null;
    };

    // Observar mudanças no DOM para capturar novas mensagens (OTIMIZADO)
    messageObserver = new MutationObserver((mutations) => {
      let hasNewMessages = false;
      let processedCount = 0;
      const MAX_PROCESS_PER_BATCH = 10; // Limitar processamento por batch
      
      mutations.forEach((mutation) => {
        if (processedCount >= MAX_PROCESS_PER_BATCH) return;
        
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (processedCount >= MAX_PROCESS_PER_BATCH) return;
            
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Filtrar elementos que claramente não são mensagens
              // Usar função auxiliar para normalizar className
              const nodeClass = getClassName(node).toLowerCase();
              const nodeTag = node.tagName?.toLowerCase();
              
              // FILTROS MÍNIMOS: Apenas elementos realmente não-mensagens (DOM TOTALMENTE LIBERADO)
              if (
                nodeTag === 'script' || 
                nodeTag === 'style' || 
                nodeTag === 'link' ||
                nodeTag === 'meta' ||
                nodeTag === 'noscript' ||
                nodeClass.includes('intermedius')
              ) {
                return;
              }
              
              // ACEITAR QUALQUER elemento que tenha textContent válido como potencial mensagem
              const textContent = node.textContent?.trim() || '';
              if (textContent.length >= 2 && textContent.length < 2000) {
                const message = extractMessageFromElement(node);
                if (message && !processedMessages.has(message.id)) {
                  rememberProcessedMessage(message.id);
                  addMessageToHistory(message);
                  hasNewMessages = true;
                  processedCount++;
                }
              }
            }
          });
        }
      });

      // Se houver novas mensagens, processar com debounce
      if (hasNewMessages) {
        debouncedProcess();
      }
    });

    // Tentar encontrar container de chat específico
    const chatContainer = findChatContainer();
    const observeTarget = chatContainer || document.body;
    
    // SEMPRE observar com subtree: true para capturar TODAS as mensagens
    messageObserver.observe(observeTarget, {
      childList: true,
      subtree: true, // OBSERVAR TUDO - SEM LIMITAÇÕES
      characterData: true // Também observar mudanças no texto
    });
    
    // Observer iniciado (logs removidos para limpar console)

      // Também escutar por eventos customizados de mensagens
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'newMessage') {
          const message = event.data.message;
          if (message && !processedMessages.has(message.id)) {
            rememberProcessedMessage(message.id);
            addMessageToHistory(message);
            // Só processar se realmente for uma mensagem nova
            debouncedProcess();
          }
        }
      });
  }

  function stopMessageObserver() {
    if (messageObserver) {
      messageObserver.disconnect();
      messageObserver = null;
    }
  }

  // Capturar mensagens já existentes na página (OTIMIZADO)
  function captureExistingMessages() {
    // CAPTURAR TODAS AS MENSAGENS VISÍVEIS NA TELA - SEM LIMITAÇÕES
    // Primeiro, tentar encontrar o container de chat específico
    const findChatContainer = () => {
      const chatSelectors = [
        '[class*="chat" i]',
        '[class*="conversation" i]',
        '[class*="messages" i]',
        '[role="log"]',
        '[role="region"]'
      ];
      
      for (const selector of chatSelectors) {
        try {
          const container = document.querySelector(selector);
          if (container) {
            const rect = container.getBoundingClientRect();
            if (rect.width > 200 && rect.height > 100) {
              return container;
            }
          }
        } catch (e) {}
      }
      return null;
    };

    const chatContainer = findChatContainer();
    const searchRoot = chatContainer || document.body;

    let newMessagesFound = 0;
    const processedElements = new Set();

    // ESTRATÉGIA AGRESSIVA: Capturar TODOS os elementos com texto visível
    const walker = document.createTreeWalker(
      searchRoot,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Pular nós dentro do nosso widget
          if (node.parentElement?.closest('#intermedius-widget-panel')) {
            return NodeFilter.FILTER_REJECT;
          }
          // Pular nós vazios ou muito pequenos
          const text = node.textContent?.trim() || '';
          if (text.length < 2 || text.length > 5000) {
            return NodeFilter.FILTER_REJECT;
          }
          // Pular apenas números, horários, datas, URLs, emails
          if (/^\d+$/.test(text) ||
              /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(text) ||
              /^\d{2}\/\d{2}\/\d{4}$/.test(text) ||
              /^https?:\/\//i.test(text) ||
              /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(text) ||
              /^(Checklist|Sugestões|Sem itens|Nenhuma sugestão|Minimizar|Expandir)$/i.test(text)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const parentElement = node.parentElement;
      if (!parentElement || processedElements.has(parentElement)) {
        continue;
      }
      
      processedElements.add(parentElement);
      
      // Tentar extrair mensagem do elemento pai
      const message = extractMessageFromElement(parentElement);
      if (message && !processedMessages.has(message.id)) {
        rememberProcessedMessage(message.id);
        addMessageToHistory(message);
        newMessagesFound++;
      }
    }

    // TAMBÉM tentar seletores específicos como fallback
    const messageSelectors = [
      '[data-message-id]',
      '[data-message]',
      '[class*="message" i]',
      '[class*="bubble" i]',
      '[class*="chat" i] > *',
      'div[class*="text" i]',
      'p[class*="content" i]'
    ];

    messageSelectors.forEach(selector => {
      try {
        const elements = searchRoot.querySelectorAll(selector);
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          
          processedElements.add(element);
          
          const text = element.textContent?.trim() || '';
          if (text.length < 2 || text.length > 5000) return;
          
          // Pular elementos do widget
          if (element.closest('#intermedius-widget-panel')) return;
          
          // Pular elementos claramente não-mensagens
          if (/^\d{2}:\d{2}$/.test(text) ||
              /^\d{2}\/\d{2}\/\d{4}$/.test(text) ||
              /^(Checklist|Sugestões|Sem itens|Nenhuma sugestão|Minimizar|Expandir)$/i.test(text)) {
            return;
          }

          const message = extractMessageFromElement(element);
          if (message && !processedMessages.has(message.id)) {
            rememberProcessedMessage(message.id);
            addMessageToHistory(message);
            newMessagesFound++;
          }
        });
      } catch (e) {
        // Erro silencioso - não logar para não poluir console
      }
    });

    if (newMessagesFound > 0 || messageHistory.length > 0) {
      // SEMPRE processar se houver mensagens
      processMessages();
    } else {
      // Tentar novamente após 2 segundos (máximo 3 tentativas)
      if (!captureExistingMessages.attempts) {
        captureExistingMessages.attempts = 0;
      }
      captureExistingMessages.attempts++;
      if (captureExistingMessages.attempts < 3) {
        setTimeout(() => {
          captureExistingMessages();
        }, 2000);
      }
    }
  }

  // Função auxiliar para normalizar className (pode ser string, DOMTokenList ou SVGAnimatedString)
  function getClassName(element) {
    if (!element || !element.className) return '';
    if (typeof element.className === 'string') return element.className;
    if (element.className.baseVal) return element.className.baseVal;
    if (typeof element.className.toString === 'function') return element.className.toString();
    return String(element.className || '');
  }

  // Extrair mensagem de um elemento DOM
  function extractMessageFromElement(element) {
    if (!element || typeof element.querySelector !== 'function') {
      return null;
    }

    try {
      // Tentar encontrar texto da mensagem
      // Priorizar elementos com classes que indicam mensagem
      let text = '';
      
      // Estratégia 1: Pegar texto DIRETO do elemento primeiro (mais confiável)
      let textContent = element.textContent?.trim() || '';
      
      // Se não tiver texto direto, procurar em filhos
      if (!textContent || textContent.length < 2) {
        const textElements = [
          element.querySelector('[class*="text" i]'),
          element.querySelector('[class*="content" i]'),
          element.querySelector('[class*="message" i]'),
          element.querySelector('p'),
          element.querySelector('div[class*="message"]'),
          element.querySelector('span'),
          element
        ].filter(el => el);

        for (const el of textElements) {
          textContent = el.textContent?.trim() || '';
          if (textContent && textContent.length >= 2) {
            break;
          }
        }
      }
      
      // Remover espaços excessivos e quebras de linha
      textContent = textContent.replace(/\s+/g, ' ').trim();
      
      // Validar se é uma mensagem válida (FILTROS MÍNIMOS - ACEITAR MAIS)
      if (
        textContent.length >= 2 &&
        textContent.length < 5000 && // Aumentado para 5000 para pegar mensagens longas
        !/^\d+$/.test(textContent) && // Não é apenas números
        !/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(textContent) && // Não é apenas horário
        !/^\d{2}\/\d{2}\/\d{4}$/.test(textContent) && // Não é apenas data
        !/^https?:\/\//i.test(textContent) && // Não é apenas URL
        !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(textContent) && // Não é apenas email
        !/^\s*$/.test(textContent) && // Não é apenas espaços
        !/^[^\w\s]*$/.test(textContent) // Não é apenas símbolos/pontuação
      ) {
        text = textContent;
      }

      if (!text || text.length < 2) {
        return null;
      }

      // REMOVIDO: Lógica de identificação de autor
      // Agora processamos TODAS as mensagens, não importa quem enviou
      // O checklist funciona apenas com palavras-chave, sem distinguir autor
      const author = 'message'; // Valor fixo (não usado mais para filtragem)

      // Gerar ID estável para a mensagem (baseado em atributos do DOM ou hash do texto)
      const domIdentifier =
        element.getAttribute('data-message-id') ||
        element.getAttribute('data-id') ||
        element.getAttribute('id') ||
        element.dataset?.message ||
        null;

      const textHash = text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 120)
        .replace(/[^a-z0-9]+/gi, '-');

      const id = domIdentifier
        ? `dom-${domIdentifier}`
        : `msg-${textHash || 'hash'}` // Mudado para não usar author

      // Logs removidos para limpar console - apenas erros críticos são logados

      return {
        id,
        text,
        author,
        timestamp: new Date().toISOString(),
        element
      };
    } catch (error) {
      console.debug("[Intermedius] Erro ao extrair mensagem:", error);
      return null;
    }
  }

  // Processar mensagens capturadas e atualizar checklist/sugestões (SEMPRE PROCESSAR PARA CHECKLIST)
  function processMessages() {
    // SEMPRE processar se houver mensagens (liberar DOM para receber muitas mensagens)
    if (messageHistory.length === 0) {
      return; // Sem mensagens, não processar
    }
    
    // Processando mensagens (logs removidos para limpar console)
    
    // SEMPRE processar localmente quando em modo MOCK
    // Forçar modo MOCK se não houver payload inicial
    if (!latestPayload) {
      latestPayload = generateMockData();
    }

    // Analisar TODAS as mensagens (sem filtrar por autor)
    // Agora processamos todas as mensagens para encontrar palavras-chave
    const allMessages = messageHistory;

    // SEMPRE ATUALIZAR CHECKLIST baseado em TODAS as mensagens
    if (allMessages.length > 0) {
      // Usar todas as mensagens para análise completa do contexto
      updateChecklistFromMessages(allMessages);
    }

    // SEMPRE GERAR SUGESTÕES BASEADAS NO CHECKLIST (não nas mensagens diretamente)
    generateSuggestionsBasedOnChecklist();

    // SEMPRE ATUALIZAR UI
    if (latestPayload) {
      renderChecklist(latestPayload.checklist || []);
      renderSuggestions(latestPayload.suggestions || []);
    }
  }

  // Atualizar checklist baseado em TODAS as mensagens - SISTEMA SIMPLIFICADO E DIRETO
  function updateChecklistFromMessages(allMessages) {
    if (!allMessages || allMessages.length === 0) {
      return;
    }

    // Garantir que há um checklist
    if (!latestPayload) {
      latestPayload = generateMockData();
    }
    
    if (!latestPayload.checklist || latestPayload.checklist.length === 0) {
      latestPayload.checklist = generateMockData().checklist;
    }

    // Função auxiliar simples: limpar texto da mensagem
    const cleanMessageText = (text) => {
      if (!text) return '';
      let cleaned = text.toLowerCase().trim();
      // Remover prefixos como "Romulo: " ou "Nome: " - padrão mais flexível
      cleaned = cleaned.replace(/^[a-zà-ÿáéíóúâêîôûãõç]+\s*:\s*/i, '').trim();
      // Também remover "Romulo:" mesmo se não tiver espaço
      cleaned = cleaned.replace(/^romulo\s*:\s*/i, '').trim();
      return cleaned;
    };

    // Função auxiliar simples: verificar se mensagem corresponde a padrões
    const messageMatches = (message, patterns) => {
      if (!message || !message.text) return false;
      
      const originalText = message.text.toLowerCase();
      const cleanedText = cleanMessageText(message.text);
      
      const matches = patterns.some(pattern => {
        const originalMatch = pattern.test(originalText);
        const cleanedMatch = pattern.test(cleanedText);
        return originalMatch || cleanedMatch;
      });
      
      return matches;
    };
    
    // SISTEMA SIMPLIFICADO: Para cada item do checklist, verificar diretamente nas mensagens
    latestPayload.checklist.forEach((item) => {
      const itemText = item.item.toLowerCase();
      let patterns = [];
      let foundMessage = null;

      // ABERTURA_OPERADOR
      if (itemText.includes('abertura_operador') || itemText.includes('saudação')) {
        patterns = [
          /olá/i, /oi/i, /bom dia/i, /boa tarde/i, /boa noite/i,
          /sou.*da/i, /estou entrando em contato/i, /tratar sobre/i,
          /como posso ajudar/i, /em que posso ajudar/i,
          /^olá/i, // Começa com Olá
          /sou\s+[a-zà-ÿáéíóúâêîôûãõç]+\s+da/i // Sou [Nome] da [Empresa]
        ];
      }
      // SIGILO_BANCARIO
      else if (itemText.includes('sigilo_bancario') || itemText.includes('sigilo')) {
        patterns = [
          /confirmar.*dados/i, /posso confirmar/i, /pode confirmar/i,
          /cpf/i, /nome completo/i, /identidade/i, /dados pessoais/i
        ];
      }
      // ATUALIZACAO_DE_CADASTRO
      else if (itemText.includes('atualizacao_de_cadastro') || itemText.includes('atualização') || itemText.includes('cadastro')) {
        patterns = [/atualizar.*dados/i, /atualizar.*cadastro/i, /confirmar.*dados/i, /dados cadastrais/i];
      }
      // MOTIVO_INADIMPLENCIA
      else if (itemText.includes('motivo_inadimplencia') || itemText.includes('inadimplência') || itemText.includes('motivo')) {
        patterns = [/motivo/i, /razão/i, /por que/i, /situação/i, /dificuldade/i, /problema/i];
      }
      // EMPATIA
      else if (itemText.includes('empatia')) {
        patterns = [/entendo/i, /compreendo/i, /imagino/i, /sinto muito/i, /lamento/i, /não se preocupe/i, /vamos resolver/i];
      }
      // ARGUMENTACAO
      else if (itemText.includes('argumentacao') || itemText.includes('argumentação')) {
        patterns = [/importante/i, /necessário/i, /essencial/i, /fundamental/i, /é importante/i, /você precisa/i];
      }
      // BENEFICIOS
      else if (itemText.includes('beneficios') || itemText.includes('benefícios')) {
        patterns = [/benefício/i, /vantagem/i, /você ganha/i, /você tem/i, /é vantajoso/i];
      }
      // TRANSTORNOS
      else if (itemText.includes('transtornos')) {
        patterns = [/consequência/i, /problema/i, /prejuízo/i, /protesto/i, /negativação/i, /ação judicial/i];
      }
      // OFERTA (genérica)
      else if (itemText.includes('oferta') && !itemText.includes('entrega') && !itemText.includes('renegociacao') && !itemText.includes('atualizacao') && !itemText.includes('quitacao')) {
        patterns = [/oferta/i, /proposta/i, /condição/i, /opção/i, /negociação/i, /regularizar/i];
      }
      // OFERTA_ENTREGA
      else if (itemText.includes('oferta_entrega') || itemText.includes('entrega amigável')) {
        patterns = [/entrega/i, /devolução/i, /retirar/i, /buscar/i, /entrega amigável/i];
      }
      // OFERTA_RENEGOCIACAO
      else if (itemText.includes('oferta_renegociacao') || itemText.includes('renegociação') || itemText.includes('renegociacao')) {
        patterns = [/renegociação/i, /renegociar/i, /refinanciamento/i, /nova condição/i, /parcelar/i];
      }
      // OFERTA_ATUALIZACAO
      else if (itemText.includes('oferta_atualizacao') || itemText.includes('atualização total')) {
        patterns = [/atualização total/i, /atualizar tudo/i, /quitar tudo/i, /pagar tudo/i];
      }
      // OFERTA_QUITACAO
      else if (itemText.includes('oferta_quitacao') || itemText.includes('quitação')) {
        patterns = [/quitação/i, /quitar/i, /pagar tudo/i, /pagar completo/i, /desconto.*quitação/i];
      }
      // CARTAO_CREDITO
      else if (itemText.includes('cartao_credito') || itemText.includes('cartão')) {
        patterns = [/cartão/i, /crédito/i, /débito/i, /pode usar.*cartão/i, /aceitamos.*cartão/i];
      }
      // FINALIZACAO
      else if (itemText.includes('finalizacao') || itemText.includes('finalização')) {
        patterns = [/finalizar/i, /encerrar/i, /próximos passos/i, /vou enviar/i, /vou preparar/i, /obrigado/i, /até logo/i];
      }
      // NCG
      else if (itemText.includes('ncg') || itemText.includes('não conformidade')) {
        patterns = [/merda/i, /porra/i, /caralho/i, /puta/i, /vai se foder/i, /idiota/i, /imbecil/i];
      }

      // Se encontrou padrões para este item, verificar nas mensagens
      if (patterns.length > 0) {
        foundMessage = allMessages.find(m => messageMatches(m, patterns));
        
        if (foundMessage) {
          item.state = (itemText.includes('ncg')) ? 'warn' : 'done';
          item.evidence = {
            excerpt: foundMessage.text.substring(0, 150)
          };
        }
      }
    });
    
    // SEMPRE renderizar checklist após atualização
    if (latestPayload && latestPayload.checklist) {
      renderChecklist(latestPayload.checklist);
    }
  }

  // Gerar sugestões para mensagens (ANÁLISE DINÂMICA MELHORADA - 100% CONTEXTUAL)
  function generateSuggestionsForMessages(messages) {
    if (!latestPayload) {
      latestPayload = { checklist: [], suggestions: [] };
    }

    if (messages.length === 0) {
      // Sem mensagens, usar sugestões de cobrança
      latestPayload.suggestions = [
        {
          label: "Abrir Atendimento",
          text: "Olá! Sou [Nome] da [Empresa]. Estou entrando em contato para tratar sobre sua situação. Posso confirmar alguns dados com você?"
        },
        {
          label: "Confirmar Identidade",
          text: "Para sua segurança e sigilo bancário, posso confirmar seu CPF e nome completo?"
        }
      ];
      return;
    }

    const lastMessage = messages[messages.length - 1];
    // REMOVIDO: Filtros por author - agora processamos todas as mensagens
    const allMessagesText = messages.map(m => m.text.toLowerCase()).join(' ');
    
    // Calcular hash de TODAS as mensagens para detectar mudanças REAIS
    // Hash baseado apenas no texto, sem author
    const allMessagesHash = messages.map(m => `${m.text.substring(0, 100)}`).join('|||');
    const previousHash = latestPayload._messagesHash || '';
    
    // Se não mudou nada, NÃO regenerar sugestões (evitar atualização desnecessária)
    if (allMessagesHash === previousHash && latestPayload.suggestions && latestPayload.suggestions.length > 0) {
      return; // Mensagens não mudaram, manter sugestões atuais - NÃO ATUALIZAR DOM
    }
    
    // Só atualizar hash se realmente houver mudança
    if (allMessagesHash !== previousHash) {
      latestPayload._messagesHash = allMessagesHash;
    } else {
      // Se hash é igual, não fazer nada
      return;
    }
    
    const suggestions = [];

    // ANÁLISE CONTEXTUAL AVANÇADA - Analisar toda a conversa, não apenas última mensagem
    const conversationContext = {
      hasGreeting: /(olá|oi|bom dia|boa tarde|boa noite|tudo bem)/i.test(allMessagesText),
      hasProductMention: /(produto|item|serviço|solução|oferta)/i.test(allMessagesText),
      hasPriceMention: /(preço|valor|orçamento|custo|quanto|R\$)/i.test(allMessagesText),
      hasDeadlineMention: /(prazo|entrega|tempo|quando|disponibilidade)/i.test(allMessagesText),
      hasDataRequest: /(nome|telefone|email|endereço|dados|cpf|cnpj)/i.test(allMessagesText),
      hasProposalMention: /(proposta|enviar|documento|anexo|arquivo)/i.test(allMessagesText),
      hasClosing: /(obrigado|agradeço|até logo|finalizar|encerrar)/i.test(allMessagesText),
      // REMOVIDO: clientAsking e agentResponding - não distinguimos mais autor
      conversationLength: messages.length
    };

    // Gerar sugestões baseadas no contexto da conversa (sem distinguir autor)
    if (lastMessage) {
      const lastText = lastMessage.text.toLowerCase();
      const recentMessages = messages.slice(-3).map(m => m.text.toLowerCase()).join(' ');

      // SAUDAÇÃO INICIAL
      if (/^(olá|oi|hello|bom dia|boa tarde|boa noite|tudo bem)/i.test(lastText) && !conversationContext.hasGreeting) {
        suggestions.push({
          label: "Saudação Cordial",
          text: "Olá! Fico feliz em atendê-lo. Como posso ajudá-lo hoje?"
        });
        suggestions.push({
          label: "Saudação com Apresentação",
          text: "Olá! Sou [Nome do Atendente] e estou aqui para ajudá-lo. Em que posso ser útil?"
        });
      }
      // PERGUNTA SOBRE PRODUTO
      else if (/(produto|item|serviço|o que|quais|quais são)/i.test(lastText) && conversationContext.hasProductMention) {
        suggestions.push({
          label: "Informar sobre Produto",
          text: "Fico feliz pelo seu interesse! Posso enviar informações detalhadas sobre nosso produto. Gostaria de receber mais detalhes?"
        });
        suggestions.push({
          label: "Apresentar Benefícios",
          text: "Nosso produto oferece [benefício 1], [benefício 2] e [benefício 3]. Posso enviar mais informações?"
        });
      }
      // PERGUNTA SOBRE PREÇO
      else if (/(preço|valor|quanto|custo|quanto custa|quanto é)/i.test(lastText)) {
        if (!conversationContext.hasPriceMention || !/(R\$|\d+,\d{2})/i.test(allMessagesText)) {
          suggestions.push({
            label: "Solicitar Informações para Orçamento",
            text: "Claro! Para preparar um orçamento personalizado, preciso de algumas informações. Pode me passar mais detalhes sobre sua necessidade?"
          });
        } else {
          suggestions.push({
            label: "Confirmar Preço",
            text: "O valor é R$ [valor]. Posso preparar uma proposta comercial com mais detalhes?"
          });
        }
      }
      // PERGUNTA SOBRE PRAZO
      else if (/(prazo|entrega|tempo|quando|quanto tempo|disponibilidade)/i.test(lastText)) {
        suggestions.push({
          label: "Informar Prazo",
          text: "Quanto ao prazo, normalmente realizamos a entrega em [X] dias úteis. Posso verificar um prazo mais específico para seu caso?"
        });
        suggestions.push({
          label: "Confirmar Urgência",
          text: "Qual a urgência para você? Posso verificar se conseguimos acelerar o processo."
        });
      }
      // SOLICITAÇÃO DE DADOS/CONTATO
      else if (/(agendar|reunião|encontro|horário|contato|ligar|telefonar)/i.test(lastText)) {
        suggestions.push({
          label: "Agendar Reunião",
          text: "Perfeito! Posso agendar uma reunião para discutirmos melhor. Qual horário seria melhor para você?"
        });
        suggestions.push({
          label: "Solicitar Dados de Contato",
          text: "Claro! Pode me passar seu telefone ou email para entrarmos em contato?"
        });
      }
      // PERGUNTA GENÉRICA - Analisar contexto completo e conteúdo real
      else {
        // Extrair palavras-chave da última mensagem
        const messageWords = lastText.split(/\s+/).filter(w => w.length > 3);
        const uniqueWords = [...new Set(messageWords)].slice(0, 3);
        
        // Se já mencionou produto mas não preço
        if (conversationContext.hasProductMention && !conversationContext.hasPriceMention) {
          suggestions.push({
            label: "Informar Preço do Produto",
            text: "Sobre o preço, posso preparar um orçamento personalizado. Pode me passar mais detalhes sobre sua necessidade?"
          });
          if (uniqueWords.length > 0) {
            suggestions.push({
              label: `Detalhes sobre ${uniqueWords[0]}`,
              text: `Sobre ${uniqueWords[0]}, posso fornecer mais informações. O que gostaria de saber?`
            });
          }
        }
        // Se já mencionou preço mas não prazo
        else if (conversationContext.hasPriceMention && !conversationContext.hasDeadlineMention) {
          suggestions.push({
            label: "Informar Prazo",
            text: "Quanto ao prazo de entrega, normalmente fazemos em [X] dias. Isso atende sua necessidade?"
          });
          suggestions.push({
            label: "Confirmar Disponibilidade",
            text: "Posso verificar a disponibilidade imediata. Qual sua urgência?"
          });
        }
        // Se já tem contexto de produto e preço, sugerir próxima etapa
        else if (conversationContext.hasProductMention && conversationContext.hasPriceMention) {
          suggestions.push({
            label: "Enviar Proposta",
            text: "Perfeito! Posso preparar uma proposta comercial completa com todos os detalhes. Pode me passar seu email para envio?"
          });
          suggestions.push({
            label: "Agendar Apresentação",
            text: "Gostaria de agendar uma apresentação para discutirmos melhor? Qual horário funciona para você?"
          });
        }
        // Sugestões genéricas inteligentes baseadas no conteúdo
        else {
          if (uniqueWords.length > 0) {
            suggestions.push({
              label: `Responder sobre ${uniqueWords[0]}`,
              text: `Sobre ${uniqueWords[0]}, posso ajudá-lo. Pode me dar mais detalhes sobre o que precisa?`
            });
          }
          suggestions.push({
            label: "Entender Necessidade",
            text: "Entendo sua questão. Para melhor atendê-lo, pode me contar um pouco mais sobre sua necessidade?"
          });
          if (messages.length > 1) {
            suggestions.push({
              label: "Resumir Conversa",
              text: "Deixe-me resumir o que entendi até agora e verificar se está correto."
            });
          }
        }
      }
    }
    // REMOVIDO: Lógica baseada em agentResponding - agora processamos todas as mensagens igualmente
    // As sugestões são geradas baseadas apenas no conteúdo e no checklist, sem distinguir autor

    // Se não houver sugestões específicas, gerar baseado no contexto geral e checklist
    if (suggestions.length === 0) {
      // Verificar checklist para ver o que está pendente
      const pendingItems = (latestPayload.checklist || []).filter(item => item.state === 'pending');
      
      if (pendingItems.length > 0) {
        const firstPending = pendingItems[0].item.toLowerCase();
        
        if (firstPending.includes('saudar')) {
          suggestions.push({
            label: "Saudar Cliente",
            text: "Olá! Tudo bem? Como posso ajudá-lo hoje?"
          });
        } else if (firstPending.includes('necessidade') || firstPending.includes('identificar')) {
          suggestions.push({
            label: "Identificar Necessidade",
            text: "Entendi. Pode me contar um pouco mais sobre sua necessidade?"
          });
        } else if (firstPending.includes('produto') || firstPending.includes('serviço')) {
          suggestions.push({
            label: "Apresentar Produto",
            text: "Tenho uma solução perfeita para você. Posso apresentar os detalhes?"
          });
        } else if (firstPending.includes('preço') || firstPending.includes('orçamento')) {
          suggestions.push({
            label: "Informar Preço",
            text: "Claro! Vou preparar um orçamento personalizado. Pode me passar mais informações?"
          });
        }
      }
      
      // Sugestões genéricas de fallback
      if (suggestions.length < 2) {
        suggestions.push({
          label: "Continuar Atendimento",
          text: "Como posso ajudá-lo com mais alguma coisa?"
        });
        suggestions.push({
          label: "Finalizar Atendimento",
          text: "Agradeço seu contato! Se precisar de mais alguma coisa, estarei à disposição."
        });
      }
    }

    // Sempre garantir pelo menos 2 sugestões e limitar a 4
    while (suggestions.length < 2) {
      suggestions.push({
        label: "Continuar Conversa",
        text: "O que mais posso ajudá-lo?"
      });
    }

    // Limitar a 4 sugestões
    const finalSuggestions = suggestions.slice(0, 4);
    
    // IMPORTANTE: Só atualizar se as sugestões forem diferentes das anteriores
    const previousSuggestions = latestPayload.suggestions || [];
    const previousLabels = previousSuggestions.map(s => s.label).join('|');
    const previousTexts = previousSuggestions.map(s => s.text).join('|');
    const currentLabels = finalSuggestions.map(s => s.label).join('|');
    const currentTexts = finalSuggestions.map(s => s.text).join('|');
    
    // Se são idênticas (labels E textos), NÃO atualizar (evitar mudança desnecessária no DOM)
    if (previousLabels === currentLabels && previousTexts === currentTexts && previousSuggestions.length > 0) {
      return; // Sugestões são idênticas, não atualizar
    }
    
    // TIMEOUT: Aguardar 1 segundo antes de atualizar sugestões (evitar mudanças muito rápidas)
    // Se já existe um timeout, cancelar e criar um novo (reset do timer)
    if (suggestionsUpdateTimeout) {
      clearTimeout(suggestionsUpdateTimeout);
      suggestionsUpdateTimeout = null;
    }
    
    // Armazenar as sugestões atuais para comparação no timeout
    const finalSuggestionsCopy = finalSuggestions.map(s => ({ ...s }));
    
    // Atualizar imediatamente no payload (para que esteja disponível)
    latestPayload.suggestions = finalSuggestionsCopy;
    latestPayload.suggestionsLastUpdate = Date.now();
    
    suggestionsUpdateTimeout = setTimeout(() => {
      // Renderizar sugestões após o timeout
      renderSuggestions(latestPayload.suggestions);
      suggestionsUpdateTimeout = null;
    }, 1000); // 1 segundo de delay
  }

  // Gerar sugestões BASEADAS APENAS NO CHECKLIST (PRINCIPAL FUNÇÃO)
  function generateSuggestionsBasedOnChecklist() {
    if (!latestPayload) {
      latestPayload = generateMockData();
    }

    const suggestions = [];
    const checklist = latestPayload.checklist || [];

    // Gerar sugestões baseadas em itens PENDENTES do checklist (ordem de prioridade)
    const pendingItems = checklist.filter(item => item.state === 'pending');
    
    // Pegar os primeiros 4 itens pendentes e gerar sugestões
    pendingItems.slice(0, 4).forEach((item) => {
      const itemText = item.item.toLowerCase();
      
      // ABERTURA_OPERADOR
      if (itemText.includes('abertura_operador') || itemText.includes('saudação')) {
        suggestions.push({
          label: "Abrir Atendimento",
          text: "Olá! Sou [Nome] da [Empresa]. Estou entrando em contato para tratar sobre sua situação. Posso confirmar alguns dados com você?"
        });
      }
      // SIGILO_BANCARIO
      else if (itemText.includes('sigilo_bancario') || itemText.includes('sigilo')) {
        suggestions.push({
          label: "Confirmar Identidade",
          text: "Para sua segurança e sigilo bancário, posso confirmar seu CPF e nome completo?"
        });
      }
      // ATUALIZACAO_DE_CADASTRO
      else if (itemText.includes('atualizacao_de_cadastro') || itemText.includes('atualização') || itemText.includes('cadastro')) {
        suggestions.push({
          label: "Atualizar Cadastro",
          text: "Gostaria de atualizar seus dados cadastrais? Pode me informar seu endereço e telefone atualizados?"
        });
      }
      // MOTIVO_INADIMPLENCIA
      else if (itemText.includes('motivo_inadimplencia') || itemText.includes('inadimplência') || itemText.includes('motivo')) {
        suggestions.push({
          label: "Apurar Motivo",
          text: "Entendo sua situação. Pode me contar qual foi o motivo da inadimplência? Isso me ajudará a encontrar a melhor solução para você."
        });
      }
      // EMPATIA
      else if (itemText.includes('empatia')) {
        suggestions.push({
          label: "Demonstrar Empatia",
          text: "Entendo sua situação e sei que pode ser difícil. Estou aqui para ajudá-lo a encontrar a melhor solução."
        });
      }
      // ARGUMENTACAO
      else if (itemText.includes('argumentacao') || itemText.includes('argumentação')) {
        suggestions.push({
          label: "Apresentar Argumentos",
          text: "É importante regularizar sua situação para evitar consequências. Vamos encontrar uma solução que funcione para você."
        });
      }
      // BENEFICIOS
      else if (itemText.includes('beneficios') || itemText.includes('benefícios')) {
        suggestions.push({
          label: "Mostrar Benefícios",
          text: "Ao regularizar, você terá vantagens como [benefício 1], [benefício 2] e [benefício 3]. Isso é muito vantajoso para você."
        });
      }
      // TRANSTORNOS
      else if (itemText.includes('transtornos')) {
        suggestions.push({
          label: "Citar Consequências",
          text: "Sem regularização, podem ocorrer consequências como protesto, negativação e restrições. Vamos evitar isso?"
        });
      }
      // OFERTA
      else if (itemText.includes('oferta') && !itemText.includes('entrega') && !itemText.includes('renegociacao') && !itemText.includes('atualizacao') && !itemText.includes('quitacao')) {
        suggestions.push({
          label: "Apresentar Oferta",
          text: "Tenho uma proposta de regularização que pode funcionar para você. Posso apresentar as condições?"
        });
      }
      // OFERTA_ENTREGA
      else if (itemText.includes('oferta_entrega') || itemText.includes('entrega amigável')) {
        suggestions.push({
          label: "Oferecer Entrega",
          text: "Posso oferecer uma entrega amigável do veículo. Isso evita processos mais complicados. Gostaria de saber mais?"
        });
      }
      // OFERTA_RENEGOCIACAO
      else if (itemText.includes('oferta_renegociacao') || itemText.includes('renegociação')) {
        suggestions.push({
          label: "Sugerir Renegociação",
          text: "Posso propor uma renegociação com condições mais favoráveis. Podemos parcelar em até [X] vezes. Interessa?"
        });
      }
      // OFERTA_ATUALIZACAO
      else if (itemText.includes('oferta_atualizacao') || itemText.includes('atualização total')) {
        suggestions.push({
          label: "Propor Atualização Total",
          text: "Posso propor uma atualização total da dívida com condições especiais. Quer que eu prepare uma proposta?"
        });
      }
      // OFERTA_QUITACAO
      else if (itemText.includes('oferta_quitacao') || itemText.includes('quitação')) {
        suggestions.push({
          label: "Propor Quitação",
          text: "Tenho uma proposta de quitação completa com desconto especial. Posso apresentar os detalhes?"
        });
      }
      // CARTAO_CREDITO
      else if (itemText.includes('cartao_credito') || itemText.includes('cartão')) {
        suggestions.push({
          label: "Mencionar Cartão",
          text: "Aceitamos pagamento com cartão de crédito. Você pode parcelar em até [X] vezes sem juros. Interessa?"
        });
      }
      // FINALIZACAO
      else if (itemText.includes('finalizacao') || itemText.includes('finalização')) {
        suggestions.push({
          label: "Finalizar Atendimento",
          text: "Para finalizarmos, vou confirmar os próximos passos: [resumo]. Está tudo certo? Foi um prazer atendê-lo!"
        });
      }
    });

    // Se não gerou sugestões suficientes, adicionar genéricas baseadas no primeiro pendente
    if (suggestions.length < 2 && pendingItems.length > 0) {
      suggestions.push({
        label: "Continuar Atendimento",
        text: "Como posso ajudá-lo com mais alguma coisa?"
      });
      suggestions.push({
        label: "Aguardar Resposta",
        text: "Aguardando sua resposta..."
      });
    }

    // Se ainda não tem sugestões, adicionar padrão
    if (suggestions.length === 0) {
      suggestions.push({
        label: "Abrir Atendimento",
        text: "Olá! Sou [Nome] da [Empresa]. Estou entrando em contato para tratar sobre sua situação."
      });
      suggestions.push({
        label: "Confirmar Identidade",
        text: "Para sua segurança, posso confirmar seu CPF e nome completo?"
      });
    }

    // Limitar a 4 sugestões e atualizar
    latestPayload.suggestions = suggestions.slice(0, 4);
    latestPayload.suggestionsLastUpdate = Date.now();
  }

  // Enviar mensagens capturadas para o backend (modo não-mock)
  // DESABILITADO: Não enviar nada quando em modo MOCK
  async function sendMessagesToBackend() {
    // NUNCA enviar se estiver em modo MOCK
    if (MOCK_MODE) {
      // Mensagens processadas localmente
      return;
    }

    if (!currentConversationId || messageHistory.length === 0) {
      return;
    }

    // Pegar apenas mensagens não enviadas
    const unsentMessages = messageHistory.filter(m => !m.sent);
    
    if (unsentMessages.length === 0) {
      return;
    }

    // Enviar última mensagem para o backend
    const lastMessage = unsentMessages[unsentMessages.length - 1];
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/webhooks/n8n`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: 'message', // Valor fixo - não distinguimos mais autor
          text: lastMessage.text,
          timestamp: lastMessage.timestamp,
          metadata: {
            conversationId: currentConversationId,
            turnId: `turn-${Date.now()}`,
            channel: 'web',
          }
        })
      });

      if (response.ok) {
        lastMessage.sent = true;
        // Mensagem enviada ao backend (logs removidos)
      }
    } catch (error) {
      console.error("[Intermedius] Erro ao enviar mensagem ao backend:", error);
      // Se falhar, ativar modo MOCK automaticamente
      console.warn("[Intermedius] ⚠️ Falha ao enviar - processando localmente");
    }
  }

  function cleanup() {
    clearInterval(pollingInterval);
    disconnectStream();
  }

  function getConversationId() {
    // Primeiro verificar se há indicadores de que uma conversa está realmente aberta
    const isOpen = isConversationOpen();
    if (!isOpen) {
      // Nenhuma conversa aberta (logs removidos)
      return null;
    }

    const strategies = [
      fromUuidInUrl, // Prioridade: detectar UUIDs de URLs da Helena primeiro
      fromContactInPage, // Procurar UUID do contato em elementos da página
      fromActiveConversation,
      fromPageContent,
      fromConversationList,
      fromDataAttributes,
      fromElementIds,
      fromUrl,
      fromInputs,
      fromLocalStorage,
      fromMetaTags,
      fromTitle
    ];
    for (const strategy of strategies) {
      const value = strategy();
      if (value) {
        if (validateConversationId(value)) {
          return value;
        }
      }
    }
    return null;
  }

  function isConversationOpen() {
    // Verificar se há indicadores de que uma conversa está realmente aberta/ativa
    // Isso evita falsos positivos quando não há conversa selecionada
    
    // 1. Verificar se há área de chat/mensagens visível
    const chatIndicators = [
      '[class*="chat" i]',
      '[class*="message" i]',
      '[class*="conversation" i]',
      '[role="log"]',
      '[role="region"]',
      'textarea[placeholder*="mensagem" i]',
      'textarea[placeholder*="message" i]',
      'input[placeholder*="mensagem" i]',
      'input[placeholder*="message" i]'
    ];

    for (const selector of chatIndicators) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const style = window.getComputedStyle(element);
          // Verificar se o elemento está visível e tem tamanho significativo
          if (style.display !== 'none' && 
              style.visibility !== 'hidden' && 
              style.opacity !== '0' &&
              element.offsetHeight > 50) {
            return true;
          }
        }
      } catch (error) {
        // Continuar
      }
    }

    // 2. Verificar se há elementos ativos/selecionados que indicam conversa aberta
    const activeIndicators = [
      '[class*="active" i][class*="conversation" i]',
      '[class*="active" i][class*="chat" i]',
      '[class*="selected" i][class*="conversation" i]',
      '[class*="selected" i][class*="chat" i]',
      '[aria-selected="true"]',
      '[data-active="true"]'
    ];

    for (const selector of activeIndicators) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Verificar se pelo menos um está visível
          for (const element of elements) {
            const style = window.getComputedStyle(element);
            if (style.display !== 'none' && style.visibility !== 'hidden') {
              return true;
            }
          }
        }
      } catch (error) {
        // Continuar
      }
    }

    // 3. Verificar se há campo de input de mensagem visível (indica chat aberto)
    const messageInputs = document.querySelectorAll('textarea, input[type="text"]');
    for (const input of messageInputs) {
      const style = window.getComputedStyle(input);
      const placeholder = (input.placeholder || '').toLowerCase();
      if (style.display !== 'none' && 
          style.visibility !== 'hidden' &&
          (placeholder.includes('mensagem') || 
           placeholder.includes('message') ||
           placeholder.includes('digite') ||
           placeholder.includes('type'))) {
        return true;
      }
    }

    return false;
  }

  function validateConversationId(id) {
    if (!id || typeof id !== 'string') {
      // Validação falhou (logs removidos)
      return false;
    }
    
    // Validar UUID primeiro (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(id)) {
      // UUID válido (logs removidos)
      return true;
    }
    
    // Validar telefone brasileiro
    const digits = id.replace(/\D/g, '');
    
    // Validar comprimento (telefones brasileiros: 10-13 dígitos)
    if (digits.length < 10 || digits.length > 13) {
      console.debug("[Intermedius] Validação falhou: comprimento inválido", digits.length, "dígitos");
      return false;
    }

    // Validar formato brasileiro
    // Deve começar com 55 (código do país) ou código de área válido (11-99)
    if (digits.startsWith('55')) {
      // Formato internacional: 55 + DDD (2 dígitos) + número (8-9 dígitos)
      if (digits.length >= 12 && digits.length <= 13) {
        const ddd = digits.substring(2, 4);
        const dddNum = parseInt(ddd);
        // DDD válido no Brasil: 11-99 (mas não todos, apenas os existentes)
        // Lista de DDDs válidos no Brasil
        const validDDDs = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99];
        if (validDDDs.includes(dddNum)) {
          return true;
        } else {
          console.debug("[Intermedius] Validação falhou: DDD inválido", ddd);
        }
      }
    } else {
      // Formato nacional: DDD (2 dígitos) + número (8-9 dígitos)
      if (digits.length >= 10 && digits.length <= 11) {
        const ddd = digits.substring(0, 2);
        const dddNum = parseInt(ddd);
        // Lista de DDDs válidos no Brasil
        const validDDDs = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99];
        if (validDDDs.includes(dddNum)) {
          return true;
        } else {
          console.debug("[Intermedius] Validação falhou: DDD inválido", ddd);
        }
      }
    }

    // Se não passou nas validações acima, rejeitar
    console.debug("[Intermedius] Validação falhou: formato inválido para", id);
    return false;
  }

  function fromActiveConversation() {
    // Procurar por elementos ativos/selecionados na lista de conversas
    // Geralmente conversas ativas têm classes como: active, selected, current, focused, etc.
    const activeSelectors = [
      '[class*="active" i]',
      '[class*="selected" i]',
      '[class*="current" i]',
      '[class*="focused" i]',
      '[class*="open" i]',
      '[aria-selected="true"]',
      '[aria-current="true"]',
      '[data-active="true"]',
      '[data-selected="true"]',
      '.active',
      '.selected',
      '.current'
    ];

    for (const selector of activeSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          // Procurar por atributos data-* que possam conter o ID
          const dataAttrs = ['data-id', 'data-conversation-id', 'data-chat-id', 'data-phone', 
                           'data-telefone', 'data-contact-id', 'data-number', 'data-whatsapp-id'];
          for (const attr of dataAttrs) {
            const value = element.getAttribute(attr);
            const sanitized = sanitizeId(value);
            if (sanitized) {
              console.debug("[Intermedius] ID encontrado em elemento ativo via", attr);
              return sanitized;
            }
          }

          // Procurar por IDs ou classes que possam conter o número
          const id = element.id || '';
          const classList = getClassName(element);
          const combined = `${id} ${classList}`;
          const sanitized = sanitizeId(combined);
          if (sanitized && sanitized.length >= 10) {
            return sanitized;
          }

          // Procurar no texto do elemento
          const text = element.innerText || element.textContent || '';
          const phone = extractPhoneFromText(text);
          if (phone) {
            return phone;
          }
        }
      } catch (error) {
        // Continuar
      }
    }
    return null;
  }

  function fromConversationList() {
    // Procurar na lista de conversas pelo item que está visível/aberto
    // Geralmente listas de conversas têm estruturas como: ul > li, div > div, etc.
    const listSelectors = [
      '[role="list"]',
      '[role="listbox"]',
      '[class*="conversation" i]',
      '[class*="chat" i]',
      '[class*="message" i]',
      '[class*="contact" i]',
      '[id*="conversation" i]',
      '[id*="chat" i]',
      '[id*="message" i]',
      '[id*="contact" i]'
    ];

    for (const selector of listSelectors) {
      try {
        const containers = document.querySelectorAll(selector);
        for (const container of containers) {
          // Procurar pelo item que está visível/aberto na área de chat
          const items = container.querySelectorAll('li, div[role="option"], div[class*="item" i]');
          for (const item of items) {
            // Verificar se o item está visível e tem algum indicador de estar ativo
            const style = window.getComputedStyle(item);
            if (style.display === 'none' || style.visibility === 'hidden') continue;

            // Procurar atributos data-*
            const dataAttrs = ['data-id', 'data-conversation-id', 'data-chat-id', 'data-phone',
                             'data-telefone', 'data-contact-id', 'data-number'];
            for (const attr of dataAttrs) {
              const value = item.getAttribute(attr);
              const sanitized = sanitizeId(value);
              if (sanitized) {
                return sanitized;
              }
            }

            // Procurar no texto
            const text = item.innerText || item.textContent || '';
            const phone = extractPhoneFromText(text);
            if (phone) {
              return phone;
            }
          }
        }
      } catch (error) {
        // Continuar
      }
    }
    return null;
  }

  function fromDataAttributes() {
    // Busca mais abrangente em atributos data-* em toda a página
    const dataAttrs = [
      'data-conversation-id',
      'data-chat-id',
      'data-contact-id',
      'data-phone',
      'data-telefone',
      'data-whatsapp-id',
      'data-number',
      'data-id',
      'data-uid',
      'data-user-id'
    ];

    for (const attr of dataAttrs) {
      try {
        const elements = document.querySelectorAll(`[${attr}]`);
        for (const element of elements) {
          const value = element.getAttribute(attr);
          const sanitized = sanitizeId(value);
          if (sanitized && sanitized.length >= 10) {
            return sanitized;
          }
        }
      } catch (error) {
        // Continuar
      }
    }
    return null;
  }

  function fromElementIds() {
    // Procurar em IDs de elementos que possam conter o ID da conversa
    try {
      const allElements = document.querySelectorAll('[id]');
      for (const element of allElements) {
        const id = element.id || '';
        // Procurar por padrões comuns: conversation-123, chat-123, phone-123, etc.
        const patterns = [
          /conversation[_-]?(\d{10,})/i,
          /chat[_-]?(\d{10,})/i,
          /phone[_-]?(\d{10,})/i,
          /telefone[_-]?(\d{10,})/i,
          /contact[_-]?(\d{10,})/i,
          /(\d{10,13})/
        ];

        for (const pattern of patterns) {
          const match = id.match(pattern);
          if (match) {
            const sanitized = sanitizeId(match[1] || match[0]);
            if (sanitized && sanitized.length >= 10) {
              return sanitized;
            }
          }
        }
      }
    } catch (error) {
      // Continuar
    }
    return null;
  }

  function fromLocalStorage() {
    // Procurar em localStorage e sessionStorage
    try {
      const storageKeys = Object.keys(localStorage).concat(Object.keys(sessionStorage));
      const relevantKeys = storageKeys.filter(key => 
        /conversation|chat|phone|telefone|contact|id/i.test(key)
      );

      for (const key of relevantKeys) {
        const value = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (value) {
          const sanitized = sanitizeId(value);
          if (sanitized && sanitized.length >= 10) {
            return sanitized;
          }
        }
      }
    } catch (error) {
      // localStorage pode estar bloqueado
    }
    return null;
  }

  function fromMetaTags() {
    // Procurar em meta tags
    try {
      const metaTags = document.querySelectorAll('meta[property], meta[name]');
      for (const meta of metaTags) {
        const property = meta.getAttribute('property') || meta.getAttribute('name') || '';
        if (/conversation|chat|phone|telefone|contact|id/i.test(property)) {
          const content = meta.getAttribute('content');
          const sanitized = sanitizeId(content);
          if (sanitized && sanitized.length >= 10) {
            return sanitized;
          }
        }
      }
    } catch (error) {
      // Continuar
    }
    return null;
  }

  // Função auxiliar para extrair telefone (usada por outras estratégias)
  function extractPhoneFromText(text) {
    if (!text) return null;
    const phonePatterns = [
      /\((\d{2})\)\s*(\d{4,5})-?(\d{4})/g,
      /(\d{2})\s*(\d{4,5})-?(\d{4})/g,
      /(\d{10,13})/g
    ];

    for (const pattern of phonePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const sanitized = sanitizeId(matches[0]);
        if (sanitized && sanitized.length >= 10 && sanitized.length <= 13) {
          if (sanitized.startsWith('55') || /^[1-9]\d{9,12}$/.test(sanitized)) {
            return sanitized;
          }
        }
      }
    }
    return null;
  }

  function fromUuidInUrl() {
    // Detectar UUIDs em URLs da Helena (ex: https://api.intermedius.app.br/core/v1/contact/{uuid})
    // Priorizar UUID do contato sobre UUID da sessão
    try {
      const url = window.location.href;
      const urlObj = new URL(window.location.href);
      // Padrão UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
      
      // Coletar todos os UUIDs encontrados na URL
      const allUuids = url.match(new RegExp(uuidPattern.source, 'gi')) || [];
      
      // 1. Prioridade MÁXIMA: UUID do contato na URL (ex: /core/v1/contact/{uuid} ou /contact/{uuid})
      const contactMatches = [
        ...url.matchAll(/\/contact\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi),
        ...url.matchAll(/contact[_-]?id[=:]?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi)
      ];
      if (contactMatches.length > 0) {
        const contactUuid = contactMatches[0][1];
        console.debug("[Intermedius] ✅ UUID do contato detectado na URL:", contactUuid);
        return contactUuid;
      }
      
      // 2. Verificar parâmetros de query (contact_id tem prioridade sobre conversation_id)
      const paramsToCheck = ["contact_id", "contactId", "contact-uuid", "conversation_id", "conversationId", "id", "uuid"];
      for (const key of paramsToCheck) {
        const paramValue = urlObj.searchParams.get(key);
        if (paramValue && uuidPattern.test(paramValue)) {
          const uuidMatch = paramValue.match(uuidPattern);
          if (uuidMatch) {
            const uuid = uuidMatch[1];
            // Se for contact_id, retornar imediatamente
            if (key.startsWith('contact')) {
              console.debug("[Intermedius] ✅ UUID do contato detectado no parâmetro", key, ":", uuid);
              return uuid;
            }
            // Caso contrário, continuar procurando por contact_id primeiro
          }
        }
      }
      
      // 3. Verificar no pathname (priorizar /contact/ sobre /session/)
      const pathname = window.location.pathname;
      const contactInPath = pathname.match(/\/contact\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (contactInPath) {
        console.debug("[Intermedius] ✅ UUID do contato detectado no pathname:", contactInPath[1]);
        return contactInPath[1];
      }
      
      // 4. Se houver múltiplos UUIDs na URL, tentar identificar qual é o do contato
      // Procurar por padrões que indiquem contato (ex: /contact/, contact_id, etc.)
      if (allUuids.length > 1) {
        // Procurar por contexto que indique contato
        const contactContext = url.match(/(contact[\/_-]|contact_id|contactId)[^\/]*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
        if (contactContext) {
          const contactUuid = contactContext[2];
          console.debug("[Intermedius] ✅ UUID do contato identificado entre múltiplos UUIDs:", contactUuid);
          return contactUuid;
        }
      }
      
      // 5. Fallback: qualquer UUID na URL (mas apenas se não houver múltiplos)
      if (allUuids.length === 1) {
        const uuid = allUuids[0];
        console.debug("[Intermedius] UUID único detectado na URL:", uuid);
        return uuid;
      } else if (allUuids.length > 1) {
        // Se houver múltiplos, preferir o que não seja de sessão
        const sessionUuid = url.match(/\/session\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
        if (sessionUuid) {
          // Retornar o primeiro UUID que não seja o da sessão
          const otherUuid = allUuids.find(u => u.toLowerCase() !== sessionUuid[1].toLowerCase());
          if (otherUuid) {
            console.debug("[Intermedius] UUID do contato selecionado (não-sessão):", otherUuid);
            return otherUuid;
          }
        }
      }
    } catch (error) {
      console.warn("[Intermedius] Erro ao buscar UUID na URL:", error);
    }
    return null;
  }

  function fromContactInPage() {
    // Procurar especificamente por UUIDs de contato em elementos da página
    // Isso é útil quando o UUID do contato não está na URL mas está em elementos DOM
    try {
      const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
      
      // 1. Procurar em atributos data-* relacionados a contato
      const contactDataAttrs = [
        'data-contact-id',
        'data-contactId',
        'data-contact-uuid',
        'data-contactUuid',
        '[data-contact-id]',
        '[data-contactId]',
        '[data-contact-uuid]',
        '[data-contactUuid]'
      ];
      
      for (const attr of contactDataAttrs) {
        try {
          const selector = attr.startsWith('[') ? attr : `[${attr}]`;
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const value = element.getAttribute(attr.replace(/[\[\]]/g, '')) || 
                         element.getAttribute('data-contact-id') ||
                         element.getAttribute('data-contactId');
            if (value && uuidPattern.test(value)) {
              const match = value.match(uuidPattern);
              if (match) {
                console.debug("[Intermedius] ✅ UUID do contato encontrado em atributo", attr, ":", match[1]);
                return match[1];
              }
            }
          }
        } catch (e) {
          // Continuar
        }
      }
      
      // 2. Procurar em elementos que contenham "contact" no ID ou classe
      const contactSelectors = [
        '[id*="contact" i]',
        '[class*="contact" i]',
        '[data-id*="contact" i]'
      ];
      
      for (const selector of contactSelectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            // Procurar UUID no ID, classe ou atributos
            const searchText = [
              element.id || '',
              getClassName(element),
              element.getAttribute('data-id') || '',
              element.getAttribute('data-uuid') || '',
              element.textContent || ''
            ].join(' ');
            
            const matches = searchText.match(uuidPattern);
            if (matches) {
              // Verificar se o contexto indica contato (não sessão)
              if (searchText.toLowerCase().includes('contact') && 
                  !searchText.toLowerCase().includes('session')) {
                console.debug("[Intermedius] ✅ UUID do contato encontrado em elemento:", matches[1]);
                return matches[1];
              }
            }
          }
        } catch (e) {
          // Continuar
        }
      }
      
      // 3. Procurar em localStorage/sessionStorage por dados de contato
      try {
        const storageKeys = Object.keys(localStorage).concat(Object.keys(sessionStorage || {}));
        for (const key of storageKeys) {
          if (key.toLowerCase().includes('contact')) {
            const value = localStorage.getItem(key) || sessionStorage?.getItem(key);
            if (value) {
              const match = value.match(uuidPattern);
              if (match) {
                console.debug("[Intermedius] ✅ UUID do contato encontrado em storage:", match[1]);
                return match[1];
              }
            }
          }
        }
      } catch (e) {
        // localStorage pode não estar disponível
      }
      
    } catch (error) {
      console.warn("[Intermedius] Erro ao buscar UUID do contato na página:", error);
    }
    return null;
  }

  function fromUrl() {
    try {
      const url = new URL(window.location.href);
      const paramsToCheck = ["phone", "telefone", "tel", "conversation_id", "conversation", "id", "number", 
                            "chat_id", "contact_id", "whatsapp_id"];
      for (const key of paramsToCheck) {
        const paramValue = url.searchParams.get(key);
        const sanitized = sanitizeId(paramValue);
        if (sanitized) return sanitized;
      }

      const pathMatch = window.location.pathname.match(/(\d{10,})/);
      if (pathMatch) {
        return sanitizeId(pathMatch[1]);
      }

      // Procurar no hash também
      const hashMatch = window.location.hash.match(/(\d{10,})/);
      if (hashMatch) {
        return sanitizeId(hashMatch[1]);
      }
    } catch (error) {
      console.warn("[Intermedius] Erro ao analisar URL:", error);
    }
    return null;
  }

  function fromInputs() {
    const selectors = [
      'input[name*="phone" i]',
      'input[name*="tel" i]',
      'input[name*="numero" i]',
      'input[name*="whatsapp" i]',
      'input[name*="conversation" i]',
      'input[type="tel"]',
      "[data-phone]",
      "[data-conversation-id]"
    ];

    const inputs = document.querySelectorAll(selectors.join(","));
    for (const input of inputs) {
      const value = input?.value || input?.getAttribute("data-phone") || input?.getAttribute("data-conversation-id");
      const sanitized = sanitizeId(value);
      if (sanitized) return sanitized;
    }
    return null;
  }

  function fromTitle() {
    const sanitized = sanitizeId(document.title);
    return sanitized || null;
  }

  function fromPageContent() {
    // Estratégia 1: Procurar por números de telefone no texto visível da página
    // Padrões brasileiros: (XX) XXXXX-XXXX, (XX) XXXX-XXXX, XX XXXXX-XXXX, etc.
    const phonePatterns = [
      /\((\d{2})\)\s*(\d{4,5})-?(\d{4})/g,  // (19) 99475-4380 ou (19) 99475-4380
      /(\d{2})\s*(\d{4,5})-?(\d{4})/g,      // 19 99475-4380
      /(\d{10,13})/g                         // Qualquer sequência de 10-13 dígitos
    ];

    // Função auxiliar para extrair telefone de um texto
    const extractPhoneFromText = (text) => {
      if (!text) return null;
      for (const pattern of phonePatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          const sanitized = sanitizeId(matches[0]);
          if (sanitized && sanitized.length >= 10 && sanitized.length <= 13) {
            // Validar formato brasileiro
            if (sanitized.startsWith('55') || /^[1-9]\d{9,12}$/.test(sanitized)) {
              return sanitized;
            }
          }
        }
      }
      return null;
    };

    // Procurar em elementos visíveis do header/área superior primeiro
    const headerSelectors = [
      'header',
      '[role="banner"]',
      '.header',
      '[class*="header"]',
      '[class*="Header"]',
      '[id*="header"]',
      '[id*="Header"]',
      'nav',
      '.top-bar',
      '[class*="top"]',
      '[class*="Top"]'
    ];

    // Tentar encontrar no header primeiro (mais provável de conter o número)
    for (const selector of headerSelectors) {
      try {
        const headerElements = document.querySelectorAll(selector);
        for (const element of headerElements) {
          const text = element.innerText || element.textContent || '';
          const phone = extractPhoneFromText(text);
          if (phone) {
            console.debug("[Intermedius] Telefone encontrado no header:", phone);
            return phone;
          }
        }
      } catch (error) {
        // Continuar para próximo seletor
      }
    }

    // Procurar em elementos que possam estar próximos ao texto "Instância"
    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (parent && parent.textContent && parent.textContent.includes('Instância')) {
          const phone = extractPhoneFromText(parent.textContent);
          if (phone) {
            console.debug("[Intermedius] Telefone encontrado próximo a 'Instância':", phone);
            return phone;
          }
        }
      }
    } catch (error) {
      // Continuar
    }

    // Estratégia 2: Procurar em elementos com atributos data-* ou aria-* que possam conter telefone
    const dataSelectors = [
      '[data-phone]',
      '[data-telefone]',
      '[data-tel]',
      '[data-number]',
      '[data-conversation-id]',
      '[data-contact-id]',
      '[aria-label*="phone" i]',
      '[aria-label*="telefone" i]',
      '[title*="phone" i]',
      '[title*="telefone" i]'
    ];

    for (const selector of dataSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const value = element.getAttribute('data-phone') ||
                       element.getAttribute('data-telefone') ||
                       element.getAttribute('data-tel') ||
                       element.getAttribute('data-number') ||
                       element.getAttribute('data-conversation-id') ||
                       element.getAttribute('data-contact-id') ||
                       element.getAttribute('aria-label') ||
                       element.getAttribute('title') ||
                       element.textContent ||
                       element.innerText;
          
          const sanitized = sanitizeId(value);
          if (sanitized && sanitized.length >= 10) {
            return sanitized;
          }
        }
      } catch (error) {
        // Continuar
      }
    }

    // Estratégia 3: Procurar por texto que contenha "Instância" e tentar extrair número próximo
    try {
      const allText = document.body.innerText || document.body.textContent || '';
      const instanceMatch = allText.match(/Instância\s+[\w\d]+\s*[^\n]*?\(?(\d{2})\)?\s*(\d{4,5})-?(\d{4})/i);
      if (instanceMatch) {
        const phone = extractPhoneFromText(instanceMatch[0]);
        if (phone) {
          console.debug("[Intermedius] Telefone encontrado via regex 'Instância':", phone);
          return phone;
        }
      }
    } catch (error) {
      // Continuar
    }

    // Estratégia 4: Varredura otimizada em elementos visíveis (fallback)
    // Limitar busca a elementos que provavelmente contêm telefones
    try {
      const candidateSelectors = [
        'div', 'span', 'p', 'td', 'th', 'li', 'label', 'strong', 'b', 'em'
      ];
      
      for (const tagName of candidateSelectors) {
        const elements = document.querySelectorAll(tagName);
        for (const element of elements) {
          // Pular elementos ocultos
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            continue;
          }

          const text = element.innerText || element.textContent || '';
          // Limitar busca a textos curtos que provavelmente contêm telefones
          if (!text || text.length > 100 || text.length < 10) continue;

          const phone = extractPhoneFromText(text);
          if (phone) {
            console.debug("[Intermedius] Telefone encontrado em elemento:", phone);
            return phone;
          }
        }
      }
    } catch (error) {
      console.warn("[Intermedius] Erro na varredura otimizada:", error);
    }

    return null;
  }

  function sanitizeId(rawValue) {
    if (!rawValue) return "";
    const digits = String(rawValue).replace(/\D/g, "");
    // Retornar apenas se tiver pelo menos 10 dígitos (telefone válido)
    return digits.length >= 10 ? digits : "";
  }

  function renderChecklist(checklist = []) {
    if (!elements.checklistContainer) return;
    elements.checklistContainer.innerHTML = "";

    if (!checklist.length) {
      const emptyState = document.createElement("li");
      emptyState.className = "intermedius-empty";
      emptyState.textContent = "Sem itens no momento.";
      elements.checklistContainer.appendChild(emptyState);
      return;
    }

    const icons = {
      done: "✅",
      pending: "⏳",
      warn: "⚠️"
    };
    
    // Estados possíveis (ciclo: pending -> warn -> done -> pending)
    const stateCycle = ['pending', 'warn', 'done'];

    checklist.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = `intermedius-item state-${item.state || "pending"}`;
      
      // Tornar clicável apenas em modo MOCK ou se explicitamente habilitado
      if (MOCK_MODE || item.interactive !== false) {
        li.style.cursor = "pointer";
        li.title = "Clique para alterar status (pendente → aviso → concluído)";
        li.addEventListener("click", () => {
          const currentState = item.state || "pending";
          const currentIndex = stateCycle.indexOf(currentState);
          const nextIndex = (currentIndex + 1) % stateCycle.length;
          const nextState = stateCycle[nextIndex];
          
          // Atualizar estado no item
          item.state = nextState;
          
          // Atualizar no payload
          if (latestPayload && latestPayload.checklist) {
            latestPayload.checklist[index].state = nextState;
          }
          
          // Re-renderizar
          renderChecklist(checklist);
          
          // Feedback visual
          showToast(`Status alterado: ${nextState === 'done' ? 'Concluído ✅' : nextState === 'warn' ? 'Aviso ⚠️' : 'Pendente ⏳'}`);
        });
        
        // Efeito hover
        li.addEventListener("mouseenter", () => {
          li.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
        });
        li.addEventListener("mouseleave", () => {
          li.style.backgroundColor = "";
        });
      }

      const primaryLine = document.createElement("div");
      primaryLine.className = "intermedius-item-line";
      primaryLine.textContent = `${icons[item.state] || icons.pending} ${item.item}`;
      li.appendChild(primaryLine);

      if (item.evidence?.excerpt) {
        const evidence = document.createElement("p");
        evidence.className = "intermedius-evidence";
        evidence.textContent = item.evidence.excerpt;
        li.appendChild(evidence);
      }

      elements.checklistContainer.appendChild(li);
    });
  }

  function renderSuggestions(suggestions = []) {
    if (!elements.suggestionsContainer) return;
    
    elements.suggestionsContainer.innerHTML = "";

    if (!suggestions.length) {
      const emptyState = document.createElement("p");
      emptyState.className = "intermedius-empty";
      emptyState.textContent = "Nenhuma sugestão disponível.";
      elements.suggestionsContainer.appendChild(emptyState);
      return;
    }

    suggestions.forEach((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "intermedius-suggestion-btn";
      button.textContent = suggestion.label;
      button.setAttribute("data-suggestion-text", suggestion.text);
      button.addEventListener("click", () => copySuggestion(suggestion));
      elements.suggestionsContainer.appendChild(button);
    });
  }

  async function copySuggestion(suggestion) {
    try {
      await navigator.clipboard.writeText(suggestion.text);
      showToast(`Copiado: ${suggestion.label}`);
    } catch (error) {
      console.error("[Intermedius] Falha ao copiar sugestão:", error);
      showToast("Erro ao copiar. Veja o console.");
    }
  }

  let toastTimeout = null;
  function showToast(message) {
    const existingToast = document.getElementById("intermedius-toast");
    if (existingToast) {
      existingToast.remove();
    }
    const toast = document.createElement("div");
    toast.id = "intermedius-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.remove();
    }, 2500);
  }

  function handleActivation({ toggle = false } = {}) {
    mountWidget();
    if (!isMounted) return;
    // Sempre faz toggle quando clicar no ícone
    togglePanel();
  }

  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.type === "INTERMEDIUS_OPEN") {
        handleActivation({ toggle: Boolean(message.toggle) });
        sendResponse?.({ ok: true });
      }
    });
  } else {
    window.IntermediusWidget = {
      open: () => handleActivation({ toggle: false }),
      toggle: () => handleActivation({ toggle: true })
    };
  }

  // Inicializar automaticamente se estiver em modo MOCK ou se houver conversa aberta
  const initWidget = () => {
    const hasConversation = isConversationOpen();
    
    // SEMPRE montar se estiver no domínio correto
    if (USE_MOCK_MODE || hasConversation || window.location.href.includes('intermedius.app.br')) {
      mountWidget();
    } else {
      // Tentar novamente após 2 segundos
      setTimeout(() => {
        const hasConversationRetry = isConversationOpen();
        if (USE_MOCK_MODE || hasConversationRetry || window.location.href.includes('intermedius.app.br')) {
          mountWidget();
        }
      }, 2000);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initWidget();
    });
  } else {
    // DOM já carregado
    initWidget();
  }
})();

