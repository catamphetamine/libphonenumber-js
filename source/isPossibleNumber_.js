import Metadata from './metadata'
import checkNumberLength from './helpers/checkNumberLength'

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
			metadata.country(input.country)
		} else {
			if (!input.countryCallingCode) {
				throw new Error('Invalid phone number object passed')
			}
			metadata.selectNumberingPlan(input.countryCallingCode)
		}
	}

	if (metadata.possibleLengths()) {
		return isPossibleNumber(input.phone || input.nationalNumber, metadata)
	} else {
		// There was a bug between `1.7.35` and `1.7.37` where "possible_lengths"
		// were missing for "non-geographical" numbering plans.
		// Just assume the number is possible in such cases:
		// it's unlikely that anyone generated their custom metadata
		// in that short period of time (one day).
		// This code can be removed in some future major version update.
		if (input.countryCallingCode && metadata.isNonGeographicCallingCode(input.countryCallingCode)) {
			// "Non-geographic entities" did't have `possibleLengths`
			// due to a bug in metadata generation process.
			return true
		} else {
			throw new Error('Missing "possibleLengths" in metadata. Perhaps the metadata has been generated before v1.0.18.');
		}
	}
}

export function isPossibleNumber(nationalNumber, metadata) { //, isInternational) {
	switch (checkNumberLength(nationalNumber, metadata)) {
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