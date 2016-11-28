// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import { matches_entirely } from './common'
import metadata from '../metadata.min'

import
{
	parse_phone_number_and_country_phone_code
}
from './parse'

import
{
	get_phone_code,
	get_formats,
	get_format_pattern,
	get_format_format,
	get_format_leading_digits_patterns,
	get_format_national_prefix_formatting_rule,
	get_format_national_prefix_is_optional_when_formatting,
	get_format_international_format,
	get_metadata_by_country_phone_code
}
from './metadata'

export default function format(input, format, third_argument)
{
	// If the first argument object is expanded
	if (typeof input === 'string')
	{
		// If number is passed not as an object
		if (typeof third_argument === 'string')
		{
			input = { phone: input, country: format }
			format = third_argument
		}
		else
		{
			input = { phone: input }
		}
	}

	let country_metadata = metadata.countries[input.country]

	const { country_phone_code, number } = parse_phone_number_and_country_phone_code(input.phone)

	if (country_phone_code)
	{
		// Check country restriction
		if (input.country && country_phone_code !== get_phone_code(country_metadata))
		{
			return input.phone
		}

		country_metadata = get_metadata_by_country_phone_code(country_phone_code, metadata)
	}

	if (!country_metadata)
	{
		return input.phone
	}

	switch (format)
	{
		case 'International':
			const national_number = format_national_number(number, 'International', country_metadata)
			return `+${get_phone_code(country_metadata)} ${national_number}`

		case 'International_plaintext':
			return `+${get_phone_code(country_metadata)}${input.phone}`

		case 'National':
			return format_national_number(number, 'National', country_metadata)
	}
}

// This was originally set to $1 but there are some countries for which the
// first group is not used in the national pattern (e.g. Argentina) so the $1
// group does not match correctly.  Therefore, we use \d, so that the first
// group actually used in the pattern will be matched.
const FIRST_GROUP_PATTERN = /(\$\d)/

export function format_national_number(number, format_as, country_metadata)
{
	const format = choose_format_for_number(get_formats(country_metadata), number)

	if (!format)
	{
		return number
	}

	const pattern_to_match = new RegExp(get_format_pattern(format))

	const national_prefix_formatting_rule = get_format_national_prefix_formatting_rule(format, country_metadata)

	if (format_as === 'National' &&
		!get_format_national_prefix_is_optional_when_formatting(format, country_metadata) &&
		national_prefix_formatting_rule)
	{
		return number.replace(pattern_to_match,
			get_format_format(format).replace(FIRST_GROUP_PATTERN, national_prefix_formatting_rule))
	}

	const formatted_number = number.replace(pattern_to_match, format_as === 'International' ? get_format_international_format(format) : get_format_format(format))

	if (format_as === 'International')
	{
		return local_to_international_style(formatted_number)
	}

	return formatted_number
}

function choose_format_for_number(available_formats, national_number)
{
	for (let format of available_formats)
	{
		if (get_format_leading_digits_patterns(format).length > 0)
		{
			// The last leading_digits_pattern is used here, as it is the most detailed
			const last_leading_digits_pattern = get_format_leading_digits_patterns(format)[get_format_leading_digits_patterns(format).length - 1]

			if (national_number.search(last_leading_digits_pattern) !== 0)
			{
				return
			}
		}

		if (matches_entirely(new RegExp(get_format_pattern(format)), national_number))
		{
			return format
		}
	}
}

// Removes brackets and replaces dashes with spaces.
//
// E.g. "(999) 111-22-33" -> "999 111 22 33"
//
export function local_to_international_style(local)
{
	return local
		// Remove brackets
		.replace(/[\(\)]/g, '')
		// Replace dashes with spaces
		.replace(/\-/g, ' ')
		.trim()
}