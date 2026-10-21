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
      // HIGH pH: Muriatic Acid (Available)
      const delta = currentPH - 7.5;
      const flOz = Math.ceil((delta / 0.5) * 26 * units * 10) / 10;
      phSuggestion = `⚠️ Add ${flOz} fl oz Muriatic Acid`;
    } else if (currentPH < 7.4) {
      // LOW pH: Soda Ash (Available na!)
      // Note: 1 kg = 35.27 oz. Ginamit natin ang kilograms as base sa inventory mo.
      const delta = 7.5 - currentPH;
      const ozNeeded = (delta / 0.1) * 6 * units; // Compute ounces
      const kgNeeded = (ozNeeded / 35.27).toFixed(2); // Convert to kg
      phSuggestion = `⚠️ Add ${kgNeeded} kg Soda Ash`;
    }
  }

  // --- ORP ---
  if (currentORP != null) {
    if (currentORP < 700) {
      // LOW ORP: Chlorine or Winrox (Available)
      const delta = 750 - currentORP;
      const gals = Math.ceil((delta / 50) * 1 * units * 10) / 10;
      orpSuggestion = `⚠️ Add ${gals} gal Chlorine or Winrox`;
    } else if (currentORP > 850) {
      // HIGH ORP: Sodium Thiosulfate (Available na!)
      // Note: 1 kg = 35.27 oz. Ginamit natin ang kilograms as base sa inventory mo.
      const delta = currentORP - 750;
      const ozThio = (delta / 50) * 1.4 * units; // Compute ounces
      const kgThio = (ozThio / 35.27).toFixed(2); // Convert to kg
      orpSuggestion = `⚠️ Add ${kgThio} kg Sodium Thiosulfate`;
    }
  }

  return { phSuggestion, orpSuggestion };
}