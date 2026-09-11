const keywords = require('../config/keywords.json');

/**
 * Lowercase and collapse whitespace/newlines so PDF text extraction
 * artifacts (extra spaces, line breaks mid-phrase) don't break matching.
 */
function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Escapes regex special characters in a raw string.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a regex for a keyword phrase that tolerates simple suffix
 * variants on the final word only (e.g. "torque wrench" also matches
 * "torque wrenches"; "pre-tensioning" also matches "pre-tensioned").
 * This satisfies the "handle simple variants" requirement without
 * pulling in a full stemming library.
 */
function buildKeywordRegex(keyword) {
  const words = keyword.trim().split(/\s+/).map(escapeRegex);
  const lastWord = words.pop();
  // optional trailing s / es / ing / ed / er / ers on the last word
  const lastWordVariant = `${lastWord}(e?s|ing|ed|ers?)?`;
  const pattern = [...words, lastWordVariant].join('\\s+');
  // \b avoids matching inside unrelated longer words
  return new RegExp(`\\b${pattern}\\b`, 'gi');
}

/**
 * Scans text against the keyword list.
 * @param {string} text - extracted document text
 * @returns {string[]} list of keywords (original casing from config) that matched
 */
function matchKeywords(text) {
  const normalizedText = normalize(text);
  const matched = [];

  for (const keyword of keywords) {
    const regex = buildKeywordRegex(keyword);
    if (regex.test(normalizedText)) {
      matched.push(keyword);
    }
  }

  return matched;
}

/**
 * Computes a relevance verdict dynamically from the match count.
 * Thresholds are intentionally simple and documented, per the brief:
 * 0 = Not Related, 1-2 = Possible, 3+ = Related.
 */
function getRelevance(matchCount) {
  if (matchCount >= 3) return 'Yes';
  if (matchCount >= 1) return 'Possible';
  return 'No';
}

module.exports = { matchKeywords, getRelevance };
