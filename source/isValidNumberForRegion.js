import isViablePhoneNumber from './helpers/isViablePhoneNumber.js'
import parseNumber from './parse_.js'
import _isValidNumberForRegion from './isValidNumberForRegion_.js'

export default function isValidNumberForRegion(number, country, metadata) {
	if (typeof number !== 'string') {
		throw new TypeError('number must be a string')
	}
	if (typeof country !== 'string') {
		throw new TypeError('country must be a string')
	}
	// `parse` extracts phone numbers from raw text,
	// therefore it will cut off all "garbage" characters,
	// while this `validate` function needs to verify
	// that the phone number contains no "garbage"
	// therefore the explicit `isViablePhoneNumber` check.
	let input
	if (isViablePhoneNumber(number)) {
		input = parseNumber(number, { defaultCountry: country }, metadata)
	} else {
		input = {}
	}
	return _isValidNumberForRegion(input, country, undefined, metadata)
}