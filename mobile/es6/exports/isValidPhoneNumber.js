import withMetadataArgument from './withMetadataArgument.js'
import { isValidPhoneNumber as _isValidPhoneNumber } from '../../../core/es6/index.js'

export function isValidPhoneNumber() {
	return withMetadataArgument(_isValidPhoneNumber, arguments)
}