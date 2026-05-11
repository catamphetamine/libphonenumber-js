import withMetadataArgument from './withMetadataArgument.js'
import { PhoneNumber } from './PhoneNumber.js'
import { default as _parsePhoneNumber } from '../../../core/es6/index.js'

export function parsePhoneNumber() {
	return withMetadataArgument(_parsePhoneNumber, arguments, PhoneNumber.prototype)
}