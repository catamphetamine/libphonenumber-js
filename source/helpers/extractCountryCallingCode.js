import stripIddPrefix from './stripIddPrefix'
import extractCountryCallingCodeFromInternationalNumberWithoutPlusSign from './extractCountryCallingCodeFromInternationalNumberWithoutPlusSign'
import Metadata from '../metadata'
import { MAX_LENGTH_COUNTRY_CODE } from '../constants'

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
export default function extractCountryCallingCode(
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
		const numberWithoutIDD = stripIddPrefix(number, country, callingCode, metadata)
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
			metadata.selectNumberingPlan(countryCallingCode)
			return {
				countryCallingCode,
				number: number.slice(i)
			}
		}
		i++
	}

	return {}
}