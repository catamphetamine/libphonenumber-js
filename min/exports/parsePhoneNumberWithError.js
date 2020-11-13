import { withMetadata } from '../metadata'
import { parsePhoneNumberWithError as _parsePhoneNumberWithError } from '../../core/index'

export function parsePhoneNumberWithError() {
	return withMetadata(_parsePhoneNumberWithError, arguments)
}
