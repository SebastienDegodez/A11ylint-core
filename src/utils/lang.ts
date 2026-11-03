const languageNames = new Intl.DisplayNames(['en'], { type: 'language', fallback: 'none' });

const cache = new Map<string, boolean>();

// RGAA glossary: only the part before the first hyphen is the language code
// (ISO 639-1 2 letters or ISO 639-2 3 letters); what follows is free for the author.
const computeValidity = (value: string): boolean => {
  const [primary] = value.split('-');
  if (!/^[a-z]{2,3}$/i.test(primary)) {
    return false;
  }
  try {
    return languageNames.of(primary.toLowerCase()) !== undefined;
  } catch {
    return false;
  }
};

/**
 * Checks a lang / xml:lang value against the RGAA definition of a language code:
 * the part before the first hyphen must be a known ISO 639-1 / 639-2 language
 * (e.g. "fr", "fra", "fr-FR", "en-us"). Rejects "en_US", "xx", "french" and empty values.
 * Results are memoized: pages usually repeat the same few codes.
 */
export const isValidLangCode = (code: string | null | undefined): boolean => {
  const value = code?.trim();
  if (!value) {
    return false;
  }
  let valid = cache.get(value);
  if (valid === undefined) {
    valid = computeValidity(value);
    cache.set(value, valid);
  }
  return valid;
};
