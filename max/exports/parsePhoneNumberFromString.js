import { withMetadata } from '../metadata'
import { parsePhoneNumberFromString as _parsePhoneNumberFromString } from '../../core/index'

export function parsePhoneNumberFromString() {
	return withMetadata(_parsePhoneNumberFromString, arguments)
}