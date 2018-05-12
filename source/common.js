import { stripIDDPrefix } from './IDD'

// `DASHES` will be right after the opening square bracket of the "character class"
const DASHES = '-\u2010-\u2015\u2212\u30FC\uFF0D'
const SLASHES = '\uFF0F/'
const DOTS = '\uFF0E.'
export const WHITESPACE = ' \u00A0\u00AD\u200B\u2060\u3000'
const BRACKETS = '()\uFF08\uFF09\uFF3B\uFF3D\\[\\]'
// export const OPENING_BRACKETS = '(\uFF08\uFF3B\\\['
const TILDES = '~\u2053\u223C\uFF5E'

// Digits accepted in phone numbers
// (ascii, fullwidth, arabic-indic, and eastern arabic digits).
export const VALID_DIGITS = '0-9\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9'

// Regular expression of acceptable punctuation found in phone numbers. This
// excludes punctuation found as a leading character only. This consists of dash
// characters, white space characters, full stops, slashes, square brackets,
// parentheses and tildes. Full-width variants are also present.
export const VALID_PUNCTUATION = `${DASHES}${SLASHES}${DOTS}${WHITESPACE}${BRACKETS}${TILDES}`

export const PLUS_CHARS = '+\uFF0B'
const LEADING_PLUS_CHARS_PATTERN = new RegExp('^[' + PLUS_CHARS + ']+')

// The ITU says the maximum length should be 15,
// but one can find longer numbers in Germany.
export const MAX_LENGTH_FOR_NSN = 17

// The maximum length of the country calling code.
export const MAX_LENGTH_COUNTRY_CODE = 3

// These mappings map a character (key) to a specific digit that should
// replace it for normalization purposes. Non-European digits that
// may be used in phone numbers are mapped to a European equivalent.
//
// E.g. in Iraq they don't write `+442323234` but rather `+٤٤٢٣٢٣٢٣٤`.
//
export const DIGIT_MAPPINGS =
{
	'0': '0',
	'1': '1',
	'2': '2',
	'3': '3',
	'4': '4',
	'5': '5',
	'6': '6',
	'7': '7',
	'8': '8',
	'9': '9',
	'\uFF10': '0', // Fullwidth digit 0
	'\uFF11': '1', // Fullwidth digit 1
	'\uFF12': '2', // Fullwidth digit 2
	'\uFF13': '3', // Fullwidth digit 3
	'\uFF14': '4', // Fullwidth digit 4
	'\uFF15': '5', // Fullwidth digit 5
	'\uFF16': '6', // Fullwidth digit 6
	'\uFF17': '7', // Fullwidth digit 7
	'\uFF18': '8', // Fullwidth digit 8
	'\uFF19': '9', // Fullwidth digit 9
	'\u0660': '0', // Arabic-indic digit 0
	'\u0661': '1', // Arabic-indic digit 1
	'\u0662': '2', // Arabic-indic digit 2
	'\u0663': '3', // Arabic-indic digit 3
	'\u0664': '4', // Arabic-indic digit 4
	'\u0665': '5', // Arabic-indic digit 5
	'\u0666': '6', // Arabic-indic digit 6
	'\u0667': '7', // Arabic-indic digit 7
	'\u0668': '8', // Arabic-indic digit 8
	'\u0669': '9', // Arabic-indic digit 9
	'\u06F0': '0', // Eastern-Arabic digit 0
	'\u06F1': '1', // Eastern-Arabic digit 1
	'\u06F2': '2', // Eastern-Arabic digit 2
	'\u06F3': '3', // Eastern-Arabic digit 3
	'\u06F4': '4', // Eastern-Arabic digit 4
	'\u06F5': '5', // Eastern-Arabic digit 5
	'\u06F6': '6', // Eastern-Arabic digit 6
	'\u06F7': '7', // Eastern-Arabic digit 7
	'\u06F8': '8', // Eastern-Arabic digit 8
	'\u06F9': '9'  // Eastern-Arabic digit 9
}

/**
 * Drops all punctuation leaving only digits and the leading `+` sign (if any).
 * Also converts wide-ascii and arabic-indic numerals to conventional numerals.
 *
 * E.g. in Iraq they don't write `+442323234` but rather `+٤٤٢٣٢٣٢٣٤`.
 *
 * @param  {string} number
 * @return {string}
 */
export function parse_phone_number_digits(number)
{
	return (LEADING_PLUS_CHARS_PATTERN.test(number) ? '+' : '') +
		drop_and_substitute_characters(number, DIGIT_MAPPINGS)
}

// Parses a formatted phone number
// and returns `{ country_calling_code, number }`
// where `number` is the national (significant) phone number.
//
// (aka `maybeExtractCountryPhoneCode`)
//
export function parse_national_number_and_country_calling_code(number, country, metadata)
{
	number = parse_phone_number_digits(number)

	if (!number)
	{
		return {}
	}

	// If this is not an international phone number,
	// then don't extract country phone code.
	if (number[0] !== '+')
	{
		// Convert an "out-of-country" dialing phone number
		// to a proper international phone number.
		const numberWithoutIDD = stripIDDPrefix(number, country, metadata.metadata)

		// If an IDD prefix was stripped then
		// convert the number to international one.
		if (numberWithoutIDD && numberWithoutIDD !== number) {
			number = '+' + numberWithoutIDD
		} else {
			return { number }
		}
	}

	// Fast abortion: country codes do not begin with a '0'
	if (number[1] === '0')
	{
		return {}
	}

	// The thing with country phone codes
	// is that they are orthogonal to each other
	// i.e. there's no such country phone code A
	// for which country phone code B exists
	// where B starts with A.
	// Therefore, while scanning digits,
	// if a valid country code is found,
	// that means that it is the country code.
	//
	let i = 2
	while (i - 1 <= MAX_LENGTH_COUNTRY_CODE && i <= number.length)
	{
		const countryCallingCode = number.slice(1, i)

		if (metadata.countryCallingCodes()[countryCallingCode])
		{
			return {
				countryCallingCode,
				number: number.slice(i)
			}
		}

		i++
	}

	return {}
}

// Checks whether the entire input sequence can be matched
// against the regular expression.
export function matches_entirely(text = '', regular_expression)
{
	if (typeof regular_expression === 'string')
	{
		regular_expression = '^(?:' + regular_expression + ')$'
	}

	const matched_groups = text.match(regular_expression)
	return matched_groups !== null && matched_groups[0].length === text.length
}

// For any character not being part of `replacements`
// it is removed from the phone number.
function drop_and_substitute_characters(text, replacements)
{
	let replaced = ''

	// Using `.split('')` to iterate through a string here
	// to avoid requiring `Symbol.iterator` polyfill.
	// `.split('')` is generally not safe for Unicode,
	// but in this particular case for `digits` it is safe.
	// for (const character of text)
	for (const character of text.split(''))
	{
		const replacement = replacements[character.toUpperCase()]

		if (replacement)
		{
			replaced += replacement
		}
	}

	return replaced
}

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
export function create_extension_pattern(purpose)
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
		'[' + single_extension_characters + ']|int|anexo|\uFF49\uFF4E\uFF54)' +
		'[:\\.\uFF0E]?[ \u00A0\\t,-]*' +
		CAPTURING_EXTN_DIGITS + '#?|' +
		'[- ]+([' + VALID_DIGITS + ']{1,5})#'
}