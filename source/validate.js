import parse, { get_number_type } from './parse'

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
		if (!get_number_type(input.phone, country_metadata))
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
			input    = parse(first_argument, second_argument, metadata)
		}
		// Just an international phone number is supplied
		else
		{
			metadata = second_argument
			input    = parse(first_argument, metadata)
		}
	}
	else
	{
		input    = first_argument
		metadata = second_argument
	}

	return { input, metadata }
}