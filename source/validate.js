import parse, { get_number_type } from './parse'

import
{
	get_types
}
from './metadata'

export default function is_valid(parsed, country_code)
{
	if (!parsed)
	{
		return false
	}

	if (typeof parsed === 'string')
	{
		parsed = parse.call(this, parsed, country_code)
	}

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