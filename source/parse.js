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
	get_type_fixed_line,
	get_type_mobile,
	get_type_toll_free,
	get_type_premium_rate,
	get_type_personal_number,
	get_type_voice_mail,
	get_type_uan,
	get_type_pager,
	get_type_voip,
	get_type_shared_cost,
	get_format_national_prefix_is_mandatory_when_formatting
}
from './metadata'

import
{
	choose_format_for_number
}
from './format'

export const PLUS_CHARS = '+\uFF0B'

// Digits accepted in phone numbers
// (ascii, fullwidth, arabic-indic, and eastern arabic digits).
export const VALID_DIGITS = '0-9\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9'

// Regular expression of acceptable punctuation found in phone numbers. This
// excludes punctuation found as a leading character only. This consists of dash
// characters, white space characters, full stops, slashes, square brackets,
// parentheses and tildes. It also includes the letter 'x' as that is found as a
// placeholder for carrier information in some phone numbers. Full-width
// variants are also present.
export const VALID_PUNCTUATION =
	'-x\u2010-\u2015\u2212\u30FC\uFF0D-\uFF0F \u00A0\u00AD\u200B\u2060\u3000' +
	'()\uFF08\uFF09\uFF3B\uFF3D.\\[\\]/~\u2053\u223C\uFF5E'

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
//  Note VALID_PUNCTUATION starts with a -, so must be the first in the range.
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
		// screw phone number extensions
		// '(?:' + EXTN_PATTERNS_FOR_PARSING + ')?' +
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
const DIGIT_MAPPINGS =
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
export default function parse(text, options)
{
	if (typeof options === 'string')
	{
		const restrict_to_country = options

		options =
		{
			...default_options,

			country:
			{
				restrict: restrict_to_country
			}
		}
	}

	if (!options)
	{
		options = { ...default_options }
	}

	// Validate country codes

	if (!this.metadata.countries[options.country.default])
	{
		options = { ...options }
		delete options.country.default
	}

	if (!this.metadata.countries[options.country.restrict])
	{
		options = { ...options }
		delete options.country.restrict
	}

	// Parse the phone number

	const formatted_phone_number = extract_formatted_phone_number(text)

	// If the phone number is not viable, then abort.
	if (!is_viable_phone_number(formatted_phone_number))
	{
		return {}
	}

	let { country_phone_code, number } = parse_phone_number_and_country_phone_code(formatted_phone_number, this.metadata)

	// Maybe invalid country phone code encountered
	if (!country_phone_code && !number)
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
			country_phone_code !== get_phone_code(this.metadata.countries[options.country.restrict]))
		{
			return {}
		}

		country_metadata = get_metadata_by_country_phone_code(country_phone_code, this.metadata)

		// `country` will be set later,
		// because, for example, for NANPA countries
		// there are several countries corresponding
		// to the same `1` country phone code.
		// Therefore, to reliably determine the exact country,
		// national (significant) number should be parsed first.
	}
	else if (options.country.default || options.country.restrict)
	{
		country = options.country.default || options.country.restrict
		country_metadata = this.metadata.countries[country]

		number = normalize(text)
	}

	if (!country_metadata)
	{
		return {}
	}

	const national_number = strip_national_prefix(number, country_metadata)

	const did_have_national_prefix = national_number !== number

	if (!is_international && !did_have_national_prefix &&
			is_national_prefix_required(national_number, country_metadata))
	{
		return {}
	}

	// Sometimes there are several countries
	// corresponding to the same country phone code
	// (e.g. NANPA countries all having `1` country phone code).
	// Therefore, to reliably determine the exact country,
	// national (significant) number should have been parsed first.
	//
	if (!country)
	{
		country = find_country_code(country_phone_code, national_number, this.metadata)

		// Just in case there's a bug in Google's metadata
		/* istanbul ignore if */
		if (!country)
		{
			return {}
		}
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

	const national_number_rule = new RegExp(get_national_number_pattern(country_metadata))

	if (!matches_entirely(national_number, national_number_rule))
	{
		return {}
	}

	return { country, phone: national_number }
}

// Normalizes a string of characters representing a phone number.
// This converts wide-ascii and arabic-indic numerals to European numerals,
// and strips punctuation and alpha characters.
export function normalize(number)
{
	return replace_characters(number, DIGIT_MAPPINGS)
}

// For any character not being part of `replacements`
// it is removed from the phone number.
export function replace_characters(text, replacements)
{
	let replaced = ''

	for (let character of text)
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

	const national_prefix_transform_rule = get_national_prefix_transform_rule(country_metadata)

	let national_significant_number

	// `national_prefix_for_parsing` capturing groups
	// (used only for really messy cases: Argentina, Brazil, Mexico, Somalia)
	const any_groups_were_captured = national_prefix_matcher[national_prefix_matcher.length - 1]

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

	// If the original number was viable, and the resultant number is not,
	// then prefer the original phone number.
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
		else if (get_number_type(national_phone_number, country))
		{
			return country_code
		}
	}
}

// Finds out national phone number type (fixed line, mobile, etc)
export function get_number_type(national_number, country_metadata)
{
	// Is this national number even valid for this country
	if (!is_of_type(national_number, get_national_number_pattern(country_metadata)))
	{
		return
	}

	if (is_of_type(national_number, get_type_mobile(country_metadata)))
	{
		// Because duplicate regular expressions are removed
		// to reduce metadata size, if there's no "fixed line" pattern
		// then it means it was removed due to being a duplicate of some other pattern.
		//
		// (no such country in the metadata, therefore no unit test for this `if`)
		/* istanbul ignore if */
		if (!get_type_fixed_line(country_metadata))
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		return 'MOBILE'
	}

	// Is it fixed line number
	if (is_of_type(national_number, get_type_fixed_line(country_metadata)))
	{
		// Because duplicate regular expressions are removed
		// to reduce metadata size, if there's no "mobile" pattern
		// then it means it was removed due to being a duplicate of some other pattern.
		if (!get_type_mobile(country_metadata))
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		return 'FIXED_LINE'
	}

	if (is_of_type(national_number, get_type_toll_free(country_metadata)))
	{
		return 'TOLL_FREE'
	}

	if (is_of_type(national_number, get_type_premium_rate(country_metadata)))
	{
		return 'PREMIUM_RATE'
	}

	if (is_of_type(national_number, get_type_personal_number(country_metadata)))
	{
		return 'PERSONAL_NUMBER'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_voice_mail(country_metadata)))
	{
		return 'VOICEMAIL'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_uan(country_metadata)))
	{
		return 'UAN'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_pager(country_metadata)))
	{
		return 'PAGER'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_voip(country_metadata)))
	{
		return 'VOIP'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_shared_cost(country_metadata)))
	{
		return 'SHARED_COST'
	}
}

export function is_of_type(national_number, type)
{
	// // Check if any possible number lengths are present;
	// // if so, we use them to avoid checking
	// // the validation pattern if they don't match.
	// // If they are absent, this means they match
	// // the general description, which we have
	// // already checked before a specific number type.
	// if (get_possible_lengths(type) &&
	// 	get_possible_lengths(type).indexOf(national_number.length) === -1)
	// {
	// 	return false
	// }

	// get_type_pattern(type) === type
	return matches_entirely(national_number, type)
}

export function is_national_prefix_required(national_number, country_metadata)
{
	const format = choose_format_for_number(get_formats(country_metadata), national_number)

	if (format)
	{
		return get_format_national_prefix_is_mandatory_when_formatting(format, country_metadata)
	}
}