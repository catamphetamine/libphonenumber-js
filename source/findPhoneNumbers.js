import parse from './parse'
import Metadata from './metadata'

import
{
	PLUS_CHARS,
	VALID_PUNCTUATION,
	VALID_DIGITS,
	// OPENING_BRACKETS,
	WHITESPACE,
	create_extension_pattern
}
from './common'

// Copy-pasted from `./parse.js`.
const VALID_PHONE_NUMBER =
	'[' + PLUS_CHARS + ']{0,1}' +
	'(?:' +
		'[' + VALID_PUNCTUATION + ']*' +
		'[' + VALID_DIGITS + ']' +
	'){3,}' +
	'[' +
		VALID_PUNCTUATION +
		VALID_DIGITS +
	']*'

const EXTN_PATTERNS_FOR_PARSING = create_extension_pattern('parsing')

// Is used for full-text search.
const VALID_PHONE_NUMBER_PATTERN_FOR_FULL_TEXT_SEARCH = new RegExp
(
	VALID_PHONE_NUMBER +
	// Phone number extensions
	'(?:' + EXTN_PATTERNS_FOR_PARSING + ')?',
	'ig'
)

const WHITESPACE_IN_THE_BEGINNING_PATTERN = new RegExp('^[' + WHITESPACE + ']+')
const WHITESPACE_IN_THE_END_PATTERN = new RegExp('[' + WHITESPACE + ']+$')

// // Regular expression for getting opening brackets for a valid number
// // found using `PHONE_NUMBER_START_PATTERN` for prepending those brackets to the number.
// const BEFORE_NUMBER_DIGITS_PUNCTUATION = new RegExp('[' + OPENING_BRACKETS + ']+' + '[' + WHITESPACE + ']*' + '$')

export default function findNumbers(arg_1, arg_2, arg_3, arg_4)
{
	const { text, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)

	return extract_formatted_phone_numbers(text).map(({ number, startsAt }) =>
	({
		...parse(number, { defaultCountry: options.defaultCountry }, metadata.metadata),
		startsAt,
		endsAt : startsAt + number.length
	}))
	.filter(({ phone }) => phone)
}

/**
 * Extracts a parseable phone number including any opening brackets, etc.
 * @param  {string} text - Input.
 * @return {object} `{ ?number, ?startsAt, ?endsAt }`.
 */
export function extract_formatted_phone_numbers(text)
{
	if (!text)
	{
		return []
	}

	let matches
	const numbers = []

	let searching_from = 0
	while ((matches = VALID_PHONE_NUMBER_PATTERN_FOR_FULL_TEXT_SEARCH.exec(text)) !== null)
	{
		let number   = matches[0]
		let startsAt = matches.index

		number = number.replace(WHITESPACE_IN_THE_BEGINNING_PATTERN, '')
		startsAt += matches[0].length - number.length
		number = number.replace(WHITESPACE_IN_THE_END_PATTERN, '')

		// // Prepend any opening brackets left behind by the
		// // `PHONE_NUMBER_START_PATTERN` regexp.
		// const text_before_number = text.slice(searching_from, startsAt)
		// const full_number_starts_at = text_before_number.search(BEFORE_NUMBER_DIGITS_PUNCTUATION)
		// if (full_number_starts_at >= 0)
		// {
		// 	number   = text_before_number.slice(full_number_starts_at) + number
		// 	startsAt = full_number_starts_at
		// }

		numbers.push
		({
			number,
			startsAt
		})

		searching_from = matches.lastIndex
	}

	// Reset the regexp.
	VALID_PHONE_NUMBER_PATTERN_FOR_FULL_TEXT_SEARCH.lastIndex = 0

	return numbers
}

export function sort_out_arguments(arg_1, arg_2, arg_3, arg_4)
{
	let text
	let options
	let metadata

	// If the phone number is passed as a string.
	// `parse('88005553535', ...)`.
	if (typeof arg_1 === 'string')
	{
		text = arg_1
	}
	else throw new TypeError('A text for parsing must be a string.')

	// If "default country" argument is being passed
	// then move it to `options`.
	// `findNumbers('88005553535', 'RU', [options], metadata)`.
	if (typeof arg_2 === 'string')
	{
		if (arg_4)
		{
			options = { defaultCountry: arg_2, ...arg_3 }
			metadata = arg_4
		}
		else
		{
			options = { defaultCountry: arg_2 }
			metadata = arg_3
		}
	}
	// No "default country" argument is being passed.
	// Only international phone numbers are passed.
	// `findNumbers('+78005553535', [options], metadata)`.
	else
	{
		if (arg_3)
		{
			options  = arg_2
			metadata = arg_3
		}
		else
		{
			metadata = arg_2
		}
	}

	// Metadata is required.
	if (!metadata || !metadata.countries)
	{
		throw new Error('Metadata is required')
	}

	if (!options)
	{
		options = {}
	}

	// // Apply default options.
	// if (options)
	// {
	// 	options = { ...default_options, ...options }
	// }
	// else
	// {
	// 	options = default_options
	// }

	return { text, options, metadata: new Metadata(metadata) }
}