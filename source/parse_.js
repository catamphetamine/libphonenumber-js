// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of December 31th, 2018.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import {
	VALID_DIGITS,
	VALID_PUNCTUATION,
	PLUS_CHARS,
	MIN_LENGTH_FOR_NSN,
	MAX_LENGTH_FOR_NSN,
	MAX_LENGTH_COUNTRY_CODE
} from './constants'

import { matchesEntirely } from './util'
import ParseError from './ParseError'
import Metadata from './metadata'
import isViablePhoneNumber from './isViablePhoneNumber'
import { extractExtension } from './extension'
import parseIncompletePhoneNumber from './parseIncompletePhoneNumber'
import getCountryCallingCode from './getCountryCallingCode'
import getNumberType, { checkNumberLengthForType } from './getNumberType_'
import { is_possible_number } from './isPossibleNumber_'
import { stripIDDPrefix } from './IDD'
import { parseRFC3966 } from './RFC3966'
import PhoneNumber from './PhoneNumber'

// We don't allow input strings for parsing to be longer than 250 chars.
// This prevents malicious input from consuming CPU.
const MAX_INPUT_STRING_LENGTH = 250

// This consists of the plus symbol, digits, and arabic-indic digits.
const PHONE_NUMBER_START_PATTERN = new RegExp('[' + PLUS_CHARS + VALID_DIGITS + ']')

// Regular expression of trailing characters that we want to remove.
const AFTER_PHONE_NUMBER_END_PATTERN = new RegExp('[^' + VALID_DIGITS + ']+$')

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
export default function parse(text, options = {}, metadata)
{
	metadata = new Metadata(metadata)

	// Validate `defaultCountry`.
	if (options.defaultCountry && !metadata.hasCountry(options.defaultCountry))
	{
		if (options.v2) {
			throw new ParseError('INVALID_COUNTRY')
		}
		throw new Error(`Unknown country: ${options.defaultCountry}`)
	}

	// Parse the phone number.
	const { number: formatted_phone_number, ext } = parse_input(text, options.v2)

	// If the phone number is not viable then return nothing.
	if (!formatted_phone_number)
	{
		if (options.v2) {
			throw new ParseError('NOT_A_NUMBER')
		}
		return {}
	}

	const
	{
		country,
		national_number : nationalNumber,
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
		if (options.v2) {
			throw new ParseError('INVALID_COUNTRY')
		}
		return {}
	}

	// Validate national (significant) number length.
	if (nationalNumber.length < MIN_LENGTH_FOR_NSN) {
		// Won't throw here because the regexp already demands length > 1.
		/* istanbul ignore if */
		if (options.v2) {
			throw new ParseError('TOO_SHORT')
		}
		// Google's demo just throws an error in this case.
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
	if (nationalNumber.length > MAX_LENGTH_FOR_NSN) {
		if (options.v2) {
			throw new ParseError('TOO_LONG')
		}
		// Google's demo just throws an error in this case.
		return {}
	}

	if (options.v2)
	{
		const phoneNumber = new PhoneNumber(
			countryCallingCode,
			nationalNumber,
			metadata.metadata
		)

		if (country) {
			phoneNumber.country = country
		}
		if (carrierCode) {
			phoneNumber.carrierCode = carrierCode
		}
		if (ext) {
			phoneNumber.ext = ext
		}

		return phoneNumber
	}

	// Check if national phone number pattern matches the number.
	// National number pattern is different for each country,
	// even for those ones which are part of the "NANPA" group.
	const valid = country && matchesEntirely(nationalNumber, metadata.nationalNumberPattern()) ? true : false

	if (!options.extended)
	{
		return valid ? result(country, nationalNumber, ext) : {}
	}

	return {
		country,
		countryCallingCode,
		carrierCode,
		valid,
		possible : valid ? true : (options.extended === true) && metadata.possibleLengths() && is_possible_number(nationalNumber, countryCallingCode !== undefined, metadata),
		phone : nationalNumber,
		ext
	}
}

/**
 * Extracts a parseable phone number.
 * @param  {string} text - Input.
 * @return {string}.
 */
export function extract_formatted_phone_number(text, v2)
{
	if (!text)
	{
		return
	}

	if (text.length > MAX_INPUT_STRING_LENGTH)
	{
		if (v2) {
			throw new ParseError('TOO_LONG')
		}
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

	// In many countries the national prefix
	// is not just a constant digit (like `0` in UK)
	// but can be different depending on the phone number
	// (and can be also absent for some phone numbers).
	//
	// So `national_prefix_for_parsing` is used when parsing
	// a national-prefixed (local) phone number
	// into a national significant phone number
	// extracting that possible national prefix out of it.
	//
	// Example `national_prefix_for_parsing` for Australia (AU) is `0|(183[12])`.
	// Which means that in Australia the national prefix can be: `0`, `1831`, `1832`.

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

	// In more complex cases just `national_prefix_for_parsing` regexp
	// is not enough to extract the national number and then strip it
	// like `number.slice(national_prefix.length)` because when parsing
	// national numbers it's not always clear whether the first digits
	// are a national prefix or part of the national significant number.
	// For such cases `national_prefix_transform_rule` regexp is present
	// which contains "capturing groups" that are later used in such
	// `national_prefix_transform_rule` to transform the national number
	// being parsed into the national significant number.
	//
	// Example.
	// Country: U.S. Virgin Islands (VI).
	// Country calling code: +1.
	// Leading digits: 340.
	// Phone number format: +1 (340) xxx-xxxx.
	// National prefix: 1.
	// National prefix for parsing: 1|([2-9]\d{6})$.
	// National prefix transform rule: 340$1.
	//
	// So for input "13401234567" "national prefix for parsing" regexp
	// will return "1" and the national significant number will be
	// "13401234567".slice("1".length) === "(340) 123-4567".
	//
	// And for input "3401234567" "national prefix for parsing" regexp
	// the "captured group" will be "3401234567" and the national significant
	// number will be "3401234567".replace("340123", "340340123") === "(340) 3401234567".
	//
	// `national_prefix_matcher[captured_groups_count]` means that
	// the corresponding "captured group" is not empty.
	// It can be empty if the regexp either doesn't have any "capturing groups"
	// or if the "capturing groups" are defined as optional.
	// Example: "0?(?:...)?" for Argentina.
	//
	const captured_groups_count = national_prefix_matcher.length - 1
	if (metadata.nationalPrefixTransformRule() && national_prefix_matcher[captured_groups_count])
	{
		national_significant_number = number.replace(national_prefix_pattern, metadata.nationalPrefixTransformRule())
	}
	// If it's a simple-enough case then just strip the national prefix from the number.
	else
	{
		// National prefix is the whole substring matched by
		// the `national_prefix_for_parsing` regexp.
		const national_prefix = national_prefix_matcher[0]
		national_significant_number = number.slice(national_prefix.length)
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
	// if (matchesEntirely(number, national_number_rule) &&
	// 		!matchesEntirely(national_significant_number, national_number_rule))
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
		else if (getNumberType({ phone: national_phone_number, country }, undefined, metadata.metadata))
		{
			return country
		}
	}
}

/**
 * @param  {string} text - Input.
 * @return {object} `{ ?number, ?ext }`.
 */
function parse_input(text, v2)
{
	// Parse RFC 3966 phone number URI.
	if (text && text.indexOf('tel:') === 0)
	{
		return parseRFC3966(text)
	}

	let number = extract_formatted_phone_number(text, v2)

	// If the phone number is not viable, then abort.
	if (!number || !isViablePhoneNumber(number))
	{
		return {}
	}

	// Attempt to parse extension first, since it doesn't require region-specific
	// data and we want to have the non-normalised number here.
	const with_extension_stripped = extractExtension(number)
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
	let { countryCallingCode, number } = extractCountryCallingCode(formatted_phone_number, default_country, metadata.metadata)

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

	// Parsing national prefixes and carrier codes
	// is only required for local phone numbers
	// but some people don't understand that
	// and sometimes write international phone numbers
	// with national prefixes (or maybe even carrier codes).
	// http://ucken.blogspot.ru/2016/03/trunk-prefixes-in-skype4b.html
	// Google's original library forgives such mistakes
	// and so does this library, because it has been requested:
	// https://github.com/catamphetamine/libphonenumber-js/issues/127
	const { number: potential_national_number, carrierCode } = strip_national_prefix_and_carrier_code(national_number, metadata)

	// If metadata has "possible lengths" then employ the new algorythm.
	if (metadata.possibleLengths())
	{
		// We require that the NSN remaining after stripping the national prefix and
		// carrier code be long enough to be a possible length for the region.
		// Otherwise, we don't do the stripping, since the original number could be
		// a valid short number.
		switch (checkNumberLengthForType(potential_national_number, undefined, metadata))
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
		if (matchesEntirely(national_number, metadata.nationalNumberPattern()) &&
				!matchesEntirely(potential_national_number, metadata.nationalNumberPattern()))
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

// Parses a formatted phone number
// and returns `{ countryCallingCode, number }`
// where `number` is just the "number" part
// which is left after extracting `countryCallingCode`
// and is not necessarily a "national (significant) number"
// and might as well contain national prefix.
//
export function extractCountryCallingCode(number, country, metadata)
{
	number = parseIncompletePhoneNumber(number)

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
		const numberWithoutIDD = stripIDDPrefix(number, country, metadata)

		// If an IDD prefix was stripped then
		// convert the number to international one
		// for subsequent parsing.
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

	metadata = new Metadata(metadata)

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
