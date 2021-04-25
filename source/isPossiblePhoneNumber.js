import { normalizeArguments } from './parsePhoneNumber'
import parsePhoneNumberFromString from './parsePhoneNumberFromString_'

export default function isPossiblePhoneNumber() {
	let { text, options, metadata } = normalizeArguments(arguments)
	options = {
		...options,
		extract: false
	}
	const phoneNumber = parsePhoneNumberFromString(text, options, metadata)
	return phoneNumber && phoneNumber.isPossible() || false
}