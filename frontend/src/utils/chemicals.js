// src/utils/chemicals.js

const POOL_VOLUMES = {
  oasis1: 16099.5,
  oasis2: 30004.8,
};

/**
 * Calculates chemical dosage based on pool ID and current sensor readings.
 * Uses your defined targets: pH 7.4–7.6, ORP 700–800 mV.
 *
 * @param {string} oasisId - "oasis1" or "oasis2"
 * @param {number|null} currentPH
 * @param {number|null} currentORP
 * @returns {{ phSuggestion: string|null, orpSuggestion: string|null }}
 */
export function calculateChemicals(oasisId, currentPH, currentORP) {
  const gallons = POOL_VOLUMES[oasisId];
  if (!gallons) return { phSuggestion: null, orpSuggestion: null };

  const units = gallons / 10000;
  let phSuggestion = null;
  let orpSuggestion = null;

  // --- pH ---
  // Target: 7.4–7.6. Dose toward 7.5 (midpoint).
  if (currentPH != null) {
    if (currentPH > 7.6) {
      // Muriatic Acid: 26 fl oz per 10,000 gal lowers pH by 0.5
      const delta = currentPH - 7.5;
      const flOz = Math.ceil((delta / 0.5) * 26 * units * 10) / 10;
      phSuggestion = `⚠️ Add ${flOz} fl oz Muriatic Acid`;
    } else if (currentPH < 7.4) {
      // Soda Ash: 6 oz per 10,000 gal raises pH by 0.1
      const delta = 7.5 - currentPH;
      const oz = Math.ceil((delta / 0.1) * 6 * units * 10) / 10;
      phSuggestion = `⚠️ Add ${oz} oz Soda Ash`;
    }
  }

  // --- ORP ---
  // Target: 700–800 mV. Dose toward 750 mV (midpoint).
  if (currentORP != null) {
    if (currentORP < 700) {
      // Liquid Chlorine: 1 gal per 10,000 gal raises ORP ~50 mV
      const delta = 750 - currentORP;
      const gals = Math.ceil((delta / 50) * 1 * units * 10) / 10;
      orpSuggestion = `⚠️ Add ${gals} gal Liquid Chlorine`;
    } else if (currentORP > 800) {
      // Kapag sobrang taas ng ORP (over-chlorinated)
      orpSuggestion = `⚠️ ORP is high. Do not add chlorine. Partially drain and refill water.`;
    }
  }

  return { phSuggestion, orpSuggestion };
}