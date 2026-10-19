import { containsInappropriateLanguage } from './reviewModeration';

describe('containsInappropriateLanguage', () => {
  it('detects English profanity without case sensitivity', () => {
    expect(containsInappropriateLanguage('This place is SHIT.')).toBe(true);
  });

  it('detects Tagalog profanity in joined and separated forms', () => {
    expect(containsInappropriateLanguage('Putangina, never coming back.')).toBe(true);
    expect(containsInappropriateLanguage('Putang ina talaga.')).toBe(true);
    expect(containsInappropriateLanguage('Ang bobo ng staff.')).toBe(true);
  });

  it('does not flag words that only contain a listed term as a substring', () => {
    expect(containsInappropriateLanguage('The package was fantastic.')).toBe(false);
    expect(containsInappropriateLanguage('We enjoyed the pool and food.')).toBe(false);
  });

  it('handles missing review text', () => {
    expect(containsInappropriateLanguage()).toBe(false);
  });
});
