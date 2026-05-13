import Metadata from './metadata.js'
import checkNumberLength from './helpers/checkNumberLength.js'

/**
 * Checks if a phone number is "possible" (basically just checks its length).
 *
 * isPossible(phoneNumberInstance, { ..., v2: true }, metadata)
 *
 * isPossible({ phone: '8005553535', country: 'RU' }, { ... }, metadata)
 * isPossible({ phone: '8005553535', country: 'RU' }, undefined, metadata)
 *
 * @param  {object|PhoneNumber} input — If `options.v2: true` flag is passed, the `input` should be a `PhoneNumber` instance. Otherwise, it should be an object of shape `{ phone: '...', country: '...' }`.
 * @param  {object} [options]
 * @param  {object} metadata
 * @return {string}
 */
export default function isPossiblePhoneNumber(input, options, metadata) {
	/* istanbul ignore if */
	if (options === undefined) {
		options = {}
	}

	metadata = new Metadata(metadata)

	if (options.v2) {
		if (!input.countryCallingCode) {
			throw new Error('Invalid phone number object passed')
		}
		metadata.selectNumberingPlan(input.countryCallingCode)
	} else {
		if (!input.phone) {
			return false
		}
		if (input.country) {
			if (!metadata.hasCountry(input.country)) {
				throw new Error(`Unknown country: ${input.country}`)
			}
			metadata.selectNumberingPlan(input.country)
		} else {
			if (!input.countryCallingCode) {
				throw new Error('Invalid phone number object passed')
			}
			metadata.selectNumberingPlan(input.countryCallingCode)
		}
	}

	// Old (legacy) metadata (< 1.0.18) had no "possible length" data.
	// So `isPossibleNumber()` function is supported only for non-legacy metadata.
	if (metadata.possibleLengths()) {
		return isPossibleNumber(input.phone || input.nationalNumber, input.country, metadata)
	}

	// There was a bug in versions from `1.7.35` to `1.7.37` of `libphonenumber-js`
	// where "possible_lengths" property was missing from "non-geographical" numbering plans' metadata.
	// After that, the bug was noticed and fixed.
	// So for versions from `1.7.35` to `1.7.37`, just assume that all "non=geotraphical" numbers are possible.
	// The reason is that the bug was noticed relatively quickly (within a day or so)
	// and it's unlikely that anyone generated their custom metadata in that short time span.
	// And if they didn't generate any custom metadata then a follow-up package update would've silently fixed the bug.
	if (input.countryCallingCode && metadata.isNonGeographicCallingCode(input.countryCallingCode)) {
		return true
	}

	// `isPossibleNumber()` function is not supported.
	throw new Error('Missing "possibleLengths" in metadata. Perhaps the metadata has been generated before v1.0.18.');
}

export function isPossibleNumber(nationalNumber, country, metadata) { //, isInternational) {
	switch (checkNumberLength(nationalNumber, country, metadata)) {
		case 'IS_POSSIBLE':
			return true
		// This library ignores "local-only" phone numbers (for simplicity).
		// See the readme for more info on what are "local-only" phone numbers.
		// case 'IS_POSSIBLE_LOCAL_ONLY':
		// 	return !isInternational
		default:
			return false
	}
}