// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of December 31th, 2018.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import {
	VALID_DIGITS,
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
import { isPossibleNumber } from './isPossibleNumber_'
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

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

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
export default function parse(text, options, metadata) {
	// If assigning the `{}` default value is moved to the arguments above,
	// code coverage would decrease for some weird reason.
	options = options || {}

	metadata = new Metadata(metadata)

	// Validate `defaultCountry`.
	if (options.defaultCountry && !metadata.hasCountry(options.defaultCountry)) {
		if (options.v2) {
			throw new ParseError('INVALID_COUNTRY')
		}
		throw new Error(`Unknown country: ${options.defaultCountry}`)
	}

	// Parse the phone number.
	const { number: formattedPhoneNumber, ext } = parseInput(text, options.v2)

	// If the phone number is not viable then return nothing.
	if (!formattedPhoneNumber) {
		if (options.v2) {
			throw new ParseError('NOT_A_NUMBER')
		}
		return {}
	}

	const {
		country,
		nationalNumber,
		countryCallingCode,
		carrierCode
	} = parsePhoneNumber(
		formattedPhoneNumber,
		options.defaultCountry,
		options.defaultCallingCode,
		metadata
	)

	if (!metadata.hasSelectedNumberingPlan()) {
		if (options.v2) {
			throw new ParseError('INVALID_COUNTRY')
		}
		return {}
	}

	// Validate national (significant) number length.
	if (!nationalNumber || nationalNumber.length < MIN_LENGTH_FOR_NSN) {
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

	if (options.v2) {
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
	const valid = (options.extended ? metadata.hasSelectedNumberingPlan() : country) ?
		matchesEntirely(nationalNumber, metadata.nationalNumberPattern()) :
		false

	if (!options.extended) {
		return valid ? result(country, nationalNumber, ext) : {}
	}

	return {
		country,
		countryCallingCode,
		carrierCode,
		valid,
		possible: valid ? true : (
			options.extended === true &&
			metadata.possibleLengths() &&
			isPossibleNumber(nationalNumber, countryCallingCode !== undefined, metadata) ? true : false
		),
		phone: nationalNumber,
		ext
	}
}

/**
 * Extracts a formatted phone number from text.
 * Doesn't guarantee that the extracted phone number
 * is a valid phone number (for example, doesn't validate its length).
 * @param  {string} text
 * @param  {boolean} throwOnError — By default, it won't throw if the text is too long.
 * @return {string}
 * @example
 * // Returns "(213) 373-4253".
 * extractFormattedPhoneNumber("Call (213) 373-4253 for assistance.")
 */
export function extractFormattedPhoneNumber(text, throwOnError) {
	if (!text) {
		return
	}
	if (text.length > MAX_INPUT_STRING_LENGTH) {
		if (throwOnError) {
			throw new ParseError('TOO_LONG')
		}
		return
	}
	// Attempt to extract a possible number from the string passed in
	const startsAt = text.search(PHONE_NUMBER_START_PATTERN)
	if (startsAt < 0) {
		return
	}
	return text
		// Trim everything to the left of the phone number
		.slice(startsAt)
		// Remove trailing non-numerical characters
		.replace(AFTER_PHONE_NUMBER_END_PATTERN, '')
}

/**
 * Strips any national prefix (such as 0, 1) present in a
 * (possibly incomplete) number provided.
 * "Carrier codes" are only used  in Colombia and Brazil,
 * and only when dialing within those countries from a mobile phone to a fixed line number.
 * Sometimes it won't actually strip national prefix
 * and will instead prepend some digits to the `number`:
 * for example, when number `2345678` is passed with `VI` country selected,
 * it will return `{ number: "3402345678" }`, because `340` area code is prepended.
 * @param {string} number — National number digits.
 * @param {object} metadata — Metadata with country selected.
 * @return {object} `{ nationalNumber: string, carrierCode: string? }`.
 */
export function stripNationalPrefixAndCarrierCode(number, metadata) {
	if (number && metadata.nationalPrefixForParsing()) {
		// See METADATA.md for the description of
		// `national_prefix_for_parsing` and `national_prefix_transform_rule`.
		// Attempt to parse the first digits as a national prefix.
		const prefixPattern = new RegExp('^(?:' + metadata.nationalPrefixForParsing() + ')')
		const prefixMatch = prefixPattern.exec(number)
		if (prefixMatch) {
			let nationalNumber
			let carrierCode
			// If a "capturing group" didn't match
			// then its element in `prefixMatch[]` array will be `undefined`.
			const capturedGroupsCount = prefixMatch.length - 1
			if (metadata.nationalPrefixTransformRule() &&
				capturedGroupsCount > 0 && prefixMatch[capturedGroupsCount]) {
				nationalNumber = number.replace(
					prefixPattern,
					metadata.nationalPrefixTransformRule()
				)
				// Carrier code is the last captured group,
				// but only when there's more than one captured group.
				if (capturedGroupsCount > 1 && prefixMatch[capturedGroupsCount]) {
					carrierCode = prefixMatch[1]
				}
			}
			// If it's a simple-enough case then just
			// strip the national prefix from the number.
			else {
				// National prefix is the whole substring matched by
				// the `national_prefix_for_parsing` regexp.
				const nationalPrefix = prefixMatch[0]
				nationalNumber = number.slice(nationalPrefix.length)
				// Carrier code is the last captured group.
				if (capturedGroupsCount > 0) {
					carrierCode = prefixMatch[1]
				}
			}
			// We require that the national (significant) number remaining after
			// stripping the national prefix and carrier code be long enough
			// to be a possible length for the region. Otherwise, we don't do
			// the stripping, since the original number could be a valid number.
			// For example, in some countries (Russia, Belarus) the same digit
			// could be both a national prefix and a leading digit of a valid
			// national phone number, like `8` is the national prefix for Russia
			// and `800 555 35 35` is a valid national (significant) number.
			if (matchesEntirely(number, metadata.nationalNumberPattern()) &&
				!matchesEntirely(nationalNumber, metadata.nationalNumberPattern())) {
				// Don't strip national prefix or carrier code.
			} else {
				return {
					nationalNumber,
					carrierCode
				}
			}
		}
	}
   return {
   	nationalNumber: number
   }
}

export function findCountryCode(callingCode, nationalPhoneNumber, metadata) {
	/* istanbul ignore if */
	if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
		if (metadata.isNonGeographicCallingCode(callingCode)) {
			return '001'
		}
	}
	// Is always non-empty, because `callingCode` is always valid
	const possibleCountries = metadata.getCountryCodesForCallingCode(callingCode)
	if (!possibleCountries) {
		return
	}
	// If there's just one country corresponding to the country code,
	// then just return it, without further phone number digits validation.
	if (possibleCountries.length === 1) {
		return possibleCountries[0]
	}
	return _findCountryCode(possibleCountries, nationalPhoneNumber, metadata.metadata)
}

// Changes `metadata` `country`.
function _findCountryCode(possibleCountries, nationalPhoneNumber, metadata) {
	metadata = new Metadata(metadata)
	for (const country of possibleCountries) {
		metadata.country(country)
		// Leading digits check would be the simplest one
		if (metadata.leadingDigits()) {
			if (nationalPhoneNumber &&
				nationalPhoneNumber.search(metadata.leadingDigits()) === 0) {
				return country
			}
		}
		// Else perform full validation with all of those
		// fixed-line/mobile/etc regular expressions.
		else if (getNumberType({ phone: nationalPhoneNumber, country }, undefined, metadata.metadata)) {
			return country
		}
	}
}

/**
 * @param  {string} text - Input.
 * @return {object} `{ ?number, ?ext }`.
 */
function parseInput(text, v2) {
	// Parse RFC 3966 phone number URI.
	if (text && text.indexOf('tel:') === 0) {
		return parseRFC3966(text)
	}
	let number = extractFormattedPhoneNumber(text, v2)
	// If the phone number is not viable, then abort.
	if (!number || !isViablePhoneNumber(number)) {
		return {}
	}
	// Attempt to parse extension first, since it doesn't require region-specific
	// data and we want to have the non-normalised number here.
	const withExtensionStripped = extractExtension(number)
	if (withExtensionStripped.ext) {
		return withExtensionStripped
	}
	return { number }
}

/**
 * Creates `parse()` result object.
 */
function result(country, nationalNumber, ext) {
	const result = {
		country,
		phone: nationalNumber
	}
	if (ext) {
		result.ext = ext
	}
	return result
}

/**
 * Parses a viable phone number.
 * @param {string} formattedPhoneNumber — Example: "(213) 373-4253".
 * @param {string} [defaultCountry]
 * @param {string} [defaultCallingCode]
 * @param {Metadata} metadata
 * @return {object} Returns `{ country: string?, countryCallingCode: string?, nationalNumber: string? }`.
 */
function parsePhoneNumber(
	formattedPhoneNumber,
	defaultCountry,
	defaultCallingCode,
	metadata
) {
	// Extract calling code from phone number.
	let { countryCallingCode, number } = extractCountryCallingCode(
		parseIncompletePhoneNumber(formattedPhoneNumber),
		defaultCountry,
		defaultCallingCode,
		metadata.metadata
	)

	// Choose a country by `countryCallingCode`.
	let country
	if (countryCallingCode) {
		metadata.chooseCountryByCountryCallingCode(countryCallingCode)
	}
	// If `formattedPhoneNumber` is in "national" format
	// then `number` is defined and `countryCallingCode` isn't.
	else if (number && (defaultCountry || defaultCallingCode)) {
		metadata.selectNumberingPlan(defaultCountry, defaultCallingCode)
		if (defaultCountry) {
			country = defaultCountry
		} else {
			/* istanbul ignore if */
			if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
				if (metadata.isNonGeographicCallingCode(defaultCallingCode)) {
					country = '001'
				}
			}
		}
		countryCallingCode = defaultCallingCode || getCountryCallingCode(defaultCountry, metadata.metadata)
	}
	else return {}

	if (!number) {
		return { countryCallingCode }
	}

	const {
		nationalNumber,
		carrierCode
	} = stripNationalPrefixAndCarrierCodeFromCompleteNumber(
		parseIncompletePhoneNumber(number),
		metadata
	)

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
	const exactCountry = findCountryCode(countryCallingCode, nationalNumber, metadata)
	if (exactCountry) {
		country = exactCountry
		/* istanbul ignore if */
		if (exactCountry === '001') {
			// Can't happen with `USE_NON_GEOGRAPHIC_COUNTRY_CODE` being `false`.
			// If `USE_NON_GEOGRAPHIC_COUNTRY_CODE` is set to `true` for some reason,
			// then remove the "istanbul ignore if".
		} else {
			metadata.country(country)
		}
	}

	return {
		country,
		countryCallingCode,
		nationalNumber,
		carrierCode
	}
}

/**
 * Strips national prefix and carrier code from a complete phone number.
 * The difference from the non-"FromCompleteNumber" function is that
 * it won't extract national prefix if the resultant number is too short
 * to be a complete number for the selected phone numbering plan.
 * @param  {string} number — Complete phone number digits.
 * @param  {Metadata} metadata — Metadata with a phone numbering plan selected.
 * @return {object} `{ nationalNumber: string, carrierCode: string? }`.
 */
export function stripNationalPrefixAndCarrierCodeFromCompleteNumber(number, metadata) {
	// Parsing national prefixes and carrier codes
	// is only required for local phone numbers
	// but some people don't understand that
	// and sometimes write international phone numbers
	// with national prefixes (or maybe even carrier codes).
	// http://ucken.blogspot.ru/2016/03/trunk-prefixes-in-skype4b.html
	// Google's original library forgives such mistakes
	// and so does this library, because it has been requested:
	// https://github.com/catamphetamine/libphonenumber-js/issues/127
	const {
		nationalNumber,
		carrierCode
	} = stripNationalPrefixAndCarrierCode(
		parseIncompletePhoneNumber(number),
		metadata
	)
	// If a national prefix has been extracted, check to see
	// if the resultant number isn't too short.
	if (nationalNumber.length !== number.length + (carrierCode ? carrierCode.length : 0)) {
		// If not using legacy generated metadata (before version `1.0.18`)
		// then it has "possible lengths", so use those to validate the number length.
		if (metadata.possibleLengths()) {
			// "We require that the NSN remaining after stripping the national prefix and
			// carrier code be long enough to be a possible length for the region.
			// Otherwise, we don't do the stripping, since the original number could be
			// a valid short number."
			// https://github.com/google/libphonenumber/blob/876268eb1ad6cdc1b7b5bef17fc5e43052702d57/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberUtil.java#L3236-L3250
			switch (checkNumberLengthForType(nationalNumber, undefined, metadata)) {
				case 'TOO_SHORT':
				case 'INVALID_LENGTH':
				// case 'IS_POSSIBLE_LOCAL_ONLY':
					// Don't strip the national prefix.
					return { nationalNumber: number }
			}
		}
	}
	return { nationalNumber, carrierCode }
}

/**
 * Converts a phone number digits (possibly with a `+`)
 * into a calling code and the rest phone number digits.
 * The "rest phone number digits" could include
 * a national prefix, carrier code, and national
 * (significant) number.
 * @param  {string} number — Phone number digits (possibly with a `+`).
 * @param  {string} [country] — Default country.
 * @param  {string} [callingCode] — Default calling code (some phone numbering plans are non-geographic).
 * @param  {object} metadata
 * @return {object} `{ countryCallingCode: string?, number: string }`
 * @example
 * // Returns `{ countryCallingCode: "1", number: "2133734253" }`.
 * extractCountryCallingCode('2133734253', 'US', null, metadata)
 * extractCountryCallingCode('2133734253', null, '1', metadata)
 * extractCountryCallingCode('+12133734253', null, null, metadata)
 * extractCountryCallingCode('+12133734253', 'RU', null, metadata)
 */
export function extractCountryCallingCode(
	number,
	country,
	callingCode,
	metadata
) {
	if (!number) {
		return {}
	}

	// If this is not an international phone number,
	// then either extract an "IDD" prefix, or extract a
	// country calling code from a number by autocorrecting it
	// by prepending a leading `+` in cases when it starts
	// with the country calling code.
	// https://wikitravel.org/en/International_dialling_prefix
	// https://github.com/catamphetamine/libphonenumber-js/issues/376
	if (number[0] !== '+') {
		// Convert an "out-of-country" dialing phone number
		// to a proper international phone number.
		const numberWithoutIDD = stripIDDPrefix(number, country, callingCode, metadata)
		// If an IDD prefix was stripped then
		// convert the number to international one
		// for subsequent parsing.
		if (numberWithoutIDD && numberWithoutIDD !== number) {
			number = '+' + numberWithoutIDD
		} else {
			// Check to see if the number starts with the country calling code
			// for the default country. If so, we remove the country calling code,
			// and do some checks on the validity of the number before and after.
			// https://github.com/catamphetamine/libphonenumber-js/issues/376
			if (country || callingCode) {
				const {
					countryCallingCode,
					number: shorterNumber
				} = extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(
					number,
					country,
					callingCode,
					metadata
				)
				if (countryCallingCode) {
					return {
						countryCallingCode,
						number: shorterNumber
					}
				}
			}
			return { number }
		}
	}

	// Fast abortion: country codes do not begin with a '0'
	if (number[1] === '0') {
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
	while (i - 1 <= MAX_LENGTH_COUNTRY_CODE && i <= number.length) {
		const countryCallingCode = number.slice(1, i)
		if (metadata.hasCallingCode(countryCallingCode)) {
			metadata.selectNumberingPlan(undefined, countryCallingCode)
			return {
				countryCallingCode,
				number: number.slice(i)
			}
		}
		i++
	}

	return {}
}

/**
 * Sometimes some people incorrectly input international phone numbers
 * without the leading `+`. This function corrects such input.
 * @param  {string} number — Phone number digits.
 * @param  {string?} country
 * @param  {string?} callingCode
 * @param  {object} metadata
 * @return {object} `{ countryCallingCode: string?, number: string }`.
 */
export function extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(
	number,
	country,
	callingCode,
	metadata
) {
	const countryCallingCode = country ? getCountryCallingCode(country, metadata) : callingCode
	if (number.indexOf(countryCallingCode) === 0) {
		metadata = new Metadata(metadata)
		metadata.selectNumberingPlan(country, callingCode)
		const possibleShorterNumber = number.slice(countryCallingCode.length)
		const {
			nationalNumber: possibleShorterNationalNumber,
		} = stripNationalPrefixAndCarrierCode(
			possibleShorterNumber,
			metadata
		)
		const {
			nationalNumber
		} = stripNationalPrefixAndCarrierCode(
			number,
			metadata
		)
		// If the number was not valid before but is valid now,
		// or if it was too long before, we consider the number
		// with the country calling code stripped to be a better result
		// and keep that instead.
		// For example, in Germany (+49), `49` is a valid area code,
		// so if a number starts with `49`, it could be both a valid
		// national German number or an international number without
		// a leading `+`.
		if (
			(
				!matchesEntirely(nationalNumber, metadata.nationalNumberPattern())
				&&
				matchesEntirely(possibleShorterNationalNumber, metadata.nationalNumberPattern())
			)
			||
			checkNumberLengthForType(nationalNumber, undefined, metadata) === 'TOO_LONG'
		) {
			return {
				countryCallingCode,
				number: possibleShorterNumber
			}
		}
	}
	return { number }
}