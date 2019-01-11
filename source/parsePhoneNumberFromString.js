import { normalizeArguments } from './parsePhoneNumber'
import parsePhoneNumberFromString_ from './parsePhoneNumberFromString_'

export default function parsePhoneNumberFromString() {
	const { text, options, metadata } = normalizeArguments(arguments)
	return parsePhoneNumberFromString_(text, options, metadata)
}
