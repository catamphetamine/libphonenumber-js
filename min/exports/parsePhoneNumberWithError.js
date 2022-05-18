import { withMetadata } from '../metadata.js'
import { parsePhoneNumberWithError as _parsePhoneNumberWithError } from '../../core/index.js'

export function parsePhoneNumberWithError() {
	return withMetadata(_parsePhoneNumberWithError, arguments)
}
