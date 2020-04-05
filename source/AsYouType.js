// This is an enhanced port of Google Android `libphonenumber`'s
// `asyoutypeformatter.js` of December 31th, 2018.
//
// https://github.com/googlei18n/libphonenumber/blob/8d21a365061de2ba0675c878a710a7b24f74d2ae/javascript/i18n/phonenumbers/asyoutypeformatter.js
//
// Simplified: does not differentiate between "local-only" numbers
// and "internationally dialable" numbers.
// For example, doesn't include changes like this:
// https://github.com/googlei18n/libphonenumber/commit/865da605da12b01053c4f053310bac7c5fbb7935

import Metadata from './metadata'

import PhoneNumber from './PhoneNumber'

import {
	VALID_DIGITS,
	VALID_PUNCTUATION,
	PLUS_CHARS
} from './constants'

import { matchesEntirely } from './util'

import {
	extractCountryCallingCode,
	findCountryCode,
	stripNationalPrefixAndCarrierCode,
	stripNationalPrefixAndCarrierCodeFromCompleteNumber,
	extractCountryCallingCodeFromInternationalNumberWithoutPlusSign
} from './parse_'

import {
	FIRST_GROUP_PATTERN,
	formatNationalNumberUsingFormat,
	applyInternationalSeparatorStyle
} from './format_'

import { stripIDDPrefix } from './IDD'

import { checkNumberLengthForType } from './getNumberType_'

import parseDigits from './parseDigits'

// Used in phone number format template creation.
// Could be any digit, I guess.
const DUMMY_DIGIT = '9'
// I don't know why is it exactly `15`
const LONGEST_NATIONAL_PHONE_NUMBER_LENGTH = 15
// Create a phone number consisting only of the digit 9 that matches the
// `number_pattern` by applying the pattern to the "longest phone number" string.
const LONGEST_DUMMY_PHONE_NUMBER = repeat(DUMMY_DIGIT, LONGEST_NATIONAL_PHONE_NUMBER_LENGTH)

// The digits that have not been entered yet will be represented by a \u2008,
// the punctuation space.
export const DIGIT_PLACEHOLDER = 'x' // '\u2008' (punctuation space)
const DIGIT_PLACEHOLDER_MATCHER = new RegExp(DIGIT_PLACEHOLDER)

// A set of characters that, if found in a national prefix formatting rules, are an indicator to
// us that we should separate the national prefix from the number when formatting.
const NATIONAL_PREFIX_SEPARATORS_PATTERN = /[- ]/

// Deprecated: Google has removed some formatting pattern related code from their repo.
// https://github.com/googlei18n/libphonenumber/commit/a395b4fef3caf57c4bc5f082e1152a4d2bd0ba4c
// "We no longer have numbers in formatting matching patterns, only \d."
// Because this library supports generating custom metadata
// some users may still be using old metadata so the relevant
// code seems to stay until some next major version update.
const SUPPORT_LEGACY_FORMATTING_PATTERNS = true

// A pattern that is used to match character classes in regular expressions.
// An example of a character class is "[1-4]".
const CREATE_CHARACTER_CLASS_PATTERN = SUPPORT_LEGACY_FORMATTING_PATTERNS && (() => /\[([^\[\]])*\]/g)

// Any digit in a regular expression that actually denotes a digit. For
// example, in the regular expression "80[0-2]\d{6,10}", the first 2 digits
// (8 and 0) are standalone digits, but the rest are not.
// Two look-aheads are needed because the number following \\d could be a
// two-digit number, since the phone number can be as long as 15 digits.
const CREATE_STANDALONE_DIGIT_PATTERN = SUPPORT_LEGACY_FORMATTING_PATTERNS && (() => /\d(?=[^,}][^,}])/g)

// A pattern that is used to determine if a `format` is eligible
// to be used by the "as you type formatter".
// It is eligible when the `format` contains groups of the dollar sign
// followed by a single digit, separated by valid phone number punctuation.
// This prevents invalid punctuation (such as the star sign in Israeli star numbers)
// getting into the output of the "as you type formatter".
const ELIGIBLE_FORMAT_PATTERN = new RegExp(
	'^' +
	'[' + VALID_PUNCTUATION + ']*' +
	'(\\$\\d[' + VALID_PUNCTUATION + ']*)+' +
	'$'
)

// This is the minimum length of the leading digits of a phone number
// to guarantee the first "leading digits pattern" for a phone number format
// to be preemptive.
const MIN_LEADING_DIGITS_LENGTH = 3

const VALID_FORMATTED_PHONE_NUMBER_PART =
	'[' +
		VALID_PUNCTUATION +
		VALID_DIGITS +
	']+'

const VALID_FORMATTED_PHONE_NUMBER_PART_PATTERN = new RegExp('^' + VALID_FORMATTED_PHONE_NUMBER_PART + '$', 'i')

const VALID_PHONE_NUMBER =
	'(?:' +
		'[' + PLUS_CHARS + ']' +
		'[' +
			VALID_PUNCTUATION +
			VALID_DIGITS +
		']*' +
		'|' +
		'[' +
			VALID_PUNCTUATION +
			VALID_DIGITS +
		']+' +
	')'

const AFTER_PHONE_NUMBER_DIGITS_END_PATTERN = new RegExp(
	'[^' +
		VALID_PUNCTUATION +
		VALID_DIGITS +
	']+' +
	'.*' +
	'$'
)

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

export default class AsYouType {
	// Not setting `options` to a constructor argument
	// not to break backwards compatibility
	// for older versions of the library.
	options = {}

	/**
	 * @param {(string|object)?} [optionsOrDefaultCountry] - The default country used for parsing non-international phone numbers. Can also be an `options` object.
	 * @param {Object} metadata
	 */
	constructor(optionsOrDefaultCountry, metadata) {
		this.metadata = new Metadata(metadata)
		// Set `defaultCountry` and `defaultCallingCode` options.
		let defaultCountry
		let defaultCallingCode
		// Turns out `null` also has type "object". Weird.
		if (optionsOrDefaultCountry) {
			if (typeof optionsOrDefaultCountry === 'object') {
				defaultCountry = optionsOrDefaultCountry.defaultCountry
				defaultCallingCode = optionsOrDefaultCountry.defaultCallingCode
			} else {
				defaultCountry = optionsOrDefaultCountry
			}
		}
		if (defaultCountry && this.metadata.hasCountry(defaultCountry)) {
			this.defaultCountry = defaultCountry
		}
		if (defaultCallingCode) {
			/* istanbul ignore if */
			if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
				if (this.metadata.isNonGeographicCallingCode(defaultCallingCode)) {
					this.defaultCountry = '001'
				}
			}
			this.defaultCallingCode = defaultCallingCode
		}
		// Reset.
		this.reset()
	}

	reset() {
		this.formattedOutput = ''
		this.international = false
		this.internationalPrefix = undefined
		this.countryCallingCode = undefined
		this.digits = ''
		this.nationalNumberDigits = ''
		this.nationalPrefix = ''
		this.carrierCode = ''
		this.setCountry(this.defaultCountry, this.defaultCallingCode)
		return this
	}

	resetFormat() {
		this.chosenFormat = undefined
		this.template = undefined
		this.populatedNationalNumberTemplate = undefined
		this.populatedNationalNumberTemplatePosition = -1
	}

	/**
	 * Returns `true` if the phone number is being input in international format.
	 * In other words, returns `true` if and only if the parsed phone number starts with a `"+"`.
	 * @return {boolean}
	 */
	isInternational() {
		return this.international
	}

	/**
	 * Returns the "country calling code" part of the phone number.
	 * Returns `undefined` if the number is not being input in international format.
	 * Returns "country calling code" for "non-geographic" phone numbering plans too.
	 * @return {string} [countryCallingCode]
	 */
	getCountryCallingCode() {
		return this.countryCallingCode
	}

	/**
	 * Returns a two-letter country code of the phone number.
	 * Returns `undefined` for "non-geographic" phone numbering plans.
	 * Returns `undefined` if no phone number has been input yet.
	 * @return {string} [country]
	 */
	getCountry() {
		// If no digits have been input yet,
		// then `this.country` is the `defaultCountry`.
		// Won't return the `defaultCountry` in such case.
		if (!this.digits) {
			return
		}
		let countryCode = this.country
		/* istanbul ignore if */
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			if (this.country === '001') {
				countryCode = undefined
			}
		}
		return countryCode
	}

	setCountry(country, callingCode) {
		this.country = country
		this.metadata.selectNumberingPlan(country, callingCode)
		if (this.metadata.hasSelectedNumberingPlan()) {
			this.initializePhoneNumberFormatsForCountry()
		} else {
			this.matchingFormats = []
		}
		this.resetFormat()
	}

	/**
	 * Inputs "next" phone number characters.
	 * @param  {string} text
	 * @return {string} Formatted phone number characters that have been input so far.
	 */
	input(text) {
		const formattedDigits = this.extractFormattedDigits(text)
		// If the extracted phone number part
		// can possibly be a part of some valid phone number
		// then parse phone number characters from a formatted phone number.
		if (VALID_FORMATTED_PHONE_NUMBER_PART_PATTERN.test(formattedDigits)) {
			this.formattedOutput = this.getFullNumber(
				this.inputDigits(parseDigits(formattedDigits)) ||
				this.getNonFormattedNationalNumber()
			)
		}
		return this.formattedOutput
	}

	/**
	 * Extracts formatted phone number digits from text (if there're any).
	 * @param  {string} text
	 * @return {string}
	 */
	extractFormattedDigits(text) {
		// Extract a formatted phone number part from text.
		let extractedNumber = extractFormattedPhoneNumber(text) || ''
		// Trim a `+`.
		if (extractedNumber[0] === '+') {
			// Trim the `+`.
			extractedNumber = extractedNumber.slice('+'.length)
			if (this.digits) {
				// If an out of position `+` is detected
				// (or a second `+`) then just ignore it.
			} else {
				this.formattedOutput = '+'
				this.startInternationalNumber()
			}
		}
		return extractedNumber
	}

	startInternationalNumber() {
		// Prepend the `+` to parsed input.
		this.international = true
		// If a default country was set then reset it
		// because an explicitly international phone
		// number is being entered.
		this.setCountry()
	}

	/**
	 * Inputs "next" phone number digits.
	 * @param  {string} digits
	 * @return {string} [formattedNumber] Formatted national phone number (if it can be formatted at this stage). Returning `undefined` means "don't format the national phone number at this stage".
	 */
	inputDigits(nextDigits) {
		// Some users input their phone number in "out-of-country"
		// dialing format instead of using the leading `+`.
		// https://github.com/catamphetamine/libphonenumber-js/issues/185
		// Detect such numbers.
		if (!this.digits) {
			const numberWithoutIDD = stripIDDPrefix(
				nextDigits,
				this.defaultCountry,
				this.defaultCallingCode,
				this.metadata.metadata
			)
			if (numberWithoutIDD && numberWithoutIDD !== nextDigits) {
				// If an IDD prefix was stripped then
				// convert the number to international one
				// for subsequent parsing.
				this.internationalPrefix = nextDigits.slice(0, nextDigits.length - numberWithoutIDD.length)
				nextDigits = numberWithoutIDD
				this.startInternationalNumber()
			}
		}
		// Append phone number digits.
		this.digits += nextDigits
		// Try to format the parsed input
		if (this.isInternational()) {
			if (this.countryCallingCode) {
				this.nationalNumberDigits += nextDigits
				// `this.country` could be `undefined`, for example, when there is
				// ambiguity in a form of several different countries,
				// each corresponding to the same country phone code
				// (e.g. NANPA: USA, Canada, etc), and there's not enough digits
				// to reliably determine the country the phone number belongs to.
				// Therefore, in cases of such ambiguity, each time something is input,
				// try to determine the country (if it hasn't been determined yet).
				if (!this.country || this.isCountryCallingCodeAmbiguous()) {
					this.determineTheCountry()
				}
			} else {
				// Extract country calling code from the digits entered so far.
				// There must be some digits in order to extract anything from them.
				//
				// If one looks at country phone codes
				// then they can notice that no one country phone code
				// is ever a (leftmost) substring of another country phone code.
				// So if a valid country code is extracted so far
				// then it means that this is the country code.
				//
				// If no country phone code could be extracted so far,
				// then don't format the phone number.
				//
				if (!this.extractCountryCallingCode()) {
					// Don't format the phone number.
					return
				}
				// Possibly extract a national prefix.
				// Some people incorrectly input national prefix
				// in an international phone number.
				// For example, some people write British phone numbers as `+44(0)...`.
				// Also, mobile phone numbers in Mexico are supposed to be dialled
				// internationally using a `15` national prefix.
				//
				// https://www.mexperience.com/dialing-cell-phones-in-mexico/
				//
				// "Dialing a Mexican cell phone from abroad
				// When you are calling a cell phone number in Mexico from outside Mexico,
				// it’s necessary to dial an additional “1” after Mexico’s country code
				// (which is “52”) and before the area code.
				// You also ignore the 045, and simply dial the area code and the
				// cell phone’s number.
				//
				// If you don’t add the “1”, you’ll receive a recorded announcement
				// asking you to redial using it.
				//
				// For example, if you are calling from the USA to a cell phone
				// in Mexico City, you would dial +52 – 1 – 55 – 1234 5678.
				// (Note that this is different to calling a land line in Mexico City
				// from abroad, where the number dialed would be +52 – 55 – 1234 5678)".
				//
				this.nationalNumberDigits = this.digits.slice(this.countryCallingCode.length)
				// this.extractNationalPrefix()
				//
				// Determine the country from country calling code and national number.
				this.determineTheCountry()
			}
		} else {
			this.nationalNumberDigits += nextDigits
			// If `defaultCallingCode` is set,
			// see if the `country` could be derived.
			if (!this.country) {
				this.determineTheCountry()
			}
			// Some national prefixes are substrings of other national prefixes
			// (for the same country), therefore try to extract national prefix each time
			// because a longer national prefix might be available at some point in time.
			const previousNationalPrefix = this.nationalPrefix
			this.nationalNumberDigits = this.nationalPrefix + this.nationalNumberDigits
			// Re-extract national prefix.
			this.extractNationalPrefix()
			// If another national prefix has been extracted.
			if (this.nationalPrefix !== previousNationalPrefix) {
				// National number has changed
				// (due to another national prefix been extracted)
				// therefore national number has changed
				// therefore reset all previous formatting data.
				// (and leading digits matching state)
				this.initializePhoneNumberFormatsForCountry()
				this.resetFormat()
			}
		}

		if (this.nationalNumberDigits) {
			// Match the available formats by the currently available leading digits.
			this.matchFormats(this.nationalNumberDigits)
		}

		// Format the phone number (given the next digits)
		return this.formatNationalNumberWithNextDigits(nextDigits)
	}

	formatNationalNumberWithNextDigits(nextDigits) {
		// See if the phone number digits can be formatted as a complete phone number.
		// If not, use the results from `formatNextNationalNumberDigits()`,
		// which formats based on the chosen formatting pattern.
		// Attempting to format complete phone number first is how it's done
		// in Google's `libphonenumber`.
		const formattedNumber = this.attemptToFormatCompletePhoneNumber()

		// Just because a phone number doesn't have a suitable format
		// that doesn't mean that the phone number is invalid,
		// because phone number formats only format phone numbers,
		// they don't validate them and some (rare) phone numbers
		// are meant to stay non-formatted.
		if (formattedNumber) {
			return formattedNumber
		}

		// Format the next phone number digits
		// using the previously chosen phone number format.
		//
		// This is done here because if `attemptToFormatCompletePhoneNumber`
		// was placed before this call then the `template`
		// wouldn't reflect the situation correctly (and would therefore be inconsistent)
		//
		const previouslyChosenFormat = this.chosenFormat
		// Choose a format from the list of matching ones.
		const newlyChosenFormat = this.chooseFormat()
		if (newlyChosenFormat) {
			if (newlyChosenFormat === previouslyChosenFormat) {
				// If could format the next (current) digit
				// using the previously chosen phone number format
				// then return the formatted number so far.
				//
				// If no new phone number format could be chosen,
				// and couldn't format the supplied national number
				// using the previously chosen phone number pattern,
				// then return `undefined`.
				//
				return this.formatNextNationalNumberDigits(nextDigits)
			} else {
				// If a more appropriate phone number format
				// has been chosen for these "leading digits",
				// then format the national phone number (so far)
				// using the newly selected format.
				//
				// Will return `undefined` if it couldn't format
				// the supplied national number
				// using the selected phone number pattern.
				//
				return this.reformatNationalNumber()
			}
		}
	}

	chooseFormat() {
		// When there are multiple available formats, the formatter uses the first
		// format where a formatting template could be created.
		for (const format of this.matchingFormats) {
			// If this format is currently being used
			// and is still possible, then stick to it.
			if (this.chosenFormat === format) {
				break
			}
			if (!this.createFormattingTemplate(format)) {
				continue
			}
			this.chosenFormat = format
			// With a new formatting template, the matched position
			// using the old template needs to be reset.
			this.populatedNationalNumberTemplatePosition = -1
			break
		}
		if (!this.chosenFormat) {
			// No format matches the national phone number entered.
			this.resetFormat()
		}
		return this.chosenFormat
	}

	// Formats each digit of the national phone number (so far)
	// using the selected format.
	reformatNationalNumber() {
		return this.formatNextNationalNumberDigits(
			this.nationalPrefix + this.nationalNumberDigits
		)
	}

	initializePhoneNumberFormatsForCountry() {
		// Get all "eligible" phone number formats for this country
		this.matchingFormats = this.metadata.formats().filter((format) => {
			// Compared to `libphonenumber`'s code, the two "Discard a few formats
			// that we know are not relevant based on the presence of the national prefix"
			// checks have changed: the first one has been moved to `.matchFormats()`,
			// and the second one doesn't apply to this library because it doesn't deal with
			// "incomplete" phone numbers (for example, phone numbers, entered without "area code").
			return ELIGIBLE_FORMAT_PATTERN.test(format.internationalFormat())
		})
	}

	matchFormats(leadingDigits) {
		// "leading digits" pattern list starts with a
		// "leading digits" pattern fitting a maximum of 3 leading digits.
		// So, after a user inputs 3 digits of a national (significant) phone number
		// this national (significant) number can already be formatted.
		// The next "leading digits" pattern is for 4 leading digits max,
		// and the "leading digits" pattern after it is for 5 leading digits max, etc.

		// This implementation is different from Google's
		// in that it searches for a fitting format
		// even if the user has entered less than
		// `MIN_LEADING_DIGITS_LENGTH` digits of a national number.
		// Because some leading digit patterns already match for a single first digit.
		let leadingDigitsPatternIndex = leadingDigits.length - MIN_LEADING_DIGITS_LENGTH
		if (leadingDigitsPatternIndex < 0) {
			leadingDigitsPatternIndex = 0
		}

		this.matchingFormats = this.matchingFormats.filter((format) => {
			// If national prefix is mandatory for this phone number format
			// and the user didn't input the national prefix
			// then this phone number format isn't suitable.
			if (!this.isInternational() && !this.nationalPrefix && format.nationalPrefixIsMandatoryWhenFormattingInNationalFormat()) {
				return false
			}
			const leadingDigitsPatternsCount = format.leadingDigitsPatterns().length
			// If this format is not restricted to a certain
			// leading digits pattern then it fits.
			if (leadingDigitsPatternsCount === 0) {
				return true
			}
			// Start excluding any non-matching formats only when the
			// national number entered so far is at least 3 digits long,
			// otherwise format matching would give false negatives.
			// For example, when the digits entered so far are `2`
			// and the leading digits pattern is `21` –
			// it's quite obvious in this case that the format could be the one
			// but due to the absence of further digits it would give false negative.
			if (leadingDigits.length < MIN_LEADING_DIGITS_LENGTH) {
				return true
			}
			// If at least `MIN_LEADING_DIGITS_LENGTH` digits of a national number are available
			// then format matching starts narrowing down the list of possible formats
			// (only previously matched formats are considered for next digits).
			leadingDigitsPatternIndex = Math.min(leadingDigitsPatternIndex, leadingDigitsPatternsCount - 1)
			const leadingDigitsPattern = format.leadingDigitsPatterns()[leadingDigitsPatternIndex]
			// Brackets are required for `^` to be applied to
			// all or-ed (`|`) parts, not just the first one.
			return new RegExp(`^(${leadingDigitsPattern})`).test(leadingDigits)
		})

		// If there was a phone number format chosen
		// and it no longer holds given the new leading digits then reset it.
		// The test for this `if` condition is marked as:
		// "Reset a chosen format when it no longer holds given the new leading digits".
		// To construct a valid test case for this one can find a country
		// in `PhoneNumberMetadata.xml` yielding one format for 3 `<leadingDigits>`
		// and yielding another format for 4 `<leadingDigits>` (Australia in this case).
		if (this.chosenFormat && this.matchingFormats.indexOf(this.chosenFormat) === -1) {
			this.resetFormat()
		}
	}

	getSeparatorAfterNationalPrefix(format) {
		if (this.metadata.countryCallingCode() === '1') {
			return ' '
		}
		if (format &&
			format.nationalPrefixFormattingRule() &&
			NATIONAL_PREFIX_SEPARATORS_PATTERN.test(format.nationalPrefixFormattingRule())) {
			return ' '
		}
		return ''
	}

	// This is in accordance to how Google's `libphonenumber` does it.
	// "Check to see if there is an exact pattern match for these digits.
	// If so, we should use this instead of any other formatting template
	// whose `leadingDigitsPattern` also matches the input."
	attemptToFormatCompletePhoneNumber() {
		for (const format of this.matchingFormats) {
			const matcher = new RegExp(`^(?:${format.pattern()})$`)
			if (!matcher.test(this.nationalNumberDigits)) {
				continue
			}
			// Here, national number is formatted without "national prefix
			// formatting rule", because otherwise there'd be a bug
			// when "area code" is "duplicated" during input:
			// https://github.com/catamphetamine/libphonenumber-js/issues/318
			let formattedNationalNumber = formatNationalNumberUsingFormat(
				this.nationalNumberDigits,
				format,
				this.isInternational(),
				false, // Don't prepend national prefix (it will be prepended manually).
				this.metadata
			)
			// Check if this `format` preserves all digits.
			// This is how it's done in Google's `libphonenumber`.
			// Also, it fixes the bug when "area code" is "duplicated" during input:
			// https://github.com/catamphetamine/libphonenumber-js/issues/318
			//
			// "Check that we didn't remove nor add any extra digits when we matched
			// this formatting pattern. This usually happens after we entered the last
			// digit during AYTF. Eg: In case of MX, we swallow mobile token (1) when
			// formatted but AYTF should retain all the number entered and not change
			// in order to match a format (of same leading digits and length) display
			// in that way."
			// "If it's the same (i.e entered number and format is same), then it's
			// safe to return this in formatted number as nothing is lost / added."
			// Otherwise, don't use this format.
			// https://github.com/google/libphonenumber/commit/3e7c1f04f5e7200f87fb131e6f85c6e99d60f510#diff-9149457fa9f5d608a11bb975c6ef4bc5
			// https://github.com/google/libphonenumber/commit/3ac88c7106e7dcb553bcc794b15f19185928a1c6#diff-2dcb77e833422ee304da348b905cde0b
			//
			if (parseDigits(formattedNationalNumber) !== this.nationalNumberDigits) {
				continue
			}
			// Prepend national prefix (if any).
			if (this.nationalPrefix) {
				// Here, national number is formatted with "national prefix
				// formatting rule". The reason is that "national prefix
				// formatting rule" often adds parentheses, and while Google's
				// `libphonenumber` dismisses those preferring simply prepending
				// national prefix followed by a " " character, this library
				// looks if the national prefix could be formatted better.
				const formattedNationalNumberWithNationalPrefix = formatNationalNumberUsingFormat(
					this.nationalNumberDigits,
					format,
					this.isInternational(),
					true, // Prepend national prefix.
					this.metadata
				)
				if (parseDigits(formattedNationalNumberWithNationalPrefix) === this.nationalPrefix + this.nationalNumberDigits) {
					formattedNationalNumber = formattedNationalNumberWithNationalPrefix
				} else {
					formattedNationalNumber = this.nationalPrefix +
						this.getSeparatorAfterNationalPrefix(format) +
						formattedNationalNumber
				}
			}

			// formats national number (probably) without national prefix.
			// Formatting a national number with national prefix could result in
			// bugs when "area code" is "duplicated" during input:
			// https://github.com/catamphetamine/libphonenumber-js/issues/318
			// The "are all digits preserved" check fixes that type of bug.

			// To leave the formatter in a consistent state
			this.resetFormat()
			this.chosenFormat = format
			// Set `this.template` and `this.populatedNationalNumberTemplate`.
			/* istanbul ignore else */
			if (this.createFormattingTemplate(format)) {
				// Populate `this.populatedNationalNumberTemplate` with phone number digits.
				this.reformatNationalNumber()
			} else {
				// If the formatting template couldn't be created for a format,
				// create it manually from the formatted phone number.
				// This case doesn't ever happen with the current metadata.
				this.template = this.getFullNumber(formattedNationalNumber).replace(/[\d\+]/g, DIGIT_PLACEHOLDER)
				this.populatedNationalNumberTemplate = formattedNationalNumber
				this.populatedNationalNumberTemplatePosition = this.populatedNationalNumberTemplate.length - 1
			}
			return formattedNationalNumber
		}
	}

	getInternationalPrefix(options) {
		return this.internationalPrefix ? (
			options && options.spacing === false ? this.internationalPrefix : this.internationalPrefix + ' '
		) : '+'
	}

	// Prepends `+CountryCode ` in case of an international phone number
	getFullNumber(formattedNationalNumber) {
		if (this.isInternational()) {
			const prefix = this.getInternationalPrefix()
			if (!this.countryCallingCode) {
				return `${prefix}${this.digits}`
			}
			if (!formattedNationalNumber) {
				return `${prefix}${this.countryCallingCode}`
			}
			return `${prefix}${this.countryCallingCode} ${formattedNationalNumber}`
		}
		return formattedNationalNumber
	}

	getNonFormattedNationalNumber() {
		return this.nationalPrefix +
			(this.nationalPrefix && this.nationalNumberDigits && this.getSeparatorAfterNationalPrefix()) +
			this.nationalNumberDigits
	}

	// Extracts the country calling code from the beginning
	// of the entered `national_number` (so far),
	// and places the remaining input into the `national_number`.
	extractCountryCallingCode() {
		const {
			countryCallingCode,
			number
		} = extractCountryCallingCode(
			'+' + this.digits,
			this.defaultCountry,
			this.defaultCallingCode,
			this.metadata.metadata
		)
		if (!countryCallingCode) {
			return
		}
		this.nationalNumberDigits = number
		this.countryCallingCode = countryCallingCode
		this.metadata.chooseCountryByCountryCallingCode(countryCallingCode)
		this.initializePhoneNumberFormatsForCountry()
		this.resetFormat()
		return this.metadata.hasSelectedNumberingPlan()
	}

	extractNationalPrefix() {
		this.nationalPrefix = ''
		if (!this.metadata.hasSelectedNumberingPlan()) {
			return
		}
		// Only strip national prefixes for non-international phone numbers
		// because national prefixes can't be present in international phone numbers.
		// While `parseNumber()` is forgiving is such cases, `AsYouType` is not.
		const {
			nationalNumber,
			carrierCode
		} = stripNationalPrefixAndCarrierCode(
			this.nationalNumberDigits,
			this.metadata
		)
		// Sometimes `stripNationalPrefixAndCarrierCode()` won't actually
		// strip national prefix and will instead prepend some digits to the `number`:
		// for example, when number `2345678` is passed with `VI` country selected,
		// it will return `{ number: "3402345678" }`, because `340` area code is prepended.
		// So check if the `nationalNumber` is actually at the end of `this.nationalNumberDigits`.
		if (nationalNumber) {
			const index = this.nationalNumberDigits.indexOf(nationalNumber)
			if (index < 0 || index !== this.nationalNumberDigits.length - nationalNumber.length) {
				return
			}
		}
		if (carrierCode) {
			this.carrierCode = carrierCode
		}
		this.nationalPrefix = this.nationalNumberDigits.slice(0, this.nationalNumberDigits.length - nationalNumber.length)
		this.nationalNumberDigits = nationalNumber
		return this.nationalPrefix
	}

	// isPossibleNumber(number) {
	// 	switch (checkNumberLengthForType(number, undefined, this.metadata)) {
	// 		case 'IS_POSSIBLE':
	// 			return true
	// 		// case 'IS_POSSIBLE_LOCAL_ONLY':
	// 		// 	return !this.isInternational()
	// 		default:
	// 			return false
	// 	}
	// }

	isCountryCallingCodeAmbiguous() {
		const countryCodes = this.metadata.getCountryCodesForCallingCode(this.countryCallingCode)
		return countryCodes && countryCodes.length > 1
	}

	createFormattingTemplate(format) {
		// The formatter doesn't format numbers when numberPattern contains '|', e.g.
		// (20|3)\d{4}. In those cases we quickly return.
		// (Though there's no such format in current metadata)
		/* istanbul ignore if */
		if (SUPPORT_LEGACY_FORMATTING_PATTERNS && format.pattern().indexOf('|') >= 0) {
			return
		}
		// Get formatting template for this phone number format
		let template = this.getTemplateForNumberFormatPattern(format, this.nationalPrefix)
		// If the national number entered is too long
		// for any phone number format, then abort.
		if (!template) {
			return
		}
		this.template = template
		this.populatedNationalNumberTemplate = template
		// For convenience, the public `.template` property
		// contains the whole international number
		// if the phone number being input is international:
		// 'x' for the '+' sign, 'x'es for the country phone code,
		// a spacebar and then the template for the formatted national number.
		if (this.isInternational()) {
			this.template =
				this.getInternationalPrefix().replace(/[\d\+]/g, DIGIT_PLACEHOLDER) +
				repeat(DIGIT_PLACEHOLDER, this.countryCallingCode.length) +
				' ' +
				template
		}
		return this.template
	}

	/**
	 * Generates formatting template for a national phone number,
	 * optionally containing a national prefix, for a format.
	 * @param  {Format} format
	 * @param  {string} nationalPrefix
	 * @return {string}
	 */
	getTemplateForNumberFormatPattern(format, nationalPrefix) {
		let pattern = format.pattern()

		/* istanbul ignore else */
		if (SUPPORT_LEGACY_FORMATTING_PATTERNS) {
			pattern = pattern
				// Replace anything in the form of [..] with \d
				.replace(CREATE_CHARACTER_CLASS_PATTERN(), '\\d')
				// Replace any standalone digit (not the one in `{}`) with \d
				.replace(CREATE_STANDALONE_DIGIT_PATTERN(), '\\d')
		}

		// Generate a dummy national number (consisting of `9`s)
		// that fits this format's `pattern`.
		//
		// This match will always succeed,
		// because the "longest dummy phone number"
		// has enough length to accomodate any possible
		// national phone number format pattern.
		//
		let digits = LONGEST_DUMMY_PHONE_NUMBER.match(pattern)[0]

		// If the national number entered is too long
		// for any phone number format, then abort.
		if (this.nationalNumberDigits.length > digits.length) {
			return
		}

		// Get a formatting template which can be used to efficiently format
		// a partial number where digits are added one by one.

		// Below `strictPattern` is used for the
		// regular expression (with `^` and `$`).
		// This wasn't originally in Google's `libphonenumber`
		// and I guess they don't really need it
		// because they're not using "templates" to format phone numbers
		// but I added `strictPattern` after encountering
		// South Korean phone number formatting bug.
		//
		// Non-strict regular expression bug demonstration:
		//
		// this.nationalNumberDigits : `111111111` (9 digits)
		//
		// pattern : (\d{2})(\d{3,4})(\d{4})
		// format : `$1 $2 $3`
		// digits : `9999999999` (10 digits)
		//
		// '9999999999'.replace(new RegExp(/(\d{2})(\d{3,4})(\d{4})/g), '$1 $2 $3') = "99 9999 9999"
		//
		// template : xx xxxx xxxx
		//
		// But the correct template in this case is `xx xxx xxxx`.
		// The template was generated incorrectly because of the
		// `{3,4}` variability in the `pattern`.
		//
		// The fix is, if `this.nationalNumberDigits` has already sufficient length
		// to satisfy the `pattern` completely then `this.nationalNumberDigits`
		// is used instead of `digits`.

		const strictPattern = new RegExp('^' + pattern + '$')
		const nationalNumberDummyDigits = this.nationalNumberDigits.replace(/\d/g, DUMMY_DIGIT)

		// If `this.nationalNumberDigits` has already sufficient length
		// to satisfy the `pattern` completely then use it
		// instead of `digits`.
		if (strictPattern.test(nationalNumberDummyDigits)) {
			digits = nationalNumberDummyDigits
		}

		let numberFormat = this.getFormatFormat(format)
		let includesNationalPrefix

		if (nationalPrefix) {
			if (format.nationalPrefixFormattingRule()) {
				const numberFormatWithNationalPrefix = numberFormat.replace(
					FIRST_GROUP_PATTERN,
					format.nationalPrefixFormattingRule()
				)
				if (parseDigits(numberFormatWithNationalPrefix) === nationalPrefix + parseDigits(numberFormat)) {
					numberFormat = numberFormatWithNationalPrefix
					includesNationalPrefix = true
					let i = nationalPrefix.length
					while (i > 0) {
						numberFormat = numberFormat.replace(/\d/, DIGIT_PLACEHOLDER)
						i--
					}
				}
			}
		}

		// Generate formatting template for this phone number format.
		let template = digits
			// Format the dummy phone number according to the format.
			.replace(new RegExp(pattern), numberFormat)
			// Replace each dummy digit with a DIGIT_PLACEHOLDER.
			.replace(new RegExp(DUMMY_DIGIT, 'g'), DIGIT_PLACEHOLDER)

		if (nationalPrefix) {
			if (!includesNationalPrefix) {
				// Prepend national prefix to the template manually.
				template = repeat(DIGIT_PLACEHOLDER, nationalPrefix.length) +
					this.getSeparatorAfterNationalPrefix(format) +
					template
			}
		}

		return template
	}

	formatNextNationalNumberDigits(digits) {
		// Using `.split('')` to iterate through a string here
		// to avoid requiring `Symbol.iterator` polyfill.
		// `.split('')` is generally not safe for Unicode,
		// but in this particular case for `digits` it is safe.
		// for (const digit of digits)
		for (const digit of digits.split('')) {
			// If there is room for more digits in current `template`,
			// then set the next digit in the `template`,
			// and return the formatted digits so far.
			// If more digits are entered than the current format could handle.
			if (this.populatedNationalNumberTemplate.slice(this.populatedNationalNumberTemplatePosition + 1).search(DIGIT_PLACEHOLDER_MATCHER) < 0) {
				// Reset the format.
				this.resetFormat()
				return
			}

			this.populatedNationalNumberTemplatePosition = this.populatedNationalNumberTemplate.search(DIGIT_PLACEHOLDER_MATCHER)
			this.populatedNationalNumberTemplate = this.populatedNationalNumberTemplate.replace(DIGIT_PLACEHOLDER_MATCHER, digit)
		}

		// Return the formatted phone number so far.
		return cutAndStripNonPairedParens(this.populatedNationalNumberTemplate, this.populatedNationalNumberTemplatePosition + 1)

		// The old way which was good for `input-format` but is not so good
		// for `react-phone-number-input`'s default input (`InputBasic`).
		// return closeNonPairedParens(this.populatedNationalNumberTemplate, this.populatedNationalNumberTemplatePosition + 1)
		// 	.replace(new RegExp(DIGIT_PLACEHOLDER, 'g'), ' ')
	}

	getFormatFormat(format) {
		if (this.isInternational()) {
			return applyInternationalSeparatorStyle(format.internationalFormat())
		}
		return format.format()
	}

	// Determines the country of the phone number
	// entered so far based on the country phone code
	// and the national phone number.
	determineTheCountry() {
		this.country = findCountryCode(
			this.isInternational() ? this.countryCallingCode : this.defaultCallingCode,
			this.nationalNumberDigits,
			this.metadata
		)
	}

	/**
	 * Returns an instance of `PhoneNumber` class.
	 * Will return `undefined` if no national (significant) number
	 * digits have been entered so far, or if no `defaultCountry` has been
	 * set and the user enters a phone number not in international format.
	 */
	getNumber() {
		if (this.isInternational()) {
			if (!this.countryCallingCode) {
				return
			}
		} else {
			if (!this.country && !this.defaultCallingCode) {
				return
			}
		}
		if (!this.nationalNumberDigits) {
			return undefined
		}
		let countryCode = this.getCountry()
		const callingCode = this.getCountryCallingCode() || this.defaultCallingCode
		let nationalNumber = this.nationalNumberDigits
		let carrierCode = this.carrierCode
		// When an international number without a leading `+` has been autocorrected,
		// extract country calling code, because normally it's only extracted
		// for international numbers with a leading `+`.
		// Could also just use `parsePhoneNumberFromString()` here
		// instead of hacking around this single case.
		if (!this.isInternational() && this.nationalNumberDigits === this.digits) {
			const {
				countryCallingCode,
				number
			} = extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(
				this.digits,
				countryCode,
				callingCode,
				this.metadata.metadata
			)
			if (countryCallingCode) {
				const {
					nationalNumber: shorterNationalNumber,
					carrierCode: newCarrierCode
				} = stripNationalPrefixAndCarrierCodeFromCompleteNumber(
					number,
					this.metadata
				)
				nationalNumber = shorterNationalNumber
				carrierCode = newCarrierCode
			}
		}
		const phoneNumber = new PhoneNumber(
			countryCode || callingCode,
			nationalNumber,
			this.metadata.metadata
		)
		if (carrierCode) {
			phoneNumber.carrierCode = carrierCode
		}
		// Phone number extensions are not supported by "As You Type" formatter.
		return phoneNumber
	}

	/**
	 * Returns `true` if the phone number is "possible".
	 * Is just a shortcut for `PhoneNumber.isPossible()`.
	 * @return {boolean}
	 */
	isPossible() {
		const phoneNumber = this.getNumber()
		if (!phoneNumber) {
			return false
		}
		return phoneNumber.isPossible()
	}

	/**
	 * Returns `true` if the phone number is "valid".
	 * Is just a shortcut for `PhoneNumber.isValid()`.
	 * @return {boolean}
	 */
	isValid() {
		const phoneNumber = this.getNumber()
		if (!phoneNumber) {
			return false
		}
		return phoneNumber.isValid()
	}

	/**
	 * @deprecated
	 * This method is used in `react-phone-number-input/source/input-control.js`
	 * in versions before `3.0.16`.
	 */
	getNationalNumber() {
		return this.nationalNumberDigits
	}

	getNonFormattedTemplate() {
		return this.getFullNumber(this.getNonFormattedNationalNumber())
			.replace(/[\+\d]/g, DIGIT_PLACEHOLDER)
	}

	/**
	 * Returns formatted phone number template.
	 * @return {string} [template]
	 */
	getTemplate() {
		if (!this.template) {
			return this.getNonFormattedTemplate()
		}
		let index = -1
		let i = 0
		while (i < (this.isInternational() ? this.getInternationalPrefix({ spacing: false }).length : 0) + this.digits.length) {
			index = this.template.indexOf(DIGIT_PLACEHOLDER, index + 1)
			i++
		}
		return cutAndStripNonPairedParens(this.template, index + 1)
	}
}

export function stripNonPairedParens(string) {
	const dangling_braces =[]
	let i = 0
	while (i < string.length) {
		if (string[i] === '(') {
			dangling_braces.push(i)
		}
		else if (string[i] === ')') {
			dangling_braces.pop()
		}
		i++
	}
	let start = 0
	let cleared_string = ''
	dangling_braces.push(string.length)
	for (const index of dangling_braces) {
		cleared_string += string.slice(start, index)
		start = index + 1
	}
	return cleared_string
}

export function cutAndStripNonPairedParens(string, cutBeforeIndex) {
	if (string[cutBeforeIndex] === ')') {
		cutBeforeIndex++
	}
	return stripNonPairedParens(string.slice(0, cutBeforeIndex))
}

export function closeNonPairedParens(template, cut_before) {
	const retained_template = template.slice(0, cut_before)
	const opening_braces = countOccurences('(', retained_template)
	const closing_braces = countOccurences(')', retained_template)
	let dangling_braces = opening_braces - closing_braces
	while (dangling_braces > 0 && cut_before < template.length) {
		if (template[cut_before] === ')') {
			dangling_braces--
		}
		cut_before++
	}
	return template.slice(0, cut_before)
}

// Counts all occurences of a symbol in a string.
// Unicode-unsafe (because using `.split()`).
export function countOccurences(symbol, string) {
	let count = 0
	// Using `.split('')` to iterate through a string here
	// to avoid requiring `Symbol.iterator` polyfill.
	// `.split('')` is generally not safe for Unicode,
	// but in this particular case for counting brackets it is safe.
	// for (const character of string)
	for (const character of string.split('')) {
		if (character === symbol) {
			count++
		}
	}
	return count
}

// Repeats a string (or a symbol) N times.
// http://stackoverflow.com/questions/202605/repeat-string-javascript
export function repeat(string, times) {
	if (times < 1) {
		return ''
	}
	let result = ''
	while (times > 1) {
		if (times & 1) {
			result += string
		}
		times >>= 1
		string += string
	}
	return result + string
}

/**
 * Extracts formatted phone number from text (if there's any).
 * @param  {string} text
 * @return {string} [formattedPhoneNumber]
 */
function extractFormattedPhoneNumber(text) {
	// Attempt to extract a possible number from the string passed in.
	const startsAt = text.search(VALID_PHONE_NUMBER)
	if (startsAt < 0) {
		return
	}
	// Trim everything to the left of the phone number.
	text = text.slice(startsAt)
	// Trim the `+`.
	let hasPlus
	if (text[0] === '+') {
		hasPlus = true
		text = text.slice('+'.length)
	}
	// Trim everything to the right of the phone number.
	text = text.replace(AFTER_PHONE_NUMBER_DIGITS_END_PATTERN, '')
	// Re-add the previously trimmed `+`.
	if (hasPlus) {
		text = '+' + text
	}
	return text
}