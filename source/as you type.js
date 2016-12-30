// This is an enhanced port of Google Android `libphonenumber`'s
// `asyoutypeformatter.js` of 17th November, 2016.
//
// https://github.com/googlei18n/libphonenumber/blob/8d21a365061de2ba0675c878a710a7b24f74d2ae/javascript/i18n/phonenumbers/asyoutypeformatter.js

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
	get_format_national_prefix_is_optional_when_formatting,
	get_format_national_prefix_is_mandatory_when_formatting,
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
	parse_phone_number_and_country_phone_code,
	find_country_code
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
const DIGIT_PLACEHOLDER = 'x' // '\u2008' (punctuation space)
const DIGIT_PLACEHOLDER_MATCHER = new RegExp(DIGIT_PLACEHOLDER)
const DIGIT_PLACEHOLDER_MATCHER_GLOBAL = new RegExp(DIGIT_PLACEHOLDER, 'g')

// A pattern that is used to match character classes in regular expressions.
// An example of a character class is "[1-4]".
const CHARACTER_CLASS_PATTERN = /\[([^\[\]])*\]/g

// Any digit in a regular expression that actually denotes a digit. For
// example, in the regular expression "80[0-2]\d{6,10}", the first 2 digits
// (8 and 0) are standalone digits, but the rest are not.
// Two look-aheads are needed because the number following \\d could be a
// two-digit number, since the phone number can be as long as 15 digits.
const STANDALONE_DIGIT_PATTERN = /\d(?=[^,}][^,}])/g

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

export default function(metadata)
{
	class as_you_type
	{
		constructor(country_code)
		{
			if (country_code && metadata.countries[country_code])
			{
				this.default_country = country_code
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
				if (text && text.indexOf('+') >= 0)
				{
					extracted_number = '+'
				}
			}

			// Validate possible first part of a phone number
			if (!matches_entirely(extracted_number, VALID_INCOMPLETE_PHONE_NUMBER_PATTERN))
			{
				return this.current_output
			}

			return this.process_input(parse_phone_number(extracted_number))
		}

		process_input(input)
		{
			// If an out of position '+' sign detected
			// (or a second '+' sign),
			// then just drop it from the input.
			if (input[0] === '+')
			{
				if (!this.parsed_input)
				{
					this.parsed_input += '+'

					// If a default country was set
					// then reset it because an explicitly international
					// phone number is being entered
					this.reset_countriness()
				}

				input = input.slice(1)
			}

			// Raw phone number
			this.parsed_input += input

			// Reset phone number validation state
			this.valid = false

			// Add digits to the national number
			this.national_number += input

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

					// If no country phone code could be extracted so far,
					// then just return the raw phone number,
					// because it has no way of knowing
					// how to format the phone number so far.
					if (!this.extract_country_phone_code())
					{
						// Return raw phone number
						return this.parsed_input
					}

					// Initialize country-specific data
					this.initialize_phone_number_formats_for_this_country_phone_code()
					this.reset_format()
					this.determine_the_country()
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
					this.determine_the_country()
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
					// therefore national number has changed
					// therefore reset all previous formatting data.
					// (and leading digits matching state)
					this.matching_formats = this.available_formats
					this.reset_format()
				}
			}

			// Format the phone number (given the next digits)
			const formatted_national_phone_number = this.format_national_phone_number(input)

			// If the phone number could be formatted,
			// then return it, possibly prepending with country phone code
			// (for international phone numbers only)
			if (formatted_national_phone_number)
			{
				return this.full_phone_number(formatted_national_phone_number)
			}

			// If the phone number couldn't be formatted,
			// then just fall back to the raw phone number.
			return this.parsed_input
		}

		format_national_phone_number(next_digits)
		{
			// Format the next phone number digits
			// using the previously chosen phone number format.
			//
			// This is done here because if `attempt_to_format_complete_phone_number`
			// was placed before this call then the `template`
			// wouldn't reflect the situation correctly (and would therefore be inconsistent)
			//
			let national_number_formatted_with_previous_format
			if (this.chosen_format)
			{
				national_number_formatted_with_previous_format = this.format_next_national_number_digits(next_digits)
			}

			// See if the input digits can be formatted properly already. If not,
			// use the results from format_next_national_number_digits(), which does formatting
			// based on the formatting pattern chosen.

			const formatted_number = this.attempt_to_format_complete_phone_number()

			if (formatted_number)
			{
				if (this.country)
				{
					this.valid = true
				}

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

				// Will return `undefined` if it couldn't format
				// the supplied national number
				// using the selected phone number pattern.

				return this.reformat_national_number()
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
			this.parsed_input = ''

			this.current_output = ''

			// This contains the national prefix that has been extracted. It contains only
			// digits without formatting.
			this.national_prefix = ''

			this.national_number = ''

			this.reset_countriness()

			this.reset_format()

			this.valid = false

			return this
		}

		reset_country()
		{
			if (this.default_country && !this.is_international())
			{
				this.country = this.default_country
			}
			else
			{
				this.country = undefined
			}
		}

		reset_countriness()
		{
			this.reset_country()

			if (this.default_country && !this.is_international())
			{
				this.country_metadata = metadata.countries[this.default_country]
				this.country_phone_code = this.country_metadata.phone_code

				this.initialize_phone_number_formats_for_this_country_phone_code()
			}
			else
			{
				this.country_metadata = undefined
				this.country_phone_code = undefined

				this.available_formats = []
				this.matching_formats = this.available_formats
			}
		}

		reset_format()
		{
			this.chosen_format = undefined
			this.template = undefined
			this.partially_populated_template = undefined
			this.last_match_position = -1
		}

		// Format each digit of national phone number (so far)
		// using the newly selected phone number pattern.
		reformat_national_number()
		{
			// Format each digit of national phone number (so far)
			// using the selected phone number pattern.
			return this.format_next_national_number_digits(this.national_number)
		}

		initialize_phone_number_formats_for_this_country_phone_code()
		{
			// Get all "eligible" phone number formats for this country
			this.available_formats = get_formats(this.country_metadata).filter((format) =>
			{
				return ELIGIBLE_FORMAT_PATTERN.test(get_format_international_format(format))
			})
			// Try the formats with "leading digits" defined first
			.sort((a, b) =>
			{
				// Leading digits are defined for most formats
				/* istanbul ignore next */
				if (get_format_leading_digits_patterns(a).length === 0
					&& get_format_leading_digits_patterns(b).length > 0)
				{
					return -1
				}

				// Leading digits are defined for most formats
				/* istanbul ignore next */
				if (get_format_leading_digits_patterns(a).length > 0
					&& get_format_leading_digits_patterns(b).length === 0)
				{
					return 1
				}

				return 0
			})

			this.matching_formats = this.available_formats
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

			return this.matching_formats
		}

		// Check to see if there is an exact pattern match for these digits. If so, we
		// should use this instead of any other formatting template whose
		// leadingDigitsPattern also matches the input.
		attempt_to_format_complete_phone_number()
		{
			for (let format of this.get_relevant_phone_number_formats())
			{
				const matcher = new RegExp('^(?:' + get_format_pattern(format) + ')$')

				if (!matcher.test(this.national_number))
				{
					// If the national prefix is optional
					// then also try to format the phone number
					// without the national prefix being extracted.
					if (this.national_prefix
						&& get_format_national_prefix_is_optional_when_formatting(format, this.country_metadata))
					{
						if (!matcher.test(this.national_prefix + this.national_number))
						{
							continue
						}

						this.national_number = this.national_prefix + this.national_number
						this.national_prefix = ''
					}

					continue
				}

				if (!this.validate_format(format))
				{
					continue
				}

				// To leave the formatter in a consistent state
				this.reset_format()
				this.chosen_format = format

				const formatted_number = format_national_number_using_format
				(
					this.national_number,
					format,
					this.is_international(),
					this.national_prefix.length > 0,
					this.country_metadata
				)

				// Set `this.template` and `this.partially_populated_template`
				//
				// `else` case doesn't ever happen
				// with the current metadata,
				// but just in case.
				//
				/* istanbul ignore else */
				if (this.create_formatting_template(format))
				{
					// Populate `this.partially_populated_template`
					this.reformat_national_number()
				}
				else
				{
					const full_number = this.full_phone_number(formatted_number)

					this.template = full_number.replace(/[\d\+]/g, DIGIT_PLACEHOLDER)
					this.partially_populated_template = full_number
				}

				return formatted_number
			}
		}

		// Combines the national number with the appropriate prefix
		full_phone_number(formatted_national_number)
		{
			if (this.is_international())
			{
				return `+${this.country_phone_code} ${formatted_national_number}`
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

			const { country_phone_code, number } = parse_phone_number_and_country_phone_code(this.parsed_input, metadata)

			if (!country_phone_code)
			{
				return
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

				if (!this.validate_format(format))
				{
					continue
				}

				if (!this.create_formatting_template(format))
				{
					continue
				}

				this.chosen_format = format

				// With a new formatting template, the matched position
				// using the old template needs to be reset.
				this.last_match_position = -1

				return true
			}

			// No format matches the phone number,
			// therefore set `country` to `undefined`
			// (or to the default country).
			this.reset_country()

			// No format matches the national phone number entered
			this.reset_format()
		}

		validate_format(format)
		{
			// If national prefix is mandatory for this phone number format
			// and the user didn't input the national prefix,
			// then this phone number format isn't suitable.
			if (!this.is_international() && !this.national_prefix && get_format_national_prefix_is_mandatory_when_formatting(format, this.country_metadata))
			{
				return
			}

			return true
		}

		create_formatting_template(format)
		{
			// The formatter doesn't format numbers when numberPattern contains '|', e.g.
			// (20|3)\d{4}. In those cases we quickly return.
			// (Though there's no such format in current metadata)
			/* istanbul ignore if */
			if (get_format_pattern(format).indexOf('|') >= 0)
			{
				return
			}

			const national_prefix_formatting_rule = get_format_national_prefix_formatting_rule(format, this.country_metadata)

			// A very smart trick by the guys at Google
			const number_pattern = get_format_pattern(format)
				// Replace anything in the form of [..] with \d
				.replace(CHARACTER_CLASS_PATTERN, '\\d')
				// Replace any standalone digit (not the one in `{}`) with \d
				.replace(STANDALONE_DIGIT_PATTERN, '\\d')

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

			// Now prepare phone number format
			let number_format = this.get_format_format(format)

			// If the user did input the national prefix
			// then maybe make it a part of the phone number template
			if (this.national_prefix)
			{
				const national_prefix_formatting_rule = get_format_national_prefix_formatting_rule(format, this.country_metadata)

				// If national prefix formatting rule is set
				// for this phone number format
				if (national_prefix_formatting_rule)
				{
					// Make the national prefix a part of the phone number template
					number_format = number_format.replace(FIRST_GROUP_PATTERN, national_prefix_formatting_rule)
				}
			}

			// Get a formatting template which can be used to efficiently format
			// a partial number where digits are added one by one.

			// Create formatting template for this phone number format
			let template = dummy_phone_number_matching_format_pattern
				// Format the dummy phone number according to the format
				.replace(new RegExp(number_pattern, 'g'), number_format)
				// Replace each dummy digit with a DIGIT_PLACEHOLDER
				.replace(DUMMY_DIGIT_MATCHER, DIGIT_PLACEHOLDER)

			// This one is for national number only
			this.partially_populated_template = template

			// For convenience, the public `.template` property
			// is gonna contain the whole international number
			// if the phone number being input is international.
			if (this.is_international())
			{
				template = DIGIT_PLACEHOLDER + repeat(DIGIT_PLACEHOLDER, this.country_phone_code.length) + ' ' + template
			}
			// For local numbers, replace national prefix
			// with a digit placeholder.
			else
			{
				template = template.replace(/\d/g, DIGIT_PLACEHOLDER)
			}

			// This one is for the full phone number
			return this.template = template
		}

		format_next_national_number_digits(digits)
		{
			for (let digit of digits)
			{
				// If there is room for more digits in current `template`,
				// then set the next digit in the `template`,
				// and return the formatted digits so far.

				// If more digits are entered than the current format could handle
				if (this.partially_populated_template.slice(this.last_match_position + 1).search(DIGIT_PLACEHOLDER_MATCHER) === -1)
				{
					// Reset the current format,
					// so that the new format will be chosen
					// in a subsequent `this.choose_another_format()` call
					// later in code.
					this.chosen_format = undefined
					this.template = undefined
					this.partially_populated_template = undefined
					return
				}

				this.last_match_position = this.partially_populated_template.search(DIGIT_PLACEHOLDER_MATCHER)
				this.partially_populated_template = this.partially_populated_template.replace(DIGIT_PLACEHOLDER_MATCHER, digit)
			}

			// Return the formatted phone number so far
			return close_dangling_braces(this.partially_populated_template, this.last_match_position + 1)
				.replace(DIGIT_PLACEHOLDER_MATCHER_GLOBAL, ' ')
		}

		is_international()
		{
			return this.parsed_input && this.parsed_input[0] === '+'
		}

		get_format_format(format)
		{
			if (this.is_international())
			{
				return local_to_international_style(get_format_international_format(format))
			}

			return get_format_format(format)
		}

		// Determines the country of the phone number
		// entered so far based on the country phone code
		// and the national phone number.
		determine_the_country()
		{
			this.country = find_country_code(this.country_phone_code, this.national_number, metadata)
		}
	}

	as_you_type.DIGIT_PLACEHOLDER = DIGIT_PLACEHOLDER

	return as_you_type
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