/* Update Notification System
   Gestão de Materiais de Catenária (DTE)
   Detecta atualizações e notifica utilizador
*/

(function() {
  'use strict';

  // ========================================================================
  // CONFIGURAÇÃO
  // ========================================================================

  const CONFIG = {
    CHECK_INTERVAL: 60000, // 60 segundos
    NOTIFICATION_ID: 'updateNotification',
    VERSION_KEY: 'APP_VERSION',
    LAST_CHECK_KEY: 'LAST_UPDATE_CHECK',
    DISABLE_KEY: 'DISABLE_UPDATE_NOTIF',
    DEBUG: false
  };

  // ========================================================================
  // LOGGING
  // ========================================================================

  function log(message, type = 'info') {
    if (CONFIG.DEBUG || type === 'error') {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] [UpdateNotif] ${message}`, type === 'error' ? '❌' : 'ℹ️');
    }
  }

  // ========================================================================
  // DETECÇÃO DE VERSÃO NOVA
  // ========================================================================

  async function checkForUpdates() {
    try {
      // Obter versão atual do localStorage
      const currentVersion = localStorage.getItem(CONFIG.VERSION_KEY);

      if (!currentVersion) {
        log('Versão atual não definida, guardando...', 'info');
        const version = document.documentElement.getAttribute('data-version') ||
                       document.querySelector('meta[name="version"]')?.getAttribute('content') ||
                       'unknown';
        localStorage.setItem(CONFIG.VERSION_KEY, version);
        return false;
      }

      // Buscar página HTML atual
      const response = await fetch('./gestao_armazem_catenaria.html?bust=' + Date.now(), {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        log(`Erro ao buscar HTML: ${response.status}`, 'error');
        return false;
      }

      // Parser HTML e extrair versão
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Tentar vários métodos de encontrar versão
      let newVersion =
        doc.documentElement.getAttribute('data-version') ||
        doc.querySelector('meta[name="version"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="app-version"]')?.getAttribute('content') ||
        null;

      // Se não encontrou, procurar no SEED_DATA (se existir)
      if (!newVersion) {
        const scriptMatch = html.match(/"APP_VERSION"\s*:\s*"([^"]+)"/);
        if (scriptMatch) {
          newVersion = scriptMatch[1];
        }
      }

      if (!newVersion) {
        log('Versão nova não encontrada no HTML', 'warn');
        return false;
      }

      log(`Versão: ${currentVersion} → ${newVersion}`, 'info');

      // Comparar versões
      if (newVersion !== currentVersion && newVersion !== 'unknown') {
        log(`Actualização detectada!`, 'info');
        localStorage.setItem(CONFIG.VERSION_KEY, newVersion);
        return true;
      }

      return false;

    } catch (error) {
      log(`Erro ao verificar actualizações: ${error.message}`, 'error');
      return false;
    }
  }

  // ========================================================================
  // NOTIFICAÇÃO
  // ========================================================================

  function showUpdateNotification() {
    // Verificar se já existe
    let notification = document.getElementById(CONFIG.NOTIFICATION_ID);

    if (!notification) {
      notification = document.createElement('div');
      notification.id = CONFIG.NOTIFICATION_ID;
      notification.className = 'update-notification';
      notification.innerHTML = `
        <div class="update-notification-content">
          <div class="update-notification-header">
            <span class="update-notification-icon">✨</span>
            <strong>Actualização disponível!</strong>
          </div>
          <p class="update-notification-message">
            Uma versão nova do programa e manual está pronta.
          </p>
          <div class="update-notification-actions">
            <button class="update-notification-btn update-notification-btn-primary" onclick="location.reload()">
              🔄 Recarregar agora
            </button>
            <button class="update-notification-btn update-notification-btn-secondary" onclick="this.parentElement.parentElement.parentElement.style.display='none'">
              ⏱️ Depois
            </button>
          </div>
        </div>
      `;

      // Injetar CSS
      const style = document.createElement('style');
      style.textContent = `
        .update-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          max-width: 380px;
          background: linear-gradient(135deg, #1b8a4b 0%, #15704a 100%);
          color: white;
          padding: 18px 20px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(255, 255, 255, 0.2) inset;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .update-notification-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .update-notification-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
        }

        .update-notification-icon {
          font-size: 24px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .update-notification-message {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.95;
        }

        .update-notification-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .update-notification-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .update-notification-btn-primary {
          background: rgba(255, 255, 255, 0.25);
          color: white;
          flex: 1;
          min-width: 140px;
        }

        .update-notification-btn-primary:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: translateY(-2px);
        }

        .update-notification-btn-secondary {
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .update-notification-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        /* Modo dark/light */
        @media (prefers-color-scheme: dark) {
          .update-notification {
            background: linear-gradient(135deg, #2d9e5f 0%, #1b8a4b 100%);
          }
        }

        /* Mobile */
        @media (max-width: 600px) {
          .update-notification {
            bottom: 16px;
            right: 16px;
            left: 16px;
            max-width: none;
          }

          .update-notification-actions {
            flex-direction: column;
          }

          .update-notification-btn {
            width: 100%;
            padding: 12px;
          }
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(notification);
    }

    // Mostrar
    notification.style.display = 'flex';

    // Log
    log('Notificação mostrada ao utilizador', 'info');

    // Service worker update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({ type: 'UPDATE_AVAILABLE' });
    }
  }

  // ========================================================================
  // INICIALIZAÇÃO
  // ========================================================================

  function init() {
    log('Inicializando sistema de notificação de actualizações', 'info');

    // Desabilitar se o utilizador pediu
    if (localStorage.getItem(CONFIG.DISABLE_KEY) === 'true') {
      log('Sistema desabilitado pelo utilizador', 'info');
      return;
    }

    // Verificar imediatamente
    checkForUpdates().then(hasUpdate => {
      if (hasUpdate) {
        showUpdateNotification();
      }
    });

    // Verificar periodicamente
    setInterval(() => {
      checkForUpdates().then(hasUpdate => {
        if (hasUpdate) {
          showUpdateNotification();
        }
      });
    }, CONFIG.CHECK_INTERVAL);

    // Service Worker listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'UPDATE_INSTALLED') {
          log('Service worker atualizado, mostrando notificação', 'info');
          showUpdateNotification();
        }
      });
    }
  }

  // ========================================================================
  // START
  // ========================================================================

  // Iniciar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
