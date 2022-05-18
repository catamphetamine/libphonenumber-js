import { normalizeArguments } from './parsePhoneNumber.js'
import parsePhoneNumberFromString from './parsePhoneNumberFromString_.js'

export default function isValidPhoneNumber() {
	let { text, options, metadata } = normalizeArguments(arguments)
	options = {
		...options,
		extract: false
	}
	const phoneNumber = parsePhoneNumberFromString(text, options, metadata)
	return phoneNumber && phoneNumber.isValid() || false
}