chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "INTERMEDIUS_OPEN", toggle: true });
  } catch (error) {
    console.warn("[Intermedius] Conteúdo não disponível, tentando injetar...", error);
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["styles.css"]
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
      await chrome.tabs.sendMessage(tab.id, { type: "INTERMEDIUS_OPEN", toggle: true });
    } catch (injectError) {
      console.error("[Intermedius] Falha ao ativar widget:", injectError);
    }
  }
});

