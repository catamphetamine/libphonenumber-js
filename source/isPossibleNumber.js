import { sort_out_arguments, check_number_length_for_type } from './getNumberType'

/**
 * Checks if a given phone number is possible.
 * Which means it only checks phone number length
 * and doesn't test any regular expressions.
 *
 * Examples:
 *
 * ```js
 * isPossibleNumber('+78005553535', metadata)
 * isPossibleNumber('8005553535', 'RU', metadata)
 * isPossibleNumber('88005553535', 'RU', metadata)
 * isPossibleNumber({ phone: '8005553535', country: 'RU' }, metadata)
 * ```
 */
export default function isPossibleNumber(arg_1, arg_2, arg_3, arg_4)
{
	const { input, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)

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