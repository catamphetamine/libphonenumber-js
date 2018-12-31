import Metadata from './metadata'
import { stripIDDPrefix } from './IDD'

import {
	VALID_DIGITS,
	MAX_LENGTH_COUNTRY_CODE
} from './common.constants'

import parseIncompletePhoneNumber from './parseIncompletePhoneNumber'

// Parses a formatted phone number
// and returns `{ countryCallingCode, number }`
// where `number` is just the "number" part
// which is left after extracting `countryCallingCode`
// and is not necessarily a "national (significant) number"
// and might as well contain national prefix.
//
export function extractCountryCallingCode(number, country, metadata)
{
	number = parseIncompletePhoneNumber(number)

	if (!number)
	{
		return {}
	}

	// If this is not an international phone number,
	// then don't extract country phone code.
	if (number[0] !== '+')
	{
		// Convert an "out-of-country" dialing phone number
		// to a proper international phone number.
		const numberWithoutIDD = stripIDDPrefix(number, country, metadata)

		// If an IDD prefix was stripped then
		// convert the number to international one
		// for subsequent parsing.
		if (numberWithoutIDD && numberWithoutIDD !== number) {
			number = '+' + numberWithoutIDD
		} else {
			return { number }
		}
	}

	// Fast abortion: country codes do not begin with a '0'
	if (number[1] === '0')
	{
		return {}
	}

	metadata = new Metadata(metadata)

	// The thing with country phone codes
	// is that they are orthogonal to each other
	// i.e. there's no such country phone code A
	// for which country phone code B exists
	// where B starts with A.
	// Therefore, while scanning digits,
	// if a valid country code is found,
	// that means that it is the country code.
	//
	let i = 2
	while (i - 1 <= MAX_LENGTH_COUNTRY_CODE && i <= number.length)
	{
		const countryCallingCode = number.slice(1, i)

		if (metadata.countryCallingCodes()[countryCallingCode])
		{
			return {
				countryCallingCode,
				number: number.slice(i)
			}
		}

		i++
	}

	return {}
}

// Checks whether the entire input sequence can be matched
// against the regular expression.
export function matches_entirely(text = '', regular_expression)
{
	return new RegExp('^(?:' + regular_expression + ')$').test(text)
}