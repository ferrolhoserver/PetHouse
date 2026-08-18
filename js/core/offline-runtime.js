/* PetHouse V2 — recursos empacotados para execução sem internet. */
(function () {
    'use strict';

    const OCR_OPTIONS = Object.freeze({
        workerPath: '/vendor/tesseract/worker.min.js',
        corePath: '/vendor/tesseract/tesseract-core-lstm.wasm.js',
        langPath: '/vendor/tesseract/lang',
        gzip: false,
        cacheMethod: 'write'
    });

    let tesseractLoading = null;
    function ensureTesseract() {
        if (window.Tesseract) return Promise.resolve(window.Tesseract);
        if (tesseractLoading) return tesseractLoading;
        tesseractLoading = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-pethouse-tesseract]');
            if (existing) {
                existing.addEventListener('load', () => resolve(window.Tesseract), { once: true });
                existing.addEventListener('error', () => reject(new Error('Motor de leitura offline indisponível.')), { once: true });
                return;
            }
            const script = document.createElement('script');
            script.src = '/vendor/tesseract/tesseract.min.js';
            script.async = true;
            script.dataset.pethouseTesseract = 'true';
            script.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error('Motor de leitura offline indisponível.'));
            script.onerror = () => reject(new Error('Não foi possível carregar o motor de leitura local.'));
            document.head.appendChild(script);
        }).finally(() => { tesseractLoading = null; });
        return tesseractLoading;
    }

    window.PetHouseOfflineRuntime = Object.freeze({
        OCR_LANGUAGE: 'por',
        OCR_OPTIONS,
        ensureTesseract,
        isOnline: () => navigator.onLine === true,
        networkNotice: 'Este recurso funciona localmente e não envia sua imagem para servidores externos.'
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(error => {
                console.warn('Cache offline não pôde ser ativado:', error);
            });
        }, { once: true });
    }
}());
