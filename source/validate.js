import parse, { get_number_type, is_viable_phone_number } from './parse'

import
{
	get_types
}
from './metadata'

// Checks if a given phone number is valid
//
// Example use cases:
//
// ```js
// is_valid('8005553535', 'RU')
// is_valid('8005553535', 'RU', metadata)
// is_valid({ phone: '8005553535', country: 'RU' })
// is_valid({ phone: '8005553535', country: 'RU' }, metadata)
// is_valid('+78005553535')
// is_valid('+78005553535', metadata)
// ```
//
export default function is_valid(first_argument, second_argument, third_argument)
{
	const { input, metadata } = sort_out_arguments(first_argument, second_argument, third_argument)

	// Sanity check
	if (!metadata)
	{
		throw new Error('Metadata not passed')
	}

	if (!input)
	{
		return false
	}

	if (!input.country)
	{
		return false
	}

	const country_metadata = metadata.countries[input.country]

	if (get_types(country_metadata))
	{
		if (!get_number_type(input.phone, input.country, metadata))
		{
			return false
		}
	}

	return true
}

// Sort out arguments
function sort_out_arguments(first_argument, second_argument, third_argument)
{
	let input
	let metadata

	if (typeof first_argument === 'string')
	{
		// If country code is supplied
		if (typeof second_argument === 'string')
		{
			metadata = third_argument

			// `parse` extracts phone numbers from raw text,
			// therefore it will cut off all "garbage" characters,
			// while this `validate` function needs to verify
			// that the phone number contains no "garbage"
			// therefore the explicit `is_viable_phone_number` check.
			if (is_viable_phone_number(first_argument))
			{
				input = parse(first_argument, second_argument, metadata)
			}
		}
		// Just an international phone number is supplied
		else
		{
			metadata = second_argument

			// `parse` extracts phone numbers from raw text,
			// therefore it will cut off all "garbage" characters,
			// while this `validate` function needs to verify
			// that the phone number contains no "garbage"
			// therefore the explicit `is_viable_phone_number` check.
			if (is_viable_phone_number(first_argument))
			{
				input = parse(first_argument, metadata)
			}
		}
	}
	else
	{
		// The `first_argument` must be a valid phone number
		// as a whole, not just a part of it which gets parsed here.
		if (first_argument && first_argument.phone && is_viable_phone_number(first_argument.phone))
		{
			input = first_argument
		}

		metadata = second_argument
	}

	return { input, metadata }
}