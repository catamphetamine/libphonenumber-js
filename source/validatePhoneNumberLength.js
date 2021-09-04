import { normalizeArguments } from './parsePhoneNumber'
import parsePhoneNumber from './parsePhoneNumber_'
import ParseError from './ParseError'
import Metadata from './metadata'
import checkNumberLength from './helpers/checkNumberLength'

export default function validatePhoneNumberLength() {
	let { text, options, metadata } = normalizeArguments(arguments)
	options = {
		...options,
		extract: false
	}

	// Parse phone number.
	try {
		const phoneNumber = parsePhoneNumber(text, options, metadata)
		metadata = new Metadata(metadata)
		metadata.selectNumberingPlan(phoneNumber.countryCallingCode)
		const result = checkNumberLength(phoneNumber.nationalNumber, metadata)
		if (result !== 'IS_POSSIBLE') {
			return result
		}
	} catch (error) {
		/* istanbul ignore else */
		if (error instanceof ParseError) {
			return error.message
		} else {
			throw error
		}
	}
}