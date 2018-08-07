// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import
{
	extractCountryCallingCode,
	VALID_DIGITS,
	VALID_PUNCTUATION,
	PLUS_CHARS,
	MAX_LENGTH_FOR_NSN,
	matches_entirely,
	create_extension_pattern
}
from './common'

import parseIncompletePhoneNumber from './parseIncompletePhoneNumber'

import Metadata from './metadata'

import getCountryCallingCode from './getCountryCallingCode'

import get_number_type, { check_number_length_for_type } from './getNumberType'

import { parseRFC3966 } from './RFC3966'

// The minimum length of the national significant number.
const MIN_LENGTH_FOR_NSN = 2

// We don't allow input strings for parsing to be longer than 250 chars.
// This prevents malicious input from consuming CPU.
const MAX_INPUT_STRING_LENGTH = 250

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
const EXTN_PATTERNS_FOR_PARSING = create_extension_pattern('parsing')

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
	if (options.defaultCountry && !metadata.hasCountry(options.defaultCountry))
	{
		throw new Error(`Unknown country: ${options.defaultCountry}`)
	}

	// Parse the phone number.
	const { number: formatted_phone_number, ext } = parse_input(text)

	// If the phone number is not viable then return nothing.
	if (!formatted_phone_number)
	{
		return {}
	}

	const
	{
		country,
		national_number,
		countryCallingCode,
		carrierCode
	}
	= parse_phone_number
	(
		formatted_phone_number,
		options.defaultCountry,
		metadata
	)

	if (!metadata.selectedCountry())
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
		// Google's demo just throws an error in this case.
		return {}
	}

	// Check if national phone number pattern matches the number
	// National number pattern is different for each country,
	// even for those ones which are part of the "NANPA" group.
	const valid = country && matches_entirely(national_number, metadata.nationalNumberPattern()) ? true : false

	if (!options.extended)
	{
		return valid ? result(country, national_number, ext) : {}
	}

	return {
		country,
		countryCallingCode,
		carrierCode,
		valid,
		possible : valid ? true : (options.extended === true) && metadata.possibleLengths() && is_possible_number(national_number, countryCallingCode !== undefined, metadata),
		phone    : national_number,
		ext
	}
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
		VALID_PHONE_NUMBER_PATTERN.test(number)
}

/**
 * Extracts a parseable phone number.
 * @param  {string} text - Input.
 * @return {string}.
 */
export function extract_formatted_phone_number(text)
{
	if (!text || text.length > MAX_INPUT_STRING_LENGTH)
	{
		return
	}

	// Attempt to extract a possible number from the string passed in

	const starts_at = text.search(PHONE_NUMBER_START_PATTERN)

	if (starts_at < 0)
	{
		return
	}

	return text
		// Trim everything to the left of the phone number
		.slice(starts_at)
		// Remove trailing non-numerical characters
		.replace(AFTER_PHONE_NUMBER_END_PATTERN, '')
}

// Strips any national prefix (such as 0, 1) present in the number provided.
// "Carrier codes" are only used  in Colombia and Brazil,
// and only when dialing within those countries from a mobile phone to a fixed line number.
export function strip_national_prefix_and_carrier_code(number, metadata)
{
	if (!number || !metadata.nationalPrefixForParsing())
	{
		return { number }
	}

	// Attempt to parse the first digits as a national prefix
	const national_prefix_pattern = new RegExp('^(?:' + metadata.nationalPrefixForParsing() + ')')
	const national_prefix_matcher = national_prefix_pattern.exec(number)

	// If no national prefix is present in the phone number,
	// but the national prefix is optional for this country,
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
		return { number }
	}

	let national_significant_number

	// `national_prefix_for_parsing` capturing groups
	// (used only for really messy cases: Argentina, Brazil, Mexico, Somalia)
	const captured_groups_count = national_prefix_matcher.length - 1

	// If the national number tranformation is needed then do it.
	//
	// I don't know what did they mean by `&& national_prefix_matcher[captured_groups_count]`.
	// https://github.com/googlei18n/libphonenumber/blob/d978e59c2e6b1ddfb6816cd190e1b62d9a96bc3b/javascript/i18n/phonenumbers/phonenumberutil.js#L3885
	// https://github.com/googlei18n/libphonenumber/blob/d978e59c2e6b1ddfb6816cd190e1b62d9a96bc3b/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberUtil.java#L2906
	//
	if (metadata.nationalPrefixTransformRule() && national_prefix_matcher[captured_groups_count])
	{
		national_significant_number = number.replace(national_prefix_pattern, metadata.nationalPrefixTransformRule())
	}
	// Else, no transformation is necessary,
	// and just strip the national prefix.
	else
	{
		national_significant_number = number.slice(national_prefix_matcher[0].length)
	}

	let carrierCode
	if (captured_groups_count > 0)
	{
		carrierCode = national_prefix_matcher[1]
	}

	// The following is done in `get_country_and_national_number_for_local_number()` instead.
	//
	// // Verify the parsed national (significant) number for this country
	// const national_number_rule = new RegExp(metadata.nationalNumberPattern())
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
   return {
   	number: national_significant_number,
   	carrierCode
   }
}

export function find_country_code(country_calling_code, national_phone_number, metadata)
{
	// Is always non-empty, because `country_calling_code` is always valid
	const possible_countries = metadata.countryCallingCodes()[country_calling_code]

	// If there's just one country corresponding to the country code,
	// then just return it, without further phone number digits validation.
	if (possible_countries.length === 1)
	{
		return possible_countries[0]
	}

	return _find_country_code(possible_countries, national_phone_number, metadata.metadata)
}

// Changes `metadata` `country`.
function _find_country_code(possible_countries, national_phone_number, metadata)
{
	metadata = new Metadata(metadata)

	for (const country of possible_countries)
	{
		metadata.country(country)

		// Leading digits check would be the simplest one
		if (metadata.leadingDigits())
		{
			if (national_phone_number &&
				national_phone_number.search(metadata.leadingDigits()) === 0)
			{
				return country
			}
		}
		// Else perform full validation with all of those
		// fixed-line/mobile/etc regular expressions.
		else if (get_number_type({ phone: national_phone_number, country }, metadata.metadata))
		{
			return country
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
	// No "default country" argument is being passed.
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

	// Apply default options.
	if (options)
	{
		options = { ...default_options, ...options }
	}
	else
	{
		options = default_options
	}

	return { text, options, metadata: new Metadata(metadata) }
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
				number : number_without_extension,
				ext    : matches[i]
			}
		}
		i++
	}
}

function is_possible_number(national_number, is_international, metadata)
{
	switch (check_number_length_for_type(national_number, undefined, metadata))
	{
		case 'IS_POSSIBLE':
			return true
		// case 'IS_POSSIBLE_LOCAL_ONLY':
		// 	return !is_international
		default:
			return false
	}
}

/**
 * @param  {string} text - Input.
 * @return {object} `{ ?number, ?ext }`.
 */
function parse_input(text)
{
	// Parse RFC 3966 phone number URI.
	if (text && text.indexOf('tel:') === 0)
	{
		return parseRFC3966(text)
	}

	let number = extract_formatted_phone_number(text)

	// If the phone number is not viable, then abort.
	if (!number || !is_viable_phone_number(number))
	{
		return {}
	}

	// Attempt to parse extension first, since it doesn't require region-specific
	// data and we want to have the non-normalised number here.
	const with_extension_stripped = strip_extension(number)
	if (with_extension_stripped.ext)
	{
		return with_extension_stripped
	}

	return { number }
}

/**
 * Creates `parse()` result object.
 */
function result(country, national_number, ext)
{
	const result =
	{
		country,
		phone : national_number
	}

	if (ext)
	{
		result.ext = ext
	}

	return result
}

/**
 * Parses a viable phone number.
 * Returns `{ country, countryCallingCode, national_number }`.
 */
function parse_phone_number(formatted_phone_number, default_country, metadata)
{
	let { countryCallingCode, number } = extractCountryCallingCode(formatted_phone_number, default_country, metadata)

	if (!number) {
		return { countryCallingCode }
	}

	let country

	if (countryCallingCode)
	{
		metadata.chooseCountryByCountryCallingCode(countryCallingCode)
	}
	else if (default_country)
	{
		metadata.country(default_country)
		country = default_country
		countryCallingCode = getCountryCallingCode(default_country, metadata.metadata)
	}
	else return {}

	const { national_number, carrier_code } = parse_national_number(number, metadata)

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
	const exactCountry = find_country_code(countryCallingCode, national_number, metadata)
	if (exactCountry)
	{
		country = exactCountry
		metadata.country(country)
	}

	return {
		country,
		countryCallingCode,
		national_number,
		carrierCode: carrier_code
	}
}

function parse_national_number(number, metadata)
{
	let national_number = parseIncompletePhoneNumber(number)
	let carrier_code

	// Only strip national prefixes for non-international phone numbers
	// because national prefixes can't be present in international phone numbers.
	// Otherwise, while forgiving, it would parse a NANPA number `+1 1877 215 5230`
	// first to `1877 215 5230` and then, stripping the leading `1`, to `877 215 5230`,
	// and then it would assume that's a valid number which it isn't.
	// So no forgiveness for grandmas here.
	// The issue asking for this fix:
	// https://github.com/catamphetamine/libphonenumber-js/issues/159
	const { number: potential_national_number, carrierCode } = strip_national_prefix_and_carrier_code(national_number, metadata)

	// If metadata has "possible lengths" then employ the new algorythm.
	if (metadata.possibleLengths())
	{
		// We require that the NSN remaining after stripping the national prefix and
		// carrier code be long enough to be a possible length for the region.
		// Otherwise, we don't do the stripping, since the original number could be
		// a valid short number.
		switch (check_number_length_for_type(potential_national_number, undefined, metadata))
		{
			case 'TOO_SHORT':
			// case 'IS_POSSIBLE_LOCAL_ONLY':
			case 'INVALID_LENGTH':
				break
			default:
				national_number = potential_national_number
				carrier_code = carrierCode
		}
	}
	else
	{
		// If the original number (before stripping national prefix) was viable,
		// and the resultant number is not, then prefer the original phone number.
		// This is because for some countries (e.g. Russia) the same digit could be both
		// a national prefix and a leading digit of a valid national phone number,
		// like `8` is the national prefix for Russia and both
		// `8 800 555 35 35` and `800 555 35 35` are valid numbers.
		if (matches_entirely(national_number, metadata.nationalNumberPattern()) &&
				!matches_entirely(potential_national_number, metadata.nationalNumberPattern()))
		{
			// Keep the number without stripping national prefix.
		}
		else
		{
			national_number = potential_national_number
			carrier_code = carrierCode
		}
	}

	return {
		national_number,
		carrier_code
	}
}

// Determines the country for a given (possibly incomplete) phone number.
// export function get_country_from_phone_number(number, metadata)
// {
// 	return parse_phone_number(number, null, metadata).country
// }