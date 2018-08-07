// Copy-pasted from `PhoneNumberMatcher.js`.

import { PLUS_CHARS } from './common';

import { isLatinLetter, isInvalidPunctuationSymbol } from './utf-8.common';

export var OPENING_PARENS = '(\\[\uFF08\uFF3B';
export var CLOSING_PARENS = ')\\]\uFF09\uFF3D';

export var LEAD_CLASS = '[' + OPENING_PARENS + PLUS_CHARS + ']';

// Punctuation that may be at the start of a phone number - brackets and plus signs.
var LEAD_CLASS_LEADING = new RegExp('^' + LEAD_CLASS);

/**
 * Pattern to check that brackets match. Opening brackets should be closed within a phone number.
 * This also checks that there is something inside the brackets. Having no brackets at all is also
 * fine.
 *
 * An opening bracket at the beginning may not be closed, but subsequent ones should be.  It's
 * also possible that the leading bracket was dropped, so we shouldn't be surprised if we see a
 * closing bracket first. We limit the sets of brackets in a phone number to four.
 */
var MATCHING_BRACKETS_ENTIRE = new RegExp('^' + "(?:[" + openingParens + "])?" + "(?:" + nonParens + "+" + "[" + closingParens + "])?" + nonParens + "+" + "(?:[" + openingParens + "]" + nonParens + "+[" + closingParens + "])" + bracketPairLimit + nonParens + "*" + '$');

/**
 * Matches strings that look like publication pages. Example:
 * <pre>Computing Complete Answers to Queries in the Presence of Limited Access Patterns.
 * Chen Li. VLDB J. 12(3): 211-227 (2003).</pre>
 *
 * The string "211-227 (2003)" is not a telephone number.
 */
var PUB_PAGES = /\d{1,5}-+\d{1,5}\s{0,4}\(\d{1,4}/;

/**
 * Leniency when finding potential phone numbers in text segments
 * The levels here are ordered in increasing strictness.
 */
export var Leniency = {
	/**
  * Phone numbers accepted are "possible", but not necessarily "valid".
  */
	POSSIBLE: function POSSIBLE(number, candidate, metadata) {
		return parseNumber(number, { extended: true }, metadata).possible;
	},


	/**
  * Phone numbers accepted are "possible" and "valid".
  * Numbers written in national format must have their national-prefix
  * present if it is usually written for a number of this type.
  */
	VALID: function VALID(number, candidate, metadata) {
		if (!isValidNumber(number, metadata) || !containsOnlyValidXChars(number, candidate.toString(), metadata)) {
			return false;
		}

		return isNationalPrefixPresentIfRequired(number, metadata);
	},


	/**
  * Phone numbers accepted are "valid" and
  * are grouped in a possible way for this locale. For example, a US number written as
  * "65 02 53 00 00" and "650253 0000" are not accepted at this leniency level, whereas
  * "650 253 0000", "650 2530000" or "6502530000" are.
  * Numbers with more than one '/' symbol in the national significant number
  * are also dropped at this level.
  *
  * Warning: This level might result in lower coverage especially for regions outside of
  * country code "+1". If you are not sure about which level to use,
  * email the discussion group libphonenumber-discuss@googlegroups.com.
  */
	STRICT_GROUPING: function STRICT_GROUPING(number, candidate, metadata) {
		var candidateString = candidate.toString();

		if (!isValidNumber(number, metadata) || !containsOnlyValidXChars(number, candidateString, metadata) || containsMoreThanOneSlashInNationalNumber(number, candidateString) || !isNationalPrefixPresentIfRequired(number, metadata)) {
			return false;
		}

		return checkNumberGroupingIsValid(number, candidate, metadata, allNumberGroupsRemainGrouped);
	},


	/**
  * Phone numbers accepted are {@linkplain PhoneNumberUtil#isValidNumber(PhoneNumber) valid} and
  * are grouped in the same way that we would have formatted it, or as a single block. For
  * example, a US number written as "650 2530000" is not accepted at this leniency level, whereas
  * "650 253 0000" or "6502530000" are.
  * Numbers with more than one '/' symbol are also dropped at this level.
  * <p>
  * Warning: This level might result in lower coverage especially for regions outside of country
  * code "+1". If you are not sure about which level to use, email the discussion group
  * libphonenumber-discuss@googlegroups.com.
  */
	EXACT_GROUPING: function EXACT_GROUPING(number, candidate, metadata) {
		var candidateString = candidate.toString();

		if (!isValidNumber(number, metadata) || !containsOnlyValidXChars(number, candidateString, metadata) || containsMoreThanOneSlashInNationalNumber(number, candidateString) || !isNationalPrefixPresentIfRequired(number, metadata)) {
			return false;
		}

		return checkNumberGroupingIsValid(number, candidate, metadata, allNumberGroupsAreExactlyPresent);
	}
};

export function isValidCandidate(candidate, offset, text, leniency) {
	// Check the candidate doesn't contain any formatting
	// which would indicate that it really isn't a phone number.
	if (!MATCHING_BRACKETS_ENTIRE.test(candidate) || PUB_PAGES.test(candidate)) {
		return;
	}

	// If leniency is set to VALID or stricter, we also want to skip numbers that are surrounded
	// by Latin alphabetic characters, to skip cases like abc8005001234 or 8005001234def.
	if (leniency !== Leniency.POSSIBLE) {
		// If the candidate is not at the start of the text,
		// and does not start with phone-number punctuation,
		// check the previous character.
		if (offset > 0 && !LEAD_CLASS_LEADING.test(candidate)) {
			var previousChar = text[offset - 1];
			// We return null if it is a latin letter or an invalid punctuation symbol.
			if (isInvalidPunctuationSymbol(previousChar) || isLatinLetter(previousChar)) {
				return false;
			}
		}

		var lastCharIndex = offset + candidate.length;
		if (lastCharIndex < text.length) {
			var nextChar = text[lastCharIndex];
			if (isInvalidPunctuationSymbol(nextChar) || isLatinLetter(nextChar)) {
				return false;
			}
		}
	}

	return true;
}
//# sourceMappingURL=findNumbers.common.js.map