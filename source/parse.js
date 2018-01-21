// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import { matches_entirely } from './common'

import
{
	get_phone_code,
	get_national_number_pattern,
	get_national_prefix_for_parsing,
	get_national_prefix_transform_rule,
	get_leading_digits,
	get_metadata_by_country_phone_code,
	get_formats,
	// get_format_national_prefix_is_mandatory_when_formatting
}
from './metadata'

import
{
	choose_format_for_number
}
from './format'

import get_number_type from './types'

// The maximum length of the country calling code.
const MAX_LENGTH_COUNTRY_CODE = 3

// The minimum length of the national significant number.
const MIN_LENGTH_FOR_NSN = 2

// The ITU says the maximum length should be 15,
// but one can find longer numbers in Germany.
const MAX_LENGTH_FOR_NSN = 17

// We don't allow input strings for parsing to be longer than 250 chars.
// This prevents malicious input from consuming CPU.
const MAX_INPUT_STRING_LENGTH = 250

export const PLUS_CHARS = '+\uFF0B'

// Digits accepted in phone numbers
// (ascii, fullwidth, arabic-indic, and eastern arabic digits).
export const VALID_DIGITS = '0-9\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9'

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

// Pattern to capture digits used in an extension.
// Places a maximum length of '7' for an extension.
const CAPTURING_EXTN_DIGITS = '([' + VALID_DIGITS + ']{1,7})'

// The RFC 3966 format for extensions.
const RFC3966_EXTN_PREFIX = ';ext='

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
const EXTN_PATTERNS_FOR_PARSING =
	RFC3966_EXTN_PREFIX +
	CAPTURING_EXTN_DIGITS + '|' +
	'[ \u00A0\\t,]*' +
	'(?:e?xt(?:ensi(?:o\u0301?|\u00F3))?n?|\uFF45?\uFF58\uFF54\uFF4E?|' +
	'[;,x\uFF58#\uFF03~\uFF5E]|int|anexo|\uFF49\uFF4E\uFF54)' +
	'[:\\.\uFF0E]?[ \u00A0\\t,-]*' +
	CAPTURING_EXTN_DIGITS + '#?|' +
	'[- ]+([' + VALID_DIGITS + ']{1,5})#'

// Regexp of all known extension prefixes used by different regions followed by
// 1 or more valid digits, for use when parsing.
const EXTN_PATTERN = new RegExp('(?:' + EXTN_PATTERNS_FOR_PARSING + ')$', 'i')

//  Regular expression of viable phone numbers. This is location independent.
//  Checks we have at least three leading digits, and only valid punctuation,
//  alpha characters and digits in the phone number. Does not include extension
//  data. The symbol 'x' is allowed here as valid punctuation since it is often
//  used as a placeholder for carrier codes, for example in Brazilian phone
//  numbers. We also allow multiple '+' characters at the start.
//
//  Corresponds to the following:
//  [digits]{minLengthNsn}|
//  plus_sign*
//  (([punctuation]|[star])*[digits]){3,}([punctuation]|[star]|[digits]|[alpha])*
//
//  The first reg-ex is to allow short numbers (two digits long) to be parsed if
//  they are entered as "15" etc, but only if there is no punctuation in them.
//  The second expression restricts the number of digits to three or more, but
//  then allows them to be in international form, and to have alpha-characters
//  and punctuation. We split up the two reg-exes here and combine them when
//  creating the reg-ex VALID_PHONE_NUMBER_PATTERN itself so we can prefix it
//  with ^ and append $ to each branch.
//
//  "Note VALID_PUNCTUATION starts with a -,
//   so must be the first in the range" (c) Google devs.
//  (wtf did they mean by saying that; probably nothing)
//
const MIN_LENGTH_PHONE_NUMBER_PATTERN = '[' + VALID_DIGITS + ']{' + MIN_LENGTH_FOR_NSN + '}'
//
// And this is the second reg-exp:
// (see MIN_LENGTH_PHONE_NUMBER_PATTERN for a full description of this reg-exp)
//
const VALID_PHONE_NUMBER =
		'[' + PLUS_CHARS + ']{0,1}' +
		'(?:' +
			'[' + VALID_PUNCTUATION + ']*' +
			'[' + VALID_DIGITS + ']' +
		'){3,}' +
		'[' +
			VALID_PUNCTUATION +
			VALID_DIGITS +
		']*'

// The combined regular expression for valid phone numbers:
//
const VALID_PHONE_NUMBER_PATTERN = new RegExp
(
	// Either a short two-digit-only phone number
	'^' +
		MIN_LENGTH_PHONE_NUMBER_PATTERN +
	'$' +
	'|' +
	// Or a longer fully parsed phone number (min 3 characters)
	'^' +
		VALID_PHONE_NUMBER +
		// Phone number extensions
		'(?:' + EXTN_PATTERNS_FOR_PARSING + ')?' +
	'$'
,
'i')

// This consists of the plus symbol, digits, and arabic-indic digits.
const PHONE_NUMBER_START_PATTERN = new RegExp('[' + PLUS_CHARS + VALID_DIGITS + ']')

// Regular expression of trailing characters that we want to remove.
const AFTER_PHONE_NUMBER_END_PATTERN = new RegExp('[^' + VALID_DIGITS + ']+$')

const LEADING_PLUS_CHARS_PATTERN = new RegExp('^[' + PLUS_CHARS + ']+')

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

const default_options =
{
	country: {}
}

// `options`:
//  {
//    country:
//    {
//      restrict - (a two-letter country code)
//                 the phone number must be in this country
//
//      default - (a two-letter country code)
//                default country to use for phone number parsing and validation
//                (if no country code could be derived from the phone number)
//    }
//  }
//
// Returns `{ country, number }`
//
// Example use cases:
//
// ```js
// parse('8 (800) 555-35-35', 'RU')
// parse('8 (800) 555-35-35', 'RU', metadata)
// parse('8 (800) 555-35-35', { country: { default: 'RU' } })
// parse('8 (800) 555-35-35', { country: { default: 'RU' } }, metadata)
// parse('+7 800 555 35 35')
// parse('+7 800 555 35 35', metadata)
// ```
//
export default function parse(arg_1, arg_2, arg_3)
{
	let { text, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3)

	// Validate country codes

	// Validate `default` country
	if (options.country.default && !metadata.countries[options.country.default])
	{
		throw new Error(`Unknown country code: ${options.country.default}`)
	}

	// Validate `restrict` country
	if (options.country.restrict && !metadata.countries[options.country.restrict])
	{
		throw new Error(`Unknown country code: ${options.country.restrict}`)
	}

	// Parse the phone number

	let formatted_phone_number
	let extension

	// Parse RFC 3966 phone number URI.
	if (text && text.indexOf('tel:') === 0)
	{
		for (const part of text.split(';'))
		{
			const [name, value] = part.split(':')
			switch (name)
			{
				case 'tel':
					formatted_phone_number = value
					break
				case 'ext':
					extension = value
					break
				case 'phone-context':
					// Domain contexts are ignored.
					if (value[0] === '+')
					{
						formatted_phone_number = value + formatted_phone_number
					}
					break
			}
		}
	}
	else
	{
		formatted_phone_number = extract_formatted_phone_number(text)
	}

	// If the phone number is not viable, then abort.
	if (!is_viable_phone_number(formatted_phone_number))
	{
		return {}
	}

	// Attempt to parse extension first, since it doesn't require region-specific
	// data and we want to have the non-normalised number here.
	const with_extension_stripped = strip_extension(formatted_phone_number)

	if (with_extension_stripped.extension)
	{
		formatted_phone_number = with_extension_stripped.number,
		extension              = with_extension_stripped.extension
	}

	let { country_phone_code, number } = parse_phone_number_and_country_phone_code(formatted_phone_number, metadata)

	// Maybe invalid country phone code encountered
	if (!number)
	{
		return {}
	}

	let country
	let country_metadata

	// Whether the phone number is formatted as an international phone number
	let is_international = false

	if (country_phone_code)
	{
		is_international = true

		// Check country restriction
		if (options.country.restrict &&
			country_phone_code !== get_phone_code(metadata.countries[options.country.restrict]))
		{
			return {}
		}

		// Formatting information for regions which share
		// a country calling code is contained by only one region
		// for performance reasons. For example, for NANPA region
		// ("North American Numbering Plan Administration",
		//  which includes USA, Canada, Cayman Islands, Bahamas, etc)
		// it will be contained in the metadata for `US`.
		country_metadata = get_metadata_by_country_phone_code(country_phone_code, metadata)

		// `country` will be set later,
		// because, for example, for NANPA countries
		// there are several countries corresponding
		// to the same `1` country phone code.
		// Therefore, to reliably determine the exact country,
		// national (significant) number should be parsed first.
	}
	else if (options.country.restrict || options.country.default)
	{
		country = options.country.restrict || options.country.default
		country_metadata = metadata.countries[country]

		number = normalize(formatted_phone_number)
	}

	if (!country_metadata)
	{
		return {}
	}

	let national_number = number

	// Only strip national prefixes for non-international phone numbers
	// because national prefixes can't be present in international phone numbers.
	// Otherwise, while forgiving, it would parse a NANPA number `+1 1877 215 5230`
	// first to `1877 215 5230` and then, stripping the leading `1`, to `877 215 5230`,
	// and then it would assume that's a valid number which it isn't.
	// So no forgiveness for grandmas here.
	// The issue asking for this fix:
	// https://github.com/catamphetamine/libphonenumber-js/issues/159
	if (!is_international)
	{
		national_number = strip_national_prefix(number, country_metadata)
	}

	const did_have_national_prefix = national_number !== number

	// https://github.com/catamphetamine/libphonenumber-js/issues/67
	// if (!is_international && !did_have_national_prefix &&
	// 		is_national_prefix_required(national_number, country_metadata))
	// {
	// 	return {}
	// }

	// Sometimes there are several countries
	// corresponding to the same country phone code
	// (e.g. NANPA countries all having `1` country phone code).
	// Therefore, to reliably determine the exact country,
	// national (significant) number should have been parsed first.
	//
	if (!country)
	{
		// When `metadata.json` is generated, all "ambiguous" country phone codes
		// get their countries populated with the full set of
		// "phone number type" regular expressions.
		country = find_country_code(country_phone_code, national_number, metadata)

		// Just in case there appears to be a bug in Google's metadata
		// and the exact country could not be extracted from the phone number.
		/* istanbul ignore if */
		if (!country)
		{
			return {}
		}

		// Update metadata to be for this specific country
		country_metadata = metadata.countries[country]
	}

	// Validate national (significant) number length.
	//
	// A sidenote:
	//
	// They say that sometimes national (significant) numbers
	// can be longer than `MAX_LENGTH_FOR_NSN` (e.g. in Germany).
	// https://github.com/googlei18n/libphonenumber/blob/7e1748645552da39c4e1ba731e47969d97bdb539/resources/phonenumber.proto#L36
	// Such numbers will just be discarded.
	//
	if (national_number.length > MAX_LENGTH_FOR_NSN)
	{
		return {}
	}

	// National number pattern is different for each country,
	// even for those ones which are part of the "NANPA" group.
	const national_number_rule = new RegExp(get_national_number_pattern(country_metadata))

	// Check if national phone number pattern matches the number
	if (!matches_entirely(national_number, national_number_rule))
	{
		return {}
	}

	const result =
	{
		country,
		phone: national_number
	}

	if (extension)
	{
		result.ext = extension
	}

	return result
}

// Normalizes a string of characters representing a phone number.
// This converts wide-ascii and arabic-indic numerals to European numerals,
// and strips punctuation and alpha characters.
//
// E.g. in Iraq they don't write `+442323234` but rather `+٤٤٢٣٢٣٢٣٤`.
//
export function normalize(number)
{
	return replace_characters(number, DIGIT_MAPPINGS)
}

// For any character not being part of `replacements`
// it is removed from the phone number.
export function replace_characters(text, replacements)
{
	let replaced = ''

	for (const character of text)
	{
		const replacement = replacements[character.toUpperCase()]

		if (replacement !== undefined)
		{
			replaced += replacement
		}
	}

	return replaced
}

// Checks to see if the string of characters could possibly be a phone number at
// all. At the moment, checks to see that the string begins with at least 2
// digits, ignoring any punctuation commonly found in phone numbers. This method
// does not require the number to be normalized in advance - but does assume
// that leading non-number symbols have been removed, such as by the method
// `extract_possible_number`.
//
export function is_viable_phone_number(number)
{
	return number.length >= MIN_LENGTH_FOR_NSN &&
		matches_entirely(number, VALID_PHONE_NUMBER_PATTERN)
}

export function extract_formatted_phone_number(text)
{
	if (!text || text.length > MAX_INPUT_STRING_LENGTH)
	{
		return ''
	}

	// Attempt to extract a possible number from the string passed in

	const starts_at = text.search(PHONE_NUMBER_START_PATTERN)

	if (starts_at < 0)
	{
		return ''
	}

	return text
		// Trim everything to the left of the phone number
		.slice(starts_at)
		// Remove trailing non-numerical characters
		.replace(AFTER_PHONE_NUMBER_END_PATTERN, '')
}

// Parses a formatted phone number.
export function parse_phone_number(number)
{
	if (!number)
	{
		return ''
	}

	const is_international = LEADING_PLUS_CHARS_PATTERN.test(number)

	// Remove non-digits
	// (and strip the possible leading '+')
	number = normalize(number)

	if (is_international)
	{
		return `+${number}`
	}

	return number
}

// Parses a formatted phone number
// and returns `{ country_phone_code, number }`
// where `number` is the national (significant) phone number.
//
// (aka `maybeExtractCountryPhoneCode`)
//
export function parse_phone_number_and_country_phone_code(number, metadata)
{
	number = parse_phone_number(number)

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

	// Strip the leading '+' sign
	number = number.slice(1)

	// Fast abortion: country codes do not begin with a '0'
	if (number[0] === '0')
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
		const country_phone_code = number.slice(0, i)

		if (metadata.country_phone_code_to_countries[country_phone_code])
		{
			return { country_phone_code, number: number.slice(i) }
		}

		i++
	}

	return {}
}

// Strips any national prefix (such as 0, 1) present in the number provided
export function strip_national_prefix(number, country_metadata)
{
	const national_prefix_for_parsing = get_national_prefix_for_parsing(country_metadata)

	if (!number || !national_prefix_for_parsing)
	{
		return number
	}

	// Attempt to parse the first digits as a national prefix
	const national_prefix_pattern = new RegExp('^(?:' + national_prefix_for_parsing + ')')
	const national_prefix_matcher = national_prefix_pattern.exec(number)

	// If no national prefix is present in the phone number,
	// but if the national prefix is optional for this country,
	// then consider this phone number valid.
	//
	// Google's reference `libphonenumber` implementation
	// wouldn't recognize such phone numbers as valid,
	// but I think it would perfectly make sense
	// to consider such phone numbers as valid
	// because if a national phone number was originally
	// formatted without the national prefix
	// then it must be parseable back into the original national number.
	// In other words, `parse(format(number))`
	// must always be equal to `number`.
	//
	if (!national_prefix_matcher)
	{
		return number
	}


	let national_significant_number

	// `national_prefix_for_parsing` capturing groups
	// (used only for really messy cases: Argentina, Brazil, Mexico, Somalia)
	const any_groups_were_captured = national_prefix_matcher[national_prefix_matcher.length - 1]
	const national_prefix_transform_rule = get_national_prefix_transform_rule(country_metadata)

	// If the national number tranformation is needed then do it
	if (national_prefix_transform_rule && any_groups_were_captured)
	{
		national_significant_number = number.replace(national_prefix_pattern, national_prefix_transform_rule)
	}
	// Else, no transformation is necessary,
	// and just strip the national prefix.
	else
	{
		national_significant_number = number.slice(national_prefix_matcher[0].length)
	}

	// Verify the parsed national (significant) number for this country
	const national_number_rule = new RegExp(get_national_number_pattern(country_metadata))

	// If the original number (before stripping national prefix) was viable,
	// and the resultant number is not, then prefer the original phone number.
	// This is because for some countries (e.g. Russia) the same digit could be both
	// a national prefix and a leading digit of a valid national phone number,
	// like `8` is the national prefix for Russia and both
	// `8 800 555 35 35` and `800 555 35 35` are valid numbers.
	if (matches_entirely(number, national_number_rule) &&
			!matches_entirely(national_significant_number, national_number_rule))
	{
		return number
	}

	// Return the parsed national (significant) number
   return national_significant_number
}

export function find_country_code(country_phone_code, national_phone_number, metadata)
{
	// Is always non-empty, because `country_phone_code` is always valid
	const possible_countries = metadata.country_phone_code_to_countries[country_phone_code]

	// If there's just one country corresponding to the country code,
	// then just return it, without further phone number digits validation.
	if (possible_countries.length === 1)
	{
		return possible_countries[0]
	}

	for (let country_code of possible_countries)
	{
		const country = metadata.countries[country_code]

		// Leading digits check would be the simplest one
		if (get_leading_digits(country))
		{
			if (national_phone_number &&
				national_phone_number.search(get_leading_digits(country)) === 0)
			{
				return country_code
			}
		}
		// Else perform full validation with all of those bulky
		// fixed-line/mobile/etc regular expressions.
		else if (get_number_type({ phone: national_phone_number, country: country_code }, metadata))
		{
			return country_code
		}
	}
}

// export function is_national_prefix_required(national_number, country_metadata)
// {
// 	const format = choose_format_for_number(get_formats(country_metadata), national_number)
//
// 	if (format)
// 	{
// 		return get_format_national_prefix_is_mandatory_when_formatting(format, country_metadata)
// 	}
// }

// Sort out arguments
function sort_out_arguments(arg_1, arg_2, arg_3)
{
	let text
	let options
	let metadata

	// Normalize numerical `value`.
	// https://github.com/catamphetamine/libphonenumber-js/issues/142
	// `parse(88005553535, ...)`.
	if (typeof arg_1 === 'number')
	{
		arg_1 = String(arg_1)
	}

	// If the phone number is passed as a string.
	// `parse('88005553535', ...)`.
	if (typeof arg_1 === 'string')
	{
		text = arg_1
	}

	// If "resrict country" argument is being passed
	// then convert it to an `options` object.
	// `parse('88005553535', 'RU', [options], metadata)`.
	if (typeof arg_2 === 'string')
	{
		options = { country: { restrict: arg_2 } }
		metadata = arg_3
	}
	// No "resrict country" argument is being passed.
	// International phone number is passed.
	// `parse('+78005553535', [options], metadata)`.
	else
	{
		if (arg_3)
		{
			options  = arg_2
			metadata = arg_3
		}
		else
		{
			metadata = arg_2
		}
	}

	// Metadata is required.
	if (!metadata || !metadata.countries)
	{
		throw new Error('Metadata is required')
	}

	// Apply default options.
	if (options)
	{
		options = { ...default_options, ...options }
	}
	else
	{
		options = default_options
	}

	return { text, options, metadata }
}

// Strips any extension (as in, the part of the number dialled after the call is
// connected, usually indicated with extn, ext, x or similar) from the end of
// the number, and returns it.
function strip_extension(number)
{
	const start = number.search(EXTN_PATTERN)
	if (start < 0)
	{
		return {}
	}

	// If we find a potential extension, and the number preceding this is a viable
	// number, we assume it is an extension.
	const number_without_extension = number.slice(0, start)
	/* istanbul ignore if - seems a bit of a redundant check */
	if (!is_viable_phone_number(number_without_extension))
	{
		return {}
	}

	const matches = number.match(EXTN_PATTERN)
	let i = 1
	while (i < matches.length)
	{
		if (matches[i] != null && matches[i].length > 0)
		{
			return {
				number    : number_without_extension,
				extension : matches[i]
			}
		}
		i++
	}
}
