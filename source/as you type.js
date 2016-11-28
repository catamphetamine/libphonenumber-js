// This is a port of Google Android `libphonenumber`'s
// `asyoutypeformatter.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/blob/8d21a365061de2ba0675c878a710a7b24f74d2ae/javascript/i18n/phonenumbers/asyoutypeformatter.js

import metadata from '../metadata.min'

import
{
	get_phone_code,
	get_national_prefix,
	get_national_prefix_for_parsing,
	get_formats,
	get_international_formats,
	get_format_pattern,
	get_format_format,
	get_format_international_format,
	get_format_national_prefix_formatting_rule,
	get_format_national_prefix_is_optional_when_formatting,
	get_format_leading_digits_patterns,
	get_metadata_by_country_phone_code
}
from './metadata'

import
{
	VALID_PUNCTUATION,
	PLUS_SIGN,
	PLUS_CHARS,
	VALID_DIGITS,
	extract_formatted_phone_number,
	parse_phone_number,
	parse_phone_number_and_country_phone_code
}
from './parse'

import
{
	matches_entirely
}
from './common'

// The digits that have not been entered yet will be represented by a \u2008,
// the punctuation space.
const DIGIT_PLACEHOLDER = '\u2008'
const DIGIT_PATTERN = new RegExp(DIGIT_PLACEHOLDER)

const SEPARATOR_BEFORE_NATIONAL_NUMBER = ' '

// A pattern that is used to match character classes in regular expressions.
// An example of a character class is [1-4].
const CHARACTER_CLASS_PATTERN = /\[([^\[\]])*\]/g

// Any digit in a regular expression that actually denotes a digit. For
// example, in the regular expression 80[0-2]\d{6,10}, the first 2 digits
// (8 and 0) are standalone digits, but the rest are not.
// Two look-aheads are needed because the number following \\d could be a
// two-digit number, since the phone number can be as long as 15 digits.
const STANDALONE_DIGIT_PATTERN = /\d(?=[^,}][^,}])/g

// A pattern that is used to determine if a numberFormat under availableFormats
// is eligible to be used by the AYTF. It is eligible when the format element
// under numberFormat contains groups of the dollar sign followed by a single
// digit, separated by valid phone number punctuation. This prevents invalid
// punctuation (such as the star sign in Israeli star numbers) getting into the
// output of the AYTF.
const ELIGIBLE_FORMAT_PATTERN = new RegExp
(
    '^' +
    '[' + VALID_PUNCTUATION + ']*' +
    '(\\$\\d[' + VALID_PUNCTUATION + ']*)+' +
    '$'
)

// A set of characters that, if found in a national prefix formatting rules, are
// an indicator to us that we should separate the national prefix from the
// number when formatting.
const NATIONAL_PREFIX_SEPARATORS_PATTERN = /[- ]/

// This is the minimum length of national number accrued that is required to
// trigger the formatter. The first element of the leadingDigitsPattern of
// each numberFormat contains a regular expression that matches up to this
// number of digits.
const MIN_LEADING_DIGITS_LENGTH = 3

// A pattern that is used to determine if the national prefix formatting rule
// has the first group only, i.e., does not start with the national prefix.
// Note that the pattern explicitly allows for unbalanced parentheses.
const FIRST_GROUP_ONLY_PREFIX_PATTERN = /^\(?\$1\)?$/

const VALID_INCOMPLETE_PHONE_NUMBER =
		'[' + PLUS_CHARS + ']{0,1}' +
		'[' +
			VALID_PUNCTUATION +
			VALID_DIGITS +
		']+'

const VALID_INCOMPLETE_PHONE_NUMBER_PATTERN = new RegExp('^' + VALID_INCOMPLETE_PHONE_NUMBER + '$', 'i')

export default class as_you_type
{
	constructor(country_code)
	{
		if (country_code)
		{
			this.country_code = country_code
			this.country_metadata = metadata.countries[country_code]
		}

		this.clear()
	}

	input(text)
	{
		this.original_input += text

		// Parse input

		let extracted_number = extract_formatted_phone_number(text, number => matches_entirely(VALID_INCOMPLETE_PHONE_NUMBER_PATTERN, number))

		let { number, is_international } = parse_phone_number(extracted_number)

		// Special case for just the leading '+'
		if (!extracted_number && text.indexOf('+') >= 0)
		{
			is_international = true
		}

		let parsed_input = ''

		if (is_international)
		{
			parsed_input += '+'
		}

		if (number)
		{
			parsed_input += number
		}

		// Feed the parsed input character-by-character

		for (let character of parsed_input)
		{
			this.current_output = this.input_character(character)
		}

		return this.current_output
	}

	input_character(character)
	{
		if (character === '+')
		{
			// If an out of position '+' sign detected
			// (or a second '+' sign)
			if (this.parsed_input)
			{
				this.able_to_format = false
			}
			else
			{
				this.parsed_input += character
				this.prefix_before_national_number = '+'
			}
		}
		else
		{
			this.parsed_input += character
			this.national_number += character
		}

		// Try to format the parsed input

		if (!this.able_to_format)
		{
			// When we are unable to format because of reasons other than that
			// formatting chars have been entered, it can be due to really long IDDs or
			// NDDs. If that is the case, we might be able to do formatting again after
			// extracting them.
			if (this.is_international())
			{
				if (this.extract_country_phone_code())
				{
					return this.attempt_to_choose_formatting_pattern_with_national_prefix_extracted()
				}
			}
			else if (this.extract_longer_national_prefix())
			{
				// Add an additional space to separate long NDD and national significant
				// number for readability. We don't set shouldAddSpaceAfterNationalPrefix_
				// to true, since we don't want this to change later when we choose
				// formatting templates.
				this.prefix_before_national_number += SEPARATOR_BEFORE_NATIONAL_NUMBER
				return this.attempt_to_choose_formatting_pattern_with_national_prefix_extracted()
			}

			return this.parsed_input
		}

		// We start to attempt to format only when at least MIN_LEADING_DIGITS_LENGTH
		// digits (the plus sign is counted as a digit as well for this purpose) have
		// been entered.

		if (this.parsed_input.length < MIN_LEADING_DIGITS_LENGTH)
		{
			return this.parsed_input
		}

		if (this.parsed_input.length === MIN_LEADING_DIGITS_LENGTH)
		{
			if (this.is_international())
			{
				this.expecting_country_calling_code = true
			}
			else
			{
				// No IDD or plus sign is found, might be entering in national format.
				this.national_prefix = this.extract_national_prefix()
				return this.attempt_to_choose_formatting_pattern()
			}
		}

		if (this.expecting_country_calling_code)
		{
			if (this.extract_country_phone_code())
			{
				this.expecting_country_calling_code = false
			}

			return this.prefix_before_national_number + this.national_number
		}

		if (this.possible_formats.length === 0)
		{
			return this.attempt_to_choose_formatting_pattern()
		}

		// The formatting patterns are already chosen.

		const national_number = this.input_national_number_digit(character)

		// See if the accrued digits can be formatted properly already. If not,
		// use the results from input_national_number_digit(), which does formatting
		// based on the formatting pattern chosen.
		const formatted_number = this.attempt_to_format_complete_phone_number()

		if (formatted_number)
		{
			return formatted_number
		}

		this.narrow_down_possible_formats(this.national_number)

		if (this.refresh_format())
		{
			return this.retype_national_number()
		}

		return this.able_to_format ? this.full_phone_number(national_number) : this.parsed_input
	}

	clear()
	{
		// Input text so far, can contain any characters
		this.original_input = ''

		// Input stripped of non-phone-number characters.
		// Can only contain a possible leading '+' sign and digits.
		this.parsed_input = ''

		this.current_output = ''

		this.expecting_country_calling_code = false

		// This contains anything that has been entered so far preceding the national
		// significant number, and it is formatted (e.g. with space inserted). For
		// example, this can contain IDD, country code, and/or NDD, etc.
		this.prefix_before_national_number = ''

		// This contains the national prefix that has been extracted. It contains only
		// digits without formatting.
		this.national_prefix = ''

		this.should_add_space_after_national_prefix = false

		this.national_number = ''

		this.clear_formatting()
	}

	clear_formatting()
	{
		// This indicates whether AsYouTypeFormatter is currently doing the formatting.
		this.able_to_format = true

		this.possible_formats = []

		this.last_match_position = 0

		this.formatting_template = undefined

		// The pattern from numberFormat that is currently used to create formattingTemplate.
		this.current_formatting_pattern = undefined
	}

	retype_national_number()
	{
		if (!this.national_number)
		{
			return this.prefix_before_national_number
		}

		let national_number
		for (let character of this.national_number)
		{
			national_number = this.input_national_number_digit(character)
		}

		return this.able_to_format ? this.full_phone_number(national_number) : this.parsed_input
	}

	attempt_to_choose_formatting_pattern_with_national_prefix_extracted()
	{
		this.clear_formatting()

		this.expecting_country_calling_code = false

		return this.attempt_to_choose_formatting_pattern()
	}

	attempt_to_choose_formatting_pattern()
	{
		// We start to attempt to format only when at least MIN_LEADING_DIGITS_LENGTH
		// digits of national number (excluding national prefix) have been entered.
		if (this.national_number.length < MIN_LEADING_DIGITS_LENGTH)
		{
			return this.full_phone_number(this.national_number)
		}

		this.refresh_possible_formats(this.national_number)

		// See if the accrued digits can be formatted properly already.
		const formatted_number = this.attempt_to_format_complete_phone_number()

		if (formatted_number)
		{
			return formatted_number
		}

		if (this.refresh_format())
		{
			return this.retype_national_number()
		}

		return this.parsed_input
	}

	refresh_possible_formats(leading_digits)
	{
		if (!this.country_metadata)
		{
			return
		}

		const national_prefix = get_national_prefix(this.country_metadata)

		let formats = get_international_formats(this.country_metadata)

		if (formats.length === 0)
		{
			formats = get_formats(this.country_metadata)
		}

		this.possible_formats = formats.filter((format) =>
		{
			return ELIGIBLE_FORMAT_PATTERN.test(get_format_international_format(format))
		})

		this.narrow_down_possible_formats(leading_digits)
	}

	narrow_down_possible_formats(leading_digits)
	{
		const index_of_leading_digits_pattern = leading_digits.length - MIN_LEADING_DIGITS_LENGTH

		this.possible_formats = this.possible_formats.filter((format) =>
		{
			const leading_digits_pattern_count = get_format_leading_digits_patterns(format).length

			// Keep everything that isn't restricted by leading digits.
			if (leading_digits_pattern_count === 0)
			{
				return true
			}

			const suitable_leading_digits_pattern_index = Math.min(index_of_leading_digits_pattern, leading_digits_pattern_count - 1)
			const leading_digits_pattern = get_format_leading_digits_patterns(format)[suitable_leading_digits_pattern_index]
			return leading_digits.search(leading_digits_pattern) === 0
		})
	}

	// Check to see if there is an exact pattern match for these digits. If so, we
	// should use this instead of any other formatting template whose
	// leadingDigitsPattern also matches the input.
	attempt_to_format_complete_phone_number()
	{
		for (let format of this.possible_formats)
		{
			const pattern = get_format_pattern(format)
			const pattern_matcher = new RegExp('^(?:' + pattern + ')$')

			if (pattern_matcher.test(this.national_number))
			{
				this.should_add_space_after_national_prefix = NATIONAL_PREFIX_SEPARATORS_PATTERN.test(get_format_national_prefix_formatting_rule(format, this.country_metadata))

				const formatted_national_number = this.national_number.replace(new RegExp(pattern, 'g'), this.get_format_format(format))

				return this.full_phone_number(formatted_national_number)
			}
		}
	}

	// Combines the national number with any prefix (IDD/+ and country code or
	// national prefix) that was collected. A space will be inserted between them if
	// the current formatting template indicates this to be suitable.
	full_phone_number(formatted_national_number)
	{
		if (this.should_add_space_after_national_prefix &&
			this.prefix_before_national_number &&
			this.prefix_before_national_number[this.prefix_before_national_number.length - 1] !== SEPARATOR_BEFORE_NATIONAL_NUMBER)
		{
			// We want to add a space after the national prefix if the national prefix
			// formatting rule indicates that this would normally be done, with the
			// exception of the case where we already appended a space because the NDD
			// was surprisingly long.
			return this.prefix_before_national_number +
				SEPARATOR_BEFORE_NATIONAL_NUMBER +
				formatted_national_number
		}

		return this.prefix_before_national_number + formatted_national_number
	}

	// Extracts the country calling code from the beginning of nationalNumber to
	// prefixBeforeNationalNumber when they are available, and places the remaining
	// input into nationalNumber.
	extract_country_phone_code()
	{
		if (!this.national_number)
		{
			return
		}

		const { country_phone_code, number } = parse_phone_number_and_country_phone_code(this.parsed_input)

		if (!country_phone_code)
		{
			return
		}

		// Check country restriction
		if (this.country_code)
		{
			if (country_phone_code !== get_phone_code(this.country_metadata))
			{
				// Invalid country phone code for the
				// international phone number being input.
				return
			}
		}

		this.national_number = number

		this.prefix_before_national_number += country_phone_code + SEPARATOR_BEFORE_NATIONAL_NUMBER

		// When we have successfully extracted the IDD,
		// the previously extracted national prefix
		// should be cleared because it is no longer valid.
		this.national_prefix = ''

		return this.country_metadata = get_metadata_by_country_phone_code(country_phone_code, metadata)
	}

	// Some national prefixes are a substring of others. If extracting the shorter
	// national prefix doesn't result in a number we can format,
	// we try to see if we can extract a longer version here.
	extract_longer_national_prefix()
	{
		if (this.national_prefix)
		{
			// Put the extracted national prefix back to the national number
			// before attempting to extract a new national prefix.
			this.national_number = this.national_prefix + this.national_number

			// Remove the previously extracted national prefix from prefixBeforeNationalNumber. We
			// cannot simply set it to empty string because people sometimes incorrectly
			// enter national prefix after the country code, e.g. +44 (0)20-1234-5678.
			const index_of_previous_national_prefix = this.prefix_before_national_number.lastIndexOf(this.national_prefix)
			this.prefix_before_national_number = this.prefix_before_national_number.slice(0, index_of_previous_national_prefix)
		}

		return this.national_prefix !== this.extract_national_prefix()
	}

	// Returns the national prefix extracted, or an empty string if it is not present.
	extract_national_prefix()
	{
		let national_number_starts_at = 0

		if (this.country_metadata)
		{
			if (this.is_NANPA_number_with_international_prefix())
			{
				national_number_starts_at = 1
				this.prefix_before_national_number += '1' + SEPARATOR_BEFORE_NATIONAL_NUMBER
			}
			else if (get_national_prefix_for_parsing(this.country_metadata))
			{
				var national_prefix_for_parsing = new RegExp('^(?:' + get_national_prefix_for_parsing(this.country_metadata) + ')')
				var matches = this.national_number.match(national_prefix_for_parsing)
				// Since some national prefix patterns are entirely optional, check that a
				// national prefix could actually be extracted.
				if (matches && matches[0])
				{
					national_number_starts_at = matches[0].length
					this.prefix_before_national_number += this.national_number.substring(0, national_number_starts_at)
				}
			}
		}

		this.national_number = this.national_number.slice(national_number_starts_at)
		return this.national_number.slice(0, national_number_starts_at)
	}

	// Returns `true` if the current country is a NANPA country and the
	// national number begins with the national prefix.
	is_NANPA_number_with_international_prefix()
	{
		// For NANPA numbers beginning with 1[2-9], treat the 1 as the national
		// prefix. The reason is that national significant numbers in NANPA always
		// start with [2-9] after the national prefix. Numbers beginning with 1[01]
		// can only be short/emergency numbers, which don't need the national prefix.
		if (get_phone_code(this.country_metadata) !== 1)
		{
			return false
		}

		return this.national_number[0] === '1' &&
			this.national_number[1] !== '0' &&
			this.national_number[1] !== '1'
	}

	refresh_format()
	{
		// When there are multiple available formats, the formatter uses the first
		// format where a formatting template could be created.
		for (let format of this.possible_formats)
		{
			const pattern = get_format_pattern(format)

			if (this.current_formatting_pattern === pattern)
			{
				return false
			}

			if (this.create_formatting_template(format))
			{
				this.current_formatting_pattern = pattern

				this.should_add_space_after_national_prefix = NATIONAL_PREFIX_SEPARATORS_PATTERN.test(get_format_national_prefix_formatting_rule(format, this.country_metadata))

				// With a new formatting template, the matched position using the old
				// template needs to be reset.
				this.last_match_position = 0

				return true
			}
		}

		this.able_to_format = false
	}

	create_formatting_template(format)
	{
		let number_pattern = get_format_pattern(format)

		// The formatter doesn't format numbers when numberPattern contains '|', e.g.
		// (20|3)\d{4}. In those cases we quickly return.
		if (number_pattern.indexOf('|') >= 0)
		{
			return
		}

		number_pattern = number_pattern
			// Replace anything in the form of [..] with \d
			.replace(CHARACTER_CLASS_PATTERN, '\\d')
			// Replace any standalone digit (not the one in d{}) with \d
			.replace(STANDALONE_DIGIT_PATTERN, '\\d')

		return this.formatting_template = this.get_formatting_template(number_pattern, this.get_format_format(format))
	}

	// Gets a formatting template which can be used to efficiently format a
	// partial number where digits are added one by one.
	get_formatting_template(number_pattern, number_format)
	{
		// Creates a phone number consisting only of the digit 9 that matches the
		// numberPattern by applying the pattern to the longestPhoneNumber string.
		const longest_phone_number = '999999999999999'

		const matches = longest_phone_number.match(number_pattern)
		// This match will always succeed
		const phone_number = matches[0]

		// No formatting template can be created if the number of digits entered so
		// far is longer than the maximum the current formatting rule can accommodate.
		if (phone_number.length < this.national_number.length)
		{
			return
		}

		return phone_number
			// Formats the number according to numberFormat
			.replace(new RegExp(number_pattern, 'g'), number_format)
			// Replaces each digit with character DIGIT_PLACEHOLDER
			.replace(new RegExp('9', 'g'), DIGIT_PLACEHOLDER)
	}

	input_national_number_digit(digit)
	{
		if (this.formatting_template && this.formatting_template.slice(this.last_match_position).search(DIGIT_PATTERN) >= 0)
		{
			const digit_pattern_start = this.formatting_template.search(DIGIT_PATTERN)
			this.formatting_template = this.formatting_template.replace(DIGIT_PATTERN, digit)
			this.last_match_position = digit_pattern_start

			return this.formatting_template.slice(0, digit_pattern_start + 1)
		}

		if (this.possible_formats.length === 1)
		{
			// More digits are entered than we could handle, and there are
			// no other valid patterns to try.
			this.able_to_format = false
		}
		// else, we just reset the formatting pattern

		this.current_formatting_pattern = undefined
		return this.parsed_input
	}

	is_international()
	{
		return this.parsed_input[0] === '+'
	}

	get_format_format(format)
	{
		// // Always prefer international formatting rules over national ones,
		// // because national formatting rules could contain
		// // local formatting rules for numbers entered without area code.
		// get_format_international_format(format)

		if (this.is_international())
		{
			return get_format_international_format(format)
		}

		return get_format_format(format)
	}
}