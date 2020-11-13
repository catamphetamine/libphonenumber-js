// This is a port of Google Android `libphonenumber`'s
// `phonenumberutil.js` of December 31th, 2018.
//
// https://github.com/googlei18n/libphonenumber/commits/master/javascript/i18n/phonenumbers/phonenumberutil.js

import matchesEntirely from './helpers/matchesEntirely'
import formatNationalNumberUsingFormat from './helpers/formatNationalNumberUsingFormat'
import Metadata, { getCountryCallingCode } from './metadata'
import getIddPrefix from './helpers/getIddPrefix'
import { formatRFC3966 } from './helpers/RFC3966'

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
	const iddPrefix = getIddPrefix(fromCountry, undefined, metadata.metadata)
	if (iddPrefix) {
		return `${iddPrefix} ${countryCallingCode} ${formatNationalNumber(nationalNumber, null, 'INTERNATIONAL', metadata)}`
	}
}