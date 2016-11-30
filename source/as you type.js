// This is an enhanced port of Google Android `libphonenumber`'s
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
	get_format_pattern,
	get_format_format,
	get_format_international_format,
	get_format_national_prefix_formatting_rule,
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
	FIRST_GROUP_PATTERN,
	format_national_number_using_format,
	local_to_international_style
}
from './format'

import
{
	matches_entirely
}
from './common'

// Used in phone number format template creation.
// Could be any digit, I guess.
const DUMMY_DIGIT = '9'
const DUMMY_DIGIT_MATCHER = new RegExp(DUMMY_DIGIT, 'g')
// I don't know why is it exactly `15`
const LONGEST_NATIONAL_PHONE_NUMBER_LENGTH = 15
// Create a phone number consisting only of the digit 9 that matches the
// `number_pattern` by applying the pattern to the "longest phone number" string.
const LONGEST_DUMMY_PHONE_NUMBER = repeat(DUMMY_DIGIT, LONGEST_NATIONAL_PHONE_NUMBER_LENGTH)

// The digits that have not been entered yet will be represented by a \u2008,
// the punctuation space.
const DIGIT_PLACEHOLDER = '\u2008'
const DIGIT_PLACEHOLDER_MATCHER = new RegExp(DIGIT_PLACEHOLDER)
const DIGIT_PLACEHOLDER_MATCHER_GLOBAL = new RegExp(DIGIT_PLACEHOLDER, 'g')

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

export default class as_you_type
{
	constructor(country_code)
	{
		if (country_code)
		{
			this.country_code = country_code
			this.country_metadata = metadata.countries[country_code]
			this.initialize_phone_number_formats_for_this_country()
		}

		this.reset()
	}

	input(text)
	{
		// Parse input

		let extracted_number = extract_formatted_phone_number(text)

		// Special case for a lone '+' sign
		// since it's not considered a possible phone number.
		if (!extracted_number)
		{
			if (text.indexOf('+') >= 0)
			{
				extracted_number = '+'
			}
		}

		// Validate possible first part of a phone number
		if (!matches_entirely(VALID_INCOMPLETE_PHONE_NUMBER_PATTERN, extracted_number))
		{
			return this.current_output
		}

		// Feed the parsed input character-by-character
		for (let character of parse_phone_number(extracted_number))
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
			// (or a second '+' sign),
			// then just don't allow it being input.
			if (this.parsed_input)
			{
				return this.current_output
			}
		}
		// A digit then
		else
		{
			this.national_number += character
		}

		this.parsed_input += character

		// Try to format the parsed input

		if (this.is_international())
		{
			if (!this.country_phone_code)
			{
				// If one looks at country phone codes
				// then he can notice that no one country phone code
				// is ever a (leftmost) substring of another country phone code.
				// So if a valid country code is extracted so far
				// then it means that this is the country code.
				if (this.extract_country_phone_code())
				{
					// If the possible phone number formats
					// haven't been initialized during instance creation,
					// then do it.
					if (!this.country_code)
					{
						this.initialize_phone_number_formats_for_this_country()
					}

					return '+' + this.country_phone_code
				}

				// Return raw phone number
				return this.parsed_input
			}
		}
		else
		{
			// Some national prefixes are substrings of other national prefixes
			// (for the same country), therefore try to extract national prefix each time
			// because a longer national prefix might be available at some point in time.

			const previous_national_prefix = this.national_prefix
			this.national_number = this.national_prefix + this.national_number

			// Possibly extract a national prefix
			this.extract_national_prefix()

			if (this.national_prefix !== previous_national_prefix)
			{
				// National number has changed
				// (due to another national prefix been extracted)
				// therefore reset all previous formatting data.
				this.reset_formatting()
			}
		}

		// Format the next phone number digit
		// since the previously chose phone number format
		// still holds.
		//
		// This is done here because if `attempt_to_format_complete_phone_number`
		// was placed before this call then the `formatting_template`
		// wouldn't reflect the situation correctly (and would therefore be inconsistent)
		//
		const national_number_formatted_with_previous_format = this.format_next_national_number_digit(character)

		// See if the input digits can be formatted properly already. If not,
		// use the results from format_next_national_number_digit(), which does formatting
		// based on the formatting pattern chosen.

		const formatted_number = this.attempt_to_format_complete_phone_number()

		if (formatted_number)
		{
			return formatted_number
		}

		// Check if the previously chosen phone number format still holds
		this.match_formats_by_leading_digits()

		// If the previously chosen phone number format
		// didn't match the next (current) digit being input
		// (leading digits pattern didn't match).
		if (this.choose_another_format())
		{
			// And a more appropriate phone number format
			// has been chosen for these `leading digits`,
			// then format the national phone number (so far)
			// using the newly selected phone number pattern.

			const formatted_national_number = this.reformat_national_number()

			if (formatted_national_number)
			{
				return this.full_phone_number(formatted_national_number)
			}

			// Couldn't format the supplied national number
			// using the selected phone number pattern.
			// Return raw phone number.
			return this.parsed_input
		}

		// If could format the next (current) digit
		// using the previously chosen phone number format
		// then return the formatted number so far.
		if (national_number_formatted_with_previous_format)
		{
			return this.full_phone_number(national_number_formatted_with_previous_format)
		}

		// If no new phone number format could be chosen,
		// And couldn't format the supplied national number
		// using the selected phone number pattern.
		// Return raw phone number
		return this.parsed_input
	}

	reset()
	{
		// // Input text so far, can contain any characters
		// this.original_input = ''

		// Input stripped of non-phone-number characters.
		// Can only contain a possible leading '+' sign and digits.
		this.parsed_input = ''

		this.current_output = ''

		// This contains the national prefix that has been extracted. It contains only
		// digits without formatting.
		this.national_prefix = ''

		this.national_number = ''

		this.country_phone_code = ''

		if (!this.country_code)
		{
			this.country_metadata = undefined
			this.available_formats = []
		}

		this.reset_formatting()
	}

	reset_formatting()
	{
		this.matching_formats = undefined

		this.chosen_format = undefined

		this.last_match_position = 0

		this.formatting_template = undefined
		this.partially_populated_formatting_template = undefined

		this.national_prefix_is_part_of_formatting_template = false
	}

	// Format each digit of national phone number (so far)
	// using the newly selected phone number pattern.
	reformat_national_number()
	{
		// Format each digit of national phone number (so far)
		// using the selected phone number pattern.
		let formatted_national_number
		for (let character of this.national_number)
		{
			formatted_national_number = this.format_next_national_number_digit(character)
		}

		return formatted_national_number
	}

	initialize_phone_number_formats_for_this_country()
	{
		// Get all "eligible" phone number formats for this country
		this.available_formats = get_formats(this.country_metadata).filter((format) =>
		{
			return ELIGIBLE_FORMAT_PATTERN.test(get_format_international_format(format))
		})
	}

	match_formats_by_leading_digits()
	{
		const leading_digits = this.national_number

		// "leading digits" patterns start with a maximum 3 digits,
		// and then with each additional digit
		// a more precise "leading digits" pattern is specified.
		// They could make "leading digits" patterns start
		// with a maximum of a single digit, but they didn't,
		// so it's possible that some phone number formats
		// will be falsely rejected until there are at least
		// 3 digits in the national (significant) number being input.

		let index_of_leading_digits_pattern = leading_digits.length - MIN_LEADING_DIGITS_LENGTH

		if (index_of_leading_digits_pattern < 0)
		{
			index_of_leading_digits_pattern = 0
		}

		this.matching_formats = this.get_relevant_phone_number_formats().filter((format) =>
		{
			const leading_digits_pattern_count = get_format_leading_digits_patterns(format).length

			// Keep everything that isn't restricted by leading digits.
			if (leading_digits_pattern_count === 0)
			{
				return true
			}

			const leading_digits_pattern_index = Math.min(index_of_leading_digits_pattern, leading_digits_pattern_count - 1)
			const leading_digits_pattern = get_format_leading_digits_patterns(format)[leading_digits_pattern_index]
			return new RegExp('^' + leading_digits_pattern).test(leading_digits)
		})
	}

	get_relevant_phone_number_formats()
	{
		const leading_digits = this.national_number

		// "leading digits" patterns start with a maximum 3 digits,
		// and then with each additional digit
		// a more precise "leading digits" pattern is specified.
		// They could make "leading digits" patterns start
		// with a maximum of a single digit, but they didn't,
		// so it's possible that some phone number formats
		// will be falsely rejected until there are at least
		// 3 digits in the national (significant) number being input.

		if (leading_digits.length <= MIN_LEADING_DIGITS_LENGTH)
		{
			return this.available_formats
		}

		// `matching_formats` is `undefined` when formatting has been reset.
		// It will be set later, in `match_formats_by_leading_digits()` call.
		return this.matching_formats || this.available_formats
	}

	// Check to see if there is an exact pattern match for these digits. If so, we
	// should use this instead of any other formatting template whose
	// leadingDigitsPattern also matches the input.
	attempt_to_format_complete_phone_number()
	{
		for (let format of this.get_relevant_phone_number_formats())
		{
			const matcher = new RegExp('^(?:' + get_format_pattern(format) + ')$')

			if (matcher.test(this.national_number))
			{
				const formatted_national_number = format_national_number_using_format
				(
					this.national_number,
					format,
					this.is_international(),
					this.national_prefix,
					this.country_metadata
				)

				return this.full_phone_number(formatted_national_number)
			}
		}
	}

	// Combines the national number with the appropriate prefix
	full_phone_number(formatted_national_number)
	{
		if (this.is_international())
		{
			return '+' + this.country_phone_code + ' ' + formatted_national_number
		}

		return formatted_national_number
	}

	// Extracts the country calling code from the beginning
	// of the entered `national_number` (so far),
	// and places the remaining input into the `national_number`.
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

		this.country_phone_code = country_phone_code
		this.national_number = number

		return this.country_metadata = get_metadata_by_country_phone_code(country_phone_code, metadata)
	}

	extract_national_prefix()
	{
		this.national_prefix = ''

		if (!this.country_metadata)
		{
			return
		}

		const national_prefix_for_parsing = get_national_prefix_for_parsing(this.country_metadata)

		if (!national_prefix_for_parsing)
		{
			return
		}

		const matches = this.national_number.match(new RegExp('^(?:' + national_prefix_for_parsing + ')'))

		// Since some national prefix patterns are entirely optional, check that a
		// national prefix could actually be extracted.
		if (!matches || !matches[0])
		{
			return
		}

		const national_number_starts_at = matches[0].length

		this.national_prefix = this.national_number.slice(0, national_number_starts_at)
		this.national_number = this.national_number.slice(national_number_starts_at)

		return this.national_prefix
	}

	choose_another_format()
	{
		// When there are multiple available formats, the formatter uses the first
		// format where a formatting template could be created.
		for (let format of this.get_relevant_phone_number_formats())
		{
			// If this format is currently being used
			// and is still possible, then stick to it.
			if (this.chosen_format === format)
			{
				return
			}

			// If this `format` is suitable for "as you type",
			// then extract the template from this format
			// and use it to format the phone number being input.
			if (this.create_formatting_template(format))
			{
				this.chosen_format = format

				// With a new formatting template, the matched position
				// using the old template needs to be reset.
				this.last_match_position = 0

				return true
			}
		}
	}

	create_formatting_template(format)
	{
		let number_pattern = get_format_pattern(format)

		// The formatter doesn't format numbers when numberPattern contains '|', e.g.
		// (20|3)\d{4}. In those cases we quickly return.
		// (Though there's no such format in current metadata)
		/* istanbul ignore if */
		if (number_pattern.indexOf('|') >= 0)
		{
			return
		}

		number_pattern = number_pattern
			// Replace anything in the form of [..] with \d
			.replace(CHARACTER_CLASS_PATTERN, '\\d')
			// Replace any standalone digit (not the one in `{}`) with \d
			.replace(STANDALONE_DIGIT_PATTERN, '\\d')

		let number_format = this.get_format_format(format)
		this.national_prefix_is_part_of_formatting_template = false

		if (this.national_prefix)
		{
			this.national_prefix_is_part_of_formatting_template = true
			const national_prefix_formatting_rule = get_format_national_prefix_formatting_rule(format, this.country_metadata)

			// If national prefix formatting rule is set
			// (e.g. it is not set for US)
			if (national_prefix_formatting_rule)
			{
				number_format = number_format.replace(FIRST_GROUP_PATTERN, national_prefix_formatting_rule)
			}
		}

		// Get a formatting template which can be used to efficiently format
		// a partial number where digits are added one by one.

		// This match will always succeed,
		// because the "longest dummy phone number"
		// has enough length to accomodate any possible
		// national phone number format pattern.
		const dummy_phone_number_matching_format_pattern = LONGEST_DUMMY_PHONE_NUMBER.match(number_pattern)[0]

		// If the national number entered is too long
		// for any phone number format, then abort.
		if (this.national_number.length > dummy_phone_number_matching_format_pattern.length)
		{
			return
		}

		// Create formatting template for this phone number format
		this.formatting_template = dummy_phone_number_matching_format_pattern
			// Format the dummy phone number according to the format
			.replace(new RegExp(number_pattern, 'g'), number_format)
			// Replace each dummy digit with a DIGIT_PLACEHOLDER
			.replace(DUMMY_DIGIT_MATCHER, DIGIT_PLACEHOLDER)

		return this.partially_populated_formatting_template = this.formatting_template
	}

	format_next_national_number_digit(digit)
	{
		// If there is room for more digits in current `formatting_template`,
		// then set the next digit in the `formatting_template`,
		// and return the formatted digits so far.
		if (this.chosen_format && this.partially_populated_formatting_template.slice(this.last_match_position + 1).search(DIGIT_PLACEHOLDER_MATCHER) >= 0)
		{
			const digit_pattern_start = this.partially_populated_formatting_template.search(DIGIT_PLACEHOLDER_MATCHER)
			this.partially_populated_formatting_template = this.partially_populated_formatting_template.replace(DIGIT_PLACEHOLDER_MATCHER, digit)
			this.last_match_position = digit_pattern_start

			// Return the formatted phone number so far
			return close_dangling_braces(this.partially_populated_formatting_template, digit_pattern_start + 1)
				.replace(DIGIT_PLACEHOLDER_MATCHER_GLOBAL, ' ')
		}

		// More digits are entered than the current format could handle

		// Reset the current format,
		// so that the new format will be chosen
		// in a subsequent `this.choose_another_format()` call
		// later in code.
		this.chosen_format = undefined
		this.formatting_template = undefined
		this.partially_populated_formatting_template = undefined
	}

	is_international()
	{
		return this.parsed_input[0] === '+'
	}

	get_format_format(format)
	{
		if (this.is_international())
		{
			return local_to_international_style(get_format_international_format(format))
		}

		return get_format_format(format)
	}
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

// Counts all occurences of a symbol in a string
export function count_occurences(symbol, string)
{
	let count = 0

	for (let character of string)
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