// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of December 31th, 2018.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import { VALID_PUNCTUATION } from './constants'
import { matchesEntirely } from './util'
import Metadata, { getCountryCallingCode } from './metadata'
import { getIDDPrefix } from './IDD'
import { formatRFC3966 } from './RFC3966'

const DEFAULT_OPTIONS = {
	formatExtension: (formattedNumber, extension, metadata) => `${formattedNumber}${metadata.ext()}${extension}`
}

// Formats a phone number
//
// Example use cases:
//
// ```js
// formatNumber('8005553535', 'RU', 'INTERNATIONAL')
// formatNumber('8005553535', 'RU', 'INTERNATIONAL', metadata)
// formatNumber({ phone: '8005553535', country: 'RU' }, 'INTERNATIONAL')
// formatNumber({ phone: '8005553535', country: 'RU' }, 'INTERNATIONAL', metadata)
// formatNumber('+78005553535', 'NATIONAL')
// formatNumber('+78005553535', 'NATIONAL', metadata)
// ```
//
export default function formatNumber(input, format, options, metadata) {
	// Apply default options.
	if (options) {
		options = { ...DEFAULT_OPTIONS, ...options }
	} else {
		options = DEFAULT_OPTIONS
	}

	metadata = new Metadata(metadata)

	if (input.country && input.country !== '001') {
		// Validate `input.country`.
		if (!metadata.hasCountry(input.country)) {
			throw new Error(`Unknown country: ${input.country}`)
		}
		metadata.country(input.country)
	}
	else if (input.countryCallingCode) {
		metadata.selectNumberingPlan(input.countryCallingCode)
	}
	else return input.phone || ''

	const countryCallingCode = metadata.countryCallingCode()

	const nationalNumber = options.v2 ? input.nationalNumber : input.phone

	// This variable should have been declared inside `case`s
	// but Babel has a bug and it says "duplicate variable declaration".
	let number

	switch (format) {
		case 'NATIONAL':
			// Legacy argument support.
			// (`{ country: ..., phone: '' }`)
			if (!nationalNumber) {
				return ''
			}
			number = formatNationalNumber(nationalNumber, input.carrierCode, 'NATIONAL', metadata, options)
			return addExtension(number, input.ext, metadata, options.formatExtension)

		case 'INTERNATIONAL':
			// Legacy argument support.
			// (`{ country: ..., phone: '' }`)
			if (!nationalNumber) {
				return `+${countryCallingCode}`
			}
			number = formatNationalNumber(nationalNumber, null, 'INTERNATIONAL', metadata, options)
			number = `+${countryCallingCode} ${number}`
			return addExtension(number, input.ext, metadata, options.formatExtension)

		case 'E.164':
			// `E.164` doesn't define "phone number extensions".
			return `+${countryCallingCode}${nationalNumber}`

		case 'RFC3966':
			return formatRFC3966({
				number: `+${countryCallingCode}${nationalNumber}`,
				ext: input.ext
			})

		// For reference, here's Google's IDD formatter:
		// https://github.com/google/libphonenumber/blob/32719cf74e68796788d1ca45abc85dcdc63ba5b9/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberUtil.java#L1546
		// Not saying that this IDD formatter replicates it 1:1, but it seems to work.
		// Who would even need to format phone numbers in IDD format anyway?
		case 'IDD':
			if (!options.fromCountry) {
				return
				// throw new Error('`fromCountry` option not passed for IDD-prefixed formatting.')
			}
			const formattedNumber = formatIDD(
				nationalNumber,
				input.carrierCode,
				countryCallingCode,
				options.fromCountry,
				metadata
			)
			return addExtension(formattedNumber, input.ext, metadata, options.formatExtension)

		default:
			throw new Error(`Unknown "format" argument passed to "formatNumber()": "${format}"`)
	}
}

// This was originally set to $1 but there are some countries for which the
// first group is not used in the national pattern (e.g. Argentina) so the $1
// group does not match correctly. Therefore, we use `\d`, so that the first
// group actually used in the pattern will be matched.
export const FIRST_GROUP_PATTERN = /(\$\d)/

export function formatNationalNumberUsingFormat(
	number,
	format,
	{
		useInternationalFormat,
		withNationalPrefix,
		carrierCode,
		metadata
	}
) {
	const formattedNumber = number.replace(
		new RegExp(format.pattern()),
		useInternationalFormat
			? format.internationalFormat()
			: (
				// This library doesn't use `domestic_carrier_code_formatting_rule`,
				// because that one is only used when formatting phone numbers
				// for dialing from a mobile phone, and this is not a dialing library.
				// carrierCode && format.domesticCarrierCodeFormattingRule()
				// 	// First, replace the $CC in the formatting rule with the desired carrier code.
				// 	// Then, replace the $FG in the formatting rule with the first group
				// 	// and the carrier code combined in the appropriate way.
				// 	? format.format().replace(FIRST_GROUP_PATTERN, format.domesticCarrierCodeFormattingRule().replace('$CC', carrierCode))
				// 	: (
				// 		withNationalPrefix && format.nationalPrefixFormattingRule()
				// 			? format.format().replace(FIRST_GROUP_PATTERN, format.nationalPrefixFormattingRule())
				// 			: format.format()
				// 	)
				withNationalPrefix && format.nationalPrefixFormattingRule()
					? format.format().replace(FIRST_GROUP_PATTERN, format.nationalPrefixFormattingRule())
					: format.format()
			)
	)
	if (useInternationalFormat) {
		return applyInternationalSeparatorStyle(formattedNumber)
	}
	return formattedNumber
}

function formatNationalNumber(number, carrierCode, formatAs, metadata, options) {
	const format = chooseFormatForNumber(metadata.formats(), number)
	if (!format) {
		return number
	}
	return formatNationalNumberUsingFormat(
		number,
		format,
		{
			useInternationalFormat: formatAs === 'INTERNATIONAL',
			withNationalPrefix: format.nationalPrefixIsOptionalWhenFormattingInNationalFormat() && (options && options.nationalPrefix === false) ? false : true,
			carrierCode,
			metadata
		}
	)
}

function chooseFormatForNumber(availableFormats, nationalNnumber) {
	for (const format of availableFormats) {
		// Validate leading digits
		if (format.leadingDigitsPatterns().length > 0) {
			// The last leading_digits_pattern is used here, as it is the most detailed
			const lastLeadingDigitsPattern = format.leadingDigitsPatterns()[format.leadingDigitsPatterns().length - 1]
			// If leading digits don't match then move on to the next phone number format
			if (nationalNnumber.search(lastLeadingDigitsPattern) !== 0) {
				continue
			}
		}
		// Check that the national number matches the phone number format regular expression
		if (matchesEntirely(nationalNnumber, format.pattern())) {
			return format
		}
	}
}

// Removes brackets and replaces dashes with spaces.
//
// E.g. "(999) 111-22-33" -> "999 111 22 33"
//
// For some reason Google's metadata contains `<intlFormat/>`s with brackets and dashes.
// Meanwhile, there's no single opinion about using punctuation in international phone numbers.
//
// For example, Google's `<intlFormat/>` for USA is `+1 213-373-4253`.
// And here's a quote from WikiPedia's "North American Numbering Plan" page:
// https://en.wikipedia.org/wiki/North_American_Numbering_Plan
//
// "The country calling code for all countries participating in the NANP is 1.
// In international format, an NANP number should be listed as +1 301 555 01 00,
// where 301 is an area code (Maryland)."
//
// I personally prefer the international format without any punctuation.
// For example, brackets are remnants of the old age, meaning that the
// phone number part in brackets (so called "area code") can be omitted
// if dialing within the same "area".
// And hyphens were clearly introduced for splitting local numbers into memorizable groups.
// For example, remembering "5553535" is difficult but "555-35-35" is much simpler.
// Imagine a man taking a bus from home to work and seeing an ad with a phone number.
// He has a couple of seconds to memorize that number until it passes by.
// If it were spaces instead of hyphens the man wouldn't necessarily get it,
// but with hyphens instead of spaces the grouping is more explicit.
// I personally think that hyphens introduce visual clutter,
// so I prefer replacing them with spaces in international numbers.
// In the modern age all output is done on displays where spaces are clearly distinguishable
// so hyphens can be safely replaced with spaces without losing any legibility.
//
export function applyInternationalSeparatorStyle(local) {
	return local.replace(new RegExp(`[${VALID_PUNCTUATION}]+`, 'g'), ' ').trim()
}

function addExtension(formattedNumber, ext, metadata, formatExtension) {
	return ext ? formatExtension(formattedNumber, ext, metadata) : formattedNumber
}

function formatIDD(
	nationalNumber,
	carrierCode,
	countryCallingCode,
	fromCountry,
	metadata
) {
	const fromCountryCallingCode = getCountryCallingCode(fromCountry, metadata.metadata)
	// When calling within the same country calling code.
	if (fromCountryCallingCode === countryCallingCode) {
		const formattedNumber = formatNationalNumber(nationalNumber, carrierCode, 'NATIONAL', metadata)
		// For NANPA regions, return the national format for these regions
		// but prefix it with the country calling code.
		if (countryCallingCode === '1') {
			return countryCallingCode + ' ' + formattedNumber
		}
		// If regions share a country calling code, the country calling code need
		// not be dialled. This also applies when dialling within a region, so this
		// if clause covers both these cases. Technically this is the case for
		// dialling from La Reunion to other overseas departments of France (French
		// Guiana, Martinique, Guadeloupe), but not vice versa - so we don't cover
		// this edge case for now and for those cases return the version including
		// country calling code. Details here:
		// http://www.petitfute.com/voyage/225-info-pratiques-reunion
		//
		return formattedNumber
	}
	const IDDPrefix = getIDDPrefix(fromCountry, undefined, metadata.metadata)
	if (IDDPrefix) {
		return `${IDDPrefix} ${countryCallingCode} ${formatNationalNumber(nationalNumber, null, 'INTERNATIONAL', metadata)}`
	}
}