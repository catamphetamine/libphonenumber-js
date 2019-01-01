import { VALID_DIGITS } from './constants'

// The RFC 3966 format for extensions.
const RFC3966_EXTN_PREFIX = ';ext='

// Pattern to capture digits used in an extension.
// Places a maximum length of '7' for an extension.
const CAPTURING_EXTN_DIGITS = '([' + VALID_DIGITS + ']{1,7})'

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
function create_extension_pattern(purpose)
{
	// One-character symbols that can be used to indicate an extension.
	let single_extension_characters = 'x\uFF58#\uFF03~\uFF5E'

	switch (purpose)
	{
		// For parsing, we are slightly more lenient in our interpretation than for matching. Here we
		// allow "comma" and "semicolon" as possible extension indicators. When matching, these are
		case 'parsing':
			single_extension_characters = ',;' + single_extension_characters
	}

	return RFC3966_EXTN_PREFIX +
		CAPTURING_EXTN_DIGITS + '|' +
		'[ \u00A0\\t,]*' +
		'(?:e?xt(?:ensi(?:o\u0301?|\u00F3))?n?|\uFF45?\uFF58\uFF54\uFF4E?|' +
		// "доб."
		'\u0434\u043E\u0431|' +
		'[' + single_extension_characters + ']|int|anexo|\uFF49\uFF4E\uFF54)' +
		'[:\\.\uFF0E]?[ \u00A0\\t,-]*' +
		CAPTURING_EXTN_DIGITS + '#?|' +
		'[- ]+([' + VALID_DIGITS + ']{1,5})#'
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
export const EXTN_PATTERNS_FOR_PARSING = create_extension_pattern('parsing')

export const EXTN_PATTERNS_FOR_MATCHING = create_extension_pattern('matching')

// Regexp of all known extension prefixes used by different regions followed by
// 1 or more valid digits, for use when parsing.
const EXTN_PATTERN = new RegExp('(?:' + EXTN_PATTERNS_FOR_PARSING + ')$', 'i')

// Strips any extension (as in, the part of the number dialled after the call is
// connected, usually indicated with extn, ext, x or similar) from the end of
// the number, and returns it.
export function extractExtension(number)
{
	const start = number.search(EXTN_PATTERN)
	if (start < 0) {
		return {}
	}

	// If we find a potential extension, and the number preceding this is a viable
	// number, we assume it is an extension.
	const number_without_extension = number.slice(0, start)

	const matches = number.match(EXTN_PATTERN)
	let i = 1
	while (i < matches.length)
	{
		if (matches[i] != null && matches[i].length > 0)
		{
			return {
				number : number_without_extension,
				ext    : matches[i]
			}
		}
		i++
	}
}