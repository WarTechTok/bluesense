// src/utils/chemicals.js

const POOL_VOLUMES = {
  oasis1: 16099.5,
  oasis2: 30004.8,
};

export function calculateChemicals(oasisId, currentPH, currentORP) {
  const gallons = POOL_VOLUMES[oasisId];
  if (!gallons) return { phSuggestion: null, orpSuggestion: null };

  const units = gallons / 10000;
  let phSuggestion = null;
  let orpSuggestion = null;

  // --- pH ---
  if (currentPH != null) {
    if (currentPH > 7.6) {
      const delta = currentPH - 7.5;
      const flOz = Math.ceil((delta / 0.5) * 26 * units * 10) / 10;
      phSuggestion = `⚠️ Add ${flOz} fl oz Muriatic Acid`;
    } else if (currentPH < 7.4) {
      const delta = 7.5 - currentPH;
      const oz = Math.ceil((delta / 0.1) * 6 * units * 10) / 10;
      phSuggestion = `⚠️ Add ${oz} oz Soda Ash`;
    }
  }

  // --- ORP ---
  if (currentORP != null) {
    if (currentORP < 700) {
      const delta = 750 - currentORP;
      const gals = Math.ceil((delta / 50) * 1 * units * 10) / 10;
      orpSuggestion = `⚠️ Add ${gals} gal Liquid Chlorine`;
    } else if (currentORP > 850) {
      // Over-chlorinated (Kapag lumagpas ng 850mV)
      const delta = currentORP - 750;
      const ozThio = Math.ceil((delta / 50) * 1.4 * units * 10) / 10;
      orpSuggestion = `⚠️ Add ${ozThio} oz Sodium Thiosulfate to neutralize excess chlorine.`;
    }
  }

  return { phSuggestion, orpSuggestion };
}