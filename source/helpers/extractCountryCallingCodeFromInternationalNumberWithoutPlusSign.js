import Metadata from '../metadata.js'
import matchesEntirely from './matchesEntirely.js'
import extractNationalNumber from './extractNationalNumber.js'
import checkNumberLength from './checkNumberLength.js'
import getCountryCallingCode from '../getCountryCallingCode.js'

/**
 * Sometimes some people incorrectly input international phone numbers
 * without the leading `+`. This function corrects such input.
 * @param  {string} number — Phone number digits (only digits, no `+`).
 * @param  {string} [country] — Exact country of the phone number.
 * @param  {string} [defaultCountry]
 * @param  {string} [defaultCallingCode]
 * @param  {object} metadataJson
 * @return {object} `{ countryCallingCode: string?, number: string }`, where `countryCallingCode` is the calling code that was extracted from the input `number` string, and `number` is the originally passed `number` without the extracted calling code.
 */
export default function extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(
	number,
	country,
	defaultCountry,
	defaultCallingCode,
	metadataJson
) {
	// Validate arguments.
	// The `number` is known to be in a non-international form
	// because there's no leading "+" character.
	// Therefore, there must be either `country` or `defaultCountry` or `defaultCallingCode`.
	// Otherwise, there'd be no source for the calling code to search for in the `number`.
	if (!(country || defaultCountry || defaultCallingCode)) {
		// There's no source for the calling code to search for in the `number`.
		return { number }
	}

	const countryCallingCode = country || defaultCountry
		? getCountryCallingCode(country || defaultCountry, metadataJson)
		: defaultCallingCode

	if (number.indexOf(countryCallingCode) === 0) {
		const metadata = new Metadata(metadataJson)
		metadata.selectNumberingPlan(country || defaultCountry || defaultCallingCode)

		const possibleShorterNumber = number.slice(countryCallingCode.length)

		const {
			nationalNumber: possibleShorterNationalNumber,
		} = extractNationalNumber(
			possibleShorterNumber,
			undefined,
			metadata
		)

		const {
			nationalNumber
		} = extractNationalNumber(
			number,
			undefined,
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
				!matchesEntirely(nationalNumber, metadata.nationalNumberPattern()) &&
				matchesEntirely(possibleShorterNationalNumber, metadata.nationalNumberPattern())
			)
			||
			checkNumberLength(nationalNumber, undefined, metadata) === 'TOO_LONG'
		) {
			return {
				countryCallingCode,
				number: possibleShorterNumber
			}
		}
	}

	return { number }
}