// src/utils/reviewModeration.js

const INAPPROPRIATE_TERMS = [
  // English Bad Words
  'asshole',
  'bastard',
  'bitch',
  'bullshit',
  'crap',
  'cunt',
  'damn',
  'dick',
  'fag',
  'faggot',
  'fuck',
  'fucked',
  'fucking',
  'motherfucker',
  'piss',
  'pissed',
  'pussy',
  'shit',
  'shitty',
  'whore',
  'slut',
  'hoe',
  
  // Tagalog / Filipino Bad Words
  'putangina',
  'putang ina',
  'tangina',
  'tang ina',
  'tngina',     // Idinagdag mo
  'puta',
  'gago',
  'tanga',
  'tnga',       // Idinagdag mo
  'bobo',
  'ulol',
  'bwisit',
  'bwiset',     // Idinagdag mo
  'leche',
  'lintik',
  'hindot',
  'tarantado',
  'kupal',
  'yawa',
  'pakshet',
  'punyeta',
  'esmiringhoy',
  't4nga',        // Idinagdag mo
  'bembang',     // Idinagdag mo
  'kantot',      // Idinagdag mo
  'pokpok',      // Idinagdag mo
  'iyot',        // Idinagdag mo
  '8080',        // Idinagdag mo
  'kwenta',      // Idinagdag mo (usually kasama ng 'walang kwenta')
  'k4ntot',
  'canthought',
  'walang kwenta',
  'lintik',
  'hinayupak',
  'hayop',
  'animal',
  'ungas',
  'siraulo',
  'abnoy',
  'salsal',
  'jakol',
  'burat',
  'titi',
  'puke',
  'pekpek',
  'bayag',
  'etits'
];

// Normalize function para maging uniform lahat (lowercase, no special chars)
const normalizeText = (text) =>
  String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    // Papalitan ang leet speak (0->o, 1->i, 3->e, 4->a, 5->s, 7->t, @->a, $->s)
    .replace(/[0]/g, 'o')
    .replace(/[1]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's')
    .replace(/[^a-z0-9]+/g, ' ') // Palitan ang special chars ng space
    .trim();

const normalizedTerms = INAPPROPRIATE_TERMS.map((term) =>
  normalizeText(term).split(' '),
);

export function containsInappropriateLanguage(text = '') {
  const words = normalizeText(text).split(' ').filter(Boolean);

  return normalizedTerms.some((termWords) =>
    words.some((_, index) =>
      termWords.every((word, offset) => words[index + offset] === word),
    ),
  );
}