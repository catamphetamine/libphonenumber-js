import Metadata from './metadata'
import { checkNumberLengthForType } from './getNumberType_'

export default function isPossibleNumber(input, options, metadata)
{
	/* istanbul ignore if */
	if (options === undefined) {
		options = {}
	}

	metadata = new Metadata(metadata)

	if (options.v2)
	{
		if (!input.countryCallingCode) {
			throw new Error('Invalid phone number object passed')
		}
		metadata.chooseCountryByCountryCallingCode(input.countryCallingCode)
	}
	else
	{
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

	if (!metadata.possibleLengths()) {
		throw new Error('Metadata too old')
	}

	return is_possible_number(input.phone || input.nationalNumber, undefined, metadata)
}

export function is_possible_number(national_number, is_international, metadata)
{
	switch (checkNumberLengthForType(national_number, undefined, metadata))
	{
		case 'IS_POSSIBLE':
			return true
		// case 'IS_POSSIBLE_LOCAL_ONLY':
		// 	return !is_international
		default:
			return false
	}
}