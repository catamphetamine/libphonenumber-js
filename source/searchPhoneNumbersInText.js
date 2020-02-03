import searchNumbers from './searchNumbers'
import { getArguments } from './findPhoneNumbersInText'

export default function searchPhoneNumbersInText(text, defaultCountry, options, metadata) {
	const args = getArguments(defaultCountry, options, metadata)
	return searchNumbers(text, args.options, args.metadata)
}