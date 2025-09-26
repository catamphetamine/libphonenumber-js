// This is a legacy function.
// Use `findNumbers()` instead.

import createExtensionPattern from '../helpers/extension/createExtensionPattern.js'

import PhoneNumberSearch from './PhoneNumberSearch.js'

/**
 * Regexp of all possible ways to write extensions, for use when parsing. This
 * will be run as a case-insensitive regexp match. Wide character versions are
 * also provided after each ASCII version. There are three regular expressions
 * here. The first covers RFC 3966 format, where the extension is added using
 * ';ext='. The second more generic one starts with optional white space and
 * ends with an optional full stop (.), followed by zero or more spaces/tabs
 * /commas and then the numbers themselves. The other one covers the special
 * case of American numbers where the extension is written with a hash at the
 * end, such as '- 503#'. Note that the only capturing groups should be around
 * the digits that you want to capture as part of the extension, or else parsing
 * will fail! We allow two options for representing the accented o - the
 * character itself, and one in the unicode decomposed form with the combining
 * acute accent.
 */
export const EXTN_PATTERNS_FOR_PARSING = createExtensionPattern('parsing')

// // Regular expression for getting opening brackets for a valid number
// // found using `PHONE_NUMBER_START_PATTERN` for prepending those brackets to the number.
// const BEFORE_NUMBER_DIGITS_PUNCTUATION = new RegExp('[' + OPENING_BRACKETS + ']+' + '[' + WHITESPACE + ']*' + '$')

// const VALID_PRECEDING_CHARACTER_PATTERN = /[^a-zA-Z0-9]/

export default function findPhoneNumbers(text, options, metadata) {
	/* istanbul ignore if */
	if (options === undefined) {
		options = {}
	}
	const search = new PhoneNumberSearch(text, options, metadata)
	const phones = []
	while (search.hasNext()) {
		phones.push(search.next())
	}
	return phones
}

/**
 * @return ES6 `for ... of` iterator.
 */
export function searchPhoneNumbers(text, options, metadata) {
	/* istanbul ignore if */
	if (options === undefined) {
		options = {}
	}

	const search = new PhoneNumberSearch(text, options, metadata)

	const iterator = () => {
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

	// This line of code didn't really work with `babel`/`istanbul`:
	// for some weird reason, it showed code coverage less than 100%.
	// That's because `babel`/`istanbul`, for some weird reason,
	// apparently doesn't know how to properly exclude Babel polyfills from code coverage.
	//
	// const iterable = { [Symbol.iterator]: iterator }

	const iterable = {}
	iterable[Symbol.iterator] = iterator
	return iterable
}
