import { withMetadata } from '../metadata.js'
import { parsePhoneNumberFromString as _parsePhoneNumberFromString } from '../../core/index.js'

export function parsePhoneNumberFromString() {
	return withMetadata(_parsePhoneNumberFromString, arguments)
}