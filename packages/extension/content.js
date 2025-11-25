(() => {
  // ============================================================
  // LOGS INICIAIS SUPER VISÍVEIS - IMPOSSÍVEL PERDER!
  // ============================================================
  console.log("%c", "font-size: 50px; background: #8b5cf6; color: white; padding: 20px;");
  console.log("%c╔═══════════════════════════════════════════════════════════╗", "color: #8b5cf6; font-size: 16px; font-weight: bold;");
  console.log("%c║   🚀 INTERMEDIUS EXTENSÃO - CARREGANDO... 🚀             ║", "color: #8b5cf6; font-size: 16px; font-weight: bold;");
  console.log("%c╚═══════════════════════════════════════════════════════════╝", "color: #8b5cf6; font-size: 16px; font-weight: bold;");
  console.log("%c[INTERMEDIUS] Script iniciado em:", "color: #8b5cf6; font-weight: bold; font-size: 14px;", new Date().toISOString());
  console.log("%c[INTERMEDIUS] URL da página:", "color: #3b82f6; font-weight: bold;", window.location.href);
  
  // URL do backend configurável (padrão: porta 3000)
  const BACKEND_URL = (() => {
    // Tentar obter do storage, senão usar padrão
    try {
      const stored = localStorage.getItem('intermedius_backend_url');
      if (stored) {
        console.log("%c[INTERMEDIUS] Backend URL (localStorage):", "color: #10b981; font-weight: bold;", stored);
        return stored;
      }
    } catch (e) {
      console.warn("%c[INTERMEDIUS] Erro ao ler localStorage:", "color: #f59e0b; font-weight: bold;", e);
    }
    const defaultUrl = "http://localhost:3000";
    console.log("%c[INTERMEDIUS] Backend URL (padrão):", "color: #f59e0b; font-weight: bold;", defaultUrl);
    return defaultUrl;
  })();
  
  const PANEL_ID = "intermedius-widget-panel";
  const POLLING_INTERVAL_MS = 3000;
  
  // MOCK REMOVIDO - Sempre conecta ao backend real
  const STATUS = {
    idle: { label: "Aguardando ID", className: "status-idle" },
    connecting: { label: "Conectando...", className: "status-connecting" },
    connected: { label: "Conectado", className: "status-connected" },
    error: { label: "Erro", className: "status-error" }
  };

  // ============================================================
  // MEMORY MANAGER - Gerenciar memória persistente LocalStorage
  // ============================================================
  const MemoryManager = {
    STORAGE_PREFIX: 'history_v1_',
    MAX_HISTORY_SIZE: 1000,
    
    getKey: function(sessionId) {
      return this.STORAGE_PREFIX + sessionId;
    },
    
    getProcessedIds: function(sessionId) {
      if (!sessionId) {
        return new Set();
      }
      try {
        const key = this.getKey(sessionId);
        const data = localStorage.getItem(key);
        if (data) {
          const arrayIds = JSON.parse(data);
          return new Set(Array.isArray(arrayIds) ? arrayIds : []);
        }
      } catch (e) {
        console.warn("[Intermedius] Erro ao ler LocalStorage:", e);
      }
      return new Set();
    },
    
    saveId: function(sessionId, messageId, currentSet) {
      if (!sessionId || !messageId) {
        return;
      }
      try {
        currentSet.add(messageId);
        let arrayIds = Array.from(currentSet);
        
        // Limpeza automática se ultrapassar MAX_HISTORY_SIZE
        if (arrayIds.length > this.MAX_HISTORY_SIZE) {
          arrayIds = arrayIds.slice(-this.MAX_HISTORY_SIZE); // Manter apenas os últimos X
          console.info(`[Intermedius] 📦 Limpeza automática: mantendo apenas últimos ${this.MAX_HISTORY_SIZE} IDs para sessionId: ${sessionId}`);
        }
        
        const key = this.getKey(sessionId);
        localStorage.setItem(key, JSON.stringify(arrayIds));
      } catch (e) {
        console.error("[Intermedius] Erro ao salvar no LocalStorage:", e);
      }
    },
    
    clear: function(sessionId) {
      if (!sessionId) {
        return;
      }
      try {
        const key = this.getKey(sessionId);
        localStorage.removeItem(key);
        console.log(`[Intermedius] ✅ Memória limpa para sessionId: ${sessionId}`);
      } catch (e) {
        console.error("[Intermedius] Erro ao limpar LocalStorage:", e);
      }
    },
    
    clearAll: function() {
      try {
        const keys = Object.keys(localStorage);
        const prefix = this.STORAGE_PREFIX;
        let cleared = 0;
        keys.forEach(key => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
            cleared++;
          }
        });
        console.log(`[Intermedius] ✅ ${cleared} históricos limpos do LocalStorage`);
      } catch (e) {
        console.error("[Intermedius] Erro ao limpar todo o LocalStorage:", e);
      }
    }
  };

  // ============================================================
  // FUNÇÃO PARA EXTRAIR SESSIONID DA URL
  // ============================================================
  function getSessionIdFromUrl() {
    try {
      const url = window.location.href;
      // Padrões: /chat2/sessions/{uuid} ou /sessions/{uuid}
      const uuidPattern = /\/(?:chat2\/)?sessions\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
      const match = url.match(uuidPattern);
      if (match && match[1]) {
        return match[1];
      }
    } catch (e) {
      console.debug("[Intermedius] Erro ao extrair sessionId da URL:", e);
    }
    return null;
  }

  let eventSource = null;
  let isMinimized = true;
  let latestPayload = null;
  let isMounted = false;
  let messageIdObserver = null;
  let processedMessageIds = new Set(); // Rastrear messageIds já processados (cache da sessão atual)
  let lastDetectedMessageId = null; // Último messageId detectado para exibição
  let debounceTimer = null; // Timer para debounce do MutationObserver

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
    
    // Logs muito visíveis
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║          🚀 INTERMEDIUS EXTENSÃO INICIADA 🚀             ║");
    console.log("╚═══════════════════════════════════════════════════════════╝");
    console.log(`📍 URL da página: ${window.location.href}`);
    console.log(`🌐 Backend: ${BACKEND_URL}`);
    console.log(`🆔 Extensão ID: ${(chrome && chrome.runtime && chrome.runtime.id) || 'N/A'}`);
    
    // Carregar messageIds já processados do LocalStorage para o cache
    const sessionId = getSessionIdFromUrl();
    if (sessionId) {
      const processedIdsFromStorage = MemoryManager.getProcessedIds(sessionId);
      processedIdsFromStorage.forEach(id => processedMessageIds.add(id));
      console.log(`💾 [Intermedius] ${processedIdsFromStorage.size} messageIds carregados do LocalStorage para cache da sessão`);
      
      // Buscar messageIds via API imediatamente (não depender apenas do SSE)
      console.log("🔍 [Intermedius] Buscando messageIds via API ao montar widget...");
      setTimeout(() => {
        fetchSessionMessages(sessionId);
      }, 500);
      
      console.log("🌐 Conectando ao SSE com sessionId:", sessionId);
      connectToStream(sessionId); // Conectar ao SSE usando sessionId específico
    } else {
      console.warn("⚠️ [Intermedius] Nenhum sessionId detectado na URL - aguardando...");
      // Tentar detectar sessionId periodicamente
      const checkSessionIdInterval = setInterval(() => {
        const detectedSessionId = getSessionIdFromUrl();
        if (detectedSessionId) {
          clearInterval(checkSessionIdInterval);
          console.log("✅ [Intermedius] SessionId detectado:", detectedSessionId);
          
          // Buscar messageIds via API
          console.log("🔍 [Intermedius] Buscando messageIds via API após detectar sessionId...");
          setTimeout(() => {
            fetchSessionMessages(detectedSessionId);
          }, 500);
          
          console.log("🌐 Conectando ao SSE com sessionId:", detectedSessionId);
          connectToStream(detectedSessionId);
        }
      }, 2000);
      // Limpar intervalo após 30 segundos
      setTimeout(() => clearInterval(checkSessionIdInterval), 30000);
    }
    
    console.log("👀 Iniciando observador de messageIds...");
    startMessageIdObserver(); // Iniciar observador de messageIds imediatamente
    
    console.log("✅ Extensão completamente inicializada!");
    console.log("💡 DICA: Execute window.intermediusWidget.debug() no console para ver o status");
    
    window.addEventListener("beforeunload", cleanup);
    
    // Expor funções globais para debug/controle (garantir que estejam disponíveis)
    if (!window.intermediusWidget) {
      window.intermediusWidget = {};
    }
    
    Object.assign(window.intermediusWidget, {
      debug: () => {
        const sessionId = getSessionIdFromUrl();
        const processedIdsFromStorage = sessionId ? MemoryManager.getProcessedIds(sessionId) : new Set();
        
        console.log("=== INTERMEDIUS DEBUG ===");
        console.log("Backend URL:", BACKEND_URL);
        console.log("SessionId atual:", sessionId || "Nenhum detectado");
        console.log("Último messageId detectado:", lastDetectedMessageId);
        console.log("MessageIds processados (cache sessão):", Array.from(processedMessageIds));
        console.log("MessageIds processados (LocalStorage):", sessionId ? Array.from(processedIdsFromStorage) : []);
        console.log("Observador ativo:", !!messageIdObserver);
        console.log("Debounce timer ativo:", !!debounceTimer);
        console.log("SSE conectado:", !!eventSource);
        console.log("Payload disponível:", !!latestPayload);
        console.log("===========================");
        captureExistingMessageIds();
        return {
          backendUrl: BACKEND_URL,
          sessionId: sessionId,
          lastMessageId: lastDetectedMessageId,
          processedIdsCache: Array.from(processedMessageIds),
          processedIdsStorage: sessionId ? Array.from(processedIdsFromStorage) : [],
          observerActive: !!messageIdObserver,
          debounceTimerActive: !!debounceTimer,
          sseConnected: !!eventSource,
          hasPayload: !!latestPayload
        };
      },
      forceSearch: () => {
        console.log("[Intermedius] 🔍 FORÇANDO BUSCA MANUAL DE MESSAGEIDS...");
        captureExistingMessageIds();
      },
      testBackend: async () => {
        console.log("[Intermedius] 🧪 TESTANDO CONEXÃO COM BACKEND...");
        try {
          const response = await fetch(`${BACKEND_URL}/health`);
          if (response && response.ok) {
            const data = await response.json();
            console.log("✅ Backend respondendo!", data);
            return { ok: true, data };
          } else {
            console.error("❌ Backend não respondeu corretamente");
            return { ok: false };
          }
        } catch (e) {
          console.error("❌ Erro ao testar backend:", e);
          return { ok: false, error: e.message };
        }
      },
        testSendMessageId: async (messageId) => {
          if (!messageId) {
            console.error("❌ MessageId é obrigatório!");
            return;
          }
          await sendMessageIdToBackend(messageId);
        },
        // Configurar URL do backend facilmente
        setBackendUrl: (url) => {
          if (!url) {
            console.error("❌ URL é obrigatória!");
            console.log("   Uso: window.intermediusWidget.setBackendUrl('https://backend.intermedius.app.br')");
            return;
          }
          try {
            localStorage.setItem('intermedius_backend_url', url);
            console.log("✅ Backend URL configurado:", url);
            console.log("🔄 Recarregue a página (F5) para aplicar a mudança");
            return { success: true, url };
        } catch (e) {
            console.error("❌ Erro ao configurar backend URL:", e);
            return { success: false, error: e.message };
          }
        },
        // Listar todos os UUIDs encontrados na página (para debug)
        findAllUuids: () => {
          console.log("🔍 [INTERMEDIUS] Buscando TODOS os UUIDs na página...");
          const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
          const allUuids = new Set();
          
          // Buscar em atributos
          document.querySelectorAll('*').forEach(el => {
            if (el.attributes) {
              for (let i = 0; i < el.attributes.length; i++) {
                const value = el.attributes[i].value;
                const matches = value.match(uuidPattern);
                if (matches) {
                  matches.forEach(uuid => allUuids.add(uuid));
                }
              }
            }
          });
          
          // Buscar em texto
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node;
          while (node = walker.nextNode()) {
            const matches = node.textContent.match(uuidPattern);
            if (matches) {
              matches.forEach(uuid => allUuids.add(uuid));
            }
          }
          
          const uuidArray = Array.from(allUuids);
          console.log(`✅ Encontrados ${uuidArray.length} UUIDs na página:`, uuidArray);
          return uuidArray;
        },
        // Obter memória (LocalStorage) de um sessionId específico ou do atual
        getMemory: (sessionId) => {
          const targetSessionId = sessionId || getSessionIdFromUrl();
          if (!targetSessionId) {
            console.warn("[Intermedius] ❌ Nenhum sessionId fornecido ou detectado na URL");
            return null;
          }
          const processedIds = MemoryManager.getProcessedIds(targetSessionId);
          const idsArray = Array.from(processedIds);
          console.log(`[Intermedius] 💾 Memória para sessionId "${targetSessionId}": ${idsArray.length} messageIds processados`);
          console.log("   MessageIds:", idsArray);
          return {
            sessionId: targetSessionId,
            count: idsArray.length,
            messageIds: idsArray
          };
        },
        // Limpar memória (LocalStorage) de um sessionId específico ou de todos
        clearMemory: (sessionId) => {
          if (sessionId === undefined || sessionId === null) {
            // Limpar todos
            console.log("[Intermedius] 🗑️ Limpando TODA a memória do LocalStorage...");
            MemoryManager.clearAll();
            return { success: true, cleared: 'all' };
    } else {
            // Limpar um sessionId específico
            console.log(`[Intermedius] 🗑️ Limpando memória para sessionId: ${sessionId}`);
            MemoryManager.clear(sessionId);
            return { success: true, cleared: sessionId };
          }
        },
        // Obter sessionId atual da URL
        getCurrentSessionId: () => {
          const sessionId = getSessionIdFromUrl();
          console.log(`[Intermedius] 🔑 SessionId atual: ${sessionId || 'Nenhum detectado'}`);
          return sessionId;
        }
    });
    
    console.log("%c[INTERMEDIUS]", "color: #10b981; font-weight: bold;", "Funções de debug disponíveis:");
    console.log("  - window.intermediusWidget.debug()");
    console.log("  - window.intermediusWidget.forceSearch()");
    console.log("  - window.intermediusWidget.testBackend()");
    console.log("  - window.intermediusWidget.testSendMessageId('uuid')");
    console.log("  - window.intermediusWidget.getMemory(sessionId?)");
    console.log("  - window.intermediusWidget.clearMemory(sessionId?)");
    console.log("  - window.intermediusWidget.getCurrentSessionId()");
    
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
    conversationText.textContent = "Aguardando mensagens...";

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
    setPanelState(true);
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

  function updateMessageIdDisplay(messageId) {
    if (!elements.headerConversationId) return;
    if (messageId) {
      // Mostrar apenas últimos 8 caracteres do messageId para não poluir a interface
      const shortId = messageId.length > 8 ? messageId.substring(messageId.length - 8) : messageId;
      elements.headerConversationId.textContent = `Msg: ${shortId}`;
      lastDetectedMessageId = messageId;
    } else {
      elements.headerConversationId.textContent = "Aguardando mensagens...";
    }
  }

  function connectToStream(sessionId) {
    disconnectStream();
    
    // Validar sessionId
    if (!sessionId) {
      console.warn("[Intermedius] ⚠️ Tentativa de conectar ao SSE sem sessionId");
        setStatus("idle");
        return;
      }

    // Conectar ao SSE usando sessionId específico da conversa
    const streamUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/stream/conversations/${sessionId}`;
    setStatus("connecting");
    
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║          🔌 CONECTANDO AO SSE 🔌                         ║");
    console.log("╚═══════════════════════════════════════════════════════════╝");
    console.log(`📍 URL da página: ${window.location.href}`);
    console.log(`🔑 SessionId: ${sessionId}`);
    console.log(`🌐 Backend URL: ${BACKEND_URL}`);
    console.log(`🔗 Stream URL: ${streamUrl}`);
    console.log(`🔒 Protocolo da página: ${window.location.protocol}`);
    console.log(`🔒 Protocolo do backend: ${new URL(BACKEND_URL).protocol}`);
    
    // Verificar se há problema de mixed content (HTTPS -> HTTP)
    // MAS: Permitir localhost mesmo em HTTPS (desenvolvimento)
    const isLocalhostBackend = BACKEND_URL.includes('localhost') || BACKEND_URL.includes('127.0.0.1');
    const isProductionPage = window.location.host.includes('intermedius.app.br') || window.location.host.includes('helena');
    
    if (window.location.protocol === 'https:' && BACKEND_URL.startsWith('http://') && isProductionPage && !isLocalhostBackend) {
      console.error("╔═══════════════════════════════════════════════════════════╗");
      console.error("║          ⚠️ ERRO: MIXED CONTENT DETECTADO ⚠️            ║");
      console.error("╚═══════════════════════════════════════════════════════════╝");
      console.error("❌ PROBLEMA: Página HTTPS tentando conectar a backend HTTP");
      console.error(`   Página: ${window.location.protocol}//${window.location.host}`);
      console.error(`   Backend: ${BACKEND_URL}`);
      console.error("");
      console.error("💡 SOLUÇÕES:");
      console.error("   1. Configure o backend para usar HTTPS");
      console.error("   2. Ou configure a URL do backend no localStorage:");
      console.error(`      localStorage.setItem('intermedius_backend_url', 'https://backend.intermedius.app.br')`);
      console.error("   3. Ou use um proxy HTTPS para o backend HTTP");
      console.error("");
      console.error("🔧 CONFIGURAR AGORA (execute no console):");
      console.error(`   localStorage.setItem('intermedius_backend_url', 'https://backend.intermedius.app.br')`);
      console.error("   Depois recarregue a página (F5)");
      setStatus("error");
      if (elements.headerStatusText) {
        elements.headerStatusText.textContent = "Erro: Mixed Content - Configure backend HTTPS";
      }
      return;
    }
    
    // Aviso se estiver usando localhost em produção (mas não bloquear)
    if (isProductionPage && BACKEND_URL.includes('localhost')) {
      console.warn("╔═══════════════════════════════════════════════════════════╗");
      console.warn("║          ⚠️ AVISO: BACKEND LOCAL EM PRODUÇÃO ⚠️        ║");
      console.warn("╚═══════════════════════════════════════════════════════════╝");
      console.warn("⚠️ Você está em produção mas usando backend localhost");
      console.warn(`   Página: ${window.location.href}`);
      console.warn(`   Backend: ${BACKEND_URL}`);
      console.warn("");
      console.warn("💡 Configure o backend de produção:");
      console.warn(`   localStorage.setItem('intermedius_backend_url', 'https://backend.intermedius.app.br')`);
      console.warn("   Depois recarregue a página (F5)");
    }

    try {
      console.log("🔄 Criando EventSource...");
      eventSource = new EventSource(streamUrl);
      console.log("✅ EventSource criado com sucesso");
    } catch (error) {
      console.error("╔═══════════════════════════════════════════════════════════╗");
      console.error("║          ❌ ERRO AO CRIAR EVENTSOURCE ❌                 ║");
      console.error("╚═══════════════════════════════════════════════════════════╝");
      console.error("❌ Erro:", error);
      console.error("   Mensagem:", (error && error.message) || 'Erro desconhecido');
      console.error("   Stack:", (error && error.stack) || 'N/A');
      console.error(`   URL tentada: ${streamUrl}`);
      setStatus("error");
      if (elements.headerStatusText) {
        elements.headerStatusText.textContent = `Erro: ${(error && error.message) || 'Falha na conexão'}`;
      }
      return;
    }

    eventSource.onopen = () => {
      setStatus("connected");
      console.log("╔═══════════════════════════════════════════════════════════╗");
      console.log("║          ✅ CONEXÃO SSE ESTABELECIDA ✅                  ║");
      console.log("╚═══════════════════════════════════════════════════════════╝");
      console.log(`✅ Conexão SSE estabelecida para sessionId: ${sessionId}`);
      updateMessageIdDisplay(null); // Resetar exibição de ID
      
      // Após conectar, atualizar display com sessionId
      if (elements.headerConversationId) {
        const shortSessionId = sessionId.length > 8 ? sessionId.substring(sessionId.length - 8) : sessionId;
        elements.headerConversationId.textContent = `Sessão: ${shortSessionId}`;
      }
      
      // Após conectar ao SSE, buscar messageIds existentes via API e DOM
      console.log("🔍 [Intermedius] Após conexão SSE, iniciando busca de messageIds...");
      
      // Buscar messageIds via API da Helena
      fetchSessionMessages(sessionId);
      
      // Também buscar no DOM (backup/fallback)
      setTimeout(() => {
        captureExistingMessageIds();
      }, 1000);
    };

    eventSource.onmessage = (event) => {
      if (!event || !event.data) return;
      try {
        const data = JSON.parse(event.data);
        
        // Processar diferentes tipos de eventos SSE
        if (data.type === 'connected') {
          console.info("[Intermedius] Conexão SSE confirmada:", data.payload);
          return;
        }
        
        if (data.type === 'analysis:updated' && data.payload && data.payload.analysis) {
          // Formato do backend: analysis:updated com payload.analysis
          const analysis = data.payload.analysis;
          latestPayload = {
            checklist: analysis.checklist || [],
            suggestions: analysis.suggestions || [],
          };
          renderChecklist(analysis.checklist || []);
          renderSuggestions(analysis.suggestions || []);
          console.info("[Intermedius] Análise atualizada:", {
            checklistCount: (analysis.checklist || []).length,
            suggestionsCount: (analysis.suggestions || []).length,
          });
          return;
        }
        
        // Formato legado (compatibilidade)
        if (data.checklist || data.suggestions) {
          latestPayload = data;
          renderChecklist(data.checklist || []);
          renderSuggestions(data.suggestions || []);
          return;
        }
        
        console.debug("[Intermedius] Evento SSE recebido (não processado):", data);
      } catch (error) {
        console.error("[Intermedius] Erro ao processar mensagem SSE:", error);
        setStatus("error");
      }
    };

    eventSource.onerror = (event) => {
      console.error("╔═══════════════════════════════════════════════════════════╗");
      console.error("║          ❌ ERRO NA CONEXÃO SSE ❌                       ║");
      console.error("╚═══════════════════════════════════════════════════════════╝");
      console.error("❌ Erro no EventSource");
      console.error(`   URL: ${streamUrl}`);
      console.error(`   ReadyState: ${(eventSource && eventSource.readyState) || 'N/A'}`);
      console.error(`   ReadyState meanings:`);
      console.error(`     0 = CONNECTING - Tentando conectar`);
      console.error(`     1 = OPEN - Conectado`);
      console.error(`     2 = CLOSED - Fechado/Erro`);
      console.error(`   Event:`, event);
      console.error(`   Event type:`, (event && event.type) || 'N/A');
      console.error(`   Event target:`, (event && event.target) || 'N/A');
      
      if (eventSource && eventSource.readyState === EventSource.CLOSED) {
        console.error("");
        console.error("💡 POSSÍVEIS CAUSAS:");
        console.error("   1. Backend não está rodando em:", BACKEND_URL);
        console.error("   2. Problema de CORS (backend não permite origem da página)");
        console.error("   3. Problema de Mixed Content (HTTPS → HTTP)");
        console.error("   4. Firewall bloqueando a conexão");
        console.error("");
        console.error("🔍 TESTE:");
        console.error("   Execute: window.intermediusWidget.testBackend()");
      }
      
      setStatus("error");
      if (elements.headerStatusText) {
        const readyState = (eventSource && eventSource.readyState);
        if (readyState === EventSource.CLOSED) {
          elements.headerStatusText.textContent = "Erro: Conexão fechada";
        } else {
          elements.headerStatusText.textContent = "Erro: Conexão SSE";
        }
      }
      
      // Tentar reconectar com backoff apenas se não for erro de configuração
      if (eventSource && eventSource.readyState === EventSource.CLOSED) {
        setTimeout(() => {
          if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
            console.log("🔄 Tentando reconectar em 3 segundos...");
            reconnectWithBackoff();
          }
        }, 3000);
      }
    };
  }
  
  // MOCK REMOVIDO - Sempre usa backend real

  function reconnectWithBackoff() {
    disconnectStream();
    setTimeout(() => {
      const sessionId = getSessionIdFromUrl();
      if (sessionId) {
        connectToStream(sessionId);
      } else {
        console.warn("[Intermedius] Não é possível reconectar - sessionId não detectado");
        setStatus("idle");
      }
    }, 2000);
  }

  function disconnectStream() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      setStatus("idle");
      console.info("[Intermedius] Conexão SSE fechada");
    }
  }

  // Buscar mensagens de uma sessão via API do backend
  async function fetchSessionMessages(sessionId) {
    if (!sessionId) {
      console.warn("[Intermedius] ⚠️ Tentativa de buscar mensagens sem sessionId");
      return;
    }

    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║     🔍 BUSCANDO MENSAGENS DA SESSÃO VIA API 🔍          ║");
    console.log("╚═══════════════════════════════════════════════════════════╝");
    console.log(`🔑 SessionId: ${sessionId}`);
    console.log(`📍 Endpoint: ${BACKEND_URL}/api/sessions/${sessionId}/messages`);
    console.log(`🌐 Backend URL: ${BACKEND_URL}`);

    try {
      const fetchUrl = `${BACKEND_URL}/api/sessions/${sessionId}/messages`;
      console.log(`🌐 Fazendo requisição GET para: ${fetchUrl}`);

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Resposta recebida: Status ${response.status} ${response.statusText}`);

      if (response.ok) {
        const responseData = await response.json().catch((parseError) => {
          console.error("[Intermedius] ❌ Erro ao fazer parse da resposta JSON:", parseError);
          return {};
        });
        
        console.log(`📦 Dados recebidos:`, responseData);
        
        if (responseData && responseData.messageIds && Array.isArray(responseData.messageIds)) {
          const messageIds = responseData.messageIds.filter(id => id && typeof id === 'string' && id.trim().length > 0);
          const processedIdsFromStorage = MemoryManager.getProcessedIds(sessionId);
          
          console.log(`✅ [Intermedius] ${messageIds.length} messageIds encontrados na sessão via API`);
          console.log(`💾 [Intermedius] ${processedIdsFromStorage.size} messageIds já processados no LocalStorage`);
          
          if (messageIds.length === 0) {
            console.warn("[Intermedius] ⚠️ Nenhum messageId retornado pela API - a sessão pode não ter mensagens ainda");
            return;
          }
          
          // Processar cada messageId encontrado
          let newMessageIds = 0;
          let alreadyProcessed = 0;
          
          for (const messageId of messageIds) {
            if (!messageId) continue;
            
            // Verificar se já foi processado
            if (processedIdsFromStorage.has(messageId) || processedMessageIds.has(messageId)) {
              alreadyProcessed++;
              if (!processedMessageIds.has(messageId)) {
                processedMessageIds.add(messageId);
              }
              continue;
            }
            
            // Novo messageId - processar
            processedMessageIds.add(messageId);
            updateMessageIdDisplay(messageId);
            const success = await sendMessageIdToBackend(messageId);
            
            if (success) {
              newMessageIds++;
              console.info(`[Intermedius] ✅ MessageId processado via API: ${messageId.substring(0, 8)}...`);
            }
          }
          
          console.log(`╔═══════════════════════════════════════════════════════════╗`);
          console.log(`║     📊 RESULTADOS DA BUSCA VIA API 📊                   ║`);
          console.log(`╚═══════════════════════════════════════════════════════════╝`);
          console.log(`✅ Novos messageIds processados: ${newMessageIds}`);
          console.log(`🔄 MessageIds já processados: ${alreadyProcessed}`);
          console.log(`📦 Total de messageIds na sessão: ${messageIds.length}`);
        } else {
          console.warn("╔═══════════════════════════════════════════════════════════╗");
          console.warn("║     ⚠️ RESPOSTA DA API NÃO CONTÉM MESSAGEIDS ⚠️         ║");
          console.warn("╚═══════════════════════════════════════════════════════════╝");
          console.warn(`📦 Resposta recebida:`, responseData);
          console.warn(`💡 A API pode não ter encontrado mensagens para esta sessão ou o formato da resposta mudou`);
          console.warn("[Intermedius] Continuando com busca no DOM como fallback...");
        }
      } else {
        const errorText = await response.text().catch(() => 'Erro ao ler resposta');
        console.error("╔═══════════════════════════════════════════════════════════╗");
        console.error("║     ❌ ERRO AO BUSCAR MENSAGENS DA SESSÃO ❌            ║");
        console.error("╚═══════════════════════════════════════════════════════════╝");
        console.error(`🔑 SessionId: ${sessionId}`);
        console.error(`❌ Status: ${response.status} ${response.statusText}`);
        console.error(`📝 Erro: ${errorText.substring(0, 500)}`);
        console.error(`🌐 Endpoint tentado: ${fetchUrl}`);
        console.warn("[Intermedius] Continuando com busca no DOM como fallback...");
      }
    } catch (error) {
      console.error("╔═══════════════════════════════════════════════════════════╗");
      console.error("║     ❌ ERRO DE REDE AO BUSCAR MENSAGENS ❌               ║");
      console.error("╚═══════════════════════════════════════════════════════════╝");
      console.error(`🔑 SessionId: ${sessionId}`);
      console.error(`❌ Erro:`, error);
      console.error(`❌ Mensagem: ${error?.message || 'Erro desconhecido'}`);
      console.error(`🌐 Verifique se o backend está rodando em: ${BACKEND_URL}`);
      console.error(`🌐 Endpoint tentado: ${BACKEND_URL}/api/sessions/${sessionId}/messages`);
      console.warn("[Intermedius] Continuando com busca no DOM como fallback...");
    }
  }

  // Funções de captura DOM removidas - mensagens agora vêm via webhooks da Helena

  function cleanup() {
    disconnectStream();
    stopMessageIdObserver();
  }

  function getConversationId() {
    // Primeiro verificar se há indicadores de que uma conversa está realmente aberta
    const isOpen = isConversationOpen();
    if (!isOpen) {
      console.debug("[Intermedius] Nenhuma conversa aberta detectada - não buscando ID");
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
          console.debug("[Intermedius] ✅ ID válido detectado via", strategy.name, ":", value);
          return value;
        } else {
          console.debug("[Intermedius] ❌ ID rejeitado pela validação:", value, "via", strategy.name);
        }
      }
    }
    console.debug("[Intermedius] Nenhum ID válido encontrado após tentar todas as estratégias");
    return null;
  }

  // Observar DOM apenas para capturar messageIds (não conteúdo das mensagens)
  function startMessageIdObserver() {
    if (messageIdObserver) {
      stopMessageIdObserver();
    }

    console.log("🎯 [INTERMEDIUS] Iniciando observador de messageIds...");
    console.log("🔍 [INTERMEDIUS] Verificando se há elementos de mensagem no DOM...");
    
    // Verificar imediatamente e depois periodicamente
    captureExistingMessageIds();
    
    // Primeira captura: processar messageIds já existentes (com delay para aguardar carregamento)
    setTimeout(() => {
      captureExistingMessageIds();
    }, 1000);
    
    // Captura adicional após mais tempo (caso as mensagens carreguem depois)
    setTimeout(() => {
      captureExistingMessageIds();
    }, 3000);
    
    // Captura periódica a cada 5 segundos para pegar novas mensagens
    setInterval(() => {
      captureExistingMessageIds();
    }, 5000);

    // Função debounced para processar mudanças do DOM
    const DEBOUNCE_DELAY_MS = 500; // 500ms de debounce
    
    function debouncedCaptureMessageIds() {
      // Limpar timer anterior
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Criar novo timer - só executa se não houver mudanças por 500ms
      debounceTimer = setTimeout(() => {
        console.debug("[Intermedius] 🔄 Debounce expirado - processando mudanças do DOM...");
        captureExistingMessageIds();
        debounceTimer = null;
      }, DEBOUNCE_DELAY_MS);
    }

    // Observar mudanças no DOM para capturar novos messageIds
    messageIdObserver = new MutationObserver((mutations) => {
      let nodesAdded = 0;
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          nodesAdded += mutation.addedNodes.length;
        }
      });
      
      if (nodesAdded > 0) {
        console.debug(`[Intermedius] 🔄 MutationObserver detectou ${nodesAdded} novos nós - aguardando debounce (500ms)...`);
        // Chamar função debounced ao invés de processar imediatamente
        debouncedCaptureMessageIds();
      }
    });

    // Observar o body para capturar messageIds
    const observeTarget = document.body || document.documentElement;
    if (observeTarget) {
      messageIdObserver.observe(observeTarget, {
        childList: true,
        subtree: true,
        characterData: false,
        attributes: true, // Observar mudanças em atributos também
        attributeFilter: ['data-id', 'data-message-id', 'data-messageId', 'id'] // Apenas atributos relevantes
      });
      console.info("[Intermedius] ✅ MutationObserver configurado e ativo");
    } else {
      console.error("[Intermedius] ❌ Não foi possível encontrar body ou documentElement para observar");
    }
  }

  function stopMessageIdObserver() {
    // Limpar timer de debounce se existir
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
      console.debug("[Intermedius] Timer de debounce limpo");
    }
    
    if (messageIdObserver) {
      messageIdObserver.disconnect();
      messageIdObserver = null;
      console.info("[Intermedius] Observador de messageIds parado");
    }
  }

  // Capturar messageIds já existentes na página
  function captureExistingMessageIds() {
    // Obter sessionId atual
    const sessionId = getSessionIdFromUrl();
    
    // Se não houver sessionId, não processar (mensagens sem sessão não devem ser processadas)
    if (!sessionId) {
      console.debug("[Intermedius] Nenhum sessionId detectado na URL - não processando messageIds");
      return;
    }
    
    // Consultar LocalStorage para messageIds já processados
    const processedIdsFromStorage = MemoryManager.getProcessedIds(sessionId);
    console.log(`[Intermedius] 💾 MessageIds já processados (LocalStorage): ${processedIdsFromStorage.size}`);
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 [INTERMEDIUS] INICIANDO BUSCA DE MESSAGEIDS...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🔑 SessionId: ${sessionId}`);
    
    // Seletores expandidos para encontrar messageIds na interface da Helena
    const messageIdSelectors = [
      '[data-message-id]',
      '[data-messageId]',
      '[data-message-id*="-"]', // UUIDs contêm hífens
      '[data-id*="-"]', // Procurar por UUIDs em data-id
      '[id*="message" i]',
      '[id*="msg" i]',
      '[class*="message" i][data-id]',
      '[class*="message" i][id]',
      '[class*="msg" i][data-id]',
      '[class*="chat" i][data-id]',
      '[class*="bubble" i][data-id]',
      '[class*="message" i]',
      '[class*="msg" i]',
      '[class*="chat-message" i]',
      '[class*="message-bubble" i]',
      '[class*="message-item" i]',
      '[class*="message-row" i]',
      '[class*="message-container" i]',
      '[role="listitem"]', // Mensagens podem estar em listas
      '[role="article"]', // Mensagens podem ter role article
    ];

    let newMessageIdsFound = 0;
    let alreadyProcessedCount = 0;
    let elementsChecked = 0;

    // Busca 1: Seletores específicos
    messageIdSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elementsChecked += elements.length;
        elements.forEach(element => {
          const messageId = extractMessageIdFromElement(element);
          if (messageId) {
            // Verificar se já foi processado (LocalStorage + cache da sessão)
            if (processedIdsFromStorage.has(messageId) || processedMessageIds.has(messageId)) {
              alreadyProcessedCount++;
              // Adicionar ao cache da sessão também para evitar re-verificações
              if (!processedMessageIds.has(messageId)) {
                processedMessageIds.add(messageId);
              }
              return; // Pular iteração do forEach - já processado
            }
            
            // MessageId novo - processar
            processedMessageIds.add(messageId);
            updateMessageIdDisplay(messageId);
            sendMessageIdToBackend(messageId);
            newMessageIdsFound++;
            console.info(`[Intermedius] ✅ MessageId encontrado via seletor "${selector}":`, messageId);
          }
        });
      } catch (e) {
        console.debug("[Intermedius] Erro ao buscar com seletor", selector, ":", e);
      }
    });

    // Busca 2: Procurar em objetos JavaScript globais (window, localStorage, etc)
    try {
      console.info("[Intermedius] 🔍 Buscando messageIds em objetos JavaScript...");
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // Buscar em window.* objetos que possam conter dados de mensagens
      const windowKeys = Object.keys(window);
      for (const key of windowKeys) {
        try {
          const obj = window[key];
          if (obj && typeof obj === 'object') {
            const objStr = JSON.stringify(obj);
            if (objStr && objStr.length < 500000) { // Limitar tamanho para performance
              const uuidMatches = objStr.match(new RegExp(uuidPattern.source, 'gi'));
              if (uuidMatches) {
                for (const uuid of uuidMatches) {
                  // Verificar contexto no objeto
                  const uuidIndex = objStr.indexOf(uuid);
                  const contextBefore = objStr.substring(Math.max(0, uuidIndex - 50), uuidIndex + 50);
                  const contextAfter = objStr.substring(Math.max(0, uuidIndex - 100), uuidIndex + 100);
                  const hasMessageContext = /message|msg|chat/i.test(contextBefore);
                  const isNotOtherContext = !/session|contact|user|agent|conversation/i.test(contextAfter);
                  
                  if (hasMessageContext && isNotOtherContext) {
                    // Verificar se já foi processado
                    if (processedIdsFromStorage.has(uuid) || processedMessageIds.has(uuid)) {
                      alreadyProcessedCount++;
                      if (!processedMessageIds.has(uuid)) {
                        processedMessageIds.add(uuid);
                      }
                      continue;
                    }
                    
                    // MessageId novo - processar
                    processedMessageIds.add(uuid);
                    updateMessageIdDisplay(uuid);
                    sendMessageIdToBackend(uuid);
                    newMessageIdsFound++;
                    console.info(`[Intermedius] ✅ MessageId encontrado em window.${key}:`, uuid);
                  }
                }
              }
            }
          }
        } catch (e) {
      // Continuar
    }
      }
    } catch (e) {
      console.warn("[Intermedius] Erro ao buscar em objetos JavaScript:", e);
    }
    
    // Busca 3: Procurar TODOS os UUIDs na página e filtrar
    try {
      console.info("[Intermedius] 🔍 Buscando UUIDs em todos os elementos do DOM...");
      const allElements = document.querySelectorAll('*');
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let uuidElementsChecked = 0;
      
      // Limitar busca para performance (primeiros 1000 elementos)
      const maxElements = Math.min(allElements.length, 1000);
      for (let i = 0; i < maxElements; i++) {
        const element = allElements[i];
        try {
          uuidElementsChecked++;
          // Verificar todos os atributos do elemento
          if (element.attributes && element.attributes.length > 0) {
            for (let j = 0; j < element.attributes.length; j++) {
              const attr = element.attributes[j];
              const value = attr.value;
              
              // Se o valor for um UUID válido
              if (value && uuidPattern.test(value)) {
                // Verificar contexto do elemento (classe, ID, parent, texto)
                const context = [
                  element.className || '',
                  element.id || '',
                  element.tagName || '',
                  element.getAttribute('role') || '',
                  (element.parentElement && element.parentElement.className) || '',
                  (element.textContent && element.textContent.substring(0, 100)) || ''
                ].join(' ').toLowerCase();
                
                // Se o contexto sugere que é uma mensagem (muito mais permissivo)
                // Aceitar qualquer UUID que não seja claramente sessionId, contactId, etc
                const isMessageContext = (
                  /message|msg|chat|bubble|text|content|item|row|cell/i.test(context) ||
                  element.closest('[class*="message" i], [class*="msg" i], [class*="chat" i], [class*="bubble" i]') ||
                  element.tagName === 'DIV' || element.tagName === 'SPAN' || element.tagName === 'LI'
                );
                
                const isNotOtherContext = !/session|contact|user|agent|conversation|list|header|footer|nav|menu|sidebar/i.test(context);
                
                // Se parece ser mensagem OU está dentro de um container de mensagem
                if (isMessageContext && isNotOtherContext) {
                  // Verificar se não é sessionId conhecido da URL
                  const currentUrl = window.location.href;
                  const urlSessionId = currentUrl.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
                  if (!urlSessionId || value !== urlSessionId[1]) {
                    // Verificar se já foi processado
                    if (processedIdsFromStorage.has(value) || processedMessageIds.has(value)) {
                      alreadyProcessedCount++;
                      if (!processedMessageIds.has(value)) {
                        processedMessageIds.add(value);
                      }
                      continue; // Pular para próximo elemento
                    }
                    
                    // MessageId novo - processar
                    processedMessageIds.add(value);
                    updateMessageIdDisplay(value);
                    sendMessageIdToBackend(value);
                    newMessageIdsFound++;
                    const className = element.className ? (typeof element.className === 'string' ? element.className.substring(0, 50) : '') : '';
                    console.info('[Intermedius] ✅ MessageId encontrado via busca UUID (' + attr.name + '="' + value + '" em <' + element.tagName + ' class="' + className + '">):', value);
                  }
                }
              }
            }
          }
        } catch (e) {
          // Continuar
        }
      }
      console.info(`[Intermedius] 🔍 ${uuidElementsChecked} elementos verificados na busca de UUIDs`);
        } catch (e) {
      console.warn("[Intermedius] Erro na busca ampla de UUIDs:", e);
    }

    const totalProcessed = processedMessageIds.size;
    console.info(`[Intermedius] 📊 Busca completa: ${elementsChecked} elementos verificados`);
    console.info(`[Intermedius] 📊 Resultados: ${newMessageIdsFound} novos messageIds, ${alreadyProcessedCount} já processados (filtrados), ${totalProcessed} no cache da sessão`);
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if (newMessageIdsFound === 0) {
      if (alreadyProcessedCount > 0) {
        // Silêncio é ouro: não logar se todos já foram processados (evitar poluir console)
        console.debug(`[Intermedius] ✅ Todos os messageIds já foram processados (${alreadyProcessedCount} filtrados do LocalStorage)`);
      } else if (totalProcessed === 0) {
        console.warn("⚠️ [INTERMEDIUS] NENHUM MESSAGEID ENCONTRADO!");
        console.warn("   - Verifique se há mensagens visíveis na tela");
        console.warn("   - Execute: window.intermediusWidget.debug() para mais informações");
        console.warn("   - Execute: window.intermediusWidget.forceSearch() para tentar novamente");
        console.warn("   - Execute: window.intermediusWidget.findAllUuids() para ver todos os UUIDs na página");
        console.warn("");
        console.warn("💡 SE MESMO ASSIM NÃO ENCONTRAR:");
        console.warn("   1. Abra o DevTools (F12)");
        console.warn("   2. Vá na aba Elements");
        console.warn("   3. Procure manualmente por elementos de mensagens");
        console.warn("   4. Inspecione seus atributos (data-id, data-message-id, id, etc)");
        console.warn("   5. Se encontrar um UUID que seja messageId, execute:");
        console.warn("      window.intermediusWidget.testSendMessageId('uuid-aqui')");
      }
    } else {
      console.log(`✅ [INTERMEDIUS] ${newMessageIdsFound} novos messageIds encontrados e enviados!`);
      if (alreadyProcessedCount > 0) {
        console.log(`   (${alreadyProcessedCount} messageIds já processados foram filtrados)`);
      }
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }

  // Extrair messageId de um elemento DOM (apenas ID, não conteúdo)
  function extractMessageIdFromElement(element) {
    if (!element || typeof element.getAttribute !== 'function') {
    return null;
  }

    try {
      // Estratégias para extrair messageId:
      // 1. Atributos data-message-id, data-messageId
      const dataMessageId = element.getAttribute('data-message-id') || 
                           element.getAttribute('data-messageId');
      if (dataMessageId) {
        // Validar se é UUID
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(dataMessageId)) {
          return dataMessageId;
        }
      }

      // 2. Atributo data-id (se for UUID)
      const dataId = element.getAttribute('data-id');
      if (dataId) {
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(dataId)) {
          // Verificar se o contexto indica que é messageId (não outro ID)
          const context = (element.className || '') + ' ' + (element.id || '');
          if (/message|msg|chat|bubble/i.test(context)) {
            return dataId;
          }
        }
      }

      // 3. ID do elemento se for UUID (ex: id="message-3fa85f64-...")
      const elementId = element.id || '';
      if (elementId) {
        const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
        const uuidMatch = elementId.match(uuidPattern);
        if (uuidMatch) {
          // Verificar se o contexto indica mensagem
          const context = (element.className || '') + ' ' + elementId;
          if (/message|msg|chat|bubble/i.test(context)) {
            return uuidMatch[1];
          }
        }
      }

      // 4. Procurar em filhos por atributos data-message-id
      if (element.querySelectorAll) {
        const messageElements = element.querySelectorAll('[data-message-id], [data-messageId]');
        for (const msgEl of messageElements) {
          const msgId = msgEl.getAttribute('data-message-id') || 
                       msgEl.getAttribute('data-messageId');
          if (msgId) {
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidPattern.test(msgId)) {
              return msgId;
            }
          }
        }
      }

      return null;
      } catch (error) {
      console.debug("[Intermedius] Erro ao extrair messageId:", error);
      return null;
    }
  }

    // Enviar messageId para o backend para buscar detalhes e processar
    // Retorna true se sucesso (200-299), false caso contrário
  async function sendMessageIdToBackend(messageId) {
    if (!messageId) {
      console.warn("[Intermedius] ⚠️ Tentativa de enviar messageId vazio");
      return false;
    }

    // Obter sessionId para salvar no LocalStorage
    const sessionId = getSessionIdFromUrl();

    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║          📤 ENVIANDO MESSAGEID AO BACKEND 📤            ║");
    console.log("╚═══════════════════════════════════════════════════════════╝");
    console.log(`📍 Endpoint: ${BACKEND_URL}/api/messages/process`);
    console.log(`🆔 MessageId: ${messageId}`);
    console.log(`📦 Payload:`, { messageId });
    if (sessionId) {
      console.log(`🔑 SessionId: ${sessionId}`);
    }
    
    try {
      const fetchUrl = `${BACKEND_URL}/api/messages/process`;
      console.log(`🌐 Fazendo requisição para: ${fetchUrl}`);
      
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId
        })
      });
      
      console.log(`📡 Resposta recebida: Status ${response.status}`);

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        console.log("╔═══════════════════════════════════════════════════════════╗");
        console.log("║          ✅ MESSAGEID PROCESSADO COM SUCESSO ✅          ║");
        console.log("╚═══════════════════════════════════════════════════════════╝");
        console.log(`🆔 MessageId: ${messageId}`);
        console.log(`✅ Success: ${responseData.success}`);
        console.log(`📊 Response:`, responseData);
        
        // SALVAR NO LOCALSTORAGE APENAS SE SUCESSO
        if (sessionId) {
          const processedIds = MemoryManager.getProcessedIds(sessionId);
          MemoryManager.saveId(sessionId, messageId, processedIds);
          console.log(`💾 [Intermedius] MessageId salvo no LocalStorage para sessionId: ${sessionId}`);
        }
        
        return true;
      } else {
        const errorText = await response.text();
        console.error("╔═══════════════════════════════════════════════════════════╗");
        console.error("║          ❌ ERRO AO ENVIAR MESSAGEID ❌                 ║");
        console.error("╚═══════════════════════════════════════════════════════════╝");
        console.error(`🆔 MessageId: ${messageId}`);
        console.error(`❌ Status: ${response.status} ${response.statusText}`);
        console.error(`📝 Erro: ${errorText.substring(0, 200)}`);
        console.warn(`⚠️ [Intermedius] MessageId NÃO salvo no LocalStorage (falha no envio) - será tentado novamente no próximo ciclo`);
        return false;
      }
    } catch (error) {
      console.error("╔═══════════════════════════════════════════════════════════╗");
      console.error("║          ❌ ERRO DE REDE AO ENVIAR MESSAGEID ❌          ║");
      console.error("╚═══════════════════════════════════════════════════════════╝");
      console.error(`🆔 MessageId: ${messageId}`);
      console.error(`❌ Erro:`, error);
      console.error(`🌐 Verifique se o backend está rodando em: ${BACKEND_URL}`);
      console.warn(`⚠️ [Intermedius] MessageId NÃO salvo no LocalStorage (erro de rede) - será tentado novamente no próximo ciclo`);
      return false;
    }
  }

  function disconnectStream() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      setStatus("idle");
      console.info("[Intermedius] Conexão SSE fechada");
    }
    stopMessageIdObserver();
  }

  // Funções de detecção de sessionId/conversationId REMOVIDAS
  // A extensão agora usa apenas messageIds detectados do DOM

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
      
      // Tornar clicável se explicitamente habilitado
      if (item.interactive !== false) {
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

      if (item.evidence && item.evidence.excerpt) {
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

  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message && message.type === "INTERMEDIUS_OPEN") {
        handleActivation({ toggle: Boolean(message.toggle) });
        if (sendResponse) {
          sendResponse({ ok: true });
        }
      }
    });
  } else {
    window.IntermediusWidget = {
      open: () => handleActivation({ toggle: false }),
      toggle: () => handleActivation({ toggle: true })
    };
  }

  // Inicializar automaticamente sempre (não depende mais de conversa aberta)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log("%c[INTERMEDIUS]", "color: #8b5cf6; font-weight: bold;", "DOM carregado - inicializando extensão...");
      mountWidget();
    });
  } else {
    // DOM já carregado
    console.log("%c[INTERMEDIUS]", "color: #8b5cf6; font-weight: bold;", "DOM já carregado - inicializando extensão...");
    mountWidget();
  }
})();

