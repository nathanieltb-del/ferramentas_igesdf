/* ============================================================================
 * Aviso no computador (push) do Sistema de Notas Fiscais (IGESDF).
 * Este arquivo roda dentro do navegador, mesmo com o sistema fechado.
 *  - Recebe o aviso do servidor (processo novo no Diário ou prazo do Mapa). O aviso vem SEM dado de processo: a mensagem é sempre a mesma.
 *  - Sempre mostra o aviso no canto da tela. Se o sistema está aberto, também avisa a tela, que mostra a janela na hora.
 *  - Ao clicar no aviso, abre (ou traz para frente) o sistema; a própria tela mostra o que há de novo (Diário e Mapa de processos).
 * ========================================================================== */
'use strict';

const VERSAO_SW = '4';       // sobe a cada mudança deste arquivo; a tela confere se o navegador já está com a versão nova

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', ev => ev.waitUntil(self.clients.claim()));

async function avisar() {
  const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  janelas.forEach(j => { try { j.postMessage({ tipo: 'push-diario' }); j.postMessage({ tipo: 'push-aviso' }); } catch (e) { /* segue */ } });
  await self.registration.showNotification('IGESDF • Aviso do sistema', {
    body: 'Você tem um aviso novo no sistema.',
    tag: 'aviso-igesdf',           // um aviso só: o novo troca o anterior
    renotify: true,
    requireInteraction: false
  });
}

async function abrir() {
  const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (janelas.length) {
    const alvo = janelas.find(j => j.visibilityState === 'visible') || janelas[0];
    try { await alvo.focus(); } catch (e) { /* segue */ }
    try { alvo.postMessage({ tipo: 'abrir-aviso' }); } catch (e) { /* segue */ }
    return;
  }
  await self.clients.openWindow('./');
}

self.addEventListener('push', ev => ev.waitUntil(avisar()));
self.addEventListener('notificationclick', ev => { ev.notification.close(); ev.waitUntil(abrir()); });

// A tela pergunta a versão (diagnóstico do botão "Testar aviso").
self.addEventListener('message', ev => {
  if (ev.data && ev.data.tipo === 'versao' && ev.ports && ev.ports[0]) ev.ports[0].postMessage({ versao: VERSAO_SW });
});
