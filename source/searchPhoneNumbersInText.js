import searchNumbers from './searchNumbers.js'
import { getArguments } from './findPhoneNumbersInText.js'

export default function searchPhoneNumbersInText(text, defaultCountry, options, metadata) {
	const args = getArguments(defaultCountry, options, metadata)
	return searchNumbers(text, args.options, args.metadata)
}