// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import { matches_entirely } from './common'

import
{
	parse_phone_number_and_country_phone_code,
	VALID_PUNCTUATION
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

const default_options =
{
	formatExtension: (number, extension) => `${number} ext. ${extension}`
}

// Formats a phone number
//
// Example use cases:
//
// ```js
// format('8005553535', 'RU', 'International')
// format('8005553535', 'RU', 'International', metadata)
// format({ phone: '8005553535', country: 'RU' }, 'International')
// format({ phone: '8005553535', country: 'RU' }, 'International', metadata)
// format('+78005553535', 'National')
// format('+78005553535', 'National', metadata)
// ```
//
export default function format(arg_1, arg_2, arg_3, arg_4, arg_5)
{
	const
	{
		input,
		format_type,
		options,
		metadata
	}
	= sort_out_arguments(arg_1, arg_2, arg_3, arg_4, arg_5)

	let country_metadata

	if (input.country)
	{
		country_metadata = metadata.countries[input.country]
	}

	const { country_phone_code, number } = parse_phone_number_and_country_phone_code(input.phone, metadata)

	if (country_phone_code)
	{
		// Check country restriction
		if (input.country && country_metadata &&
			country_phone_code !== get_phone_code(country_metadata))
		{
			return input.phone
		}

		country_metadata = get_metadata_by_country_phone_code(country_phone_code, metadata)
	}

	if (!country_metadata)
	{
		return input.phone
	}

	switch (format_type)
	{
		case 'International':
			if (!number)
			{
				return `+${get_phone_code(country_metadata)}`
			}
			const national_number = format_national_number(number, 'International', false, country_metadata)
			const international_number = `+${get_phone_code(country_metadata)} ${national_number}`
			if (input.ext || input.ext === 0)
			{
				return options.formatExtension(international_number, input.ext)
			}
			return international_number

		case 'E.164':
		// "International_plaintext" is deprecated
		case 'International_plaintext':
			// `E.164` doesn't define "phone number extensions".
			return `+${get_phone_code(country_metadata)}${input.phone}`

		case 'RFC3966':
			return `+${get_phone_code(country_metadata)}${input.phone}${(input.ext || input.ext === 0) ? ';ext=' + input.ext : ''}`

		case 'National':
			if (!number)
			{
				return ''
			}
			const _national_number = format_national_number(number, 'National', false, country_metadata)
			if (input.ext || input.ext === 0)
			{
				return options.formatExtension(_national_number, input.ext)
			}
			return _national_number
	}
}

// This was originally set to $1 but there are some countries for which the
// first group is not used in the national pattern (e.g. Argentina) so the $1
// group does not match correctly.  Therefore, we use \d, so that the first
// group actually used in the pattern will be matched.
export const FIRST_GROUP_PATTERN = /(\$\d)/

export function format_national_number_using_format(number, format, international, enforce_national_prefix, country_metadata)
{
	const format_pattern_matcher = new RegExp(get_format_pattern(format))

	const national_prefix_formatting_rule = get_format_national_prefix_formatting_rule(format, country_metadata)

	// National prefix is omitted if there's no national prefix formatting rule
	// set for this country, or when this rule is set but
	// national prefix is optional for this phone number format
	// (and it is not enforced explicitly)
	const national_prefix_may_be_omitted = !national_prefix_formatting_rule ||
		(national_prefix_formatting_rule && get_format_national_prefix_is_optional_when_formatting(format, country_metadata) && !enforce_national_prefix)

	if (!international && !national_prefix_may_be_omitted)
	{
		return number.replace
		(
			format_pattern_matcher,
			get_format_format(format).replace
			(
				FIRST_GROUP_PATTERN,
				national_prefix_formatting_rule
			)
		)
	}

	const formatted_number = number.replace
	(
		format_pattern_matcher,
		international ? get_format_international_format(format) : get_format_format(format)
	)

	if (international)
	{
		return local_to_international_style(formatted_number)
	}

	return formatted_number
}

export function format_national_number(number, format_as, enforce_national_prefix, country_metadata)
{
	const format = choose_format_for_number(get_formats(country_metadata), number)

	if (!format)
	{
		return number
	}

	return format_national_number_using_format(number, format, format_as === 'International', enforce_national_prefix, country_metadata)
}

export function choose_format_for_number(available_formats, national_number)
{
	for (const format of available_formats)
	{
		// Validate leading digits
		if (get_format_leading_digits_patterns(format).length > 0)
		{
			// The last leading_digits_pattern is used here, as it is the most detailed
			const last_leading_digits_pattern = get_format_leading_digits_patterns(format)[get_format_leading_digits_patterns(format).length - 1]

			// If leading digits don't match then move on to the next phone number format
			if (national_number.search(last_leading_digits_pattern) !== 0)
			{
				continue
			}
		}

		// Check that the national number matches the phone number format regular expression
		if (matches_entirely(national_number, new RegExp(get_format_pattern(format))))
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
	return local.replace(new RegExp(`[${VALID_PUNCTUATION}]+`, 'g'), ' ').trim()
}

// Sort out arguments
function sort_out_arguments(arg_1 = '', arg_2, arg_3, arg_4, arg_5)
{
	let input
	let format_type
	let options
	let metadata

	// Sort out arguments.

	// If the phone number is passed as a string.
	// `format('8005553535', ...)`.
	if (typeof arg_1 === 'string')
	{
		// If country code is supplied.
		// `format('8005553535', 'RU', 'National', [options], metadata)`.
		if (typeof arg_3 === 'string')
		{
			// Will be `parse()`d later in code
			input =
			{
				phone   : arg_1,
				country : arg_2
			}

			format_type = arg_3

			if (arg_5)
			{
				options  = arg_4
				metadata = arg_5
			}
			else
			{
				metadata = arg_4
			}
		}
		// Just an international phone number is supplied
		// `format('+78005553535', 'National', [options], metadata)`.
		else
		{
			// Will be `parse()`d later in code
			input =
			{
				phone : arg_1
			}

			if (typeof arg_2 !== 'string')
			{
				throw new Error('Format type argument not passed for `format()`')
			}

			format_type = arg_2

			if (arg_4)
			{
				options  = arg_3
				metadata = arg_4
			}
			else
			{
				metadata = arg_3
			}
		}
	}
	// If the phone number is passed as a parsed number object.
	// `format({ phone: '8005553535', country: 'RU' }, 'National', [options], metadata)`.
	else
	{
		input       = arg_1
		format_type = arg_2

		if (arg_4)
		{
			options  = arg_3
			metadata = arg_4
		}
		else
		{
			metadata = arg_3
		}
	}

	// Metadata is required.
	if (!metadata)
	{
		throw new Error('Metadata is required')
	}

	// Validate `format_type`.
	switch (format_type)
	{
		case 'International':
		case 'E.164':
		// "International_plaintext" is deprecated
		case 'International_plaintext':
		case 'National':
		case 'RFC3966':
			break
		default:
			throw new Error(`Unknown format type argument passed to "format()": "${format_type}"`)
	}

	// Apply default options.
	if (options)
	{
		options = { ...default_options, ...options }
	}
	else
	{
		options = default_options
	}

	return { input, format_type, options, metadata }
}