import { withMetadata } from '../metadata.js'
import { isValidPhoneNumber as _isValidPhoneNumber } from '../../core/index.js'

export function isValidPhoneNumber() {
	return withMetadata(_isValidPhoneNumber, arguments)
}