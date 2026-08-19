/* PetHouse V2 — cache offline de recursos do próprio aplicativo. */
const CACHE_NAME = 'pethouse-offline-v2-20260819a';
const SHELL = [
  "/",
  "/css/auth.css",
  "/css/companion-theme.css",
  "/css/companion-theme.css?v=2",
  "/css/consent-simple.css",
  "/css/consent.css",
  "/css/fix-vacinas-overlap.css",
  "/css/fix-vacinas-overlap.css?v=1749600000",
  "/css/pet-cards.css",
  "/css/premium-ui.css",
  "/css/premium-ui.css?v=3",
  "/css/secure-auth.css",
  "/css/secure-auth.css?v=4",
  "/css/style.css",
  "/css/vacinas-cards.css",
  "/css/vacinas-cards.css?v=1749600000",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/index.html",
  "/js/alarmes.js?v=1749600000",
  "/js/alertas-especificos.js?v=1749600000",
  "/js/alertas.js?v=1749600000",
  "/js/app-banhos-tosas-extension.js?v=1749600000",
  "/js/app.js?v=3",
  "/js/auto-doses.js?v=1749600000",
  "/js/banhos-tosas-v2-simple.js?v=1749600000",
  "/js/banhos-tosas.js?v=1749600000",
  "/js/base-racas.js?v=1749600000",
  "/js/calendario.js?v=1749600000",
  "/js/ciclos-reprodutivos.js?v=1749600000",
  "/js/conhecimento-colaborativo.js?v=2",
  "/js/conhecimento-ia.js?v=2",
  "/js/consent-manager.js?v=1749600000",
  "/js/controle-cio.js?v=1749600000",
  "/js/core/offline-runtime.js?v=3",
  "/js/cuidados.js?v=1749600000",
  "/js/curvas-raca.js?v=1749600000",
  "/js/dashboard-banho-tosa.js?v=1749600000",
  "/js/dashboard-peso.js?v=1749600000",
  "/js/dashboard-vacinas.js?v=1749600000",
  "/js/diagnosticos.js?v=1749600000",
  "/js/entrada-manual-vacina.js?v=3",
  "/js/error-logger.js?v=1749600000",
  "/js/filtros-interativos.js?v=1749600000",
  "/js/grafico-banhos.js?v=1749600000",
  "/js/grafico-peso.js?v=1749600000",
  "/js/identity/local-identity.js?v=5",
  "/js/migration/legacy-migration.js?v=2",
  "/js/ocr-cartao-v2.js?v=3",
  "/js/ocr-cartao.js?v=3",
  "/js/ocr-exames.js?v=3",
  "/js/pdf-avancado.js?v=1749600000",
  "/js/pdf.js?v=1749600000",
  "/js/privacy-policy.js?v=2",
  "/js/protocolos-vacinais.js?v=1749600000",
  "/js/protocolos-vacinas.js?v=1749600000",
  "/js/racas_db.js?v=1749600000",
  "/js/revacinacao.js?v=1749600000",
  "/js/security/crypto-vault.js?v=2",
  "/js/storage/secure-store.js?v=2",
  "/js/terms-of-service.js?v=2",
  "/js/timeline-prontuario.js?v=1749600000",
  "/js/tooltips-vacinas.js?v=1749600000",
  "/js/tratamentos.js?v=1749600000",
  "/js/ui/secure-gate.js?v=3",
  "/js/ui/security-center.js?v=5",
  "/js/utils-data.js?v=1749600000",
  "/js/vacinas-compostas.js?v=1749600000",
  "/js/vacinas-rapido.js?v=1749600000",
  "/js/vacinas_db.js?v=1749600000",
  "/js/vermifugos-rapido.js?v=1749600000",
  "/js/visualizacao-exames.js?v=1749600000",
  "/js/wizard-cuidados-extension.js?v=1749600000",
  "/js/wizard-cuidados.js?v=1749600000",
  "/js/wizard-vacinas.js?v=1749600000",
  "/manifest.json",
  "/privacy.html",
  "/support.html",
  "/vendor/chart/chart.umd.js?v=1",
  "/vendor/tesseract/lang/por.traineddata",
  "/vendor/tesseract/tesseract-core-lstm.wasm",
  "/vendor/tesseract/tesseract-core-lstm.wasm.js",
  "/vendor/tesseract/worker.min.js"
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(SHELL.map(asset => cache.add(asset)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.filter(name => name.startsWith('pethouse-offline-') && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isDocument = request.mode === 'navigate';
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = isDocument ? '/index.html' : request;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response && response.ok) cache.put(cacheKey, response.clone());
      return response;
    } catch (_) {
      return new Response('Recurso indisponível offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
