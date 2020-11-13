import extractNationalNumberFromPossiblyIncompleteNumber from './extractNationalNumberFromPossiblyIncompleteNumber'
import matchesEntirely from './matchesEntirely'
import checkNumberLength from './checkNumberLength'

/**
 * Strips national prefix and carrier code from a complete phone number.
 * The difference from the non-"FromCompleteNumber" function is that
 * it won't extract national prefix if the resultant number is too short
 * to be a complete number for the selected phone numbering plan.
 * @param  {string} number — Complete phone number digits.
 * @param  {Metadata} metadata — Metadata with a phone numbering plan selected.
 * @return {object} `{ nationalNumber: string, carrierCode: string? }`.
 */
export default function extractNationalNumber(number, metadata) {
	// Parsing national prefixes and carrier codes
	// is only required for local phone numbers
	// but some people don't understand that
	// and sometimes write international phone numbers
	// with national prefixes (or maybe even carrier codes).
	// http://ucken.blogspot.ru/2016/03/trunk-prefixes-in-skype4b.html
	// Google's original library forgives such mistakes
	// and so does this library, because it has been requested:
	// https://github.com/catamphetamine/libphonenumber-js/issues/127
	const {
		nationalNumber,
		carrierCode
	} = extractNationalNumberFromPossiblyIncompleteNumber(
		number,
		metadata
	)
	if (!shouldExtractNationalPrefix(number, nationalNumber, metadata)) {
		// Don't strip the national prefix.
		return { nationalNumber: number }
	}
	// If a national prefix has been extracted, check to see
	// if the resultant number isn't too short.
	// Same code in Google's `libphonenumber`:
	// https://github.com/google/libphonenumber/blob/e326fa1fc4283bb05eb35cb3c15c18f98a31af33/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberUtil.java#L3291-L3302
	// For some reason, they do this check right after the `national_number_pattern` check
	// this library does in `shouldExtractNationalPrefix()` function.
	// Why is there a second "resultant" number validity check?
	// They don't provide an explanation.
	// This library just copies the behavior.
	if (number.length !== nationalNumber.length + (carrierCode ? carrierCode.length : 0)) {
		// If not using legacy generated metadata (before version `1.0.18`)
		// then it has "possible lengths", so use those to validate the number length.
		if (metadata.possibleLengths()) {
			// "We require that the NSN remaining after stripping the national prefix and
			// carrier code be long enough to be a possible length for the region.
			// Otherwise, we don't do the stripping, since the original number could be
			// a valid short number."
			// https://github.com/google/libphonenumber/blob/876268eb1ad6cdc1b7b5bef17fc5e43052702d57/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberUtil.java#L3236-L3250
			switch (checkNumberLength(nationalNumber, metadata)) {
				case 'TOO_SHORT':
				case 'INVALID_LENGTH':
				// case 'IS_POSSIBLE_LOCAL_ONLY':
					// Don't strip the national prefix.
					return { nationalNumber: number }
			}
		}
	}
	return { nationalNumber, carrierCode }
}

// In some countries, the same digit could be a national prefix
// or a leading digit of a valid phone number.
// For example, in Russia, national prefix is `8`,
// and also `800 555 35 35` is a valid number
// in which `8` is not a national prefix, but the first digit
// of a national (significant) number.
// Same's with Belarus:
// `82004910060` is a valid national (significant) number,
// but `2004910060` is not.
// To support such cases (to prevent the code from always stripping
// national prefix), a condition is imposed: a national prefix
// is not extracted when the original number is "viable" and the
// resultant number is not, a "viable" national number being the one
// that matches `national_number_pattern`.
function shouldExtractNationalPrefix(number, nationalSignificantNumber, metadata) {
	// The equivalent in Google's code is:
	// https://github.com/google/libphonenumber/blob/e326fa1fc4283bb05eb35cb3c15c18f98a31af33/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberUtil.java#L2969-L3004
	if (matchesEntirely(number, metadata.nationalNumberPattern()) &&
		!matchesEntirely(nationalSignificantNumber, metadata.nationalNumberPattern())) {
		return false
	}
	// Just "possible" number check would be more relaxed, so it's not used.
	// if (isPossibleNumber(number, metadata) &&
	// 	!isPossibleNumber(numberWithNationalPrefixExtracted, metadata)) {
	// 	return false
	// }
	return true
}