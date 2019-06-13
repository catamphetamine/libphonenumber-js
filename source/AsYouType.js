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
	extract_formatted_phone_number,
	find_country_code,
	strip_national_prefix_and_carrier_code
} from './parse_'

import {
	FIRST_GROUP_PATTERN,
	format_national_number_using_format,
	changeInternationalFormatStyle
} from './format_'

import { checkNumberLengthForType } from './getNumberType_'

import parseIncompletePhoneNumber from './parseIncompletePhoneNumber'

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
const ELIGIBLE_FORMAT_PATTERN = new RegExp
(
	'^' +
	'[' + VALID_PUNCTUATION + ']*' +
	'(\\$\\d[' + VALID_PUNCTUATION + ']*)+' +
	'$'
)

// This is the minimum length of the leading digits of a phone number
// to guarantee the first "leading digits pattern" for a phone number format
// to be preemptive.
const MIN_LEADING_DIGITS_LENGTH = 3

const VALID_INCOMPLETE_PHONE_NUMBER =
	'[' + PLUS_CHARS + ']{0,1}' +
	'[' +
		VALID_PUNCTUATION +
		VALID_DIGITS +
	']*'

const VALID_INCOMPLETE_PHONE_NUMBER_PATTERN = new RegExp('^' + VALID_INCOMPLETE_PHONE_NUMBER + '$', 'i')

export default class AsYouType
{
	// Not setting `options` to a constructor argument
	// not to break backwards compatibility
	// for older versions of the library.
	options = {}

	/**
	 * @param {string?} [defaultCountry] - The default country used for parsing non-international phone numbers.
	 * @param {Object} metadata
	 */
	constructor(defaultCountry, metadata)
	{
		this.metadata = new Metadata(metadata)

		if (defaultCountry && this.metadata.hasCountry(defaultCountry)) {
			this.defaultCountry = defaultCountry
		}

		this.reset()
	}

	input(text)
	{
		// Parse input

		let extracted_number = extract_formatted_phone_number(text) || ''

		// Special case for a lone '+' sign
		// since it's not considered a possible phone number.
		if (!extracted_number)
		{
			if (text && text.indexOf('+') >= 0)
			{
				extracted_number = '+'
			}
		}

		// Validate possible first part of a phone number
		if (!VALID_INCOMPLETE_PHONE_NUMBER_PATTERN.test(extracted_number))
		{
			return this.currentOutput
		}

		return this.processInput(parseIncompletePhoneNumber(extracted_number))
	}

	processInput(input)
	{
		// If an out of position '+' sign detected
		// (or a second '+' sign),
		// then just drop it from the input.
		if (input[0] === '+')
		{
			if (!this.parsedInput)
			{
				this.parsedInput += '+'

				// If a default country was set
				// then reset it because an explicitly international
				// phone number is being entered
				this.resetCountriness()
			}

			input = input.slice(1)
		}

		// Raw phone number
		this.parsedInput += input

		// // Reset phone number validation state
		// this.valid = false

		// Add digits to the national number
		this.nationalNumber += input

		// TODO: Deprecated: rename `this.nationalNumber`
		// to `this.nationalNumber` and remove `.getNationalNumber()`.

		// Try to format the parsed input

		if (this.isInternational())
		{
			if (!this.countryCallingCode)
			{
				// Extract country calling code from the digits entered so far.

				// There must be some digits in order to extract anything from them.
				if (!this.nationalNumber)
				{
					// Return raw phone number
					return this.parsedInput
				}

				// If one looks at country phone codes
				// then he can notice that no one country phone code
				// is ever a (leftmost) substring of another country phone code.
				// So if a valid country code is extracted so far
				// then it means that this is the country code.

				// If no country phone code could be extracted so far,
				// then just return the raw phone number,
				// because it has no way of knowing
				// how to format the phone number so far.
				if (!this.extractCountryCallingCode())
				{
					// Return raw phone number
					return this.parsedInput
				}

				// Initialize country-specific data
				this.initialize_phone_number_formats_for_this_country_calling_code()
				this.resetFormat()
				this.determineTheCountry()
			}
			// `this.country` could be `undefined`,
			// for instance, when there is ambiguity
			// in a form of several different countries
			// each corresponding to the same country phone code
			// (e.g. NANPA: USA, Canada, etc),
			// and there's not enough digits entered
			// to reliably determine the country
			// the phone number belongs to.
			// Therefore, in cases of such ambiguity,
			// each time something is input,
			// try to determine the country
			// (if it's not determined yet).
			else if (!this.country)
			{
				this.determineTheCountry()
			}
		}
		else
		{
			// Some national prefixes are substrings of other national prefixes
			// (for the same country), therefore try to extract national prefix each time
			// because a longer national prefix might be available at some point in time.

			const previous_national_prefix = this.nationalPrefix
			this.nationalNumber = this.nationalPrefix + this.nationalNumber

			// Possibly extract a national prefix
			this.extractNationalPrefix()

			if (this.nationalPrefix !== previous_national_prefix)
			{
				// National number has changed
				// (due to another national prefix been extracted)
				// therefore national number has changed
				// therefore reset all previous formatting data.
				// (and leading digits matching state)
				this.matching_formats = undefined
				this.resetFormat()
			}
		}

		// if (!this.shouldFormat())
		// {
		// 	return this.format_as_non_formatted_number()
		// }

		if (!this.nationalNumber)
		{
			return this.format_as_non_formatted_number()
		}

		// Check the available phone number formats
		// based on the currently available leading digits.
		this.match_formats_by_leading_digits()

		// Format the phone number (given the next digits)
		const formatted_national_phone_number = this.formatNationalNumber(input)

		// If the phone number could be formatted,
		// then return it, possibly prepending with country phone code
		// (for international phone numbers only)
		if (formatted_national_phone_number)
		{
			return this.formatFullNumber(formatted_national_phone_number)
		}

		// If the phone number couldn't be formatted,
		// then just fall back to the raw phone number.
		return this.format_as_non_formatted_number()
	}

	format_as_non_formatted_number()
	{
		// Strip national prefix for incorrectly inputted international phones.
		if (this.isInternational() && this.countryCallingCode)
		{
			return `+${this.countryCallingCode}${this.nationalNumber}`
		}

		return this.parsedInput
	}

	formatNationalNumber(next_digits)
	{
		// Format the next phone number digits
		// using the previously chosen phone number format.
		//
		// This is done here because if `attempt_to_format_complete_phone_number`
		// was placed before this call then the `template`
		// wouldn't reflect the situation correctly (and would therefore be inconsistent)
		//
		let national_number_formatted_with_previous_format
		if (this.chosenFormat)
		{
			national_number_formatted_with_previous_format = this.formatNextNationalNumberDigits(next_digits)
		}

		// See if the input digits can be formatted properly already. If not,
		// use the results from formatNextNationalNumberDigits(), which does formatting
		// based on the formatting pattern chosen.

		const formatted_number = this.attempt_to_format_complete_phone_number()

		// Just because a phone number doesn't have a suitable format
		// that doesn't mean that the phone is invalid
		// because phone number formats only format phone numbers,
		// they don't validate them and some (rare) phone numbers
		// are meant to stay non-formatted.
		if (formatted_number)
		{
			return formatted_number
		}

		// For some phone number formats national prefix

		// If the previously chosen phone number format
		// didn't match the next (current) digit being input
		// (leading digits pattern didn't match).
		if (this.chooseAnotherFormat())
		{
			// And a more appropriate phone number format
			// has been chosen for these `leading digits`,
			// then format the national phone number (so far)
			// using the newly selected phone number pattern.

			// Will return `undefined` if it couldn't format
			// the supplied national number
			// using the selected phone number pattern.

			return this.reformatNationalNumber()
		}

		// If could format the next (current) digit
		// using the previously chosen phone number format
		// then return the formatted number so far.

		// If no new phone number format could be chosen,
		// and couldn't format the supplied national number
		// using the selected phone number pattern,
		// then it will return `undefined`.

		return national_number_formatted_with_previous_format
	}

	reset()
	{
		// Input stripped of non-phone-number characters.
		// Can only contain a possible leading '+' sign and digits.
		this.parsedInput = ''

		this.currentOutput = ''

		// This contains the national prefix that has been extracted. It contains only
		// digits without formatting.
		this.nationalPrefix = ''

		this.nationalNumber = ''
		this.carrierCode = ''

		this.resetCountriness()

		this.resetFormat()

		return this
	}

	resetCountry()
	{
		if (this.isInternational()) {
			this.country = undefined
		} else {
			this.country = this.defaultCountry
		}
	}

	resetCountriness()
	{
		this.resetCountry()

		if (this.defaultCountry && !this.isInternational())
		{
			this.metadata.country(this.defaultCountry)
			this.countryCallingCode = this.metadata.countryCallingCode()

			this.initialize_phone_number_formats_for_this_country_calling_code()
		}
		else
		{
			this.metadata.country(undefined)
			this.countryCallingCode = undefined

			// "Available formats" are all formats available for the country.
			// "Matching formats" are only formats eligible for the national number being entered.
			this.available_formats = []
			this.matching_formats = undefined
		}
	}

	resetFormat()
	{
		this.chosenFormat = undefined
		this.template = undefined
		this.partially_populated_template = undefined
		this.last_match_position = -1
	}

	// Format each digit of national phone number (so far)
	// using the newly selected phone number pattern.
	reformatNationalNumber()
	{
		// Format each digit of national phone number (so far)
		// using the selected phone number pattern.
		return this.formatNextNationalNumberDigits(this.nationalNumber)
	}

	initialize_phone_number_formats_for_this_country_calling_code()
	{
		// Get all "eligible" phone number formats for this country
		this.available_formats = this.metadata.formats().filter((format) =>
		{
			return ELIGIBLE_FORMAT_PATTERN.test(format.internationalFormat())
		})

		this.matching_formats = undefined
	}

	match_formats_by_leading_digits()
	{
		const leading_digits = this.nationalNumber

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
		// Because some leading digits patterns already match for a single first digit.
		let index_of_leading_digits_pattern = leading_digits.length - MIN_LEADING_DIGITS_LENGTH
		if (index_of_leading_digits_pattern < 0) {
			index_of_leading_digits_pattern = 0
		}

		// "Available formats" are all formats available for the country.
		// "Matching formats" are only formats eligible for the national number being entered.

		// If at least `MIN_LEADING_DIGITS_LENGTH` digits of a national number are available
		// then format matching starts narrowing down the list of possible formats
		// (only previously matched formats are considered for next digits).
		const available_formats = this.had_enough_leading_digits && this.matching_formats || this.available_formats
		this.had_enough_leading_digits = this.shouldFormat()

		this.matching_formats = available_formats.filter((format) =>
		{
			const leading_digits_patterns_count = format.leadingDigitsPatterns().length

			// If this format is not restricted to a certain
			// leading digits pattern then it fits.
			if (leading_digits_patterns_count === 0)
			{
				return true
			}

			const leading_digits_pattern_index = Math.min(index_of_leading_digits_pattern, leading_digits_patterns_count - 1)
			const leading_digits_pattern = format.leadingDigitsPatterns()[leading_digits_pattern_index]

			// Brackets are required for `^` to be applied to
			// all or-ed (`|`) parts, not just the first one.
			return new RegExp(`^(${leading_digits_pattern})`).test(leading_digits)
		})

		// If there was a phone number format chosen
		// and it no longer holds given the new leading digits then reset it.
		// The test for this `if` condition is marked as:
		// "Reset a chosen format when it no longer holds given the new leading digits".
		// To construct a valid test case for this one can find a country
		// in `PhoneNumberMetadata.xml` yielding one format for 3 `<leadingDigits>`
		// and yielding another format for 4 `<leadingDigits>` (Australia in this case).
		if (this.chosenFormat && this.matching_formats.indexOf(this.chosenFormat) === -1)
		{
			this.resetFormat()
		}
	}

	shouldFormat()
	{
		// Start matching any formats at all when the national number
		// entered so far is at least 3 digits long,
		// otherwise format matching would give false negatives
		// like when the digits entered so far are `2`
		// and the leading digits pattern is `21` –
		// it's quite obvious in this case that the format could be the one
		// but due to the absence of further digits it would give false negative.
		//
		// Presumably the limitation of "3 digits min"
		// is imposed to exclude false matches,
		// e.g. when there are two different formats
		// each one fitting one or two leading digits being input.
		// But for this case I would propose a specific `if/else` condition.
		//
		return this.nationalNumber.length >= MIN_LEADING_DIGITS_LENGTH
	}

	// Check to see if there is an exact pattern match for these digits. If so, we
	// should use this instead of any other formatting template whose
	// `leadingDigitsPattern` also matches the input.
	attempt_to_format_complete_phone_number()
	{
		for (const format of this.matching_formats)
		{
			const matcher = new RegExp(`^(?:${format.pattern()})$`)

			if (!matcher.test(this.nationalNumber))
			{
				continue
			}

			if (!this.isFormatApplicable(format))
			{
				continue
			}

			// To leave the formatter in a consistent state
			this.resetFormat()
			this.chosenFormat = format

			let formatted_number = format_national_number_using_format
			(
				this.nationalNumber,
				format,
				this.isInternational(),
				this.nationalPrefix !== '',
				this.metadata
			)

			// Special handling for NANPA countries for AsYouType formatter.
			// Copied from Google's `libphonenumber`:
			// https://github.com/googlei18n/libphonenumber/blob/66986dbbe443ee8450e2b54dcd44ac384b3bbee8/java/libphonenumber/src/com/google/i18n/phonenumbers/AsYouTypeFormatter.java#L535-L573
			if (this.nationalPrefix && this.countryCallingCode === '1') {
				formatted_number = '1 ' + formatted_number
			}

			// Set `this.template` and `this.partially_populated_template`.
			//
			// `else` case doesn't ever happen
			// with the current metadata,
			// but just in case.
			//
			/* istanbul ignore else */
			if (this.createFormattingTemplate(format))
			{
				// Populate `this.partially_populated_template`
				this.reformatNationalNumber()
			}
			else
			{
				// Prepend `+CountryCode` in case of an international phone number
				const full_number = this.formatFullNumber(formatted_number)
				this.template = full_number.replace(/[\d\+]/g, DIGIT_PLACEHOLDER)
				this.partially_populated_template = full_number
			}

			return formatted_number
		}
	}

	// Prepends `+CountryCode` in case of an international phone number
	formatFullNumber(formattedNationalNumber)
	{
		if (this.isInternational()) {
			return `+${this.countryCallingCode} ${formattedNationalNumber}`
		}
		return formattedNationalNumber
	}

	// Extracts the country calling code from the beginning
	// of the entered `national_number` (so far),
	// and places the remaining input into the `national_number`.
	extractCountryCallingCode()
	{
		const { countryCallingCode, number } = extractCountryCallingCode(this.parsedInput, this.defaultCountry, this.metadata.metadata)

		if (!countryCallingCode)
		{
			return
		}

		this.countryCallingCode = countryCallingCode

		// Sometimes people erroneously write national prefix
		// as part of an international number, e.g. +44 (0) ....
		// This violates the standards for international phone numbers,
		// so "As You Type" formatter assumes no national prefix
		// when parsing a phone number starting from `+`.
		// Even if it did attempt to filter-out that national prefix
		// it would look weird for a user trying to enter a digit
		// because from user's perspective the keyboard "wouldn't be working".
		this.nationalNumber = number

		this.metadata.chooseCountryByCountryCallingCode(countryCallingCode)
		return this.metadata.selectedCountry() !== undefined
	}

	extractNationalPrefix()
	{
		this.nationalPrefix = ''

		if (!this.metadata.selectedCountry()) {
			return
		}

		// Only strip national prefixes for non-international phone numbers
		// because national prefixes can't be present in international phone numbers.
		// While `parseNumber()` is forgiving is such cases, `AsYouType` is not.
		const { number: potential_national_number, carrierCode } = strip_national_prefix_and_carrier_code(this.nationalNumber, this.metadata)

		if (carrierCode) {
			this.carrierCode = carrierCode
		}

		// We require that the NSN remaining after stripping the national prefix and
		// carrier code be long enough to be a possible length for the region.
		// Otherwise, we don't do the stripping, since the original number could be
		// a valid short number.
		if (!this.metadata.possibleLengths() ||
			this.isPossibleNumber(this.nationalNumber) &&
			!this.isPossibleNumber(potential_national_number))
		{
			// Verify the parsed national (significant) number for this country
			//
			// If the original number (before stripping national prefix) was viable,
			// and the resultant number is not, then prefer the original phone number.
			// This is because for some countries (e.g. Russia) the same digit could be both
			// a national prefix and a leading digit of a valid national phone number,
			// like `8` is the national prefix for Russia and both
			// `8 800 555 35 35` and `800 555 35 35` are valid numbers.
			if (matchesEntirely(this.nationalNumber, this.metadata.nationalNumberPattern()) &&
				!matchesEntirely(potential_national_number, this.metadata.nationalNumberPattern()))
			{
				return
			}
		}

		this.nationalPrefix = this.nationalNumber.slice(0, this.nationalNumber.length - potential_national_number.length)
		this.nationalNumber = potential_national_number

		return this.nationalPrefix
	}

	isPossibleNumber(number)
	{
		const validation_result = checkNumberLengthForType(number, undefined, this.metadata)
		switch (validation_result)
		{
			case 'IS_POSSIBLE':
				return true
			// case 'IS_POSSIBLE_LOCAL_ONLY':
			// 	return !this.isInternational()
			default:
				return false
		}
	}

	chooseAnotherFormat()
	{
		// When there are multiple available formats, the formatter uses the first
		// format where a formatting template could be created.
		for (const format of this.matching_formats)
		{
			// If this format is currently being used
			// and is still possible, then stick to it.
			if (this.chosenFormat === format) {
				return
			}

			// If this `format` is suitable for "as you type",
			// then extract the template from this format
			// and use it to format the phone number being input.

			if (!this.isFormatApplicable(format)) {
				continue
			}

			if (!this.createFormattingTemplate(format)) {
				continue
			}

			this.chosenFormat = format

			// With a new formatting template, the matched position
			// using the old template needs to be reset.
			this.last_match_position = -1

			return true
		}

		// No format matches the phone number,
		// therefore set `country` to `undefined`
		// (or to the default country).
		this.resetCountry()

		// No format matches the national phone number entered
		this.resetFormat()
	}

	isFormatApplicable(format)
	{
		// If national prefix is mandatory for this phone number format
		// and the user didn't input the national prefix
		// then this phone number format isn't suitable.
		if (!this.isInternational() && !this.nationalPrefix && format.nationalPrefixIsMandatoryWhenFormatting()) {
			return false
		}
		// If this format doesn't use national prefix
		// but the user did input national prefix
		// then this phone number format isn't suitable.
		if (this.nationalPrefix && !format.usesNationalPrefix() && !format.nationalPrefixIsOptionalWhenFormatting()) {
			return false
		}
		return true
	}

	createFormattingTemplate(format)
	{
		// The formatter doesn't format numbers when numberPattern contains '|', e.g.
		// (20|3)\d{4}. In those cases we quickly return.
		// (Though there's no such format in current metadata)
		/* istanbul ignore if */
		if (SUPPORT_LEGACY_FORMATTING_PATTERNS && format.pattern().indexOf('|') >= 0) {
			return
		}

		// Get formatting template for this phone number format
		const template = this.getTemplateForNumberFormatPattern(format)

		// If the national number entered is too long
		// for any phone number format, then abort.
		if (!template) {
			return
		}

		// This one is for national number only
		this.partially_populated_template = template

		// For convenience, the public `.template` property
		// contains the whole international number
		// if the phone number being input is international:
		// 'x' for the '+' sign, 'x'es for the country phone code,
		// a spacebar and then the template for the formatted national number.
		if (this.isInternational()) {
			this.template = DIGIT_PLACEHOLDER + repeat(DIGIT_PLACEHOLDER, this.countryCallingCode.length) + ' ' + template
		}
		// For local numbers, replace national prefix
		// with a digit placeholder.
		else {
			this.template = template.replace(/\d/g, DIGIT_PLACEHOLDER)
		}

		// This one is for the full phone number
		return this.template
	}

	// Generates formatting template for a phone number format
	getTemplateForNumberFormatPattern(format)
	{
		// A very smart trick by the guys at Google
		let number_pattern = format.pattern()

		/* istanbul ignore else */
		if (SUPPORT_LEGACY_FORMATTING_PATTERNS)
		{
			number_pattern = number_pattern
				// Replace anything in the form of [..] with \d
				.replace(CREATE_CHARACTER_CLASS_PATTERN(), '\\d')
				// Replace any standalone digit (not the one in `{}`) with \d
				.replace(CREATE_STANDALONE_DIGIT_PATTERN(), '\\d')
		}

		// This match will always succeed,
		// because the "longest dummy phone number"
		// has enough length to accomodate any possible
		// national phone number format pattern.
		let dummy_phone_number_matching_format_pattern = LONGEST_DUMMY_PHONE_NUMBER.match(number_pattern)[0]

		// If the national number entered is too long
		// for any phone number format, then abort.
		if (this.nationalNumber.length > dummy_phone_number_matching_format_pattern.length) {
			return
		}

		// Prepare the phone number format
		const number_format = this.getFormatFormat(format)

		// Get a formatting template which can be used to efficiently format
		// a partial number where digits are added one by one.

		// Below `strict_pattern` is used for the
		// regular expression (with `^` and `$`).
		// This wasn't originally in Google's `libphonenumber`
		// and I guess they don't really need it
		// because they're not using "templates" to format phone numbers
		// but I added `strict_pattern` after encountering
		// South Korean phone number formatting bug.
		//
		// Non-strict regular expression bug demonstration:
		//
		// this.nationalNumber : `111111111` (9 digits)
		//
		// number_pattern : (\d{2})(\d{3,4})(\d{4})
		// number_format : `$1 $2 $3`
		// dummy_phone_number_matching_format_pattern : `9999999999` (10 digits)
		//
		// '9999999999'.replace(new RegExp(/(\d{2})(\d{3,4})(\d{4})/g), '$1 $2 $3') = "99 9999 9999"
		//
		// template : xx xxxx xxxx
		//
		// But the correct template in this case is `xx xxx xxxx`.
		// The template was generated incorrectly because of the
		// `{3,4}` variability in the `number_pattern`.
		//
		// The fix is, if `this.nationalNumber` has already sufficient length
		// to satisfy the `number_pattern` completely then `this.nationalNumber` is used
		// instead of `dummy_phone_number_matching_format_pattern`.

		const strict_pattern = new RegExp('^' + number_pattern + '$')
		const national_number_dummy_digits = this.nationalNumber.replace(/\d/g, DUMMY_DIGIT)

		// If `this.nationalNumber` has already sufficient length
		// to satisfy the `number_pattern` completely then use it
		// instead of `dummy_phone_number_matching_format_pattern`.
		if (strict_pattern.test(national_number_dummy_digits)) {
			dummy_phone_number_matching_format_pattern = national_number_dummy_digits
		}

		// Generate formatting template for this phone number format
		return dummy_phone_number_matching_format_pattern
			// Format the dummy phone number according to the format
			.replace(new RegExp(number_pattern), number_format)
			// Replace each dummy digit with a DIGIT_PLACEHOLDER
			.replace(new RegExp(DUMMY_DIGIT, 'g'), DIGIT_PLACEHOLDER)
	}

	formatNextNationalNumberDigits(digits)
	{
		// Using `.split('')` to iterate through a string here
		// to avoid requiring `Symbol.iterator` polyfill.
		// `.split('')` is generally not safe for Unicode,
		// but in this particular case for `digits` it is safe.
		// for (const digit of digits)
		for (const digit of digits.split(''))
		{
			// If there is room for more digits in current `template`,
			// then set the next digit in the `template`,
			// and return the formatted digits so far.

			// If more digits are entered than the current format could handle
			if (this.partially_populated_template.slice(this.last_match_position + 1).search(DIGIT_PLACEHOLDER_MATCHER) === -1)
			{
				// Reset the current format,
				// so that the new format will be chosen
				// in a subsequent `this.chooseAnotherFormat()` call
				// later in code.
				this.chosenFormat = undefined
				this.template = undefined
				this.partially_populated_template = undefined
				return
			}

			this.last_match_position = this.partially_populated_template.search(DIGIT_PLACEHOLDER_MATCHER)
			this.partially_populated_template = this.partially_populated_template.replace(DIGIT_PLACEHOLDER_MATCHER, digit)
		}

		// Return the formatted phone number so far.
		return cut_stripping_dangling_braces(this.partially_populated_template, this.last_match_position + 1)

		// The old way which was good for `input-format` but is not so good
		// for `react-phone-number-input`'s default input (`InputBasic`).
		// return close_dangling_braces(this.partially_populated_template, this.last_match_position + 1)
		// 	.replace(DIGIT_PLACEHOLDER_MATCHER_GLOBAL, ' ')
	}

	isInternational() {
		return this.parsedInput && this.parsedInput[0] === '+'
	}

	getFormatFormat(format)
	{
		if (this.isInternational()) {
			return changeInternationalFormatStyle(format.internationalFormat())
		}

		// If national prefix formatting rule is set
		// for this phone number format
		if (format.nationalPrefixFormattingRule())
		{
			// If the user did input the national prefix
			// (or if the national prefix formatting rule does not require national prefix)
			// then maybe make it part of the phone number template
			if (this.nationalPrefix || !format.usesNationalPrefix())
			{
				// Make the national prefix part of the phone number template
				return format.format().replace(FIRST_GROUP_PATTERN, format.nationalPrefixFormattingRule())
			}
		}
		// Special handling for NANPA countries for AsYouType formatter.
		// Copied from Google's `libphonenumber`:
		// https://github.com/googlei18n/libphonenumber/blob/66986dbbe443ee8450e2b54dcd44ac384b3bbee8/java/libphonenumber/src/com/google/i18n/phonenumbers/AsYouTypeFormatter.java#L535-L573
		else if (this.countryCallingCode === '1' && this.nationalPrefix === '1') {
			return `1 ${format.format()}`
		}

		return format.format()
	}

	// Determines the country of the phone number
	// entered so far based on the country phone code
	// and the national phone number.
	determineTheCountry() {
		this.country = find_country_code(this.countryCallingCode, this.nationalNumber, this.metadata)
	}

	/**
	 * Returns an instance of `PhoneNumber` class.
	 * Will return `undefined` if no national (significant) number
	 * digits have been entered so far, or if no `defaultCountry` has been
	 * set and the user enters a phone number not in international format.
	 */
	getNumber()
	{
		if (!this.countryCallingCode || !this.nationalNumber) {
			return undefined
		}
		const phoneNumber = new PhoneNumber(this.country || this.countryCallingCode, this.nationalNumber, this.metadata.metadata)
		if (this.carrierCode) {
			phoneNumber.carrierCode = this.carrierCode
		}
		// Phone number extensions are not supported by "As You Type" formatter.
		return phoneNumber
	}

	getNationalNumber() {
		return this.nationalNumber
	}

	getTemplate()
	{
		if (!this.template) {
			return
		}

		let index = -1

		let i = 0
		while (i < this.parsedInput.length)
		{
			index = this.template.indexOf(DIGIT_PLACEHOLDER, index + 1)
			i++
		}

		return cut_stripping_dangling_braces(this.template, index + 1)
	}
}

export function strip_dangling_braces(string)
{
	const dangling_braces =[]
	let i = 0
	while (i < string.length)
	{
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
	for (const index of dangling_braces)
	{
		cleared_string += string.slice(start, index)
		start = index + 1
	}

	return cleared_string
}

export function cut_stripping_dangling_braces(string, cut_before_index)
{
	if (string[cut_before_index] === ')') {
		cut_before_index++
	}
	return strip_dangling_braces(string.slice(0, cut_before_index))
}

export function close_dangling_braces(template, cut_before)
{
	const retained_template = template.slice(0, cut_before)

	const opening_braces = count_occurences('(', retained_template)
	const closing_braces = count_occurences(')', retained_template)

	let dangling_braces = opening_braces - closing_braces
	while (dangling_braces > 0 && cut_before < template.length)
	{
		if (template[cut_before] === ')')
		{
			dangling_braces--
		}
		cut_before++
	}

	return template.slice(0, cut_before)
}

// Counts all occurences of a symbol in a string.
// Unicode-unsafe (because using `.split()`).
export function count_occurences(symbol, string)
{
	let count = 0

	// Using `.split('')` to iterate through a string here
	// to avoid requiring `Symbol.iterator` polyfill.
	// `.split('')` is generally not safe for Unicode,
	// but in this particular case for counting brackets it is safe.
	// for (const character of string)
	for (const character of string.split(''))
	{
		if (character === symbol)
		{
			count++
		}
	}

	return count
}

// Repeats a string (or a symbol) N times.
// http://stackoverflow.com/questions/202605/repeat-string-javascript
export function repeat(string, times)
{
	if (times < 1)
	{
		return ''
	}

	let result = ''

	while (times > 1)
	{
		if (times & 1)
		{
			result += string
		}

		times >>= 1
		string += string
	}

	return result + string
}