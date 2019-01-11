import parsePhoneNumber from './parsePhoneNumber_'
import ParseError from './ParseError'
import { isSupportedCountry } from './metadata'

export default function parsePhoneNumberFromString(text, options, metadata) {
	// Validate `defaultCountry`.
	if (options && options.defaultCountry && !isSupportedCountry(options.defaultCountry, metadata)) {
		options = {
			...options,
			defaultCountry: undefined
		}
	}
	// Parse phone number.
	try {
		return parsePhoneNumber(text, options, metadata)
	} catch (error) {
		/* istanbul ignore else */
		if (error instanceof ParseError) {
			//
		} else {
			throw error
		}
	}
}
