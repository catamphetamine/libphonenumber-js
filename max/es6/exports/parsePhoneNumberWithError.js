import withMetadataArgument from './withMetadataArgument.js'
import { PhoneNumber } from './PhoneNumber.js'
import { parsePhoneNumberWithError as _parsePhoneNumberWithError } from '../../../core/es6/index.js'

export function parsePhoneNumberWithError() {
	return withMetadataArgument(_parsePhoneNumberWithError, arguments, PhoneNumber.prototype)
}
