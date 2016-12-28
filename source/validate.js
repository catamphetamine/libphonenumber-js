import parse, { get_number_type } from './parse'

import
{
	get_types
}
from './metadata'

export default function is_valid(number, country_code)
{
	const parsed = parse.call(this, number, country_code)

	if (!parsed.country)
	{
		return false
	}

	const country_metadata = this.metadata.countries[parsed.country]

	if (get_types(country_metadata))
	{
		if (!get_number_type(parsed.phone, country_metadata))
		{
			return false
		}
	}

	return true
}