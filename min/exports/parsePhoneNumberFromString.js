import withMetadataArgument from './withMetadataArgument.js'
import { parsePhoneNumberFromString as _parsePhoneNumberFromString } from '../../core/index.js'

export function parsePhoneNumberFromString() {
	return withMetadataArgument(_parsePhoneNumberFromString, arguments)
}