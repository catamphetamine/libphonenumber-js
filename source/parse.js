// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import
{
	parse_phone_number_digits,
	parse_national_number_and_country_calling_code,
	VALID_PUNCTUATION,
	PLUS_CHARS,
	matches_entirely
}
from './common'

import
{
	get_country_calling_code,
	get_national_number_pattern,
	get_national_prefix_for_parsing,
	get_national_prefix_transform_rule,
	get_leading_digits,
	get_metadata_by_country_calling_code,
	get_formats
}
from './metadata'

import get_number_type, { check_number_length_for_type } from './types'

// The minimum length of the national significant number.
const MIN_LENGTH_FOR_NSN = 2

// The ITU says the maximum length should be 15,
// but one can find longer numbers in Germany.
const MAX_LENGTH_FOR_NSN = 17

// We don't allow input strings for parsing to be longer than 250 chars.
// This prevents malicious input from consuming CPU.
const MAX_INPUT_STRING_LENGTH = 250

// Digits accepted in phone numbers
// (ascii, fullwidth, arabic-indic, and eastern arabic digits).
export const VALID_DIGITS = '0-9\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9'

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
export default function parse(arg_1, arg_2, arg_3, arg_4)
{
	const { text, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)

	// Validate `defaultCountry`.
	if (options.defaultCountry && !metadata.countries[options.defaultCountry])
	{
		throw new Error(`Unknown country code: ${options.defaultCountry}`)
	}

	// Parse the phone number.
	const { number: formatted_phone_number, extension } = parse_input(text)

	// If the phone number is not viable, then abort.
	if (!formatted_phone_number)
	{
		return {}
	}

	const { country_calling_code, number } = parse_national_number_and_country_calling_code(formatted_phone_number, metadata)

	// Maybe invalid country phone code encountered
	if (!number)
	{
		return {}
	}

	const
	{
		country,
		country_metadata,
		national_number
	}
	= get_country_and_national_number
	(
		formatted_phone_number,
		country_calling_code,
		number,
		options.defaultCountry,
		metadata
	)

	if (!country_metadata)
	{
		return {}
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
	if (national_number.length < MIN_LENGTH_FOR_NSN ||
		national_number.length > MAX_LENGTH_FOR_NSN)
	{
		return {}
	}

	const result =
	{
		country,
		phone: national_number
	}

	// Check if national phone number pattern matches the number
	// National number pattern is different for each country,
	// even for those ones which are part of the "NANPA" group.
	if (!country || country && !matches_entirely(national_number, new RegExp(get_national_number_pattern(country_metadata))))
	{
		if (options.possible && is_possible_number(national_number, country_calling_code !== undefined, country_metadata))
		{
			// Is a possible number
			result.possible = true

			if (!country)
			{
				result.countryCallingCode = country_calling_code
			}
		}
		else
		{
			return {}
		}
	}

	if (extension)
	{
		result.ext = extension
	}

	return result
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

	// // Verify the parsed national (significant) number for this country
	// const national_number_rule = new RegExp(get_national_number_pattern(country_metadata))
	// //
	// // If the original number (before stripping national prefix) was viable,
	// // and the resultant number is not, then prefer the original phone number.
	// // This is because for some countries (e.g. Russia) the same digit could be both
	// // a national prefix and a leading digit of a valid national phone number,
	// // like `8` is the national prefix for Russia and both
	// // `8 800 555 35 35` and `800 555 35 35` are valid numbers.
	// if (matches_entirely(number, national_number_rule) &&
	// 		!matches_entirely(national_significant_number, national_number_rule))
	// {
	// 	return number
	// }

	// Return the parsed national (significant) number
   return national_significant_number
}

export function find_country_code(country_calling_code, national_phone_number, metadata)
{
	// Is always non-empty, because `country_calling_code` is always valid
	const possible_countries = metadata.country_phone_code_to_countries[country_calling_code]

	// If there's just one country corresponding to the country code,
	// then just return it, without further phone number digits validation.
	if (possible_countries.length === 1)
	{
		return possible_countries[0]
	}

	for (const country_code of possible_countries)
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

// Sort out arguments
function sort_out_arguments(arg_1, arg_2, arg_3, arg_4)
{
	let text
	let options
	let metadata

	// If the phone number is passed as a string.
	// `parse('88005553535', ...)`.
	if (typeof arg_1 === 'string')
	{
		text = arg_1
	}
	else throw new TypeError('A phone number for parsing must be a string.')

	// If "default country" argument is being passed
	// then move it to `options`.
	// `parse('88005553535', 'RU', [options], metadata)`.
	if (typeof arg_2 === 'string')
	{
		if (arg_4)
		{
			options = { defaultCountry: arg_2, ...arg_3 }
			metadata = arg_4
		}
		else
		{
			options = { defaultCountry: arg_2 }
			metadata = arg_3
		}
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

function is_possible_number(national_number, is_international, country_metadata)
{
	switch (check_number_length_for_type(national_number, undefined, country_metadata))
	{
		case 'IS_POSSIBLE':
			return true
		// case 'IS_POSSIBLE_LOCAL_ONLY':
		// 	return !is_international
		default:
			return false
	}
}

function get_country_and_national_number(formatted_phone_number, country_calling_code, number, default_country, metadata)
{
	if (country_calling_code)
	{
		const national_number = number

		// Sometimes there are several countries
		// corresponding to the same country phone code
		// (e.g. NANPA countries all having `1` country phone code).
		// Therefore, to reliably determine the exact country,
		// national (significant) number should have been parsed first.
		//
		// When `metadata.json` is generated, all "ambiguous" country phone codes
		// get their countries populated with the full set of
		// "phone number type" regular expressions.
		//
		const country = find_country_code(country_calling_code, national_number, metadata)

		// Formatting information for regions which share
		// a country calling code is contained by only one region
		// for performance reasons. For example, for NANPA region
		// ("North American Numbering Plan Administration",
		//  which includes USA, Canada, Cayman Islands, Bahamas, etc)
		// it will be contained in the metadata for `US`.
		const country_metadata = country ? metadata.countries[country] : get_metadata_by_country_calling_code(country_calling_code, metadata)

		return { national_number, country, country_metadata }
	}

	if (default_country)
	{
		const country = default_country
		const country_metadata = metadata.countries[country]

		let national_number = parse_phone_number_digits(formatted_phone_number)

		// Only strip national prefixes for non-international phone numbers
		// because national prefixes can't be present in international phone numbers.
		// Otherwise, while forgiving, it would parse a NANPA number `+1 1877 215 5230`
		// first to `1877 215 5230` and then, stripping the leading `1`, to `877 215 5230`,
		// and then it would assume that's a valid number which it isn't.
		// So no forgiveness for grandmas here.
		// The issue asking for this fix:
		// https://github.com/catamphetamine/libphonenumber-js/issues/159
		const potential_national_number = strip_national_prefix(national_number, country_metadata)

		// We require that the NSN remaining after stripping the national prefix and
		// carrier code be long enough to be a possible length for the region.
		// Otherwise, we don't do the stripping, since the original number could be
		// a valid short number.
		switch (check_number_length_for_type(potential_national_number, undefined, country_metadata))
		{
			case 'TOO_SHORT':
			// case 'IS_POSSIBLE_LOCAL_ONLY':
			case 'INVALID_LENGTH':
				break
			default:
				national_number = potential_national_number
		}

		return { national_number, country, country_metadata }
	}

	return {}
}

/**
 * @param  {string} text - Input.
 * @return {object} `{ ?number, ?extension }`.
 */
function parse_input(text)
{
	// Parse RFC 3966 phone number URI.
	if (text && text.indexOf('tel:') === 0)
	{
		let number
		let extension

		for (const part of text.split(';'))
		{
			const [name, value] = part.split(':')
			switch (name)
			{
				case 'tel':
					number = value
					break
				case 'ext':
					extension = value
					break
				case 'phone-context':
					// Domain contexts are ignored.
					if (value[0] === '+')
					{
						number = value + number
					}
					break
			}
		}

		// If the phone number is not viable, then abort.
		if (!is_viable_phone_number(number))
		{
			return {}
		}

		return {
			number,
			extension
		}
	}

	let number = extract_formatted_phone_number(text)
	let extension

	// If the phone number is not viable, then abort.
	if (!is_viable_phone_number(number))
	{
		return {}
	}

	// Attempt to parse extension first, since it doesn't require region-specific
	// data and we want to have the non-normalised number here.
	const with_extension_stripped = strip_extension(number)
	if (with_extension_stripped.extension)
	{
		return with_extension_stripped
	}

	return {
		number,
		extension
	}
}