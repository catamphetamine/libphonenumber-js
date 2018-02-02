// `DASHES` will be right after the opening square bracket of the "character class"
const DASHES = '-\u2010-\u2015\u2212\u30FC\uFF0D'
const SLASHES = '\uFF0F/'
const DOTS = '\uFF0E.'
const WHITESPACE = ' \u00A0\u00AD\u200B\u2060\u3000'
const BRACKETS = '()\uFF08\uFF09\uFF3B\uFF3D\\[\\]'
const TILDES = '~\u2053\u223C\uFF5E'

// Regular expression of acceptable punctuation found in phone numbers. This
// excludes punctuation found as a leading character only. This consists of dash
// characters, white space characters, full stops, slashes, square brackets,
// parentheses and tildes. Full-width variants are also present.
export const VALID_PUNCTUATION = `${DASHES}${SLASHES}${DOTS}${WHITESPACE}${BRACKETS}${TILDES}`

export const PLUS_CHARS = '+\uFF0B'
const LEADING_PLUS_CHARS_PATTERN = new RegExp('^[' + PLUS_CHARS + ']+')

// The maximum length of the country calling code.
const MAX_LENGTH_COUNTRY_CODE = 3

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
// and returns `{ country_phone_code, number }`
// where `number` is the national (significant) phone number.
//
// (aka `maybeExtractCountryPhoneCode`)
//
export function parse_phone_number_and_country_phone_code(number, metadata)
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
		return { number }
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
	let i = 1
	while (i <= MAX_LENGTH_COUNTRY_CODE && i <= number.length)
	{
		const country_phone_code = number.slice(1, i)

		if (metadata.country_phone_code_to_countries[country_phone_code])
		{
			return {
				country_phone_code,
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

	for (const character of text)
	{
		const replacement = replacements[character.toUpperCase()]

		if (replacement)
		{
			replaced += replacement
		}
	}

	return replaced
}