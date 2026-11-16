/* ============================================================================
 * Aviso no computador (push) do Sistema de Notas Fiscais (IGESDF).
 * Este arquivo roda dentro do navegador, mesmo com o sistema fechado.
 *  - Recebe o aviso do servidor. O aviso vem SEM dado de processo: a mensagem é sempre a mesma.
 *  - Sempre mostra o aviso no canto da tela. Se o sistema está aberto, também avisa a tela, que mostra a janela na hora.
 *  - Ao clicar no aviso, abre (ou traz para frente) o sistema no Diário.
 * ========================================================================== */
'use strict';

const VERSAO_SW = '3';       // sobe a cada mudança deste arquivo; a tela confere se o navegador já está com a versão nova

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', ev => ev.waitUntil(self.clients.claim()));

async function avisar() {
  const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  janelas.forEach(j => { try { j.postMessage({ tipo: 'push-diario' }); } catch (e) { /* segue */ } });
  await self.registration.showNotification('IGESDF • Diário de processos', {
    body: 'Você recebeu um novo processo no Diário.',
    tag: 'diario-igesdf',          // um aviso só: o novo troca o anterior
    renotify: true,
    requireInteraction: false
  });
}

async function abrir() {
  const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (janelas.length) {
    const alvo = janelas.find(j => j.visibilityState === 'visible') || janelas[0];
    try { await alvo.focus(); } catch (e) { /* segue */ }
    try { alvo.postMessage({ tipo: 'abrir-diario' }); } catch (e) { /* segue */ }
    return;
  }
  await self.clients.openWindow('./#/diario');
}

self.addEventListener('push', ev => ev.waitUntil(avisar()));
self.addEventListener('notificationclick', ev => { ev.notification.close(); ev.waitUntil(abrir()); });

// A tela pergunta a versão (diagnóstico do botão "Testar aviso").
self.addEventListener('message', ev => {
  if (ev.data && ev.data.tipo === 'versao' && ev.ports && ev.ports[0]) ev.ports[0].postMessage({ versao: VERSAO_SW });
});
