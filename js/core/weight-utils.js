/* PetHouse — normalização compatível de peso.
 * O histórico antigo guarda peso em quilogramas; algumas importações podem usar gramas.
 * Esta camada lê ambos os formatos sem reescrever os registros existentes. */
(function () {
    'use strict';

    function rawValue(recordOrValue) {
        if (recordOrValue && typeof recordOrValue === 'object') {
            return recordOrValue.valor ?? recordOrValue.peso ?? 0;
        }
        return recordOrValue;
    }

    function toNumber(value) {
        if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
        const normalized = String(value ?? '').trim().replace(',', '.');
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function kg(recordOrValue) {
        const numeric = toNumber(rawValue(recordOrValue));
        // Valores acima de 1.000 representam gramas nos formatos importados.
        return numeric > 1000 ? numeric / 1000 : numeric;
    }

    function grams(recordOrValue) {
        return Math.round(kg(recordOrValue) * 1000);
    }

    function formatKg(recordOrValue, decimals = 1) {
        return `${kg(recordOrValue).toFixed(decimals)} kg`;
    }

    window.PetHouseWeight = Object.freeze({ kg, grams, formatKg });
}());
