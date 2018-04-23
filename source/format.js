// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import
{
	parse_national_number_and_country_calling_code,
	VALID_PUNCTUATION,
	matches_entirely
}
from './common'

import Metadata from './metadata'

import { formatRFC3966 } from './RFC3966'

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

	if (input.country && metadata.hasCountry(input.country))
	{
		metadata.country(input.country)
	}

	let { countryCallingCode, number } = parse_national_number_and_country_calling_code(input.phone, metadata)

	countryCallingCode = countryCallingCode || input.countryCallingCode

	if (countryCallingCode)
	{
		// Check country restriction
		if (input.country && metadata.selectedCountry() &&
			countryCallingCode !== metadata.countryCallingCode())
		{
			return input.phone
		}

		metadata.chooseCountryByCountryCallingCode(countryCallingCode)
	}

	if (!metadata.selectedCountry())
	{
		return input.phone
	}

	switch (format_type)
	{
		case 'International':
			if (!number) {
				return `+${metadata.countryCallingCode()}`
			}
			number = format_national_number(number, 'International', false, metadata)
			number = `+${metadata.countryCallingCode()} ${number}`
			return add_extension(number, input.ext, options.formatExtension)

		case 'E.164':
			// `E.164` doesn't define "phone number extensions".
			return `+${metadata.countryCallingCode()}${input.phone}`

		case 'RFC3966':
			return formatRFC3966
			({
				number : `+${metadata.countryCallingCode()}${input.phone}`,
				ext    : input.ext
			})

		case 'National':
			if (!number) {
				return ''
			}
			number = format_national_number(number, 'National', false, metadata)
			return add_extension(number, input.ext, options.formatExtension)
	}
}

// This was originally set to $1 but there are some countries for which the
// first group is not used in the national pattern (e.g. Argentina) so the $1
// group does not match correctly.  Therefore, we use \d, so that the first
// group actually used in the pattern will be matched.
export const FIRST_GROUP_PATTERN = /(\$\d)/

export function format_national_number_using_format(number, format, international, enforce_national_prefix, metadata)
{
	const format_pattern_matcher = new RegExp(format.pattern())

	// National prefix is omitted if there's no national prefix formatting rule
	// set for this country, or when this rule is set but
	// national prefix is optional for this phone number format
	// (and it is not enforced explicitly)
	const national_prefix_may_be_omitted = !format.nationalPrefixFormattingRule() ||
		(format.nationalPrefixFormattingRule() && format.nationalPrefixIsOptionalWhenFormatting() && !enforce_national_prefix)

	if (!international && !national_prefix_may_be_omitted)
	{
		return number.replace
		(
			format_pattern_matcher,
			format.format().replace
			(
				FIRST_GROUP_PATTERN,
				format.nationalPrefixFormattingRule()
			)
		)
	}

	const formatted_number = number.replace
	(
		format_pattern_matcher,
		international ? format.internationalFormat() : format.format()
	)

	if (international)
	{
		return local_to_international_style(formatted_number)
	}

	return formatted_number
}

function format_national_number(number, format_as, enforce_national_prefix, metadata)
{
	const format = choose_format_for_number(metadata.formats(), number)

	if (!format)
	{
		return number
	}

	return format_national_number_using_format(number, format, format_as === 'International', enforce_national_prefix, metadata)
}

export function choose_format_for_number(available_formats, national_number)
{
	for (const format of available_formats)
	{
		// Validate leading digits
		if (format.leadingDigitsPatterns().length > 0)
		{
			// The last leading_digits_pattern is used here, as it is the most detailed
			const last_leading_digits_pattern = format.leadingDigitsPatterns()[format.leadingDigitsPatterns().length - 1]

			// If leading digits don't match then move on to the next phone number format
			if (national_number.search(last_leading_digits_pattern) !== 0)
			{
				continue
			}
		}

		// Check that the national number matches the phone number format regular expression
		if (matches_entirely(national_number, new RegExp(format.pattern())))
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
function sort_out_arguments(arg_1, arg_2, arg_3, arg_4, arg_5)
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
	else if (is_object(arg_1) && typeof arg_1.phone === 'string')
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
	else throw new TypeError('A phone number must either be a string or an object of shape { phone, [country] }.')

	// Validate `format_type`.
	switch (format_type)
	{
		case 'International':
		case 'E.164':
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

	return { input, format_type, options, metadata: new Metadata(metadata) }
}

// Babel transforms `typeof` into some "branches"
// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
const is_object = _ => typeof _ === 'object'

function add_extension(number, ext, formatExtension)
{
	return ext ? formatExtension(number, ext) : number
}