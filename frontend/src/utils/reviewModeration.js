const INAPPROPRIATE_TERMS = [
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
  'putangina',
  'putang ina',
  'tangina',
  'tang ina',
  'puta',
  'gago',
  'tanga',
  'bobo',
  'ulol',
  'bwisit',
  'leche',
  'lintik',
  'hindot',
  'tarantado',
  'kupal',
  'yawa',
  'pakshet',
  'punyeta',
];

const normalizeText = (text) =>
  String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
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
