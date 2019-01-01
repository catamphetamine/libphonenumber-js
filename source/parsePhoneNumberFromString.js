import parsePhoneNumber from './parsePhoneNumber'
import ParseError from './ParseError'

export default function parsePhoneNumberFromString() {
	try {
		return parsePhoneNumber.apply(this, arguments)
	} catch (error) {
		/* istanbul ignore else */
		if (error instanceof ParseError) {
			///
		} else {
			throw error
		}
	}
}
