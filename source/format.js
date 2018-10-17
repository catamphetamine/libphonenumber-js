// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import
{
	// extractCountryCallingCode,
	VALID_PUNCTUATION,
	matches_entirely
}
from './common'

import parse from './parse'

import { getIDDPrefix } from './IDD'

import Metadata from './metadata'

import { formatRFC3966 } from './RFC3966'

const defaultOptions =
{
	formatExtension: (number, extension, metadata) => `${number}${metadata.ext()}${extension}`
}

// Formats a phone number
//
// Example use cases:
//
// ```js
// format('8005553535', 'RU', 'INTERNATIONAL')
// format('8005553535', 'RU', 'INTERNATIONAL', metadata)
// format({ phone: '8005553535', country: 'RU' }, 'INTERNATIONAL')
// format({ phone: '8005553535', country: 'RU' }, 'INTERNATIONAL', metadata)
// format('+78005553535', 'NATIONAL')
// format('+78005553535', 'NATIONAL', metadata)
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

	if (input.country)
	{
		// Validate `input.country`.
		if (!metadata.hasCountry(input.country))
		{
			throw new Error(`Unknown country: ${input.country}`)
		}
		metadata.country(input.country)
	}
	else if (input.countryCallingCode)
	{
		metadata.chooseCountryByCountryCallingCode(input.countryCallingCode)
	}
	else return input.phone || ''

	const countryCallingCode = metadata.countryCallingCode()

	const nationalNumber = options.v2 ? input.nationalNumber : input.phone

	// This variable should have been declared inside `case`s
	// but Babel has a bug and it says "duplicate variable declaration".
	let number

	switch (format_type)
	{
		case 'INTERNATIONAL':
			// Legacy argument support.
			// (`{ country: ..., phone: '' }`)
			if (!nationalNumber) {
				return `+${countryCallingCode}`
			}
			number = format_national_number(nationalNumber, 'INTERNATIONAL', false, metadata)
			number = `+${countryCallingCode} ${number}`
			return add_extension(number, input.ext, metadata, options.formatExtension)

		case 'E.164':
			// `E.164` doesn't define "phone number extensions".
			return `+${countryCallingCode}${nationalNumber}`

		case 'RFC3966':
			return formatRFC3966
			({
				number : `+${countryCallingCode}${nationalNumber}`,
				ext    : input.ext
			})

		case 'IDD':
			if (!options.fromCountry) {
				return
				// throw new Error('`fromCountry` option not passed for IDD-prefixed formatting.')
			}
			const IDDPrefix = getIDDPrefix(options.fromCountry, metadata.metadata)
			if (!IDDPrefix) {
				return
			}
			if (options.humanReadable)
			{
				const formattedForSameCountryCallingCode = countryCallingCode && formatIDDSameCountryCallingCodeNumber(nationalNumber, metadata.countryCallingCode(), options.fromCountry, metadata)
				if (formattedForSameCountryCallingCode) {
					number = formattedForSameCountryCallingCode
				} else {
					number = `${IDDPrefix} ${countryCallingCode} ${format_national_number(nationalNumber, 'INTERNATIONAL', false, metadata)}`
				}
				return add_extension(number, input.ext, metadata, options.formatExtension)
			}
			return `${IDDPrefix}${countryCallingCode}${nationalNumber}`

		case 'NATIONAL':
			// Legacy argument support.
			// (`{ country: ..., phone: '' }`)
			if (!nationalNumber) {
				return ''
			}
			number = format_national_number(nationalNumber, 'NATIONAL', true, metadata)
			return add_extension(number, input.ext, metadata, options.formatExtension)
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

	return format_national_number_using_format(number, format, format_as === 'INTERNATIONAL', enforce_national_prefix, metadata)
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
		if (matches_entirely(national_number, format.pattern()))
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
		// `format('8005553535', 'RU', 'NATIONAL', [options], metadata)`.
		if (typeof arg_3 === 'string')
		{
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

			input = parse(arg_1, { defaultCountry: arg_2, extended: true }, metadata)
		}
		// Just an international phone number is supplied
		// `format('+78005553535', 'NATIONAL', [options], metadata)`.
		else
		{
			if (typeof arg_2 !== 'string')
			{
				throw new Error('`format` argument not passed to `formatNumber(number, format)`')
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

			input = parse(arg_1, { extended: true }, metadata)
		}
	}
	// If the phone number is passed as a parsed number object.
	// `format({ phone: '8005553535', country: 'RU' }, 'NATIONAL', [options], metadata)`.
	else if (is_object(arg_1))
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

	if (format_type === 'International') {
		format_type = 'INTERNATIONAL'
	} else if (format_type === 'National') {
		format_type = 'NATIONAL'
	}

	// Validate `format_type`.
	switch (format_type)
	{
		case 'E.164':
		case 'INTERNATIONAL':
		case 'NATIONAL':
		case 'RFC3966':
		case 'IDD':
			break
		default:
			throw new Error(`Unknown format type argument passed to "format()": "${format_type}"`)
	}

	// Apply default options.
	if (options) {
		options = { ...defaultOptions, ...options }
	} else {
		options = defaultOptions
	}

	return { input, format_type, options, metadata: new Metadata(metadata) }
}

// Babel transforms `typeof` into some "branches"
// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
const is_object = _ => typeof _ === 'object'

function add_extension(number, ext, metadata, formatExtension)
{
	return ext ? formatExtension(number, ext, metadata) : number
}

export function formatIDDSameCountryCallingCodeNumber(number, toCountryCallingCode, fromCountry, toCountryMetadata)
{
	const fromCountryMetadata = new Metadata(toCountryMetadata.metadata)
	fromCountryMetadata.country(fromCountry)

	// If calling within the same country calling code.
	if (toCountryCallingCode === fromCountryMetadata.countryCallingCode())
	{
		// For NANPA regions, return the national format for these regions
		// but prefix it with the country calling code.
		if (toCountryCallingCode === '1')
		{
			return toCountryCallingCode + ' ' + format_national_number(number, 'NATIONAL', false, toCountryMetadata)
		}

		// If regions share a country calling code, the country calling code need
		// not be dialled. This also applies when dialling within a region, so this
		// if clause covers both these cases. Technically this is the case for
		// dialling from La Reunion to other overseas departments of France (French
		// Guiana, Martinique, Guadeloupe), but not vice versa - so we don't cover
		// this edge case for now and for those cases return the version including
		// country calling code. Details here:
		// http://www.petitfute.com/voyage/225-info-pratiques-reunion
		return format_national_number(number, 'NATIONAL', false, toCountryMetadata)
	}
}