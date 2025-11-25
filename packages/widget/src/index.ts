import { render } from 'preact';
import { WidgetApp } from './ui';
import { WidgetController } from './controller';

interface BootstrapConfig {
  apiBase: string;
  tenantId: string;
  campaignId: string;
}

declare global {
  interface Window {
    IntermediusCoach?: {
      joinConversation: (conversationId: string) => void;
      reset: () => void;
      isReady: () => boolean;
    };
  }
}

(async function bootstrap() {
  const script = document.getElementById('intermedius-coach-widget') as HTMLScriptElement | null;
  if (!script) {
    console.warn('[IntermediusCoach] Script tag not found.');
    return;
  }

  const tenantId = script.dataset.tenantId;
  const campaignId = script.dataset.campaignId;
  const apiBase = script.dataset.apiUrl ?? window.location.origin;

  if (!tenantId || !campaignId) {
    console.warn('[IntermediusCoach] tenantId or campaignId not provided.');
    return;
  }

  const config: BootstrapConfig = { apiBase, tenantId, campaignId };
  const controller = new WidgetController();

  try {
    const url = `${config.apiBase}/coach/widget/config?tenantId=${encodeURIComponent(config.tenantId)}&campaignId=${encodeURIComponent(config.campaignId)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Config status ${res.status}`);
    }
    const data = await res.json();
    if (!data?.widgetEnabled) {
      console.info('[IntermediusCoach] Widget disabled for tenant.');
      return;
    }
  } catch (error) {
    console.error('[IntermediusCoach] Failed to fetch widget config', error);
    return;
  }

  await controller.initialize({ apiBase });

  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);
  render(<WidgetApp controller={controller} />, mountPoint);

  window.IntermediusCoach = {
    joinConversation: (conversationId: string) => {
      controller.joinConversation(conversationId);
    },
    reset: () => controller.reset(),
    isReady: () => controller.state.ready,
  };
})();
