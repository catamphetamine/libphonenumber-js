import parse from './parse'
import Metadata from './metadata'

import
{
	PLUS_CHARS,
	VALID_PUNCTUATION,
	VALID_DIGITS,
	WHITESPACE,
	create_extension_pattern
}
from './common'

import parsePreCandidate from './findNumbers/parsePreCandidate'
import isValidPreCandidate from './findNumbers/isValidPreCandidate'
import isValidCandidate, { OPENING_PARENS } from './findNumbers/isValidCandidate'

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

const WHITESPACE_IN_THE_BEGINNING_PATTERN = new RegExp('^[' + WHITESPACE + ']+')
const WHITESPACE_AND_OPENING_PARENS_IN_THE_END_PATTERN = new RegExp('[' + WHITESPACE + OPENING_PARENS + ']+$')

// // Regular expression for getting opening brackets for a valid number
// // found using `PHONE_NUMBER_START_PATTERN` for prepending those brackets to the number.
// const BEFORE_NUMBER_DIGITS_PUNCTUATION = new RegExp('[' + OPENING_BRACKETS + ']+' + '[' + WHITESPACE + ']*' + '$')

const VALID_PRECEDING_CHARACTER_PATTERN = /[^a-zA-Z0-9]/

export default function findPhoneNumbers(arg_1, arg_2, arg_3, arg_4)
{
	const { text, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)

	const search = new PhoneNumberSearch(text, options, metadata.metadata)

	const phones = []

	while (search.hasNext())
	{
		phones.push(search.next())
	}

	return phones
}

/**
 * @return ES6 `for ... of` iterator.
 */
export function searchPhoneNumbers(arg_1, arg_2, arg_3, arg_4)
{
	const { text, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)

	const search = new PhoneNumberSearch(text, options, metadata.metadata)

	return  {
		[Symbol.iterator]() {
			return {
	    		next: () => {
	    			if (search.hasNext()) {
						return {
							done: false,
							value: search.next()
						}
					}
					return {
						done: true
					}
	    		}
			}
		}
	}
}

/**
 * Extracts a parseable phone number including any opening brackets, etc.
 * @param  {string} text - Input.
 * @return {object} `{ ?number, ?startsAt, ?endsAt }`.
 */
export class PhoneNumberSearch
{
	// Iteration tristate.
	state = 'NOT_READY'

	constructor(text, options = {}, metadata)
	{
		this.text = text
		this.options = options
		this.metadata = metadata

		this.regexp = new RegExp
		(
			VALID_PHONE_NUMBER +
			// Phone number extensions
			'(?:' + EXTN_PATTERNS_FOR_PARSING + ')?',
			'ig'
		)

		// this.searching_from = 0
	}

	find()
	{
		const matches = this.regexp.exec(this.text)

		if (!matches) {
			return
		}

		let number   = matches[0]
		let startsAt = matches.index

		number = number.replace(WHITESPACE_IN_THE_BEGINNING_PATTERN, '')
		startsAt += matches[0].length - number.length
		// Fixes not parsing numbers with whitespace in the end.
		// Also fixes not parsing numbers with opening parentheses in the end.
		// https://github.com/catamphetamine/libphonenumber-js/issues/252
		number = number.replace(WHITESPACE_AND_OPENING_PARENS_IN_THE_END_PATTERN, '')

		number = parsePreCandidate(number)

		const result = this.parseCandidate(number, startsAt)

		if (result) {
			return result
		}

		// Tail recursion.
		// Try the next one if this one is not a valid phone number.
		return this.find()
	}

	parseCandidate(number, startsAt)
	{
		if (!isValidPreCandidate(number, startsAt, this.text)) {
			return
		}

		// Don't parse phone numbers which are non-phone numbers
		// due to being part of something else (e.g. a UUID).
		// https://github.com/catamphetamine/libphonenumber-js/issues/213
		// Copy-pasted from Google's `PhoneNumberMatcher.js` (`.parseAndValidate()`).
		if (!isValidCandidate(number, startsAt, this.text, this.options.extended ? 'POSSIBLE' : 'VALID'))
		{
			return
		}

		// // Prepend any opening brackets left behind by the
		// // `PHONE_NUMBER_START_PATTERN` regexp.
		// const text_before_number = text.slice(this.searching_from, startsAt)
		// const full_number_starts_at = text_before_number.search(BEFORE_NUMBER_DIGITS_PUNCTUATION)
		// if (full_number_starts_at >= 0)
		// {
		// 	number   = text_before_number.slice(full_number_starts_at) + number
		// 	startsAt = full_number_starts_at
		// }
		//
		// this.searching_from = matches.lastIndex

		const result = parse(number, this.options, this.metadata)

		if (!result.phone) {
			return
		}

		result.startsAt = startsAt
		result.endsAt   = startsAt + number.length

		return result
	}

	hasNext()
	{
		if (this.state === 'NOT_READY')
		{
			this.last_match = this.find()

			if (this.last_match)
			{
				this.state = 'READY'
			}
			else
			{
				this.state = 'DONE'
			}
		}

		return this.state === 'READY'
	}

	next()
	{
		// Check the state and find the next match as a side-effect if necessary.
		if (!this.hasNext())
		{
			throw new Error('No next element')
		}

		// Don't retain that memory any longer than necessary.
		const result = this.last_match
		this.last_match = null
		this.state = 'NOT_READY'
		return result
	}
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