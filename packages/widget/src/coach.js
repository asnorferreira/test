(function() {
  'use strict';

  // Pega o script atual que está carregando este arquivo
  const currentScript = document.currentScript;
  
  // Lê os atributos data-tenant e data-campaign
  const tenant = currentScript?.getAttribute('data-tenant');
  const campaign = currentScript?.getAttribute('data-campaign');

  // Referência ao elemento coach-panel
  let coachPanelElement = null;

  // API pública exposta no window
  window.coachPanel = {
    setConversation: function(conversationId) {
      if (!coachPanelElement) {
        console.warn('[Coach Panel] Elemento ainda não foi inicializado');
        return;
      }
      
      // Define o atributo data-conversation-id no elemento
      coachPanelElement.setAttribute('data-conversation-id', conversationId);
      
      // Dispara evento customizado para o Web Component reagir
      const event = new CustomEvent('conversationChanged', {
        detail: { conversationId }
      });
      coachPanelElement.dispatchEvent(event);
      
      console.log('[Coach Panel] Conversation ID definido:', conversationId);
    },
    
    getConversation: function() {
      return coachPanelElement?.getAttribute('data-conversation-id') || null;
    }
  };

  // Função para inicializar o coach panel
  function initCoachPanel() {
    // Importa o Web Component (assumindo que index.ts foi carregado)
    import('./index.js').then(() => {
      // Cria o elemento <coach-panel>
      coachPanelElement = document.createElement('coach-panel');
      
      // Define atributos no elemento
      if (tenant) {
        coachPanelElement.setAttribute('data-tenant', tenant);
      }
      if (campaign) {
        coachPanelElement.setAttribute('data-campaign', campaign);
      }

      // Cria um container para o coach-panel
      const container = document.createElement('div');
      container.id = 'coach-panel-container';
      container.style.cssText = 'position: fixed; right: 20px; top: 20px; z-index: 9999;';
      
      // Adiciona o coach-panel ao container
      container.appendChild(coachPanelElement);
      
      // Injeta o container no DOM da página host
      document.body.appendChild(container);
      
      console.log('[Coach Panel] Inicializado com:', { tenant, campaign });
    }).catch(err => {
      console.error('[Coach Panel] Erro ao carregar:', err);
    });
  }

  // Aguarda o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoachPanel);
  } else {
    initCoachPanel();
  }
})();
