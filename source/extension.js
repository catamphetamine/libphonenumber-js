import { VALID_DIGITS } from './constants'

// The RFC 3966 format for extensions.
const RFC3966_EXTN_PREFIX = ';ext='

/**
 * Helper method for constructing regular expressions for parsing. Creates
 * an expression that captures up to max_length digits.
 * @return {string} RegEx pattern to capture extension digits.
 */
const getExtensionDigitsPattern = (maxLength) => `([${VALID_DIGITS}]{1,${maxLength}})`

/**
 * Helper initialiser method to create the regular-expression pattern to match
 * extensions.
 * Copy-pasted from Google's `libphonenumber`:
 * https://github.com/google/libphonenumber/blob/55b2646ec9393f4d3d6661b9c82ef9e258e8b829/javascript/i18n/phonenumbers/phonenumberutil.js#L759-L766
 * @return {string} RegEx pattern to capture extensions.
 */
export function createExtensionPattern(purpose) {
	// We cap the maximum length of an extension based on the ambiguity of the way
	// the extension is prefixed. As per ITU, the officially allowed length for
	// extensions is actually 40, but we don't support this since we haven't seen real
	// examples and this introduces many false interpretations as the extension labels
	// are not standardized.
	/** @type {string} */
	var extLimitAfterExplicitLabel = '20';
	/** @type {string} */
	var extLimitAfterLikelyLabel = '15';
	/** @type {string} */
	var extLimitAfterAmbiguousChar = '9';
	/** @type {string} */
	var extLimitWhenNotSure = '6';

	/** @type {string} */
	var possibleSeparatorsBetweenNumberAndExtLabel = "[ \u00A0\\t,]*";
	// Optional full stop (.) or colon, followed by zero or more spaces/tabs/commas.
	/** @type {string} */
	var possibleCharsAfterExtLabel = "[:\\.\uFF0E]?[ \u00A0\\t,-]*";
	/** @type {string} */
	var optionalExtnSuffix = "#?";

	// Here the extension is called out in more explicit way, i.e mentioning it obvious
	// patterns like "ext.".
	/** @type {string} */
	var explicitExtLabels =
	  "(?:e?xt(?:ensi(?:o\u0301?|\u00F3))?n?|\uFF45?\uFF58\uFF54\uFF4E?|\u0434\u043E\u0431|anexo)";
	// One-character symbols that can be used to indicate an extension, and less
	// commonly used or more ambiguous extension labels.
	/** @type {string} */
	var ambiguousExtLabels = "(?:[x\uFF58#\uFF03~\uFF5E]|int|\uFF49\uFF4E\uFF54)";
	// When extension is not separated clearly.
	/** @type {string} */
	var ambiguousSeparator = "[- ]+";
	// This is the same as possibleSeparatorsBetweenNumberAndExtLabel, but not matching
	// comma as extension label may have it.
	/** @type {string} */
	var possibleSeparatorsNumberExtLabelNoComma = "[ \u00A0\\t]*";
	// ",," is commonly used for auto dialling the extension when connected. First
	// comma is matched through possibleSeparatorsBetweenNumberAndExtLabel, so we do
	// not repeat it here. Semi-colon works in Iphone and Android also to pop up a
	// button with the extension number following.
	/** @type {string} */
	var autoDiallingAndExtLabelsFound = "(?:,{2}|;)";

	/** @type {string} */
	var rfcExtn = RFC3966_EXTN_PREFIX
	     + getExtensionDigitsPattern(extLimitAfterExplicitLabel);
	/** @type {string} */
	var explicitExtn = possibleSeparatorsBetweenNumberAndExtLabel + explicitExtLabels
	     + possibleCharsAfterExtLabel
	     + getExtensionDigitsPattern(extLimitAfterExplicitLabel)
	     + optionalExtnSuffix;
	/** @type {string} */
	var ambiguousExtn = possibleSeparatorsBetweenNumberAndExtLabel + ambiguousExtLabels
	     + possibleCharsAfterExtLabel
	+ getExtensionDigitsPattern(extLimitAfterAmbiguousChar)
	+ optionalExtnSuffix;
	/** @type {string} */
	var americanStyleExtnWithSuffix = ambiguousSeparator
	+ getExtensionDigitsPattern(extLimitWhenNotSure) + "#";

	/** @type {string} */
	var autoDiallingExtn = possibleSeparatorsNumberExtLabelNoComma
	     + autoDiallingAndExtLabelsFound + possibleCharsAfterExtLabel
	     + getExtensionDigitsPattern(extLimitAfterLikelyLabel)
	+ optionalExtnSuffix;
	/** @type {string} */
	var onlyCommasExtn = possibleSeparatorsNumberExtLabelNoComma
	    + "(?:,)+" + possibleCharsAfterExtLabel
	    + getExtensionDigitsPattern(extLimitAfterAmbiguousChar)
	    + optionalExtnSuffix;

	// The first regular expression covers RFC 3966 format, where the extension is added
	// using ";ext=". The second more generic where extension is mentioned with explicit
	// labels like "ext:". In both the above cases we allow more numbers in extension than
	// any other extension labels. The third one captures when single character extension
	// labels or less commonly used labels are used. In such cases we capture fewer
	// extension digits in order to reduce the chance of falsely interpreting two
	// numbers beside each other as a number + extension. The fourth one covers the
	// special case of American numbers where the extension is written with a hash
	// at the end, such as "- 503#". The fifth one is exclusively for extension
	// autodialling formats which are used when dialling and in this case we accept longer
	// extensions. The last one is more liberal on the number of commas that acts as
	// extension labels, so we have a strict cap on the number of digits in such extensions.
	return rfcExtn + "|"
	       + explicitExtn + "|"
	       + ambiguousExtn + "|"
	       + americanStyleExtnWithSuffix + "|"
	       + autoDiallingExtn + "|"
	       + onlyCommasExtn;
}

/**
 * Regexp of all possible ways to write extensions, for use when parsing. This
 * will be run as a case-insensitive regexp match. Wide character versions are
 * also provided after each ASCII version. There are three regular expressions
 * here. The first covers RFC 3966 format, where the extension is added using
 * ';ext='. The second more generic one starts with optional white space and
 * ends with an optional full stop (.), followed by zero or more spaces/tabs
 * /commas and then the numbers themselves. The other one covers the special
 * case of American numbers where the extension is written with a hash at the
 * end, such as '- 503#'. Note that the only capturing groups should be around
 * the digits that you want to capture as part of the extension, or else parsing
 * will fail! We allow two options for representing the accented o - the
 * character itself, and one in the unicode decomposed form with the combining
 * acute accent.
 */
export const EXTN_PATTERNS_FOR_PARSING = createExtensionPattern('parsing')

export const EXTN_PATTERNS_FOR_MATCHING = createExtensionPattern('matching')

// Regexp of all known extension prefixes used by different regions followed by
// 1 or more valid digits, for use when parsing.
const EXTN_PATTERN = new RegExp('(?:' + createExtensionPattern() + ')$', 'i')

// Strips any extension (as in, the part of the number dialled after the call is
// connected, usually indicated with extn, ext, x or similar) from the end of
// the number, and returns it.
export function extractExtension(number) {
	const start = number.search(EXTN_PATTERN)
	if (start < 0) {
		return {}
	}
	// If we find a potential extension, and the number preceding this is a viable
	// number, we assume it is an extension.
	const numberWithoutExtension = number.slice(0, start)
	const matches = number.match(EXTN_PATTERN)
	let i = 1
	while (i < matches.length) {
		if (matches[i]) {
			return {
				number: numberWithoutExtension,
				ext: matches[i]
			}
		}
		i++
	}
}