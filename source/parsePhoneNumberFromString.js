import { normalizeArguments } from './parsePhoneNumber.js'
import parsePhoneNumberFromString_ from './parsePhoneNumberFromString_.js'

export default function parsePhoneNumberFromString() {
	const { text, options, metadata } = normalizeArguments(arguments)
	return parsePhoneNumberFromString_(text, options, metadata)
}
