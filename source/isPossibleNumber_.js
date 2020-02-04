import Metadata from './metadata'
import { checkNumberLengthForType } from './getNumberType_'

export default function isPossiblePhoneNumber(input, options, metadata)
{
	/* istanbul ignore if */
	if (options === undefined) {
		options = {}
	}

	metadata = new Metadata(metadata)

	if (options.v2) {
		if (!input.countryCallingCode) {
			throw new Error('Invalid phone number object passed')
		}
		metadata.chooseCountryByCountryCallingCode(input.countryCallingCode)
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
			metadata.chooseCountryByCountryCallingCode(input.countryCallingCode)
		}
	}

	if (metadata.possibleLengths()) {
		return isPossibleNumber(input.phone || input.nationalNumber, undefined, metadata)
	} else {
		if (input.countryCallingCode && metadata.isNonGeographicCallingCode(input.countryCallingCode)) {
			// "Non-geographical entities" don't have `possibleLengths`.
			return true
		} else {
			throw new Error('Missing "possibleLengths" in metadata. Perhaps the metadata has been generated before v1.0.18.');
		}
	}
}

export function isPossibleNumber(nationalNumber, isInternational, metadata) {
	switch (checkNumberLengthForType(nationalNumber, undefined, metadata)) {
		case 'IS_POSSIBLE':
			return true
		// case 'IS_POSSIBLE_LOCAL_ONLY':
		// 	return !isInternational
		default:
			return false
	}
}